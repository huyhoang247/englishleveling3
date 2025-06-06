import React, { useMemo } from 'react';

// === PHẦN CSS ĐƯỢC NÂNG CẤP VÀ GỘP VÀO ===
const dungeonStyles = `
/* ================================================== */
/* === CSS NÂNG CẤP THẨM MỸ CHO DUNGEON BACKGROUND === */
/* ================================================== */

/* 
  Kỹ thuật chính: Sử dụng perspective để tạo không gian 3D "giả".
  Mọi element con có transform: translateZ() sẽ được hiển thị theo luật xa gần.
*/
.dungeon-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: #0c0a09; /* Một màu đen-nâu ấm */
  perspective: 300px; /* Đây là chìa khóa cho hiệu ứng chiều sâu! */
  pointer-events: none;
}

/* 
  Lớp kết cấu đá (stone texture)
  Sử dụng ảnh nền lặp lại, rất nhẹ về hiệu năng.
*/
.stone-texture {
  position: absolute;
  inset: 0;
  background-image: url('https://www.transparenttextures.com/patterns/rocky-wall.png');
  opacity: 0.1;
  mix-blend-mode: overlay; /* Hòa trộn vào nền một cách tự nhiên */
}

/* 
  Lớp Vignette (làm tối góc)
  Tạo sự tập trung và không khí ngột ngạt của hầm ngục.
*/
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%);
  z-index: 10;
}

/* --- Icon --- */
.dungeon-icon-container {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.4;
  filter: drop-shadow(0 0 20px #000);
}

.dungeon-icon-image {
  width: 192px;
  height: 192px;
}

/* --- Hạt bụi/Tia lửa (Particles) được nâng cấp --- */
.dungeon-particle {
  position: absolute;
  background-color: #ffc857; /* Màu vàng cam của lửa */
  width: var(--size);
  height: calc(var(--size) * 1.5); /* Hơi dài ra để giống tia lửa */
  top: var(--y-start);
  left: var(--x-start);
  opacity: 0;
  border-radius: 50%;
  box-shadow: 0 0 6px #ffc857;
  /* Animation chính với translateZ để tạo chiều sâu */
  animation: float-3d var(--duration) var(--delay) linear infinite;
}

@keyframes float-3d {
  0% {
    transform: translate3d(0, 0, var(--z-depth)) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: var(--opacity);
  }
  80% {
    opacity: var(--opacity);
  }
  100% {
    /* Di chuyển một khoảng xa hơn để có cảm giác bay */
    transform: translate3d(var(--x-end), var(--y-end), var(--z-depth)) rotate(360deg);
    opacity: 0;
  }
}

/* --- Ánh sáng đèn đuốc được tinh chỉnh --- */
.dungeon-torch-light {
  position: absolute;
  border-radius: 50%;
  /* Gradient "nóng" hơn với lõi màu vàng sáng */
  background: radial-gradient(circle, 
    rgba(255, 230, 150, 0.4) 0%, 
    rgba(255, 140, 0, 0.25) 30%, 
    transparent 60%
  );
  animation: flicker-improved 7s infinite alternate;
}

.torch-left {
  top: 40px;
  left: 40px;
  width: 300px;
  height: 300px;
  animation-duration: 5.5s;
}

.torch-right {
  top: 64px;
  right: 48px;
  width: 250px;
  height: 250px;
  animation-duration: 7s;
  animation-delay: -1.5s;
}

@keyframes flicker-improved {
  0%   { transform: scale(1, 1); opacity: 0.7; }
  25%  { transform: scale(1.05, 0.95); opacity: 0.9; }
  50%  { transform: scale(0.98, 1.02); opacity: 0.6; }
  75%  { transform: scale(1.02, 0.98); opacity: 1; }
  100% { transform: scale(1, 1); opacity: 0.7; }
}
`;

// === PHẦN COMPONENT REACT ===
const DungeonBackground = () => {
    // Tạo ra các hạt bụi với thông số 3D
    const particles = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => {
            const zDepth = Math.random() * 250 - 50; // -50px to 200px
            // Vật ở gần (z-depth âm) sẽ có vẻ to hơn và di chuyển nhanh hơn
            const perspectiveScale = 1 + (zDepth / 300); 
            return {
                id: i,
                style: {
                    '--size': `${(Math.random() * 1.5 + 0.5) * perspectiveScale}px`,
                    '--y-start': `${Math.random() * 100}%`,
                    '--x-start': `${Math.random() * 100}%`,
                    // Điểm cuối của animation
                    '--x-end': `${(Math.random() - 0.5) * 50}px`,
                    '--y-end': `${-50 - Math.random() * 50}px`, // Luôn bay lên
                    // Các thông số cho animation
                    '--duration': `${(Math.random() * 10 + 8) / perspectiveScale}s`, // Nhanh hơn khi ở gần
                    '--delay': `-${Math.random() * 18}s`,
                    '--opacity': `${Math.random() * 0.7 + 0.2}`,
                    '--z-depth': `${zDepth}px`, // Độ sâu của hạt
                } as React.CSSProperties
            }
        });
    }, []);

    return (
        <>
            <style>{dungeonStyles}</style>

            <div className="dungeon-background">
                {/* Lớp kết cấu đá */}
                <div className="stone-texture" />

                {/* Icon chính giữa */}
                <div className="dungeon-icon-container">
                    <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2004_19_40%20PM.png"
                        alt="Dungeon Icon"
                        className="dungeon-icon-image"
                        onError={(e) => { (e.target as HTMLImageElement).src="https://placehold.co/192x192/000000/FFFFFF?text=Icon"; }}
                    />
                </div>

                {/* Render các hạt bụi/tia lửa */}
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="dungeon-particle"
                        style={particle.style}
                    />
                ))}

                {/* Ánh sáng đèn đuốc */}
                <div className="dungeon-torch-light torch-left" />
                <div className="dungeon-torch-light torch-right" />
                
                {/* Lớp Vignette được đặt ở trên cùng để làm tối mọi thứ bên dưới */}
                <div className="vignette" />
            </div>
        </>
    );
};

export default React.memo(DungeonBackground);
