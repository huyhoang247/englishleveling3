// --- START OF FILE VocabularyChestContext.tsx ---

import React, { createContext, useState, useEffect, useContext, useMemo, useCallback, ReactNode } from 'react';
import { db } from './firebase.js'; 
import { collection, getDocs } from 'firebase/firestore';

import { defaultImageUrls } from './voca-data/image-url.ts'; 
import { defaultVocabulary } from './voca-data/list-vocabulary.ts';
import { processVocabularyChestOpening, fetchVocabularyScreenData } from './gameDataService.ts'; 
import { useAnimateValue } from './ui/useAnimateValue.ts';
import { CHEST_DEFINITIONS } from './lat-the.tsx'; // Import định nghĩa rương từ file UI

// ========================================================================
// === 1. TYPE DEFINITIONS & CONSTANTS ====================================
// ========================================================================

export type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced' | 'master';
export interface ImageCard { id: number; url: string; }

const PRELOAD_POOL_SIZE = 20;
const GEM_REWARD_PER_CARD = 1;

interface VocabularyChestContextType {
    // --- State ---
    isLoading: boolean;
    availableIndices: Record<ChestType, number[]>;
    showSingleOverlay: boolean;
    showFourOverlay: boolean;
    cardsForPopup: ImageCard[];
    isProcessingClick: boolean;
    processingChestId: string | null;
    localCoins: number;
    localGems: number;
    localTotalVocab: number;
    localCardCapacity: number;
    
    // --- Animated Values (for UI convenience) ---
    animatedCoins: number;
    animatedGems: number;

    // --- Actions ---
    openChest: (count: 1 | 4, chestType: ChestType) => Promise<void>;
    closeCardOverlay: () => void;
    openLastChestAgain: () => void;
    
    // --- Preloading ---
    urlsToPreload: string[];
}

// ========================================================================
// === 2. CONTEXT CREATION ================================================
// ========================================================================

const VocabularyChestContext = createContext<VocabularyChestContextType | undefined>(undefined);

// ========================================================================
// === 3. PROVIDER COMPONENT ==============================================
// ========================================================================

interface VocabularyChestProviderProps {
    children: ReactNode;
    currentUserId: string;
}

export const VocabularyChestProvider: React.FC<VocabularyChestProviderProps> = ({ children, currentUserId }) => {
    // --- Toàn bộ state được quản lý tại đây ---
    const [isLoading, setIsLoading] = useState(true);
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ basic: [], elementary: [], intermediate: [], advanced: [], master: [] });
    const [preloadPool, setPreloadPool] = useState<number[]>([]);
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    const [isProcessingClick, setIsProcessingClick] = useState(false);
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);
    const [processingChestId, setProcessingChestId] = useState<string | null>(null);
    
    const [localCoins, setLocalCoins] = useState(0);
    const [localGems, setLocalGems] = useState(0);
    const [localTotalVocab, setLocalTotalVocab] = useState(0);
    const [localCardCapacity, setLocalCardCapacity] = useState(0);
    
    const animatedCoins = useAnimateValue(localCoins, 500);
    const animatedGems = useAnimateValue(localGems, 500);

    // --- Logic lấy dữ liệu ban đầu ---
    useEffect(() => {
        const fetchAllInitialData = async () => {
            if (!currentUserId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [screenData, openedVocabSnapshot] = await Promise.all([
                    fetchVocabularyScreenData(currentUserId),
                    getDocs(collection(db, 'users', currentUserId, 'openedVocab'))
                ]);

                setLocalCoins(screenData.coins);
                setLocalGems(screenData.gems);
                setLocalTotalVocab(screenData.totalVocab);
                setLocalCardCapacity(screenData.capacity);

                const totalItems = Math.min(defaultVocabulary.length, defaultImageUrls.length);
                const allIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                Object.values(CHEST_DEFINITIONS).forEach(chest => {
                    if (chest.isComingSoon || chest.range[0] === null) return;
                    const endRange = chest.range[1] ?? (totalItems - 1);
                    for (let i = chest.range[0]!; i <= endRange && i < totalItems; i++) {
                        allIndices[chest.chestType].push(i);
                    }
                });
                
                const openedIndices = new Set<number>();
                openedVocabSnapshot.forEach(doc => { openedIndices.add(Number(doc.id) - 1); });

                const remainingIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                (Object.keys(allIndices) as ChestType[]).forEach(chestType => {
                    remainingIndices[chestType] = allIndices[chestType].filter(index => !openedIndices.has(index));
                });
                setAvailableIndices(remainingIndices);

            } catch (error) {
                console.error("Error fetching initial data for Vocabulary Chest Context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllInitialData();
    }, [currentUserId]);

    // --- Logic tải trước hình ảnh ---
    useEffect(() => {
        const allAvailable = Object.values(availableIndices).flat();
        if (preloadPool.length < PRELOAD_POOL_SIZE && allAvailable.length > 0) {
            const needed = PRELOAD_POOL_SIZE - preloadPool.length;
            const indicesToAdd = allAvailable.filter(idx => !preloadPool.includes(idx)).slice(0, needed);
            if (indicesToAdd.length > 0) {
                setPreloadPool(prevPool => [...prevPool, ...indicesToAdd]);
            }
        }
    }, [availableIndices, preloadPool]);

    const urlsToPreload = useMemo(() => {
        return preloadPool.map(index => defaultImageUrls[index]);
    }, [preloadPool]);

    // --- Hành động chính: Mở rương ---
    const openChest = useCallback(async (count: 1 | 4, chestType: ChestType) => {
        if (isProcessingClick || !currentUserId) return;
        const chestDef = CHEST_DEFINITIONS[chestType];
        if (!chestDef || chestDef.isComingSoon) return;
        
        const price = count === 1 ? chestDef.price1 : (chestDef.price10 || 0);
        if (localTotalVocab + count > localCardCapacity) { alert(`Kho thẻ đã đầy! (${localTotalVocab}/${localCardCapacity}).\nVui lòng nâng cấp sức chứa để tiếp tục.`); return; }
        if (chestDef.currency === 'gold' && localCoins < price) { alert(`Bạn không đủ vàng! Cần ${price.toLocaleString()}, bạn đang có ${localCoins.toLocaleString()}.`); return; }
        if (chestDef.currency === 'gem' && localGems < price) { alert(`Bạn không đủ gem! Cần ${price.toLocaleString()}, bạn đang có ${localGems.toLocaleString()}.`); return; }
        
        const targetPool = availableIndices[chestType];
        if (targetPool.length < count) { alert(`Không đủ thẻ trong rương này để mở (cần ${count}, còn ${targetPool.length}).`); return; }

        setIsProcessingClick(true);
        setProcessingChestId(chestDef.id);
        setLastOpenedChest({ count, type: chestType }); 
        
        try {
            let tempPool = [...targetPool];
            const selectedOriginalIndices: number[] = [];
            for (let i = 0; i < count; i++) {
                const randomIndex = Math.floor(Math.random() * tempPool.length);
                const originalImageIndex = tempPool[randomIndex];
                selectedOriginalIndices.push(originalImageIndex);
                tempPool.splice(randomIndex, 1);
            }
            const selectedCardsForPopup: ImageCard[] = selectedOriginalIndices.map(index => ({
                id: index + 1,
                url: defaultImageUrls[index]
            }));
            const newWordsToSave = selectedOriginalIndices.map(index => ({ id: index + 1, word: defaultVocabulary[index], chestType: chestType }));

            const { newCoins, newGems, newTotalVocab } = await processVocabularyChestOpening(
                currentUserId, {
                    currency: chestDef.currency,
                    cost: price,
                    gemReward: count * GEM_REWARD_PER_CARD,
                    newWordsData: newWordsToSave,
                }
            );
            
            setLocalCoins(newCoins);
            setLocalGems(newGems);
            setLocalTotalVocab(newTotalVocab);
            
            setAvailableIndices(prev => ({ ...prev, [chestType]: tempPool }));
            setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
            setCardsForPopup(selectedCardsForPopup);
            if (count === 1) setShowSingleOverlay(true); else setShowFourOverlay(true);

        } catch (error) {
            console.error("Lỗi khi xử lý mở thẻ qua service:", error);
            alert(`Đã xảy ra lỗi. Giao dịch đã bị hủy.\nChi tiết: ${error instanceof Error ? error.message : String(error)}`);
            setProcessingChestId(null);
        } finally {
            setTimeout(() => setIsProcessingClick(false), 500); 
        }
    }, [isProcessingClick, currentUserId, localTotalVocab, localCardCapacity, localCoins, localGems, availableIndices]);
    
    // --- Các hành động điều khiển UI ---
    const closeCardOverlay = useCallback(() => {
        setShowSingleOverlay(false);
        setShowFourOverlay(false);
        setCardsForPopup([]);
        setProcessingChestId(null);
    }, []);

    const openLastChestAgain = useCallback(() => {
        if (lastOpenedChest) {
            openChest(lastOpenedChest.count, lastOpenedChest.type);
        }
    }, [lastOpenedChest, openChest]);

    // --- Giá trị được cung cấp cho các component con ---
    const value = {
        isLoading, availableIndices, showSingleOverlay, showFourOverlay, cardsForPopup,
        isProcessingClick, processingChestId, localCoins, localGems, localTotalVocab, localCardCapacity,
        animatedCoins, animatedGems, openChest, closeCardOverlay, openLastChestAgain, urlsToPreload,
    };

    return (
        <VocabularyChestContext.Provider value={value}>
            {children}
        </VocabularyChestContext.Provider>
    );
};

// ========================================================================
// === 4. CUSTOM HOOK ĐỂ SỬ DỤNG DỄ DÀNG ==================================
// ========================================================================

export const useVocabularyChest = (): VocabularyChestContextType => {
    const context = useContext(VocabularyChestContext);
    if (context === undefined) {
        throw new Error('useVocabularyChest must be used within a VocabularyChestProvider');
    }
    return context;
};

// --- END OF FILE VocabularyChestContext.tsx ---
