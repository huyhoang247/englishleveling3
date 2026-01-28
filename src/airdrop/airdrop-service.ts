import { db } from '../firebase'; // Đảm bảo đường dẫn đúng tới file firebase config của bạn
import { 
  doc, 
  runTransaction, 
  Timestamp, 
  getDoc, 
  setDoc,
  updateDoc
} from 'firebase/firestore';

// --- CONSTANTS & CONFIG ---

// Các mốc Halving (Copy từ logic frontend để đồng bộ)
const HALVING_MILESTONES = [
    { threshold: 0, rate: 1.6, label: "Phase 1" },
    { threshold: 50000, rate: 0.8, label: "Phase 2" },
    { threshold: 100000, rate: 0.4, label: "Phase 3" },
    { threshold: 200000, rate: 0.2, label: "Phase 4" },
    { threshold: 500000, rate: 0.1, label: "Phase 5" },
];

// Thời gian đào tối đa (24 giờ tính bằng mili giây)
const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; 

// --- TYPES ---

export interface MiningSession {
    isActive: boolean;
    startTime: Timestamp | null;
    endTime: Timestamp | null;
    lastSyncTime: Timestamp | null; // Thời điểm cuối cùng cộng tiền vào balance
}

export interface AirdropData {
    engoBalance: number;
    referralCount: number;
    session: MiningSession;
    // Cache các giá trị để tính toán nhanh
    cachedMastery: number; 
}

// --- HELPER FUNCTIONS ---

/**
 * Lấy tổng số user toàn hệ thống để xác định Phase.
 * Trong thực tế nên lưu số này trong 1 document riêng (VD: appData/stats) để tránh query toàn bộ user.
 */
export const getGlobalUserCount = async (): Promise<number> => {
    try {
        const statsRef = doc(db, 'appData', 'stats');
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
            return snap.data().totalUsers || 1;
        }
        return 1; // Mặc định
    } catch (e) {
        console.warn("Could not fetch global stats, defaulting to 1 user.", e);
        return 1;
    }
};

/**
 * Tính toán tốc độ đào hiện tại (Engo/giờ).
 * Logic này phải khớp hoàn toàn với Frontend.
 */
export const calculateMiningRate = (
    totalUsers: number,
    masteryPoints: number,
    referralCount: number
): number => {
    // 1. Base Rate (Halving)
    let baseRate = 1.6;
    for (let i = HALVING_MILESTONES.length - 1; i >= 0; i--) {
        if (totalUsers >= HALVING_MILESTONES[i].threshold) {
            baseRate = HALVING_MILESTONES[i].rate;
            break;
        }
    }

    // 2. Mastery Boost (20% mỗi 100 điểm -> 0.2% mỗi điểm)
    // Logic cũ: (userMastery / 100) * 0.2 -> Mastery 100 = 0.2 boost
    const masteryBoost = (masteryPoints / 100) * 0.2;

    // 3. Referral Boost (0.05 Engo/h mỗi ref)
    const referralBoost = referralCount * 0.05;

    return baseRate + masteryBoost + referralBoost;
};

// --- MAIN SERVICES ---

/**
 * Hàm quan trọng nhất: Đồng bộ trạng thái đào.
 * Được gọi khi:
 * 1. User vào màn hình Airdrop (Initial Load).
 * 2. User thoát app hoặc đóng màn hình (Cleanup).
 * 3. Gọi định kỳ mỗi 1-5 phút (Background Sync).
 */
export const syncAirdropProgress = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    
    // Lấy tổng user để tính base rate
    const totalUsers = await getGlobalUserCount();

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const data = userDoc.data();
        
        // Khởi tạo data nếu chưa có
        const airdropData: AirdropData = data.airdrop || {
            engoBalance: 0,
            referralCount: data.referrals?.length || 0, // Giả sử có mảng referrals
            session: {
                isActive: false,
                startTime: null,
                endTime: null,
                lastSyncTime: null
            },
            cachedMastery: data.masteryCards || 0
        };

        const session = airdropData.session;

        // Nếu không có session đang chạy, chỉ cập nhật thông tin phụ và trả về
        if (!session.isActive || !session.endTime || !session.lastSyncTime) {
            // Cập nhật lại Mastery mới nhất nếu user vừa mua card
            if (data.masteryCards !== airdropData.cachedMastery) {
                t.update(userRef, { 'airdrop.cachedMastery': data.masteryCards || 0 });
            }
            return { ...airdropData, currentRate: 0 };
        }

        const now = new Date();
        const endTimeDate = session.endTime.toDate();
        const lastSyncDate = session.lastSyncTime.toDate();
        
        // Xác định thời điểm "cắt" tính toán
        // Nếu hiện tại đã quá giờ kết thúc -> chỉ tính đến giờ kết thúc
        const calculationCutoff = now > endTimeDate ? endTimeDate : now;

        // Tính số mili-giây trôi qua kể từ lần sync cuối
        const elapsedMs = calculationCutoff.getTime() - lastSyncDate.getTime();

        if (elapsedMs <= 0) {
            // Chưa có thời gian trôi qua hoặc lỗi thời gian
            return airdropData;
        }

        // Tính Rate hiện tại
        const currentRatePerHour = calculateMiningRate(
            totalUsers,
            data.masteryCards || 0, // Dùng mastery thực tế từ user doc
            airdropData.referralCount
        );

        // Tính Engo kiếm được: (Rate / 3600000) * elapsedMs
        const ratePerMs = currentRatePerHour / 3600000;
        const earnedEngo = ratePerMs * elapsedMs;

        // UPDATE DATA
        const updates: any = {
            'airdrop.engoBalance': (airdropData.engoBalance || 0) + earnedEngo,
            'airdrop.session.lastSyncTime': Timestamp.fromDate(calculationCutoff),
            'airdrop.cachedMastery': data.masteryCards || 0 // Sync mastery luôn
        };

        // Nếu Session đã hết hạn (Now > EndTime) -> Kết thúc Session
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
 * Bắt đầu phiên đào mới (24h)
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
        // Nếu đang đào rồi thì không cho start lại (trừ khi hack)
        if (currentSession?.isActive) {
             const now = new Date();
             const end = currentSession.endTime?.toDate();
             if (end && now < end) {
                 throw new Error("Mining session already active.");
             }
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + MAX_SESSION_DURATION_MS);

        const newSession: MiningSession = {
            isActive: true,
            startTime: Timestamp.fromDate(now),
            endTime: Timestamp.fromDate(endTime),
            lastSyncTime: Timestamp.fromDate(now) // Start sync point
        };

        // Khởi tạo object airdrop nếu chưa có
        const updatePayload: any = {
            'airdrop.session': newSession,
            'airdrop.cachedMastery': mastery
        };

        // Nếu user chưa từng có balance, set = 0
        if (data.airdrop?.engoBalance === undefined) {
            updatePayload['airdrop.engoBalance'] = 0;
            updatePayload['airdrop.referralCount'] = 0;
        }

        t.update(userRef, updatePayload);

        return { success: true, endTime: endTime.getTime() };
    });
};

/**
 * Lấy dữ liệu hiển thị cho frontend (Balance, Rate, TimeLeft)
 * Hàm này chỉ READ (không tốn write), dùng để hiển thị UI ban đầu
 */
export const fetchAirdropDisplayInfo = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const [userDoc, totalUsers] = await Promise.all([
        getDoc(userRef),
        getGlobalUserCount()
    ]);

    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    const airdrop = data.airdrop || { engoBalance: 0, referralCount: 0, session: {} };
    const session = airdrop.session || {};

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
