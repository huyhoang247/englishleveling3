// --- START OF FILE check-in-service.ts ---

import { db } from '../../firebase';
import { 
  doc, runTransaction, serverTimestamp
} from 'firebase/firestore';

// --- ĐỊNH NGHĨA CẤU TRÚC PHẦN THƯỞNG GỐC (BASE) ---
// Đây là số lượng cơ bản, sẽ được nhân lên theo hệ số Mastery (trừ Energy)
export const CHECK_IN_REWARDS = [
    { 
        day: 1, 
        items: [
            { type: 'coins', amount: 1000, name: "Vàng" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 2, 
        items: [
            { type: 'ancientBooks', amount: 10, name: "Sách Cổ" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 3, 
        items: [
            { type: 'equipmentPieces', amount: 10, name: "Mảnh Trang Bị" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 4, 
        items: [
            { type: 'stone_low', amount: 10, name: "Đá Sơ Cấp" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 5, 
        items: [
            { type: 'pickaxes', amount: 5, name: "Cúp" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 6, 
        items: [
            { type: 'stone_medium', amount: 10, name: "Đá Trung Cấp" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 7, 
        items: [
            { type: 'pickaxes', amount: 10, name: "Cúp" },
            { type: 'stone_high', amount: 10, name: "Đá Cao Cấp" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
];

// Múi giờ Việt Nam: UTC + 7
const VN_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000;

/**
 * Hàm tính hệ số nhân dựa trên số lượng Mastery Cards
 * @param mastery Số lượng Mastery Cards hiện có
 * @returns Hệ số nhân (1, 2, 3, 4, 5, 6, 7)
 */
export const getCheckInMultiplier = (mastery: number): number => {
    if (mastery >= 8000) return 7;
    if (mastery >= 4000) return 6;
    if (mastery >= 2000) return 5;
    if (mastery >= 1000) return 4;
    if (mastery >= 500) return 3;
    if (mastery >= 200) return 2;
    return 1; // Mặc định x1 nếu dưới 200
};

/**
 * Xử lý logic điểm danh hàng ngày.
 * Tính toán streak dựa trên múi giờ Việt Nam và cộng dồn phần thưởng.
 * Áp dụng Multiplier cho rewards (trừ Energy).
 * 
 * @param userId ID của người dùng
 * @param isDouble (Mới) Nếu true nghĩa là người dùng đã xem quảng cáo để x2 quà
 * @returns Object chứa thông tin phần thưởng đã nhận (đã nhân) và streak mới
 */
export const processDailyCheckIn = async (userId: string, isDouble: boolean = false) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found.");
        
        const data = userDoc.data();
        const lastCheckIn = data.lastCheckIn?.toDate();
        const loginStreak = data.loginStreak || 0;
        const currentMastery = data.masteryCards || 0; // Lấy mastery hiện tại để tính multiplier
        
        // Thời gian hiện tại thực tế (UTC timestamp)
        const now = new Date(); 
        
        // --- LOGIC CHUYỂN ĐỔI SANG GIỜ VN ĐỂ SO SÁNH ---
        // Ta cộng thêm offset vào timestamp để giả lập giờ VN cho các phép so sánh ngày/tháng/năm
        
        // Thời gian hiện tại theo VN
        const vnNow = new Date(now.getTime() + VN_TIMEZONE_OFFSET);

        if (lastCheckIn) {
            // Thời gian check-in cuối cùng theo VN
            const vnLastCheckIn = new Date(lastCheckIn.getTime() + VN_TIMEZONE_OFFSET);

            // 1. Kiểm tra xem đã điểm danh trong cùng ngày VN chưa
            if (vnLastCheckIn.getUTCFullYear() === vnNow.getUTCFullYear() &&
                vnLastCheckIn.getUTCMonth() === vnNow.getUTCMonth() &&
                vnLastCheckIn.getUTCDate() === vnNow.getUTCDate()) {
                throw new Error("Bạn đã điểm danh hôm nay rồi (Giờ VN).");
            }
        }
        
        // --- LOGIC TÍNH STREAK (THEO GIỜ VN) ---
        let newStreak = 1; // Mặc định reset streak
        if (lastCheckIn) {
            const vnLastCheckIn = new Date(lastCheckIn.getTime() + VN_TIMEZONE_OFFSET);
            
            // Tính ngày hôm qua theo giờ VN
            const vnYesterday = new Date(vnNow.getTime() - 24 * 60 * 60 * 1000);

            // Kiểm tra xem lần cuối có phải là "hôm qua" theo giờ VN không
            if (vnLastCheckIn.getUTCFullYear() === vnYesterday.getUTCFullYear() &&
                vnLastCheckIn.getUTCMonth() === vnYesterday.getUTCMonth() &&
                vnLastCheckIn.getUTCDate() === vnYesterday.getUTCDate()) {
                // Streak tiếp tục tăng, không reset sau 7 ngày
                newStreak = loginStreak + 1;
            }
        }

        // Xác định ngày nhận thưởng trong chu kỳ 7 ngày
        const dailyRewardDay = (newStreak - 1) % 7 + 1;
        const rewardConfig = CHECK_IN_REWARDS.find(r => r.day === dailyRewardDay);
        
        if (!rewardConfig) throw new Error("Lỗi cấu hình phần thưởng hàng ngày.");
        
        // Chuẩn bị object update cho Firestore
        const updates: { [key: string]: any } = {
            loginStreak: newStreak,
            lastCheckIn: serverTimestamp(),
        };

        // --- TÍNH TOÁN MULTIPLIER ---
        const masteryMultiplier = getCheckInMultiplier(currentMastery);
        
        // Nếu người chơi xem quảng cáo, nhân thêm 2, ngược lại là 1
        const adMultiplier = isDouble ? 2 : 1;

        // Mảng chứa các item thực tế sau khi đã nhân (dùng để trả về cho UI hiển thị)
        const finalRewardItems: any[] = [];

        // --- HÀM CỘNG DỒN PHẦN THƯỞNG ---
        // Lặp qua danh sách items của ngày hôm đó
        rewardConfig.items.forEach(reward => {
            
            let finalAmount = 0;

            // Logic quan trọng: 
            // - Energy: KHÔNG nhân theo Mastery, nhưng CÓ nhân theo Ads (x2).
            // - Các loại khác: Nhân theo Mastery VÀ nhân theo Ads.
            if (reward.type === 'energy') {
                finalAmount = reward.amount * adMultiplier;
            } else {
                finalAmount = reward.amount * masteryMultiplier * adMultiplier;
            }

            // Đẩy vào mảng kết quả trả về cho UI
            finalRewardItems.push({
                ...reward,
                amount: finalAmount,        // Số lượng thực nhận
                originalAmount: reward.amount, // Số lượng gốc
                masteryMultiplier: reward.type === 'energy' ? 1 : masteryMultiplier,
                adMultiplier: adMultiplier
            });

            // Cập nhật vào DB
            if (reward.type === 'coins') {
                const currentCoins = updates.coins !== undefined ? updates.coins : (data.coins || 0);
                updates.coins = currentCoins + finalAmount;

            } else if (reward.type === 'ancientBooks') {
                const currentBooks = updates.ancientBooks !== undefined ? updates.ancientBooks : (data.ancientBooks || 0);
                updates.ancientBooks = currentBooks + finalAmount;

            } else if (reward.type === 'equipmentPieces') {
                const currentPieces = (data.equipment?.pieces || 0);
                updates['equipment.pieces'] = currentPieces + finalAmount;

            } else if (reward.type === 'cardCapacity') {
                const currentCapacity = updates.cardCapacity !== undefined ? updates.cardCapacity : (data.cardCapacity || 100);
                updates.cardCapacity = currentCapacity + finalAmount;

            } else if (reward.type === 'pickaxes') {
                const currentPickaxes = updates.pickaxes !== undefined ? updates.pickaxes : (data.pickaxes || 0);
                updates.pickaxes = currentPickaxes + finalAmount;
                
            } else if (reward.type === 'energy') {
                // --- [SỬA LỖI] LOGIC MỚI CHO ENERGY ---
                // Nếu DB chưa có field energy, mặc định lấy 50 (giống logic GameContext) thay vì 0
                // Điều này ngăn việc user đang 50 (mặc định) nhận quà xong tụt xuống 5/10
                const dbEnergy = typeof data.energy === 'number' ? data.energy : 50;
                
                // Lấy giá trị hiện tại (có thể đã bị update bởi logic khác trong transaction, dù hiếm)
                const currentEnergy = updates.energy !== undefined ? updates.energy : dbEnergy;
                
                // Cộng năng lượng mới
                updates.energy = currentEnergy + finalAmount;

                // Đồng bộ logic: Nếu năng lượng >= 50 (max mặc định), reset timestamp hồi phục
                // để UI biết là đang đầy bình
                if (updates.energy >= 50) {
                    updates.lastEnergyUpdate = serverTimestamp();
                }

            // --- XỬ LÝ CÁC LOẠI ĐÁ CƯỜNG HÓA ---
            } else if (reward.type === 'stone_low') {
                const currentLow = data.equipment?.stones?.low || 0;
                updates['equipment.stones.low'] = currentLow + finalAmount;

            } else if (reward.type === 'stone_medium') {
                const currentMedium = data.equipment?.stones?.medium || 0;
                updates['equipment.stones.medium'] = currentMedium + finalAmount;

            } else if (reward.type === 'stone_high') {
                const currentHigh = data.equipment?.stones?.high || 0;
                updates['equipment.stones.high'] = currentHigh + finalAmount;
            }
        });

        // Thực hiện update vào Firestore
        t.update(userDocRef, updates);
        
        // Trả về kết quả để UI hiển thị
        return { 
            dailyReward: {
                day: dailyRewardDay,
                items: finalRewardItems // Trả về mảng items với số lượng ĐÃ NHÂN TOÀN BỘ
            }, 
            newStreak,
            masteryMultiplier // Trả về multiplier để debug nếu cần
        };
    });
};
