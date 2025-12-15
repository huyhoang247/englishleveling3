import React, { useState, useEffect, useRef } from 'react';
import { 
  Sword, Shield, Zap, Crown, Ghost, 
  Gem, Heart, Star, Skull, Anchor, 
  Hexagon, Sparkles, Crosshair, Target
} from 'lucide-react';

// --- CẤU HÌNH & DỮ LIỆU ---

const CARD_WIDTH = 120; // Tăng kích thước thẻ cho đẹp
const CARD_GAP = 16;    
const VISIBLE_CARDS = 5; 
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;

// Định nghĩa độ hiếm (Cập nhật style sang chảnh hơn)
const RARITY = {
  COMMON: { 
    label: 'Thường', 
    color: 'text-slate-400', 
    border: 'border-slate-600', 
    bgGradient: 'from-slate-800 to-slate-900', 
    glow: 'shadow-slate-500/0',
    iconGlow: 'drop-shadow-none'
  },
  RARE: { 
    label: 'Hiếm', 
    color: 'text-cyan-400', 
    border: 'border-cyan-500', 
    bgGradient: 'from-cyan-900/40 to-slate-900', 
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
    iconGlow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]'
  },
  EPIC: { 
    label: 'Sử Thi', 
    color: 'text-fuchsia-400', 
    border: 'border-fuchsia-500', 
    bgGradient: 'from-fuchsia-900/40 to-slate-900', 
    glow: 'shadow-[0_0_20px_rgba(232,121,249,0.4)]',
    iconGlow: 'drop-shadow-[0_0_15px_rgba(232,121,249,0.9)]'
  },
  LEGENDARY: { 
    label: 'Huyền Thoại', 
    color: 'text-amber-400', 
    border: 'border-amber-400', 
    bgGradient: 'from-amber-700/40 to-slate-900', 
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
    iconGlow: 'drop-shadow-[0_0_20px_rgba(251,191,36,1)]'
  },
};

const ITEMS_DB = [
  { id: 1, name: 'Rusty Blade', icon: Sword, rarity: 'COMMON' },
  { id: 2, name: 'Iron Guard', icon: Shield, rarity: 'COMMON' },
  { id: 3, name: 'Thunder Rune', icon: Zap, rarity: 'RARE' },
  { id: 4, name: 'Mystic Gem', icon: Gem, rarity: 'RARE' },
  { id: 5, name: 'Dragon Soul', icon: Heart, rarity: 'EPIC' },
  { id: 6, name: 'Void Mask', icon: Ghost, rarity: 'EPIC' },
  { id: 7, name: 'King\'s Crown', icon: Crown, rarity: 'LEGENDARY' },
  { id: 8, name: 'Nova Star', icon: Star, rarity: 'LEGENDARY' },
  { id: 9, name: 'Bone Relic', icon: Skull, rarity: 'COMMON' },
  { id: 10, name: 'Heavy Anchor', icon: Anchor, rarity: 'COMMON' },
];

const generateStrip = (count) => {
  const strip = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let selectedRarity = 'COMMON';
    if (roll > 0.96) selectedRarity = 'LEGENDARY';
    else if (roll > 0.82) selectedRarity = 'EPIC';
    else if (roll > 0.55) selectedRarity = 'RARE';

    const pool = ITEMS_DB.filter(i => i.rarity === selectedRarity);
    const finalItem = pool[Math.floor(Math.random() * pool.length)];
    strip.push({ ...finalItem, uniqueId: `item-${i}-${Date.now()}` });
  }
  return strip;
};

export default function App() {
  const [strip, setStrip] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [offset, setOffset] = useState(0);
  const [winner, setWinner] = useState(null);
  const [transitionTime, setTransitionTime] = useState(0);

  useEffect(() => {
    setStrip(generateStrip(100));
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    setTransitionTime(0);

    const currentItemIndex = Math.abs(offset / ITEM_FULL_WIDTH);
    const steps = Math.floor(Math.random() * (50 - 35 + 1)) + 35;
    
    if (currentItemIndex + steps >= strip.length - 10) {
        setStrip(prev => [...prev, ...generateStrip(50)]);
    }

    const targetIndex = Math.floor(currentItemIndex + steps);
    
    // Thêm jitter nhỏ để kim không luôn chỉ "chính giữa" tuyệt đối, tạo cảm giác analog
    // const jitter = Math.floor(Math.random() * 20) - 10; 
    const targetOffset = -(targetIndex * ITEM_FULL_WIDTH); 

    setTransitionTime(5); // Quay lâu hơn chút để tạo kịch tính
    setOffset(targetOffset);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(strip[targetIndex]);
    }, 5000); // Khớp với transitionTime
  };

  const containerWidth = VISIBLE_CARDS * ITEM_FULL_WIDTH;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#000000_70%)] opacity-80" />
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent top-1/2"></div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        
        {/* Title Block */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-md mb-2">
            <Target className="w-4 h-4 text-cyan-500 mr-2" />
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">System Ready</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-2xl">
            ARMORY
          </h1>
        </div>

        {/* --- MAIN SPINNER COMPONENT --- */}
        <div className="relative w-full">
          
          {/* Top & Bottom Decorative Rails */}
          <div className="absolute -top-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <div className="absolute -bottom-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

          {/* Spinner Container */}
          <div 
            className="relative h-44 w-full overflow-hidden bg-slate-950/50 backdrop-blur-sm border-y border-slate-800"
            style={{ 
                maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
            }}
          >
            {/* The Strip */}
            <div 
              className="absolute top-0 bottom-0 left-[50%] flex items-center will-change-transform"
              style={{
                transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, // Center alignment fix
                transition: isSpinning ? `transform ${transitionTime}s cubic-bezier(0.12, 0.8, 0.3, 1.0)` : 'none',
              }}
            >
              {strip.map((item, index) => {
                const config = RARITY[item.rarity];
                // Chỉ render những thẻ trong vùng nhìn thấy để tối ưu (đơn giản hoá cho demo này thì render hết)
                return (
                  <div 
                    key={item.uniqueId}
                    className="flex-shrink-0 flex items-center justify-center transition-all duration-300"
                    style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                  >
                    <div className={`
                      group relative w-full aspect-[4/5] rounded-lg 
                      bg-gradient-to-b ${config.bgGradient}
                      border ${config.border}
                      flex flex-col items-center justify-center gap-3
                      ${config.glow}
                      transition-all duration-300
                      ${isSpinning ? 'scale-90 opacity-70 blur-[0.5px]' : 'scale-100 opacity-100'}
                    `}>
                      
                      {/* Inner Glass Highlight */}
                      <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                      {/* Icon */}
                      <div className="relative z-10 p-3 rounded-full bg-slate-950/30 ring-1 ring-white/10">
                         <item.icon className={`w-10 h-10 ${config.color} ${config.iconGlow}`} strokeWidth={1.5} />
                      </div>

                      {/* Item Name (Small) */}
                      {!isSpinning && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color} opacity-80 text-center px-1 truncate w-full`}>
                          {item.name}
                        </span>
                      )}
                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- CENTER TARGET RETICLE (The Laser Pointer) --- */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[140px] pointer-events-none z-20">
            {/* Top Marker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            
            {/* Bottom Marker */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            
            {/* Center Laser Line */}
            <div className="absolute top-2 bottom-2 left-1/2 w-[2px] bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>

            {/* Side Brackets */}
            <div className="absolute inset-0 border-x-2 border-cyan-500/20 rounded-xl"></div>
          </div>

        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`
              relative overflow-hidden px-16 py-5 rounded-sm font-bold text-lg uppercase tracking-[0.2em]
              transition-all duration-300
              ${isSpinning 
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] border border-cyan-400'
              }
              group
            `}
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }} // Tech shape
          >
            <span className="relative z-10 flex items-center gap-3">
              {isSpinning ? 'Initiating...' : 'Spin System'}
            </span>
            
            {/* Animated Shine */}
            {!isSpinning && (
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
            )}
          </button>
        </div>

      </div>

      {/* --- RESULT MODAL --- */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setWinner(null)}></div>
          
          <div className="relative z-10 w-full max-w-md animate-in zoom-in-90 slide-in-from-bottom-10 duration-500">
             {/* Card Glow Background */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr ${RARITY[winner.rarity].bgGradient.replace('to-slate-900', '')} blur-[100px] opacity-50`}></div>

             <div className="bg-slate-900/90 border border-slate-700 p-1 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#0a0a0a] rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden">
                  
                  {/* Rarity Rays */}
                  <div className={`absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,${winner.rarity === 'LEGENDARY' ? '#fbbf24' : '#fff'}_60deg,transparent_120deg)] animate-[spin_4s_linear_infinite]`}></div>

                  <div className="relative z-10">
                    <div className="text-slate-500 text-xs font-mono mb-4 tracking-widest uppercase">Acquired Item</div>
                    
                    <div className={`mx-auto mb-6 w-32 h-32 flex items-center justify-center rounded-2xl border-2 ${RARITY[winner.rarity].border} bg-slate-800/50 backdrop-blur-xl shadow-2xl`}>
                      <winner.icon className={`w-16 h-16 ${RARITY[winner.rarity].color} drop-shadow-lg`} />
                    </div>

                    <h2 className={`text-3xl font-black uppercase tracking-tight mb-2 ${RARITY[winner.rarity].color}`}>
                      {winner.name}
                    </h2>
                    
                    <div className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest border ${RARITY[winner.rarity].border} ${RARITY[winner.rarity].color} bg-black/40`}>
                      {RARITY[winner.rarity].label} CLASS
                    </div>
                  </div>

                  <button 
                    onClick={() => setWinner(null)}
                    className="mt-8 w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded-sm relative z-10"
                  >
                    Collect
                  </button>

                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-shine {
          animation: shine 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

