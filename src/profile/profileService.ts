// --- START OF FILE profileService.ts ---

import { db } from '../firebase'; // Assuming firebase is initialized in './firebase'
import { doc, runTransaction, updateDoc, Timestamp } from 'firebase/firestore';

// This service now only contains functions that MODIFY user data.
// All data reading/fetching is handled by GameContext for a single source of truth.

/**
 * Updates the user's profile name and title.
 * @param userId - The ID of the user.
 * @param updates - An object containing the new name and/or title.
 */
export const updateProfileInfo = async (userId: string, updates: { name: string; title: string }): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  // Using 'username' for name to be consistent with potential existing data structures
  await updateDoc(userDocRef, { username: updates.name, title: updates.title });
};

/**
 * Updates the user's avatar URL.
 * @param userId - The ID of the user.
 * @param avatarUrl - The new URL for the avatar.
 */
export const updateAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { avatarUrl });
};

/**
 * Handles upgrading user to VIP/Premium with specific duration.
 * It runs as a transaction to ensure atomicity.
 * If user is already VIP, it extends the duration.
 * 
 * @param userId - The ID of the user.
 * @param cost - The number of gems required.
 * @param days - The number of days to add to VIP status.
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

    // Calculate expiration date
    const now = new Date();
    let newExpirationDate = new Date();
    
    // Check if user is currently VIP and the VIP status hasn't expired yet
    // We check accountType AND if vipExpiresAt is in the future
    if (data.accountType === 'VIP' && data.vipExpiresAt) {
        const currentExpire = data.vipExpiresAt.toDate();
        if (currentExpire > now) {
            // User is valid VIP, extend the current expiration
            newExpirationDate = new Date(currentExpire.getTime() + (days * 24 * 60 * 60 * 1000));
        } else {
            // VIP expired, start fresh from now
            newExpirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        }
    } else {
        // User is Normal or first time VIP, start from now
        newExpirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    }

    const newGems = currentGems - cost;
    
    transaction.update(userDocRef, {
      gems: newGems,
      accountType: 'VIP', // Change account type to VIP
      vipExpiresAt: Timestamp.fromDate(newExpirationDate) // Store timestamp
    });
  });
};

// --- END OF FILE profileService.ts ---
