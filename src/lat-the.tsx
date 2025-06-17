import React, { useState, useEffect, useCallback } from 'react';

// ========================================================================
// === 1. CSS STYLES (Đã sửa đổi hoàn toàn để khớp với UI mới) ===========
// ========================================================================
const GlobalStyles = () => (
    <style>{`
        /* --- Cài đặt chung & Nền --- */
        body {
            /* SỬA ĐỔI: Thay đổi nền để phù hợp với giao diện game */
            background-color: #343a40;
            background-image: radial-gradient(circle at center, #495057, #212529);
            color: #e0e0e0;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            min-height: 100vh;
        }

        #root {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        }

        /* --- GIAO DIỆN RƯƠNG BÁU MỚI --- */
        .chest-ui-container {
            width: 100%;
            max-width: 850px;
            background-color: #3e2723; /* Nền tối của toàn bộ box */
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            border: 2px solid #5d4037;
        }

        .chest-header {
            padding: 10px 20px;
            background-color: #4e342e;
            font-size: 1.2rem;
            font-weight: 700;
            color: #d7ccc8;
            border-bottom: 2px solid #5d4037;
        }

        .chest-body {
            background-color: #ff9a42;
            padding: 20px;
            border: 8px solid #d15c0a;
            border-top: none;
            position: relative;
        }

        .chest-title {
            font-size: clamp(1.8rem, 5vw, 2.5rem);
            color: white;
            font-weight: 900;
            text-shadow: 3px 3px 0px #8c420b;
            margin-top: 0;
            margin-bottom: 25px;
        }
        
        .help-icon {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.2);
            border: 2px solid white;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s ease;
        }
        .help-icon:hover {
            transform: scale(1.1);
            background-color: rgba(0, 0, 0, 0.4);
        }

        .chest-content-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            align-items: center;
            justify-content: center;
        }

        .chest-left-column {
            flex: 1;
            min-width: 280px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .chest-right-column {
            flex: 1;
            min-width: 280px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .chest-image {
            width: 100%;
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }

        .pity-timer {
            color: #d15c0a;
            font-weight: 700;
            font-size: 1rem;
            margin: 2px 0;
        }

        .highlight-purple {
            color: #8e24aa;
            font-weight: bold;
        }

        .info-bubble {
            background-color: #6a2e35;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border: 2px solid #a1887f;
            font-size: 1rem;
            position: relative;
            width: fit-content;
        }
        
        /* Mũi tên trỏ vào rương */
        .info-bubble::before {
            content: '';
            position: absolute;
            top: 50%;
            left: -24px;
            transform: translateY(-50%);
            border-width: 12px;
            border-style: solid;
            border-color: transparent #a1887f transparent transparent;
        }
        .info-bubble::after {
            content: '';
            position: absolute;
            top: 50%;
            left: -20px;
            transform: translateY(-50%);
            border-width: 10px;
            border-style: solid;
            border-color: transparent #6a2e35 transparent transparent;
        }
        
        @media (max-width: 680px) {
            .info-bubble { margin-top: 20px; }
            .info-bubble::before, .info-bubble::after {
                left: 50%;
                top: -24px;
                transform: translateX(-50%);
                border-color: transparent transparent #a1887f transparent;
            }
            .info-bubble::after {
                top: -20px;
                border-color: transparent transparent #6a2e35 transparent;
            }
        }


        .action-button-group {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 90%;
            max-width: 250px;
        }

        .chest-button {
            padding: 10px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: transform 0.1s ease;
            color: #3e2723;
            font-weight: bold;
            font-size: 1.1rem;
            text-shadow: 1px 1px 1px rgba(255,255,255,0.3);
        }
        .chest-button:active {
            transform: translateY(3px);
            border-bottom-width: 2px;
        }

        .btn-get-1 {
            background: linear-gradient(to top, #f9a825, #fdd835);
            border-bottom: 5px solid #c88719;
        }
        .btn-get-1:active { border-bottom-color: #f9a825; }

        .btn-get-10 {
            background: linear-gradient(to top, #66bb6a, #a5d6a7);
            border-bottom: 5px solid #4a9d4e;
        }
        .btn-get-10:active { border-bottom-color: #66bb6a; }

        .button-price {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 1rem;
            color: #424242;
            font-weight: 600;
        }
        
        /* --- Lớp Overlay Mở Thẻ (giữ nguyên) --- */
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
        .card-opening-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(10, 10, 20, 0.9); backdrop-filter: blur(8px); z-index: 1000; display: flex; justify-content: center; align-items: center; animation: fade-in-overlay 0.5s ease; overflow: hidden; padding: 20px 15px; box-sizing: border-box; }
        .overlay-content { width: 100%; max-width: 900px; }
        .overlay-close-btn { position: absolute; top: 20px; right: 20px; background: none; border: 2px solid #aaa; color: #aaa; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; z-index: 1011; }
        .overlay-close-btn:hover { background: #e94560; color: white; border-color: #e94560; transform: rotate(90deg); }
        .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.5); backdrop-filter: blur(10px); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
        .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .footer-btn.primary { border-color: #e94560; color: #e94560; }
        .footer-btn.primary:hover { background-color: #e94560; color: #16213e; }
        .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; background-color: transparent; }
        
        /* --- Thiết kế Thẻ Bài CO GIÃN (giữ nguyên) --- */
        .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; will-change: transform; }
        .card-container.flipped .card-inner { transform: rotateY(180deg); }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #e94560; text-shadow: 0 0 10px #e94560; }
        .card-front { transform: rotateY(180deg); padding: 6px; box-sizing: border-box; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.18); }
        .card-image-in-card { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; justify-content: center; margin: 0 auto; grid-template-columns: repeat(2, 1fr); }
        
        /* --- Animation (giữ nguyên) --- */
        @keyframes deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .card-wrapper.dealt-in { animation: deal-in 0.5s ease-out forwards; }
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
// === 3. CÁC COMPONENT CON (Không thay đổi logic) =======================
// ========================================================================
const Card = ({ cardData, isFlipped }) => {
    const { name, image } = cardData;

    return (
        <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-inner">
                <div className="card-face card-back">?</div>
                <div className="card-face card-front">
                    {/* Sửa tên class để tránh xung đột */}
                    <img src={image} alt={name} className="card-image-in-card" />
                </div>
            </div>
        </div>
    );
};


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
                // Chú ý: Nút này sẽ mở lại 4 thẻ
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
// === 4. COMPONENT CHÍNH (APP) (Sửa đổi JSX) ============================
// ========================================================================
function App() {
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [singleKey, setSingleKey] = useState(Date.now());
    const [fourKey, setFourKey] = useState(Date.now());

    const openSingle = () => { setSingleKey(Date.now()); setShowSingleOverlay(true); };
    // LƯU Ý: Nút "Mở 10 lần" trên giao diện sẽ gọi hàm này (mở 4 thẻ).
    // Bạn có thể sửa đổi logic trong FourCardsOpener để mở 10 thẻ nếu muốn.
    const openFour = () => { setFourKey(Date.now()); setShowFourOverlay(true); };
    
    const closeSingle = () => setShowSingleOverlay(false);
    const closeFour = () => setShowFourOverlay(false);

    // URL hình ảnh rương. Bạn có thể thay thế bằng ảnh của bạn.
    const chestImageUrl = "https://static.wikia.nocookie.net/survivorio/images/b/b3/S_Grade_Supplies_x10.png";

    return (
        <>
            <GlobalStyles />
            {/* SỬA ĐỔI: Thay thế hoàn toàn giao diện màn hình chính */}
            <div className="chest-ui-container">
                <header className="chest-header">
                    Rương Sự Kiện
                </header>
                <main className="chest-body">
                    <button className="help-icon">?</button>
                    <h1 className="chest-title">Rương Báu Huyền Thoại</h1>
                    <div className="chest-content-grid">
                        
                        <div className="chest-left-column">
                            <img src={chestImageUrl} alt="Rương Báu" className="chest-image"/>
                            <p className="pity-timer">
                                Nhận <span className="highlight-purple">Sử thi</span> trong 1 lần mở
                            </p>
                            <p className="pity-timer">
                                Nhận <span className="highlight-purple">S-Sử thi</span> trong 51 lần mở
                            </p>
                        </div>

                        <div className="chest-right-column">
                            <div className="info-bubble">
                                Có thể nhận trang bị <span className="highlight-purple">Sử thi hạng S</span>
                            </div>
                            <div className="action-button-group">
                                <button className="chest-button btn-get-1" onClick={openSingle}>
                                    <span>Mở 1 lần</span>
                                    <span className="button-price">
                                        <span role="img" aria-label="gem">🟣</span> 320
                                    </span>
                                </button>
                                
                                <button className="chest-button btn-get-10" onClick={openFour}>
                                    <span>Mở 10 lần</span>
                                    <span className="button-price">
                                      <span role="img" aria-label="gem">🟣</span> 2980
                                    </span>
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Phần Overlay không thay đổi */}
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
