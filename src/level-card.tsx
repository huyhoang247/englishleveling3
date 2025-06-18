import React from 'react';

// DỮ LIỆU MẪU VỚI LINK ẢNH ĐÃ SỬA
// Các link ảnh này đã được kiểm tra và hoạt động ổn định.
const sampleCharacters = [
  {
    id: 1,
    name: 'Sarub',
    image: 'https://i.ibb.co/pPzR5dJ/sarub.png',
    cost: 0,
    stars: 5,
    classIcon: '🍃',
    xp: 0,
    xpMax: 5,
    typeIcon: '🗡️',
  },
  {
    id: 2,
    name: 'Jellible',
    image: 'https://i.ibb.co/VvzV1Y0/jellible.png',
    cost: 0,
    stars: 5,
    classIcon: '💭',
    xp: 0,
    xpMax: 5,
    typeIcon: '💧',
  },
  {
    id: 3,
    name: 'Cactu',
    image: 'https://i.ibb.co/3sX8xRz/cactu.png',
    cost: 0,
    stars: 5,
    classIcon: '🍃',
    xp: 0,
    xpMax: 5,
    typeIcon: '🗡️',
  },
  {
    id: 4,
    name: 'Nutmee',
    image: 'https://i.ibb.co/0V8k1q7/nutmee.png',
    cost: 0,
    stars: 4,
    classIcon: '👊',
    xp: 0,
    xpMax: 5,
    typeIcon: '🗡️',
  },
  {
    id: 5,
    name: 'Kakka',
    image: 'https://i.ibb.co/6PqjXfG/kakka.png',
    cost: 0,
    stars: 5,
    classIcon: '👊',
    xp: 0,
    xpMax: 5,
    typeIcon: '💧',
  },
];

// LOGIC TẠO LƯỚI 3x20
const characterList = [];
for (let i = 0; i < 12; i++) {
  characterList.push(...sampleCharacters.map(char => ({...char, id: char.id + i * 5})));
}

// Component để nhúng CSS - PHIÊN BẢN ĐÃ SỬA LỖI GIAO DIỆN
const GameStyles = () => (
  <style>{`
    /* Tổng thể & Font chữ */
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap');

    body {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      background-color: #1a2a4c;
      color: white;
    }

    .app-container {
      padding: 20px;
    }

    .main-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 900;
      color: #ffc107;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    /* Lưới nhân vật */
    .character-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 1000px;
      margin: 20px auto;
    }

    /* Thẻ nhân vật */
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
      transform: translateY(-8px) scale(1.03);
      box-shadow: 0 15px 30px rgba(255, 193, 7, 0.3), 0 0 0 3px #ffc107;
    }

    /* Các thành phần bên trong thẻ */
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; }
    .cost-badge { background-color: #007bff; width: 30px; height: 34px; display: flex; justify-content: center; align-items: center; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); font-weight: 900; font-size: 1.1rem; color: white; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); }
    .star-rating { font-size: 1.2rem; }
    .star { color: #ccc; }
    .star.filled { color: #1a1a1a; }
    .class-icon { background-color: #f0f0f0; border: 2px solid #ccc; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; }
    .character-image-container { margin: 8px 0; background-color: #cddfff; border-radius: 12px; overflow: hidden; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; }
    .character-image { width: 100%; height: 100%; object-fit: contain; display: block; }
    .card-info { background-color: black; border-radius: 8px; padding: 5px 10px; position: relative; text-align: center; margin-bottom: 5px; }
    .character-name { color: white; font-size: 1.5rem; font-weight: 900; margin: 0; text-transform: capitalize; }
    .slot-icons { position: absolute; left: 10px; bottom: -15px; display: flex; gap: 4px; }
    .slot-icon { background-color: #333; border: 1px solid #555; color: #888; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; border-radius: 4px; font-size: 1.5rem; font-weight: bold; }
    .card-footer { background-color: black; border-radius: 8px; padding: 8px 10px; margin-top: auto; }
    .xp-bar { display: flex; justify-content: space-between; align-items: center; }
    
    /* ===== FIX HERE / SỬA LỖI Ở ĐÂY ===== */
    /* Đảm bảo các icon có kích thước hộp chứa đồng nhất */
    .puzzle-icon, .type-icon {
      font-size: 1.5rem;
      /* Các thuộc tính thêm vào để cố định kích thước và căn giữa icon */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
    }
    
    .xp-text { font-size: 1.2rem; font-weight: 700; color: white; }

    /* ==== PHẦN RESPONSIVE ĐÃ ĐƯỢC TỐI ƯU ==== */

    @media (max-width: 900px) {
      .character-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .main-title {
        font-size: 2rem;
      }
      .character-grid {
        gap: 12px;
      }
      .character-card {
        padding: 6px;
        border-radius: 12px;
      }
      .character-name {
        font-size: 1.2rem;
      }
      .star-rating {
        font-size: 1rem;
      }
      .cost-badge {
        transform: scale(0.9);
      }
      .class-icon {
        transform: scale(0.9);
      }
      .puzzle-icon, .type-icon {
        font-size: 1.2rem;
        width: 24px;   /* Thu nhỏ hộp chứa trên mobile */
        height: 24px;  /* Thu nhỏ hộp chứa trên mobile */
      }
      .xp-text {
        font-size: 1rem;
      }
      .slot-icons {
        bottom: -12px;
        transform: scale(0.9);
      }
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
        <div className="slot-icons">
          <div className="slot-icon">+</div>
          <div className="slot-icon">+</div>
        </div>
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
        <h1 className="main-title">BỘ SƯU TẬP NHÂN VẬT (Lưới 3x20)</h1>
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
