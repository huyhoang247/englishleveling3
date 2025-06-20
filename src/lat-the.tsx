// --- START OF FILE lat-the.tsx (ĐÃ HỢP NHẤT) ---

import React, { useState, useEffect, useCallback } from 'react';

// NEW: Import các tài nguyên cần thiết từ treasure.tsx
import { db } from './firebase.js'; // Điều chỉnh đường dẫn nếu cần
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { defaultImageUrls } from './image-url.ts'; // Điều chỉnh đường dẫn nếu cần

// ========================================================================
// === 1. CSS STYLES (Không đổi) ==========================================
// ========================================================================
const GlobalStyles = () => (
    // ... (Giữ nguyên toàn bộ phần style của bạn) ...
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
            justify-content: center; /* Sẽ bị ghi đè bởi padding-top */
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        }
        
        /* === HEADER CỐ ĐỊNH === */
        .main-header {
            position: fixed;
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
        }

        .header-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #e0e0e0;
            margin: 0;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        /* === Nút đóng được tích hợp vào header === */
        .vocab-screen-close-btn {
            width: 44px;
            height: 44px;
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.2s ease, opacity 0.2s ease;
            opacity: 0.9;
            margin: -10px; 
            padding: 10px;
        }
        .vocab-screen-close-btn:hover { transform: scale(1.15); opacity: 1; }
        
        .vocab-screen-close-btn img {
            width: 24px;
            height: 24px;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }
        
        /* === CONTAINER RƯƠNG ĐƯỢC ĐẨY XUỐNG VÀ TÍNH TOÁN LẠI CHIỀU CAO === */
        .chest-gallery-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 30px;
            width: 100%;
            max-width: 1300px;
            overflow-y: auto;
            padding: 20px;
            max-height: calc(100vh - 101px);
            box-sizing: border-box;
            margin-top: 61px; /* Đẩy container xuống dưới header */
        }

        /* Tùy chỉnh thanh cuộn (giữ nguyên) */
        .chest-gallery-container::-webkit-scrollbar { width: 8px; }
        .chest-gallery-container::-webkit-scrollbar-track { background: rgba(10, 10, 20, 0.5); border-radius: 4px; }
        .chest-gallery-container::-webkit-scrollbar-thumb { background-color: #4a5588; border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
        .chest-gallery-container::-webkit-scrollbar-thumb:hover { background-color: #6366f1; }

        /* === GIAO DIỆN RƯƠNG BÁU (Không đổi) === */
        .chest-ui-container {
            width: 100%; max-width: 380px; min-width: 300px;
            background-color: #1a1f36; border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(76, 89, 186, 0.2);
            overflow: hidden; display: flex; flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative; border: none;
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
            padding: 25px 20px 20px 20px; position: relative; flex-grow: 1; 
            display: flex; flex-direction: column; align-items: center; overflow: hidden;
        }
        .chest-body::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: url('data:image/svg+xml,...'); opacity: 0.1; z-index: 0;
        }
        .chest-body > * { position: relative; z-index: 1; }
        .chest-title { 
            font-size: clamp(1.4rem, 4vw, 1.75rem); color: white; font-weight: 900; 
            text-shadow: 1px 1px 4px rgba(0,0,0,0.5); margin: 0 0 20px; text-align: center; 
        }
        .help-icon { 
            position: absolute; top: 15px; right: 15px; width: 24px; height: 24px;
            border-radius: 50%; background-color: rgba(0, 0, 0, 0.3); 
            border: 1px solid rgba(255,255,255,0.5); color: white; font-size: 16px; 
            font-weight: bold; cursor: pointer; display: flex; justify-content: center; 
            align-items: center; transition: all 0.2s ease; z-index: 2; 
        }
        .help-icon:hover { transform: scale(1.1); background-color: rgba(0, 0, 0, 0.5); }
        .chest-visual-row { display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 20px; }
        .chest-image { flex: 1; min-width: 0; height: auto; }
        .info-bubble { 
            flex: 2; background-color: rgba(10, 10, 20, 0.6); color: #d1d5db;
            padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.85rem; text-align: left; 
        }
        .pity-timer { text-align: center; color: #c5b8d9; font-weight: 500; font-size: 0.85rem; margin: 2px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        .highlight-purple { color: #d8b4fe; font-weight: bold; }
        .highlight-yellow { color: #facc15; font-weight: bold; }
        .highlight-red { color: #f87171; font-weight: bold; }
        
        .action-button-group { display: flex; gap: 10px; width: 100%; }
        .chest-button {
            flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer;
            transition: transform 0.1s ease, box-shadow 0.1s ease; color: #ffffff; 
            font-weight: 700; font-size: 0.95rem; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
            box-shadow: inset 0 -3px 0 rgba(0,0,0,0.25); display: flex; align-items: center; 
            justify-content: center; gap: 8px;
        }
        .chest-button:active { transform: translateY(2px); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.25); }
        .btn-get-1 { background: linear-gradient(to top, #8b5cf6, #c084fc); }
        .btn-get-10 { background: linear-gradient(to top, #16a34a, #4ade80); }
        .btn-free { background: linear-gradient(to top, #0e7490, #22d3ee); }
        
        .button-price {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            font-size: 0.85rem; color: white; font-weight: 600;
            background-color: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px;
            text-shadow: none;
        }
        .price-icon { width: 16px; height: 16px; }

        /* --- Overlay & Card styles (Không đổi) --- */
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
        .card-opening-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(10, 10, 20, 0.95); z-index: 1000; display: flex; justify-content: center; align-items: center; animation: fade-in-overlay 0.5s ease; overflow: hidden; padding: 20px 15px; box-sizing: border-box; }
        .overlay-content { width: 100%; max-width: 900px; }
        .overlay-footer { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 20px; background: rgba(10, 21, 46, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 1010; }
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

// NEW: Định nghĩa kiểu dữ liệu cho thẻ hình ảnh
interface ImageCard {
    id: number; // ID (1-based) để lưu vào Firestore
    url: string;  // URL của hình ảnh
}

// ========================================================================
// === 2. CÁC COMPONENT CON (ĐÃ SỬA ĐỔI) =================================
// ========================================================================

// CHANGED: Card component giờ nhận dữ liệu thẻ mới
const Card = ({ cardData, isFlipped }: { cardData: ImageCard, isFlipped: boolean }) => { 
    return (
        <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-inner">
                <div className="card-face card-back">?</div>
                <div className="card-face card-front">
                    {/* Sử dụng cardData.url thay vì cardData.image */}
                    <img src={cardData.url} alt={`Revealed content ${cardData.id}`} className="card-image-in-card" />
                </div>
            </div>
        </div>
    ); 
};

// CHANGED: SingleCardOpener giờ nhận thẻ từ props, không tự tạo nữa
const SingleCardOpener = ({ card, onClose, onOpenAgain }: { card: ImageCard, onClose: () => void, onOpenAgain: () => void }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setIsFlipped(true), 500);
        const t2 = setTimeout(() => setIsProcessing(false), 1300); // Thời gian chờ lật thẻ
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [card]); // Chạy lại animation khi thẻ thay đổi

    const handleOpenAgain = () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsFlipped(false);
        setTimeout(() => {
            onOpenAgain(); // Gọi hàm từ cha để lấy thẻ mới
        }, 600);
    }

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-block', maxWidth: '250px', width: '60vw', marginBottom: '20px' }}>
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

// CHANGED: FourCardsOpener giờ nhận mảng thẻ từ props
const FourCardsOpener = ({ cards, onClose, onOpenAgain }: { cards: ImageCard[], onClose: () => void, onOpenAgain: () => void }) => {
    const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
    const [phase, setPhase] = useState('DEALING');

    const startRound = useCallback(() => {
        setPhase('DEALING');
        setFlippedIndices(new Set());
        // Delay để người dùng thấy animation reset
        setTimeout(() => {
            const totalDealTime = 1000 + 80 * cards.length;
            setTimeout(() => {
                setPhase('FLIPPING');
                const flip = (i: number) => {
                    if (i >= cards.length) {
                        setTimeout(() => setPhase('REVEALED'), 800);
                        return;
                    }
                    setFlippedIndices(p => new Set(p).add(i));
                    setTimeout(() => flip(i + 1), 200);
                };
                flip(0);
            }, totalDealTime);
        }, 300);
    }, [cards]);

    useEffect(() => {
        if (cards.length > 0) {
            startRound();
        }
    }, [cards, startRound]);

    const handleOpenAgain = () => {
        if (phase !== 'REVEALED') return;
        onOpenAgain(); // Gọi hàm từ cha để lấy 4 thẻ mới
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
                            <Card cardData={card} isFlipped={flippedIndices.has(index)} />
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


// ... (Component ChestUI và CHEST_DATA giữ nguyên) ...
interface ChestUIProps {
    headerTitle: string;
    mainTitle: string;
    imageUrl: string;
    infoText: React.ReactNode;
    pityLine1: React.ReactNode;
    pityLine2: React.ReactNode;
    price1: number | string;
    price10: number | null;
    onOpen1: () => void;
    onOpen10: () => void;
}

const ChestUI: React.FC<ChestUIProps> = ({
    headerTitle, mainTitle, imageUrl, infoText,
    pityLine1, pityLine2, price1, price10,
    onOpen1, onOpen10
}) => {
    const isFree = typeof price1 === 'string';
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
                    <button className={`chest-button ${isFree ? 'btn-free' : 'btn-get-1'}`} onClick={onOpen1}>
                        <span>{isFree ? 'Mở' : 'Mở x1'}</span>
                        {typeof price1 === 'number' && (
                           <span className="button-price">
                                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="price icon" className="price-icon" />
                                {price1}
                            </span>
                        )}
                         {isFree && <span className="button-price">{price1}</span>}
                    </button>
                    {price10 !== null && (
                        <button className="chest-button btn-get-10" onClick={onOpen10}>
                            <span>Mở x4</span>
                            <span className="button-price">
                                <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="price icon" className="price-icon" />
                                {price10}
                            </span>
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

const CHEST_DATA = [
    { id: 'daily_chest', headerTitle: "Phúc Lợi Hàng Ngày", mainTitle: "Rương Miễn Phí", imageUrl: "https://static.wikia.nocookie.net/clashroyale/images/d/d7/Wooden_Chest.png/revision/latest?cb=20171228004133", infoText: <>Mở miễn phí mỗi ngày để nhận phần thưởng ngẫu nhiên. Làm mới sau 24 giờ.</>, pityLine1: '', pityLine2: '', price1: "Miễn Phí", price10: null, },
    { id: 'legendary_chest', headerTitle: "Basic Vocabulary", mainTitle: "Rương Từ Vựng", imageUrl: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%2017%2C%202025%2C%2002_38_14%20PM.png", infoText: <>3.000 từ vựng cơ bản. Nền tảng vững chắc cho việc học.</>, pityLine1: '', pityLine2: '', price1: 320, price10: 2980, },
    { id: 'tech_chest', headerTitle: "Rương Giới Hạn", mainTitle: "Rương Công Nghệ", imageUrl: "https://static.wikia.nocookie.net/survivorio/images/c/c5/Epic_Parts_Crate_x10.png/revision/latest/scale-to-width-down/1000?cb=20221102144342", infoText: <>Tăng tỉ lệ nhận <span className="highlight-purple">Trang bị Công nghệ</span></>, pityLine1: <>Nhận <span className="highlight-purple">Hiếm</span> trong 5 lần mở</>, pityLine2: <>Nhận <span className="highlight-purple">Sử thi</span> trong 30 lần mở</>, price1: 150, price10: 1350, },
    { id: 'ancient_chest', headerTitle: "Rương Sự Kiện", mainTitle: "Rương Cổ Vật", imageUrl: "https://static.wikia.nocookie.net/minecraftdungeons/images/9/93/Gilded_Obsidian_Chest.png/revision/latest?cb=20230601222415", infoText: <>Chứa các vật phẩm từ nền văn minh đã mất. Tăng tỉ lệ nhận <span className="highlight-yellow">Trang bị Cổ Đại</span>.</>, pityLine1: <>Chắc chắn nhận <span className="highlight-yellow">Sử Thi</span> trong 50 lần mở.</>, pityLine2: '', price1: 280, price10: 2500, },
    { id: 'ultimate_chest', headerTitle: "Tuyệt Phẩm S-Grade", mainTitle: "Rương Tối Thượng", imageUrl: "https://static.wikia.nocookie.net/survivorio/images/a/a2/S_Grade_Supplies_Crate_x10.png/revision/latest?cb=20221102144410", infoText: <>Cơ hội sở hữu các vật phẩm <span className="highlight-red">S-Grade</span> cực hiếm với sức mạnh vượt trội.</>, pityLine1: <>Chắc chắn nhận 1 <span className="highlight-red">Trang bị S-Grade</span> sau 80 lần mở.</>, pityLine2: <><span className="highlight-purple">Tăng mạnh</span> tỉ lệ nhận vật phẩm Sử thi & Huyền thoại.</>, price1: 500, price10: 4800, },
];

// ========================================================================
// === 3. COMPONENT CHÍNH (ĐÃ NÂNG CẤP LOGIC) ============================
// ========================================================================

// NEW: Cập nhật props cho component chính
interface VocabularyChestScreenProps {
    onClose: () => void;
    currentUserId: string | null;
    onCoinReward: (amount: number) => void;
    onGemReward: (amount: number) => void;
}

const VocabularyChestScreen: React.FC<VocabularyChestScreenProps> = ({ onClose, currentUserId, onCoinReward, onGemReward }) => {
    // MOVED: State và logic từ treasure.tsx được chuyển vào đây
    const [isLoading, setIsLoading] = useState(true);
    const [availableImageIndices, setAvailableImageIndices] = useState<number[]>([]);

    // State quản lý popup và dữ liệu thẻ
    const [showSingleOverlay, setShowSingleOverlay] = useState(false);
    const [showFourOverlay, setShowFourOverlay] = useState(false);
    const [cardsForPopup, setCardsForPopup] = useState<ImageCard[]>([]);

    // MOVED: useEffect để lấy dữ liệu từ Firestore
    useEffect(() => {
        const fetchOpenedImages = async () => {
            if (!currentUserId) {
                console.log("User not logged in. Initializing with all images.");
                setAvailableImageIndices(defaultImageUrls.map((_, index) => index));
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const userDocRef = doc(db, 'users', currentUserId);
            try {
                const userDocSnap = await getDoc(userDocRef);
                let openedImageIds: number[] = [];
                if (userDocSnap.exists() && userDocSnap.data()?.openedImageIds) {
                    openedImageIds = userDocSnap.data().openedImageIds;
                } else {
                   await setDoc(userDocRef, { openedImageIds: [] }, { merge: true });
                }

                const openedIndices = openedImageIds.map(id => id - 1);
                const allIndices = defaultImageUrls.map((_, index) => index);
                const remainingIndices = allIndices.filter(index => !openedIndices.includes(index));
                setAvailableImageIndices(remainingIndices);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setAvailableImageIndices(defaultImageUrls.map((_, index) => index));
            } finally {
                setIsLoading(false);
            }
        };

        fetchOpenedImages();
    }, [currentUserId]);

    // MOVED: Hàm cập nhật Firestore
    const addOpenedImagesToFirestore = async (imageIds: number[]) => {
        if (!currentUserId || imageIds.length === 0) return;
        const userDocRef = doc(db, 'users', currentUserId);
        try {
            await updateDoc(userDocRef, {
                openedImageIds: arrayUnion(...imageIds)
            });
            console.log(`Image IDs [${imageIds.join(', ')}] added to Firestore.`);
        } catch (error) {
            console.error("Error updating opened images in Firestore:", error);
        }
    };
    
    // NEW: Hàm xử lý logic mở thẻ
    const handleOpenCards = (count: 1 | 4) => {
        if (isLoading || availableImageIndices.length < count) {
            alert(`Không đủ ảnh để mở. Còn lại: ${availableImageIndices.length}`);
            return;
        }

        // Tạo một bản sao để thao tác, tránh thay đổi state trực tiếp
        let remainingIndices = [...availableImageIndices];
        const selectedCards: ImageCard[] = [];
        const selectedIds: number[] = [];

        for (let i = 0; i < count; i++) {
            const randomIndexInPool = Math.floor(Math.random() * remainingIndices.length);
            const originalImageIndex = remainingIndices[randomIndexInPool];
            
            selectedCards.push({
                id: originalImageIndex + 1,
                url: defaultImageUrls[originalImageIndex],
            });
            selectedIds.push(originalImageIndex + 1);

            // Xóa index đã chọn khỏi pool để không bị trùng
            remainingIndices.splice(randomIndexInPool, 1);
        }

        // Cập nhật state và firestore
        setAvailableImageIndices(remainingIndices);
        addOpenedImagesToFirestore(selectedIds);
        setCardsForPopup(selectedCards);

        // Hiển thị popup tương ứng
        if (count === 1) {
            setShowSingleOverlay(true);
        } else {
            setShowFourOverlay(true);
        }
    };
    
    // NEW: Hàm đóng popup và trao thưởng
    const handleCloseOverlay = (openedCount: number) => {
        setShowSingleOverlay(false);
        setShowFourOverlay(false);
        setCardsForPopup([]); // Reset dữ liệu thẻ
        
        // Trao thưởng (ví dụ: 10 coin, 1 gem mỗi thẻ)
        onCoinReward(10 * openedCount);
        onGemReward(1 * openedCount);
        console.log(`Bạn nhận được ${10 * openedCount} coin và ${1 * openedCount} gem!`);
    };

    if (isLoading) {
        return <div style={{color: 'white', fontSize: '1.5rem'}}>Đang tải dữ liệu rương...</div>;
    }

    return (
        <>
            <GlobalStyles />
            
            {!showSingleOverlay && !showFourOverlay && (
                <header className="main-header">
                    {/* NEW: Hiển thị số lượng ảnh còn lại */}
                    <h1 className="header-title">Chọn Rương ({`Còn ${availableImageIndices.length} ảnh`})</h1>
                    <button onClick={onClose} className="vocab-screen-close-btn" title="Đóng">
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close" />
                    </button>
                </header>
            )}

            <div className="chest-gallery-container">
                {CHEST_DATA.map((chest) => (
                    <ChestUI
                        key={chest.id}
                        {...chest}
                        onOpen1={() => handleOpenCards(1)}
                        // Mở 4 thẻ cho nút "Mở x10" cũ
                        onOpen10={() => handleOpenCards(4)} 
                    />
                ))}
            </div>

            {showSingleOverlay && cardsForPopup.length > 0 && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <SingleCardOpener 
                            card={cardsForPopup[0]} 
                            onClose={() => handleCloseOverlay(1)}
                            onOpenAgain={() => handleOpenCards(1)}
                        />
                    </div>
                </div>
            )}
            {showFourOverlay && cardsForPopup.length > 0 && (
                <div className="card-opening-overlay">
                    <div className="overlay-content">
                        <FourCardsOpener 
                            cards={cardsForPopup} 
                            onClose={() => handleCloseOverlay(4)}
                            onOpenAgain={() => handleOpenCards(4)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default VocabularyChestScreen;
