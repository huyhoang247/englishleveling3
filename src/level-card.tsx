import React from 'react';

// DỮ LIỆU MẪU
const sampleCharacters = [
  { id: 1, name: 'Sarub', image: 'https://i.ibb.co/pPzR5dJ/sarub.png', cost: 0, stars: 5, classIcon: '🍃', xp: 0, xpMax: 5, typeIcon: '🗡️', },
  { id: 2, name: 'Jellible', image: 'https://i.ibb.co/VvzV1Y0/jellible.png', cost: 0, stars: 5, classIcon: '💭', xp: 0, xpMax: 5, typeIcon: '💧', },
  { id: 3, name: 'Cactu', image: 'https://i.ibb.co/3sX8xRz/cactu.png', cost: 0, stars: 5, classIcon: '🍃', xp: 0, xpMax: 5, typeIcon: '🗡️', },
  { id: 4, name: 'Nutmee', image: 'https://i.ibb.co/0V8k1q7/nutmee.png', cost: 0, stars: 4, classIcon: '👊', xp: 0, xpMax: 5, typeIcon: '🗡️', },
  { id: 5, name: 'Kakka', image: 'https://i.ibb.co/6PqjXfG/kakka.png', cost: 0, stars: 5, classIcon: '👊', xp: 0, xpMax: 5, typeIcon: '💧', },
];

// LOGIC TẠO LƯỚI
const characterList = [];
for (let i = 0; i < 12; i++) {
  characterList.push(...sampleCharacters.map(char => ({...char, id: char.id + i * 5})));
}

// Component để nhúng CSS - PHIÊN BẢN HOÀN CHỈNH
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap');

    body {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      background-color: #1a2a4c;
      color: white;
      box-sizing: border-box;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }

    .app-container {
      padding: 20px;
      max-width: 1020px;
      margin: 0 auto;
    }

    .main-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 900;
      color: #ffc107;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      margin-bottom: 20px;
    }

    .character-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .character-card {
      background: linear-gradient(180deg, #eef5ff 0%, #d8e6ff 100%);
      border: 3px solid #6b9cff;
      border-radius: 18px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 2px #3c5d9a;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .character-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25);
    }

    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; }
    .cost-badge { background-color: #007bff; width: 30px; height: 34px; display: flex; justify-content: center; align-items: center; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); font-weight: 900; font-size: 1.1rem; color: white; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); }
    .star-rating { font-size: 1.2rem; }
    .star { color: #ccc; }
    .star.filled { color: #1a1a1a; }
    .class-icon { background-color: #f0f0f0; border: 2px solid #ccc; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; }
    .character-image-container { margin: 8px 0; background-color: #cddfff; border-radius: 12px; overflow: hidden; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; }
    .character-image { width: 100%; height: 100%; object-fit: contain; display: block; }
    .card-info { background-color: black; border-radius: 8px; padding: 8px 10px; text-align: center; }
    .character-name { color: white; font-size: 1.5rem; font-weight: 900; margin: 0; text-transform: capitalize; }
    .card-footer { background-color: black; border-radius: 8px; padding: 8px 10px; margin-top: 8px; }
    .xp-bar { display: flex; justify-content: space-between; align-items: center; }
    
    .puzzle-icon, .type-icon { font-size: 1.5rem; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; }
    .xp-text { font-size: 1.2rem; font-weight: 700; color: white; }

    /* ==== PHẦN RESPONSIVE ==== */

    @media (max-width: 900px) {
      .character-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .app-container {
        padding: 12px;
      }
      .main-title {
        font-size: 2rem;
        margin-bottom: 12px;
      }
      .character-grid {
        gap: 12px;
      }
      .character-card { padding: 6px; border-radius: 12px; }
      .character-name { font-size: 1.2rem; }
      .star-rating { font-size: 1rem; }
      .cost-badge { transform: scale(0.9); }
      .class-icon { transform: scale(0.9); }
      .puzzle-icon, .type-icon { font-size: 1.2rem; width: 24px; height: 24px; }
      .xp-text { font-size: 1rem; }
    }

    @media (max-width: 360px) {
      .character-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

// ==== CÁC COMPONENT CON ====
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(<span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>);
  }
  return <div className="star-rating">{stars}</div>;
};

const CharacterCard = ({ character }: { character: any }) => {
  const { name, image, cost, stars, classIcon, xp, xpMax, typeIcon } = character;
  return (
    <div className="character-card">
      <div className="card-header">
        <div className="cost-badge">{cost}</div>
        <StarRating rating={stars} />
        <div className="class-icon">{classIcon}</div>
      </div>
      <div className="character-image-container">
        <img src={image} alt={name} className="character-image" />
      </div>
      <div className="card-info">
        <h3 className="character-name">{name}</h3>
      </div>
      <div className="card-footer">
        <div className="xp-bar">
          <span className="puzzle-icon">🧩</span>
          <span className="xp-text">{`${xp}/${xpMax}`}</span>
          <span className="type-icon">{typeIcon}</span>
        </div>
      </div>
    </div>
  );
};

// ==== COMPONENT CHÍNH ====
function App() {
  return (
    <>
      <GameStyles />
      <div className="app-container">
        <h1 className="main-title">BỘ SƯU TẬP NHÂN VẬT</h1>
        <div className="character-grid">
          {characterList.map((char, index) => (
            <CharacterCard key={`${char.id}-${index}`} character={char} />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
