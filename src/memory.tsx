import React, { useState, useEffect } from 'react';

// --- PHẦN CSS ---
// CSS được định nghĩa như một chuỗi và sẽ được chèn vào component
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      margin: 0;
      overflow: hidden; /* Prevent scrollbars */
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
    }

    .game-frame {
        background-color: #3f3c62;
        border-radius: 40px;
        border: 10px solid #2e2b4f;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        position: relative;
        z-index: 2;
        width: 100%; /* Ensure it takes full width of wrapper */
        box-sizing: border-box; /* Include padding and border in the element's total width and height */
    }

    /* Đã xoá phần header, có thể xoá CSS này nếu muốn */
    /* .header {
        background-color: #f9a826;
        color: white;
        text-align: center;
        padding: 10px 20px;
        border-radius: 20px;
        margin: -40px auto 20px auto;
        width: 80%;
        box-shadow: 0 5px 10px rgba(0,0,0,0.2);
        border: 4px solid #fff;
        box-sizing: border-box;
    }

    .header h1 {
        margin: 0;
        font-size: 1.8em;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .header p {
        margin: 5px 0 0;
        font-size: 0.9em;
        font-weight: normal;
    } */

    .rewards-legend {
        /* Điều chỉnh lại margin-top vì đã xoá header */
        margin-top: 10px;
        margin-bottom: 25px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.1);
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
        background: #2e2b4f;
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
    }
    .reward-item.found .reward-text {
        background-color: #f9a826;
        color: #3f3c62;
    }

    .game-board {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        perspective: 1000px;
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
        border: 4px solid #f9a826;
    }

    .card-back {
        background-color: #2e86de;
        color: white;
    }

    .card-front {
        background-color: #3f3c62;
        color: white;
        transform: rotateY(180deg);
    }
    
    .card.matched .card-front {
        box-shadow: 0 0 15px 5px #f9a826;
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
        height: 80px;
        background-color: #4d4980;
        border-bottom-left-radius: 40px;
        border-bottom-right-radius: 40px;
        position: relative;
        margin-top: -50px;
        z-index: 1;
        padding-top: 50px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) inset;
        width: calc(100% - 40px); /* Adjust based on game-frame padding and border */
        max-width: 430px; /* Adjust based on game-frame max-width */
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
    }, [flippedCards, cards]); // Added cards to dependency array for checkForMatch to work correctly

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
        // Dùng một thẻ div để bao bọc cả game và style
        <div className="game-wrapper">
            <GameStyles /> {/* Chèn CSS vào đây */}
            <div className="game-frame">
                {/* --- PHẦN HEADER ĐÃ BỊ XOÁ --- */}
                {/* <div className="header">
                    <h1>Dig for treasure</h1>
                    <p>Flip 3 identical cards to win rewards</p>
                </div> */}

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
