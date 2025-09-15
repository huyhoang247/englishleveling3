// --- START OF FILE mail-service.ts ---

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { UserGameData, OwnedItem } from '../../gameDataService.ts'; // Giả sử các type này được export

// --- INTERFACES ---

export interface MailAttachment {
  type: 'currency' | 'item';
  id: string; // 'coins', 'gems', or an item's unique ID from your item database
  name: string;
  quantity: number;
  icon?: string; // For display purposes on the client
  // Nếu là item, có thể chứa toàn bộ data của item đó
  itemData?: Omit<OwnedItem, 'id'>; 
}

export interface Mail {
  id: string; // Firestore document ID
  sender: string;
  subject: string;
  body: string;
  attachments: MailAttachment[];
  isRead: boolean;
  isClaimed: boolean;
  timestamp: Timestamp;
}

// --- SERVICE FUNCTIONS ---

/**
 * Lắng nghe các thư mới của người dùng theo thời gian thực.
 * @param userId - ID của người dùng.
 * @param callback - Hàm được gọi mỗi khi có cập nhật thư.
 * @returns Hàm để hủy đăng ký lắng nghe.
 */
export const listenForUserMails = (userId: string, callback: (mails: Mail[]) => void) => {
  const mailCollectionRef = collection(db, 'users', userId, 'mail');
  const q = query(mailCollectionRef, orderBy('timestamp', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const mails: Mail[] = [];
    querySnapshot.forEach((doc) => {
      mails.push({ id: doc.id, ...doc.data() } as Mail);
    });
    callback(mails);
  }, (error) => {
    console.error("Error listening for user mails:", error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Gửi thư hệ thống đến TẤT CẢ người dùng. (Chức năng Admin)
 * @param mailContent - Nội dung thư cần gửi.
 */
export const sendSystemMailToAll = async (mailContent: Omit<Mail, 'id' | 'isRead' | 'isClaimed' | 'timestamp'>) => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const totalUsers = usersSnapshot.size;
  if (totalUsers === 0) return;

  const batches: ReturnType<typeof writeBatch>[] = [];
  let currentBatch = writeBatch(db);
  let operationCount = 0;

  usersSnapshot.forEach((userDoc) => {
    const mailDocRef = doc(collection(db, 'users', userDoc.id, 'mail'));
    currentBatch.set(mailDocRef, {
      ...mailContent,
      isRead: false,
      isClaimed: false,
      timestamp: serverTimestamp(),
    });
    operationCount++;

    // Firestore batch has a 500 operation limit. Create a new batch when limit is reached.
    if (operationCount >= 499) {
      batches.push(currentBatch);
      currentBatch = writeBatch(db);
      operationCount = 0;
    }
  });

  // Add the last batch if it has operations
  if (operationCount > 0) {
    batches.push(currentBatch);
  }

  // Commit all batches sequentially
  for (const batch of batches) {
    await batch.commit();
  }
};

/**
 * Đánh dấu một thư là đã đọc.
 * @param userId - ID người dùng.
 * @param mailId - ID của thư.
 */
export const markMailAsRead = async (userId: string, mailId: string) => {
  const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
  await runTransaction(db, async (transaction) => {
    const mailDoc = await transaction.get(mailDocRef);
    if (!mailDoc.exists()) return;
    transaction.update(mailDocRef, { isRead: true });
  });
};


/**
 * Người dùng nhận vật phẩm từ một thư.
 * @param userId - ID người dùng.
 * @param mail - Toàn bộ object thư cần nhận.
 * @returns Promise giải quyết khi giao dịch thành công.
 */
export const claimMailAttachments = async (userId: string, mail: Mail): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  const mailDocRef = doc(db, 'users', userId, 'mail', mail.id);

  await runTransaction(db, async (transaction) => {
    const [userDoc, mailDoc] = await Promise.all([
      transaction.get(userDocRef),
      transaction.get(mailDocRef)
    ]);

    if (!userDoc.exists()) throw new Error("User not found.");
    if (!mailDoc.exists()) throw new Error("Mail not found.");
    if (mailDoc.data().isClaimed) throw new Error("Attachments already claimed.");

    const userData = userDoc.data() as UserGameData;
    const updates: { [key: string]: any } = {};
    const newOwnedItems = [...(userData.equipment?.owned || [])];

    mail.attachments.forEach(att => {
      if (att.type === 'currency') {
        const currentAmount = userData[att.id as keyof UserGameData] as number || 0;
        updates[att.id] = currentAmount + att.quantity;
      } else if (att.type === 'item' && att.itemData) {
        // Tạo một ID duy nhất cho vật phẩm mới này
        const newItemId = doc(collection(db, 'users')).id; 
        newOwnedItems.push({ id: newItemId, ...att.itemData });
      }
    });

    if (newOwnedItems.length > (userData.equipment?.owned || []).length) {
      updates['equipment.owned'] = newOwnedItems;
    }

    // Update user document
    transaction.update(userDocRef, updates);

    // Update mail document
    transaction.update(mailDocRef, { isClaimed: true, isRead: true });
  });
};


/**
 * Xóa một hoặc nhiều thư.
 * @param userId - ID người dùng.
 * @param mailIds - Mảng các ID thư cần xóa.
 */
export const deleteMails = async (userId: string, mailIds: string[]): Promise<void> => {
  if (mailIds.length === 0) return;

  const batch = writeBatch(db);
  mailIds.forEach(mailId => {
    const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
    batch.delete(mailDocRef);
  });
  await batch.commit();
};

// --- END OF FILE mail-service.ts ---
