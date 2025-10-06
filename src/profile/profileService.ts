// --- START OF FILE profileService.ts ---

import { db } from '../firebase'; // Assuming firebase is initialized in './firebase'
import { doc, getDoc, runTransaction, updateDoc, Timestamp } from 'firebase/firestore';
import { fetchOrCreateUserGameData, UserGameData } from '../gameDataService.ts';

// Define the shape of the data the Profile component needs.
// This combines fields from the core UserGameData with profile-specific fields.
export interface ProfileData {
  // Profile-specific
  name: string;
  title: string;
  avatarUrl: string;
  accountType: 'Normal' | 'Premium';
  
  // Game data
  gems: number;
  masteryPoints: number; // Mapped from masteryCards
  maxMasteryPoints: number; // A target/goal value for the UI bar
}

const DEFAULT_AVATAR = 'https://robohash.org/Player.png?set=set4&bgset=bg1';
const DEFAULT_MAX_MASTERY = 1000; // Example value for the progress bar max

/**
 * Fetches all necessary data for the user's profile screen.
 * It combines core game data with profile-specific information.
 * If profile-specific fields don't exist, it provides sensible defaults.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the ProfileData object.
 */
export const fetchProfileData = async (userId: string): Promise<ProfileData> => {
  if (!userId) throw new Error("User ID is required for fetching profile data.");

  // We can use fetchOrCreateUserGameData to get the core stats
  const gameData = await fetchOrCreateUserGameData(userId);

  // We also need the full document to get profile-specific fields like name, title, etc.
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  const fullUserData = docSnap.data() || {};

  return {
    name: fullUserData.username || 'CyberWarrior', // Use 'username' field or default
    title: fullUserData.title || `Lv. ${gameData.bossBattleHighestFloor + 1} - Rookie`,
    avatarUrl: fullUserData.avatarUrl || DEFAULT_AVATAR,
    accountType: fullUserData.accountType || 'Normal',
    gems: gameData.gems,
    masteryPoints: gameData.masteryCards,
    maxMasteryPoints: DEFAULT_MAX_MASTERY,
  };
};

/**
 * Updates the user's profile name and title.
 * @param userId - The ID of the user.
 * @param updates - An object containing the new name and/or title.
 */
export const updateProfileInfo = async (userId: string, updates: { name: string; title: string }): Promise<void> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);
  // Using 'username' for name to be consistent
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
 * It runs as a transaction to ensure atomicity.
 * @param userId - The ID of the user.
 * @param cost - The number of gems required for the upgrade.
 * @returns A promise that resolves with the new gem count.
 */
export const performPremiumUpgrade = async (userId: string, cost: number): Promise<number> => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, 'users', userId);

  return runTransaction(db, async (transaction) => {
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

    return newGems;
  });
};

// --- END OF FILE profileService.ts ---
