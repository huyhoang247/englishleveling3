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
import CardCapacityDisplay from './ui/display/card-capacity-display.tsx';
// --- NEW: Import GemDisplay mới để nhất quán giao diện ---
import GemDisplay from './ui/display/gem-display.tsx'; 
// --- REFACTORED: Import service để tự quản lý logic ---
import { processVocabularyChestOpening } from './gameDataService.ts'; 
// --- NEW: Import hook animate số đếm để dùng cho GemDisplay & CoinDisplay ---
import { useAnimateValue } from './ui/useAnimateValue.ts';

// ========================================================================
// === 1. COMPONENT CSS ĐÃ ĐƯỢỢC ĐÓNG GÓI ================================
// ========================================================================
const ScopedStyles = () => (
    <style>{`
        /* --- LỚP GỐC: Thiết lập môi trường độc lập --- */
        .vocabulary-chest-root {
            width: 100%; height: 100%; position: absolute; top: 0; left: 0;
            background-color: #0a0a14; background-image: radial-gradient(circle at center, #16213e, #0a0a14);
            color: #e0e0e0; font-family: 'Roboto', sans-serif;
            display: flex; flex-direction: column; justify-content: flex-start; align-items: center;
            z-index: 100; overflow: hidden;
        }
        
        /* === HEADER === */
        .vocabulary-chest-root .main-header {
            position: sticky; top: 0; left: 0; width: 100%; padding: 8px 16px;
            display: flex; justify-content: space-between; align-items: center;
            background-color: rgba(16, 22, 46, 0.7); backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1010; box-sizing: border-box; flex-shrink: 0; 
        }
        
        /* NÚT HOME */
        .vocabulary-chest-root .vocab-screen-home-btn {
            display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px;
            background-color: rgba(30, 41, 59, 0.8); border: 1px solid rgb(51, 65, 85);
            transition: background-color 0.2s ease, opacity 0.3s ease, visibility 0.3s;
            cursor: pointer; color: #cbd5e1;
        }
        .vocabulary-chest-root .vocab-screen-home-btn:hover { background-color: rgb(51, 65, 85); }
        .vocabulary-chest-root .vocab-screen-home-btn.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .vocabulary-chest-root .vocab-screen-home-btn svg { width: 20px; height: 20px; }
        .vocabulary-chest-root .vocab-screen-home-btn span { font-size: 0.875rem; font-weight: 600; }
        @media (max-width: 640px) {
            .vocabulary-chest-root .vocab-screen-home-btn span { display: none; }
            .vocabulary-chest-root .header-right-group { gap: 8px; }
        }
        
        /* CONTAINER RƯƠNG */
        .vocabulary-chest-root .chest-gallery-container {
            display: flex; flex-wrap: wrap; justify-content: center;
            gap: 30px; width: 100%; max-width: 1300px; 
            padding: 20px 20px 100px; box-sizing: border-box;
            flex-grow: 1; overflow-y: auto;
        }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar { width: 8px; }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar-track { background: rgba(10, 10, 20, 0.5); border-radius: 4px; }
        .vocabulary-chest-root .chest-gallery-container::-webkit-scrollbar-thumb { background-color: #4a5588; border-radius: 4px; }
        
        /* GIAO DIỆN RƯƠNG */
        .vocabulary-chest-root .chest-ui-container {
            width: 100%; max-width: 380px; min-width: 300px; background-color: #1a1f36; border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); overflow: hidden; display: flex; flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease; position: relative; border: none;
        }
        .vocabulary-chest-root .chest-ui-container.is-coming-soon { filter: grayscale(80%); opacity: 0.7; }
        .vocabulary-chest-root .chest-ui-container::before {
            content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.4), rgba(49, 46, 129, 0.3));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor;
        }
        .vocabulary-chest-root .chest-ui-container:hover { transform: translateY(-8px); }
        .vocabulary-chest-root .chest-header { padding: 12px 20px; background-color: rgba(42, 49, 78, 0.7); font-size: 0.9rem; font-weight: 600; color: #c7d2fe; text-align: center; text-transform: uppercase; }
        .vocabulary-chest-root .chest-body { background: linear-gradient(170deg, #43335b, #2c2240); padding: 20px; flex-grow: 1; display: flex; flex-direction: column; align-items: center; }
        .vocabulary-chest-root .chest-top-section { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 20px; }
        .vocabulary-chest-root .remaining-count-text { color: #c5b8d9; font-size: 0.85rem; margin: 0; }
        .vocabulary-chest-root .highlight-yellow { color: #facc15; font-weight: bold; }
        .vocabulary-chest-root .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 20px; }
        .vocabulary-chest-root .chest-image { flex: 1; min-width: 0; height: auto; }
        .vocabulary-chest-root .info-bubble { flex: 2; background-color: rgba(10, 10, 20, 0.6); color: #d1d5db; padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.85rem; }
        .vocabulary-chest-root .action-button-group { display: flex; gap: 10px; width: 100%; }
        .vocabulary-chest-root .chest-button { flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer; transition: transform 0.1s ease; color: #ffffff; font-weight: 700; font-size: 0.95rem; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vocabulary-chest-root .chest-button:disabled { cursor: not-allowed; background: linear-gradient(to top, #52525b, #71717a); }
        .vocabulary-chest-root .chest-button:active:not(:disabled) { transform: translateY(2px); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.25); }
        .vocabulary-chest-root .btn-get-1 { background: linear-gradient(to top, #8b5cf6, #c084fc); }
        .vocabulary-chest-root .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); }
        .vocabulary-chest-root .button-price { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; background-color: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px; }
        .vocabulary-chest-root .price-icon { width: 16px; height: 16px; }

        /* Overlay, Card & Loading Styles */
        @keyframes vocabulary-chest-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vocabulary-chest-spin { to { transform: rotate(360deg); } }
        @keyframes vocabulary-chest-flip-in { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
        @keyframes vocabulary-chest-deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .vocabulary-chest-root .card-opening-overlay { position: fixed; inset: 0; background-color: rgba(10, 10, 20, 0.95); z-index: 1000; display: flex; justify-content: center; align-items: center; animation: vocabulary-chest-fade-in 0.5s ease; padding: 70px 15px 80px; box-sizing: border-box; }
        .vocabulary-chest-root .overlay-content { width: 100%; max-width: 900px; }
        .vocabulary-chest-root .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
        .vocabulary-chest-root .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; }
        .vocabulary-chest-root .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
        .vocabulary-chest-root .footer-btn.primary { border-color: #a78bfa; color: #a78bfa; }
        .vocabulary-chest-root .footer-btn.primary:hover { background-color: #a78bfa; color: #1e293b; }
        .vocabulary-chest-root .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; }
        .vocabulary-chest-root .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; }
        .vocabulary-chest-root .card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
        .vocabulary-chest-root .card-container.is-flipping .card-inner { animation: vocabulary-chest-flip-in 0.8s forwards ease-in-out; }
        .vocabulary-chest-root .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
        .vocabulary-chest-root .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; }
        .vocabulary-chest-root .card-front { transform: rotateY(180deg); padding: 6px; background: rgba(42, 49, 78, 0.85); }
        .vocabulary-chest-root .card-image-in-card { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
        .vocabulary-chest-root .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; grid-template-columns: repeat(2, 1fr); margin: 0 auto; }
        .vocabulary-chest-root .card-wrapper.dealt-in { animation: vocabulary-chest-deal-in 0.5s ease-out forwards; }
        .vocabulary-chest-root .loading-spinner-container { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 2000; animation: vocabulary-chest-fade-in 0.3s; }
        .vocabulary-chest-root .loading-spinner { width: 50px; height: 50px; border: 5px solid rgba(255, 255, 255, 0.2); border-top-color: #a78bfa; border-radius: 50%; animation: vocabulary-chest-spin 1s linear infinite; }
        .vocabulary-chest-root .loading-text { color: #e0e0e0; margin-top: 20px; }
    `}
    </style>
);

// ========================================================================
// === 2. CÁC COMPONENT CON VÀ DATA =======================================
// ========================================================================
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );
const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => { if (!isVisible) return null; return ( <div className="loading-spinner-container"><div className="loading-spinner"></div><p className="loading-text">Loading...</p></div> ); };
interface ImageCard { id: number; url: string; }
const Card = memo(({ cardData, isFlipping, flipDelay }: { cardData: ImageCard, isFlipping: boolean, flipDelay: number }) => ( <div className={`card-container ${isFlipping ? 'is-flipping' : ''}`}> <div className="card-inner" style={{ animationDelay: `${flipDelay}ms` }}> <div className="card-face card-back"></div> <div className="card-face card-front"><img src={cardData.url} alt={`Revealed content ${cardData.id}`} className="card-image-in-card" /></div> </div> </div> ));
const SingleCardOpener = ({ card, onClose, onOpenAgain }: { card: ImageCard, onClose: () => void, onOpenAgain: () => void }) => { const [isFlipping, setIsFlipping] = useState(false); const [isProcessing, setIsProcessing] = useState(true); useEffect(() => { const t1 = setTimeout(() => setIsFlipping(true), 300); const t2 = setTimeout(() => setIsProcessing(false), 1100); return () => { clearTimeout(t1); clearTimeout(t2); }; }, [card]); const handleOpenAgain = () => { if (isProcessing) return; setIsProcessing(true); setIsFlipping(false); setTimeout(onOpenAgain, 300); }; return ( <> <div style={{ textAlign: 'center' }}><div style={{ display: 'inline-block', maxWidth: '250px', width: '60vw' }}><Card cardData={card} isFlipping={isFlipping} flipDelay={0} /></div></div> <div className="overlay-footer"><button onClick={handleOpenAgain} className="footer-btn primary" disabled={isProcessing}>{isProcessing ? 'Đang mở...' : 'Mở Lại'}</button><button onClick={onClose} className="footer-btn">Đóng</button></div> </> ); };
const FourCardsOpener = ({ cards, onClose, onOpenAgain }: { cards: ImageCard[], onClose: () => void, onOpenAgain: () => void }) => { const [startFlipping, setStartFlipping] = useState(false); const [phase, setPhase] = useState('DEALING'); const startRound = useCallback(() => { setPhase('DEALING'); setStartFlipping(false); setTimeout(() => { setPhase('FLIPPING'); setStartFlipping(true); setTimeout(() => setPhase('REVEALED'), 800 + 200 * (cards.length - 1)); }, 500 + 80 * (cards.length - 1)); }, [cards.length]); useEffect(() => { if (cards.length > 0) startRound(); }, [cards, startRound]); const handleOpenAgain = () => { if (phase !== 'REVEALED') return; onOpenAgain(); }; const btnProps = (phase === 'REVEALED') ? { text: 'Mở Lại x4', disabled: false } : { text: 'Đang xử lý...', disabled: true }; return ( <> <div className="four-card-grid-container">{cards.map((card, index) => (<div key={card.id} className={`card-wrapper dealt-in`} style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}><Card cardData={card} isFlipping={startFlipping} flipDelay={index * 200} /></div>))}</div> <div className="overlay-footer"><button onClick={handleOpenAgain} className="footer-btn primary" disabled={btnProps.disabled}>{btnProps.text}</button><button onClick={onClose} className="footer-btn">Đóng</button></div> </> ); };
interface ChestUIProps { headerTitle: string; levelName: string; imageUrl: string; infoText: React.ReactNode; price1: number; price10: number | null; priceIconUrl: string; onOpen1: () => void; onOpen10: () => void; isComingSoon: boolean; remainingCount: number; }
const ChestUI: React.FC<ChestUIProps> = ({ headerTitle, imageUrl, infoText, price1, price10, priceIconUrl, onOpen1, onOpen10, isComingSoon, remainingCount }) => ( <div className={`chest-ui-container ${isComingSoon ? 'is-coming-soon' : ''}`}> <header className="chest-header">{headerTitle}</header> <main className="chest-body"> <div className="chest-top-section"><p className="remaining-count-text">{isComingSoon ? "Sắp ra mắt" : <>Còn lại: <span className="highlight-yellow">{remainingCount.toLocaleString()}</span> thẻ</>}</p></div> <div className="chest-visual-row"><img src={imageUrl} alt={headerTitle} className="chest-image" /><div className="info-bubble">{infoText}</div></div> <div className="action-button-group" style={{ marginTop: 'auto', paddingTop: '15px' }}> <button className="chest-button btn-get-1" onClick={onOpen1} disabled={isComingSoon || remainingCount < 1}><span>Mở x1</span><span className="button-price"><img src={priceIconUrl} alt="price icon" className="price-icon" />{price1.toLocaleString()}</span></button> {price10 !== null && (<button className="chest-button btn-get-10" onClick={onOpen10} disabled={isComingSoon || remainingCount < 4}><span>Mở x4</span><span className="button-price"><img src={priceIconUrl} alt="price icon" className="price-icon" />{price10.toLocaleString()}</span></button>)} </div> </main> </div> );
const CHEST_DEFINITIONS = { basic: { id: 'basic_vocab_chest', currency: 'gold' as const, chestType: 'basic' as const, headerTitle: "Basic Vocabulary", levelName: "Cơ Bản", imageUrl: treasureAssets.chestBasic, infoText: "2,400 từ vựng cơ bản. Nền tảng vững chắc cho việc học.", price1: 320, price10: 1200, isComingSoon: false, range: [0, 2399] as const, }, elementary: { id: 'elementary_vocab_chest', currency: 'gem' as const, chestType: 'elementary' as const, headerTitle: "Elementary Vocabulary", levelName: "Sơ Cấp", imageUrl: treasureAssets.chestElementary, infoText: "1,700 từ vựng trình độ Sơ Cấp (A1-A2).", price1: 10, price10: 40, isComingSoon: false, range: [2400, 4099] as const, }, intermediate: { id: 'intermediate_vocab_chest', currency: 'gem' as const, chestType: 'intermediate' as const, headerTitle: "Intermediate Vocabulary", levelName: "Trung Cấp", imageUrl: treasureAssets.chestIntermediate, infoText: "Mở rộng kiến thức chuyên sâu hơn.", price1: 10, price10: 40, isComingSoon: false, range: [4100, 6499] as const, }, advanced: { id: 'advanced_vocab_chest', currency: 'gem' as const, chestType: 'advanced' as const, headerTitle: "Advanced Vocabulary", levelName: "Cao Cấp", imageUrl: treasureAssets.chestAdvanced, infoText: "Chinh phục các kỳ thi và sử dụng ngôn ngữ học thuật.", price1: 10, price10: 40, isComingSoon: false, range: [6500, defaultVocabulary.length - 1] as const, }, master: { id: 'master_vocab_chest', currency: 'gem' as const, chestType: 'master' as const, headerTitle: "Master Vocabulary", levelName: "Thông Thạo", imageUrl: treasureAssets.chestMaster, infoText: "Từ vựng chuyên ngành và thành ngữ phức tạp.", price1: 0, price10: 0, isComingSoon: true, range: [null, null] as const, }, };
const CHEST_DATA = Object.values(CHEST_DEFINITIONS);

// ========================================================================
// === 3. COMPONENT CHÍNH (ĐÃ TÁI CẤU TRÚC) ===============================
// ========================================================================
interface VocabularyChestScreenProps { onClose: () => void; currentUserId: string; initialCoins: number; initialGems: number; initialTotalVocab: number; initialCardCapacity: number; onDataChanged: (updates: { coinsChange: number; gemsChange: number; vocabAdded: number }) => void; }
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
    const [lastOpenedChest, setLastOpenedChest] = useState<{ count: 1 | 4, type: ChestType } | null>(null);

    const [localCoins, setLocalCoins] = useState(initialCoins);
    const [localGems, setLocalGems] = useState(initialGems);
    const [localTotalVocab, setLocalTotalVocab] = useState(initialTotalVocab);
    
    const animatedCoins = useAnimateValue(localCoins, 500);
    const animatedGems = useAnimateValue(localGems, 500);

    useEffect(() => { 
        setLocalCoins(initialCoins); 
        setLocalGems(initialGems); 
        setLocalTotalVocab(initialTotalVocab); 
    }, [initialCoins, initialGems, initialTotalVocab, currentUserId]);

    useEffect(() => {
        const fetchOpenedItems = async () => {
            setIsLoading(true);
            try {
                const userOpenedVocabColRef = collection(db, 'users', currentUserId, 'openedVocab');
                const querySnapshot = await getDocs(userOpenedVocabColRef);
                const openedIndices = new Set<number>();
                querySnapshot.forEach(doc => { openedIndices.add(Number(doc.id) - 1); });

                const allIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                CHEST_DATA.forEach(chest => {
                    if (chest.range[0] != null) {
                        for (let i = chest.range[0]; i <= (chest.range[1] ?? defaultVocabulary.length - 1); i++) {
                            allIndices[chest.chestType].push(i);
                        }
                    }
                });

                const remainingIndices: Record<ChestType, number[]> = { basic: [], elementary: [], intermediate: [], advanced: [], master: [] };
                for (const key in allIndices) {
                    const chestType = key as ChestType;
                    remainingIndices[chestType] = allIndices[chestType].filter(index => !openedIndices.has(index));
                }
                setAvailableIndices(remainingIndices);
            } catch (error) { console.error("Error fetching user data:", error); } 
            finally { setIsLoading(false); }
        };
        if (currentUserId) fetchOpenedItems();
    }, [currentUserId]);

    useEffect(() => {
        const allAvailable = Object.values(availableIndices).flat();
        if (preloadPool.length < PRELOAD_POOL_SIZE && allAvailable.length > 0) {
            const needed = PRELOAD_POOL_SIZE - preloadPool.length;
            const indicesToAdd = allAvailable.filter(idx => !preloadPool.includes(idx)).slice(0, needed);
            if (indicesToAdd.length > 0) setPreloadPool(prev => [...prev, ...indicesToAdd]);
        }
    }, [availableIndices, preloadPool]);

    const urlsToPreload = useMemo(() => preloadPool.map(index => defaultImageUrls[index]), [preloadPool]);

    const handleOpenCards = async (count: 1 | 4, chestType: ChestType) => {
        if (isProcessingClick || !currentUserId) return;
        const chestDef = CHEST_DEFINITIONS[chestType];
        const price = count === 1 ? chestDef.price1 : (chestDef.price10 || 0);
        
        if (localTotalVocab + count > initialCardCapacity) { alert(`Kho thẻ đã đầy! (${localTotalVocab}/${initialCardCapacity}).`); return; }
        if (chestDef.currency === 'gold' && localCoins < price) { alert(`Không đủ vàng!`); return; }
        if (chestDef.currency === 'gem' && localGems < price) { alert(`Không đủ gem!`); return; }
        if (availableIndices[chestType].length < count) { alert(`Không đủ thẻ trong rương này.`); return; }

        setIsProcessingClick(true);
        setLastOpenedChest({ count, type: chestType }); 
        
        try {
            let tempPool = [...availableIndices[chestType]];
            const selectedOriginalIndices: number[] = [];
            for (let i = 0; i < count; i++) {
                const randomIndex = Math.floor(Math.random() * tempPool.length);
                selectedOriginalIndices.push(tempPool.splice(randomIndex, 1)[0]);
            }
            const newWordsToSave = selectedOriginalIndices.map(index => ({ id: index + 1, word: defaultVocabulary[index], chestType: chestType }));

            const { newCoins, newGems, newTotalVocab } = await processVocabularyChestOpening(
                currentUserId, { currency: chestDef.currency, cost: price, gemReward: count * GEM_REWARD_PER_CARD, newWordsData: newWordsToSave, }
            );
            
            setLocalCoins(newCoins);
            setLocalGems(newGems);
            setLocalTotalVocab(newTotalVocab);
            onDataChanged({ 
                coinsChange: newCoins - initialCoins, 
                gemsChange: newGems - initialGems, 
                vocabAdded: newTotalVocab - initialTotalVocab 
            });
            
            setAvailableIndices(prev => ({ ...prev, [chestType]: tempPool }));
            setPreloadPool(prev => prev.filter(idx => !selectedOriginalIndices.includes(idx)));
            setCardsForPopup(selectedOriginalIndices.map(idx => ({ id: idx + 1, url: defaultImageUrls[idx] })));
            if (count === 1) setShowSingleOverlay(true); else setShowFourOverlay(true);

        } catch (error) {
            console.error("Lỗi khi xử lý mở thẻ:", error);
            alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`);
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
            <LoadingOverlay isVisible={isLoading} />
            {!isLoading && (
                 <header className="main-header">
                    <button onClick={onClose} className={`vocab-screen-home-btn ${showSingleOverlay || showFourOverlay ? 'is-hidden' : ''}`}><HomeIcon /><span>Trang Chính</span></button>
                    <div className="header-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CardCapacityDisplay current={localTotalVocab} max={initialCardCapacity} />
                        <GemDisplay displayedGems={animatedGems} />
                        <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                    </div>
                </header>
            )}
            {!showSingleOverlay && !showFourOverlay && !isLoading && (
                <div className="chest-gallery-container">
                    {CHEST_DATA.map((chest) => (
                        <ChestUI
                            key={chest.id}
                            {...chest}
                            priceIconUrl={chest.currency === 'gem' ? uiAssets.gemIcon : uiAssets.priceIcon}
                            remainingCount={availableIndices[chest.chestType]?.length ?? 0}
                            onOpen1={() => handleOpenCards(1, chest.chestType)}
                            onOpen10={() => handleOpenCards(4, chest.chestType)}
                        />
                    ))}
                </div>
            )}
            {showSingleOverlay && <div className="card-opening-overlay"><div className="overlay-content"><SingleCardOpener card={cardsForPopup[0]} onClose={handleCloseOverlay} onOpenAgain={handleOpenAgain} /></div></div>}
            {showFourOverlay && <div className="card-opening-overlay"><div className="overlay-content"><FourCardsOpener cards={cardsForPopup} onClose={handleCloseOverlay} onOpenAgain={handleOpenAgain} /></div></div>}
        </div>
    );
}

export default VocabularyChestScreen;
