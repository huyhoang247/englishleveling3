// lat-the.tsx (Full Code with Refined Header CSS)

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';

// <<< THAY ĐỔI 1: IMPORT THÊM CÁC HÀM TỪ FIRESTORE >>>
import { db } from './firebase.js'; 
import { doc, setDoc, updateDoc, collection, getDocs, writeBatch, increment } from 'firebase/firestore';

import { defaultImageUrls } from './image-url.ts'; 
import ImagePreloader from './ImagePreloader.tsx'; 
import { defaultVocabulary } from './list-vocabulary.ts';

// ========================================================================
// === 1. CSS STYLES (Đã cập nhật Header) ================================
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

        /* === HEADER CỐ ĐỊNH - THIẾT KẾ LẠI TINH TẾ HƠN (ĐÃ CẬP NHẬT) === */
        .main-header {
            position: sticky;
            top: 0;
            left: 0;
            width: 100%;
            /* GIẢM PADDING: Làm header ngắn hơn */
            padding: 8px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: rgba(16, 22, 46, 0.75); /* Hơi đậm hơn một chút */
            backdrop-filter: blur(10px); /* Tăng hiệu ứng blur */
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 100;
            box-sizing: border-box;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .header-title {
            /* GIẢM FONT: Cân đối với header mới */
            font-size: 1.1rem;
            font-weight: 600;
            color: #e0e0e0;
            margin: 0;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .vocab-screen-close-btn {
            /* THAY ĐỔI KÍCH THƯỚC: Gọn gàng hơn, hình tròn */
            width: 36px; 
            height: 36px; 
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%; /* Bo tròn */
            cursor: pointer; 
            display: flex; 
            justify-content: center; 
            align-items: center;
            transition: all 0.2s ease;
            opacity: 0.85;
            /* Bỏ margin/padding cũ để dễ kiểm soát */
            margin: 0;
            padding: 0;
        }
        .vocab-screen-close-btn:hover { 
            transform: scale(1.1); 
            opacity: 1; 
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .vocab-screen-close-btn img {
            /* Giảm kích thước icon một chút */
            width: 20px; 
            height: 20px;
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

        /* === GIAO DIỆN RƯƠNG BÁU === */
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

        /* --- Overlay, Card & Loading Styles --- */
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

const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000, animation: 'fade-in 0.3s ease-out' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#e0e0e0', marginTop: '20px', fontSize: '1rem', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Loading...</p>
        </div>
    );
};

interface ImageCard { id: number; url: string; }

const Card = memo(({ cardData, isFlipping, flipDelay }: { cardData: ImageCard, isFlipping: boolean, flipDelay: number }) => (
    <div className={`card-container ${isFlipping ? 'is-flipping' : ''}`}>
        <div className="card-inner" style={{ animationDelay: `${flipDelay}ms` }}>
            <div className="card-face card-back">?</div>
            <div className="card-face card-front">
                <img src={cardData.url} alt={`Revealed content ${cardData.id}`} className="card-image-in-card" />
            </div>
        </div>
    </div>
));

const SingleCardOpener = ({ card, onClose, onOpenAgain }: { card: ImageCard, onClose: () => void, onOpenAgain: () => void }) => {
    const [isFlipping, setIsFlipping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setIsFlipping(true), 300);
        const t2 = setTimeout(() => setIsProcessing(false), 300 + 800);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [card]);

    const handleOpenAgain = () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsFlipping(false);
        setTimeout(() => { onOpenAgain(); }, 300);
    }

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-block', maxWidth: '250px', width: '60vw', marginBottom: '20px' }}>
                    <Card cardData={card} isFlipping={isFlipping} flipDelay={0} />
                </div>
            </div>
            <div className="overlay-footer">
                <button onClick={handleOpenAgain} className="footer-btn primary" disabled={isProcessing}>
                    {isProcessing ? 'Đang mở...' : 'Mở Lại'}
                </button>
                <button onClick={onClose} className="footer-btn">Đóng</button>
            </div>
        </>
    );
};

const FourCardsOpener = ({ cards, onClose, onOpenAgain }: { cards: ImageCard[], onClose: () => void, onOpenAgain: () => void }) => {
    const [startFlipping, setStartFlipping] = useState(false);
    const [phase, setPhase] = useState('DEALING');

    const startRound = useCallback(() => {
        setPhase('DEALING');
        setStartFlipping(false);
        const totalDealTime = 500 + 80 * (cards.length - 1);
        setTimeout(() => {
            setPhase('FLIPPING');
            setStartFlipping(true);
            const totalFlipTime = 800 + 200 * (cards.length - 1);
            setTimeout(() => setPhase('REVEALED'), totalFlipTime);
        }, totalDealTime);
    }, [cards.length]);

    useEffect(() => {
        if (cards.length > 0) startRound();
    }, [cards, startRound]);

    const handleOpenAgain = () => {
        if (phase !== 'REVEALED') return;
        onOpenAgain();
    };

    const btnProps = (() => {
        switch (phase) {
            case 'DEALING': return { text: 'Đang chia bài...', disabled: true };
            case 'FLIPPING': return { text: 'Đang lật...', disabled: true };
            case 'REVEALED': return { text: 'Mở Lại x4', disabled: false };
            default: return { text: '', disabled: true };
        }
    })();

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div className="four-card-grid-container">
                    {cards.map((card, index) => (
                        <div key={card.id} className={`card-wrapper dealt-in`} style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}>
                            <Card cardData={card} isFlipping={startFlipping} flipDelay={index * 200} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="overlay-footer">
                <button onClick={handleOpenAgain} className="footer-btn primary" disabled={btnProps.disabled}>{btnProps.text}</button>
                <button onClick={onClose} className="footer-btn">Đóng</button>
            </div>
        </>
    );
};

interface ChestUIProps { headerTitle: string; levelName: string | null; imageUrl: string; infoText: React.ReactNode; price1: number | string; price10: number | null; onOpen1: () => void; onOpen10: () => void; isComingSoon: boolean; remainingCount: number; }

const ChestUI: React.FC<ChestUIProps> = ({ headerTitle, levelName, imageUrl, infoText, price1, price10, onOpen1, onOpen10, isComingSoon, remainingCount }) => {
    return (
        <div className={`chest-ui-container ${isComingSoon ? 'is-coming-soon' : ''}`}>
            <header className="chest-header">{headerTitle}</header>
            <main className="chest-body">
                <div className="chest-top-section">
                    <div className="chest-level-info">
                        {levelName && !isComingSoon && <button className="chest-help-icon" title="Thông tin">?</button>}
                        {levelName && <span className="chest-level-name">{levelName}</span>}
                    </div>
                    
                    <p className="remaining-count-text">
                        {isComingSoon 
                            ? "Sắp ra mắt" 
                            : <>Còn lại: <span className="highlight-yellow">{remainingCount.toLocaleString()}</span> thẻ</>
                        }
                    </p>
                </div>
                
                <div className="chest-visual-row">
                    <img src={imageUrl} alt={headerTitle} className="chest-image" />
                    <div className="info-bubble">{infoText}</div>
                </div>
                                
                <div className="action-button-group" style={{ marginTop: 'auto', paddingTop: '15px' }}>
                    <button className="chest-button btn-get-1" onClick={onOpen1} disabled={isComingSoon || remainingCount < 1}>
                        <span>Mở x1</span>
                        {typeof price1 === 'number' && (
                           <span className="button-price"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="price icon" className="price-icon" />{price1}</span>
                        )}
                    </button>
                    {price10 !== null && (
                        <button className="chest-button btn-get-10" onClick={onOpen10} disabled={isComingSoon || remainingCount < 4}>
                            <span>Mở x4</span>
                            <span className="button-price"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="price icon" className="price-icon" />{price10}</span>
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

const CHEST_DEFINITIONS = {
    basic: { id: 'basic_vocab_chest', chestType: 'basic' as const, headerTitle: "Basic Vocabulary", levelName: "Cơ Bản", imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png", infoText: "2,400 từ vựng cơ bản. Nền tảng vững chắc cho việc học.", price1: 320, price10: 2980, isComingSoon: false, range: [0, 2399] as const, },
    elementary: { id: 'elementary_vocab_chest', chestType: 'elementary' as const, headerTitle: "Elementary Vocabulary", levelName: "Sơ Cấp", imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png", infoText: "1,700 từ vựng trình độ Sơ Cấp (A1-A2). Xây dựng vốn từ giao tiếp hàng ngày.", price1: 320, price10: 2980, isComingSoon: false, range: [2400, 4099] as const, },
    intermediate: { id: 'intermediate_vocab_chest', chestType: 'intermediate' as const, headerTitle: "Intermediate Vocabulary", levelName: "Trung Cấp", imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png", infoText: <>Mở rộng kiến thức chuyên sâu hơn.</>, price1: 320, price10: 2980, isComingSoon: false, range: [4100, 6499] as const, },
    advanced: { id: 'advanced_vocab_chest', chestType: 'advanced' as const, headerTitle: "Advanced Vocabulary", levelName: "Cao Cấp", imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2O2_38_14%20PM.png", infoText: <>Chinh phục các kỳ thi và sử dụng ngôn ngữ học thuật.</>, price1: 320, price10: 2980, isComingSoon: false, range: [6500, defaultVocabulary.length - 1] as const, },
    master: { id: 'master_vocab_chest', chestType: 'master' as const, headerTitle: "Master Vocabulary", levelName: "Thông Thạo", imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png", infoText: <>Từ vựng chuyên ngành và thành ngữ phức tạp để đạt trình độ bản xứ.</>, price1: 320, price10: 2980, isComingSoon: true, range: [null, null] as const, },
};

const CHEST_DATA = Object.values(CHEST_DEFINITIONS);

// ========================================================================
// === 3. COMPONENT CHÍNH (JSX không đổi) =================================
// ========================================================================

interface VocabularyChestScreenProps { onClose: () => void; currentUserId: string | null; onCoinReward: (amount: number) => void; onGemReward: (amount: number) => void; }

type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced';

const PRELOAD_POOL_SIZE = 20;

const VocabularyChestScreen: React.FC<VocabularyChestScreenProps> = ({ onClose, currentUserId, onCoinReward, onGemReward }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ basic: [], elementary: [], intermediate: [], advanced: [] });
    const [preloadPool, setPreloadPool] = useState<number[]>([]);
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    const [isProcessingClick, setIsProcessingClick] = useState(false);
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);

    useEffect(() => {
        const fetchOpenedItems = async () => {
            setIsLoading(true);
            try {
                const totalVocab = defaultVocabulary.length;
                const totalImages = defaultImageUrls.length;
                const totalItems = Math.min(totalVocab, totalImages);
                
                if (!currentUserId) {
                    setAvailableIndices({
                        basic: Array.from({ length: CHEST_DEFINITIONS.basic.range[1] - CHEST_DEFINITIONS.basic.range[0] + 1 }, (_, i) => CHEST_DEFINITIONS.basic.range[0] + i),
                        elementary: Array.from({ length: CHEST_DEFINITIONS.elementary.range[1] - CHEST_DEFINITIONS.elementary.range[0] + 1 }, (_, i) => CHEST_DEFINITIONS.elementary.range[0] + i),
                        intermediate: Array.from({ length: Math.max(0, CHEST_DEFINITIONS.intermediate.range[1] - CHEST_DEFINITIONS.intermediate.range[0] + 1) }, (_, i) => CHEST_DEFINITIONS.intermediate.range[0] + i),
                        advanced: CHEST_DEFINITIONS.advanced.isComingSoon ? [] : Array.from({ length: Math.max(0, (totalItems - 1) - CHEST_DEFINITIONS.advanced.range[0] + 1) }, (_, i) => CHEST_DEFINITIONS.advanced.range[0] + i)
                    });
                    return;
                }

                const userOpenedVocabColRef = collection(db, 'users', currentUserId, 'openedVocab');
                const querySnapshot = await getDocs(userOpenedVocabColRef);

                const openedIndices0Based = new Set<number>();
                querySnapshot.forEach(doc => {
                    openedIndices0Based.add(Number(doc.id) - 1);
                });
                
                const remainingForBasic: number[] = [];
                for (let i = CHEST_DEFINITIONS.basic.range[0]; i <= CHEST_DEFINITIONS.basic.range[1] && i < totalItems; i++) {
                    if (!openedIndices0Based.has(i)) remainingForBasic.push(i);
                }

                const remainingForElementary: number[] = [];
                for (let i = CHEST_DEFINITIONS.elementary.range[0]; i <= CHEST_DEFINITIONS.elementary.range[1] && i < totalItems; i++) {
                     if (!openedIndices0Based.has(i)) remainingForElementary.push(i);
                }
                
                const remainingForIntermediate: number[] = [];
                for (let i = CHEST_DEFINITIONS.intermediate.range[0]; i <= CHEST_DEFINITIONS.intermediate.range[1] && i < totalItems; i++) {
                     if (!openedIndices0Based.has(i)) remainingForIntermediate.push(i);
                }

                const remainingForAdvanced: number[] = [];
                if (!CHEST_DEFINITIONS.advanced.isComingSoon && CHEST_DEFINITIONS.advanced.range[0] !== null) {
                    for (let i = CHEST_DEFINITIONS.advanced.range[0]; i < totalItems; i++) {
                         if (!openedIndices0Based.has(i)) remainingForAdvanced.push(i);
                    }
                }

                setAvailableIndices({ 
                    basic: remainingForBasic, 
                    elementary: remainingForElementary,
                    intermediate: remainingForIntermediate,
                    advanced: remainingForAdvanced
                });
            } catch (error) {
                console.error("Error fetching user data from subcollection:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOpenedItems();
    }, [currentUserId]);

    useEffect(() => {
        const allAvailable = [...availableIndices.basic, ...availableIndices.elementary, ...availableIndices.intermediate, ...availableIndices.advanced];
        if (preloadPool.length < PRELOAD_POOL_SIZE && allAvailable.length > 0) {
            const needed = PRELOAD_POOL_SIZE - preloadPool.length;
            const indicesToAddToPool = allAvailable.filter(idx => !preloadPool.includes(idx)).slice(0, needed);
            if (indicesToAddToPool.length > 0) {
                setPreloadPool(prevPool => [...prevPool, ...indicesToAddToPool]);
            }
        }
    }, [availableIndices, preloadPool]);

    const urlsToPreload = useMemo(() => {
        return preloadPool.map(index => defaultImageUrls[index]);
    }, [preloadPool]);

    const updateUserProgressInFirestore = async (imageIds: number[], chestType: ChestType) => {
        if (!currentUserId || imageIds.length === 0) return;

        const newWordsData = imageIds
            .map(id => ({ id, word: defaultVocabulary[id - 1] }))
            .filter(item => !!item.word);

        if (newWordsData.length === 0) {
            console.warn("Không tìm thấy từ vựng hợp lệ cho các ID:", imageIds);
            return;
        }

        const userDocRef = doc(db, 'users', currentUserId);
        const userOpenedVocabColRef = collection(userDocRef, 'openedVocab');

        try {
            const batch = writeBatch(db);

            newWordsData.forEach(item => {
                const newVocabDocRef = doc(userOpenedVocabColRef, String(item.id));
                batch.set(newVocabDocRef, {
                    word: item.word,
                    collectedAt: new Date(),
                    chestType: chestType,
                });
            });

            batch.update(userDocRef, {
                totalVocabCollected: increment(newWordsData.length)
            });

            await batch.commit();
            console.log(`Batch write thành công cho ${newWordsData.length} từ mới.`);
        } catch (e) {
            const err = e as { code?: string };
            if (err.code === 'not-found') {
                console.log('User document not found, creating a new one...');
                try {
                   await setDoc(userDocRef, { totalVocabCollected: 0 }); 
                   await updateUserProgressInFirestore(imageIds, chestType); 
                } catch(creationError) {
                    console.error("Error creating user document:", creationError);
                }
            } else {
                 console.error("Lỗi khi ghi batch vào Firestore:", e);
            }
        }
    };
    
    const handleOpenCards = async (count: 1 | 4, chestType: ChestType) => {
        if (isProcessingClick) return;
        
        const targetPool = availableIndices[chestType];
        if (targetPool.length < count) {
            alert(`Không đủ thẻ trong rương này để mở (cần ${count}, còn ${targetPool.length}).`);
            return;
        }

        setIsProcessingClick(true);
        setLastOpenedChest({ count, type: chestType });

        let tempPool = [...targetPool];
        const selectedCards: ImageCard[] = [];
        const selectedOriginalIndices: number[] = [];

        for (let i = 0; i < count; i++) {
            const randomIndexInPool = Math.floor(Math.random() * tempPool.length);
            const originalImageIndex = tempPool[randomIndexInPool];
            selectedCards.push({ id: originalImageIndex + 1, url: defaultImageUrls[originalImageIndex] });
            selectedOriginalIndices.push(originalImageIndex);
            tempPool.splice(randomIndexInPool, 1);
        }

        const imageIdsToSave = selectedOriginalIndices.map(index => index + 1);
        await updateUserProgressInFirestore(imageIdsToSave, chestType);

        setAvailableIndices(prev => ({ ...prev, [chestType]: prev[chestType].filter(idx => !selectedOriginalIndices.includes(idx)) }));
        setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
        
        setCardsForPopup(selectedCards);
        if (count === 1) setShowSingleOverlay(true);
        else setShowFourOverlay(true);
        
        setTimeout(() => setIsProcessingClick(false), 500); 
    };
    
    const handleCloseOverlay = (openedCount: number) => {
        setShowSingleOverlay(false);
        setShowFourOverlay(false);
        setCardsForPopup([]);
        onCoinReward(10 * openedCount);
        onGemReward(1 * openedCount);
    };
    
    const handleOpenAgain = () => {
        if (lastOpenedChest) {
            handleOpenCards(lastOpenedChest.count, lastOpenedChest.type);
        }
    };

    if (isLoading) {
        return <LoadingOverlay isVisible={true} />;
    }
    
    const totalAvailable = availableIndices.basic.length + availableIndices.elementary.length + availableIndices.intermediate.length + availableIndices.advanced.length;

    return (
        <>
            <GlobalStyles />
            <ImagePreloader imageUrls={urlsToPreload} />
            
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
