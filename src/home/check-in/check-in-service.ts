// --- START OF FILE check-in-service.ts ---

import { db } from '../../firebase';
import { 
  doc, runTransaction, serverTimestamp
} from 'firebase/firestore';

// --- ĐỊNH NGHĨA CẤU TRÚC PHẦN THƯỞNG ---
// Bây giờ mỗi ngày sẽ chứa một mảng 'items' thay vì một vật phẩm đơn lẻ
// Đã thêm Energy (Năng lượng) vào tất cả các ngày từ 1 đến 7
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
            { type: 'cardCapacity', amount: 50, name: "Dung Lượng Thẻ" },
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
            { type: 'cardCapacity', amount: 50, name: "Dung Lượng Thẻ" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
    { 
        day: 7, 
        items: [
            { type: 'pickaxes', amount: 10, name: "Cúp" },
            { type: 'energy', amount: 5, name: "Năng lượng" }
        ] 
    },
];

// Múi giờ Việt Nam: UTC + 7
const VN_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000;

/**
 * Xử lý logic điểm danh hàng ngày.
 * Tính toán streak dựa trên múi giờ Việt Nam và cộng dồn phần thưởng (bao gồm cả items phụ).
 * 
 * @param userId ID của người dùng
 * @returns Object chứa thông tin phần thưởng đã nhận và streak mới
 */
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

        // --- HÀM CỘNG DỒN PHẦN THƯỞNG ---
        // Lặp qua danh sách items của ngày hôm đó (bao gồm cả Gold/Item chính và Energy)
        rewardConfig.items.forEach(reward => {
            if (reward.type === 'coins') {
                // Lấy giá trị hiện tại từ DB hoặc giá trị đã set trong updates (nếu có logic cộng dồn khác)
                const currentCoins = updates.coins !== undefined ? updates.coins : (data.coins || 0);
                updates.coins = currentCoins + reward.amount;

            } else if (reward.type === 'ancientBooks') {
                const currentBooks = updates.ancientBooks !== undefined ? updates.ancientBooks : (data.ancientBooks || 0);
                updates.ancientBooks = currentBooks + reward.amount;

            } else if (reward.type === 'equipmentPieces') {
                // Lưu ý: Key là 'equipment.pieces' vì đây là field lồng nhau trong Firestore object
                const currentPieces = (data.equipment?.pieces || 0);
                updates['equipment.pieces'] = currentPieces + reward.amount;

            } else if (reward.type === 'cardCapacity') {
                const currentCapacity = updates.cardCapacity !== undefined ? updates.cardCapacity : (data.cardCapacity || 100);
                updates.cardCapacity = currentCapacity + reward.amount;

            } else if (reward.type === 'pickaxes') {
                const currentPickaxes = updates.pickaxes !== undefined ? updates.pickaxes : (data.pickaxes || 0);
                updates.pickaxes = currentPickaxes + reward.amount;
                
            } else if (reward.type === 'energy') {
                // Logic Energy: Cho phép cộng vượt quá giới hạn (overflow) khi nhận thưởng
                const currentEnergy = updates.energy !== undefined ? updates.energy : (data.energy || 0);
                updates.energy = currentEnergy + reward.amount;
            }
        });

        // Thực hiện update vào Firestore
        t.update(userDocRef, updates);
        
        // Trả về kết quả để UI hiển thị
        return { 
            dailyReward: rewardConfig, // Trả về toàn bộ config (chứa mảng items)
            newStreak 
        };
    });
};
