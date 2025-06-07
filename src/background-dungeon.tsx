// --- START OF FILE background-dungeon.tsx ---

import React, { useMemo } from 'react';

// === PHẦN CSS ĐƯỢC GỘP VÀO ===
const dungeonStyles = `
/* =============================================== */
/* === CSS NÂNG CẤP CHO DUNGEON BACKGROUND === */
/* =============================================== */

.dungeon-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Thêm một chút màu xanh thẫm ở đáy để tạo cảm giác lạnh lẽo, sâu hơn */
  background: linear-gradient(to bottom, #1a202c, #0a0e13, #020617);
  pointer-events: none; 
}

/* --- Icon Cánh Cửa (Không đổi) --- */
.dungeon-icon-container {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0.5;
}
.dungeon-icon-image {
  width: 192px;
  height: 192px;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.7));
}

/* --- Các lớp nền và hiệu ứng (Không đổi) --- */
.dungeon-light-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(139, 69, 19, 0.2) 0%, transparent 80%);
  opacity: 0.5;
}
.dungeon-texture-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, transparent, rgba(100, 100, 100, 0.1), transparent);
  opacity: 0.2;
}
.dungeon-crack {
  position: absolute;
  background-color: #000;
  border-radius: 1px;
}

/* --- Hạt bụi (Particles) --- */
.dungeon-particle {
  position: absolute;
  background-color: rgba(253, 230, 138, 0.7);
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  top: var(--y-start);
  left: var(--x-start);
  box-shadow: 0 0 4px rgba(255, 255, 0, 0.2);
  /* SỬA ĐỔI: Sử dụng animation 'driftAndFade' mới */
  animation: driftAndFade var(--duration) var(--delay) linear infinite;
}

/* --- Ánh sáng đèn đuốc --- */
.dungeon-torch-light {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 140, 0, 0.3) 0%, transparent 70%);
  /* SỬA ĐỔI: Sử dụng animation 'flicker-improved' mới */
  animation: flicker-improved 7s infinite alternate;
}
.torch-left { top: 40px; left: 40px; width: 200px; height: 200px; animation-duration: 5s; }
.torch-right { top: 64px; right: 48px; width: 160px; height: 160px; animation-duration: 6.5s; animation-delay: -1.5s; }

.dungeon-ambient-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(101, 67, 33, 0.1) 0%, transparent 70%);
  /* SỬA ĐỔI: Sử dụng animation 'flicker-improved' mới */
  animation: flicker-improved 12s infinite alternate;
}

/* --- CẢI TIẾN 1: HIỆU ỨNG TIA SÁNG MỚI (GOD RAYS) --- */
.god-ray {
  position: absolute;
  top: -10%;
  height: 120%;
  width: 80px;
  background: linear-gradient(to bottom, rgba(255, 204, 153, 0.08), transparent);
  opacity: 0;
  animation: swayAndFade 20s linear infinite;
}

/* --- KEYFRAMES NÂNG CẤP --- */

/* Keyframe mới cho Hạt bụi, chuyển động mượt và ngẫu nhiên hơn */
@keyframes driftAndFade {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: var(--opacity); }
  80% { opacity: calc(var(--opacity) * 0.5); }
  100% { transform: translate(var(--x-end), var(--y-end)); opacity: 0; }
}

/* Keyframe mới cho Ánh sáng, phức tạp và tự nhiên hơn */
@keyframes flicker-improved {
  0% { transform: scale(1, 1); opacity: 0.7; }
  15% { transform: scale(1.02, 0.98); opacity: 0.6; }
  30% { transform: scale(0.98, 1.02); opacity: 0.8; }
  50% { transform: scale(1.05, 1.05); opacity: 0.95; }
  70% { transform: scale(0.95, 1); opacity: 0.75; }
  85% { transform: scale(1, 0.97); opacity: 0.85; }
  100% { transform: scale(1, 1); opacity: 0.7; }
}

/* Keyframe mới cho Tia sáng, chuyển động chậm rãi */
@keyframes swayAndFade {
  0% { transform: translateX(0) skewX(-15deg); opacity: 0; }
  25% { opacity: 0.7; }
  75% { opacity: 0.5; }
  100% { transform: translateX(40px) skewX(-15deg); opacity: 0; }
}


/* Tạm dừng animation (Không đổi) */
.dungeon-background.paused * {
  animation-play-state: paused !important;
}
`;

// === PHẦN COMPONENT REACT ===

interface DungeonBackgroundProps {
  isPaused: boolean;
}

const DungeonBackground: React.FC<DungeonBackgroundProps> = ({ isPaused }) => {
    // SỬA ĐỔI: Thêm các biến CSS cho animation mới của particle
    const particles = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({ // Tăng số lượng hạt bụi lên 40
            id: i,
            style: {
                '--size': `${Math.random() * 2 + 0.5}px`, // Hạt nhỏ hơn một chút
                '--x-start': `${Math.random() * 100}%`,
                '--y-start': `${Math.random() * 100}%`,
                '--duration': `${Math.random() * 20 + 15}s`, // Chuyển động chậm hơn
                '--delay': `-${Math.random() * 35}s`,
                '--opacity': `${Math.random() * 0.5 + 0.1}`,
                // Các biến mới cho keyframe 'driftAndFade'
                '--x-end': `${Math.random() * 80 - 40}px`,
                '--y-end': `${Math.random() * 80 - 40}px`,
            } as React.CSSProperties
        }));
    }, []);

    const cracks = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 2 + 1}px`,
                transform: `rotate(${Math.random() * 45}deg)`,
                opacity: `${Math.random() * 0.2 + 0.2}`,
            } as React.CSSProperties
        }));
    }, []);

    return (
        <>
            <style>{dungeonStyles}</style>

            <div className={`dungeon-background ${isPaused ? 'paused' : ''}`}>
                {/* --- CẢI TIẾN 2: THÊM CÁC TIA SÁNG VÀO ĐÂY --- */}
                <div className="god-ray" style={{ left: '15%', animationDelay: '-5s' }}></div>
                <div className="god-ray" style={{ left: '60%', width: '120px', animationDelay: '0s', animationDuration: '25s' }}></div>
                <div className="god-ray" style={{ left: '80%', width: '60px', animationDelay: '-12s', animationDuration: '18s' }}></div>

                <div className="dungeon-icon-container">
                    <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2004_19_40%20PM.png"
                        alt="Dungeon Icon"
                        className="dungeon-icon-image"
                        onError={(e) => { (e.target as HTMLImageElement).src="https://placehold.co/192x192/000000/FFFFFF?text=Icon"; }}
                    />
                </div>
                <div className="dungeon-light-overlay" />
                <div className="dungeon-texture-overlay" />
                {cracks.map(crack => (
                    <div key={crack.id} className="dungeon-crack" style={crack.style} />
                ))}
                {particles.map(particle => (
                    <div key={particle.id} className="dungeon-particle" style={particle.style} />
                ))}
                <div className="dungeon-torch-light torch-left" />
                <div className="dungeon-torch-light torch-right" />
                <div className="dungeon-ambient-glow" />
            </div>
        </>
    );
};

export default React.memo(DungeonBackground);
