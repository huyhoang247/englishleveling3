
import { db } from '../../firebase';
import { 
  doc, runTransaction, serverTimestamp
} from 'firebase/firestore';

// PHẦN THƯỞNG CHU KỲ 7 NGÀY
export const CHECK_IN_REWARDS = [
    { day: 1, type: 'coins', amount: 1000, name: "Vàng" },
    { day: 2, type: 'ancientBooks', amount: 10, name: "Sách Cổ" },
    { day: 3, type: 'equipmentPieces', amount: 10, name: "Mảnh Trang Bị" },
    { day: 4, type: 'cardCapacity', amount: 50, name: "Dung Lượng Thẻ" },
    { day: 5, type: 'pickaxes', amount: 5, name: "Cúp" },
    { day: 6, type: 'cardCapacity', amount: 50, name: "Dung Lượng Thẻ" },
    { day: 7, type: 'pickaxes', amount: 10, name: "Cúp" },
];

// --- THÊM MỚI: ĐỊNH NGHĨA PHẦN THƯỞNG MỐC STREAK ---
export const STREAK_MILESTONE_REWARDS = [
    { streakGoal: 7, type: 'coins', amount: 5000, name: "Thưởng 7 Ngày" },
    { streakGoal: 14, type: 'coins', amount: 10000, name: "Thưởng 14 Ngày" },
    // Thêm các mốc khác ở đây nếu muốn, ví dụ: { streakGoal: 21, ... }
];


export const processDailyCheckIn = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found.");
        
        const data = userDoc.data();
        const lastCheckIn = data.lastCheckIn?.toDate();
        const loginStreak = data.loginStreak || 0;
        const now = new Date(); // Thời gian client, chỉ dùng để so sánh. serverTimestamp() sẽ được dùng để ghi.

        // Kiểm tra xem đã điểm danh trong cùng ngày UTC chưa
        if (lastCheckIn && 
            lastCheckIn.getUTCFullYear() === now.getUTCFullYear() &&
            lastCheckIn.getUTCMonth() === now.getUTCMonth() &&
            lastCheckIn.getUTCDate() === now.getUTCDate()) {
            throw new Error("Bạn đã điểm danh hôm nay rồi.");
        }
        
        // --- SỬA ĐỔI: LOGIC TÍNH STREAK MỚI ---
        let newStreak = 1; // Mặc định reset streak
        if (lastCheckIn) {
            const yesterday = new Date(now);
            yesterday.setUTCDate(now.getUTCDate() - 1);
            // Kiểm tra xem lần cuối là ngày hôm qua (theo UTC) để tính chuỗi liên tiếp
            if (lastCheckIn.getUTCFullYear() === yesterday.getUTCFullYear() &&
                lastCheckIn.getUTCMonth() === yesterday.getUTCMonth() &&
                lastCheckIn.getUTCDate() === yesterday.getUTCDate()) {
                // Streak tiếp tục tăng, không reset sau 7 ngày
                newStreak = loginStreak + 1;
            }
        }

        // Xác định ngày nhận thưởng trong chu kỳ 7 ngày
        const dailyRewardDay = (newStreak - 1) % 7 + 1;
        const dailyReward = CHECK_IN_REWARDS.find(r => r.day === dailyRewardDay);
        if (!dailyReward) throw new Error("Lỗi cấu hình phần thưởng hàng ngày.");

        // --- THÊM MỚI: KIỂM TRA PHẦN THƯỞNG MỐC STREAK ---
        const streakReward = STREAK_MILESTONE_REWARDS.find(r => r.streakGoal === newStreak);
        
        const updates: { [key: string]: any } = {
            loginStreak: newStreak,
            lastCheckIn: serverTimestamp(),
        };

        // Hàm trợ giúp để cộng dồn phần thưởng
        const addRewardToUpdates = (reward: { type: string, amount: number }) => {
            if (reward.type === 'coins') {
                updates.coins = (data.coins || 0) + reward.amount;
            } else if (reward.type === 'ancientBooks') {
                updates.ancientBooks = (data.ancientBooks || 0) + reward.amount;
            } else if (reward.type === 'equipmentPieces') {
                updates['equipment.pieces'] = (data.equipment?.pieces || 0) + reward.amount;
            } else if (reward.type === 'cardCapacity') {
                updates.cardCapacity = (data.cardCapacity || 100) + reward.amount;
            } else if (reward.type === 'pickaxes') {
                updates.pickaxes = (data.pickaxes || 0) + reward.amount;
            }
        };

        // Thêm phần thưởng hàng ngày
        addRewardToUpdates(dailyReward);

        // Thêm phần thưởng mốc streak nếu có
        if (streakReward) {
            addRewardToUpdates(streakReward);
        }

        t.update(userDocRef, updates);
        
        // --- SỬA ĐỔI: Trả về cả hai loại phần thưởng ---
        return { 
            dailyReward: { ...dailyReward, day: dailyRewardDay }, // Đảm bảo trả về đúng day trong chu kỳ
            streakReward: streakReward || null, // Trả về null nếu không có
            newStreak 
        };
    });
};
