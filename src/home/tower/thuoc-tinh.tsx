import React, { useRef, useEffect } from 'react';

// --- BỘ ICON SVG (Giữ nguyên) ---
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

// --- CẤU HÌNH NGUYÊN TỐ ---
export const ELEMENTS = {
  fire: {
    name: 'Hỏa Ngục',
    primary: '#ef4444', 
    secondary: '#fb7185', // Màu phụ sáng hơn tí
    glow: 'rgba(239, 68, 68, 0.6)',
    particleColor: '239, 68, 68',
    Icon: Icons.Skull
  },
  water: {
    name: 'Thủy Triều',
    primary: '#3b82f6', 
    secondary: '#60a5fa', 
    glow: 'rgba(59, 130, 246, 0.6)',
    particleColor: '59, 130, 246',
    Icon: Icons.Droplet
  },
  lightning: {
    name: 'Lôi Điện',
    primary: '#d8b4fe', 
    secondary: '#e9d5ff', 
    glow: 'rgba(192, 132, 252, 0.6)',
    particleColor: '216, 180, 254',
    Icon: Icons.Zap
  },
  ice: {
    name: 'Băng Giá',
    primary: '#22d3ee',
    secondary: '#67e8f9',
    glow: 'rgba(34, 211, 238, 0.6)',
    particleColor: '34, 211, 238',
    Icon: Icons.Ghost
  },
  poison: {
    name: 'Độc Tố',
    primary: '#a3e635',
    secondary: '#bef264',
    glow: 'rgba(163, 230, 53, 0.6)',
    particleColor: '163, 230, 53',
    Icon: Icons.Shield
  },
  holy: {
    name: 'Thánh Quang',
    primary: '#fcd34d',
    secondary: '#fde68a',
    glow: 'rgba(252, 211, 77, 0.6)',
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
  const pulseRef = useRef(0); // Dùng để tạo hiệu ứng nhịp đập
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
            x: (Math.random() - 0.5) * 80, 
            y: 35, 
            speed: 0.3 + Math.random() * 0.7, 
            size: Math.random() * 1.5 + 0.5,
            life: 1, 
            decay: 0.008 + Math.random() * 0.015, 
            colorRGB: colorRGB
        };
    };

    const drawMagicCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rotation: number, pulse: number, config: typeof ELEMENTS['fire']) => {
        ctx.save();
        // Giữ nguyên vị trí cy + 40 như đã thống nhất
        ctx.translate(cx, cy + 40); 
        ctx.scale(1, 0.3); 
        
        // Hiệu ứng Pulse: Thay đổi độ sáng/mờ theo hàm sin
        const pulseOpacity = 0.8 + Math.sin(pulse) * 0.2;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = config.glow;
        ctx.globalCompositeOperation = 'lighter';
        
        // --- LỚP 1: VÒNG TRÒN CHÍNH (KÉP) ---
        ctx.save();
        ctx.rotate(rotation * 0.2); // Xoay chậm
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = config.primary;
        ctx.globalAlpha = pulseOpacity;
        ctx.stroke();

        // Vòng tròn mỏng bên trong sát vòng chính
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = config.secondary;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.restore();
        
        // --- LỚP 2: LỤC TINH TRẬN (HEXAGRAM - 2 TAM GIÁC) ---
        // Thay vì 1 tam giác, vẽ 2 tam giác ngược nhau để tạo ngôi sao 6 cánh
        const drawTriangle = (r: number, offsetAngle: number) => {
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = offsetAngle + (i * 2 * Math.PI / 3);
                ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.stroke();
            
            // Vẽ các chấm tròn ở đỉnh tam giác (Nodes)
            for (let i = 0; i < 3; i++) {
                const angle = offsetAngle + (i * 2 * Math.PI / 3);
                ctx.save();
                ctx.translate(r * Math.cos(angle), r * Math.sin(angle));
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fillStyle = config.secondary;
                ctx.fill();
                ctx.restore();
            }
        };

        ctx.save();
        ctx.rotate(rotation * 0.5); // Xoay cùng chiều
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = config.primary;
        
        // Tam giác 1
        drawTriangle(75, 0);
        // Tam giác 2 (Xoay 180 độ so với cái kia để tạo sao 6 cánh)
        drawTriangle(75, Math.PI); 
        ctx.restore();

        // --- LỚP 3: VÒNG RUNE (KÝ TỰ CỔ) ---
        // Xoay ngược chiều, nét đứt tạo cảm giác văn bản ma thuật
        ctx.save();
        ctx.rotate(-rotation * 0.4); 
        ctx.beginPath();
        ctx.arc(0, 0, 55, 0, Math.PI * 2);
        ctx.strokeStyle = config.secondary;
        ctx.lineWidth = 3;
        // Tạo pattern nét đứt ngẫu nhiên: [dài, khoảng, ngắn, khoảng...]
        ctx.setLineDash([2, 5, 8, 4, 2, 6]); 
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.restore();

        // --- LỚP 4: TÂM NĂNG LƯỢNG ---
        // Một hình thoi xoay ở giữa
        ctx.save();
        ctx.rotate(-rotation);
        ctx.beginPath();
        const coreSize = 15;
        ctx.moveTo(0, -coreSize);
        ctx.lineTo(coreSize, 0);
        ctx.lineTo(0, coreSize);
        ctx.lineTo(-coreSize, 0);
        ctx.closePath();
        ctx.fillStyle = config.primary;
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.strokeStyle = config.secondary;
        ctx.lineWidth = 1;
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
        
        // Cập nhật biến animation
        rotationRef.current += 0.012; 
        pulseRef.current += 0.05;

        drawMagicCircle(ctx, cx, cy, rotationRef.current, pulseRef.current, config);

        if (particlesRef.current.length < 15 && Math.random() < 0.1) { 
            particlesRef.current.push(createParticle(width, height, config.particleColor));
        }

        ctx.save();
        ctx.translate(cx, cy + 40); 
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
