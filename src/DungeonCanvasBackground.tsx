import React, { useRef, useEffect, useCallback } from 'react';

// === CONSTANTS FOR VISUAL EFFECTS ===
const PARTICLE_COUNT = 80;
const ORB_COUNT = 8;
const FLOATING_RUNE_COUNT = 4;
const ICON_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2004_19_40%20PM.png";
const ICON_FALLBACK_URL = "https://placehold.co/192x192/2D1B69/FFFFFF?text=🏰";

// === UTILITY FUNCTIONS ===
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

// === ENHANCED INTERFACES ===
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  life: number;
  maxLife: number;
  twinkleSpeed: number;
}

interface Orb {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  color: string;
  opacity: number;
  targetX: number;
  targetY: number;
  speed: number;
  pulsePhase: number;
  pulseSpeed: number;
  trailPoints: { x: number; y: number; opacity: number }[];
}

interface FloatingRune {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  pulsePhase: number;
  color: string;
  char: string;
  floatOffset: number;
  floatSpeed: number;
}

interface DungeonCanvasBackgroundProps {
  isPaused: boolean;
}

const DungeonCanvasBackground: React.FC<DungeonCanvasBackgroundProps> = ({ isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const runesRef = useRef<FloatingRune[]>([]);
  const dungeonIconRef = useRef<HTMLImageElement | null>(null);
  const iconLoadedRef = useRef<boolean>(false);
  const timeRef = useRef<number>(0);
  const lastResizeRef = useRef<number>(0);

  // Initialize particles with enhanced properties
  const initializeParticles = useCallback((width: number, height: number) => {
    const particleColors = [
      'rgba(253, 230, 138, 0.9)', // Golden magic
      'rgba(147, 197, 253, 0.8)', // Mystic blue
      'rgba(196, 181, 253, 0.7)', // Purple essence
      'rgba(134, 239, 172, 0.6)', // Nature magic
      'rgba(252, 165, 165, 0.5)'  // Fire magic
    ];

    particlesRef.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const life = random(3000, 8000);
      particlesRef.current.push({
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.5, 0.5),
        vy: random(-0.8, -0.2), // Tend to float upward
        radius: random(0.8, 3),
        color: particleColors[Math.floor(random(0, particleColors.length))],
        opacity: 0,
        baseOpacity: random(0.4, 0.9),
        life: 0,
        maxLife: life,
        twinkleSpeed: random(0.02, 0.05)
      });
    }
  }, []);

  // Initialize orbs with trail effects
  const initializeOrbs = useCallback((width: number, height: number) => {
    const orbColors = [
      'rgba(147, 197, 253, 0.7)', // Mystic blue
      'rgba(196, 181, 253, 0.6)', // Arcane purple  
      'rgba(134, 239, 172, 0.5)', // Nature green
      'rgba(253, 230, 138, 0.6)', // Divine gold
      'rgba(248, 113, 113, 0.5)'  // Fire red
    ];

    orbsRef.current = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      const baseRadius = random(12, 25);
      orbsRef.current.push({
        x: random(baseRadius * 2, width - baseRadius * 2),
        y: random(baseRadius * 2, height - baseRadius * 2),
        radius: baseRadius,
        baseRadius,
        color: orbColors[Math.floor(random(0, orbColors.length))],
        opacity: random(0.3, 0.7),
        targetX: random(baseRadius * 2, width - baseRadius * 2),
        targetY: random(baseRadius * 2, height - baseRadius * 2),
        speed: random(0.008, 0.025),
        pulsePhase: random(0, Math.PI * 2),
        pulseSpeed: random(0.02, 0.04),
        trailPoints: []
      });
    }
  }, []);

  // Initialize floating runes
  const initializeRunes = useCallback((width: number, height: number) => {
    const runeChars = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];
    const runeColors = [
      'rgba(253, 230, 138, 0.8)',
      'rgba(147, 197, 253, 0.7)',
      'rgba(196, 181, 253, 0.6)'
    ];

    runesRef.current = [];
    for (let i = 0; i < FLOATING_RUNE_COUNT; i++) {
      runesRef.current.push({
        x: random(width * 0.1, width * 0.9),
        y: random(height * 0.3, height * 0.8),
        rotation: 0,
        rotationSpeed: random(-0.01, 0.01),
        scale: random(0.8, 1.5),
        pulsePhase: random(0, Math.PI * 2),
        color: runeColors[Math.floor(random(0, runeColors.length))],
        char: runeChars[Math.floor(random(0, runeChars.length))],
        floatOffset: random(0, Math.PI * 2),
        floatSpeed: random(0.015, 0.025)
      });
    }
  }, []);

  // Enhanced background gradient
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Multi-layer gradient for depth
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
    bgGradient.addColorStop(0, '#1e1b4b'); // Deep purple core
    bgGradient.addColorStop(0.3, '#312e81'); // Medium purple
    bgGradient.addColorStop(0.6, '#1e3a8a'); // Deep blue
    bgGradient.addColorStop(1, '#0f172a'); // Almost black edges
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Animated overlay for mystical effect
    const overlayGradient = ctx.createLinearGradient(0, 0, width, height);
    const shimmer = Math.sin(time * 0.001) * 0.02;
    overlayGradient.addColorStop(0, `rgba(59, 130, 246, ${0.05 + shimmer})`);
    overlayGradient.addColorStop(0.5, `rgba(147, 51, 234, ${0.03 + shimmer})`);
    overlayGradient.addColorStop(1, `rgba(59, 130, 246, ${0.05 + shimmer})`);
    
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  // Enhanced torch effects with more realism
  const drawTorchEffects = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Main torch (left)
    const flicker1 = Math.sin(time * 0.005) * 0.15 + Math.sin(time * 0.003) * 0.1;
    const torch1Size = width * 0.25 + flicker1 * 50;
    const torch1Grad = ctx.createRadialGradient(
      width * 0.12, height * 0.08, 0,
      width * 0.12, height * 0.08, torch1Size
    );
    torch1Grad.addColorStop(0, `rgba(255, 147, 41, ${0.2 + Math.abs(flicker1) * 0.3})`);
    torch1Grad.addColorStop(0.4, `rgba(255, 120, 0, ${0.15 + Math.abs(flicker1) * 0.2})`);
    torch1Grad.addColorStop(0.7, `rgba(200, 80, 0, ${0.1 + Math.abs(flicker1) * 0.1})`);
    torch1Grad.addColorStop(1, 'rgba(255, 60, 0, 0)');
    
    ctx.fillStyle = torch1Grad;
    ctx.fillRect(0, 0, width, height);

    // Secondary torch (right)
    const flicker2 = Math.sin(time * 0.007 + 2) * 0.12 + Math.sin(time * 0.004 + 1) * 0.08;
    const torch2Size = width * 0.2 + flicker2 * 35;
    const torch2Grad = ctx.createRadialGradient(
      width * 0.88, height * 0.15, 0,
      width * 0.88, height * 0.15, torch2Size
    );
    torch2Grad.addColorStop(0, `rgba(255, 120, 60, ${0.18 + Math.abs(flicker2) * 0.25})`);
    torch2Grad.addColorStop(0.5, `rgba(255, 100, 30, ${0.12 + Math.abs(flicker2) * 0.15})`);
    torch2Grad.addColorStop(1, 'rgba(200, 70, 0, 0)');
    
    ctx.fillStyle = torch2Grad;
    ctx.fillRect(0, 0, width, height);

    // Ambient torchlight on ground
    const groundGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
    groundGrad.addColorStop(0, `rgba(255, 140, 0, ${0.08 + flicker1 * 0.05})`);
    groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  }, []);

  // Main effect initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Load dungeon icon
    const icon = new Image();
    icon.crossOrigin = 'anonymous';
    icon.src = ICON_URL;
    icon.onload = () => {
      dungeonIconRef.current = icon;
      iconLoadedRef.current = true;
    };
    icon.onerror = () => {
      console.warn("Failed to load dungeon icon, using fallback.");
      const fallbackIcon = new Image();
      fallbackIcon.src = ICON_FALLBACK_URL;
      fallbackIcon.onload = () => {
        dungeonIconRef.current = fallbackIcon;
        iconLoadedRef.current = true;
      };
    };

    // Initialize all elements
    initializeParticles(width, height);
    initializeOrbs(width, height);
    initializeRunes(width, height);

    const handleResize = () => {
      const now = Date.now();
      if (now - lastResizeRef.current < 100) return; // Throttle resize
      lastResizeRef.current = now;
      
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      
      initializeParticles(width, height);
      initializeOrbs(width, height);
      initializeRunes(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Main animation loop
    const animate = (currentTime: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      if (isPaused) return;
      
      timeRef.current = currentTime;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw enhanced background
      drawBackground(ctx, width, height, currentTime);
      
      // 2. Draw realistic torch effects
      drawTorchEffects(ctx, width, height, currentTime);

      // 3. Draw main dungeon icon with glow
      if (iconLoadedRef.current && dungeonIconRef.current) {
        const iconSize = Math.min(width, height) * 0.22;
        const iconX = (width - iconSize) / 2;
        const iconY = height * 0.12;
        const iconGlow = Math.sin(currentTime * 0.003) * 0.3 + 0.7;
        
        ctx.save();
        ctx.shadowColor = `rgba(147, 197, 253, ${iconGlow * 0.8})`;
        ctx.shadowBlur = 40;
        ctx.globalAlpha = 0.95;
        ctx.drawImage(dungeonIconRef.current, iconX, iconY, iconSize, iconSize);
        ctx.restore();
      }

      // 4. Update and draw orbs with trails
      orbsRef.current.forEach(orb => {
        // Update position
        orb.x = lerp(orb.x, orb.targetX, orb.speed);
        orb.y = lerp(orb.y, orb.targetY, orb.speed);
        
        // Check if reached target
        if (Math.abs(orb.targetX - orb.x) < 2 && Math.abs(orb.targetY - orb.y) < 2) {
          orb.targetX = random(orb.baseRadius * 2, width - orb.baseRadius * 2);
          orb.targetY = random(orb.baseRadius * 2, height - orb.baseRadius * 2);
        }

        // Update trail
        orb.trailPoints.unshift({ x: orb.x, y: orb.y, opacity: 0.6 });
        if (orb.trailPoints.length > 8) orb.trailPoints.pop();
        orb.trailPoints.forEach(point => point.opacity *= 0.85);

        // Update pulse
        orb.pulsePhase += orb.pulseSpeed;
        orb.radius = orb.baseRadius + Math.sin(orb.pulsePhase) * 3;

        // Draw trail
        orb.trailPoints.forEach((point, index) => {
          if (index === 0) return;
          const trailRadius = orb.baseRadius * 0.6 * point.opacity;
          if (trailRadius < 0.5) return;
          
          ctx.beginPath();
          const trailGrad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, trailRadius);
          trailGrad.addColorStop(0, orb.color.replace(/[\d\.]+\)/, `${point.opacity * 0.5})`));
          trailGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = trailGrad;
          ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw main orb
        ctx.beginPath();
        const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        orbGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        orbGrad.addColorStop(0.3, orb.color);
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orbGrad;
        ctx.globalAlpha = orb.opacity;
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 5. Update and draw floating runes
      runesRef.current.forEach(rune => {
        rune.rotation += rune.rotationSpeed;
        rune.pulsePhase += 0.02;
        rune.floatOffset += rune.floatSpeed;
        
        const floatY = rune.y + Math.sin(rune.floatOffset) * 8;
        const pulseScale = rune.scale + Math.sin(rune.pulsePhase) * 0.2;
        const glowAlpha = (Math.sin(rune.pulsePhase * 0.7) + 1) * 0.3 + 0.4;
        
        ctx.save();
        ctx.translate(rune.x, floatY);
        ctx.rotate(rune.rotation);
        ctx.scale(pulseScale, pulseScale);
        
        // Glow effect
        ctx.shadowColor = rune.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = rune.color.replace(/[\d\.]+\)/, `${glowAlpha})`);
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rune.char, 0, 0);
        
        ctx.restore();
      });

      // 6. Update and draw enhanced particles
      particlesRef.current.forEach(particle => {
        // Update lifetime
        particle.life += 16; // Assume ~60fps
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = random(0, width);
          particle.y = height + 10;
          particle.vx = random(-0.5, 0.5);
          particle.vy = random(-0.8, -0.2);
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Keep within bounds
        if (particle.x < 0 || particle.x > width) particle.vx *= -0.8;
        
        // Calculate lifecycle opacity
        const lifeRatio = particle.life / particle.maxLife;
        let alpha = 0;
        if (lifeRatio < 0.1) {
          alpha = lifeRatio / 0.1; // Fade in
        } else if (lifeRatio > 0.8) {
          alpha = (1 - lifeRatio) / 0.2; // Fade out
        } else {
          alpha = 1; // Full visibility
        }
        
        // Add twinkle effect
        const twinkle = Math.sin(currentTime * particle.twinkleSpeed + particle.x) * 0.3 + 0.7;
        particle.opacity = particle.baseOpacity * alpha * twinkle;

        // Draw particle with glow
        if (particle.opacity > 0.05) {
          ctx.save();
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = particle.radius * 2;
          ctx.beginPath();
          ctx.fillStyle = particle.color.replace(/[\d\.]+\)/, `${particle.opacity})`);
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [initializeParticles, initializeOrbs, initializeRunes, drawBackground, drawTorchEffects]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default React.memo(DungeonCanvasBackground);
