// Filename: check-in-service.ts

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

// Múi giờ Việt Nam: UTC + 7
const VN_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000;

export const processDailyCheckIn = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found.");
        
        const data = userDoc.data();
        const lastCheckIn = data.lastCheckIn?.toDate();
        const loginStreak = data.loginStreak || 0;
        
        // Thời gian hiện tại thực tế (UTC timestamp)
        const now = new Date(); 
        
        // --- LOGIC CHUYỂN ĐỔI SANG GIỜ VN ĐỂ SO SÁNH ---
        // Ta cộng thêm offset vào timestamp, sau đó dùng các hàm getUTC... 
        // để lấy ra ngày/tháng/năm tương ứng với giờ VN.
        
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
            // (Lấy thời gian hiện tại theo VN trừ đi 24h)
            const vnYesterday = new Date(vnNow.getTime() - 24 * 60 * 60 * 1000);

            // Kiểm tra xem lần cuối có phải là "hôm qua" theo giờ VN không
            // So sánh từng thành phần ngày/tháng/năm để chính xác tuyệt đối
            if (vnLastCheckIn.getUTCFullYear() === vnYesterday.getUTCFullYear() &&
                vnLastCheckIn.getUTCMonth() === vnYesterday.getUTCMonth() &&
                vnLastCheckIn.getUTCDate() === vnYesterday.getUTCDate()) {
                // Streak tiếp tục tăng, không reset sau 7 ngày
                newStreak = loginStreak + 1;
            }
        }

        // Xác định ngày nhận thưởng trong chu kỳ 7 ngày
        const dailyRewardDay = (newStreak - 1) % 7 + 1;
        const dailyReward = CHECK_IN_REWARDS.find(r => r.day === dailyRewardDay);
        if (!dailyReward) throw new Error("Lỗi cấu hình phần thưởng hàng ngày.");
        
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

        t.update(userDocRef, updates);
        
        // Trả về kết quả
        return { 
            dailyReward: { ...dailyReward, day: dailyRewardDay }, // Đảm bảo trả về đúng day trong chu kỳ
            newStreak 
        };
    });
};
