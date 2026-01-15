// --- START OF FILE profileService.ts ---

import { db } from '../firebase'; // Đảm bảo đường dẫn này trỏ đúng đến file cấu hình firebase của bạn
import { 
    doc, 
    runTransaction, 
    updateDoc, 
    Timestamp, 
    collection, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore';

/**
 * Cập nhật tên hiển thị và danh hiệu của người chơi.
 * @param userId - ID của người dùng.
 * @param updates - Object chứa tên (name) và danh hiệu (title) mới.
 */
export const updateProfileInfo = async (userId: string, updates: { name: string; title: string }): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  
  const userDocRef = doc(db, 'users', userId);
  
  // Cập nhật username và title trong Firestore
  await updateDoc(userDocRef, { 
      username: updates.name, 
      title: updates.title 
  });
};

/**
 * Cập nhật Avatar của người chơi.
 * @param userId - ID của người dùng.
 * @param avatarUrl - Đường dẫn URL mới của avatar.
 */
export const updateAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  
  const userDocRef = doc(db, 'users', userId);
  
  await updateDoc(userDocRef, { 
      avatarUrl 
  });
};

/**
 * Xử lý việc nâng cấp VIP cho người dùng.
 * Sử dụng Transaction để đảm bảo trừ Gems và cộng ngày VIP diễn ra đồng thời.
 * 
 * @param userId - ID của người dùng.
 * @param cost - Số Gems cần trừ.
 * @param days - Số ngày VIP được cộng thêm.
 */
export const performVipUpgrade = async (userId: string, cost: number, days: number): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    // 1. Đọc dữ liệu người dùng hiện tại
    const userDoc = await transaction.get(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("User document does not exist!");
    }

    const data = userDoc.data();
    const currentGems = data.gems || 0;
    
    // 2. Kiểm tra đủ tiền không
    if (currentGems < cost) {
      throw new Error("Not enough gems to upgrade.");
    }

    // 3. Tính toán ngày hết hạn VIP mới
    const now = new Date();
    let newExpirationDate = new Date();
    
    // Nếu đang là VIP và chưa hết hạn, cộng nối tiếp vào ngày hết hạn cũ
    if (data.accountType === 'VIP' && data.vipExpiresAt) {
        const currentExpire = data.vipExpiresAt.toDate();
        if (currentExpire > now) {
            newExpirationDate = new Date(currentExpire.getTime() + (days * 24 * 60 * 60 * 1000));
        } else {
            // Đã hết hạn, tính từ thời điểm hiện tại
            newExpirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        }
    } else {
        // Chưa từng là VIP hoặc là tài khoản thường, tính từ hiện tại
        newExpirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    }

    const newGems = currentGems - cost;
    
    // 4. Ghi dữ liệu mới vào DB
    transaction.update(userDocRef, {
      gems: newGems,
      accountType: 'VIP',
      vipExpiresAt: Timestamp.fromDate(newExpirationDate)
    });
  });
};

/**
 * Xử lý logic nhập mã giới thiệu (Referral Code).
 * - Kiểm tra mã hợp lệ.
 * - Đảm bảo người dùng chỉ được nhập 1 lần duy nhất.
 * - Cộng 10.000 Gold cho người nhập (Referee).
 * - Tăng biến đếm referralCount cho người giới thiệu (Referrer).
 * 
 * @param userId - ID của người đang nhập mã.
 * @param code - Mã giới thiệu được nhập.
 */
export const submitReferralCode = async (userId: string, code: string): Promise<void> => {
    if (!userId) throw new Error("User ID is required.");
    
    // BƯỚC 1: Tìm người sở hữu mã giới thiệu này (Referrer)
    // Lưu ý: Bước này truy vấn bên ngoài transaction vì ta chưa biết ID của người giới thiệu
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("referralCode", "==", code));
    const querySnapshot = await getDocs(q);

    // Kiểm tra mã có tồn tại không
    if (querySnapshot.empty) {
        throw new Error("Mã giới thiệu không tồn tại hoặc không hợp lệ.");
    }

    const referrerDocSnapshot = querySnapshot.docs[0];
    const referrerId = referrerDocSnapshot.id;

    // Kiểm tra không cho phép tự nhập mã của chính mình
    if (referrerId === userId) {
        throw new Error("Bạn không thể nhập mã giới thiệu của chính mình.");
    }

    const userDocRef = doc(db, 'users', userId);
    const referrerDocRef = doc(db, 'users', referrerId);

    // BƯỚC 2: Thực hiện Transaction để đảm bảo tính nhất quán và chống gian lận
    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        const referrerDoc = await transaction.get(referrerDocRef);

        if (!userDoc.exists()) throw new Error("Lỗi dữ liệu người dùng.");
        if (!referrerDoc.exists()) throw new Error("Lỗi dữ liệu người giới thiệu.");

        const userData = userDoc.data();

        // --- CHECK QUAN TRỌNG: Đã từng nhập mã chưa? ---
        if (userData.referredBy) {
            throw new Error("Bạn đã nhập mã giới thiệu rồi, không thể nhập lại.");
        }

        // --- XỬ LÝ CHO NGƯỜI NHẬP (Referee) ---
        // Liên kết với người giới thiệu và cộng 10,000 Gold quà tân thủ
        const currentGold = userData.gold || 0;
        transaction.update(userDocRef, {
            referredBy: referrerId,          // Lưu ID người giới thiệu để đánh dấu đã dùng
            referredAt: Timestamp.now(),     // Lưu thời gian nhập
            gold: currentGold + 10000        // Cộng quà 10k Gold
        });

        // --- XỬ LÝ CHO NGƯỜI GIỚI THIỆU (Referrer) ---
        // Tăng số lượng người đã mời
        const currentCount = referrerDoc.data().referralCount || 0;
        transaction.update(referrerDocRef, {
            referralCount: currentCount + 1
        });
    });
};

// --- END OF FILE profileService.ts ---
