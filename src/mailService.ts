// --- START OF FILE src/services/mailService.ts ---

import { db } from './firebase'; // Điều chỉnh đường dẫn nếu cần
import {
  doc,
  collection,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  updateDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { UserGameData } from './gameDataService.ts'; // Điều chỉnh đường dẫn nếu cần

// Định nghĩa cấu trúc của một phần thưởng trong thư
export interface MailItemReward {
  type: 'currency' | 'special'; // 'currency' cho vàng, gem. 'special' cho các giá trị khác như sức chứa thẻ
  id: keyof UserGameData;      // Key phải khớp với một trường trong UserGameData
  name: string;
  quantity: number;
  icon: string;
}

// Định nghĩa cấu trúc của một thư
export interface Mail {
  id: string; // Firestore document ID
  sender: string;
  subject: string;
  body: string;
  type: 'gift' | 'item' | 'notification';
  items: MailItemReward[];
  isRead: boolean;
  isClaimed: boolean;
  timestamp: Timestamp;
}

/**
 * Gửi mail chào mừng cho người chơi mới.
 * Được gọi khi một tài khoản mới được tạo trong gameDataService.
 * @param userId - ID của người dùng.
 */
export const createWelcomeMail = async (userId: string): Promise<void> => {
  const mailCollectionRef = collection(db, 'users', userId, 'mail');
  const welcomeMail = {
    sender: 'Hệ Thống',
    subject: 'Chào mừng tân thủ!',
    body: 'Chào mừng bạn đã đến với thế giới của chúng tôi! Đây là một món quà nhỏ để giúp bạn bắt đầu cuộc hành trình.',
    type: 'gift' as const,
    items: [
      { type: 'currency', id: 'coins', name: 'Vàng', quantity: 5000, icon: 'coin' },
      { type: 'special', id: 'cardCapacity', name: 'Sức chứa thẻ', quantity: 100, icon: 'chest' }
    ] as MailItemReward[],
    isRead: false,
    isClaimed: false,
    timestamp: serverTimestamp(),
  };
  try {
    await addDoc(mailCollectionRef, welcomeMail);
    console.log(`Welcome mail sent to user ${userId}`);
  } catch (error) {
    console.error(`Failed to send welcome mail to user ${userId}:`, error);
  }
};

/**
 * Lắng nghe tất cả mail của người dùng trong thời gian thực.
 * @param userId - ID của người dùng.
 * @param callback - Hàm được gọi mỗi khi có sự thay đổi trong hộp thư.
 * @returns Hàm để hủy lắng nghe (unsubscribe).
 */
export const listenToUserMails = (userId: string, callback: (mails: Mail[]) => void) => {
  const mailCollectionRef = collection(db, 'users', userId, 'mail');
  const q = query(mailCollectionRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const mails: Mail[] = [];
    querySnapshot.forEach((doc) => {
      mails.push({ id: doc.id, ...doc.data() } as Mail);
    });
    callback(mails);
  }, (error) => {
      console.error("Error listening to user mails:", error);
  });
};

/**
 * Đánh dấu một thư (không có vật phẩm) là đã đọc.
 * @param userId - ID người dùng.
 * @param mailId - ID của thư.
 */
export const markMailAsRead = async (userId: string, mailId: string): Promise<void> => {
    const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
    await updateDoc(mailDocRef, { isRead: true });
};

/**
 * Nhận vật phẩm từ một thư. Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
 * @param userId - ID người dùng.
 * @param mailId - ID của thư cần nhận.
 * @param mailItems - Mảng vật phẩm trong thư.
 */
export const claimMail = async (userId: string, mailId: string, mailItems: MailItemReward[]): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  const mailDocRef = doc(db, 'users', userId, 'mail', mailId);

  await runTransaction(db, async (t) => {
    const userDoc = await t.get(userDocRef);
    const mailDoc = await t.get(mailDocRef);

    if (!userDoc.exists()) throw new Error("Người dùng không tồn tại.");
    if (!mailDoc.exists()) throw new Error("Thư không tồn tại.");

    const userData = userDoc.data() as UserGameData;
    const mailData = mailDoc.data();

    if (mailData.isClaimed) throw new Error("Thư đã được nhận rồi.");
    if (!mailItems || mailItems.length === 0) {
        // Nếu không có item, chỉ đánh dấu đã đọc
        t.update(mailDocRef, { isRead: true });
        return;
    }

    const updates: { [key: string]: any } = {};
    mailItems.forEach(item => {
      const currentValue = userData[item.id as keyof UserGameData] as number || 0;
      updates[item.id] = currentValue + item.quantity;
    });

    t.update(userDocRef, updates);
    t.update(mailDocRef, { isClaimed: true, isRead: true });
  });
};

/**
 * Xóa một thư.
 * @param userId - ID người dùng.
 * @param mailId - ID của thư cần xóa.
 */
export const deleteMail = async (userId: string, mailId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'mail', mailId));
};

/**
 * Nhận tất cả các thư có thể nhận.
 * @param userId - ID người dùng.
 * @param claimableMails - Mảng các thư có thể nhận.
 */
export const claimAllMails = async (userId: string, claimableMails: Mail[]): Promise<void> => {
  if (claimableMails.length === 0) return;
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (t) => {
    const userDoc = await t.get(userDocRef);
    if (!userDoc.exists()) throw new Error("Người dùng không tồn tại.");
    const userData = userDoc.data() as UserGameData;

    const aggregatedRewards: { [key: string]: number } = {};
    
    // Sử dụng batch bên trong transaction để cập nhật nhiều thư
    const batch = writeBatch(db);

    claimableMails.forEach(mail => {
      // Đánh dấu thư sẽ được cập nhật trong batch
      const mailDocRef = doc(db, 'users', userId, 'mail', mail.id);
      batch.update(mailDocRef, { isClaimed: true, isRead: true });

      // Tổng hợp các phần thưởng
      mail.items.forEach(item => {
        const key = item.id as keyof UserGameData;
        aggregatedRewards[key] = (aggregatedRewards[key] || 0) + item.quantity;
      });
    });

    // Tạo payload cập nhật cuối cùng cho user document
    const userUpdates: { [key: string]: any } = {};
    for (const key in aggregatedRewards) {
      const existingValue = userData[key as keyof UserGameData] as number || 0;
      userUpdates[key] = existingValue + aggregatedRewards[key];
    }
    
    // Cập nhật user document trong transaction
    t.update(userDocRef, userUpdates);
    
    // Commit batch sau khi transaction thành công
    // Transaction sẽ đảm bảo user document được lock trước, sau đó batch mới commit
    await batch.commit();
  });
};


/**
 * Xóa tất cả các thư đã đọc (và đã nhận nếu có quà).
 * @param userId - ID người dùng.
 * @param deletableMailIds - Mảng ID của các thư có thể xóa.
 */
export const deleteAllReadMails = async (userId: string, deletableMailIds: string[]): Promise<void> => {
  if (deletableMailIds.length === 0) return;
  const batch = writeBatch(db);
  deletableMailIds.forEach(mailId => {
    const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
    batch.delete(mailDocRef);
  });
  await batch.commit();
};

// --- END OF FILE src/services/mailService.ts ---
