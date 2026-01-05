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
import { localDB } from '../../local-data/local-vocab-db.ts'; 

// --- TYPE DEFINITIONS ---
// <<< THAY ĐỔI: Thêm 'legendary' vào ChestType
type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced' | 'master' | 'legendary';

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
    // <<< THAY ĐỔI: Thêm key legendary: [] vào state khởi tạo
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ 
        basic: [], elementary: [], intermediate: [], advanced: [], master: [], legendary: [] 
    });
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
        const fetchVocabSpecificData = async () => {
            if (!currentUserId) { 
                setIsLoading(false); 
                return; 
            }
            setIsLoading(true);

            try {
                const openedVocabIds = await localDB.getAllOpenedIds();

                const totalItems = Math.min(defaultVocabulary.length, defaultImageUrls.length);
                // <<< THAY ĐỔI: Thêm key legendary: [] vào biến tạm
                const allIndices: Record<ChestType, number[]> = { 
                    basic: [], elementary: [], intermediate: [], advanced: [], master: [], legendary: [] 
                };
                
                Object.values(CHEST_DEFINITIONS).forEach(chest => {
                    // Logic này tự động bỏ qua nếu range là null (Coming Soon)
                    if (chest.isComingSoon || chest.range[0] === null) return;
                    
                    const endRange = chest.range[1] ?? (totalItems - 1);
                    for (let i = chest.range[0]!; i <= endRange && i < totalItems; i++) {
                        // Cast chestType để đảm bảo TS không báo lỗi
                        allIndices[chest.chestType as ChestType].push(i);
                    }
                });
                
                const openedIndices = new Set<number>();
                openedVocabIds.forEach(id => openedIndices.add(id - 1));

                // <<< THAY ĐỔI: Thêm key legendary: [] vào kết quả lọc
                const remainingIndices: Record<ChestType, number[]> = { 
                    basic: [], elementary: [], intermediate: [], advanced: [], master: [], legendary: [] 
                };
                Object.keys(allIndices).forEach(key => {
                    const chestType = key as ChestType;
                    remainingIndices[chestType] = allIndices[chestType].filter(index => !openedIndices.has(index));
                });

                setAvailableIndices(remainingIndices);
            } catch (error) {
                console.error("Error fetching vocab-specific data from Local DB:", error);
            } finally {
                setIsLoading(false);
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
        
        // TypeScript access workaround if needed, or update CHEST_DEFINITIONS types in UI file
        // @ts-ignore
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
            
            await processVocabularyChestOpening(currentUserId, { currency: chestDef.currency, cost: price, gemReward: count * GEM_REWARD_PER_CARD, newWordsData: newWordsToSave });

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

export const useVocabularyChest = (): VocabularyChestContextType => {
    const context = useContext(VocabularyChestContext);
    if (context === undefined) { 
        throw new Error('useVocabularyChest must be used within a VocabularyChestProvider'); 
    }
    return context;
};
