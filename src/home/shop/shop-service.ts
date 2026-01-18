// --- START OF FILE shop-service.ts ---

import { db } from '../../firebase';
import { doc, runTransaction, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, limit, orderBy } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Xử lý giao dịch đổi Gem lấy Vàng cho người dùng.
 */
export const processGemToCoinExchange = async (userId: string, gemCost: number): Promise<{ newGems: number; newCoins: number }> => {
    if (!userId) throw new Error("User ID is required.");
    if (gemCost <= 0) throw new Error("Gem cost must be positive.");

    const userDocRef = doc(db, 'users', userId);
    const coinReward = gemCost * 1000;

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

/**
 * Xử lý logic mua vật phẩm trong cửa hàng.
 */
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
        
        // Khởi tạo các biến để trả về giá trị mới sau khi update
        let newBooks = data.ancientBooks || 0;
        let newCapacity = data.cardCapacity || 100;
        let newPieces = data.equipment?.pieces || 0;
        let newPickaxes = data.pickaxes || 0;
        
        // Resources (Nguyên liệu)
        let newWood = data.wood || 0;
        let newLeather = data.leather || 0;
        let newOre = data.ore || 0;
        let newCloth = data.cloth || 0;
        let newFeather = data.feather || 0; // Mới thêm
        let newCoal = data.coal || 0;       // Mới thêm
        
        // Stones (Đá cường hoá)
        const currentStones = data.equipment?.stones || { low: 0, medium: 0, high: 0 };
        const newStones = { ...currentStones }; // Clone object để update

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
            
            // --- XỬ LÝ ĐÁ CƯỜNG HOÁ ---
            case 2004: // Đá Sơ Cấp (Low)
                newStones.low = (newStones.low || 0) + quantity;
                updates['equipment.stones'] = newStones;
                break;
            case 2005: // Đá Trung Cấp (Medium)
                newStones.medium = (newStones.medium || 0) + quantity;
                updates['equipment.stones'] = newStones;
                break;
            case 2006: // Đá Cao Cấp (High)
                newStones.high = (newStones.high || 0) + quantity;
                updates['equipment.stones'] = newStones;
                break;

            // --- XỬ LÝ NGUYÊN LIỆU CŨ ---
            case 2007: // Wood (Gỗ)
                newWood += quantity;
                updates.wood = newWood;
                break;
            case 2008: // Leather (Da)
                newLeather += quantity;
                updates.leather = newLeather;
                break;
            case 2009: // Ore (Quặng)
                newOre += quantity;
                updates.ore = newOre;
                break;
            case 2010: // Cloth (Vải)
                newCloth += quantity;
                updates.cloth = newCloth;
                break;
            
            // --- XỬ LÝ NGUYÊN LIỆU MỚI (FEATHER & COAL) ---
            case 2011: // Feather (Lông vũ)
                newFeather += quantity;
                updates.feather = newFeather;
                break;
            case 2012: // Coal (Than đá)
                newCoal += quantity;
                updates.coal = newCoal;
                break;

            default:
                break;
        }
        
        // Thực hiện update vào Firestore
        t.update(userDocRef, updates);
        
        // Trả về các giá trị mới để cập nhật UI ngay lập tức (nếu cần)
        return { 
            newCoins: updates.coins, 
            newBooks, 
            newCapacity,
            newPieces,
            newPickaxes,
            newStones,
            // Return resources
            newWood,
            newLeather,
            newOre,
            newCloth,
            newFeather,
            newCoal
        };
    });
};

/**
 * Tạo một bản ghi giao dịch nạp Gem.
 */
export const createGemTransaction = async (userId: string, userEmail: string | null, pkg: any) => {
    const timestampPart = Date.now().toString().slice(-4); 
    const randomPart = Math.random().toString(36).substring(2, 6);
    const transactionId = `EL${timestampPart}${randomPart}`.toUpperCase();
    
    const transactionData = {
        transactionId,
        userId,
        userEmail: userEmail || 'Không rõ',
        gemPackageId: pkg.id,
        gems: pkg.gems,
        amount: pkg.price,
        status: 'pending', 
        createdAt: serverTimestamp(),
        userConfirmedAt: null,
        processedAt: null,
    };

    const docRef = await addDoc(collection(db, 'gem_transactions'), transactionData);
    console.log("Transaction created with ID: ", docRef.id);
    return { ...transactionData, firestoreId: docRef.id };
};

/**
 * Người dùng xác nhận đã chuyển tiền.
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

/**
 * Lấy danh sách các giao dịch từ Firestore, lọc theo trạng thái (cho Admin).
 */
export const fetchTransactionsByStatus = async (status: string): Promise<any[]> => {
    const transactionsRef = collection(db, 'gem_transactions');
    const q = query(transactionsRef, where("status", "==", status), orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return [];
    }
    
    return querySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));
};

/**
 * Admin duyệt một giao dịch, cộng Gem cho người dùng.
 */
export const approveGemTransaction = async (transaction: any): Promise<void> => {
    const userDocRef = doc(db, 'users', transaction.userId);
    const transactionDocRef = doc(db, 'gem_transactions', transaction.firestoreId);

    await runTransaction(db, async (t) => {
        const userDoc = await t.get(userDocRef);
        const transactionDoc = await t.get(transactionDocRef);

        if (!userDoc.exists()) {
            throw new Error(`User with ID ${transaction.userId} not found.`);
        }
        if (!transactionDoc.exists() || transactionDoc.data().status !== 'user_confirmed') {
            throw new Error("Transaction not found or is not in a confirmable state.");
        }

        const currentGems = userDoc.data().gems || 0;
        const newGems = currentGems + transaction.gems;

        t.update(userDocRef, { gems: newGems });
        
        t.update(transactionDocRef, { 
            status: 'completed',
            processedAt: serverTimestamp() 
        });
    });
    console.log(`Transaction ${transaction.transactionId} approved successfully.`);
};

/**
 * Admin từ chối một giao dịch.
 */
export const rejectGemTransaction = async (transactionFirestoreId: string): Promise<void> => {
    const transactionDocRef = doc(db, 'gem_transactions', transactionFirestoreId);
    await updateDoc(transactionDocRef, {
        status: 'failed',
        processedAt: serverTimestamp()
    });
    console.log(`Transaction ${transactionFirestoreId} has been rejected.`);
};

/**
 * Lấy lịch sử giao dịch của một người dùng cụ thể.
 */
export const fetchUserTransactions = async (userId: string): Promise<any[]> => {
    if (!userId) {
        throw new Error("User ID is required to fetch transaction history.");
    }
    const transactionsRef = collection(db, 'gem_transactions');
    const q = query(transactionsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return [];
    }

    return querySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));
};

// --- END OF FILE shop-service.ts ---
