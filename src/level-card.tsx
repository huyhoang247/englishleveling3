import React from 'react';

// DỮ LIỆU MẪU (CẬP NHẬT 'level' VỚI SỐ LỚN HƠN)
const sampleCharacters = [
  { id: 1, name: 'Sarub', image: 'https://i.ibb.co/pPzR5dJ/sarub.png', level: 27, classIcon: '🍃', xp: 3, xpMax: 5, },
  { id: 2, name: 'Jellible', image: 'https://i.ibb.co/VvzV1Y0/jellible.png', level: 15, classIcon: '💭', xp: 9, xpMax: 10, },
  { id: 3, name: 'Cactu', image: 'https://i.ibb.co/3sX8xRz/cactu.png', level: 8, classIcon: '🍃', xp: 2, xpMax: 10, },
  { id: 4, name: 'Nutmee', image: 'https://i.ibb.co/0V8k1q7/nutmee.png', level: 42, classIcon: '👊', xp: 1, xpMax: 5, },
  { id: 5, name: 'Kakka', image: 'https://i.ibb.co/6PqjXfG/kakka.png', level: 9, classIcon: '👊', xp: 4, xpMax: 5, },
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

    .app-container { padding: 20px; max-width: 1020px; margin: 0 auto; }
    .main-title { text-align: center; font-size: 2.5rem; font-weight: 900; color: #ffc107; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); margin-bottom: 20px; }
    .character-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

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
    .character-card:hover { transform: translateY(-4px); box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25); }

    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; }

    /* ==== BẮT ĐẦU THIẾT KẾ HUY HIỆU LEVEL 3D HÌNH LỤC GIÁC ==== */
    
    .hex-level-badge {
      position: relative;
      width: 40px;
      height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Lớp Nền ngoài cùng (viền tối dày) */
    .hex-level-badge::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #111; /* ĐÃ THAY ĐỔI: Màu viền ngoài cùng, rất tối */
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      z-index: 1;
    }
    
    /* Lớp Bevel (tạo độ dày, nằm trên lớp nền) */
    .hex-level-badge::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      background: #666; /* ĐÃ THAY ĐỔI: Màu đen nhạt để làm cạnh vát */
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      z-index: 2;
    }
    
    /* Mặt chính của huy hiệu */
    .hex-level-badge .badge-face {
      position: relative;
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      display: flex;
      justify-content: center;
      align-items: center;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      z-index: 3;
      /* ĐÃ THAY ĐỔI: Stack gradient đen với highlight mờ */
      background:
        /* Highlight trắng mờ ở góc trên trái */
        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 40%),
        /* Gradient đen/xám chính */
        linear-gradient(180deg, #3a3a3a, #1f1f1f);
    }
    
    .hex-level-badge .level-number {
      font-size: 1.2rem;
      font-weight: 900;
      color: white;
      line-height: 1;
      /* ĐÃ THAY ĐỔI: Dùng text-shadow đen để tạo viền cho chữ */
      text-shadow: 
        2px 2px 0 #000, 
        -2px 2px 0 #000, 
        2px -2px 0 #000, 
        -2px -2px 0 #000,
        2px 0px 0 #000,
        -2px 0px 0 #000,
        0px 2px 0 #000,
        0px -2px 0 #000;
    }

    /* ==== KẾT THÚC THIẾT KẾ HUY HIỆU ==== */
    
    .class-icon { background-color: #f0f0f0; border: 2px solid #ccc; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; }
    .character-image-container { margin: 8px 0; background-color: #cddfff; border-radius: 12px; overflow: hidden; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; }
    .character-image { width: 100%; height: 100%; object-fit: contain; display: block; }
    
    .card-footer { background-color: black; border-radius: 8px; padding: 8px 10px; margin-top: 8px; }
    .xp-bar { display: flex; align-items: center; }
    .xp-progress-container { flex-grow: 1; height: 24px; background-color: #222; border-radius: 8px; position: relative; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.6); }
    .xp-progress-fill { height: 100%; border-radius: 8px; transition: width 0.5s ease-in-out; background-image: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent 60%), linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 0 5px rgba(0, 242, 254, 0.4); }
    .xp-text { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; font-size: 0.9rem; font-weight: 900; color: white; text-shadow: 0px 2px 0px rgba(0, 0, 0, 0.45); }
    
    @media (max-width: 900px) { .character-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) {
      .app-container { padding: 12px; }
      .main-title { font-size: 2rem; margin-bottom: 12px; }
      .character-grid { gap: 12px; }
      .character-card { padding: 6px; border-radius: 12px; }
      .hex-level-badge { transform: scale(0.85); } /* Thu nhỏ huy hiệu */
      .class-icon { transform: scale(0.9); }
      .xp-progress-container { height: 20px; }
      .xp-text { font-size: 0.8rem; }
    }
    @media (max-width: 360px) { .character-grid { grid-template-columns: 1fr; } }
  `}</style>
);

// COMPONENT HUY HIỆU LEVEL MỚI
const HexLevelBadge = ({ level }: { level: number }) => (
  <div className="hex-level-badge">
    <div className="badge-face">
      <span className="level-number">{level}</span>
    </div>
  </div>
);

const CharacterCard = ({ character }: { character: any }) => {
  const { name, image, level, classIcon, xp, xpMax } = character;
  const xpPercentage = (xp / xpMax) * 100;

  return (
    <div className="character-card">
      <div className="card-header">
        <HexLevelBadge level={level} />
        <div className="class-icon">{classIcon}</div>
      </div>
      <div className="character-image-container">
        <img src={image} alt={name} className="character-image" />
      </div>
      <div className="card-footer">
        <div className="xp-bar">
          <div className="xp-progress-container">
            <div className="xp-progress-fill" style={{ width: `${xpPercentage}%` }}></div>
            <span className="xp-text">{xpMax > 0 ? `${xp}/${xpMax}` : 'MAX'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENT CHÍNH
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
