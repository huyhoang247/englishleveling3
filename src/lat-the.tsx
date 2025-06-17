import React, { useState, useEffect, useCallback } from 'react';

// ========================================================================
// === 1. CSS STYLES (Thiết kế cho giao diện danh sách nhỏ gọn) ============
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
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        }
        
        /* --- GIAO DIỆN DANH SÁCH RƯƠNG GỌN GÀNG --- */
        .compact-chest-gallery {
            width: 100%;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            gap: 15px; /* Khoảng cách giữa các rương */
        }
        
        .chest-row {
            display: flex;
            gap: 15px;
            padding: 15px;
            border-radius: 12px;
            background-color: rgba(40, 30, 50, 0.4); /* Nền mờ */
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .chest-row:hover {
            background-color: rgba(50, 40, 60, 0.6);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .chest-row__icon {
            width: 80px;
            height: 80px;
            flex-shrink: 0; /* Không cho icon bị co lại */
            border-radius: 8px;
            object-fit: contain; /* Hiển thị toàn bộ ảnh không bị cắt xén */
            background-color: rgba(0, 0, 0, 0.2);
        }

        .chest-row__details {
            flex-grow: 1; /* Lấp đầy không gian còn lại */
            display: flex;
            flex-direction: column;
            justify-content: space-between; /* Đẩy thông tin lên trên, nút bấm xuống dưới */
            min-width: 0; /* Fix lỗi flexbox cho text overflow */
        }
        
        .chest-row__info-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 5px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .chest-row__info-desc {
            font-size: 0.85rem;
            color: #d1c4e9; /* Màu tím nhạt */
            margin: 0;
            line-height: 1.4;
        }
        
        .highlight-pity {
            color: #ffcc80; /* Màu vàng cam nhạt */
            font-weight: 500;
        }
        
        .chest-row__actions {
            display: flex;
            gap: 10px;
            margin-top: 10px; /* Khoảng cách giữa info và buttons */
        }
        
        .compact-chest-button {
            flex: 1; /* Hai nút có chiều rộng bằng nhau */
            padding: 8px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 700;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .btn-compact-1 {
            background: linear-gradient(to top, #f9a825, #fdd835);
            color: #5d4037;
        }
        .btn-compact-1:hover { box-shadow: 0 0 10px #fdd835; }

        .btn-compact-10 {
            background: linear-gradient(to top, #66bb6a, #a5d6a7);
            color: #1b5e20;
        }
        .btn-compact-10:hover { box-shadow: 0 0 10px #a5d6a7; }
        
        .button-price {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            opacity: 0.8;
            margin-top: 2px;
        }

        /* --- Overlay & Card styles (Giữ nguyên không đổi) --- */
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
// === 2. DỮ LIỆU & HÀM HỖ TRỢ (Không đổi) =================================
// ========================================================================
const RARITIES = { COMMON: { name: 'Thường', colorClass: 'rarity-common', probability: 0.6 }, RARE: { name: 'Hiếm', colorClass: 'rarity-rare', probability: 0.25 }, EPIC: { name: 'Sử Thi', colorClass: 'rarity-epic', probability: 0.12 }, LEGENDARY: { name: 'Huyền Thoại', colorClass: 'rarity-legendary', probability: 0.03 }};
const CHAMPIONS_POOL = [ { name: 'Aatrox', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg' }, { name: 'Ahri', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg' }, { name: 'Yasuo', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg' }, { name: 'Jinx', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg' }, { name: 'Lux', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg' }, { name: 'Garen', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg' }, { name: 'Zed', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg' }, { name: 'Irelia', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Irelia_0.jpg' }, { name: 'Kai\'Sa', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg' }, { name: 'Lee Sin', image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_0.jpg' }];
const generateRandomCard = () => { const randomChamp = CHAMPIONS_POOL[Math.floor(Math.random() * CHAMPIONS_POOL.length)]; let randomRarity = RARITIES.COMMON; const rand = Math.random(); let cumulativeProbability = 0; for (const key in RARITIES) { cumulativeProbability += RARITIES[key].probability; if (rand <= cumulativeProbability) { randomRarity = RARITIES[key]; break; } } return { ...randomChamp, rarity: randomRarity, id: Math.random() }; };

// ========================================================================
// === 3. CÁC COMPONENT CON ================================================
// ========================================================================

// --- Card Opener Components (Giữ nguyên không đổi) ---
const Card = ({ cardData, isFlipped }: { cardData: any; isFlipped: boolean }) => {
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
    const [card, setCard] = useState(() => generateRandomCard());
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

// --- COMPONENT RƯƠNG GỌN GÀNG ---
interface CompactChestProps {
    title: string;
    imageUrl: string;
    description: React.ReactNode;
    price1: number;
    price10: number;
    onOpen1: () => void;
    onOpen10: () => void;
}

const CompactChestUI: React.FC<CompactChestProps> = ({
    title, imageUrl, description, price1, price10, onOpen1, onOpen10
}) => {
    return (
        <div className="chest-row">
            <img src={imageUrl} alt={title} className="chest-row__icon" />
            <div className="chest-row__details">
                <div className="chest-row__info">
                    <h3 className="chest-row__info-title">{title}</h3>
                    <p className="chest-row__info-desc">{description}</p>
                </div>
                <div className="chest-row__actions">
                    <button className="compact-chest-button btn-compact-1" onClick={onOpen1}>
                        Mở 1
                        <span className="button-price">
                            <span role="img" aria-label="gem">🟣</span> {price1}
                        </span>
                    </button>
                    <button className="compact-chest-button btn-compact-10" onClick={onOpen10}>
                        Mở 10
                        <span className="button-price">
                            <span role="img" aria-label="gem">🟣</span> {price10}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- "DATABASE" CỦA CÁC RƯƠNG ---
const CHEST_DATA = [
    {
        id: 'legendary_chest',
        title: "Rương Báu Huyền Thoại",
        imageUrl: "https://static.wikia.nocookie.net/survivorio/images/b/b3/S_Grade_Supplies_x10.png/revision/latest?cb=20230612142247",
        description: <>Chắc chắn nhận <span className="highlight-pity">S-Sử Thi</span> trong 50 lần mở.</>,
        price1: 320,
        price10: 2980,
    },
    {
        id: 'tech_chest',
        title: "Rương Công Nghệ",
        imageUrl: "https://static.wikia.nocookie.net/survivorio/images/c/c5/Epic_Parts_Crate_x10.png/revision/latest?cb=20221102144342",
        description: <>Tăng tỉ lệ nhận trang bị Công nghệ. Bảo hiểm <span className="highlight-pity">Sử Thi</span> mỗi 30 lần.</>,
        price1: 150,
        price10: 1350,
    },
    {
        id: 'army_chest',
        title: "Rương Quân Nhu EDF",
        imageUrl: "https://static.wikia.nocookie.net/survivorio/images/a/a2/Army_Crate_x10.png/revision/latest?cb=20220816140510",
        description: <>Rương cơ bản. Chắc chắn nhận <span className="highlight-pity">Hiếm</span> trong 10 lần mở.</>,
        price1: 80,
        price10: 720,
    },
    // Bạn có thể thêm rương mới tại đây một cách dễ dàng!
];

// ========================================================================
// === 4. COMPONENT CHÍNH (APP) ===========================================
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
            
            <div className="compact-chest-gallery">
                {CHEST_DATA.map((chest) => (
                    <CompactChestUI
                        key={chest.id}
                        {...chest}
                        onOpen1={openSingle}
                        onOpen10={openFour}
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
