// --- START OF FILE mailService.ts ---

import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  writeBatch,
  runTransaction,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { UserGameData, OwnedItem } from './gameDataService.ts'; // Assuming types are exported from here

// --- TYPE DEFINITIONS ---

export interface MailReward {
  type: 'currency' | 'item';
  // For 'currency': 'coins', 'gems', 'cardCapacity', etc.
  // For 'item': a unique identifier for the item blueprint.
  id: string; 
  quantity: number;
  name: string; // Display name
  icon: string; // Icon identifier for the UI
  // For 'item' type, this would contain the full item data
  itemData?: OwnedItem;
}

export interface Mail {
  id: string; // Firestore document ID
  sender: string;
  subject: string;
  body: string;
  rewards: MailReward[];
  isRead: boolean;
  isClaimed: boolean;
  timestamp: Timestamp;
}

// --- SERVICE FUNCTIONS ---

/**
 * Sends the welcome mail to a newly registered user.
 * This should be called once upon user account creation.
 * @param userId - The ID of the new user.
 */
export const sendWelcomeMail = async (userId: string): Promise<void> => {
  const mailCollectionRef = collection(db, 'users', userId, 'mail');
  
  const welcomeMail = {
    sender: 'Hệ Thống',
    subject: 'Chào mừng tân thủ!',
    body: 'Chào mừng bạn đã đến với thế giới của chúng tôi! Đây là một món quà nhỏ để giúp bạn bắt đầu cuộc hành trình.',
    rewards: [
      { type: 'currency', id: 'coins', quantity: 5000, name: 'Vàng', icon: 'coin' },
      { type: 'currency', id: 'cardCapacity', quantity: 100, name: 'Sức chứa Thẻ', icon: 'chest' }
    ],
    isRead: false,
    isClaimed: false,
    timestamp: serverTimestamp(),
  };

  await addDoc(mailCollectionRef, welcomeMail);
};

/**
 * Fetches all mails for a specific user.
 * @param userId - The user's ID.
 * @returns A promise that resolves to an array of Mail objects.
 */
export const fetchUserMails = async (userId: string): Promise<Mail[]> => {
  const mailCollectionRef = collection(db, 'users', userId, 'mail');
  const q = query(mailCollectionRef, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Mail));
};

/**
 * Marks a specific mail as read.
 * @param userId - The user's ID.
 * @param mailId - The mail's document ID.
 */
export const markMailAsRead = async (userId: string, mailId: string): Promise<void> => {
    const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
    const batch = writeBatch(db);
    batch.update(mailDocRef, { isRead: true });
    await batch.commit();
};


/**
 * Claims the rewards from a single mail. This is a transactional operation.
 * @param userId - The ID of the user claiming the rewards.
 * @param mail - The Mail object to be claimed.
 * @returns A promise that resolves with an object containing the new totals for currency.
 */
export const claimMailRewards = async (userId: string, mail: Mail): Promise<{ [key: string]: number }> => {
  const userDocRef = doc(db, 'users', userId);
  const mailDocRef = doc(db, 'users', userId, 'mail', mail.id);

  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    const mailDoc = await transaction.get(mailDocRef);

    if (!userDoc.exists()) throw new Error("User document not found.");
    if (!mailDoc.exists() || mailDoc.data().isClaimed) {
      throw new Error("Mail already claimed or does not exist.");
    }

    const userData = userDoc.data() as UserGameData;
    const userUpdates: { [key: string]: any } = {};
    const newTotals: { [key: string]: number } = {};

    mail.rewards.forEach(reward => {
      if (reward.type === 'currency') {
        const currentValue = (userData[reward.id as keyof UserGameData] as number) || 0;
        const newValue = currentValue + reward.quantity;
        userUpdates[reward.id] = newValue;
        newTotals[reward.id] = newValue;
      }
      // Future logic for 'item' type can be added here
      // else if (reward.type === 'item' && reward.itemData) { ... }
    });

    transaction.update(userDocRef, userUpdates);
    transaction.update(mailDocRef, { isClaimed: true, isRead: true });

    return newTotals;
  });
};

/**
 * Claims rewards from all available mails and deletes all read/claimed mails.
 * @param userId - The user's ID.
 * @returns A promise resolving with total rewards and a list of updated mail IDs.
 */
export const claimAllAndClearRead = async (userId: string, mails: Mail[]): Promise<{ updates: { [key: string]: number }, claimedIds: string[] }> => {
    const userDocRef = doc(db, 'users', userId);

    return runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document not found.");

        const userData = userDoc.data() as UserGameData;
        const userUpdates: { [key: string]: number } = {};
        const newTotals: { [key: string]: number } = {};
        const claimedMailIds: string[] = [];
        
        const claimableMails = mails.filter(m => m.rewards.length > 0 && !m.isClaimed);

        claimableMails.forEach(mail => {
            mail.rewards.forEach(reward => {
                if (reward.type === 'currency') {
                    userUpdates[reward.id] = (userUpdates[reward.id] || 0) + reward.quantity;
                }
            });
            claimedMailIds.push(mail.id);
        });

        // Calculate new totals for context update
        for (const key in userUpdates) {
            const currentValue = (userData[key as keyof UserGameData] as number) || 0;
            newTotals[key] = currentValue + userUpdates[key];
        }

        // Apply increments to user data
        transaction.update(userDocRef, newTotals);

        // Batch update/delete mails
        const batch = writeBatch(db);
        const mailsToDelete = mails.filter(m => m.isRead && (!m.rewards || m.rewards.length === 0 || m.isClaimed));

        mailsToDelete.forEach(mail => {
            batch.delete(doc(db, 'users', userId, 'mail', mail.id));
        });
        
        claimableMails.forEach(mail => {
            batch.update(doc(db, 'users', userId, 'mail', mail.id), { isClaimed: true, isRead: true });
        });

        await batch.commit();

        return { updates: newTotals, claimedIds };
    });
};


/**
 * Deletes a single mail.
 * @param userId - The user's ID.
 * @param mailId - The mail's document ID.
 */
export const deleteMail = async (userId: string, mailId: string): Promise<void> => {
  const mailDocRef = doc(db, 'users', userId, 'mail', mailId);
  const batch = writeBatch(db);
  batch.delete(mailDocRef);
  await batch.commit();
};
// --- END OF FILE mailService.ts ---
