// --- START OF FILE check-in-service.ts ---

import { db } from '../../firebase';
import { 
  doc, runTransaction, serverTimestamp
} from 'firebase/firestore';

// --- CẤU HÌNH PHẦN THƯỞNG CƠ BẢN (DAYS 1-7) ---
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

// Múi giờ Việt Nam: UTC + 7 (tính bằng milliseconds)
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
 * Tính toán streak dựa trên múi giờ Việt Nam.
 * Áp dụng Multiplier từ Mastery VÀ Ads cho rewards (trừ Energy).
 * 
 * @param userId ID của người dùng
 * @param adMultiplier Hệ số nhân từ quảng cáo (1 = nhận thường, 2 = xem quảng cáo)
 * @returns Object chứa thông tin phần thưởng đã nhận và streak mới
 */
export const processDailyCheckIn = async (userId: string, adMultiplier: number = 1) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        // 1. Lấy dữ liệu User
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found.");
        
        const data = userDoc.data();
        const lastCheckIn = data.lastCheckIn?.toDate();
        const loginStreak = data.loginStreak || 0;
        const currentMastery = data.masteryCards || 0; // Lấy mastery hiện tại để tính multiplier
        
        // 2. Xử lý thời gian (UTC -> VN Time)
        const now = new Date(); 
        const vnNow = new Date(now.getTime() + VN_TIMEZONE_OFFSET);

        if (lastCheckIn) {
            // Thời gian check-in cuối cùng theo VN
            const vnLastCheckIn = new Date(lastCheckIn.getTime() + VN_TIMEZONE_OFFSET);

            // Kiểm tra xem đã điểm danh trong cùng ngày VN chưa
            if (vnLastCheckIn.getUTCFullYear() === vnNow.getUTCFullYear() &&
                vnLastCheckIn.getUTCMonth() === vnNow.getUTCMonth() &&
                vnLastCheckIn.getUTCDate() === vnNow.getUTCDate()) {
                throw new Error("Bạn đã điểm danh hôm nay rồi (Giờ VN).");
            }
        }
        
        // 3. Tính toán Streak (Chuỗi đăng nhập)
        let newStreak = 1; // Mặc định reset streak về 1
        if (lastCheckIn) {
            const vnLastCheckIn = new Date(lastCheckIn.getTime() + VN_TIMEZONE_OFFSET);
            
            // Tính ngày "hôm qua" theo giờ VN
            const vnYesterday = new Date(vnNow.getTime() - 24 * 60 * 60 * 1000);

            // Kiểm tra xem lần cuối có phải là "hôm qua" không
            if (vnLastCheckIn.getUTCFullYear() === vnYesterday.getUTCFullYear() &&
                vnLastCheckIn.getUTCMonth() === vnYesterday.getUTCMonth() &&
                vnLastCheckIn.getUTCDate() === vnYesterday.getUTCDate()) {
                // Nếu đúng là hôm qua -> Tăng streak
                newStreak = loginStreak + 1;
            }
        }

        // 4. Xác định phần thưởng
        const dailyRewardDay = (newStreak - 1) % 7 + 1;
        const rewardConfig = CHECK_IN_REWARDS.find(r => r.day === dailyRewardDay);
        
        if (!rewardConfig) throw new Error("Lỗi cấu hình phần thưởng hàng ngày.");
        
        // Chuẩn bị object update cho Firestore
        const updates: { [key: string]: any } = {
            loginStreak: newStreak,
            lastCheckIn: serverTimestamp(),
        };

        // 5. Tính toán số lượng thực nhận (Applying Multipliers)
        const masteryMultiplier = getCheckInMultiplier(currentMastery);

        // Mảng chứa các item thực tế sau khi đã nhân (dùng để trả về cho UI hiển thị)
        const finalRewardItems: any[] = [];

        rewardConfig.items.forEach(reward => {
            let finalAmount = 0;

            // QUY TẮC: Energy KHÔNG nhân, các loại khác nhân với cả Mastery và Ads
            if (reward.type === 'energy') {
                finalAmount = reward.amount; 
            } else {
                // Công thức: Số lượng gốc * Hệ số Mastery * Hệ số Quảng cáo
                finalAmount = reward.amount * masteryMultiplier * adMultiplier;
            }

            // Đẩy vào mảng kết quả trả về
            finalRewardItems.push({
                ...reward,
                amount: finalAmount,        
                originalAmount: reward.amount, 
                masteryMultiplier: reward.type === 'energy' ? 1 : masteryMultiplier,
                adMultiplier: reward.type === 'energy' ? 1 : adMultiplier
            });

            // 6. Cộng dồn vào DB (Cập nhật field tương ứng)
            if (reward.type === 'coins') {
                const currentCoins = updates.coins !== undefined ? updates.coins : (data.coins || 0);
                updates.coins = currentCoins + finalAmount;

            } else if (reward.type === 'ancientBooks') {
                const currentBooks = updates.ancientBooks !== undefined ? updates.ancientBooks : (data.ancientBooks || 0);
                updates.ancientBooks = currentBooks + finalAmount;

            } else if (reward.type === 'equipmentPieces') {
                const currentPieces = (data.equipment?.pieces || 0);
                updates['equipment.pieces'] = currentPieces + finalAmount;

            } else if (reward.type === 'pickaxes') {
                const currentPickaxes = updates.pickaxes !== undefined ? updates.pickaxes : (data.pickaxes || 0);
                updates.pickaxes = currentPickaxes + finalAmount;
                
            } else if (reward.type === 'energy') {
                const currentEnergy = updates.energy !== undefined ? updates.energy : (data.energy || 0);
                updates.energy = currentEnergy + finalAmount;

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

        // 7. Thực hiện update vào Firestore
        t.update(userDocRef, updates);
        
        // 8. Trả về kết quả
        return { 
            dailyReward: {
                day: dailyRewardDay,
                items: finalRewardItems // Items với số lượng ĐÃ NHÂN
            }, 
            newStreak,
            masteryMultiplier
        };
    });
};
