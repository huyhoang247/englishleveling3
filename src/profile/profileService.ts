// --- START OF FILE profileService.ts ---

import { db } from '../firebase'; 
import { doc, runTransaction, updateDoc, Timestamp, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

/**
 * Updates the user's profile name and title.
 */
export const updateProfileInfo = async (userId: string, updates: { name: string; title: string }): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { username: updates.name, title: updates.title });
};

/**
 * Updates the user's avatar URL.
 */
export const updateAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { avatarUrl });
};

/**
 * Handles upgrading user to VIP/Premium.
 */
export const performVipUpgrade = async (userId: string, cost: number, days: number): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("User document does not exist!");
    }

    const data = userDoc.data();
    const currentGems = data.gems || 0;
    
    if (currentGems < cost) {
      throw new Error("Not enough gems to upgrade.");
    }

    const now = new Date();
    let newExpirationDate = new Date();
    
    if (data.accountType === 'VIP' && data.vipExpiresAt) {
        const currentExpire = data.vipExpiresAt.toDate();
        if (currentExpire > now) {
            newExpirationDate = new Date(currentExpire.getTime() + (days * 24 * 60 * 60 * 1000));
        } else {
            newExpirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        }
    } else {
        newExpirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    }

    const newGems = currentGems - cost;
    
    transaction.update(userDocRef, {
      gems: newGems,
      accountType: 'VIP',
      vipExpiresAt: Timestamp.fromDate(newExpirationDate)
    });
  });
};

/**
 * Submits a referral code to link the current user to a referrer.
 * @param userId - Current user ID.
 * @param code - The referral code entered.
 */
export const submitReferralCode = async (userId: string, code: string): Promise<void> => {
    if (!userId) throw new Error("User ID is required.");
    const userDocRef = doc(db, 'users', userId);

    // 1. Check if user already has a referrer
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data().referredBy) {
        throw new Error("You have already entered a referral code.");
    }

    // 2. Find the user who owns this code
    // Assuming 'referralCode' is a field in users collection. 
    // If not, you might need to query by UID substring if that's how you generate codes.
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("referralCode", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Invalid referral code.");
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;

    if (referrerId === userId) {
        throw new Error("You cannot refer yourself.");
    }

    // 3. Update current user with referrer ID
    await updateDoc(userDocRef, {
        referredBy: referrerId,
        referredAt: Timestamp.now()
    });

    // Optional: Increment a counter on the referrer immediately (logic usually handled by cloud functions)
    const referrerRef = doc(db, 'users', referrerId);
    await updateDoc(referrerRef, {
        referralCount: (referrerDoc.data().referralCount || 0) + 1
    });
};
