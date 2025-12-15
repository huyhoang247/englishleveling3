import React, { useRef, useEffect, useState } from 'react';

// --- BỘ ICON SVG TỰ VẼ (Không cần thư viện) ---
const Icons = {
  Skull: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-3.5 0-6 2.5-6 6 0 1.5.5 3.5 1.5 5.5C8 16 8 18 8 19h8c0-1 0-3 .5-5.5 1-2 1.5-4 1.5-5.5 0-3.5-2.5-6-6-6z" />
      <path d="M10 22h4" />
      <path d="M10 12h.01" />
      <path d="M14 12h.01" />
      <path d="M12 16a2 2 0 0 1-2-1" />
    </svg>
  ),
  Droplet: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-7.4-1.7-3-3.3-5.3-4-6.6-.7 1.3-2.3 3.6-4 6.6-2 3.5-3 5.4-3 7.4a7 7 0 0 0 7 7z" />
    </svg>
  ),
  Zap: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Ghost: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 22l1-2.5L12 22l2-2.5L15 22l3.5-3.5C20.5 16.5 21 14 21 11c0-5.5-3.5-9-9-9S3 5.5 3 11c0 3 .5 5.5 2.5 7.5L9 22z" />
      <path d="M10 10h.01" />
      <path d="M14 10h.01" />
    </svg>
  ),
  Shield: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Sword: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  ),
  Eye: ({ color }) => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
};

// --- CẤU HÌNH NGUYÊN TỐ ---
const ELEMENTS = {
  fire: {
    name: 'Hỏa Ngục',
    primary: '#ef4444', 
    secondary: '#b91c1c',
    glow: 'rgba(239, 68, 68, 1)',
    particleColor: '239, 68, 68',
    icon: <Icons.Skull color="#ef4444" />
  },
  water: {
    name: 'Thủy Triều',
    primary: '#3b82f6', 
    secondary: '#1e3a8a', 
    glow: 'rgba(59, 130, 246, 1)',
    particleColor: '59, 130, 246',
    icon: <Icons.Droplet color="#3b82f6" />
  },
  lightning: {
    name: 'Lôi Điện',
    primary: '#d8b4fe', 
    secondary: '#7e22ce', 
    glow: 'rgba(192, 132, 252, 1)',
    particleColor: '216, 180, 254',
    icon: <Icons.Zap color="#d8b4fe" />
  },
  shadow: {
    name: 'Hắc Ám',
    primary: '#94a3b8', 
    secondary: '#0f172a', 
    glow: 'rgba(71, 85, 105, 1)', 
    particleColor: '148, 163, 184', 
    icon: <Icons.Eye color="#94a3b8" />
  },
  ice: {
    name: 'Băng Giá',
    primary: '#22d3ee',
    secondary: '#0891b2',
    glow: 'rgba(34, 211, 238, 1)',
    particleColor: '34, 211, 238',
    icon: <Icons.Ghost color="#22d3ee" />
  },
  poison: {
    name: 'Độc Tố',
    primary: '#a3e635',
    secondary: '#3f6212',
    glow: 'rgba(163, 230, 53, 1)',
    particleColor: '163, 230, 53',
    icon: <Icons.Shield color="#a3e635" />
  },
  holy: {
    name: 'Thánh Quang',
    primary: '#fcd34d',
    secondary: '#b45309',
    glow: 'rgba(252, 211, 77, 1)',
    particleColor: '252, 211, 77',
    icon: <Icons.Sword color="#fcd34d" />
  }
};

const CanvasMagicCircle = () => {
  const canvasRef = useRef(null);
  const [activeElement, setActiveElement] = useState('fire');

  // Refs để lưu trữ biến animation
  const particlesRef = useRef([]);
  const rotationRef = useRef(0);
  const elementRef = useRef(ELEMENTS['fire']); 

  useEffect(() => {
    elementRef.current = ELEMENTS[activeElement];
    particlesRef.current = []; // Reset hạt khi đổi hệ
  }, [activeElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setSize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth * 2; 
      canvas.height = parent.clientHeight * 2;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.scale(2, 2);
    };
    setSize();
    window.addEventListener('resize', setSize);

    // --- TẠO HẠT ---
    const createParticle = (width, height, colorRGB) => {
        return {
            x: (Math.random() - 0.5) * 140, 
            y: 35, 
            speed: 0.4 + Math.random() * 0.9, 
            size: Math.random() * 1.8 + 0.5,
            life: 1, 
            decay: 0.005 + Math.random() * 0.012, 
            colorRGB: colorRGB
        };
    };

    // --- VẼ VÒNG TRÒN ---
    const drawMagicCircle = (ctx, cx, cy, rotation, config) => {
        ctx.save();
        ctx.translate(cx, cy + 50); 
        ctx.scale(1, 0.4); // Góc nhìn 3D
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = config.glow;
        ctx.globalCompositeOperation = 'lighter';

        // 1. Vòng tròn chính
        ctx.save();
        ctx.rotate(rotation * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = config.primary;
        ctx.stroke();
        
        // Họa tiết chấm tròn
        for(let i=0; i<8; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 8);
            ctx.beginPath();
            ctx.arc(120, 0, 3, 0, Math.PI*2);
            ctx.fillStyle = config.secondary;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();

        // 2. Vòng Rune
        ctx.save();
        ctx.rotate(-rotation * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.strokeStyle = config.secondary;
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 20]);
        ctx.stroke();
        ctx.restore();

        // 3. Hình học ma pháp
        ctx.save();
        ctx.rotate(rotation);
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(100 * Math.cos(i * 2 * Math.PI / 3), 100 * Math.sin(i * 2 * Math.PI / 3));
        }
        ctx.closePath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = config.primary;
        ctx.stroke();
        ctx.restore();

        ctx.restore(); 
    };

    // --- RENDER LOOP ---
    const render = () => {
        const width = canvas.width / 2; 
        const height = canvas.height / 2;
        const cx = width / 2;
        const cy = height / 2;
        const config = elementRef.current;

        ctx.clearRect(0, 0, width, height);
        rotationRef.current += 0.015;

        // 1. Vẽ Vòng
        drawMagicCircle(ctx, cx, cy, rotationRef.current, config);

        // 2. Xử lý Hạt (Particles) - GIỚI HẠN 35 HẠT
        if (particlesRef.current.length < 35 && Math.random() < 0.08) { 
            particlesRef.current.push(createParticle(width, height, config.particleColor));
        }

        ctx.save();
        ctx.translate(cx, cy + 50); 
        ctx.globalCompositeOperation = 'screen'; 

        particlesRef.current.forEach((p, index) => {
            p.y -= p.speed; 
            p.life -= p.decay; 
            const wave = Math.sin(p.life * 6) * 6; 

            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x + wave, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.colorRGB}, ${p.life * 0.7})`; 
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
        window.removeEventListener('resize', setSize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white overflow-hidden relative font-sans">
      
      {/* Container hiển thị Boss */}
      <div className="relative w-full max-w-lg h-[500px] flex items-center justify-center border border-neutral-800 rounded-2xl bg-neutral-900/40 shadow-2xl backdrop-blur-sm">
        
        {/* Layer Canvas vẽ hiệu ứng */}
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Layer DOM hiển thị Boss UI (Đã xóa tên và thanh máu) */}
        <div className="absolute z-10 flex flex-col items-center animate-[bounce_4s_infinite]">
             <div 
                className="relative transition-all duration-500 ease-in-out transform hover:scale-110 group"
                style={{ 
                    filter: `drop-shadow(0 0 25px ${ELEMENTS[activeElement].glow})` 
                }}
             >
                {/* Vòng sáng background sau lưng boss */}
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                {/* Icon Boss */}
                {ELEMENTS[activeElement].icon}
             </div>
        </div>

      </div>

      {/* Bảng điều khiển */}
      <div className="mt-8 w-full max-w-2xl px-4 z-20">
        <div className="flex flex-wrap justify-center gap-2 bg-neutral-900/80 p-3 rounded-xl border border-white/5 backdrop-blur-md shadow-xl">
            {Object.keys(ELEMENTS).map((key) => (
                <button
                    key={key}
                    onClick={() => setActiveElement(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 border flex items-center gap-2 min-w-[100px] justify-center ${
                        activeElement === key 
                        ? 'bg-neutral-800 text-white border-neutral-600 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105' 
                        : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800/50'
                    }`}
                >
                    <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: ELEMENTS[key].primary }}
                    />
                    {ELEMENTS[key].name}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasMagicCircle;

