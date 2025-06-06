// --- START OF FILE background-dungeon.tsx ---

import React, { useMemo } from 'react';

// === PHẦN CSS ĐƯỢC GỘP VÀO ===
const dungeonStyles = `
/* =============================================== */
/* === CSS TỐI ƯU CHO DUNGEON BACKGROUND === */
/* =============================================== */

.dungeon-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(to bottom, #1a202c, #0a0e13, #000000);
  pointer-events: none; 
}

/* --- Icon --- */
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

/* --- Các lớp nền và hiệu ứng --- */
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

/* --- Vết nứt (Cracks) --- */
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
  opacity: 0;
  box-shadow: 0 0 4px rgba(255, 255, 0, 0.2);
  animation: float var(--duration) var(--delay) linear infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0;
  }
  25% {
    transform: translate(15px, -20px);
    opacity: var(--opacity);
  }
  50% {
    transform: translate(-10px, 10px);
    opacity: 0;
  }
  75% {
    transform: translate(20px, 25px);
    opacity: calc(var(--opacity) * 0.7);
  }
}

/* --- Ánh sáng đèn đuốc --- */
.dungeon-torch-light {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 140, 0, 0.3) 0%, transparent 70%);
  animation: flicker 7s infinite alternate;
}

.torch-left {
  top: 40px;
  left: 40px;
  width: 200px;
  height: 200px;
  animation-duration: 6s;
}

.torch-right {
  top: 64px;
  right: 48px;
  width: 160px;
  height: 160px;
  animation-duration: 8s;
  animation-delay: -2s;
}

.dungeon-ambient-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(101, 67, 33, 0.1) 0%, transparent 70%);
  animation: flicker 12s infinite alternate;
}

@keyframes flicker {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

/* === THAY ĐỔI: Thêm quy tắc để dừng animation === */
.dungeon-background.paused * {
  animation-play-state: paused !important;
}
`;

// === PHẦN COMPONENT REACT ===

// THAY ĐỔI: Thêm interface cho props
interface DungeonBackgroundProps {
  isPaused: boolean;
}

const DungeonBackground: React.FC<DungeonBackgroundProps> = ({ isPaused }) => {
    // Memoize các particles để chúng chỉ được tạo một lần duy nhất.
    const particles = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            style: {
                '--size': `${Math.random() * 2.5 + 1}px`,
                '--x-start': `${Math.random() * 100}%`,
                '--y-start': `${Math.random() * 100}%`,
                '--duration': `${Math.random() * 15 + 10}s`,
                '--delay': `-${Math.random() * 25}s`,
                '--opacity': `${Math.random() * 0.6 + 0.2}`,
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

            {/* THAY ĐỔI: Thêm class 'paused' một cách có điều kiện */}
            <div className={`dungeon-background ${isPaused ? 'paused' : ''}`}>
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
                    <div
                        key={crack.id}
                        className="dungeon-crack"
                        style={crack.style}
                    />
                ))}
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="dungeon-particle"
                        style={particle.style}
                    />
                ))}
                <div className="dungeon-torch-light torch-left" />
                <div className="dungeon-torch-light torch-right" />
                <div className="dungeon-ambient-glow" />
            </div>
        </>
    );
};

export default React.memo(DungeonBackground);
