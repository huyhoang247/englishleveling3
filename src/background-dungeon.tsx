import React, { useMemo } from 'react';

// === ENHANCED CSS STYLES ===
const dungeonStyles = `
/* =============================================== */
/* === ENHANCED DUNGEON BACKGROUND CSS === */
/* =============================================== */

.dungeon-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Enhanced gradient with more depth and mystical colors */
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(30, 17, 83, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(83, 17, 30, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%);
  pointer-events: none;
  /* Add subtle animation to the background itself */
  animation: backgroundPulse 30s ease-in-out infinite alternate;
}

@keyframes backgroundPulse {
  0% { filter: brightness(0.8) contrast(1.1); }
  100% { filter: brightness(1) contrast(1.2); }
}

/* --- Enhanced Icon Container --- */
.dungeon-icon-container {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  opacity: 0.8;
  /* Add mystical glow effect */
  filter: drop-shadow(0 0 30px rgba(100, 150, 255, 0.3));
  animation: iconFloat 8s ease-in-out infinite alternate;
}

@keyframes iconFloat {
  0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  100% { transform: translate(-50%, -55%) scale(1.05) rotate(1deg); }
}

.dungeon-icon-image {
  width: 192px;
  height: 192px;
  border-radius: 20px;
  box-shadow: 
    0 0 40px rgba(100, 150, 255, 0.2),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.dungeon-icon-image:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

/* --- Enhanced Light Effects --- */
.dungeon-light-overlay {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 100, 50, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(50, 100, 255, 0.1) 0%, transparent 60%);
  opacity: 0.6;
  animation: lightShift 25s ease-in-out infinite alternate;
}

@keyframes lightShift {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -10px) scale(1.1); }
  100% { transform: translate(-15px, 15px) scale(0.9); }
}

.dungeon-texture-overlay {
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(0, 0, 0, 0.1) 50%, transparent 60%);
  opacity: 0.3;
  animation: textureShimmer 20s linear infinite;
}

@keyframes textureShimmer {
  0% { transform: translateX(-100px) translateY(-100px); }
  100% { transform: translateX(100px) translateY(100px); }
}

/* --- Enhanced Cracks --- */
.dungeon-crack {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(100, 150, 255, 0.3), transparent);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(100, 150, 255, 0.2);
  animation: crackGlow 15s ease-in-out infinite alternate;
}

@keyframes crackGlow {
  0% { opacity: 0.2; box-shadow: 0 0 5px rgba(100, 150, 255, 0.1); }
  100% { opacity: 0.6; box-shadow: 0 0 20px rgba(100, 150, 255, 0.3); }
}

/* --- Enhanced Particles --- */
.dungeon-particle {
  position: absolute;
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  top: var(--y-start);
  left: var(--x-start);
  background: radial-gradient(circle, var(--color) 0%, transparent 70%);
  box-shadow: 0 0 8px var(--color);
  animation: enhancedDrift var(--duration) var(--delay) linear infinite;
}

@keyframes enhancedDrift {
  0% { 
    transform: translate(0, 0) scale(0) rotate(0deg); 
    opacity: 0; 
  }
  15% { 
    transform: translate(8px, -8px) scale(1) rotate(45deg); 
    opacity: var(--opacity); 
  }
  50% {
    transform: translate(var(--mid-x), var(--mid-y)) scale(1.2) rotate(180deg);
    opacity: calc(var(--opacity) * 0.8);
  }
  85% { 
    transform: translate(var(--x-end), var(--y-end)) scale(0.6) rotate(315deg); 
    opacity: calc(var(--opacity) * 0.2); 
  }
  100% { 
    transform: translate(calc(var(--x-end) + 30px), calc(var(--y-end) + 30px)) scale(0) rotate(360deg); 
    opacity: 0; 
  }
}

/* --- Enhanced Torch Lights --- */
.dungeon-torch-light {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 120, 0, 0.4) 0%, rgba(255, 80, 0, 0.2) 50%, transparent 100%);
  animation: enhancedFlicker var(--duration) infinite alternate;
  box-shadow: 0 0 50px rgba(255, 100, 0, 0.3);
}

.torch-left { 
  top: 40px; 
  left: 40px; 
  width: 250px; 
  height: 250px; 
  --duration: 6s;
  animation-delay: 0s;
}

.torch-right { 
  top: 64px; 
  right: 48px; 
  width: 200px; 
  height: 200px; 
  --duration: 7s;
  animation-delay: -2s;
}

@keyframes enhancedFlicker {
  0% { 
    transform: scale(0.85, 0.95) rotate(-0.5deg); 
    opacity: 0.6; 
    filter: blur(0.5px) brightness(0.9);
  }
  20% { 
    transform: scale(1.05, 1.15) rotate(0.3deg); 
    opacity: 0.95; 
    filter: blur(0px) brightness(1.1);
  }
  40% { 
    transform: scale(0.95, 1.05) rotate(-0.2deg); 
    opacity: 0.75; 
    filter: blur(0.3px) brightness(1);
  }
  60% { 
    transform: scale(1.1, 0.9) rotate(0.4deg); 
    opacity: 0.85; 
    filter: blur(0px) brightness(1.05);
  }
  80% { 
    transform: scale(0.9, 1.1) rotate(-0.1deg); 
    opacity: 0.8; 
    filter: blur(0.2px) brightness(0.95);
  }
  100% { 
    transform: scale(0.85, 0.95) rotate(-0.5deg); 
    opacity: 0.65; 
    filter: blur(0.5px) brightness(0.9);
  }
}

/* --- Enhanced Ambient Glow --- */
.dungeon-ambient-glow {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 25% 25%, rgba(255, 120, 0, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 75% 75%, rgba(100, 150, 255, 0.06) 0%, transparent 60%);
  animation: ambientPulse 20s ease-in-out infinite alternate;
}

@keyframes ambientPulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.1); }
}

/* --- Enhanced God Rays --- */
.god-ray {
  position: absolute;
  top: -20%;
  height: 140%;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(255, 204, 153, 0.1) 20%, 
    rgba(255, 204, 153, 0.05) 80%, 
    transparent 100%);
  opacity: 0;
  animation: enhancedSway var(--duration) linear infinite;
  filter: blur(1px);
}

@keyframes enhancedSway {
  0% { 
    transform: translateX(var(--start-x)) skewX(-20deg) scaleX(0.5); 
    opacity: 0; 
  }
  15% { 
    opacity: 0.8; 
    transform: translateX(var(--start-x)) skewX(-15deg) scaleX(1);
  }
  85% { 
    opacity: 0.4; 
    transform: translateX(var(--end-x)) skewX(-10deg) scaleX(0.8);
  }
  100% { 
    transform: translateX(var(--end-x)) skewX(-20deg) scaleX(0.5); 
    opacity: 0; 
  }
}

/* --- New: Mystical Orbs --- */
.mystical-orb {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), var(--color) 70%);
  box-shadow: 
    0 0 20px var(--color),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  animation: orbFloat var(--duration) var(--delay) ease-in-out infinite alternate;
}

@keyframes orbFloat {
  0% { 
    transform: translate(0, 0) scale(0.8); 
    opacity: 0.3; 
  }
  50% { 
    transform: translate(var(--mid-x), var(--mid-y)) scale(1.2); 
    opacity: 0.8; 
  }
  100% { 
    transform: translate(var(--end-x), var(--end-y)) scale(0.9); 
    opacity: 0.4; 
  }
}

/* --- New: Floating Motes --- */
.floating-mote {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.9), var(--color) 80%);
  box-shadow: 
    0 0 15px var(--color),
    0 0 30px rgba(255, 255, 255, 0.1);
  animation: gentleFloat var(--duration) var(--delay) ease-in-out infinite;
}

@keyframes gentleFloat {
  0%, 100% { 
    transform: translate(0, 0) scale(0.8); 
    opacity: 0.4; 
  }
  25% { 
    transform: translate(var(--x1), var(--y1)) scale(1.1); 
    opacity: 0.8; 
  }
  50% { 
    transform: translate(var(--x2), var(--y2)) scale(0.9); 
    opacity: 0.6; 
  }
  75% { 
    transform: translate(var(--x3), var(--y3)) scale(1.2); 
    opacity: 0.9; 
  }
}

/* Pause state */
.dungeon-background.paused * {
  animation-play-state: paused !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .dungeon-icon-image {
    width: 128px;
    height: 128px;
  }
  .torch-left, .torch-right {
    width: 150px;
    height: 150px;
  }
}
`;

// === ENHANCED COMPONENT ===

interface DungeonBackgroundProps {
  isPaused: boolean;
}

const DungeonBackground: React.FC<DungeonBackgroundProps> = ({ isPaused }) => {
    // Enhanced particles with more variety
    const particles = useMemo(() => {
        const colors = [
            'rgba(253, 230, 138, 0.8)',
            'rgba(100, 150, 255, 0.6)',
            'rgba(255, 100, 150, 0.7)',
            'rgba(150, 255, 100, 0.5)',
            'rgba(255, 200, 100, 0.9)'
        ];
        
        return Array.from({ length: 60 }, (_, i) => ({
            id: i,
            style: {
                '--size': `${Math.random() * 3 + 1}px`,
                '--x-start': `${Math.random() * 100}%`,
                '--y-start': `${Math.random() * 100}%`,
                '--duration': `${Math.random() * 25 + 20}s`,
                '--delay': `-${Math.random() * 40}s`,
                '--opacity': `${Math.random() * 0.6 + 0.2}`,
                '--x-end': `${Math.random() * 100 - 50}px`,
                '--y-end': `${Math.random() * 100 - 50}px`,
                '--mid-x': `${Math.random() * 50 - 25}px`,
                '--mid-y': `${Math.random() * 50 - 25}px`,
                '--color': colors[Math.floor(Math.random() * colors.length)],
            } as React.CSSProperties
        }));
    }, []);

    // Enhanced cracks
    const cracks = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 3 + 1}px`,
                transform: `rotate(${Math.random() * 180}deg)`,
            } as React.CSSProperties
        }));
    }, []);

    // Enhanced god rays
    const godRays = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 60 + 40}px`,
                '--duration': `${Math.random() * 15 + 20}s`,
                '--start-x': `${Math.random() * 30 - 15}px`,
                '--end-x': `${Math.random() * 60 - 30}px`,
                animationDelay: `-${Math.random() * 20}s`,
            } as React.CSSProperties
        }));
    }, []);

    // New: Mystical orbs
    const mysticalOrbs = useMemo(() => {
        const orbColors = [
            'rgba(100, 150, 255, 0.6)',
            'rgba(255, 100, 150, 0.5)',
            'rgba(150, 255, 100, 0.4)',
            'rgba(255, 200, 100, 0.7)'
        ];

        return Array.from({ length: 8 }, (_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                '--size': `${Math.random() * 20 + 10}px`,
                '--duration': `${Math.random() * 15 + 10}s`,
                '--delay': `-${Math.random() * 20}s`,
                '--color': orbColors[Math.floor(Math.random() * orbColors.length)],
                '--mid-x': `${Math.random() * 40 - 20}px`,
                '--mid-y': `${Math.random() * 40 - 20}px`,
                '--end-x': `${Math.random() * 60 - 30}px`,
                '--end-y': `${Math.random() * 60 - 30}px`,
            } as React.CSSProperties
        }));
    }, []);

    // New: Floating motes (thay thế energy waves)
    const floatingMotes = useMemo(() => {
        const moteColors = [
            'rgba(255, 204, 153, 0.7)',
            'rgba(153, 204, 255, 0.6)',
            'rgba(204, 153, 255, 0.5)',
            'rgba(255, 153, 204, 0.6)'
        ];

        return Array.from({ length: 12 }, (_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                '--size': `${Math.random() * 8 + 4}px`,
                '--duration': `${Math.random() * 20 + 15}s`,
                '--delay': `-${Math.random() * 25}s`,
                '--color': moteColors[Math.floor(Math.random() * moteColors.length)],
                '--x1': `${Math.random() * 60 - 30}px`,
                '--y1': `${Math.random() * 60 - 30}px`,
                '--x2': `${Math.random() * 80 - 40}px`,
                '--y2': `${Math.random() * 80 - 40}px`,
                '--x3': `${Math.random() * 40 - 20}px`,
                '--y3': `${Math.random() * 40 - 20}px`,
            } as React.CSSProperties
        }));
    }, []);

    return (
        <>
            <style>{dungeonStyles}</style>

            <div className={`dungeon-background ${isPaused ? 'paused' : ''}`}>
                {/* Enhanced God Rays */}
                {godRays.map(ray => (
                    <div key={ray.id} className="god-ray" style={ray.style} />
                ))}

                {/* Floating Motes */}
                {floatingMotes.map(mote => (
                    <div key={mote.id} className="floating-mote" style={mote.style} />
                ))}

                {/* Enhanced Icon */}
                <div className="dungeon-icon-container">
                    <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2004_19_40%20PM.png"
                        alt="Dungeon Icon"
                        className="dungeon-icon-image"
                        onError={(e) => { 
                            (e.target as HTMLImageElement).src="https://placehold.co/192x192/2D1B69/FFFFFF?text=🏰"; 
                        }}
                    />
                </div>

                {/* Enhanced Overlays */}
                <div className="dungeon-light-overlay" />
                <div className="dungeon-texture-overlay" />

                {/* Enhanced Cracks */}
                {cracks.map(crack => (
                    <div key={crack.id} className="dungeon-crack" style={crack.style} />
                ))}

                {/* Enhanced Particles */}
                {particles.map(particle => (
                    <div key={particle.id} className="dungeon-particle" style={particle.style} />
                ))}

                {/* Mystical Orbs */}
                {mysticalOrbs.map(orb => (
                    <div key={orb.id} className="mystical-orb" style={orb.style} />
                ))}

                {/* Enhanced Torch Lights */}
                <div className="dungeon-torch-light torch-left" />
                <div className="dungeon-torch-light torch-right" />

                {/* Enhanced Ambient Glow */}
                <div className="dungeon-ambient-glow" />
            </div>
        </>
    );
};

export default React.memo(DungeonBackground);
