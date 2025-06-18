import React from 'react';

// --- NEW SAMPLE DATA INSPIRED BY THE GAME IMAGE ---
const sampleCards = [
  { id: 1, name: 'Fireball', image: 'https://i.imgur.com/vHqV9Yw.png', level: 2, cards: 8, cardsToUpgrade: 10, rarity: 'epic', isUpgradeable: false, isLocked: false },
  { id: 2, name: 'Icicle', image: 'https://i.imgur.com/U3v2M9I.png', level: 7, cards: 11, cardsToUpgrade: 15, rarity: 'rare', isUpgradeable: false, isLocked: false },
  { id: 3, name: 'Magic Bolt', image: 'https://i.imgur.com/uSST3jF.png', level: 18, cards: 17, cardsToUpgrade: 23, rarity: 'common', isUpgradeable: false, isLocked: false },
  { id: 4, name: 'Laser', image: 'https://i.imgur.com/3sFm7Bw.png', level: 15, cards: 18, cardsToUpgrade: 18, rarity: 'rare', isUpgradeable: true, isLocked: false },
  { id: 5, name: 'Thunderbolt', image: 'https://i.imgur.com/uNrvfVB.png', level: 27, cards: 40, cardsToUpgrade: 40, rarity: 'common', isUpgradeable: true, isLocked: false },
  { id: 6, name: 'Log', image: 'https://i.imgur.com/f8s4Wu1.png', level: 108, cards: 150, cardsToUpgrade: 150, rarity: 'epic', isUpgradeable: true, isLocked: false },
  { id: 7, name: 'Windblow', image: 'https://i.imgur.com/f0yq5sL.png', level: 2, cards: 6, cardsToUpgrade: 10, rarity: 'epic', isUpgradeable: false, isLocked: false },
  { id: 8, name: 'Katana', image: 'https://i.imgur.com/dO2xoiw.png', level: 0, cards: 0, cardsToUpgrade: 0, rarity: 'epic', isUpgradeable: false, isLocked: true, unlockCondition: 'Unlocked at LVL 7' },
  { id: 9, name: 'Ice Block', image: 'https://i.imgur.com/Xw2Y5g9.png', level: 0, cards: 0, cardsToUpgrade: 0, rarity: 'common', isUpgradeable: false, isLocked: true, unlockCondition: 'Get Now!' },
];

// Replicate the grid for display purposes
const cardList = [...sampleCards];
// You can add more cards here to test scrolling if needed.

// --- STYLES COMPONENT (COMPLETELY REDESIGNED) ---
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@700;900&display=swap');

    body {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      background-color: #0d0f2b; /* Dark blue background from image */
      color: white;
      box-sizing: border-box;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }

    .app-container {
      padding: 20px 10px;
      max-width: 500px;
      margin: 0 auto;
    }

    .collection-header {
      background-color: #7b2cbf; /* Purple banner color */
      padding: 10px 20px;
      border-radius: 8px;
      border: 3px solid #c77dff;
      box-shadow: 0 4px 0 #5a189a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .collection-title {
      font-family: 'Lilita One', cursive; /* More playful, game-like font */
      font-size: 2.5rem;
      font-weight: 900;
      color: white;
      text-transform: uppercase;
      text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.25);
    }
    
    .collection-progress {
      font-family: 'Lilita One', cursive;
      font-size: 1.8rem;
      font-weight: 900;
      color: white;
      text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.25);
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .game-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 3 / 4;
      border-width: 5px;
      border-style: solid;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .game-card:hover {
        transform: translateY(-5px) scale(1.03);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    }

    /* Rarity Borders */
    .game-card.rarity-common { border-color: #00a8e8; }
    .game-card.rarity-rare { border-color: #f9c74f; }
    .game-card.rarity-epic { border-color: #d000ff; }

    .card-artwork {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .card-info-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px;
    }

    /* Name banner styling */
    .card-name-banner {
      width: 100%;
      padding: 5px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 5px;
    }
    .card-name-banner.rarity-common { background-color: #00a8e8; }
    .card-name-banner.rarity-rare { background-color: #f9c74f; }
    .card-name-banner.rarity-epic { background-color: #d000ff; }

    .card-name {
      color: white;
      font-size: 1rem;
      font-weight: 900;
      margin: 0;
      text-transform: capitalize;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
    }

    .card-progress-area {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 28px;
    }
    
    .level-badge {
      background-color: #0a8a7d;
      width: 32px;
      height: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      font-weight: 900;
      font-size: 1.1rem;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      flex-shrink: 0;
    }

    .xp-progress-container {
      flex-grow: 1;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      border: 1px solid #333;
    }

    .xp-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #9ef01a 0%, #70e000 100%);
      border-radius: 10px;
      transition: width 0.5s ease-in-out;
    }

    .xp-text {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: white;
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    .upgrade-arrow {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 30px;
      height: 30px;
      background-color: #38b000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      box-shadow: 0 0 10px #70e000;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    /* Locked Card Styles */
    .locked-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .lock-icon { font-size: 3rem; color: #a2d2ff; }
    .unlock-condition {
      background-color: rgba(0, 0, 0, 0.5);
      padding: 5px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.8rem;
      text-align: center;
    }
    .get-now-button {
      background: linear-gradient(180deg, #9ef01a, #38b000);
      color: white;
      font-weight: 900;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.9rem;
      box-shadow: 0 3px 0 #134611;
    }

    @media (max-width: 400px) {
      .card-grid { grid-template-columns: repeat(2, 1fr); }
      .collection-title { font-size: 1.8rem; }
      .collection-progress { font-size: 1.5rem; }
      .card-name { font-size: 0.8rem; }
    }
  `}</style>
);


// --- CARD COMPONENT (RESTRUCTURED) ---
const GameCard = ({ card }: { card: any }) => {
  const { name, image, level, cards, cardsToUpgrade, rarity, isUpgradeable, isLocked, unlockCondition } = card;

  const xpPercentage = isLocked ? 0 : (cards / cardsToUpgrade) * 100;

  return (
    <div className={`game-card rarity-${rarity}`}>
      <img src={image} alt={name} className="card-artwork" />

      {/* Conditional rendering for locked vs. unlocked cards */}
      {isLocked ? (
        <div className="locked-overlay">
          <span className="lock-icon">🔒</span>
          {unlockCondition === 'Get Now!' ? (
            <div className="get-now-button">🛒 Get Now!</div>
          ) : (
            <div className="unlock-condition">{unlockCondition}</div>
          )}
        </div>
      ) : (
        <>
          {isUpgradeable && <div className="upgrade-arrow">⬆️</div>}
          <div className="card-info-container">
            <div className={`card-name-banner rarity-${rarity}`}>
              <h3 className="card-name">{name}</h3>
            </div>
            <div className="card-progress-area">
              <div className="level-badge">{level}</div>
              <div className="xp-progress-container">
                <div className="xp-progress-fill" style={{ width: `${xpPercentage}%` }}></div>
                <span className="xp-text">{`${cards}/${cardsToUpgrade}`}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <>
      <GameStyles />
      <div className="app-container">
        <header className="collection-header">
            <h1 className="collection-title">Collection</h1>
            <span className="collection-progress">9/24</span>
        </header>
        <div className="card-grid">
          {cardList.map((card) => (
            <GameCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
