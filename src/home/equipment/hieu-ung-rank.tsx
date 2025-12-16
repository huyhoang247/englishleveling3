import React, { useRef, useEffect, useState } from 'react';

// --- Icon Path Data ---
const ICONS = {
  crown: new Path2D("M2 20h20 M6 20V5l4 7 4-7 4 7V20"),
  flame: new Path2D("M12 2c0 0-3 3.5-3 6 0 1.5 1 2.5 2 3 .5-1.5 1.5-2.5 3-3-1.5 3-.5 5 1.5 6 1.5.5 2.5 2 2.5 4a7.5 7.5 0 1 1-15 0c0 1.5.5 3 1.5 4 .5-1.5 2-2.5 3-3 1.5.5 3 2 4.5 2"), 
};

// --- Rank Configuration System ---
const RANK_DATA = {
  E: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.6)', dark: '#4b5563', label: 'COMMON', title: 'TÂN BINH' },     // Gray
  D: { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)', dark: '#16a34a', label: 'UNCOMMON', title: 'CHIẾN BINH' },  // Green
  B: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', dark: '#2563eb', label: 'RARE', title: 'TƯỚNG QUÂN' },      // Blue
  A: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', dark: '#9333ea', label: 'EPIC', title: 'ĐẠI TƯỚNG' },       // Purple
  S: { color: '#facc15', glow: 'rgba(250, 204, 21, 0.6)', dark: '#ca8a04', label: 'LEGENDARY', title: 'ĐẾ VƯƠNG' },    // Gold
  SS: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.8)', dark: '#c2410c', label: 'MYTHIC', title: 'HỦY DIỆT' },      // Orange
  SSR: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.9)', dark: '#7f1d1d', label: 'GODLY', title: 'THẦN THOẠI' }      // Red
};

const LegendaryMagicCircle = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [currentRank, setCurrentRank] = useState('S');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    
    // Get current theme based on state
    const theme = RANK_DATA[currentRank];

    // --- Drawing Helpers ---
    const roundedRect = (ctx, x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const drawPolygon = (ctx, x, y, radius, sides, rotation) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = rotation + (i * 2 * Math.PI) / sides;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawRunes = (ctx, x, y, radius, count, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.font = '10px monospace';
      ctx.fillStyle = theme.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < count; i++) {
          const angle = (i * 2 * Math.PI) / count;
          ctx.save();
          ctx.rotate(angle);
          ctx.translate(0, -radius);
          const char = String.fromCharCode(0x0391 + (i % 24)); 
          ctx.fillText(char, 0, 0);
          ctx.restore();
      }
      ctx.restore();
    };

    const drawIcon = (ctx, path, x, y, size, color, glowColor) => {
      ctx.save();
      ctx.translate(x, y);
      const scale = size / 24;
      ctx.scale(scale, scale);
      ctx.translate(-12, -12);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;
      
      // Fill for flame, Stroke for crown to keep style consistent
      if (path === ICONS.flame) {
          ctx.fill(path);
      } else {
          ctx.stroke(path);
      }
      ctx.restore();
    };

    // --- Main Render Loop ---
    const render = () => {
      // Special effect for SSR: faster animation
      let dynamicColor = theme.color;
      let dynamicGlow = theme.glow;
      
      if (currentRank === 'SSR') {
        time += 0.03; // Faster animation for SSR
      } else {
        time += 0.02; 
      }
      
      const dpr = window.devicePixelRatio || 1;
      const clientWidth = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
      const isMobile = clientWidth < 768;
      
      // Layout
      const headerHeight = 220;
      const itemSpacing = 350;
      const centerX = clientWidth / 2;

      let contentHeight, pos1, pos2;
      if (isMobile) {
        contentHeight = headerHeight + (itemSpacing * 2) + 100;
        pos1 = { x: centerX, y: headerHeight + 50 };
        pos2 = { x: centerX, y: headerHeight + itemSpacing + 50 };
      } else {
        contentHeight = headerHeight + 400;
        pos1 = { x: centerX - 200, y: headerHeight + 100 };
        pos2 = { x: centerX + 200, y: headerHeight + 100 };
      }

      // Resize
      if (canvas.width !== clientWidth * dpr || canvas.height !== contentHeight * dpr) {
        canvas.width = clientWidth * dpr;
        canvas.height = contentHeight * dpr;
        canvas.style.width = `${clientWidth}px`;
        canvas.style.height = `${contentHeight}px`;
        ctx.scale(dpr, dpr);
      }

      // Clear & Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, clientWidth, contentHeight);

      // --- Header ---
      ctx.textAlign = 'center';
      ctx.shadowColor = dynamicGlow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = dynamicColor;
      ctx.font = isMobile ? '800 24px sans-serif' : '800 32px sans-serif';
      ctx.fillText(`HỆ THỐNG RANK: ${currentRank}`, centerX, 120);
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#6b7280';
      ctx.font = isMobile ? '14px sans-serif' : '16px sans-serif';
      ctx.fillText(`Cấp độ sức mạnh: ${theme.label}`, centerX, 150);

      // ===============================================
      // ITEM 1: MAGIC CIRCLE
      // ===============================================
      const drawRunicGate = (x, y) => {
        // 1. Background Glow
        ctx.save();
        ctx.translate(x, y); 
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
        grad.addColorStop(0, theme.glow.replace(/[\d.]+\)$/g, '0.2)')); // Low opacity
        grad.addColorStop(1, theme.glow.replace(/[\d.]+\)$/g, '0)'));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 130, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Outer Dashed Ring
        ctx.save();
        ctx.translate(x, y); 
        ctx.rotate(time * 0.2);
        ctx.beginPath();
        ctx.setLineDash([15, 10]); 
        ctx.strokeStyle = dynamicColor;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 4 Gems
        for(let i=0; i<4; i++) {
           ctx.rotate(Math.PI / 2);
           ctx.save();
           ctx.translate(0, -85);
           ctx.shadowColor = dynamicColor;
           ctx.shadowBlur = 8;
           ctx.fillStyle = dynamicColor;
           ctx.beginPath();
           ctx.arc(0, 0, 3, 0, Math.PI * 2);
           ctx.fill();
           ctx.restore();
        }
        ctx.restore();

        // 3. Runes
        drawRunes(ctx, x, y, 72, 24, -time * 0.3);

        // 4. Inner Geometry
        ctx.save();
        ctx.translate(x, y);
        
        ctx.save();
        ctx.rotate(time * 0.5);
        ctx.strokeStyle = dynamicColor;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        drawPolygon(ctx, 0, 0, 60, 3, 0);
        ctx.restore();

        ctx.save();
        ctx.rotate(time * 0.5 + Math.PI); 
        ctx.strokeStyle = dynamicColor;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        drawPolygon(ctx, 0, 0, 60, 3, 0);
        ctx.restore();
        
        ctx.beginPath();
        ctx.strokeStyle = dynamicColor;
        ctx.globalAlpha = 0.3;
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // 5. Central Icon
        drawIcon(ctx, ICONS.crown, x, y - 10, 56, dynamicColor, theme.glow);
        
        ctx.fillStyle = dynamicColor;
        ctx.font = 'bold 18px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText(theme.title, x, y + 45);
      };

      // --- ITEM 2: CARD ---
      const drawMoltenCard = (x, y) => {
        const width = 250;
        const height = 250;
        const halfW = width / 2;
        const halfH = height / 2;

        ctx.save();
        ctx.translate(x, y);

        // Spinning Border
        ctx.save();
        roundedRect(ctx, -halfW, -halfH, width, height, 12);
        ctx.clip();
        ctx.rotate(time * 2.5); 
        
        const gradientSize = width * 1.5;
        try {
            const conic = ctx.createConicGradient(0, 0, 0);
            conic.addColorStop(0, 'transparent');
            conic.addColorStop(0.3, theme.dark); 
            conic.addColorStop(0.5, dynamicColor); 
            conic.addColorStop(0.55, 'transparent');
            ctx.fillStyle = conic;
            ctx.fillRect(-gradientSize/2, -gradientSize/2, gradientSize, gradientSize);
        } catch (e) {
            ctx.fillStyle = dynamicColor;
            ctx.fillRect(-halfW, -halfH, width, height);
        }
        ctx.restore();

        // Inner Card
        const inset = 3;
        ctx.fillStyle = '#171717';
        roundedRect(ctx, -halfW + inset, -halfH + inset, width - (inset*2), height - (inset*2), 10);
        ctx.fill();

        // Content
        const innerY = -halfH + inset;
        const innerX = -halfW + inset;
        const innerW = width - (inset*2);

        ctx.strokeStyle = theme.glow.replace(/[\d.]+\)$/g, '0.2)');
        ctx.beginPath();
        ctx.moveTo(innerX + 20, innerY + 50);
        ctx.lineTo(innerX + innerW - 20, innerY + 50);
        ctx.stroke();

        drawIcon(ctx, ICONS.flame, innerX + 35, innerY + 30, 20, dynamicColor, theme.glow);

        ctx.fillStyle = dynamicColor;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('MAX', innerX + innerW - 20, innerY + 35);

        ctx.textAlign = 'center';
        const textGrad = ctx.createLinearGradient(0, -20, 0, 20);
        textGrad.addColorStop(0, '#ffffff');
        textGrad.addColorStop(1, dynamicColor);
        ctx.fillStyle = textGrad;
        ctx.font = '900 32px sans-serif';
        // Split title into 2 words if possible, or just render title
        const words = theme.title.split(' ');
        if (words.length >= 2) {
             ctx.fillText(words[0], 0, 5);
             ctx.fillText(words.slice(1).join(' '), 0, 35);
        } else {
             ctx.fillText(theme.title, 0, 20);
        }
        
        ctx.fillStyle = theme.glow.replace(/[\d.]+\)$/g, '0.5)');
        ctx.beginPath();
        ctx.roundRect(-24, 45, 48, 3, 2);
        ctx.fill();

        ctx.strokeStyle = theme.glow.replace(/[\d.]+\)$/g, '0.1)');
        ctx.beginPath();
        ctx.moveTo(innerX, innerY + height - 40);
        ctx.lineTo(innerX + innerW, innerY + height - 40);
        ctx.stroke();

        ctx.fillStyle = '#737373';
        ctx.font = '10px sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${theme.label} ITEM`, 0, innerY + height - 20);

        // Soft Opacity Shimmer
        ctx.save();
        roundedRect(ctx, -halfW, -halfH, width, height, 12);
        ctx.clip();
        
        const loopDistance = width * 4; 
        const speed = 400; 
        const sheenX = ((time * speed) % loopDistance) - width;

        ctx.transform(1, 0, -0.45, 1, 0, 0); 
        const sheenWidth = 300;
        const sheenGrad = ctx.createLinearGradient(sheenX, 0, sheenX + sheenWidth, 0);
        sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)'); 
        sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sheenGrad;
        ctx.fillRect(sheenX - 100, -height, sheenWidth + 200, height * 3);
        ctx.restore();
        
        ctx.restore();
      };

      drawRunicGate(pos1.x, pos1.y);
      drawMoltenCard(pos2.x, pos2.y);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentRank]); // Re-run when rank changes

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-[#050505] overflow-hidden">
      {/* Rank Selection Controls */}
      <div className="absolute top-4 left-0 right-0 z-10 flex flex-wrap justify-center gap-2 px-4">
        {Object.keys(RANK_DATA).map((rank) => (
          <button
            key={rank}
            onClick={() => setCurrentRank(rank)}
            className={`
              px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 border
              ${currentRank === rank 
                ? 'bg-opacity-20 transform scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'}
            `}
            style={{
              borderColor: currentRank === rank ? RANK_DATA[rank].color : undefined,
              color: currentRank === rank ? RANK_DATA[rank].color : undefined,
              backgroundColor: currentRank === rank ? RANK_DATA[rank].glow : undefined,
            }}
          >
            {rank}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default LegendaryMagicCircle;


