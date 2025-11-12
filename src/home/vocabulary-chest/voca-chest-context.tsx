// --- START OF FILE voca-chest-context.tsx ---

import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    useCallback, 
    useMemo, 
    ReactNode 
} from 'react';
import { auth } from '../../firebase.js'; 
import { defaultImageUrls } from '../../voca-data/image-url.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
import { useGame } from '../../GameContext.tsx'; 
import { processVocabularyChestOpening } from './voca-chest-service.ts';
import { CHEST_DEFINITIONS } from './voca-chest-ui.tsx';
// <<< THAY ĐỔI: Import localDB service để đọc dữ liệu từ IndexedDB
import { localDB } from '../../lib/local-vocab-db.ts'; // <= CHÚ Ý: CHỈNH LẠI ĐƯỜNG DẪN NÀY NẾU CẦN

// --- TYPE DEFINITIONS ---
type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced' | 'master';

interface ImageCard { 
    id: number; 
    url: string; 
}

interface PlayerStats { 
    coins: number; 
    gems: number; 
    totalVocab: number; 
    capacity: number; 
}

interface VocabularyChestContextType {
    isLoading: boolean;
    playerStats: PlayerStats;
    availableIndices: Record<ChestType, number[]>;
    urlsToPreload: string[];
    isOverlayVisible: boolean;
    cardsForPopup: ImageCard[];
    openedCardCount: 1 | 4 | null;
    processingChestId: string | null;
    openChest: (count: 1 | 4, chestType: ChestType) => Promise<void>;
    closeOverlay: () => void;
    openAgain: () => void;
}

interface VocabularyChestProviderProps {
    children: ReactNode;
}

const PRELOAD_POOL_SIZE = 20;
const GEM_REWARD_PER_CARD = 1;

// --- CONTEXT CREATION ---
const VocabularyChestContext = createContext<VocabularyChestContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const VocabularyChestProvider: React.FC<VocabularyChestProviderProps> = ({ children }) => {
    const { coins, gems, totalVocabCollected, cardCapacity } = useGame();
    const currentUserId = auth.currentUser?.uid;

    const [isLoading, setIsLoading] = useState(true);
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ basic: [], elementary: [], intermediate: [], advanced: [], master: [] });
    const [preloadPool, setPreloadPool] = useState<number[]>([]);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    const [processingChestId, setProcessingChestId] = useState<string | null>(null);
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);
    
    const playerStats: PlayerStats = useMemo(() => ({
        coins,
        gems,
        totalVocab: totalVocabCollected,
        capacity: cardCapacity,
    }), [coins, gems, totalVocabCollected, cardCapacity]);

    // --- DATA FETCHING EFFECT ---
    useEffect(() => {
        const MIN_LOADING_TIME_MS = 700;
        const startTime = Date.now();

        // <<< THAY ĐỔI: Hàm này bây giờ fetch dữ liệu từ IndexedDB thay vì Firestore
        const fetchVocabSpecificData = async () => {
            // Không cần currentUserId để đọc localDB, nhưng giữ lại để logic không chạy khi chưa đăng nhập
            if (!currentUserId) { 
                setIsLoading(false); 
                return; 
            }
            setIsLoading(true);

            try {
                // Đọc danh sách ID (1-based) của các từ đã mở từ IndexedDB
                const openedVocabIds = await localDB.getAllOpenedIds();

                // Tính toán tất cả các index có thể có cho mỗi loại rương
                const totalItems = Math.min(defaultVocabulary.length, defaultImageUrls.length);
                const allIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                Object.values(CHEST_DEFINITIONS).forEach(chest => {
                    if (chest.isComingSoon || chest.range[0] === null) return;
                    const endRange = chest.range[1] ?? (totalItems - 1);
                    for (let i = chest.range[0]!; i <= endRange && i < totalItems; i++) {
                        allIndices[chest.chestType].push(i);
                    }
                });
                
                // Chuyển đổi ID (1-based) từ DB thành index (0-based) để so sánh
                const openedIndices = new Set<number>();
                openedVocabIds.forEach(id => openedIndices.add(id - 1));

                // Lọc ra các index còn lại (chưa được mở)
                const remainingIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                Object.keys(allIndices).forEach(key => {
                    const chestType = key as ChestType;
                    remainingIndices[chestType] = allIndices[chestType].filter(index => !openedIndices.has(index));
                });

                setAvailableIndices(remainingIndices);
            } catch (error) {
                console.error("Error fetching vocab-specific data from Local DB:", error);
            } finally {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = MIN_LOADING_TIME_MS - elapsedTime;
                const delay = Math.max(0, remainingTime);
                setTimeout(() => setIsLoading(false), delay);
            }
        };
        fetchVocabSpecificData();
    }, [currentUserId]);

    // --- PRELOADING EFFECT ---
    useEffect(() => {
        const allAvailable = Object.values(availableIndices).flat();
        if (preloadPool.length < PRELOAD_POOL_SIZE && allAvailable.length > 0) {
            const needed = PRELOAD_POOL_SIZE - preloadPool.length;
            const indicesToAdd = allAvailable.filter(idx => !preloadPool.includes(idx)).slice(0, needed);
            if (indicesToAdd.length > 0) {
                setPreloadPool(prevPool => [...new Set([...prevPool, ...indicesToAdd])]);
            }
        }
    }, [availableIndices, preloadPool]);

    const urlsToPreload = useMemo(() => preloadPool.map(index => defaultImageUrls[index]), [preloadPool]);

    // --- CORE LOGIC: OPEN CHEST ---
    const openChest = useCallback(async (count: 1 | 4, chestType: ChestType) => {
        if (processingChestId || !currentUserId) return;
        const chestDef = CHEST_DEFINITIONS[chestType];
        if (!chestDef || chestDef.isComingSoon) return;

        const price = count === 1 ? chestDef.price1 : (chestDef.price10 ?? 0);
        if (playerStats.totalVocab + count > playerStats.capacity) { alert(`Kho thẻ đã đầy! (${playerStats.totalVocab}/${playerStats.capacity}).`); return; }
        if (chestDef.currency === 'gold' && playerStats.coins < price) { alert(`Bạn không đủ vàng! Cần ${price.toLocaleString()}, bạn có ${playerStats.coins.toLocaleString()}.`); return; }
        if (chestDef.currency === 'gem' && playerStats.gems < price) { alert(`Bạn không đủ gem! Cần ${price.toLocaleString()}, bạn có ${playerStats.gems.toLocaleString()}.`); return; }
        if (availableIndices[chestType].length < count) { alert(`Không đủ thẻ trong rương để mở (cần ${count}, còn ${availableIndices[chestType].length}).`); return; }

        setProcessingChestId(chestDef.id);
        setLastOpenedChest({ count, type: chestType });

        try {
            let tempPool = [...availableIndices[chestType]];
            const selectedOriginalIndices: number[] = [];
            const selectedCardsForPopup: ImageCard[] = Array.from({ length: count }, () => {
                const randomIndex = Math.floor(Math.random() * tempPool.length);
                const originalImageIndex = tempPool.splice(randomIndex, 1)[0];
                selectedOriginalIndices.push(originalImageIndex);
                return { id: originalImageIndex + 1, url: defaultImageUrls[originalImageIndex] };
            });

            const newWordsToSave = selectedOriginalIndices.map(index => ({ id: index + 1, word: defaultVocabulary[index], chestType: chestType }));
            
            // Gọi service để xử lý giao dịch trên Firestore và ghi vào Local DB
            await processVocabularyChestOpening(currentUserId, { currency: chestDef.currency, cost: price, gemReward: count * GEM_REWARD_PER_CARD, newWordsData: newWordsToSave });

            // Cập nhật state cục bộ của màn hình này (danh sách thẻ còn lại)
            setAvailableIndices(prev => ({ ...prev, [chestType]: tempPool }));
            setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
            setCardsForPopup(selectedCardsForPopup);
        } catch (error) {
            console.error("Lỗi khi xử lý mở thẻ:", error);
            alert(`Đã xảy ra lỗi. Giao dịch đã bị hủy.\n${error instanceof Error ? error.message : String(error)}`);
            setProcessingChestId(null);
        }
    }, [processingChestId, currentUserId, playerStats, availableIndices]);

    // --- OVERLAY HANDLERS ---
    const closeOverlay = useCallback(() => { 
        setCardsForPopup([]); 
        setProcessingChestId(null); 
    }, []);

    const openAgain = useCallback(() => { 
        if (lastOpenedChest) { 
            openChest(lastOpenedChest.count, lastOpenedChest.type); 
        } 
    }, [lastOpenedChest, openChest]);

    // --- CONTEXT VALUE ---
    const value: VocabularyChestContextType = {
        isLoading, 
        playerStats, 
        availableIndices, 
        urlsToPreload,
        isOverlayVisible: cardsForPopup.length > 0,
        cardsForPopup,
        openedCardCount: cardsForPopup.length === 1 ? 1 : cardsForPopup.length > 1 ? 4 : null,
        processingChestId,
        openChest, 
        closeOverlay, 
        openAgain,
    };

    return <VocabularyChestContext.Provider value={value}>{children}</VocabularyChestContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useVocabularyChest = (): VocabularyChestContextType => {
    const context = useContext(VocabularyChestContext);
    if (context === undefined) { 
        throw new Error('useVocabularyChest must be used within a VocabularyChestProvider'); 
    }
    return context;
};
