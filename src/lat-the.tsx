import React, { useState, useEffect, useCallback } from 'react';

// ========================================================================
// === 1. CSS STYLES (ĐÃ NÂNG CẤP) =======================================
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
            min-height: 100vh;
        }

        #root {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
            box-sizing: border-box;
        }

        /* --- Nút đóng toàn màn hình (Giữ nguyên) --- */
        .vocab-screen-close-btn {
            position: fixed;
            top: 25px;
            right: 25px;
            width: 44px;
            height: 44px;
            background: transparent;
            border: none;
            cursor: pointer;
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.2s ease, opacity 0.2s ease;
            opacity: 0.9;
        }
        .vocab-screen-close-btn:hover {
            transform: scale(1.15);
            opacity: 1;
        }
        .vocab-screen-close-btn img {
            width: 28px;
            height: 28px;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }
        
        /* Container để chứa nhiều rương */
        .chest-gallery-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 30px; /* Giảm khoảng cách để gọn hơn */
            width: 100%;
        }

        /* === GIAO DIỆN RƯƠNG BÁU (NÂNG CẤP) === */
        .chest-ui-container {
            width: 100%;
            max-width: 380px; /* Giảm kích thước tối đa */
            min-width: 300px;
            background-color: #1a1f36; /* Màu nền mới, lạnh và hiện đại hơn */
            border-radius: 16px; /* Bo góc mềm mại hơn */
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(76, 89, 186, 0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative; /* Cần cho viền gradient */
            border: none; /* Bỏ viền cũ */
        }
        /* Viền gradient tinh tế */
        .chest-ui-container::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 16px;
            padding: 1px; /* Độ dày của viền */
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.4), rgba(49, 46, 129, 0.3));
            -webkit-mask: 
                linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }
        
        .chest-ui-container:hover {
            transform: translateY(-8px); /* Giảm hiệu ứng hover */
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(129, 140, 248, 0.3);
        }

        .chest-header { 
            padding: 12px 20px; 
            background-color: rgba(42, 49, 78, 0.7); /* Màu nền header mới */
            font-size: 0.9rem; /* Chỉnh nhỏ lại */
            font-weight: 600; 
            color: #c7d2fe; /* Màu chữ mới */
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .chest-body { 
            background: linear-gradient(170deg, #43335b, #2c2240);
            padding: 25px 20px 20px 20px; /* Tăng padding trên để thoáng hơn */
            position: relative; 
            flex-grow: 1; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            overflow: hidden;
        }
        
        .chest-body::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.3)"/><circle cx="80" cy="25" r="0.5" fill="rgba(255,255,255,0.3)"/><circle cx="30" cy="70" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="60" cy="90" r="0.8" fill="rgba(255,255,255,0.3)"/></svg>');
            opacity: 0.1; /* Giảm độ đậm của hiệu ứng sao */
            z-index: 0;
        }
        
        .chest-body > * {
             position: relative;
             z-index: 1;
        }

        .chest-title { 
            font-size: clamp(1.4rem, 4vw, 1.75rem); /* Giảm kích thước font */
            color: white; 
            font-weight: 900; 
            text-shadow: 1px 1px 4px rgba(0,0,0,0.5); /* Bóng đổ nhẹ hơn */
            margin-top: 0; 
            margin-bottom: 20px; 
            text-align: center; 
        }
        
        .help-icon { 
            position: absolute; top: 15px; right: 15px; width: 24px; height: 24px; /* Kích thước nhỏ hơn */
            border-radius: 50%; background-color: rgba(0, 0, 0, 0.3); 
            border: 1px solid rgba(255,255,255,0.5); /* Viền mỏng hơn */
            color: white; font-size: 16px; font-weight: bold; 
            cursor: pointer; display: flex; justify-content: center; align-items: center; 
            transition: all 0.2s ease; z-index: 2; 
        }
        .help-icon:hover { transform: scale(1.1); background-color: rgba(0, 0, 0, 0.5); }
        
        .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 20px; }
        .chest-image { flex: 1; min-width: 0; height: auto; }
        
        .info-bubble { 
            flex: 2; 
            background-color: rgba(10, 10, 20, 0.6); /* Nền tinh chỉnh */
            color: #d1d5db; /* Màu chữ dịu hơn */
            padding: 10px 15px; 
            border-radius: 8px; 
            border: 1px solid rgba(255, 255, 255, 0.1); /* Viền tinh chỉnh */
            font-size: 0.85rem; /* Chỉnh nhỏ lại */
            text-align: left; 
        }

        .pity-timer { text-align: center; color: #c5b8d9; font-weight: 500; font-size: 0.85rem; margin: 2px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        .highlight-purple { color: #d8b4fe; font-weight: bold; } /* Màu tím sáng hơn */
        
        /* --- THIẾT KẾ NÚT MỚI (NÂNG CẤP) --- */
        .action-button-group { display: flex; gap: 10px; width: 100%; }
        .chest-button {
            flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer;
            transition: transform 0.1s ease, box-shadow 0.1s ease;
            color: #ffffff; font-weight: 700; font-size: 0.95rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
            box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25); /* Giảm độ sâu của bóng */
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .chest-button:active {
            transform: translateY(2px);
            box-shadow: inset 0 -1px 0 rgba(0,0,0,0.25);
        }
        .btn-get-1 { background: linear-gradient(to top, #8b5cf6, #c084fc); } /* Gradient tím mới */
        .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); } /* Giữ nguyên màu xanh */
        
        .button-price {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            font-size: 0.85rem; color: white; font-weight: 600;
            background-color: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px;
            text-shadow: none;
        }

        .price-icon { width: 16px; height: 16px; }

        /* --- Overlay & Card styles (Giữ nguyên, đã tối ưu) --- */
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
        .card-opening-overlay { 
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background-color: rgba(10, 10, 20, 0.95);
            z-index: 1000; display: flex; justify-content: center; align-items: center; 
            animation: fade-in-overlay 0.5s ease; 
            overflow: hidden; padding: 20px 15px; box-sizing: border-box; 
        }
        .overlay-content { width: 100%; max-width: 900px; }
        .overlay-footer { 
            position: fixed; bottom: 0; left: 0; width: 100%; 
            padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; 
            background: rgba(10, 21, 46, 0.8);
            border-top: 1px solid rgba(255, 255, 255, 0.1); 
            z-index: 1010; 
        }

        .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .footer-btn.primary { border-color: #a78bfa; color: #a78bfa; }
        .footer-btn.primary:hover { background-color: #a78bfa; color: #1e293b; }
        .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; background-color: transparent; }
        .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; will-change: transform; }
        .card-container.flipped .card-inner { transform: rotateY(180deg); }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #a78bfa; text-shadow: 0 0 10px #a78bfa; }
        .card-front { transform: rotateY(180deg); padding: 6px; box-sizing: border-box; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.18); }
        .card-image-in-card { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; justify-content: center; margin: 0 auto; grid-template-columns: repeat(2, 1fr); }
        @keyframes deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .card-wrapper.dealt-in { animation: deal-in 0.5s ease-out forwards; }
    `}
    </style>
);

// ========================================================================
// === 2. DỮ LIỆU & HÀM HỖ TRỢ (KHÔNG ĐỔI) =================================
// ========================================================================
const RARITIES = { COMMON: { name: 'Thường', colorClass: 'rarity-common', probability: 0.6 }, RARE: { name: 'Hiếm', colorClass: 'rarity-rare', probability: 0.25 }, EPIC: { name: 'Sử Thi', colorClass: 'rarity-epic', probability: 0.12 }, LEGENDARY: { name: 'Huyền Thoại', colorClass: 'rarity-legendary', probability: 0.03 }};
const CHAMPIONS_POOL = [ { name: 'Aatrox', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg' }, { name: 'Ahri', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg' }, { name: 'Yasuo', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg' }, { name: 'Jinx', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg' }, { name: 'Lux', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg' }, { name: 'Garen', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg' }, { name: 'Zed', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg' }, { name: 'Irelia', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Irelia_0.jpg' }, { name: 'Kai\'Sa', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg' }, { name: 'Lee Sin', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_0.jpg' }];
const generateRandomCard = () => { const randomChamp = CHAMPIONS_POOL[Math.floor(Math.random() * CHAMPIONS_POOL.length)]; let randomRarity = RARITIES.COMMON; const rand = Math.random(); let cumulativeProbability = 0; for (const key in RARITIES) { cumulativeProbability += RARITIES[key].probability; if (rand <= cumulativeProbability) { randomRarity = RARITIES[key]; break; } } return { ...randomChamp, rarity: randomRarity, id: Math.random() }; };

// ========================================================================
// === 3. CÁC COMPONENT CON (KHÔNG ĐỔI) ===================================
// ========================================================================

const Card = ({ cardData, isFlipped }: { cardData: any, isFlipped: boolean }) => {
    const { name, image } = cardData;
    return (
        <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-inner">
                <div className="card-face card-back">?</div>
                <div className="card-face card-front">
                    <img src={image} alt={name} className="card-image-in-card" />
                </div>
            </div>
        </div>
    );
};

const SingleCardOpener = ({ onClose }: { onClose: () => void }) => {
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
                <button onClick={onClose} className="footer-btn">Đóng</button>
            </div>
        </>
    );
};

const FourCardsOpener = ({ onClose }: { onClose: () => void }) => {
    const [cards, setCards] = useState<any[]>([]);
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
                const flipCardSequentially = (index: number) => {
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
            case 'DEALING': return { text: 'Đang chia bài...', disabled: true };
            case 'FLIPPING': return { text: 'Đang lật...', disabled: true };
            case 'REVEALED': return { text: 'Mở Lại x4', disabled: false };
            default: return { text: '', disabled: true };
        }
    };
    
    const buttonProps = getButtonProps();

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div className="four-card-grid-container">
                    {cards.map((card, index) => (
                        <div key={card.id} className={`card-wrapper ${cards.length > 0 ? 'dealt-in' : ''}`} style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}>
                            <Card cardData={card} isFlipped={flippedIndices.has(index)} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="overlay-footer">
                <button onClick={startNewRound} className="footer-btn primary" disabled={buttonProps.disabled}>{buttonProps.text}</button>
                <button onClick={onClose} className="footer-btn">Đóng</button>
            </div>
        </>
    );
};

// --- COMPONENT RƯƠNG TÁI SỬ DỤNG (KHÔNG ĐỔI) ---
interface ChestUIProps {
    headerTitle: string;
    mainTitle: string;
    imageUrl: string;
    infoText: React.ReactNode;
    pityLine1: React.ReactNode;
    pityLine2: React.ReactNode;
    price1: number;
    price10: number;
    onOpen1: () => void;
    onOpen10: () => void;
}

const ChestUI: React.FC<ChestUIProps> = ({
    headerTitle, mainTitle, imageUrl, infoText,
    pityLine1, pityLine2, price1, price10,
    onOpen1, onOpen10
}) => {
    return (
        <div className="chest-ui-container">
            <header className="chest-header">{headerTitle}</header>
            <main className="chest-body">
                <button className="help-icon">?</button>
                <h1 className="chest-title">{mainTitle}</h1>
                <div className="chest-visual-row">
                    <img src={imageUrl} alt={mainTitle} className="chest-image" />
                    <div className="info-bubble">{infoText}</div>
                </div>
                {pityLine1 && <p className="pity-timer">{pityLine1}</p>}
                {pityLine2 && <p className="pity-timer">{pityLine2}</p>}
                <div className="action-button-group" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <button className="chest-button btn-get-1" onClick={onOpen1}>
                        <span>x1</span>
                        <span className="button-price">
                            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="price icon" className="price-icon" />
                            {price1}
                        </span>
                    </button>
                    <button className="chest-button btn-get-10" onClick={onOpen10}>
                        <span>x4</span>
                        <span className="button-price">
                            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="price icon" className="price-icon" />
                            {price10}
                        </span>
                    </button>
                </div>
            </main>
        </div>
    );
};


// --- "DATABASE" CỦA CÁC RƯƠNG (KHÔNG ĐỔI) ---
const CHEST_DATA = [
    {
        id: 'legendary_chest',
        headerTitle: "Basic Vocabulary",
        mainTitle: "",
        imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png",
        infoText: <>3.000 Vocabulary words</>,
        pityLine1: '',
        pityLine2: '',
        price1: 320,
        price10: 2980,
    },
    {
        id: 'tech_chest',
        headerTitle: "Rương Giới Hạn",
        mainTitle: "Rương Công Nghệ",
        imageUrl: "https://static.wikia.nocookie.net/survivorio/images/c/c5/Epic_Parts_Crate_x10.png/revision/latest/scale-to-width-down/1000?cb=20221102144342",
        infoText: <>Tăng tỉ lệ nhận <span className="highlight-purple">Trang bị Công nghệ</span></>,
        pityLine1: <>Nhận <span className="highlight-purple">Hiếm</span> trong 5 lần mở</>,
        pityLine2: <>Nhận <span className="highlight-purple">Sử thi</span> trong 30 lần mở</>,
        price1: 150,
        price10: 1350,
    },
    // ĐỂ THÊM RƯƠNG MỚI, CHỈ CẦN SAO CHÉP VÀ DÁN MỘT OBJECT TƯƠNG TỰ VÀO ĐÂY
];

// ========================================================================
// === 4. COMPONENT CHÍNH (APP) (KHÔNG ĐỔI) ===============================
// ========================================================================
interface VocabularyChestScreenProps {
    onClose: () => void;
}

const VocabularyChestScreen: React.FC<VocabularyChestScreenProps> = ({ onClose }) => {
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [singleKey, setSingleKey] = useState(Date.now());
    const [fourKey, setFourKey] = useState(Date.now());

    // Các hàm này có thể dùng cho bất kỳ rương nào
    const openSingle = () => { setSingleKey(Date.now()); setShowSingleOverlay(true); };
    const openFour = () => { setFourKey(Date.now()); setShowFourOverlay(true); };
    const closeSingle = () => setShowSingleOverlay(false);
    const closeFour = () => setShowFourOverlay(false);

    return (
        <>
            <GlobalStyles />
            
            {!showSingleOverlay && !showFourOverlay && (
                <button onClick={onClose} className="vocab-screen-close-btn" title="Đóng">
                    <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close" />
                </button>
            )}

            <div className="chest-gallery-container">
                {CHEST_DATA.map((chest) => (
                    <ChestUI
                        key={chest.id}
                        {...chest}
                        onOpen1={openSingle}
                        onOpen10={openFour}
                    />
                ))}
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

export default VocabularyChestScreen;
