// lat-the.tsx (Final Version with Flexbox Layout)

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { db } from './firebase.js'; 
import { doc, setDoc, updateDoc, collection, getDocs, writeBatch, increment } from 'firebase/firestore';
import { defaultImageUrls } from './image-url.ts'; 
import ImagePreloader from './ImagePreloader.tsx'; 
import { defaultVocabulary } from './list-vocabulary.ts';

// ========================================================================
// === 1. CSS STYLES (Đã cập nhật) =======================================
// ========================================================================
const GlobalStyles = () => (
    <style>{`
        /* --- Cài đặt chung & Nền --- */
        body {
            background-color: #0a0a14;
            background-image: radial-gradient(circle at center, #16213e, #0a0a14);
            color: #e0e0e0;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            height: 100vh;
            overflow: hidden;
        }

        #root {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        }

        /* <<< THAY ĐỔI 1: THÊM WRAPPER CHO LAYOUT FLEXBOX >>> */
        .page-wrapper {
            display: flex;
            flex-direction: column;
            height: 100vh; /* Chiếm toàn bộ chiều cao màn hình */
            width: 100%;
        }
        
        /* === HEADER CỐ ĐỊNH - SỬA LẠI === */
        .main-header {
            /* position: fixed; <-- ĐÃ XÓA */
            position: sticky;   /* <-- ĐÃ THÊM: "Dính" ở trên cùng khi cuộn */
            top: 0;
            left: 0;
            width: 100%;
            padding: 12px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: rgba(16, 22, 46, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 100;
            box-sizing: border-box;
            transition: opacity 0.3s ease;
            flex-shrink: 0; /* <-- ĐÃ THÊM: Đảm bảo header không bị co lại */
        }

        .header-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #e0e0e0;
            margin: 0;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .vocab-screen-close-btn {
            width: 44px; height: 44px; background: transparent; border: none;
            cursor: pointer; display: flex; justify-content: center; align-items: center;
            transition: transform 0.2s ease, opacity 0.2s ease; opacity: 0.9;
            margin: -10px; padding: 10px;
        }
        .vocab-screen-close-btn:hover { transform: scale(1.15); opacity: 1; }
        .vocab-screen-close-btn img {
            width: 24px; height: 24px;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }
        
        /* === CONTAINER RƯƠNG - SỬA LẠI === */
        .chest-gallery-container {
            display: flex; flex-wrap: wrap; justify-content: center;
            gap: 30px; width: 100%; max-width: 1300px; 
            padding: 20px 20px 100px; box-sizing: border-box;
            /* margin-top: 61px; <-- ĐÃ XÓA */
            /* max-height: calc(100vh - 101px); <-- ĐÃ XÓA */
            
            flex-grow: 1;      /* <-- ĐÃ THÊM: Chiếm hết không gian còn lại */
            overflow-y: auto;  /* <-- GIỮ LẠI: Tạo thanh cuộn cho riêng nó */
        }

        /* Tùy chỉnh thanh cuộn */
        .chest-gallery-container::-webkit-scrollbar { width: 8px; }
        .chest-gallery-container::-webkit-scrollbar-track { background: rgba(10, 10, 20, 0.5); border-radius: 4px; }
        .chest-gallery-container::-webkit-scrollbar-thumb { background-color: #4a5588; border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
        .chest-gallery-container::-webkit-scrollbar-thumb:hover { background-color: #6366f1; }

        /* === GIAO DIỆN RƯƠNG BÁU (Phần còn lại giữ nguyên) === */
        .chest-ui-container {
            width: 100%; max-width: 380px; min-width: 300px;
            background-color: #1a1f36; border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(76, 89, 186, 0.2);
            overflow: hidden; display: flex; flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
            position: relative; border: none;
        }
        .chest-ui-container.is-coming-soon {
            filter: grayscale(80%);
            opacity: 0.7;
        }
        .chest-ui-container::before {
            content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.4), rgba(49, 46, 129, 0.3));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .chest-ui-container:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(129, 140, 248, 0.3);
        }
        .chest-header { 
            padding: 12px 20px; background-color: rgba(42, 49, 78, 0.7);
            font-size: 0.9rem; font-weight: 600; color: #c7d2fe;
            text-align: center; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .chest-body { 
            background: linear-gradient(170deg, #43335b, #2c2240);
            padding: 20px; position: relative; flex-grow: 1; 
            display: flex; flex-direction: column; align-items: center; overflow: hidden;
        }
        .chest-body::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: url('data:image/svg+xml,...'); opacity: 0.1; z-index: 0;
        }
        .chest-body > * { position: relative; z-index: 1; }
        
        .chest-top-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .chest-level-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .chest-level-name {
            background-color: rgba(0, 0, 0, 0.25); color: #c7d2fe;
            padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;
            font-weight: 600; border: 1px solid rgba(129, 140, 248, 0.4);
        }

        .chest-help-icon {
            width: 24px; height: 24px; background-color: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(129, 140, 248, 0.4); border-radius: 50%;
            color: #c7d2fe; font-weight: bold; display: flex;
            justify-content: center; align-items: center; cursor: pointer;
            font-size: 0.85rem; transition: background-color 0.2s; padding: 0;
        }
        .chest-help-icon:hover { background-color: rgba(0, 0, 0, 0.4); }
        
        .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 20px; }
        .chest-image { flex: 1; min-width: 0; height: auto; }
        .info-bubble { 
            flex: 2; background-color: rgba(10, 10, 20, 0.6); color: #d1d5db;
            padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.85rem; text-align: left; 
        }
        .remaining-count-text { color: #c5b8d9; font-weight: 500; font-size: 0.85rem; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        .highlight-yellow { color: #facc15; font-weight: bold; }
        
        .action-button-group { display: flex; gap: 10px; width: 100%; }
        .chest-button {
            flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer;
            transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s; color: #ffffff; 
            font-weight: 700; font-size: 0.95rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
            box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25); display: flex; align-items: center; 
            justify-content: center; gap: 8px;
        }
        .chest-button:disabled {
            cursor: not-allowed;
            background: linear-gradient(to top, #52525b, #71717a);
        }
        .chest-button:active:not(:disabled) { transform: translateY(2px); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.25); }
        .btn-get-1 { background: linear-gradient(to top, #8b5cf6, #c084fc); }
        .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); }
        
        .button-price {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            font-size: 0.85rem; color: white; font-weight: 600;
            background-color: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px;
            text-shadow: none;
        }
        .price-icon { width: 16px; height: 16px; }

        /* --- Overlay, Card & Loading Styles (Giữ nguyên) --- */
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes flip-in { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
        
        .card-opening-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(10, 10, 20, 0.95); z-index: 1000; display: flex; justify-content: center; align-items: center; animation: fade-in 0.5s ease; overflow: hidden; padding: 20px 15px; box-sizing: border-box; }
        .overlay-content { width: 100%; max-width: 900px; }
        .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
        .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .footer-btn.primary { border-color: #a78bfa; color: #a78bfa; }
        .footer-btn.primary:hover { background-color: #a78bfa; color: #1e293b; }
        .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; background-color: transparent; }
        
        .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform; }
        .card-container.is-flipping .card-inner { animation-name: flip-in; animation-duration: 0.8s; animation-fill-mode: forwards; animation-timing-function: ease-in-out; }
        
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #a78bfa; text-shadow: 0 0 10px #a78bfa; }
        .card-front { transform: rotateY(180deg); padding: 6px; box-sizing: border-box; background: rgba(42, 49, 78, 0.85); border: 1px solid rgba(255, 255, 255, 0.18); }
        .card-image-in-card { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
        .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; justify-content: center; margin: 0 auto; grid-template-columns: repeat(2, 1fr); }
        
        @keyframes deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .card-wrapper.dealt-in { animation: deal-in 0.5s ease-out forwards; }
    `}
    </style>
);


// ========================================================================
// === 2. CÁC COMPONENT CON VÀ DATA (Không thay đổi) =======================
// ========================================================================
// (Tất cả các component con như LoadingOverlay, Card, SingleCardOpener, 
// FourCardsOpener, ChestUI, và các hằng số CHEST_DEFINITIONS, CHEST_DATA 
// đều giữ nguyên, không cần thay đổi)

const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => { /* ... */ };
interface ImageCard { id: number; url: string; }
const Card = memo(({ cardData, isFlipping, flipDelay }: { cardData: ImageCard, isFlipping: boolean, flipDelay: number }) => ( /* ... */ ));
const SingleCardOpener = ({ card, onClose, onOpenAgain }: { card: ImageCard, onClose: () => void, onOpenAgain: () => void }) => { /* ... */ };
const FourCardsOpener = ({ cards, onClose, onOpenAgain }: { cards: ImageCard[], onClose: () => void, onOpenAgain: () => void }) => { /* ... */ };
interface ChestUIProps { /* ... */ }
const ChestUI: React.FC<ChestUIProps> = ({ /* ... */ }) => { /* ... */ };
const CHEST_DEFINITIONS = { /* ... */ };
const CHEST_DATA = Object.values(CHEST_DEFINITIONS);


// ========================================================================
// === 3. COMPONENT CHÍNH (Đã cập nhật JSX) ================================
// ========================================================================

interface VocabularyChestScreenProps { onClose: () => void; currentUserId: string | null; onCoinReward: (amount: number) => void; onGemReward: (amount: number) => void; }
type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced';
const PRELOAD_POOL_SIZE = 20;

const VocabularyChestScreen: React.FC<VocabularyChestScreenProps> = ({ onClose, currentUserId, onCoinReward, onGemReward }) => {
    // (Toàn bộ logic state và các hàm bên trong component này giữ nguyên)
    const [isLoading, setIsLoading] = useState(true);
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ basic: [], elementary: [], intermediate: [], advanced: [] });
    const [preloadPool, setPreloadPool] = useState<number[]>([]);
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    const [isProcessingClick, setIsProcessingClick] = useState(false);
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);

    useEffect(() => {
        // ... (hàm fetchOpenedItems giữ nguyên)
    }, [currentUserId]);

    useEffect(() => {
        // ... (hàm preloading giữ nguyên)
    }, [availableIndices, preloadPool]);

    const urlsToPreload = useMemo(() => {
        // ... (hàm useMemo giữ nguyên)
    }, [preloadPool]);

    const updateUserProgressInFirestore = async (imageIds: number[], chestType: ChestType) => {
        // ... (hàm updateUserProgressInFirestore giữ nguyên)
    };
    
    const handleOpenCards = async (count: 1 | 4, chestType: ChestType) => {
        // ... (hàm handleOpenCards giữ nguyên)
    };
    
    const handleCloseOverlay = (openedCount: number) => {
        // ... (hàm handleCloseOverlay giữ nguyên)
    };
    
    const handleOpenAgain = () => {
        // ... (hàm handleOpenAgain giữ nguyên)
    };

    if (isLoading) {
        return <LoadingOverlay isVisible={true} />;
    }
    
    const totalAvailable = availableIndices.basic.length + availableIndices.elementary.length + availableIndices.intermediate.length + availableIndices.advanced.length;

    return (
        <>
            <GlobalStyles />
            <ImagePreloader imageUrls={urlsToPreload} />
            
            {/* <<< THAY ĐỔI 2: ÁP DỤNG CẤU TRÚC JSX MỚI >>> */}
            <div className="page-wrapper">
                {!showSingleOverlay && !showFourOverlay && (
                    <header className="main-header">
                        <h1 className="header-title">Chọn Rương ({`Còn ${totalAvailable.toLocaleString()} ảnh`})</h1>
                        <button onClick={onClose} className="vocab-screen-close-btn" title="Đóng">
                            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close" />
                        </button>
                    </header>
                )}

                <div className="chest-gallery-container">
                    {CHEST_DATA.map((chest) => {
                        const chestKey = chest.chestType as ChestType;
                        const remainingCount = chest.isComingSoon || !availableIndices[chestKey] ? 0 : availableIndices[chestKey].length;
                        return (
                            <ChestUI
                                key={chest.id}
                                {...chest}
                                remainingCount={remainingCount}
                                onOpen1={() => !chest.isComingSoon && handleOpenCards(1, chestKey)}
                                onOpen10={() => !chest.isComingsoon && handleOpenCards(4, chestKey)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Các Overlay được giữ ở ngoài cùng để che toàn bộ màn hình */}
            {showSingleOverlay && cardsForPopup.length > 0 && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <SingleCardOpener card={cardsForPopup[0]} onClose={() => handleCloseOverlay(1)} onOpenAgain={handleOpenAgain} />
                    </div>
                </div>
            )}
            {showFourOverlay && cardsForPopup.length > 0 && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <FourCardsOpener cards={cardsForPopup} onClose={() => handleCloseOverlay(4)} onOpenAgain={handleOpenAgain} />
                    </div>
                </div>
            )}
        </>
    );
}

export default VocabularyChestScreen;
