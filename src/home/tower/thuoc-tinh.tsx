import React, { useRef, useEffect } from 'react';

// --- BỘ ICON SVG ---
// Đã loại bỏ icon Eye (Hắc ám)
const Icons = {
  Skull: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-3.5 0-6 2.5-6 6 0 1.5.5 3.5 1.5 5.5C8 16 8 18 8 19h8c0-1 0-3 .5-5.5 1-2 1.5-4 1.5-5.5 0-3.5-2.5-6-6-6z" />
      <path d="M10 22h4" />
      <path d="M10 12h.01" />
      <path d="M14 12h.01" />
      <path d="M12 16a2 2 0 0 1-2-1" />
    </svg>
  ),
  Droplet: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-7.4-1.7-3-3.3-5.3-4-6.6-.7 1.3-2.3 3.6-4 6.6-2 3.5-3 5.4-3 7.4a7 7 0 0 0 7 7z" />
    </svg>
  ),
  Zap: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Ghost: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 22l1-2.5L12 22l2-2.5L15 22l3.5-3.5C20.5 16.5 21 14 21 11c0-5.5-3.5-9-9-9S3 5.5 3 11c0 3 .5 5.5 2.5 7.5L9 22z" />
      <path d="M10 10h.01" />
      <path d="M14 10h.01" />
    </svg>
  ),
  Shield: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Sword: ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  )
};

// --- CẤU HÌNH NGUYÊN TỐ (Đã xóa shadow) ---
export const ELEMENTS = {
  fire: {
    name: 'Hỏa Ngục',
    primary: '#ef4444', 
    secondary: '#b91c1c',
    glow: 'rgba(239, 68, 68, 0.8)',
    particleColor: '239, 68, 68',
    Icon: Icons.Skull
  },
  water: {
    name: 'Thủy Triều',
    primary: '#3b82f6', 
    secondary: '#1e3a8a', 
    glow: 'rgba(59, 130, 246, 0.8)',
    particleColor: '59, 130, 246',
    Icon: Icons.Droplet
  },
  lightning: {
    name: 'Lôi Điện',
    primary: '#d8b4fe', 
    secondary: '#7e22ce', 
    glow: 'rgba(192, 132, 252, 0.8)',
    particleColor: '216, 180, 254',
    Icon: Icons.Zap
  },
  ice: {
    name: 'Băng Giá',
    primary: '#22d3ee',
    secondary: '#0891b2',
    glow: 'rgba(34, 211, 238, 0.8)',
    particleColor: '34, 211, 238',
    Icon: Icons.Ghost
  },
  poison: {
    name: 'Độc Tố',
    primary: '#a3e635',
    secondary: '#3f6212',
    glow: 'rgba(163, 230, 53, 0.8)',
    particleColor: '163, 230, 53',
    Icon: Icons.Shield
  },
  holy: {
    name: 'Thánh Quang',
    primary: '#fcd34d',
    secondary: '#b45309',
    glow: 'rgba(252, 211, 77, 0.8)',
    particleColor: '252, 211, 77',
    Icon: Icons.Sword
  }
};

export type ElementKey = keyof typeof ELEMENTS;

interface MagicCircleProps {
    elementKey: ElementKey;
    className?: string;
}

const MagicCircle: React.FC<MagicCircleProps> = ({ elementKey, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const rotationRef = useRef(0);
  const elementRef = useRef(ELEMENTS[elementKey]); 

  useEffect(() => {
    elementRef.current = ELEMENTS[elementKey];
    particlesRef.current = []; 
  }, [elementKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.clientWidth * 2; 
          canvas.height = parent.clientHeight * 2;
          canvas.style.width = `${parent.clientWidth}px`;
          canvas.style.height = `${parent.clientHeight}px`;
          ctx.scale(2, 2);
      }
    };
    setSize();

    const createParticle = (width: number, height: number, colorRGB: string) => {
        return {
            x: (Math.random() - 0.5) * 80, // Thu nhỏ phạm vi sinh hạt (80)
            y: 35, 
            speed: 0.4 + Math.random() * 0.9, 
            size: Math.random() * 1.5 + 0.5,
            life: 1, 
            decay: 0.01 + Math.random() * 0.02, 
            colorRGB: colorRGB
        };
    };

    const drawMagicCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rotation: number, config: typeof ELEMENTS['fire']) => {
        ctx.save();
        ctx.translate(cx, cy + 50); 
        ctx.scale(1, 0.3); 
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = config.glow;
        ctx.globalCompositeOperation = 'lighter';

        // GIẢM KÍCH THƯỚC BÁN KÍNH VẼ ĐỂ VÒNG NHỎ HƠN
        
        // 1. Vòng tròn chính (Giảm bán kính từ 100 -> 80)
        ctx.save();
        ctx.rotate(rotation * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = config.primary;
        ctx.stroke();
        
        // Họa tiết chấm tròn
        for(let i=0; i<6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 6);
            ctx.beginPath();
            ctx.arc(80, 0, 2.5, 0, Math.PI*2);
            ctx.fillStyle = config.secondary;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();

        // 2. Vòng Rune (Giảm bán kính từ 80 -> 65)
        ctx.save();
        ctx.rotate(-rotation * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 65, 0, Math.PI * 2);
        ctx.strokeStyle = config.secondary;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.restore();

        // 3. Hình học ma pháp (Giảm bán kính từ 85 -> 70)
        ctx.save();
        ctx.rotate(rotation);
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(70 * Math.cos(i * 2 * Math.PI / 3), 70 * Math.sin(i * 2 * Math.PI / 3));
        }
        ctx.closePath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = config.primary;
        ctx.stroke();
        ctx.restore();

        ctx.restore(); 
    };

    const render = () => {
        const width = canvas.width / 2; 
        const height = canvas.height / 2;
        const cx = width / 2;
        const cy = height / 2;
        const config = elementRef.current;

        ctx.clearRect(0, 0, width, height);
        rotationRef.current += 0.01; 

        drawMagicCircle(ctx, cx, cy, rotationRef.current, config);

        if (particlesRef.current.length < 15 && Math.random() < 0.1) { 
            particlesRef.current.push(createParticle(width, height, config.particleColor));
        }

        ctx.save();
        ctx.translate(cx, cy + 50); 
        ctx.globalCompositeOperation = 'screen'; 
        ctx.scale(1, 1); 

        particlesRef.current.forEach((p, index) => {
            p.y -= p.speed; 
            p.life -= p.decay; 
            const wave = Math.sin(p.life * 6) * 4; 

            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x + wave, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.colorRGB}, ${p.life * 0.6})`; 
                ctx.fill();
            } else {
                particlesRef.current.splice(index, 1);
            }
        });
        ctx.restore();

        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, []); 

  return (
    <canvas 
        ref={canvasRef} 
        className={`w-full h-full pointer-events-none ${className || ''}`}
    />
  );
};

export default MagicCircle;
