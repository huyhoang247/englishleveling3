import React, { useState, useEffect } from 'react';

// --- PHẦN CSS ĐÃ NÂNG CẤP ---
// CSS được định nghĩa như một chuỗi và sẽ được chèn vào component
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

    /* --- Keyframes cho các hiệu ứng động --- */
    @keyframes gradient-animation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes pulseGlow {
      0% { box-shadow: 0 0 15px 5px rgba(249, 168, 38, 0.7); }
      50% { box-shadow: 0 0 25px 10px rgba(249, 168, 38, 1); }
      100% { box-shadow: 0 0 15px 5px rgba(249, 168, 38, 0.7); }
    }
    
    @keyframes slideInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    /* --- Cài đặt chung --- */
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #6a11cb, #2575fc, #3f3c62);
      background-size: 200% 200%;
      margin: 0;
      overflow: hidden;
      animation: gradient-animation 15s ease infinite;
    }

    .game-wrapper {
        font-family: 'Poppins', sans-serif;
        color: white;
        width: 100%;
        max-width: 450px;
        margin: 20px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: fadeIn 0.8s ease-out;
    }

    .game-frame {
        background: radial-gradient(circle, #4a467a 0%, #3f3c62 100%);
        border-radius: 40px;
        border: 10px solid #2e2b4f;
        padding: 20px;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.5), 0 15px 40px rgba(0, 0, 0, 0.5);
        position: relative;
        z-index: 2;
        width: 100%;
        box-sizing: border-box;
    }

    .header {
        background: linear-gradient(135deg, #ffb74d 0%, #f9a826 100%);
        color: #3f3c62;
        text-align: center;
        padding: 10px 20px;
        border-radius: 20px;
        margin: -45px auto 20px auto;
        width: 85%;
        box-shadow: 0 8px 15px rgba(0,0,0,0.25);
        border: 4px solid #fffbe9;
        box-sizing: border-box;
        font-weight: 700;
    }

    .header h1 {
        margin: 0;
        font-size: 1.8em;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.4);
    }

    .header p {
        margin: 5px 0 0;
        font-size: 0.9em;
        font-weight: 400;
        opacity: 0.9;
    }

    .rewards-legend {
        margin-bottom: 25px;
        padding: 15px;
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .reward-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        opacity: 0.4;
        transform: scale(1);
        transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .reward-item:last-child {
        margin-bottom: 0;
    }

    .reward-item.found {
        opacity: 1;
        transform: scale(1.05);
    }

    .reward-icons {
        display: flex;
        gap: 5px;
    }

    .reward-icons span {
        background: #2e2b4f;
        border-radius: 8px;
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        transition: background-color 0.4s, color 0.4s;
    }

    .reward-item.found .reward-icons span {
        background: linear-gradient(135deg, #ffb74d 0%, #f9a826 100%);
        color: #3f3c62;
    }

    .reward-text {
        background-color: #2e2b4f;
        padding: 5px 15px;
        border-radius: 15px;
        font-size: 0.9em;
        font-weight: 600;
        min-width: 120px;
        text-align: center;
        transition: background-color 0.4s, color 0.4s;
    }
    
    .reward-item.found .reward-text {
        background: linear-gradient(135deg, #ffb74d 0%, #f9a826 100%);
        color: #3f3c62;
    }

    .game-board {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        perspective: 1200px;
    }

    .card {
        width: 100%;
        aspect-ratio: 1 / 1;
        cursor: pointer;
        background-color: transparent;
        border: none;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    /* Hiệu ứng nhấc lên khi hover vào thẻ chưa lật */
    .card:not(.flipped):not(.matched):hover {
        transform: translateY(-5px) scale(1.03);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }

    .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
        transform-style: preserve-3d;
    }

    .card.flipped .card-inner {
        transform: rotateY(180deg);
    }

    .card-front,
    .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2.5em;
        border: 4px solid rgba(249, 168, 38, 0.5);
    }

    .card-back {
        background: radial-gradient(circle, #4a90e2 0%, #2e86de 100%);
        color: white;
        font-size: 2.8em; /* Làm biểu tượng mặt sau to hơn */
    }

    .card-front {
        background-color: #5d589e; /* Màu sáng hơn một chút để nổi bật */
        color: white;
        transform: rotateY(180deg);
    }
    
    .card.matched .card-front {
        border-color: #fff;
        animation: pulseGlow 1.5s infinite ease-in-out;
    }

    .victory-message {
        margin-top: 20px;
        padding: 20px;
        background: linear-gradient(135deg, #f9a826, #ffb74d);
        color: #2e2b4f;
        border-radius: 15px;
        text-align: center;
        animation: slideInUp 0.5s ease-out forwards;
    }
    .victory-message h2 {
        margin: 0 0 15px 0;
        font-weight: 700;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.4);
    }

    .reset-button {
        background: #fff;
        color: #3f3c62;
        border: none;
        padding: 12px 30px;
        font-size: 1.1em;
        font-weight: bold;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease-in-out;
    }

    .reset-button:hover {
        background: #fffbe9;
        transform: translateY(-3px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.25);
    }
    .reset-button:active {
        transform: translateY(0px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .treasure-pile {
        height: 80px;
        background-color: #4d4980;
        border-bottom-left-radius: 40px;
        border-bottom-right-radius: 40px;
        position: relative;
        margin-top: -50px;
        z-index: 1;
        padding-top: 50px;
        box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.4);
        width: calc(100% - 40px);
        max-width: 430px;
        box-sizing: border-box;
    }
  `}</style>
);

// --- PHẦN LOGIC VÀ DỮ LIỆU ---

const CARD_TYPES = [
    { type: 'Gold', icon: '📦', reward: 'Vàng x16800' },
    { type: 'BigTreasure', icon: '💰', reward: 'Kho Báu Lớn' },
    { type: 'SmallTreasure', icon: '🪙', reward: 'Kho Báu Nhỏ' },
    { type: 'Gems', icon: '💎', reward: 'Đá Quý' },
];

const initializeDeck = () => {
    let id = 1;
    const deck = CARD_TYPES.flatMap(cardType => 
        Array(3).fill().map(() => ({
            id: id++,
            type: cardType.type,
            icon: cardType.icon,
            isFlipped: false,
            isMatched: false,
        }))
    );
    return deck.sort(() => Math.random() - 0.5);
};


// --- COMPONENT CHÍNH ---
function App() {
    const [cards, setCards] = useState(initializeDeck());
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedTypes, setMatchedTypes] = useState([]);
    const [canFlip, setCanFlip] = useState(true);

    useEffect(() => {
        if (flippedCards.length === 3) {
            setCanFlip(false);
            checkForMatch();
        }
    }, [flippedCards]); 

    const checkForMatch = () => {
        const [firstIndex, secondIndex, thirdIndex] = flippedCards;
        const cardType = cards[firstIndex].type;

        if (cards[secondIndex].type === cardType && cards[thirdIndex].type === cardType) {
            // TRÙNG KHỚP
            setCards(prev => prev.map(card => 
                card.type === cardType ? { ...card, isMatched: true } : card
            ));
            setMatchedTypes(prev => [...prev, cardType]);
            resetTurn();
        } else {
            // KHÔNG TRÙNG KHỚP
            setTimeout(() => {
                setCards(prev => prev.map((card, index) => 
                    flippedCards.includes(index) ? { ...card, isFlipped: false } : card
                ));
                resetTurn();
            }, 1200);
        }
    };

    const resetTurn = () => {
        setFlippedCards([]);
        setCanFlip(true);
    };
    
    const handleCardClick = (index) => {
        if (!canFlip || cards[index].isFlipped || cards[index].isMatched) {
            return;
        }
        
        setCards(prev => prev.map((card, i) => 
            i === index ? { ...card, isFlipped: true } : card
        ));
        setFlippedCards(prev => [...prev, index]);
    };

    const handleResetGame = () => {
        setMatchedTypes([]);
        setFlippedCards([]);
        setCanFlip(true);
        setCards(initializeDeck());
    }

    const allMatched = matchedTypes.length === CARD_TYPES.length;

    return (
        <div className="game-wrapper">
            <GameStyles />
            <div className="game-frame">
                <div className="header">
                    <h1>Dig for treasure</h1>
                    <p>Flip 3 identical cards to win rewards</p>
                </div>

                <div className="rewards-legend">
                    {CARD_TYPES.map(reward => (
                        <div 
                            key={reward.type} 
                            className={`reward-item ${matchedTypes.includes(reward.type) ? 'found' : ''}`}
                        >
                            <div className="reward-icons">
                                <span>{reward.icon}</span>
                                <span>{reward.icon}</span>
                                <span>{reward.icon}</span>
                            </div>
                            <div className="reward-text">{reward.reward}</div>
                        </div>
                    ))}
                </div>

                <div className="game-board">
                    {cards.map((card, index) => (
                        <div 
                            key={card.id} 
                            className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                            onClick={() => handleCardClick(index)}
                        >
                            <div className="card-inner">
                                <div className="card-front">{card.icon}</div>
                                <div className="card-back">🧭</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {allMatched && (
                    <div className="victory-message">
                        <h2>Chúc mừng! Bạn đã tìm thấy tất cả kho báu!</h2>
                        <button onClick={handleResetGame} className="reset-button">Chơi lại</button>
                    </div>
                )}
            </div>
            <div className="treasure-pile"></div>
        </div>
    );
}

export default App; 
