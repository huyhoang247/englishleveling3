import React, { useState, useEffect, useCallback } from 'react';

// ========================================================================
// === 1. CSS STYLES ======================================================
// ========================================================================
const GlobalStyles = () => (
    <style>{`
        /* --- Cài đặt chung & Nền --- */
        body {
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
            padding: 40px 20px;
            box-sizing: border-box;
        }
        
        /* Container để chứa nhiều rương */
        .chest-gallery-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 40px;
            width: 100%;
        }

        /* --- GIAO DIỆN RƯƠNG BÁU --- */
        .chest-ui-container {
            width: 100%;
            max-width: 420px; /* Kích thước nhỏ gọn hơn */
            min-width: 300px;
            background-color: #3e2723;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            border: 2px solid #5d4037;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .chest-ui-container:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .chest-header { padding: 10px 20px; background-color: #4e342e; font-size: 1rem; font-weight: 700; color: #d7ccc8; border-bottom: 2px solid #5d4037; text-align: center; }
        .chest-body { background-color: #ff9a42; padding: 20px; border-top: 8px solid #d15c0a; position: relative; flex-grow: 1; display: flex; flex-direction: column; align-items: center; }
        .chest-title { font-size: clamp(1.5rem, 5vw, 2rem); color: white; font-weight: 900; text-shadow: 2px 2px 0px #8c420b; margin-top: 0; margin-bottom: 15px; text-align: center; }
        .help-icon { position: absolute; top: 15px; right: 15px; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(0, 0, 0, 0.2); border: 2px solid white; color: white; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.2s ease; z-index: 2; }
        .help-icon:hover { transform: scale(1.1); background-color: rgba(0, 0, 0, 0.4); }
        
        .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 15px; }
        .chest-image { flex: 1; min-width: 0; height: auto; }
        .info-bubble { flex: 2; background-color: #6a2e35; color: white; padding: 10px 15px; border-radius: 8px; border: 2px solid #a1887f; font-size: 0.9rem; text-align: left; }
        .pity-timer { text-align: center; color: #d15c0a; font-weight: 700; font-size: 0.9rem; margin: 2px 0; }
        .highlight-purple { color: #8e24aa; font-weight: bold; }
        
        /* --- THIẾT KẾ NÚT MỚI --- */
        .action-button-group { display: flex; gap: 10px; width: 100%; }
        .chest-button {
            flex: 1;
            padding: 10px 12px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            transition: transform 0.1s ease, box-shadow 0.1s ease;
            color: #3e2723;
            font-weight: 700; /* Tăng độ đậm */
            font-size: 0.95rem;
            text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.2);
            box-shadow: inset 0 -4px 0 rgba(0,0,0,0.25);
            
            /* Dàn layout cho nội dung bên trong nút */
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .chest-button:active {
            transform: translateY(2px);
            box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25); /* Hiệu ứng lún xuống */
        }
        .btn-get-1 { background: linear-gradient(to top, #f59e0b, #fcd34d); }
        .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); }
        
        .button-price {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 0.85rem;
            color: white;
            font-weight: 600;
            background-color: rgba(0,0,0,0.2);
            padding: 3px 8px;
            border-radius: 12px;
            text-shadow: none;
        }

        /* --- Overlay & Card styles --- */
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
        .card-opening-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(10, 10, 20, 0.9); backdrop-filter: blur(8px); z-index: 1000; display: flex; justify-content: center; align-items: center; animation: fade-in-overlay 0.5s ease; overflow: hidden; padding: 20px 15px; box-sizing: border-box; }
        .overlay-content { width: 100%; max-width: 900px; }
        .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.5); backdrop-filter: blur(10px); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
        .footer-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.5); color: rgba(255, 255, 255, 0.8); padding: 8px 25px; font-size: 14px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .footer-btn:hover { background-color: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .footer-btn.primary { border-color: #e94560; color: #e94560; }
        .footer-btn.primary:hover { background-color: #e94560; color: #16213e; }
        .footer-btn:disabled { color: rgba(255, 255, 255, 0.4); border-color: rgba(255, 255, 255, 0.2); cursor: not-allowed; background-color: transparent; }
        .card-container { width: 100%; aspect-ratio: 5 / 7; perspective: 1000px; display: inline-block; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; will-change: transform; }
        .card-container.flipped .card-inner { transform: rotateY(180deg); }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .card-back { background: linear-gradient(45deg, #16213e, #0f3460); border: 2px solid #533483; display: flex; justify-content: center; align-items: center; font-size: 15vw; color: #e94560; text-shadow: 0 0 10px #e94560; }
        .card-front { transform: rotateY(180deg); padding: 6px; box-sizing: border-box; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.18); }
        .card-image-in-card { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .four-card-grid-container { width: 100%; max-width: 550px; display: grid; gap: 15px; justify-content: center; margin: 0 auto; grid-template-columns: repeat(2, 1fr); }
        @keyframes deal-in { from { opacity: 0; transform: translateY(50px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .card-wrapper.dealt-in { animation: deal-in 0.5s ease-out forwards; }
    `}
    </style>
);

// ========================================================================
// === 2. DỮ LIỆU & HÀM HỖ TRỢ ============================================
// ========================================================================
const RARITIES = { COMMON: { name: 'Thường', colorClass: 'rarity-common', probability: 0.6 }, RARE: { name: 'Hiếm', colorClass: 'rarity-rare', probability: 0.25 }, EPIC: { name: 'Sử Thi', colorClass: 'rarity-epic', probability: 0.12 }, LEGENDARY: { name: 'Huyền Thoại', colorClass: 'rarity-legendary', probability: 0.03 }};
const CHAMPIONS_POOL = [ { name: 'Aatrox', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg' }, { name: 'Ahri', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg' }, { name: 'Yasuo', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg' }, { name: 'Jinx', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg' }, { name: 'Lux', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg' }, { name: 'Garen', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg' }, { name: 'Zed', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg' }, { name: 'Irelia', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Irelia_0.jpg' }, { name: 'Kai\'Sa', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg' }, { name: 'Lee Sin', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_0.jpg' }];
const generateRandomCard = () => { const randomChamp = CHAMPIONS_POOL[Math.floor(Math.random() * CHAMPIONS_POOL.length)]; let randomRarity = RARITIES.COMMON; const rand = Math.random(); let cumulativeProbability = 0; for (const key in RARITIES) { cumulativeProbability += RARITIES[key].probability; if (rand <= cumulativeProbability) { randomRarity = RARITIES[key]; break; } } return { ...randomChamp, rarity: randomRarity, id: Math.random() }; };

// ========================================================================
// === 3. CÁC COMPONENT CON ================================================
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

// --- COMPONENT RƯƠNG TÁI SỬ DỤNG ---
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
                        <span>Mở 1 lần</span>
                        <span className="button-price">
                            <span role="img" aria-label="gem">🟣</span> {price1}
                        </span>
                    </button>
                    <button className="chest-button btn-get-10" onClick={onOpen10}>
                        <span>Mở 10 lần</span>
                        <span className="button-price">
                            <span role="img" aria-label="gem">🟣</span> {price10}
                        </span>
                    </button>
                </div>
            </main>
        </div>
    );
};


// --- "DATABASE" CỦA CÁC RƯƠNG ---
const CHEST_DATA = [
    {
        id: 'legendary_chest',
        headerTitle: "Rương Sự Kiện",
        mainTitle: "Rương Báu Huyền Thoại",
        imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png",
        infoText: <>Có thể nhận trang bị <span className="highlight-purple">Sử thi hạng S</span></>,
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
// === 4. COMPONENT CHÍNH (APP) ===========================================
// ========================================================================
function App() {
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
            
            <div className="chest-gallery-container">
                {CHEST_DATA.map((chest) => (
                    <ChestUI
                        key={chest.id}
                        {...chest} // Truyền tất cả dữ liệu từ object chest vào component
                        onOpen1={openSingle} // Gắn hàm mở 1 thẻ
                        onOpen10={openFour}  // Gắn hàm mở nhiều thẻ (hiện là 4)
                    />
                ))}
            </div>

            {/* Phần Overlay không thay đổi, sẽ được kích hoạt bởi bất kỳ rương nào */}
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
