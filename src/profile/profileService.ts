// --- START OF FILE profileService.ts ---

import { db } from '../firebase'; // Assuming firebase is initialized in './firebase'
import { doc, runTransaction, updateDoc } from 'firebase/firestore';

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
 * Handles the logic for upgrading a user's account to Premium.
 * It runs as a transaction to ensure atomicity: it reads the current gem count
 * and updates it only if the user can afford the upgrade.
 * @param userId - The ID of the user.
 * @param cost - The number of gems required for the upgrade.
 */
export const performPremiumUpgrade = async (userId: string, cost: number): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("User document does not exist!");
    }

    const currentGems = userDoc.data().gems || 0;
    if (currentGems < cost) {
      throw new Error("Not enough gems to upgrade.");
    }

    const newGems = currentGems - cost;
    transaction.update(userDocRef, {
      gems: newGems,
      accountType: 'Premium',
    });
    // No need to return the new gem count, GameContext's listener will update the UI.
  });
};

// --- END OF FILE profileService.ts ---
