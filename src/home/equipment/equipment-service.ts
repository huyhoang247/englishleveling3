// --- START OF FILE equipment-service.ts ---

import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { fetchOrCreateUserGameData, type UserGameData } from './gameDataService';

// Các interface này nên được định nghĩa ở một nơi tập trung (ví dụ: types.ts) và import vào
// Tuy nhiên, để file này tự chứa, chúng sẽ được định nghĩa ở đây.
export interface OwnedItem {
    id: string;
    itemId: number;
    level: number;
    stats: { [key: string]: any };
}
export type EquipmentSlotType = 'weapon' | 'armor' | 'Helmet';
export type EquippedItems = {
    [key in EquipmentSlotType]: string | null;
};


/**
 * Lấy dữ liệu cần thiết cho màn hình Trang Bị.
 * @param userId - ID của người dùng.
 * @returns Dữ liệu cần thiết cho màn hình trang bị.
 */
export const fetchEquipmentScreenData = async (userId: string) => {
  if (!userId) throw new Error("User ID is required.");
  const gameData = await fetchOrCreateUserGameData(userId);
  return {
    gold: gameData.coins,
    equipmentPieces: gameData.equipment.pieces,
    ownedItems: gameData.equipment.owned,
    equippedItems: gameData.equipment.equipped,
  };
};


/**
 * Cập nhật túi đồ và trang bị của người dùng trong một transaction.
 * @param userId - ID của người dùng.
 * @param updates - Object chứa các thay đổi về túi đồ, trang bị, vàng và mảnh vỡ.
 * @returns {Promise<{ newCoins: number; newPieces: number; }>} Số vàng và mảnh trang bị mới.
 */
export const updateUserInventory = async (userId: string, updates: { newOwned: OwnedItem[]; newEquipped: EquippedItems; goldChange: number; piecesChange: number; }) => {
    const userDocRef = doc(db, 'users', userId);
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");
        const data = userDoc.data() as UserGameData;
        const currentEquipment = data.equipment || { pieces: 0, owned: [], equipped: { weapon: null, armor: null, Helmet: null } };
        const newCoins = (data.coins || 0) + updates.goldChange;
        const newPieces = (currentEquipment.pieces || 0) + updates.piecesChange;
        if (newCoins < 0) throw new Error("Không đủ vàng.");
        if (newPieces < 0) throw new Error("Không đủ Mảnh trang bị.");
        t.update(userDocRef, {
            coins: newCoins,
            equipment: { ...currentEquipment, pieces: newPieces, owned: updates.newOwned, equipped: updates.newEquipped }
        });
        return { newCoins, newPieces };
    });
};

// --- END OF FILE equipment-service.ts ---
