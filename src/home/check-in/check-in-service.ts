import { db } from '../../firebase';
import { 
  doc, runTransaction, serverTimestamp
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
        
        let newStreak = 1; // Mặc định reset streak
        if (lastCheckIn) {
            const yesterday = new Date(now);
            yesterday.setUTCDate(now.getUTCDate() - 1);
            // Kiểm tra xem lần cuối là ngày hôm qua (theo UTC) để tính chuỗi liên tiếp
            if (lastCheckIn.getUTCFullYear() === yesterday.getUTCFullYear() &&
                lastCheckIn.getUTCMonth() === yesterday.getUTCMonth() &&
                lastCheckIn.getUTCDate() === yesterday.getUTCDate()) {
                newStreak = (loginStreak % 7) + 1; // Chuỗi 7 ngày, quay vòng
            }
        }

        const reward = CHECK_IN_REWARDS.find(r => r.day === newStreak);
        if (!reward) throw new Error("Lỗi cấu hình phần thưởng.");
        
        const updates: { [key: string]: any } = {
            loginStreak: newStreak,
            lastCheckIn: serverTimestamp(),
        };

        // Thêm phần thưởng vào object updates
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

        t.update(userDocRef, updates);
        
        // Trả về phần thưởng đã nhận và chuỗi mới để client cập nhật UI
        return { claimedReward: reward, newStreak };
    });
};
