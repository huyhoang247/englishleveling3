// --- START OF FILE mailService.ts ---

import { db } from './firebase';
import { 
  doc, getDoc, setDoc, runTransaction, 
  collection, getDocs, writeBatch,
  query, orderBy, onSnapshot, Timestamp, serverTimestamp, deleteDoc, where
} from 'firebase/firestore';
import { fetchAllUsers } from './gameDataService.ts'; // Tái sử dụng hàm lấy user từ file cũ
import { UserGameData } from './gameDataService.ts'; // Tái sử dụng interface

// Định nghĩa cấu trúc của một thư
export interface MailItem {
  id: string; // Document ID
  sender: string;
  subject: string;
  body: string;
  items: MailAttachment[];
  isRead: boolean;
  isClaimed: boolean;
  timestamp: Timestamp;
}

// Định nghĩa cấu trúc vật phẩm đính kèm
export interface MailAttachment {
    type: 'currency' | 'item'; // 'currency' cho vàng, gem, sách... 'item' cho trang bị
    id: 'coins' | 'gems' | 'ancientBooks' | 'pickaxes' | 'masteryCards' | 'equipmentPieces' | number; // 'id' của currency hoặc itemId
    quantity: number;
    name: string; // Tên hiển thị
    icon: string; // Tên icon để hiển thị
}

// === USER-FACING FUNCTIONS ===

/**
 * Lắng nghe Hộp thư của người dùng theo thời gian thực.
 * @param userId - ID của người dùng.
 * @param callback - Hàm sẽ được gọi mỗi khi có cập nhật thư.
 * @returns Hàm để hủy lắng nghe.
 */
export const listenToUserMails = (userId: string, callback: (mails: MailItem[]) => void) => {
  if (!userId) return () => {};
  
  const mailCollectionRef = collection(db, 'users', userId, 'mail');
  const q = query(mailCollectionRef, orderBy('timestamp', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const mails: MailItem[] = [];
    querySnapshot.forEach((doc) => {
      mails.push({ id: doc.id, ...doc.data() } as MailItem);
    });
    callback(mails);
  });

  return unsubscribe;
};

/**
 * Đánh dấu một thư là đã đọc.
 * @param userId - ID của người dùng.
 * @param mailId - ID của thư.
 */
export const markMailAsRead = async (userId: string, mailId: string): Promise<void> => {
    if (!userId || !mailId) return;
    const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
    await setDoc(mailDocRef, { isRead: true }, { merge: true });
};


/**
 * Người dùng nhận vật phẩm từ một thư.
 * @param userId - ID của người dùng.
 * @param mailId - ID của thư.
 */
export const claimMailItems = async (userId: string, mailId: string): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  const mailDocRef = doc(db, 'users', userId, 'mail', mailId);

  await runTransaction(db, async (t) => {
    const [userDoc, mailDoc] = await Promise.all([t.get(userDocRef), t.get(mailDocRef)]);
    
    if (!userDoc.exists()) throw new Error("User not found.");
    if (!mailDoc.exists()) throw new Error("Mail not found.");

    const userData = userDoc.data() as UserGameData;
    const mailData = mailDoc.data() as Omit<MailItem, 'id'>;

    if (mailData.isClaimed) throw new Error("Items already claimed.");

    const updates: { [key: string]: any } = {};
    mailData.items.forEach(item => {
        const field = item.id as keyof UserGameData;
        updates[field] = (userData[field] || 0) + item.quantity;
    });

    // Cập nhật tài nguyên cho người dùng
    t.update(userDocRef, updates);
    // Đánh dấu thư là đã nhận và đã đọc
    t.update(mailDocRef, { isClaimed: true, isRead: true });
  });
};


/**
 * Xóa một thư.
 * @param userId - ID của người dùng.
 * @param mailId - ID của thư.
 */
export const deleteMail = async (userId: string, mailId: string): Promise<void> => {
    if (!userId || !mailId) return;
    const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
    await deleteDoc(mailDocRef);
};


/**
 * Nhận tất cả các thư chưa nhận.
 * @param userId - ID của người dùng.
 */
export const claimAllUnclaimedMail = async (userId: string): Promise<void> => {
    const mailCollectionRef = collection(db, 'users', userId, 'mail');
    const q = query(mailCollectionRef, where('isClaimed', '==', false));
    const querySnapshot = await getDocs(q);

    const unclaimedMails: MailItem[] = [];
    querySnapshot.forEach(doc => {
        if (doc.data().items && doc.data().items.length > 0) {
            unclaimedMails.push({ id: doc.id, ...doc.data() } as MailItem);
        }
    });

    if (unclaimedMails.length === 0) return;

    const userDocRef = doc(db, 'users', userId);
    await runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User not found.");
        const userData = userDoc.data();
        
        const totalUpdates: { [key: string]: number } = {};

        unclaimedMails.forEach(mail => {
            mail.items.forEach(item => {
                const field = item.id as string;
                totalUpdates[field] = (totalUpdates[field] || 0) + item.quantity;
            });
            // Chuẩn bị cập nhật trạng thái cho thư
            const mailDocRef = doc(db, 'users', userId, 'mail', mail.id);
            t.update(mailDocRef, { isClaimed: true, isRead: true });
        });
        
        // Gộp các cập nhật tài nguyên vào một object duy nhất
        const finalUserUpdate: { [key: string]: number } = {};
        for (const key in totalUpdates) {
            finalUserUpdate[key] = (userData[key] || 0) + totalUpdates[key];
        }

        t.update(userDocRef, finalUserUpdate);
    });
};

/**
 * Xóa tất cả thư đã đọc (và không có vật phẩm chưa nhận).
 * @param userId - ID của người dùng.
 */
export const deleteAllReadAndClaimedMail = async (userId: string): Promise<void> => {
    const mailCollectionRef = collection(db, 'users', userId, 'mail');
    const querySnapshot = await getDocs(mailCollectionRef);

    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.forEach(doc => {
        const mail = doc.data();
        const hasUnclaimedItems = mail.items?.length > 0 && !mail.isClaimed;
        if (mail.isRead && !hasUnclaimedItems) {
            batch.delete(doc.ref);
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
    }
};


// === ADMIN-FACING FUNCTIONS ===

/**
 * Gửi thư từ hệ thống đến tất cả người dùng.
 * @param sender - Tên người gửi (vd: 'Hệ Thống', 'Admin').
 * @param subject - Tiêu đề thư.
 * @param body - Nội dung thư.
 * @param items - Mảng các vật phẩm đính kèm.
 * @returns {Promise<number>} Số lượng người dùng đã gửi thành công.
 */
export const sendSystemMailToAllUsers = async (
    sender: string, 
    subject: string, 
    body: string, 
    items: MailAttachment[]
): Promise<number> => {
    const allUsers = await fetchAllUsers();
    if (allUsers.length === 0) return 0;

    const newMailPayload = {
        sender,
        subject,
        body,
        items,
        isRead: false,
        isClaimed: false,
        timestamp: serverTimestamp() // Sử dụng serverTimestamp cho nhất quán
    };
    
    // Firestore batch có giới hạn 500 operations.
    // Chúng ta sẽ chia thành nhiều batch nếu cần.
    const BATCH_SIZE = 499;
    let usersSent = 0;

    for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const userChunk = allUsers.slice(i, i + BATCH_SIZE);

        userChunk.forEach(user => {
            const mailDocRef = doc(collection(db, 'users', user.uid, 'mail'));
            batch.set(mailDocRef, newMailPayload);
        });

        await batch.commit();
        usersSent += userChunk.length;
    }

    return usersSent;
};

// --- END OF FILE mailService.ts ---
