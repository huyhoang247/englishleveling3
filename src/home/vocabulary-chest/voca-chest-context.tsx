
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { defaultImageUrls } from '../../voca-data/image-url.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
import { processVocabularyChestOpening, fetchVocabularyScreenData } from '../../vocabularyService.ts';
// THAY ĐỔI: Import hằng số từ file UI chính thay vì file constants riêng
import { CHEST_DEFINITIONS } from './voca-chest-ui.tsx';

// --- TYPE DEFINITIONS ---
type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced' | 'master';
interface ImageCard { id: number; url: string; }
interface PlayerStats { coins: number; gems: number; totalVocab: number; capacity: number; }
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
    currentUserId: string;
    onStateUpdate: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
}

const PRELOAD_POOL_SIZE = 20;
const GEM_REWARD_PER_CARD = 1;

// --- CONTEXT CREATION ---
const VocabularyChestContext = createContext<VocabularyChestContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const VocabularyChestProvider: React.FC<VocabularyChestProviderProps> = ({ children, currentUserId, onStateUpdate }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ basic: [], elementary: [], intermediate: [], advanced: [], master: [] });
    const [preloadPool, setPreloadPool] = useState<number[]>([]);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    const [processingChestId, setProcessingChestId] = useState<string | null>(null);
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStats>({ coins: 0, gems: 0, totalVocab: 0, capacity: 0 });

    // --- DATA FETCHING EFFECT ---
    useEffect(() => {
        const MIN_LOADING_TIME_MS = 700;
        const startTime = Date.now();

        const fetchAllInitialData = async () => {
            if (!currentUserId) { setIsLoading(false); return; }
            setIsLoading(true);

            try {
                const [screenData, openedVocabSnapshot] = await Promise.all([
                    fetchVocabularyScreenData(currentUserId),
                    getDocs(collection(db, 'users', currentUserId, 'openedVocab'))
                ]);
 
                setPlayerStats({
                    coins: screenData.coins, gems: screenData.gems,
                    totalVocab: screenData.totalVocab, capacity: screenData.capacity,
                });

                const totalItems = Math.min(defaultVocabulary.length, defaultImageUrls.length);
                const allIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                Object.values(CHEST_DEFINITIONS).forEach(chest => {
                    if (chest.isComingSoon || chest.range[0] === null) return;
                    const endRange = chest.range[1] ?? (totalItems - 1);
                    for (let i = chest.range[0]!; i <= endRange && i < totalItems; i++) {
                        allIndices[chest.chestType].push(i);
                    }
                });

                const openedIndices = new Set<number>(Array.from(openedVocabSnapshot.docs, doc => Number(doc.id) - 1));
                const remainingIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                Object.keys(allIndices).forEach(key => {
                    const chestType = key as ChestType;
                    remainingIndices[chestType] = allIndices[chestType].filter(index => !openedIndices.has(index));
                });
                setAvailableIndices(remainingIndices);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = MIN_LOADING_TIME_MS - elapsedTime;
                const delay = Math.max(0, remainingTime);

                setTimeout(() => setIsLoading(false), delay);
            }
        };
        fetchAllInitialData();
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
            const { newCoins, newGems, newTotalVocab } = await processVocabularyChestOpening(currentUserId, { currency: chestDef.currency, cost: price, gemReward: count * GEM_REWARD_PER_CARD, newWordsData: newWordsToSave });

            setPlayerStats({ ...playerStats, coins: newCoins, gems: newGems, totalVocab: newTotalVocab });
            onStateUpdate({ newCoins, newGems, newTotalVocab });
            setAvailableIndices(prev => ({ ...prev, [chestType]: tempPool }));
            setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
            setCardsForPopup(selectedCardsForPopup);
        } catch (error) {
            console.error("Lỗi khi xử lý mở thẻ:", error);
            alert(`Đã xảy ra lỗi. Giao dịch đã bị hủy.\n${error instanceof Error ? error.message : String(error)}`);
            setProcessingChestId(null);
        }
    }, [processingChestId, currentUserId, playerStats, availableIndices, onStateUpdate]);

    // --- OVERLAY HANDLERS ---
    const closeOverlay = useCallback(() => { setCardsForPopup([]); setProcessingChestId(null); }, []);
    const openAgain = useCallback(() => { if (lastOpenedChest) { openChest(lastOpenedChest.count, lastOpenedChest.type); } }, [lastOpenedChest, openChest]);

    // --- CONTEXT VALUE ---
    const value: VocabularyChestContextType = {
        isLoading, playerStats, availableIndices, urlsToPreload,
        isOverlayVisible: cardsForPopup.length > 0,
        cardsForPopup,
        openedCardCount: cardsForPopup.length === 1 ? 1 : cardsForPopup.length > 1 ? 4 : null,
        processingChestId,
        openChest, closeOverlay, openAgain,
    };

    return <VocabularyChestContext.Provider value={value}>{children}</VocabularyChestContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useVocabularyChest = (): VocabularyChestContextType => {
    const context = useContext(VocabularyChestContext);
    if (context === undefined) { throw new Error('useVocabularyChest must be used within a VocabularyChestProvider'); }
    return context;
};
