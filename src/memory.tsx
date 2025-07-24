import React, { useState, useEffect } from 'react';

// --- PHẦN CSS ---
// CSS được định nghĩa như một chuỗi và sẽ được chèn vào component
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

    body {
      margin: 0;
      background-color: #1A202C;
      overflow: hidden;
    }

    .game-wrapper {
        font-family: 'Poppins', sans-serif;
        color: white;
        width: 100vw;
        height: 100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #1A202C;
    }

    .game-frame {
        background-color: transparent;
        border-radius: 0;
        border: none;
        padding: 40px 20px 20px 20px;
        box-shadow: none;
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 500px;
        box-sizing: border-box;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .rewards-legend {
        margin-bottom: 25px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
    }

    .reward-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        opacity: 0.5;
        transition: opacity 0.3s ease;
    }
    .reward-item:last-child {
        margin-bottom: 0;
    }

    .reward-item.found {
        opacity: 1;
    }

    .reward-icons {
        display: flex;
        gap: 4px;
    }

    .reward-icons span {
        background: #2D3748;
        border-radius: 5px;
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
    }

    .reward-item.found .reward-icons span {
        background: #f9a826;
        color: #1A202C;
    }

    .reward-text {
        background-color: #2D3748;
        padding: 5px 15px;
        border-radius: 15px;
        font-size: 0.9em;
        font-weight: 600;
        min-width: 120px;
        text-align: center;
    }
    .reward-item.found .reward-text {
        background-color: #f9a826;
        color: #1A202C;
    }

    .game-board {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        perspective: 1000px;
        margin-top: auto;
        margin-bottom: 20px;
    }

    .card {
        width: 100%;
        aspect-ratio: 1 / 1;
        cursor: pointer;
        background-color: transparent;
        border: none;
    }

    .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.6s;
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
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2.5em;
        /* --- THAY ĐỔI: Viền nhỏ lại và đổi màu xám --- */
        border: 2px solid #6B7280;
    }

    .card-back {
        background-color: #2e86de;
        color: white;
    }

    .card-front {
        background-color: #1A202C;
        color: white;
        transform: rotateY(180deg);
    }
    
    .card.matched .card-front {
        /* --- THAY ĐỔI: Đồng bộ màu glow khi match --- */
        box-shadow: 0 0 15px 4px #6B7280;
        border-color: #fff;
    }

    .victory-message {
        margin-top: 20px;
        padding: 15px;
        background-color: rgba(0,0,0,0.2);
        border-radius: 10px;
        text-align: center;
    }

    .reset-button {
        background-color: #f9a826;
        color: white;
        border: none;
        padding: 12px 25px;
        font-size: 1.1em;
        font-weight: bold;
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.3s;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        margin-top: 10px;
    }

    .reset-button:hover {
        background-color: #e89a1f;
    }
    
    .treasure-pile {
        height: 60px;
        background-color: #2D3748;
        border-radius: 0;
        position: relative;
        z-index: 1;
        padding: 0;
        box-shadow: 0 -10px 20px rgba(0, 0, 0, 0.3) inset;
        width: 100%;
        max-width: 500px;
        box-sizing: border-box;
    }
  `}</style>
);

// --- PHẦN LOGIC VÀ DỮ LIỆU (KHÔNG THAY ĐỔI) ---

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


// --- COMPONENT CHÍNH (KHÔNG THAY ĐỔI) ---
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
    }, [flippedCards, cards]);

    const checkForMatch = () => {
        const [firstIndex, secondIndex, thirdIndex] = flippedCards;
        const cardType = cards[firstIndex].type;

        if (cards[secondIndex].type === cardType && cards[thirdIndex].type === cardType) {
            setCards(prev => prev.map(card => 
                card.type === cardType ? { ...card, isMatched: true } : card
            ));
            setMatchedTypes(prev => [...prev, cardType]);
            resetTurn();
        } else {
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
                                <div className="card-back">?</div>
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
