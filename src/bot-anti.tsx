import React, { useState, useEffect, useCallback } from 'react';

// --- BỘ ICON SVG TỰ VẼ (Không cần thư viện) ---
const IconLock = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const IconShieldCheck = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const IconRefresh = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M8 16H3v5"></path>
  </svg>
);

const IconCheckCircle = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const IconXCircle = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>
);

// --- DỮ LIỆU & LOGIC ---

const VOCABULARY = [
  "APPLE", "CLOUD", "WATER", "RIVER", "OCEAN", 
  "TIGER", "EAGLE", "PIANO", "BRAIN", "LIGHT", 
  "EARTH", "SPACE", "MAGIC", "POWER", "PEACE"
];

const random = (min, max) => Math.random() * (max - min) + min;

// Hàm tính khoảng cách giữa 2 điểm
const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// --- COMPONENT CHÍNH ---

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifySuccess = () => {
    setIsVerified(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      
      {/* Màn hình chính giả lập */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className={`p-4 rounded-full ${isVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isVerified ? <IconShieldCheck size={48} /> : <IconLock size={48} />}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Hệ Thống Bảo Mật</h1>
        <p className="text-slate-300 mb-8">
          {isVerified 
            ? "Xác thực thành công! Bạn có thể tiếp tục." 
            : "Vui lòng xác thực bạn không phải là robot để tiếp tục."}
        </p>

        {!isVerified && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/30"
          >
            Click để xác thực
          </button>
        )}
        
        {isVerified && (
          <div className="flex items-center justify-center gap-2 text-green-400 font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <IconCheckCircle size={20} />
            <span>Đã xác minh an toàn</span>
          </div>
        )}
      </div>

      {/* Popup Captcha */}
      {isOpen && (
        <CaptchaPopup 
          onSuccess={handleVerifySuccess} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}

// --- GAME COMPONENT ---

const CaptchaPopup = ({ onSuccess, onClose }) => {
  const [targetWord, setTargetWord] = useState("");
  const [bubbles, setBubbles] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState("playing");
  const [shake, setShake] = useState(false);

  // Logic sinh vị trí không trùng lặp (Đã tối ưu khoảng cách)
  const generateNonOverlappingPositions = (count) => {
    const positions = [];
    const minDistance = 18; 
    const maxAttempts = 100;

    for (let i = 0; i < count; i++) {
      let placed = false;
      let attempt = 0;

      while (!placed && attempt < maxAttempts) {
        // Random vị trí, padding 10% để không dính mép
        const x = random(10, 85); 
        const y = random(15, 75);

        let isOverlapping = false;
        for (const pos of positions) {
          if (getDistance(x, y, pos.x, pos.y) < minDistance) {
            isOverlapping = true;
            break;
          }
        }

        if (!isOverlapping) {
          positions.push({ x, y });
          placed = true;
        }
        attempt++;
      }

      if (!placed) {
        positions.push({ x: random(10, 80), y: random(10, 70) });
      }
    }
    return positions;
  };

  const initGame = useCallback(() => {
    const word = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
    setTargetWord(word);
    setCurrentInput("");
    setStatus("playing");
    setShake(false);

    const letters = word.split('');
    const positions = generateNonOverlappingPositions(letters.length);

    const newBubbles = letters.map((char, index) => ({
      id: index,
      char: char,
      x: positions[index].x,
      y: positions[index].y,
      duration: random(4, 7),
      delay: random(0, 2),
      // Chỉ lắc nhẹ tại chỗ để tránh bay đè lên nhau
      floatX: random(-5, 5), 
      floatY: random(-5, 5), 
      colorFrom: `hsl(${random(210, 290)}, 85%, 65%)`, 
      colorTo: `hsl(${random(290, 330)}, 85%, 65%)`,
      isPopped: false
    }));
    
    setBubbles(newBubbles.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleBubbleClick = (bubbleId, char) => {
    if (status !== 'playing') return;

    const nextCharIndex = currentInput.length;
    const expectedChar = targetWord[nextCharIndex];

    if (char === expectedChar) {
      const newInput = currentInput + char;
      setCurrentInput(newInput);
      setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, isPopped: true } : b));

      if (newInput === targetWord) {
        setStatus("success");
        setTimeout(() => onSuccess(), 1000);
      }
    } else {
      setShake(true);
      setStatus("error");
      setTimeout(() => {
        setShake(false);
        setStatus("playing");
        setCurrentInput("");
        setBubbles(prev => prev.map(b => ({ ...b, isPopped: false })));
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className={`relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        
        {/* Header */}
        <div className="p-4 bg-slate-900/50 flex justify-between items-center border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <IconShieldCheck className="text-blue-400" size={20} />
              Xác thực bảo mật
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Bấm theo thứ tự: <span className="text-yellow-400 font-bold text-base ml-1 tracking-widest bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">{targetWord}</span>
            </p>
          </div>
          <button onClick={initGame} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors" title="Đổi từ khác">
            <IconRefresh size={20} />
          </button>
        </div>

        {/* Play Area */}
        <div className="relative h-80 w-full bg-slate-900 overflow-hidden select-none">
          {/* Background Grid trang trí */}
          <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
               }} 
          />

          {/* Progress Slots */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-3 z-10 pointer-events-none">
            {targetWord.split('').map((char, index) => (
              <div 
                key={index}
                className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 backdrop-blur-sm
                  ${index < currentInput.length 
                    ? 'bg-blue-500/30 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110' 
                    : 'bg-slate-800/60 border-slate-600 text-slate-600'
                  }
                  ${status === 'error' && 'border-red-500 text-red-500 bg-red-500/20'}
                  ${status === 'success' && 'border-green-500 text-green-500 bg-green-500/20'}
                `}
              >
                {index < currentInput.length ? currentInput[index] : ''}
              </div>
            ))}
          </div>

          {/* Render Bubbles */}
          {bubbles.map((bubble) => (
            !bubble.isPopped && (
              <div
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble.id, bubble.char)}
                className="absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-xl active:scale-95 transition-transform hover:brightness-125 z-20 group"
                style={{
                  top: `${bubble.y}%`,
                  left: `${bubble.x}%`,
                  // Gradient màu sắc
                  background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), transparent), linear-gradient(135deg, ${bubble.colorFrom}, ${bubble.colorTo})`,
                  // CSS Animation
                  animation: `float ${bubble.duration}s ease-in-out infinite alternate`,
                  animationDelay: `${bubble.delay}s`,
                  // Bóng đổ 3D
                  boxShadow: `0 8px 20px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.4), 0 0 10px ${bubble.colorFrom}`
                }}
              >
                {/* Bubble Shine */}
                <div className="absolute top-2 left-2.5 w-4 h-2 bg-white/50 rounded-full rotate-[-45deg] blur-[0.5px]"></div>
                
                {/* Character */}
                <span className="text-white font-extrabold text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] select-none group-hover:scale-110 transition-transform font-mono">
                  {bubble.char}
                </span>
              </div>
            )
          ))}

          {/* Success Overlay */}
          {status === 'success' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
              <div className="bg-green-500 rounded-full p-4 mb-3 animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                <IconCheckCircle size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide">XÁC THỰC OK!</h3>
            </div>
          )}
          
          {/* Error Flash */}
          {status === 'error' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/20 pointer-events-none animate-pulse">
              <IconXCircle size={80} className="text-red-500 opacity-60 drop-shadow-xl" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-700 text-center text-xs text-slate-500">
          Smart Captcha Protection v3.0 (No Libs)
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(var(--tx, 5px), var(--ty, -5px)); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

