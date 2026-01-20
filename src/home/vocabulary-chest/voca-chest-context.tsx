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

// ========================================================================
// === TYPE DEFINITIONS ===================================================
// ========================================================================

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

// Interface chứa thông tin về đợt giảm giá (Sale)
interface BasicSaleInfo {
    isActive: boolean;          // Có đang trong thời gian sale không
    remainingSaleSlots: number; // Số lượng thẻ còn lại được hưởng giá sale
    salePrice1: number;         // Giá sale khi mở 1 thẻ
    salePrice4: number;         // Giá sale khi mở 4 thẻ
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
    basicSaleInfo: BasicSaleInfo; // Thông tin sale được export ra cho UI dùng
    openChest: (count: 1 | 4, chestType: ChestType) => Promise<void>;
    closeOverlay: () => void;
    openAgain: () => void;
}

interface VocabularyChestProviderProps {
    children: ReactNode;
    currentUserId: string;
    onStateUpdate: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
}

// ========================================================================
// === CONSTANTS ==========================================================
// ========================================================================

const PRELOAD_POOL_SIZE = 20;
const GEM_REWARD_PER_CARD = 1;

// Cấu hình cho logic Sale
const BASIC_CHEST_TOTAL = 2400; // Tổng số thẻ Basic
const SALE_LIMIT = 100;         // 100 thẻ đầu tiên được sale
const SALE_PRICE_PER_CARD = 10; // Giá sau khi giảm (10 Gold/thẻ)

// ========================================================================
// === CONTEXT CREATION ===================================================
// ========================================================================

const VocabularyChestContext = createContext<VocabularyChestContextType | undefined>(undefined);

// ========================================================================
// === PROVIDER COMPONENT =================================================
// ========================================================================

export const VocabularyChestProvider: React.FC<VocabularyChestProviderProps> = ({ children, currentUserId }) => {
    // Lấy dữ liệu global từ GameContext
    const { coins, gems, totalVocabCollected, cardCapacity } = useGame();

    // --- STATE ---
    const [isLoading, setIsLoading] = useState(true);
    
    // Lưu trữ danh sách các index thẻ CÓ THỂ mở được cho từng loại rương
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ 
        basic: [], elementary: [], intermediate: [], advanced: [], master: [], legendary: [] 
    });

    // Pool quản lý việc preload ảnh để trải nghiệm mượt mà hơn
    const [preloadPool, setPreloadPool] = useState<number[]>([]);

    // State quản lý Popup mở thẻ
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    
    // State để disable nút bấm khi đang xử lý giao dịch
    const [processingChestId, setProcessingChestId] = useState<string | null>(null);
    
    // Lưu lại loại rương vừa mở để dùng chức năng "Mở Lại"
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);
    
    // Memoize playerStats để tránh re-render không cần thiết
    const playerStats: PlayerStats = useMemo(() => ({
        coins,
        gems,
        totalVocab: totalVocabCollected,
        capacity: cardCapacity,
    }), [coins, gems, totalVocabCollected, cardCapacity]);

    // --- LOGIC TÍNH TOÁN FLASH SALE (NEW) ---
    // Được tính toán lại mỗi khi danh sách thẻ Basic khả dụng thay đổi
    const basicSaleInfo: BasicSaleInfo = useMemo(() => {
        // Nếu đang loading hoặc chưa load xong dữ liệu, mặc định là không sale để tránh flash UI
        if (availableIndices.basic.length === 0 && isLoading) {
            return { isActive: false, remainingSaleSlots: 0, salePrice1: 320, salePrice4: 1200 };
        }

        // Số thẻ Basic đã thu thập = Tổng số thẻ Basic - Số thẻ Basic còn lại trong kho
        const collectedBasicCount = BASIC_CHEST_TOTAL - availableIndices.basic.length;
        
        // Điều kiện Sale: Số thẻ đã thu thập nhỏ hơn giới hạn Sale (100)
        const isActive = collectedBasicCount < SALE_LIMIT;
        
        // Số lượt còn lại
        const remainingSaleSlots = Math.max(0, SALE_LIMIT - collectedBasicCount);

        return {
            isActive,
            remainingSaleSlots,
            salePrice1: SALE_PRICE_PER_CARD,        // 10 Gold
            salePrice4: SALE_PRICE_PER_CARD * 4     // 40 Gold
        };
    }, [availableIndices.basic.length, isLoading]);

    // --- EFFECT: LOAD DỮ LIỆU TỪ LOCAL DB ---
    useEffect(() => {
        const fetchVocabSpecificData = async () => {
            if (!currentUserId) { 
                setIsLoading(false); 
                return; 
            }
            setIsLoading(true);

            try {
                // Lấy tất cả ID thẻ đã mở từ IndexedDB
                const openedVocabIds = await localDB.getAllOpenedIds();

                const totalItems = Math.min(defaultVocabulary.length, defaultImageUrls.length);
                const allIndices: Record<ChestType, number[]> = { 
                    basic: [], elementary: [], intermediate: [], advanced: [], master: [], legendary: [] 
                };
                
                // Phân loại các index vào từng loại rương dựa trên định nghĩa (Range)
                Object.values(CHEST_DEFINITIONS).forEach(chest => {
                    if (chest.isComingSoon || chest.range[0] === null) return;
                    
                    const endRange = chest.range[1] ?? (totalItems - 1);
                    for (let i = chest.range[0]!; i <= endRange && i < totalItems; i++) {
                        allIndices[chest.chestType as ChestType].push(i);
                    }
                });
                
                // Tạo Set để tra cứu nhanh các thẻ đã mở
                const openedIndices = new Set<number>();
                openedVocabIds.forEach(id => openedIndices.add(id - 1));

                // Lọc ra các thẻ chưa mở
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

    // --- EFFECT: PRELOAD HÌNH ẢNH ---
    // Tự động tải trước 20 hình tiếp theo để khi mở thẻ không bị trắng ảnh
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

    // --- MAIN FUNCTION: MỞ RƯƠNG ---
    const openChest = useCallback(async (count: 1 | 4, chestType: ChestType) => {
        if (processingChestId || !currentUserId) return;
        
        // Lấy định nghĩa rương để biết giá tiền gốc và loại tiền tệ
        // @ts-ignore: TS có thể cảnh báo access dynamic key nhưng logic đảm bảo an toàn
        const chestDef = CHEST_DEFINITIONS[chestType];
        
        if (!chestDef || chestDef.isComingSoon) return;

        // --- XỬ LÝ GIÁ TIỀN (BAO GỒM LOGIC SALE) ---
        let finalPrice = count === 1 ? chestDef.price1 : (chestDef.price10 ?? 0);

        // Nếu là rương Basic và đang trong thời gian Sale
        if (chestType === 'basic' && basicSaleInfo.isActive) {
            finalPrice = count === 1 ? basicSaleInfo.salePrice1 : basicSaleInfo.salePrice4;
        }

        // --- VALIDATION (KIỂM TRA ĐIỀU KIỆN) ---
        if (playerStats.totalVocab + count > playerStats.capacity) { 
            alert(`Kho thẻ đã đầy! (${playerStats.totalVocab}/${playerStats.capacity}). Vui lòng nâng cấp kho.`); 
            return; 
        }
        
        if (chestDef.currency === 'gold' && playerStats.coins < finalPrice) { 
            alert(`Bạn không đủ vàng! Cần ${finalPrice.toLocaleString()}, bạn có ${playerStats.coins.toLocaleString()}.`); 
            return; 
        }
        
        if (chestDef.currency === 'gem' && playerStats.gems < finalPrice) { 
            alert(`Bạn không đủ gem! Cần ${finalPrice.toLocaleString()}, bạn có ${playerStats.gems.toLocaleString()}.`); 
            return; 
        }
        
        if (availableIndices[chestType].length < count) { 
            alert(`Không đủ thẻ trong rương để mở (cần ${count}, còn ${availableIndices[chestType].length}).`); 
            return; 
        }

        // Bắt đầu xử lý
        setProcessingChestId(chestDef.id);
        setLastOpenedChest({ count, type: chestType });

        try {
            // Chọn ngẫu nhiên thẻ từ danh sách available
            let tempPool = [...availableIndices[chestType]];
            const selectedOriginalIndices: number[] = [];
            
            // Tạo dữ liệu cho Popup hiển thị
            const selectedCardsForPopup: ImageCard[] = Array.from({ length: count }, () => {
                const randomIndex = Math.floor(Math.random() * tempPool.length);
                const originalImageIndex = tempPool.splice(randomIndex, 1)[0]; // Lấy ra và xóa khỏi mảng tạm
                selectedOriginalIndices.push(originalImageIndex);
                return { id: originalImageIndex + 1, url: defaultImageUrls[originalImageIndex] };
            });

            // Chuẩn bị dữ liệu để lưu vào Local DB
            const newWordsToSave = selectedOriginalIndices.map(index => ({ 
                id: index + 1, 
                word: defaultVocabulary[index], 
                chestType: chestType 
            }));
            
            // Gọi Service để thực hiện giao dịch (Trừ tiền, cộng thẻ, lưu DB)
            await processVocabularyChestOpening(currentUserId, { 
                currency: chestDef.currency, 
                cost: finalPrice, // Sử dụng giá đã tính toán (có thể là giá sale)
                gemReward: count * GEM_REWARD_PER_CARD, 
                newWordsData: newWordsToSave 
            });

            // Cập nhật State cục bộ sau khi thành công
            setAvailableIndices(prev => ({ ...prev, [chestType]: tempPool }));
            
            // Xóa các thẻ vừa mở khỏi pool preload để load các thẻ mới
            setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
            
            // Hiển thị Popup kết quả
            setCardsForPopup(selectedCardsForPopup);
            
        } catch (error) {
            console.error("Lỗi khi xử lý mở thẻ:", error);
            alert(`Đã xảy ra lỗi. Giao dịch đã bị hủy.\n${error instanceof Error ? error.message : String(error)}`);
            setProcessingChestId(null);
        }
    }, [processingChestId, currentUserId, playerStats, availableIndices, basicSaleInfo]); 
    // ^ Dependency basicSaleInfo đảm bảo hàm openChest luôn có giá mới nhất

    // --- CÁC HÀM XỬ LÝ UI KHÁC ---
    const closeOverlay = useCallback(() => { 
        setCardsForPopup([]); 
        setProcessingChestId(null); 
    }, []);

    const openAgain = useCallback(() => { 
        if (lastOpenedChest) { 
            openChest(lastOpenedChest.count, lastOpenedChest.type); 
        } 
    }, [lastOpenedChest, openChest]);

    // --- EXPORT CONTEXT VALUE ---
    const value: VocabularyChestContextType = {
        isLoading, 
        playerStats, 
        availableIndices, 
        urlsToPreload,
        isOverlayVisible: cardsForPopup.length > 0,
        cardsForPopup,
        openedCardCount: cardsForPopup.length === 1 ? 1 : cardsForPopup.length > 1 ? 4 : null,
        processingChestId,
        basicSaleInfo, // Export thông tin Sale để UI hiển thị
        openChest, 
        closeOverlay, 
        openAgain,
    };

    return <VocabularyChestContext.Provider value={value}>{children}</VocabularyChestContext.Provider>;
};

// ========================================================================
// === HOOK SỬ DỤNG CONTEXT ===============================================
// ========================================================================

export const useVocabularyChest = (): VocabularyChestContextType => {
    const context = useContext(VocabularyChestContext);
    if (context === undefined) { 
        throw new Error('useVocabularyChest must be used within a VocabularyChestProvider'); 
    }
    return context;
};
