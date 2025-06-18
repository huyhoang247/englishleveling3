import React from 'react';

// DỮ LIỆU MẪU - Đã cập nhật XP để thấy rõ thanh tiến trình
const sampleCharacters = [
  { id: 1, name: 'Sarub', image: 'https://i.ibb.co/pPzR5dJ/sarub.png', cost: 1, stars: 5, classIcon: '🍃', xp: 3, xpMax: 5 },
  { id: 2, name: 'Jellible', image: 'https://i.ibb.co/VvzV1Y0/jellible.png', cost: 2, stars: 5, classIcon: '💭', xp: 5, xpMax: 5 },
  { id: 3, name: 'Cactu', image: 'https://i.ibb.co/3sX8xRz/cactu.png', cost: 1, stars: 5, classIcon: '🍃', xp: 1, xpMax: 5 },
  { id: 4, name: 'Nutmee', image: 'https://i.ibb.co/0V8k1q7/nutmee.png', cost: 3, stars: 4, classIcon: '👊', xp: 4, xpMax: 5 },
  { id: 5, name: 'Kakka', image: 'https://i.ibb.co/6PqjXfG/kakka.png', cost: 2, stars: 5, classIcon: '👊', xp: 0, xpMax: 5 },
];

// LOGIC TẠO LƯỚI
const characterList = [];
for (let i = 0; i < 12; i++) {
  characterList.push(...sampleCharacters.map(char => ({ ...char, id: char.id + i * 5 })));
}

// Component để nhúng CSS - PHIÊN BẢN NÂNG CẤP "GAME-LIKE"
const GameStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap');

    body {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      /* Nền gradient thay vì màu phẳng */
      background: radial-gradient(circle, #2a3a5c 0%, #1a2a4c 100%);
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
      font-size: 2.8rem;
      font-weight: 900;
      color: #ffdd40; /* Màu vàng sáng hơn */
      text-transform: uppercase;
      letter-spacing: 3px;
      /* Hiệu ứng text-shadow nổi khối và phát sáng */
      text-shadow: 0 0 10px #ffc107, 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
      margin-bottom: 30px;
    }

    .character-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px; /* Tăng khoảng cách */
    }

    .character-card {
      /* Nền gradient tối và sang trọng hơn */
      background: linear-gradient(145deg, #4d5a7a, #2c3a5f);
      border: none; /* Bỏ border cũ */
      border-radius: 18px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      /* Hiệu ứng khung viền nổi và đổ bóng ấn tượng hơn */
      box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.4), /* Bóng đổ chính */
        inset 0 1px 2px rgba(255, 255, 255, 0.2), /* Viền sáng bên trong */
        inset 0 -1px 2px rgba(0, 0, 0, 0.4), /* Viền tối bên trong */
        0 0 0 2px #a8b8d8, /* Viền ngoài màu sáng */
        0 0 0 4px #3c5d9a; /* Viền ngoài màu tối */
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .character-card:hover {
      transform: translateY(-8px) scale(1.03);
      /* Thêm hiệu ứng phát sáng khi hover */
      box-shadow: 
        0 18px 35px rgba(0, 0, 0, 0.5),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -1px 2px rgba(0, 0, 0, 0.4),
        0 0 0 2px #a8b8d8,
        0 0 0 4px #3c5d9a,
        0 0 20px rgba(173, 216, 230, 0.7); /* Glow effect */
    }

    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; }
    .cost-badge { background-color: #2a3a5c; border: 2px solid #a8b8d8; width: 32px; height: 36px; display: flex; justify-content: center; align-items: center; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); font-weight: 900; font-size: 1.2rem; color: #ffdd40; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); }
    .star-rating { font-size: 1.2rem; }
    .star { color: rgba(0, 0, 0, 0.4); transition: color 0.3s, text-shadow 0.3s; }
    /* Hiệu ứng ngôi sao phát sáng */
    .star.filled { color: #ffeb3b; text-shadow: 0 0 5px #ffc107, 0 0 10px #ffc107; }
    .class-icon { background-color: #4d5a7a; border: 2px solid #a8b8d8; border-radius: 50%; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; box-shadow: inset 0 0 5px rgba(0,0,0,0.4); }
    
    .character-image-container { 
      margin: 10px 0; 
      background: #2c3a5f; 
      border-radius: 12px; 
      overflow: hidden; 
      aspect-ratio: 1 / 1; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      /* Thêm shadow lõm vào */
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    .character-image { width: 100%; height: 100%; object-fit: contain; display: block; filter: brightness(1.1); }
    
    .card-info { 
      /* Nền bán trong suốt thay vì màu đen */
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px; 
      padding: 8px 10px; 
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .character-name { color: white; font-size: 1.6rem; font-weight: 900; margin: 0; text-transform: capitalize; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); }
    
    .card-footer { padding: 10px 5px 5px 5px; margin-top: 4px; }
    .xp-bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    
    .puzzle-icon { font-size: 1.8rem; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5)); }
    .xp-text { font-size: 1.1rem; font-weight: 700; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7); }

    /* ==== THANH TIẾN TRÌNH XP ==== */
    .xp-progress-bar-container {
      flex-grow: 1; /* Để nó chiếm hết không gian còn lại */
      height: 14px;
      background-color: #1a2a4c;
      border-radius: 7px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
    }
    .xp-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 7px;
      transition: width 0.5s ease-in-out;
      box-shadow: 0 0 5px #00f2fe, 0 0 10px #4facfe;
    }
    
    /* ==== PHẦN RESPONSIVE ==== */
    @media (max-width: 900px) { .character-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) {
      .app-container { padding: 12px; }
      .main-title { font-size: 2rem; margin-bottom: 15px; }
      .character-grid { gap: 15px; }
      .character-card { padding: 8px; border-radius: 14px; }
      .character-name { font-size: 1.3rem; }
      .star-rating { font-size: 1rem; }
      .cost-badge, .class-icon { transform: scale(0.9); }
      .puzzle-icon { font-size: 1.5rem; width: 26px; height: 26px; }
      .xp-text { font-size: 1rem; }
      .xp-progress-bar-container { height: 12px; }
    }
    @media (max-width: 360px) { .character-grid { grid-template-columns: 1fr; } }
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

// COMPONENT CARD ĐƯỢC CẬP NHẬT VỚI THANH XP
const CharacterCard = ({ character }: { character: any }) => {
  const { name, image, cost, stars, classIcon, xp, xpMax } = character;
  
  // Tính toán % XP
  const xpPercentage = (xp / xpMax) * 100;

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
        {/* Cấu trúc HTML mới cho thanh XP */}
        <div className="xp-bar">
          <span className="puzzle-icon">🧩</span>
          <div className="xp-progress-bar-container">
            <div 
              className="xp-progress-bar-fill"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
          <span className="xp-text">{`${xp}/${xpMax}`}</span>
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
        <h1 className="main-title">Character Collection</h1>
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
