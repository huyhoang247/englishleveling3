import React, { useState, useEffect, useCallback } from 'react';

// ========================================================================
// === 1. CSS STYLES (Đã sửa đổi) ========================================
// ========================================================================
const GlobalStyles = () => (
    <style>{`
        /* --- Cài đặt chung & Nền --- */
        body {
            background-image: url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: #e0e0e0;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            min-height: 100vh;
        }

        #root {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        /* --- Màn hình chính --- */
        .main-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 0 20px;
        }

        .main-title {
            font-size: clamp(2.5rem, 10vw, 4rem);
            color: white;
            text-shadow: 0 0 15px rgba(233, 69, 96, 0.8), 0 0 25px rgba(233, 69, 96, 0.6);
        }

        .open-button {
            padding: 15px 40px;
            font-size: clamp(16px, 4vw, 20px);
            font-weight: 700;
            border: 3px solid #e94560;
            background-color: transparent;
            color: #e94560;
            cursor: pointer;
            border-radius: 50px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            backdrop-filter: blur(5px);
        }

        .open-button:hover {
            background-color: #e94560;
            color: #16213e;
            box-shadow: 0 0 20px #e94560;
            transform: translateY(-5px);
        }
        
        /* --- Lớp Overlay Mở Thẻ --- */
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
        
        .card-opening-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(10, 10, 20, 0.9);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fade-in-overlay 0.5s ease;
            overflow: hidden; 
            padding: 20px 15px;
            box-sizing: border-box;
        }
        
        .overlay-content { width: 100%; max-width: 900px; }
        .overlay-close-btn { position: absolute; top: 20px; right: 20px; background: none; border: 2px solid #aaa; color: #aaa; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; z-index: 1011; }
        .overlay-close-btn:hover { background: #e94560; color: white; border-color: #e94560; transform: rotate(90deg); }

        /* === Thiết kế Footer và Nút bấm mới === */
        .overlay-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 15px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            background: rgba(10, 21, 46, 0.5);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1010;
        }

        .footer-btn {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.5);
            color: rgba(255, 255, 255, 0.8);
            padding: 8px 25px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
        }

        .footer-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: white;
            color: white;
        }

        .footer-btn.primary {
            border-color: #e94560;
            color: #e94560;
        }

        .footer-btn.primary:hover {
            background-color: #e94560;
            color: #16213e;
        }

        .footer-btn:disabled {
            color: rgba(255, 255, 255, 0.4);
            border-color: rgba(255, 255, 255, 0.2);
            cursor: not-allowed;
            background-color: transparent;
        }
        
        /* --- Thiết kế Thẻ Bài CO GIÃN --- */
        .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .card-inner { 
            position: relative; 
            width: 100%; 
            height: 100%; 
            transition: transform 0.8s; 
            transform-style: preserve-3d;
            will-change: transform; /* SỬA ĐỔI: Tối ưu hóa hiệu năng animation */
        }
        .card-container.flipped .card-inner { transform: rotateY(180deg); }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #e94560; text-shadow: 0 0 10px #e94560; }
        .card-front { transform: rotateY(180deg); background-color: #2c3e50; color: white; display: flex; flex-direction: column; border-style: solid; border-width: 4px; }
        .card-image { width: 100%; height: 60%; object-fit: cover; clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%); }
        .card-info { padding: 8px; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-around; }
        .card-name { font-size: clamp(0.8rem, 4vw, 1.2rem); font-weight: 700; margin: 0; line-height: 1.2; }
        .card-rarity { font-size: clamp(0.6rem, 3vw, 0.85rem); font-weight: 500; text-transform: uppercase; padding: 3px 8px; border-radius: 5px; margin-top: 5px; align-self: center; }
        .rarity-common { border-color: #bdc3c7; background-color: #7f8c8d; } .rarity-rare { border-color: #3498db; background-color: #2980b9; } .rarity-epic { border-color: #9b59b6; background-color: #8e44ad; } .rarity-legendary { border-color: #f1c40f; background-color: #f39c12; }
        .card-front.rarity-common { border-color: #bdc3c7; } .card-front.rarity-rare { border-color: #3498db; } .card-front.rarity-epic { border-color: #9b59b6; } .card-front.rarity-legendary { border-color: #f1c40f; }
        
        .four-card-grid-container {
            width: 100%;
            max-width: 550px;
            display: grid;
            gap: 15px;
            justify-content: center;
            margin: 0 auto;
            grid-template-columns: repeat(2, 1fr);
        }
        
        /* --- Animation --- */
        @keyframes deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .card-wrapper.dealt-in { animation: deal-in 0.5s ease-out forwards; }
        
        @keyframes legendary-reveal {
            0% { transform: rotateY(180deg) scale(1); filter: brightness(1); }
            50% { transform: rotateY(180deg) scale(1.07); filter: brightness(1.3) drop-shadow(0 0 15px rgba(241, 196, 15, 0.7)); }
            100% { transform: rotateY(180deg) scale(1); filter: brightness(1); }
        }
        
        .card-container.flipped.reveal-legendary .card-inner {
            animation: legendary-reveal 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
    `}
    </style>
);

// ========================================================================
// === 2. DỮ LIỆU & HÀM HỖ TRỢ (Không thay đổi) ============================
// ========================================================================
const RARITIES = { COMMON: { name: 'Thường', colorClass: 'rarity-common', probability: 0.6 }, RARE: { name: 'Hiếm', colorClass: 'rarity-rare', probability: 0.25 }, EPIC: { name: 'Sử Thi', colorClass: 'rarity-epic', probability: 0.12 }, LEGENDARY: { name: 'Huyền Thoại', colorClass: 'rarity-legendary', probability: 0.03 }};
const CHAMPIONS_POOL = [ { name: 'Aatrox', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg' }, { name: 'Ahri', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg' }, { name: 'Yasuo', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg' }, { name: 'Jinx', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg' }, { name: 'Lux', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg' }, { name: 'Garen', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg' }, { name: 'Zed', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg' }, { name: 'Irelia', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Irelia_0.jpg' }, { name: 'Kai\'Sa', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg' }, { name: 'Lee Sin', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_0.jpg' }];
const generateRandomCard = () => { const randomChamp = CHAMPIONS_POOL[Math.floor(Math.random() * CHAMPIONS_POOL.length)]; let randomRarity = RARITIES.COMMON; const rand = Math.random(); let cumulativeProbability = 0; for (const key in RARITIES) { cumulativeProbability += RARITIES[key].probability; if (rand <= cumulativeProbability) { randomRarity = RARITIES[key]; break; } } return { ...randomChamp, rarity: randomRarity, id: Math.random() }; };

// ========================================================================
// === 3. CÁC COMPONENT CON (Không thay đổi) ==============================
// ========================================================================
const Card = ({ cardData, isFlipped }) => { const [isRevealed, setIsRevealed] = useState(false); const { name, image, rarity } = cardData; useEffect(() => { if (isFlipped && (rarity.name === 'Sử Thi' || rarity.name === 'Huyền Thoại')) { const timer = setTimeout(() => setIsRevealed(true), 800); return () => clearTimeout(timer); } setIsRevealed(false); }, [isFlipped, rarity.name]); const revealClass = isRevealed ? (rarity.name === 'Huyền Thoại' ? 'reveal-legendary' : 'reveal-epic') : ''; return (<div className={`card-container ${isFlipped ? 'flipped' : ''} ${revealClass}`}><div className="card-inner"><div className="card-face card-back">?</div><div className={`card-face card-front ${rarity.colorClass}`}><img src={image} alt={name} className="card-image" /><div className="card-info"><h3 className="card-name">{name}</h3><span className={`card-rarity ${rarity.colorClass}`}>{rarity.name}</span></div></div></div></div>); };

const SingleCardOpener = ({ onClose }) => {
    const [card, setCard] = useState(generateRandomCard());
    const [isFlipped, setIsFlipped] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const initialDelay = 500; 
        const flipDuration = 800;
        const flipTimer = setTimeout(() => setIsFlipped(true), initialDelay);
        const processTimer = setTimeout(() => setIsProcessing(false), initialDelay + flipDuration);
        return () => { clearTimeout(flipTimer); clearTimeout(processTimer); };
    }, []);

    const handleOpenAgain = () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsFlipped(false);
        setTimeout(() => setCard(generateRandomCard()), 400);
        setTimeout(() => {
            setIsFlipped(true);
            setTimeout(() => setIsProcessing(false), 800);
        }, 600);
    };

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div style={{display: 'inline-block', maxWidth: '250px', width: '60vw', marginBottom: '20px'}}>
                    <Card cardData={card} isFlipped={isFlipped} />
                </div>
            </div>
            
            <div className="overlay-footer">
                <button onClick={handleOpenAgain} className="footer-btn primary" disabled={isProcessing}>
                    {isProcessing ? 'Đang mở...' : 'Mở Lại'}
                </button>
                <button onClick={onClose} className="footer-btn">
                    Đóng
                </button>
            </div>
        </>
    );
};

const FourCardsOpener = ({ onClose }) => {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState(new Set());
    const [phase, setPhase] = useState('DEALING');
    
    const startNewRound = useCallback(() => {
        setPhase('DEALING');
        setFlippedIndices(new Set());
        setCards([]);
        
        setTimeout(() => {
            const newCards = Array.from({ length: 4 }, generateRandomCard);
            setCards(newCards);
            
            const dealAnimationTime = 500 + 80 * 4;
            const pauseBeforeFlip = 500;

            setTimeout(() => {
                setPhase('FLIPPING');
                
                const flipCardSequentially = (index) => {
                    if (index >= 4) {
                        setTimeout(() => setPhase('REVEALED'), 800);
                        return;
                    }
                    
                    setFlippedIndices(prev => new Set(prev).add(index));
                    setTimeout(() => flipCardSequentially(index + 1), 200);
                };
                
                flipCardSequentially(0);

            }, dealAnimationTime + pauseBeforeFlip);
            
        }, 300);
    }, []);

    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    const getButtonProps = () => {
        switch (phase) {
            case 'DEALING':
                return { text: 'Đang chia bài...', disabled: true };
            case 'FLIPPING':
                return { text: 'Đang lật...', disabled: true };
            case 'REVEALED':
                return { text: 'Mở Lại x4', disabled: false };
            default:
                return { text: '', disabled: true };
        }
    };
    
    const buttonProps = getButtonProps();

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div className="four-card-grid-container">
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`card-wrapper ${cards.length > 0 ? 'dealt-in' : ''}`}
                            style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
                        >
                            <Card cardData={card} isFlipped={flippedIndices.has(index)} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="overlay-footer">
                <button onClick={startNewRound} className="footer-btn primary" disabled={buttonProps.disabled}>
                    {buttonProps.text}
                </button>
                 <button onClick={onClose} className="footer-btn">
                    Đóng
                </button>
            </div>
        </>
    );
};

// ========================================================================
// === 4. COMPONENT CHÍNH (APP) (Không thay đổi) ==========================
// ========================================================================
function App() {
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [singleKey, setSingleKey] = useState(Date.now());
    const [fourKey, setFourKey] = useState(Date.now());

    const openSingle = () => { setSingleKey(Date.now()); setShowSingleOverlay(true); };
    const openFour = () => { setFourKey(Date.now()); setShowFourOverlay(true); };
    
    const closeSingle = () => setShowSingleOverlay(false);
    const closeFour = () => setShowFourOverlay(false);

    return (
        <>
            <GlobalStyles />
            <div className="main-screen">
                <h1 className="main-title">Mở Thẻ Tướng</h1>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="open-button" onClick={openSingle}>Mở x1</button>
                    <button className="open-button" onClick={openFour}>Mở x4</button>
                </div>
            </div>

            {showSingleOverlay && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <SingleCardOpener key={singleKey} onClose={closeSingle} />
                    </div>
                </div>
            )}

            {showFourOverlay && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <FourCardsOpener key={fourKey} onClose={closeFour} />
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
