import { db } from '../../firebase';
import { 
  doc, runTransaction, serverTimestamp, increment
} from 'firebase/firestore';

export const CHECK_IN_REWARDS = [
    { day: 1, type: 'coins', amount: 1000, name: "Vàng" },
    { day: 2, type: 'ancientBooks', amount: 10, name: "Sách Cổ" },
    { day: 3, type: 'equipmentPieces', amount: 10, name: "Mảnh Trang Bị" },
    { day: 4, type: 'cardCapacity', amount: 50, name: "Dung Lượng Thẻ" },
    { day: 5, type: 'pickaxes', amount: 5, name: "Cúp" },
    { day: 6, type: 'cardCapacity', amount: 50, name: "Dung Lượng Thẻ" },
    { day: 7, type: 'pickaxes', amount: 10, name: "Cúp" },
];

// --- THÊM MỚI: Định nghĩa phần thưởng theo mốc chuỗi ---
export const STREAK_MILESTONE_REWARDS = [
    { day: 7, type: 'coins', amount: 5000, name: "Thưởng 7 Ngày" },
    { day: 14, type: 'coins', amount: 10000, name: "Thưởng 14 Ngày" },
    // Có thể thêm các mốc khác ở đây
];

export const processDailyCheckIn = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found.");
        
        const data = userDoc.data();
        const lastCheckIn = data.lastCheckIn?.toDate();
        const loginStreak = data.loginStreak || 0; // Chuỗi trong chu kỳ 7 ngày
        const totalLoginStreak = data.totalLoginStreak || 0; // Tổng chuỗi liên tiếp
        const now = new Date(); // Thời gian client, chỉ dùng để so sánh. serverTimestamp() sẽ được dùng để ghi.

        // Kiểm tra xem đã điểm danh trong cùng ngày UTC chưa
        if (lastCheckIn && 
            lastCheckIn.getUTCFullYear() === now.getUTCFullYear() &&
            lastCheckIn.getUTCMonth() === now.getUTCMonth() &&
            lastCheckIn.getUTCDate() === now.getUTCDate()) {
            throw new Error("Bạn đã điểm danh hôm nay rồi.");
        }
        
        let newCycleStreak = 1; // Chuỗi trong chu kỳ 7 ngày, mặc định reset
        let newTotalStreak = 1; // Tổng chuỗi, mặc định reset

        if (lastCheckIn) {
            const yesterday = new Date(now);
            yesterday.setUTCDate(now.getUTCDate() - 1);
            
            // Nếu lần cuối là ngày hôm qua -> chuỗi tiếp tục
            if (lastCheckIn.getUTCFullYear() === yesterday.getUTCFullYear() &&
                lastCheckIn.getUTCMonth() === yesterday.getUTCMonth() &&
                lastCheckIn.getUTCDate() === yesterday.getUTCDate()) {
                newCycleStreak = (loginStreak % 7) + 1; // Quay vòng 1-7
                newTotalStreak = totalLoginStreak + 1; // Tăng tổng chuỗi
            }
        }

        // Lấy phần thưởng hàng ngày
        const dailyReward = CHECK_IN_REWARDS.find(r => r.day === newCycleStreak);
        if (!dailyReward) throw new Error("Lỗi cấu hình phần thưởng hàng ngày.");
        
        const updates: { [key: string]: any } = {
            loginStreak: newCycleStreak,
            totalLoginStreak: newTotalStreak,
            lastCheckIn: serverTimestamp(),
        };

        // Hàm trợ giúp để thêm phần thưởng vào object updates một cách an toàn
        // Sử dụng increment() của Firestore để tránh race condition
        const addReward = (reward: { type: string; amount: number }) => {
            if (reward.type === 'coins') {
                updates.coins = increment(reward.amount);
            } else if (reward.type === 'ancientBooks') {
                updates.ancientBooks = increment(reward.amount);
            } else if (reward.type === 'equipmentPieces') {
                updates['equipment.pieces'] = increment(reward.amount);
            } else if (reward.type === 'cardCapacity') {
                updates.cardCapacity = increment(reward.amount);
            } else if (reward.type === 'pickaxes') {
                updates.pickaxes = increment(reward.amount);
            }
        };

        // Thêm phần thưởng hàng ngày
        addReward(dailyReward);
        
        let milestoneRewardClaimed = null;

        // --- THÊM MỚI: Kiểm tra và thêm phần thưởng mốc chuỗi ---
        const milestoneReward = STREAK_MILESTONE_REWARDS.find(r => r.day === newTotalStreak);
        if (milestoneReward) {
            addReward(milestoneReward);
            milestoneRewardClaimed = milestoneReward;
        }

        t.update(userDocRef, updates);
        
        // Trả về thông tin để client cập nhật UI
        return { 
            claimedReward: dailyReward, 
            newStreak: newCycleStreak,
            newTotalStreak: newTotalStreak,
            milestoneRewardClaimed 
        };
    });
};
