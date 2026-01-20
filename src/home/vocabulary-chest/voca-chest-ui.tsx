// --- START OF FILE voca-chest-ui.tsx ---

import React, { useState, useEffect, useCallback, memo } from 'react';
import { uiAssets, treasureAssets } from '../../game-assets.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
import ImagePreloader from '../../ImagePreloader.tsx';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import CardCapacityDisplay from '../../ui/display/card-capacity-display.tsx';
import GemDisplay from '../../ui/display/gem-display.tsx';
import VocabularyChestLoadingSkeleton from './voca-chest-loading.tsx';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import { VocabularyChestProvider, useVocabularyChest } from './voca-chest-context.tsx';

// ========================================================================
// === 0. CÁC HẰNG SỐ & ĐỊNH NGHĨA RƯƠNG ==================================
// ========================================================================

const LEGENDARY_CHEST_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/chest-legendary.webp";

export const CHEST_DEFINITIONS = {
    basic: { 
        id: 'basic_vocab_chest', 
        currency: 'gold' as const, 
        chestType: 'basic' as const, 
        headerTitle: "Basic Vocabulary", 
        cefr: "A1", 
        levelName: "Cơ Bản", 
        imageUrl: treasureAssets.chestBasic, 
        infoText: "2,400 từ vựng cơ bản. Nền tảng vững chắc cho việc học.", 
        price1: 320, 
        price10: 1200, 
        isComingSoon: false, 
        range: [0, 2399] as const 
    },
    elementary: { 
        id: 'elementary_vocab_chest', 
        currency: 'gem' as const, 
        chestType: 'elementary' as const, 
        headerTitle: "Elementary Vocabulary", 
        cefr: "A2", 
        levelName: "Sơ Cấp", 
        imageUrl: treasureAssets.chestElementary, 
        infoText: "1,700 từ vựng trình độ Sơ Cấp (A1-A2). Xây dựng vốn từ giao tiếp hàng ngày.", 
        price1: 10, 
        price10: 40, 
        isComingSoon: false, 
        range: [2400, 4099] as const 
    },
    intermediate: { 
        id: 'intermediate_vocab_chest', 
        currency: 'gem' as const, 
        chestType: 'intermediate' as const, 
        headerTitle: "Intermediate Vocabulary", 
        cefr: "B1", 
        levelName: "Trung Cấp", 
        imageUrl: treasureAssets.chestIntermediate, 
        infoText: <>Mở rộng kiến thức chuyên sâu hơn.</>, 
        price1: 10, 
        price10: 40, 
        isComingSoon: false, 
        range: [4100, 6499] as const 
    },
    advanced: { 
        id: 'advanced_vocab_chest', 
        currency: 'gem' as const, 
        chestType: 'advanced' as const, 
        headerTitle: "Advanced Vocabulary", 
        cefr: "B2", 
        levelName: "Cao Cấp", 
        imageUrl: treasureAssets.chestAdvanced, 
        infoText: <>Chinh phục các kỳ thi và sử dụng ngôn ngữ học thuật.</>, 
        price1: 10, 
        price10: 40, 
        isComingSoon: false, 
        range: [6500, defaultVocabulary.length - 1] as const 
    },
    master: { 
        id: 'master_vocab_chest', 
        currency: 'gem' as const, 
        chestType: 'master' as const, 
        headerTitle: "Master Vocabulary", 
        cefr: "C1", 
        levelName: "Thông Thạo", 
        imageUrl: treasureAssets.chestMaster, 
        infoText: <>Từ vựng chuyên ngành và thành ngữ phức tạp để đạt trình độ bản xứ.</>, 
        price1: 0, 
        price10: 0, 
        isComingSoon: true, 
        range: [null, null] as const 
    },
    legendary: { 
        id: 'legendary_vocab_chest', 
        currency: 'gem' as const, 
        chestType: 'legendary' as const, 
        headerTitle: "Legendary Vocabulary", 
        cefr: "C2", 
        levelName: "Huyền Thoại", 
        imageUrl: LEGENDARY_CHEST_URL, 
        infoText: <>Đỉnh cao ngôn ngữ. Đạt đến giới hạn của một huyền thoại ngôn ngữ học.</>, 
        price1: 0, 
        price10: 0, 
        isComingSoon: true, 
        range: [null, null] as const 
    },
};

const CHEST_DATA = Object.values(CHEST_DEFINITIONS);

// ========================================================================
// === 1. COMPONENT CSS (SCOPED STYLES) ===================================
// ========================================================================
const ScopedStyles = () => (
    <style>{`
        /* --- LAYOUT CHÍNH --- */
        .vocabulary-chest-root { width: 100%; height: 100%; position: absolute; top: 0; left: 0; background-color: #0a0a14; background-image: url('https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-voca-chest.webp'); background-size: cover; background-position: center; background-repeat: no-repeat; color: #e0e0e0; font-family: 'Roboto', sans-serif; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; z-index: 100; overflow: hidden; }
        .vocabulary-chest-root::before { content: ''; position: absolute; inset: 0; background-color: #0a0a14; opacity: 0.8; z-index: 0; pointer-events: none; }
        
        /* --- BUTTON HOME --- */
        .vocabulary-chest-root .vocab-screen-home-btn { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; background-color: rgba(30, 41, 59, 0.8); border: 1px solid rgb(51, 65, 85); transition: background-color 0.2s ease, opacity 0.3s ease, visibility 0.3s; cursor: pointer; color: #cbd5e1; }
        .vocabulary-chest-root .vocab-screen-home-btn:hover { background-color: rgb(51, 65, 85); }
        .vocabulary-chest-root .vocab-screen-home-btn.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .vocabulary-chest-root .vocab-screen-home-btn svg { width: 20px; height: 20px; }
        .vocabulary-chest-root .vocab-screen-home-btn span { font-size: 0.875rem; font-weight: 600; }
        @media (max-width: 640px) { .vocabulary-chest-root .vocab-screen-home-btn span { display: none; } .vocabulary-chest-root .header-right-group { gap: 8px; } }
        
        /* --- CONTAINER DANH SÁCH RƯƠNG --- */
        .vocabulary-chest-root .chest-gallery-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; width: 100%; max-width: 1300px; padding: 20px 20px 100px; box-sizing: border-box; flex-grow: 1; overflow-y: auto; -ms-overflow-style: none; scrollbar-width: none; }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar { display: none; }
        
        /* --- CHEST CARD (KHUNG RƯƠNG) --- */
        .vocabulary-chest-root .chest-ui-container { width: 100%; max-width: 380px; min-width: 300px; background-color: rgba(26, 31, 54, 0.5); border-radius: 16px; border: 1px solid rgba(129, 140, 248, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(76, 89, 186, 0.1); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.3s ease; position: relative; }
        .vocabulary-chest-root .chest-ui-container.is-coming-soon { filter: grayscale(80%); opacity: 0.7; }
        .vocabulary-chest-root .chest-ui-container::before { content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px; background: linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(49, 46, 129, 0.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .vocabulary-chest-root .chest-ui-container:hover:not(.is-processing) { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(129, 140, 248, 0.2); }
        
        /* --- HEADER RƯƠNG --- */
        .vocabulary-chest-root .chest-header { padding: 12px 10px; background-color: rgba(42, 49, 78, 0.4); font-size: 0.9rem; font-weight: 600; color: #c7d2fe; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; display: flex; justify-content: center; align-items: center; gap: 8px; }
        .vocabulary-chest-root .cefr-tag { font-size: 0.7rem; font-weight: 700; padding: 3px 6px; border-radius: 4px; color: rgba(255, 255, 255, 0.9); background-color: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.15); vertical-align: middle; display: inline-block; }

        /* --- BODY RƯƠNG --- */
        .vocabulary-chest-root .chest-body { background: linear-gradient(170deg, rgba(67, 51, 91, 0.5), rgba(44, 34, 64, 0.6)); padding: 20px; position: relative; flex-grow: 1; display: flex; flex-direction: column; align-items: center; overflow: hidden; }
        .vocabulary-chest-root .chest-body::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; z-index: 0; }
        .vocabulary-chest-root .chest-body > * { position: relative; z-index: 1; }
        
        .vocabulary-chest-root .chest-top-section { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 20px; }
        .vocabulary-chest-root .chest-level-info { display: flex; align-items: center; gap: 8px; }
        .vocabulary-chest-root .chest-level-name { background-color: rgba(0, 0, 0, 0.3); color: #c7d2fe; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(129, 140, 248, 0.4); }
        .vocabulary-chest-root .chest-help-icon { width: 24px; height: 24px; background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: 50%; color: #c7d2fe; font-weight: bold; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s; padding: 0; }
        .vocabulary-chest-root .chest-help-icon:hover { background-color: rgba(0, 0, 0, 0.5); }
        
        .vocabulary-chest-root .remaining-count-container { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
        
        /* --- REMAINING COUNT TEXT --- */
        .vocabulary-chest-root .remaining-count-text { 
            color: #c5b8d9; 
            font-weight: 500; 
            font-size: 0.85rem; 
            margin: 0; 
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5); 
            font-family: "Lilita One", sans-serif; /* Font Lilita */
            letter-spacing: 0.5px;
        }
        
        .vocabulary-chest-root .highlight-yellow { color: #facc15; font-weight: bold; }
        .vocabulary-chest-root .sale-count-text { color: #f87171; font-size: 0.7rem; font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; animation: pulse-text 2s infinite; }
        @keyframes pulse-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .vocabulary-chest-root .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 20px; }
        .vocabulary-chest-root .chest-image { flex: 1; min-width: 0; height: auto; object-fit: contain; max-height: 120px; filter: drop-shadow(0 0 8px rgba(0,0,0,0.4)); } 
        .vocabulary-chest-root .info-bubble { flex: 2; background-color: rgba(10, 10, 20, 0.5); color: #d1d5db; padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15); font-size: 0.85rem; text-align: left; }
        
        /* --- NÚT BẤM (BUTTONS) --- */
        .vocabulary-chest-root .action-button-group { display: flex; gap: 10px; width: 100%; margin-top: auto; padding-top: 15px; }
        .vocabulary-chest-root .chest-button { 
            position: relative; /* Để định vị thẻ quantity-tag */
            flex: 1; 
            padding: 8px; 
            border-radius: 10px; 
            border: none; 
            cursor: pointer; 
            transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s; 
            color: #ffffff; 
            font-weight: 700; 
            font-size: 0.95rem; 
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); 
            box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 48px; 
        }
        .vocabulary-chest-root .chest-button:disabled { cursor: not-allowed; background: linear-gradient(to top, #52525b, #71717a); }
        .vocabulary-chest-root .chest-button:active:not(:disabled) { transform: translateY(2px); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.25); }
        .vocabulary-chest-root .btn-get-1 { background: linear-gradient(to top, #8b5cf6, #c084fc); }
        .vocabulary-chest-root .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); }
        
        /* --- TAG SỐ LƯỢNG (X1, X4) --- */
        .vocabulary-chest-root .quantity-tag {
            position: absolute;
            top: 5px;
            left: 6px;
            background-color: rgba(0, 0, 0, 0.5); /* 50% opacity */
            color: rgba(255, 255, 255, 0.95);
            font-family: "Lilita One", sans-serif; /* Font Lilita */
            font-size: 0.65rem; /* Cỡ chữ nhỏ */
            letter-spacing: 0.5px;
            padding: 2px 7px;
            border-radius: 12px; /* Pill shape */
            pointer-events: none;
            text-transform: uppercase;
        }

        /* --- HIỂN THỊ GIÁ --- */
        .vocabulary-chest-root .button-price-box { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 5px; 
            font-size: 0.95rem; 
            color: white; 
            font-weight: 600; 
            font-family: "Lilita One", sans-serif; /* Font Lilita */
        }
        .vocabulary-chest-root .price-icon { width: 16px; height: 16px; }
        
        /* Style cho giá sale: MÀU TRẮNG, FONT LILITA */
        .vocabulary-chest-root .old-price { 
            text-decoration: line-through; 
            opacity: 0.7; 
            font-size: 0.75rem; 
            color: #ffffff; 
            margin-right: 4px; 
            font-family: "Lilita One", sans-serif;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
        .vocabulary-chest-root .new-price { 
            color: #ffffff; 
            font-weight: 800; 
            font-size: 1.1rem; 
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 1px 1px 2px rgba(0,0,0,0.8);
            font-family: "Lilita One", sans-serif; 
        }

        /* --- ANIMATIONS LOADING & PROCESSING --- */
        @keyframes vocabulary-chest-processing-pulse { 50% { transform: scale(1.02); } }
        @keyframes vocabulary-chest-particles-rise { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-150px); opacity: 0; } }
        .vocabulary-chest-root .chest-ui-container.is-processing { animation: vocabulary-chest-processing-pulse 2.5s infinite ease-in-out; pointer-events: none; }
        .vocabulary-chest-root .chest-processing-overlay { position: absolute; inset: 0; background-color: rgba(10, 10, 20, 0.7); border-radius: 16px; display: flex; justify-content: center; align-items: center; z-index: 10; opacity: 0; transition: opacity 0.3s ease; }
        .vocabulary-chest-root .chest-ui-container.is-processing .chest-processing-overlay { opacity: 1; }
        @keyframes vocabulary-chest-spinner-spin { to { transform: rotate(360deg); } }
        .vocabulary-chest-root .chest-spinner { width: 64px; height: 64px; color: #c084fc; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3Epath%7Bfill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;%7D%3C/style%3E%3Cpath d='M50,6 a23,23 0 1,0 0,88 a23,23 0 1,0 0,-88 M20,25 l10,10 M70,25 l10,10 M20,75 l10,-10 M70,75 l10,-10 M50,20 l0,10 M50,70 l0,10 M25,40 l10,0 M65,40 l10,0'/%3E%3Cpath d='M50,25 a12,12 0 1,0 0,50 a12,12 0 1,0 0,-50 M40,50 l20,0 M50,40 l0,20'/%3E%3C/svg%3E"); background-size: contain; background-position: center; background-repeat: no-repeat; animation: vocabulary-chest-spinner-spin 10s linear infinite; }
        
        /* --- CARD OPENING OVERLAY (POPUP) --- */
        .vocabulary-chest-root .card-opening-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: #0a0a14; background-image: url('https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-voca-chest.webp'); background-size: cover; background-position: center; background-repeat: no-repeat; z-index: 1000; display: flex; justify-content: center; align-items: center; animation: vocabulary-chest-fade-in 0.5s ease; overflow: hidden; padding: 70px 15px 80px; box-sizing: border-box; }
        .vocabulary-chest-root .card-opening-overlay::before { content: ''; position: absolute; inset: 0; background-color: #0a0a14; opacity: 0.8; z-index: 0; pointer-events: none; }
        @keyframes vocabulary-chest-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .vocabulary-chest-root .overlay-content { width: 100%; max-width: 900px; position: relative; z-index: 1; }
        .vocabulary-chest-root .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
        .vocabulary-chest-root .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .vocabulary-chest-root .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .vocabulary-chest-root .footer-btn.primary { border-color: #a78bfa; color: #a78bfa; }
        .vocabulary-chest-root .footer-btn.primary:hover { background-color: #a78bfa; color: #1e293b; }
        .vocabulary-chest-root .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; background-color: transparent; }
        
        .vocabulary-chest-root .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .vocabulary-chest-root .card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform; transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1); }
        .vocabulary-chest-root .card-container.is-flipping .card-inner { transform: rotateY(180deg); }
        .vocabulary-chest-root .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .vocabulary-chest-root .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #a78bfa; text-shadow: 0 0 10px #a78bfa; }
        .vocabulary-chest-root .card-front { transform: rotateY(180deg); padding: 6px; box-sizing: border-box; background: rgba(42, 49, 78, 0.85); border: 1px solid rgba(255, 255, 255, 0.18); }
        .vocabulary-chest-root .card-image-in-card { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
        .vocabulary-chest-root .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; justify-content: center; margin: 0 auto; grid-template-columns: repeat(2, 1fr); }
        .vocabulary-chest-root .card-wrapper { transition: opacity 0.3s; }
        @keyframes vocabulary-chest-deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .vocabulary-chest-root .card-wrapper.dealt-in { animation: vocabulary-chest-deal-in 0.5s ease-out forwards; }
    `}</style>
);

// ========================================================================
// === 2. HELPER COMPONENTS & CARDS =======================================
// ========================================================================

const HomeIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
);

interface ImageCard { id: number; url: string; }

const Card = memo(({ cardData, isFlipping, flipDelay }: { cardData: ImageCard, isFlipping: boolean, flipDelay: number }) => (
    <div className={`card-container ${isFlipping ? 'is-flipping' : ''}`}>
        <div className="card-inner" style={{ transitionDelay: `${flipDelay}ms` }}>
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
        const t2 = setTimeout(() => setIsProcessing(false), 1100); 
        return () => { clearTimeout(t1); clearTimeout(t2); }; 
    }, [card]); 
    
    const handleOpenAgain = () => { 
        if (isProcessing) return; 
        setIsProcessing(true); 
        setIsFlipping(false); 
        setTimeout(() => onOpenAgain(), 300); 
    }; 
    
    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-block', maxWidth: '250px', width: '60vw' }}>
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
                <button onClick={handleOpenAgain} className="footer-btn primary" disabled={btnProps.disabled}>
                    {btnProps.text}
                </button>
                <button onClick={onClose} className="footer-btn">Đóng</button>
            </div>
        </>
    ); 
};

// ========================================================================
// === 3. CHEST UI COMPONENT (UPDATED FOR BUTTON DESIGN) ==================
// ========================================================================

interface ChestUIProps { 
    headerTitle: string; 
    cefr: string; 
    levelName: string | null; 
    imageUrl: string; 
    infoText: React.ReactNode; 
    price1: number | string; 
    price10: number | null; 
    priceIconUrl: string; 
    onOpen1: () => void; 
    onOpen10: () => void; 
    isComingSoon: boolean; 
    remainingCount: number; 
    isProcessing: boolean;
    saleConfig?: {
        isActive: boolean;
        remainingSaleSlots: number;
        salePrice1: number;
        salePrice4: number;
    }
}

const ChestUI: React.FC<ChestUIProps> = ({ 
    headerTitle, cefr, levelName, imageUrl, infoText, 
    price1, price10, priceIconUrl, 
    onOpen1, onOpen10, 
    isComingSoon, remainingCount, isProcessing,
    saleConfig
}) => {
    // Logic xác định giá
    const isSaleActive = saleConfig?.isActive ?? false;
    const finalPrice1 = isSaleActive ? saleConfig!.salePrice1 : price1;
    const finalPrice4 = isSaleActive && price10 !== null ? saleConfig!.salePrice4 : price10;

    return (
        <div className={`chest-ui-container ${isComingSoon ? 'is-coming-soon' : ''} ${isProcessing ? 'is-processing' : ''}`}>
            {isProcessing && (<div className="chest-processing-overlay"><div className="chest-spinner"></div></div>)}
            
            <header className="chest-header">
                {headerTitle}
                <span className={`cefr-tag ${cefr}`}>{cefr}</span>
            </header>
            
            <main className="chest-body">
                <div className="chest-top-section">
                    <div className="chest-level-info">
                        {levelName && !isComingSoon && <button className="chest-help-icon" title="Thông tin">?</button>}
                        {levelName && <span className="chest-level-name">{levelName}</span>}
                    </div>
                    <div className="remaining-count-container">
                        <p className="remaining-count-text">
                            {isComingSoon ? "Coming Soon" : <>Remaining: <span className="highlight-yellow">{remainingCount.toLocaleString()}</span> cards</>}
                        </p>
                        {isSaleActive && (
                            <span className="sale-count-text">
                                Còn {saleConfig?.remainingSaleSlots} lượt ưu đãi
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="chest-visual-row">
                    <img src={imageUrl} alt={headerTitle} className="chest-image" />
                    <div className="info-bubble">{infoText}</div>
                </div>
                
                <div className="action-button-group">
                    {/* BUTTON MỞ X1 */}
                    <button className="chest-button btn-get-1" onClick={onOpen1} disabled={isComingSoon || remainingCount < 1}>
                        {/* Tag X1 - Font Lilita, Uppercase, Small size */}
                        <span className="quantity-tag font-lilita">X1</span>
                        
                        {/* Chỉ hiển thị giá - Font Lilita */}
                        {typeof price1 === 'number' && (
                            <div className="button-price-box font-lilita">
                                <img src={priceIconUrl} alt="price icon" className="price-icon" />
                                {isSaleActive ? (
                                    <>
                                        <span className="old-price">{price1.toLocaleString()}</span>
                                        <span className="new-price">{finalPrice1.toLocaleString()}</span>
                                    </>
                                ) : (
                                    <span>{price1.toLocaleString()}</span>
                                )}
                            </div>
                        )}
                    </button>
                    
                    {/* BUTTON MỞ X4 */}
                    {price10 !== null && (
                        <button className="chest-button btn-get-10" onClick={onOpen10} disabled={isComingSoon || remainingCount < 4}>
                            {/* Tag X4 - Font Lilita, Uppercase, Small size */}
                            <span className="quantity-tag font-lilita">X4</span>
                            
                            {/* Chỉ hiển thị giá - Font Lilita */}
                            <div className="button-price-box font-lilita">
                                <img src={priceIconUrl} alt="price icon" className="price-icon" />
                                {isSaleActive && typeof price10 === 'number' ? (
                                    <>
                                        <span className="old-price">{price10.toLocaleString()}</span>
                                        <span className="new-price">{(finalPrice4 as number).toLocaleString()}</span>
                                    </>
                                ) : (
                                    <span>{(price10 as number).toLocaleString()}</span>
                                )}
                            </div>
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

// ========================================================================
// === 4. COMPONENT MÀN HÌNH CHÍNH ========================================
// ========================================================================

interface VocabularyChestScreenUIProps { onClose: () => void; }

const VocabularyChestScreenUI: React.FC<VocabularyChestScreenUIProps> = ({ onClose }) => {
    const { 
        isLoading, 
        playerStats, 
        availableIndices, 
        urlsToPreload, 
        isOverlayVisible, 
        cardsForPopup, 
        openedCardCount, 
        processingChestId, 
        openChest, 
        closeOverlay, 
        openAgain,
        basicSaleInfo 
    } = useVocabularyChest();
    
    const displayCoins = isLoading ? 0 : playerStats.coins;
    const displayGems = isLoading ? 0 : playerStats.gems;
    const animatedCoins = useAnimateValue(displayCoins, 500);
    const animatedGems = useAnimateValue(displayGems, 500);
    
    return (
        <div className="vocabulary-chest-root">
            <ScopedStyles />
            <ImagePreloader imageUrls={urlsToPreload} />

            <div className={`absolute inset-0 bg-[#0a0a14] z-20 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <VocabularyChestLoadingSkeleton />
            </div>

            <div className={`relative z-10 flex flex-col w-full h-screen ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <header className="sticky top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/70 border-b border-white/10 flex-shrink-0 z-[1100]">
                    <button onClick={onClose} className={`vocab-screen-home-btn ${isOverlayVisible ? 'is-hidden' : ''}`} title="Quay lại Trang Chính">
                        <HomeIcon /><span>Trang Chính</span>
                    </button>
                    <div className="header-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CardCapacityDisplay current={playerStats.totalVocab} max={playerStats.capacity} />
                        <GemDisplay displayedGems={animatedGems} />
                        <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                    </div>
                </header>
                
                {!isOverlayVisible && (
                    <div className="chest-gallery-container">
                        {CHEST_DATA.map((chest) => (
                            <ChestUI
                                key={chest.id} 
                                {...chest}
                                priceIconUrl={chest.currency === 'gem' ? uiAssets.gemIcon : uiAssets.priceIcon}
                                // @ts-ignore
                                remainingCount={availableIndices[chest.chestType]?.length ?? 0}
                                onOpen1={() => openChest(1, chest.chestType)}
                                onOpen10={() => openChest(4, chest.chestType)}
                                isProcessing={processingChestId === chest.id}
                                saleConfig={chest.chestType === 'basic' ? basicSaleInfo : undefined}
                            />
                        ))}
                    </div>
                )}
                
                {isOverlayVisible && openedCardCount === 1 && (
                    <div className="card-opening-overlay">
                        <div className="overlay-content">
                            <SingleCardOpener card={cardsForPopup[0]} onClose={closeOverlay} onOpenAgain={openAgain} />
                        </div>
                    </div>
                )}
                {isOverlayVisible && openedCardCount === 4 && (
                    <div className="card-opening-overlay">
                        <div className="overlay-content">
                            <FourCardsOpener cards={cardsForPopup} onClose={closeOverlay} onOpenAgain={openAgain} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ========================================================================
// === 5. COMPONENT WRAPPER (PROVIDER) ====================================
// ========================================================================

interface VocabularyChestProps {
    onClose: () => void;
    currentUserId: string;
    onStateUpdate: (updates: { newCoins: number; newGems: number; newTotalVocab: number }) => void;
}

const VocabularyChest: React.FC<VocabularyChestProps> = ({ onClose, currentUserId, onStateUpdate }) => (
    <VocabularyChestProvider currentUserId={currentUserId} onStateUpdate={onStateUpdate}>
        <VocabularyChestScreenUI onClose={onClose} />
    </VocabularyChestProvider>
);

export default VocabularyChest;
