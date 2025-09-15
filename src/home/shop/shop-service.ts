// --- START OF FILE shop-service.ts ---

import { db } from '../../firebase';
// Thêm các import cần thiết từ Firestore
import { doc, runTransaction, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, limit } from 'firebase/firestore';
import type { User } from 'firebase/auth'; // Import User type nếu cần

/**
 * Xử lý giao dịch đổi Gem lấy Vàng cho người dùng.
 * @param userId - ID của người dùng.
 * @param gemCost - Số lượng Gem người dùng muốn đổi.
 * @returns {Promise<{ newGems: number; newCoins: number }>} Số Gem và Vàng mới của người dùng.
 * @throws {Error} Nếu người dùng không tồn tại hoặc không đủ Gem.
 */
export const processGemToCoinExchange = async (userId: string, gemCost: number): Promise<{ newGems: number; newCoins: number }> => {
    if (!userId) throw new Error("User ID is required.");
    if (gemCost <= 0) throw new Error("Gem cost must be positive.");

    const userDocRef = doc(db, 'users', userId);
    const coinReward = gemCost * 1000; // Tỷ lệ 1 Gem = 1000 Coins

    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const data = userDoc.data();
        const currentGems = data.gems || 0;
        const currentCoins = data.coins || 0;

        if (currentGems < gemCost) {
            throw new Error("Không đủ Gems để thực hiện giao dịch.");
        }

        const newGems = currentGems - gemCost;
        const newCoins = currentCoins + coinReward;

        t.update(userDocRef, { gems: newGems, coins: newCoins });

        return { newGems, newCoins };
    });
};

export const processShopPurchase = async (userId: string, item: any, quantity: number) => {
    const userDocRef = doc(db, 'users', userId);
    
    return runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document does not exist!");
        }
        
        const data = userDoc.data();
        const currentCoins = data.coins || 0;
        const totalCost = item.price * quantity;

        if (currentCoins < totalCost) {
            throw new Error("Không đủ vàng.");
        }

        const updates: { [key: string]: any } = { coins: currentCoins - totalCost };
        
        let newBooks = data.ancientBooks || 0;
        let newCapacity = data.cardCapacity || 100;
        let newPieces = data.equipment?.pieces || 0;
        let newPickaxes = data.pickaxes || 0;

        switch (item.id) {
            case 1009: // Ancient Book
                newBooks += quantity;
                updates.ancientBooks = newBooks;
                break;
            case 2001: // Card Capacity
                newCapacity += quantity;
                updates.cardCapacity = newCapacity;
                break;
            case 2002: // Equipment Piece
                newPieces += quantity;
                updates['equipment.pieces'] = newPieces; 
                break;
            case 2003: // Pickaxe
                newPickaxes += quantity;
                updates.pickaxes = newPickaxes;
                break;
            default:
                break;
        }
        
        t.update(userDocRef, updates);
        
        return { 
            newCoins: updates.coins, 
            newBooks, 
            newCapacity,
            newPieces,
            newPickaxes
        };
    });
};

// --- START: LOGIC MỚI CHO GIAO DỊCH GEMS ---

/**
 * Tạo một bản ghi giao dịch nạp Gem trong Firestore.
 * @param userId - ID của người dùng.
 * @param userEmail - Email của người dùng.
 * @param pkg - Gói Gem người dùng chọn.
 * @returns {Promise<any>} Đối tượng giao dịch vừa được tạo.
 */
export const createGemTransaction = async (userId: string, userEmail: string | null, pkg: any) => {
    const transactionId = `ELG${Date.now()}${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    
    const transactionData = {
        transactionId,
        userId,
        userEmail: userEmail || 'Không rõ',
        gemPackageId: pkg.id,
        gems: pkg.gems,
        amount: pkg.price,
        status: 'pending', // 'pending', 'user_confirmed', 'completed', 'failed'
        createdAt: serverTimestamp(),
        userConfirmedAt: null,
        processedAt: null,
    };

    const docRef = await addDoc(collection(db, 'gem_transactions'), transactionData);
    console.log("Transaction created with ID: ", docRef.id);
    return { ...transactionData, firestoreId: docRef.id };
};

/**
 * Cập nhật trạng thái giao dịch khi người dùng xác nhận đã chuyển tiền.
 * @param transactionId - ID giao dịch (nội dung chuyển khoản).
 * @returns {Promise<void>}
 */
export const confirmUserPayment = async (transactionId: string): Promise<void> => {
    if (!transactionId) throw new Error("Transaction ID is required.");
    
    const transactionsRef = collection(db, 'gem_transactions');
    const q = query(transactionsRef, where("transactionId", "==", transactionId), limit(1));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Không tìm thấy giao dịch.");
    }

    const transactionDoc = querySnapshot.docs[0];
    await updateDoc(transactionDoc.ref, {
        status: 'user_confirmed',
        userConfirmedAt: serverTimestamp(),
    });
    console.log(`Transaction ${transactionId} confirmed by user.`);
};

// --- END OF FILE shop-service.ts ---
