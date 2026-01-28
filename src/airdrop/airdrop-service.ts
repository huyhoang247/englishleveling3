// --- START OF FILE airdrop-service.ts ---

import { db } from '../firebase'; // Đảm bảo đường dẫn này trỏ đúng file cấu hình firebase của bạn
import { 
  doc, 
  runTransaction, 
  Timestamp, 
  getDoc, 
  setDoc,
  updateDoc
} from 'firebase/firestore';

// --- CONSTANTS & CONFIGURATION ---

// Các mốc Halving (Giảm một nửa tốc độ đào dựa trên số lượng người dùng)
// Logic này cần đồng bộ với Frontend để hiển thị đúng
const HALVING_MILESTONES = [
    { threshold: 0, rate: 1.6, label: "Phase 1" },
    { threshold: 50000, rate: 0.8, label: "Phase 2" },
    { threshold: 100000, rate: 0.4, label: "Phase 3" },
    { threshold: 200000, rate: 0.2, label: "Phase 4" },
    { threshold: 500000, rate: 0.1, label: "Phase 5" },
];

// Thời gian đào tối đa cho một phiên (24 giờ tính bằng mili giây)
const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; 

// --- TYPES & INTERFACES ---

export interface MiningSession {
    isActive: boolean;
    startTime: Timestamp | null;
    endTime: Timestamp | null;
    lastSyncTime: Timestamp | null; // Thời điểm cuối cùng đã cộng tiền vào balance
}

export interface AirdropData {
    engoBalance: number;
    referralCount: number;
    session: MiningSession;
    // Cache các giá trị để tính toán nhanh mà không cần query lại nhiều nơi
    cachedMastery: number; 
}

export interface AirdropDisplayInfo {
    balance: number;
    ratePerHour: number;
    isMining: boolean;
    endTime: number | null;
    timeLeft: number | null;
    totalUsers: number;
    referrals: number;
}

// --- HELPER FUNCTIONS ---

/**
 * Lấy tổng số user toàn hệ thống để xác định Phase Halving.
 * Lưu ý: Để tối ưu chi phí, nên lưu con số này trong document 'appData/stats' 
 * và cập nhật bằng Cloud Function khi có user mới đăng ký.
 */
export const getGlobalUserCount = async (): Promise<number> => {
    try {
        const statsRef = doc(db, 'appData', 'stats');
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
            return snap.data().totalUsers || 1;
        }
        // Mặc định trả về 1 nếu chưa có dữ liệu thống kê
        return 1; 
    } catch (e) {
        console.warn("Could not fetch global stats, defaulting to 1 user.", e);
        return 1;
    }
};

/**
 * Tính toán tốc độ đào hiện tại (Engo/giờ).
 * Công thức: Base Rate + Mastery Boost + Referral Boost
 */
export const calculateMiningRate = (
    totalUsers: number,
    masteryPoints: number,
    referralCount: number
): number => {
    // 1. Xác định Base Rate dựa trên Halving
    let baseRate = 1.6;
    for (let i = HALVING_MILESTONES.length - 1; i >= 0; i--) {
        if (totalUsers >= HALVING_MILESTONES[i].threshold) {
            baseRate = HALVING_MILESTONES[i].rate;
            break;
        }
    }

    // 2. Mastery Boost: 0.2% cho mỗi điểm Mastery (tương đương 20% khi đạt 100 điểm)
    // Công thức cũ: (userMastery / 100) * 0.2 -> Tức là 100 điểm = +0.2 rate
    const masteryBoost = (masteryPoints / 100) * 0.2;

    // 3. Referral Boost: 0.05 Engo/h cho mỗi người được mời
    const referralBoost = referralCount * 0.05;

    return baseRate + masteryBoost + referralBoost;
};

// --- MAIN SERVICES ---

/**
 * Hàm Sync quan trọng nhất: Đồng bộ trạng thái đào và tính tiền.
 * - Được gọi khi user mở app (Initial Load).
 * - Được gọi khi user tắt app (nếu bắt được sự kiện).
 * - Được gọi khi hết giờ đào.
 * 
 * Hàm này tính toán số tiền kiếm được trong khoảng thời gian offline 
 * dựa trên chênh lệch giữa (Thời gian hiện tại) và (Lần sync cuối).
 */
export const syncAirdropProgress = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    
    // Lấy tổng user để tính base rate chính xác
    const totalUsers = await getGlobalUserCount();

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const data = userDoc.data();
        
        // Khởi tạo data airdrop nếu user chưa từng chơi
        const airdropData: AirdropData = data.airdrop || {
            engoBalance: 0,
            referralCount: data.referrals?.length || 0, // Giả sử referrals lưu mảng ID
            session: {
                isActive: false,
                startTime: null,
                endTime: null,
                lastSyncTime: null
            },
            cachedMastery: data.masteryCards || 0
        };

        const session = airdropData.session;

        // Nếu không có session đang chạy, chỉ cập nhật thông tin phụ (mastery) và trả về
        if (!session.isActive || !session.endTime || !session.lastSyncTime) {
            // Cập nhật lại Mastery mới nhất nếu user vừa mua card bên ngoài
            if (data.masteryCards !== airdropData.cachedMastery) {
                t.update(userRef, { 'airdrop.cachedMastery': data.masteryCards || 0 });
            }
            return { ...airdropData, currentRate: 0 };
        }

        const now = new Date();
        const endTimeDate = session.endTime.toDate();
        const lastSyncDate = session.lastSyncTime.toDate();
        
        // Xác định thời điểm "cắt" tính toán (Cutoff Time)
        // Nếu hiện tại đã vượt quá giờ kết thúc -> chỉ tính tiền đến giờ kết thúc
        // Nếu hiện tại chưa đến giờ kết thúc -> tính đến hiện tại
        const calculationCutoff = now > endTimeDate ? endTimeDate : now;

        // Tính số mili-giây trôi qua kể từ lần sync cuối
        const elapsedMs = calculationCutoff.getTime() - lastSyncDate.getTime();

        if (elapsedMs <= 0) {
            // Chưa có thời gian trôi qua hoặc lỗi thời gian -> Không làm gì
            return airdropData;
        }

        // Tính Rate hiện tại
        const currentRatePerHour = calculateMiningRate(
            totalUsers,
            data.masteryCards || 0, // Dùng mastery thực tế từ user doc
            airdropData.referralCount
        );

        // Tính Engo kiếm được: (Rate / 3600000) * elapsedMs
        // 3600000 là số ms trong 1 giờ
        const ratePerMs = currentRatePerHour / 3600000;
        const earnedEngo = ratePerMs * elapsedMs;

        // CHUẨN BỊ DỮ LIỆU UPDATE
        const updates: any = {
            'airdrop.engoBalance': (airdropData.engoBalance || 0) + earnedEngo,
            'airdrop.session.lastSyncTime': Timestamp.fromDate(calculationCutoff),
            'airdrop.cachedMastery': data.masteryCards || 0 // Luôn sync mastery mới nhất
        };

        // Nếu Session đã hết hạn (Now >= EndTime) -> Kết thúc Session
        if (now >= endTimeDate) {
            updates['airdrop.session.isActive'] = false;
            updates['airdrop.session.startTime'] = null;
            updates['airdrop.session.endTime'] = null;
            updates['airdrop.session.lastSyncTime'] = null;
        }

        t.update(userRef, updates);

        return {
            engoBalance: (airdropData.engoBalance || 0) + earnedEngo,
            isMining: now < endTimeDate,
            rate: currentRatePerHour,
            timeLeftMs: now < endTimeDate ? endTimeDate.getTime() - now.getTime() : 0
        };
    });
};

/**
 * Bắt đầu phiên đào mới (24h).
 * Hàm này kiểm tra điều kiện (Mastery > 100) và khởi tạo session mới.
 */
export const startMiningSession = async (userId: string) => {
    const userRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const data = userDoc.data();
        const mastery = data.masteryCards || 0;

        // Validate logic: Phải đủ 100 Mastery mới được đào
        if (mastery < 100) {
            throw new Error("Insufficient Mastery. Need 100+ cards.");
        }

        const currentSession = data.airdrop?.session;
        
        // Nếu đang đào và session chưa hết hạn thì không cho start lại
        if (currentSession?.isActive) {
             const now = new Date();
             const end = currentSession.endTime?.toDate();
             if (end && now < end) {
                 // Session vẫn còn hiệu lực
                 return { success: true, endTime: end.getTime(), message: "Session already active" };
             }
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + MAX_SESSION_DURATION_MS);

        // Tạo object session mới
        const newSession: MiningSession = {
            isActive: true,
            startTime: Timestamp.fromDate(now),
            endTime: Timestamp.fromDate(endTime),
            lastSyncTime: Timestamp.fromDate(now) // Điểm mốc bắt đầu tính tiền
        };

        // Payload update
        const updatePayload: any = {
            'airdrop.session': newSession,
            'airdrop.cachedMastery': mastery
        };

        // Nếu user lần đầu chơi, khởi tạo balance
        if (data.airdrop?.engoBalance === undefined) {
            updatePayload['airdrop.engoBalance'] = 0;
            updatePayload['airdrop.referralCount'] = 0;
        }

        t.update(userRef, updatePayload);

        return { success: true, endTime: endTime.getTime() };
    });
};

/**
 * Lấy dữ liệu hiển thị cho Frontend.
 * Hàm này chỉ READ (không tốn chi phí Write), dùng để hiển thị UI ban đầu.
 */
export const fetchAirdropDisplayInfo = async (userId: string): Promise<AirdropDisplayInfo | null> => {
    const userRef = doc(db, 'users', userId);
    
    // Chạy song song 2 request để tiết kiệm thời gian
    const [userDoc, totalUsers] = await Promise.all([
        getDoc(userRef),
        getGlobalUserCount()
    ]);

    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    const airdrop = data.airdrop || { engoBalance: 0, referralCount: 0, session: {} };
    const session = airdrop.session || {};

    // Tính Rate để hiển thị cho user
    const rate = calculateMiningRate(
        totalUsers, 
        data.masteryCards || 0, 
        airdrop.referralCount || 0
    );

    let isMining = false;
    let endTimeMs = null;
    let timeLeft = null;

    if (session.isActive && session.endTime) {
        const now = Date.now();
        const end = session.endTime.toDate().getTime();
        // Kiểm tra xem session còn hạn hay không
        if (now < end) {
            isMining = true;
            endTimeMs = end;
            timeLeft = end - now;
        }
    }

    return {
        balance: airdrop.engoBalance || 0,
        ratePerHour: rate,
        isMining,
        endTime: endTimeMs,
        timeLeft,
        totalUsers,
        referrals: airdrop.referralCount || 0
    };
};
