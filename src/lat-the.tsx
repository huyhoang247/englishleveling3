// --- START OF FILE: lat-the.tsx (FULL CODE - REFACTORED & SELF-CONTAINED) ---

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { db } from './firebase.js'; 
import { collection, getDocs } from 'firebase/firestore';

// -- BƯỚC 1: IMPORT TÀI NGUYÊN TẬP TRUNG --
import { uiAssets, treasureAssets } from './game-assets.ts'; 
import { defaultImageUrls } from './voca-data/image-url.ts'; 
import ImagePreloader from './ImagePreloader.tsx'; 
import { defaultVocabulary } from './voca-data/list-vocabulary.ts';
import CoinDisplay from './ui/display/coin-display.tsx';
import CardCapacityDisplay from './ui/display/card-capacity-display.tsx'; // TÁCH COMPONENT
// --- REFACTORED: Import service để tự quản lý logic ---
import { processVocabularyChestOpening } from './gameDataService.ts'; 

// ========================================================================
// === 1. COMPONENT CSS ĐÃ ĐƯỢỢC ĐÓNG GÓI ================================
// ========================================================================
const ScopedStyles = () => (
    <style>{`
        /* --- LỚP GỐC: Thiết lập môi trường độc lập --- */
        .vocabulary-chest-root {
            /* Kích thước & Vị trí */
            width: 100%;
            height: 100%;
            position: absolute; /* Quan trọng để tách biệt khỏi luồng layout cha */
            top: 0;
            left: 0;
            
            /* Nền & Giao diện */
            background-color: #0a0a14;
            background-image: radial-gradient(circle at center, #16213e, #0a0a14);
            color: #e0e0e0;
            font-family: 'Roboto', sans-serif;
            
            /* Bố cục nội bộ */
            display: flex;
            flex-direction: column;
            justify-content: flex-start; /* Header ở trên, content ở dưới */
            align-items: center;
            
            /* Đảm bảo nó che phủ mọi thứ bên dưới */
            z-index: 100; 
            overflow: hidden; /* Ngăn cuộn ở cấp cao nhất của component */
        }
        
        /* Tiền tố hóa TẤT CẢ các style khác với .vocabulary-chest-root */
        
        /* === HEADER (ĐÃ CẬP NHẬT) === */
        .vocabulary-chest-root .main-header {
            position: sticky;
            top: 0;
            left: 0;
            width: 100%;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between; /* Canh lề các mục */
            align-items: center;
            background-color: rgba(16, 22, 46, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1010; /* Tăng z-index để nổi lên trên overlay */
            box-sizing: border-box;
            flex-shrink: 0; 
        }
        
        /* CSS CHO NÚT HOME MỚI (Dựa trên thanh-tuu.tsx) */
        .vocabulary-chest-root .vocab-screen-home-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 8px;
            background-color: rgba(30, 41, 59, 0.8); /* slate-800/80 */
            border: 1px solid rgb(51, 65, 85); /* slate-700 */
            transition: background-color 0.2s ease, opacity 0.3s ease, visibility 0.3s;
            cursor: pointer;
            color: #cbd5e1; /* slate-300 */
        }
        .vocabulary-chest-root .vocab-screen-home-btn:hover {
            background-color: rgb(51, 65, 85); /* slate-700 */
        }
        .vocabulary-chest-root .vocab-screen-home-btn.is-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        .vocabulary-chest-root .vocab-screen-home-btn svg {
            width: 20px;
            height: 20px;
        }
        .vocabulary-chest-root .vocab-screen-home-btn span {
            font-size: 0.875rem; /* text-sm */
            font-weight: 600; /* font-semibold */
        }
        /* Ẩn chữ trên màn hình nhỏ, tương tự sm:inline */
        @media (max-width: 640px) {
            .vocabulary-chest-root .vocab-screen-home-btn span {
                display: none;
            }
            .vocabulary-chest-root .header-right-group {
                gap: 8px;
            }
        }
        
        /* === CONTAINER RƯƠNG === */
        .vocabulary-chest-root .chest-gallery-container {
            display: flex; flex-wrap: wrap; justify-content: center;
            gap: 30px; width: 100%; max-width: 1300px; 
            padding: 20px 20px 100px; box-sizing: border-box;
            flex-grow: 1;      /* Chiếm hết không gian còn lại */
            overflow-y: auto;  /* Tạo thanh cuộn cho riêng nó */
        }

        /* Tùy chỉnh thanh cuộn */
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar { width: 8px; }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar-track { background: rgba(10, 10, 20, 0.5); border-radius: 4px; }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar-thumb { background-color: #4a5588; border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar-thumb:hover { background-color: #6366f1; }

        /* === GIAO DIỆN RƯƠNG BÁU === */
        .vocabulary-chest-root .chest-ui-container {
            width: 100%; max-width: 380px; min-width: 300px;
            background-color: #1a1f36; border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(76, 89, 186, 0.2);
            overflow: hidden; display: flex; flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
            position: relative; border: none;
        }
        .vocabulary-chest-root .chest-ui-container.is-coming-soon { filter: grayscale(80%); opacity: 0.7; }
        .vocabulary-chest-root .chest-ui-container::before {
            content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.4), rgba(49, 46, 129, 0.3));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .vocabulary-chest-root .chest-ui-container:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(129, 140, 248, 0.3); }
        .vocabulary-chest-root .chest-header { padding: 12px 20px; background-color: rgba(42, 49, 78, 0.7); font-size: 0.9rem; font-weight: 600; color: #c7d2fe; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .vocabulary-chest-root .chest-body { background: linear-gradient(170deg, #43335b, #2c2240); padding: 20px; position: relative; flex-grow: 1; display: flex; flex-direction: column; align-items: center; overflow: hidden; }
        .vocabulary-chest-root .chest-body::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('data:image/svg+xml,...'); opacity: 0.1; z-index: 0; }
        .vocabulary-chest-root .chest-body > * { position: relative; z-index: 1; }
        .vocabulary-chest-root .chest-top-section { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 20px; }
        .vocabulary-chest-root .chest-level-info { display: flex; align-items: center; gap: 8px; }
        .vocabulary-chest-root .chest-level-name { background-color: rgba(0, 0, 0, 0.25); color: #c7d2fe; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(129, 140, 248, 0.4); }
        .vocabulary-chest-root .chest-help-icon { width: 24px; height: 24px; background-color: rgba(0, 0, 0, 0.25); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: 50%; color: #c7d2fe; font-weight: bold; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s; padding: 0; }
        .vocabulary-chest-root .chest-help-icon:hover { background-color: rgba(0, 0, 0, 0.4); }
        .vocabulary-chest-root .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 20px; }
        .vocabulary-chest-root .chest-image { flex: 1; min-width: 0; height: auto; }
        .vocabulary-chest-root .info-bubble { flex: 2; background-color: rgba(10, 10, 20, 0.6); color: #d1d5db; padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.85rem; text-align: left; }
        .vocabulary-chest-root .remaining-count-text { color: #c5b8d9; font-weight: 500; font-size: 0.85rem; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        .vocabulary-chest-root .highlight-yellow { color: #facc15; font-weight: bold; }
        .vocabulary-chest-root .action-button-group { display: flex; gap: 10px; width: 100%; }
        .vocabulary-chest-root .chest-button { flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s; color: #ffffff; font-weight: 700; font-size: 0.95rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vocabulary-chest-root .chest-button:disabled { cursor: not-allowed; background: linear-gradient(to top, #52525b, #71717a); }
        .vocabulary-chest-root .chest-button:active:not(:disabled) { transform: translateY(2px); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.25); }
        .vocabulary-chest-root .btn-get-1 { background: linear-gradient(to top, #8b5cf6, #c084fc); }
        .vocabulary-chest-root .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); }
        .vocabulary-chest-root .button-price { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.85rem; color: white; font-weight: 600; background-color: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px; text-shadow: none; }
        .vocabulary-chest-root .price-icon { width: 16px; height: 16px; }

        /* --- Overlay, Card & Loading Styles (Cũng cần được scope) --- */
        @keyframes vocabulary-chest-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vocabulary-chest-spin { to { transform: rotate(360deg); } }
        @keyframes vocabulary-chest-flip-in { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
        @keyframes vocabulary-chest-deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        @keyframes vocabulary-chest-pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .vocabulary-chest-root .animate-pulse-fast {
            animation: vocabulary-chest-pulse-fast 1s infinite;
        }

        .vocabulary-chest-root .card-opening-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(10, 10, 20, 0.95);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: vocabulary-chest-fade-in 0.5s ease;
            overflow: hidden;
            padding: 70px 15px 80px;
            box-sizing: border-box;
        }
        .vocabulary-chest-root .overlay-content { width: 100%; max-width: 900px; }
        .vocabulary-chest-root .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
        .vocabulary-chest-root .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .vocabulary-chest-root .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .vocabulary-chest-root .footer-btn.primary { border-color: #a78bfa; color: #a78bfa; }
        .vocabulary-chest-root .footer-btn.primary:hover { background-color: #a78bfa; color: #1e293b; }
        .vocabulary-chest-root .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; background-color: transparent; }
        
        .vocabulary-chest-root .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .vocabulary-chest-root .card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform; }
        .vocabulary-chest-root .card-container.is-flipping .card-inner { animation-name: vocabulary-chest-flip-in; animation-duration: 0.8s; animation-fill-mode: forwards; animation-timing-function: ease-in-out; }
        
        .vocabulary-chest-root .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .vocabulary-chest-root .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #a78bfa; text-shadow: 0 0 10px #a78bfa; }
        .vocabulary-chest-root .card-front { transform: rotateY(180deg); padding: 6px; box-sizing: border-box; background: rgba(42, 49, 78, 0.85); border: 1px solid rgba(255, 255, 255, 0.18); }
        .vocabulary-chest-root .card-image-in-card { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
        .vocabulary-chest-root .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; justify-content: center; margin: 0 auto; grid-template-columns: repeat(2, 1fr); }
        .vocabulary-chest-root .card-wrapper.dealt-in { animation: vocabulary-chest-deal-in 0.5s ease-out forwards; }

        /* Loading Overlay cũng cần được scope */
        .vocabulary-chest-root .loading-spinner-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 2000; animation: vocabulary-chest-fade-in 0.3s ease-out; }
        .vocabulary-chest-root .loading-spinner { width: 50px; height: 50px; border: 5px solid rgba(255, 255, 255, 0.2); border-top-color: #a78bfa; border-radius: 50%; animation: vocabulary-chest-spin 1s linear infinite; }
        .vocabulary-chest-root .loading-text { color: #e0e0e0; margin-top: 20px; font-size: 1rem; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    `}
    </style>
);


// ========================================================================
// === 2. CÁC COMPONENT CON VÀ DATA =======================================
// ========================================================================

interface GemIconProps { size?: number; color?: string; className?: string; [key: string]: any; }
const GemIcon: React.FC<GemIconProps> = ({ size = 24, color = 'currentColor', className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
      <img src={uiAssets.gemIcon} alt="Tourmaline Gem Icon" className="w-full h-full object-contain" />
    </div>
  );
};
const HomeIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
);
// CardCapacityDisplay component has been moved to its own file.
const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;
    return ( <div className="loading-spinner-container"><div className="loading-spinner"></div><p className="loading-text">Loading...</p></div> );
};
interface ImageCard { id: number; url: string; }
const Card = memo(({ cardData, isFlipping, flipDelay }: { cardData: ImageCard, isFlipping: boolean, flipDelay: number }) => (
    <div className={`card-container ${isFlipping ? 'is-flipping' : ''}`}>
        <div className="card-inner" style={{ animationDelay: `${flipDelay}ms` }}>
            <div className="card-face card-back">?</div>
            <div className="card-face card-front"><img src={cardData.url} alt={`Revealed content ${cardData.id}`} className="card-image-in-card" /></div>
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
    const handleOpenAgain = () => { if (isProcessing) return; setIsProcessing(true); setIsFlipping(false); setTimeout(() => { onOpenAgain(); }, 300); }
    return (
        <>
            <div style={{ textAlign: 'center' }}><div style={{ display: 'inline-block', maxWidth: '250px', width: '60vw' }}><Card cardData={card} isFlipping={isFlipping} flipDelay={0} /></div></div>
            <div className="overlay-footer"><button onClick={handleOpenAgain} className="footer-btn primary" disabled={isProcessing}>{isProcessing ? 'Đang mở...' : 'Mở Lại'}</button><button onClick={onClose} className="footer-btn">Đóng</button></div>
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
    useEffect(() => { if (cards.length > 0) startRound(); }, [cards, startRound]);
    const handleOpenAgain = () => { if (phase !== 'REVEALED') return; onOpenAgain(); };
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
            <div style={{ textAlign: 'center' }}><div className="four-card-grid-container">{cards.map((card, index) => (<div key={card.id} className={`card-wrapper dealt-in`} style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}><Card cardData={card} isFlipping={startFlipping} flipDelay={index * 200} /></div>))}</div></div>
            <div className="overlay-footer"><button onClick={handleOpenAgain} className="footer-btn primary" disabled={btnProps.disabled}>{btnProps.text}</button><button onClick={onClose} className="footer-btn">Đóng</button></div>
        </>
    );
};
interface ChestUIProps { headerTitle: string; levelName: string | null; imageUrl: string; infoText: React.ReactNode; price1: number | string; price10: number | null; priceIconUrl: string; onOpen1: () => void; onOpen10: () => void; isComingSoon: boolean; remainingCount: number; }
const ChestUI: React.FC<ChestUIProps> = ({ headerTitle, levelName, imageUrl, infoText, price1, price10, priceIconUrl, onOpen1, onOpen10, isComingSoon, remainingCount }) => {
    return (
        <div className={`chest-ui-container ${isComingSoon ? 'is-coming-soon' : ''}`}>
            <header className="chest-header">{headerTitle}</header>
            <main className="chest-body">
                <div className="chest-top-section"><div className="chest-level-info">{levelName && !isComingSoon && <button className="chest-help-icon" title="Thông tin">?</button>}{levelName && <span className="chest-level-name">{levelName}</span>}</div><p className="remaining-count-text">{isComingSoon ? "Sắp ra mắt" : <>Còn lại: <span className="highlight-yellow">{remainingCount.toLocaleString()}</span> thẻ</>}</p></div>
                <div className="chest-visual-row"><img src={imageUrl} alt={headerTitle} className="chest-image" /><div className="info-bubble">{infoText}</div></div>
                <div className="action-button-group" style={{ marginTop: 'auto', paddingTop: '15px' }}><button className="chest-button btn-get-1" onClick={onOpen1} disabled={isComingSoon || remainingCount < 1}><span>Mở x1</span>{typeof price1 === 'number' && (<span className="button-price"><img src={priceIconUrl} alt="price icon" className="price-icon" />{price1.toLocaleString()}</span>)}</button>{price10 !== null && (<button className="chest-button btn-get-10" onClick={onOpen10} disabled={isComingSoon || remainingCount < 4}><span>Mở x4</span><span className="button-price"><img src={priceIconUrl} alt="price icon" className="price-icon" />{price10.toLocaleString()}</span></button>)}</div>
            </main>
        </div>
    );
};
const CHEST_DEFINITIONS = { basic: { id: 'basic_vocab_chest', currency: 'gold' as const, chestType: 'basic' as const, headerTitle: "Basic Vocabulary", levelName: "Cơ Bản", imageUrl: treasureAssets.chestBasic, infoText: "2,400 từ vựng cơ bản. Nền tảng vững chắc cho việc học.", price1: 320, price10: 1200, isComingSoon: false, range: [0, 2399] as const, }, elementary: { id: 'elementary_vocab_chest', currency: 'gem' as const, chestType: 'elementary' as const, headerTitle: "Elementary Vocabulary", levelName: "Sơ Cấp", imageUrl: treasureAssets.chestElementary, infoText: "1,700 từ vựng trình độ Sơ Cấp (A1-A2). Xây dựng vốn từ giao tiếp hàng ngày.", price1: 10, price10: 40, isComingSoon: false, range: [2400, 4099] as const, }, intermediate: { id: 'intermediate_vocab_chest', currency: 'gem' as const, chestType: 'intermediate' as const, headerTitle: "Intermediate Vocabulary", levelName: "Trung Cấp", imageUrl: treasureAssets.chestIntermediate, infoText: <>Mở rộng kiến thức chuyên sâu hơn.</>, price1: 10, price10: 40, isComingSoon: false, range: [4100, 6499] as const, }, advanced: { id: 'advanced_vocab_chest', currency: 'gem' as const, chestType: 'advanced' as const, headerTitle: "Advanced Vocabulary", levelName: "Cao Cấp", imageUrl: treasureAssets.chestAdvanced, infoText: <>Chinh phục các kỳ thi và sử dụng ngôn ngữ học thuật.</>, price1: 10, price10: 40, isComingSoon: false, range: [6500, defaultVocabulary.length - 1] as const, }, master: { id: 'master_vocab_chest', currency: 'gem' as const, chestType: 'master' as const, headerTitle: "Master Vocabulary", levelName: "Thông Thạo", imageUrl: treasureAssets.chestMaster, infoText: <>Từ vựng chuyên ngành và thành ngữ phức tạp để đạt trình độ bản xứ.</>, price1: 0, price10: 0, isComingSoon: true, range: [null, null] as const, }, };
const CHEST_DATA = Object.values(CHEST_DEFINITIONS);

// ========================================================================
// === 3. COMPONENT CHÍNH (ĐÃ TÁI CẤU TRÚC) ===============================
// ========================================================================
interface VocabularyChestScreenProps { onClose: () => void; currentUserId: string; initialCoins: number; initialGems: number; initialTotalVocab: number; initialCardCapacity: number; onDataChanged: (updates: { coinsChange?: number; gemsChange?: number; vocabAdded?: number }) => void; }
type ChestType = 'basic' | 'elementary' | 'intermediate' | 'advanced' | 'master';
const PRELOAD_POOL_SIZE = 20;
const GEM_REWARD_PER_CARD = 1;

const VocabularyChestScreen: React.FC<VocabularyChestScreenProps> = ({ onClose, currentUserId, initialCoins, initialGems, initialTotalVocab, initialCardCapacity, onDataChanged }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [availableIndices, setAvailableIndices] = useState<Record<ChestType, number[]>>({ basic: [], elementary: [], intermediate: [], advanced: [], master: [] });
    const [preloadPool, setPreloadPool] = useState<number[]>([]);
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);
    const [isProcessingClick, setIsProcessingClick] = useState(false);
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType, price: number } | null>(null);
    const [localCoins, setLocalCoins] = useState(initialCoins);
    const [localGems, setLocalGems] = useState(initialGems);
    const [localTotalVocab, setLocalTotalVocab] = useState(initialTotalVocab);
    
    useEffect(() => { setLocalCoins(initialCoins); setLocalGems(initialGems); setLocalTotalVocab(initialTotalVocab); }, [initialCoins, initialGems, initialTotalVocab, currentUserId]);

    useEffect(() => {
        const fetchOpenedItems = async () => {
            setIsLoading(true);
            try {
                const totalItems = Math.min(defaultVocabulary.length, defaultImageUrls.length);
                const allIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                for (const key in CHEST_DEFINITIONS) {
                    const chest = CHEST_DEFINITIONS[key as ChestType];
                    if (chest.isComingSoon || chest.range[0] === null) continue;
                    const endRange = chest.range[1] ?? (totalItems - 1);
                    for (let i = chest.range[0]!; i <= endRange && i < totalItems; i++) {
                        allIndices[key as ChestType].push(i);
                    }
                }
                if (!currentUserId) {
                    setAvailableIndices(allIndices);
                    return;
                }
                const userOpenedVocabColRef = collection(db, 'users', currentUserId, 'openedVocab');
                const querySnapshot = await getDocs(userOpenedVocabColRef);
                const openedIndices = new Set<number>();
                querySnapshot.forEach(doc => { openedIndices.add(Number(doc.id) - 1); });
                const remainingIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                for (const key in allIndices) {
                    const chestType = key as ChestType;
                    remainingIndices[chestType] = allIndices[chestType].filter(index => !openedIndices.has(index));
                }
                setAvailableIndices(remainingIndices);
            } catch (error) {
                console.error("Error fetching user data from subcollection:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOpenedItems();
    }, [currentUserId]);

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

    const handleOpenCards = async (count: 1 | 4, chestType: ChestType) => {
        if (isProcessingClick || !currentUserId) return;
        const chestDef = CHEST_DEFINITIONS[chestType];
        if (!chestDef || chestDef.isComingSoon) return;
        const price = count === 1 ? chestDef.price1 : (chestDef.price10 || 0);
        if (localTotalVocab + count > initialCardCapacity) { alert(`Kho thẻ đã đầy! (${localTotalVocab}/${initialCardCapacity}).\nVui lòng nâng cấp sức chứa để tiếp tục.`); return; }
        if (chestDef.currency === 'gold' && localCoins < price) { alert(`Bạn không đủ vàng! Cần ${price.toLocaleString()}, bạn đang có ${localCoins.toLocaleString()}.`); return; }
        if (chestDef.currency === 'gem' && localGems < price) { alert(`Bạn không đủ gem! Cần ${price.toLocaleString()}, bạn đang có ${localGems.toLocaleString()}.`); return; }
        const targetPool = availableIndices[chestType];
        if (targetPool.length < count) { alert(`Không đủ thẻ trong rương này để mở (cần ${count}, còn ${targetPool.length}).`); return; }

        setIsProcessingClick(true);
        setLastOpenedChest({ count, type: chestType, price }); 
        
        try {
            let tempPool = [...targetPool];
            const selectedOriginalIndices: number[] = [];
            const selectedCardsForPopup: ImageCard[] = [];
            for (let i = 0; i < count; i++) {
                const randomIndex = Math.floor(Math.random() * tempPool.length);
                const originalImageIndex = tempPool[randomIndex];
                selectedOriginalIndices.push(originalImageIndex);
                selectedCardsForPopup.push({ id: originalImageIndex + 1, url: defaultImageUrls[originalImageIndex] });
                tempPool.splice(randomIndex, 1);
            }
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
            onDataChanged({ coinsChange: newCoins - initialCoins, gemsChange: newGems - initialGems, vocabAdded: newTotalVocab - initialTotalVocab });
            setAvailableIndices(prev => ({ ...prev, [chestType]: tempPool }));
            setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
            setCardsForPopup(selectedCardsForPopup);
            if (count === 1) setShowSingleOverlay(true); else setShowFourOverlay(true);

        } catch (error) {
            console.error("Lỗi khi xử lý mở thẻ qua service:", error);
            alert(`Đã xảy ra lỗi. Giao dịch đã bị hủy.\nChi tiết: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setTimeout(() => setIsProcessingClick(false), 500); 
        }
    };
    
    const handleCloseOverlay = () => { setShowSingleOverlay(false); setShowFourOverlay(false); setCardsForPopup([]); };
    const handleOpenAgain = () => { if (lastOpenedChest) { handleOpenCards(lastOpenedChest.count, lastOpenedChest.type); } };
    
    return (
        <div className="vocabulary-chest-root">
            <ScopedStyles />
            <ImagePreloader imageUrls={urlsToPreload} />
            {isLoading && <LoadingOverlay isVisible={true} />}
            {!isLoading && (
                 <header className="main-header">
                    <button onClick={onClose} className={`vocab-screen-home-btn ${showSingleOverlay || showFourOverlay ? 'is-hidden' : ''}`} title="Quay lại Trang Chính">
                        <HomeIcon /><span>Trang Chính</span>
                    </button>
                    <div className="header-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CardCapacityDisplay current={localTotalVocab} max={initialCardCapacity} />
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
                            <div className="relative mr-0.5 flex items-center justify-center"><GemIcon size={16} color="#a78bfa" className="relative z-20" /></div>
                            <div className="font-bold text-purple-200 text-xs tracking-wide">{localGems.toLocaleString()}</div>
                            <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse"><span className="text-white font-bold text-xs">+</span></div>
                            <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                            <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                        </div>
                        <CoinDisplay displayedCoins={localCoins} isStatsFullscreen={false} />
                    </div>
                </header>
            )}
            {!showSingleOverlay && !showFourOverlay && !isLoading && (
                <div className="chest-gallery-container">
                    {CHEST_DATA.map((chest) => {
                        const remainingCount = availableIndices[chest.chestType]?.length ?? 0;
                        const priceIcon = chest.currency === 'gem' ? uiAssets.gemIcon : uiAssets.priceIcon;
                        return (
                            <ChestUI
                                key={chest.id}
                                {...chest}
                                priceIconUrl={priceIcon}
                                remainingCount={remainingCount}
                                onOpen1={() => handleOpenCards(1, chest.chestType)}
                                onOpen10={() => handleOpenCards(4, chest.chestType)}
                            />
                        );
                    })}
                </div>
            )}
            {showSingleOverlay && cardsForPopup.length > 0 && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <SingleCardOpener card={cardsForPopup[0]} onClose={handleCloseOverlay} onOpenAgain={handleOpenAgain} />
                    </div>
                </div>
            )}
            {showFourOverlay && cardsForPopup.length > 0 && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <FourCardsOpener cards={cardsForPopup} onClose={handleCloseOverlay} onOpenAgain={handleOpenAgain} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default VocabularyChestScreen;
