// --- START OF FILE bot-anti.tsx ---

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useQuizApp } from '../courses/course-context.tsx';

// --- ICONS ---
const IconShieldCheck = ({ size = 24, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const IconRefresh = ({ size = 24, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M8 16H3v5"></path>
  </svg>
);

const IconX = ({ size = 24, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
);

// --- LOGIC HELPER ---
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

interface BotAntiProps {
    onSuccess: () => void;
    onClose: () => void;
}

export const BotAntiVerification = memo(({ onSuccess, onClose }: BotAntiProps) => {
  // Lấy dữ liệu từ vựng và định nghĩa từ Context
  const { defaultVocabulary, definitionsMap } = useQuizApp();

  const [targetWord, setTargetWord] = useState("");
  const [targetMeaning, setTargetMeaning] = useState(""); // State lưu nghĩa tiếng Việt
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState<"playing" | "success" | "error">("playing");
  const [shake, setShake] = useState(false);

  // Logic sinh vị trí không trùng lặp cho các bong bóng
  const generateNonOverlappingPositions = (count: number) => {
    const positions: {x: number, y: number}[] = [];
    const minDistance = 18; 
    const maxAttempts = 100;

    for (let i = 0; i < count; i++) {
      let placed = false;
      let attempt = 0;

      while (!placed && attempt < maxAttempts) {
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
    // 1. Lọc từ vựng phù hợp từ danh sách (độ dài 3-6 ký tự và có định nghĩa)
    const suitableWords = defaultVocabulary.filter(word => {
        const len = word.length;
        // Kiểm tra xem có definition trong map không
        const hasDef = definitionsMap[word.toLowerCase()];
        return len >= 3 && len <= 6 && hasDef;
    });

    // Fallback danh sách cứng nếu không tìm thấy từ phù hợp (tránh crash)
    const wordPool = suitableWords.length > 0 ? suitableWords : ["GAME", "LUCK", "GOLD"];
    
    // Chọn từ ngẫu nhiên
    const rawWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    const wordUpper = rawWord.toUpperCase();
    
    // Lấy nghĩa tiếng Việt từ definitionsMap
    const definition = definitionsMap[rawWord.toLowerCase()];
    const meaning = definition ? definition.vietnamese : "";

    setTargetWord(wordUpper);
    setTargetMeaning(meaning);
    setCurrentInput("");
    setStatus("playing");
    setShake(false);

    // Tạo các bong bóng ký tự
    const letters = wordUpper.split('');
    const positions = generateNonOverlappingPositions(letters.length);

    const newBubbles = letters.map((char, index) => ({
      id: index,
      char: char,
      x: positions[index].x,
      y: positions[index].y,
      duration: random(4, 7),
      delay: random(0, 2),
      colorFrom: `hsl(${random(240, 280)}, 85%, 65%)`,
      colorTo: `hsl(${random(280, 320)}, 85%, 65%)`,
      isPopped: false
    }));
    
    // Xáo trộn thứ tự hiển thị bong bóng
    setBubbles(newBubbles.sort(() => Math.random() - 0.5));
  }, [defaultVocabulary, definitionsMap]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleBubbleClick = (bubbleId: number, char: string) => {
    if (status !== 'playing') return;

    const nextCharIndex = currentInput.length;
    const expectedChar = targetWord[nextCharIndex];

    if (char === expectedChar) {
      const newInput = currentInput + char;
      setCurrentInput(newInput);
      setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, isPopped: true } : b));

      if (newInput === targetWord) {
        setStatus("success");
        setTimeout(() => onSuccess(), 800);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      <div className={`relative w-full max-w-[340px] bg-[#1e1b2e] border-2 border-slate-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-1.5 bg-black/40 rounded-full text-slate-400 hover:text-white hover:bg-black/60 transition-all"
        >
            <IconX size={16} />
        </button>

        <div className="pt-5 pb-3 px-4 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#2a2640] to-[#1e1b2e]">
          <h2 className="text-base font-lilita text-white flex items-center gap-2 tracking-wide mb-2">
            <IconShieldCheck className="text-purple-400" size={18} />
            ANTI-BOT CHECK
          </h2>
          
          {/* Container hiển thị từ tiếng Anh và nghĩa tiếng Việt */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 bg-black/30 px-4 py-1.5 rounded-full border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tap order:</span>
                <span className="text-yellow-400 font-lilita text-lg tracking-widest">{targetWord}</span>
            </div>
            
            {/* Hàng mới: Hiển thị nghĩa Tiếng Việt */}
            {targetMeaning && (
                <span className="text-slate-300 text-xs italic font-medium opacity-90 animate-fadeIn mt-1 text-center px-4">
                    {targetMeaning}
                </span>
            )}
          </div>
        </div>

        <div className="relative h-[280px] w-full bg-[#151320] overflow-hidden select-none">
          <div className="absolute inset-0 opacity-20" 
               style={{ 
                 backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
               }} 
          />

          {/* Hiển thị các ô chữ đã nhập */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
            {targetWord.split('').map((char, index) => (
              <div 
                key={index}
                className={`w-8 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all duration-300 font-lilita
                  ${index < currentInput.length 
                    ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.5)] scale-110' 
                    : 'bg-slate-800/40 border-slate-700 text-slate-600'
                  }
                  ${status === 'error' && 'border-red-500 text-red-500 bg-red-500/10'}
                  ${status === 'success' && 'border-green-500 text-green-500 bg-green-500/10'}
                `}
              >
                {index < currentInput.length ? currentInput[index] : ''}
              </div>
            ))}
          </div>

          {/* Các bong bóng chữ cái */}
          {bubbles.map((bubble) => (
            !bubble.isPopped && (
              <div
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble.id, bubble.char)}
                className="absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform z-20 group"
                style={{
                  top: `${bubble.y}%`,
                  left: `${bubble.x}%`,
                  background: `linear-gradient(135deg, ${bubble.colorFrom}, ${bubble.colorTo})`,
                  animation: `float ${bubble.duration}s ease-in-out infinite alternate`,
                  animationDelay: `${bubble.delay}s`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)`
                }}
              >
                <div className="absolute top-2 left-2 w-3 h-1.5 bg-white/40 rounded-full rotate-[-45deg] blur-[0.5px]"></div>
                <span className="text-white font-lilita text-xl drop-shadow-md pb-1 select-none">
                  {bubble.char}
                </span>
              </div>
            )
          ))}

          {/* Màn hình thành công */}
          {status === 'success' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 animate-fadeIn">
              <div className="bg-green-500 rounded-full p-3 mb-2 animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                <IconShieldCheck size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-lilita text-white tracking-wide">VERIFIED!</h3>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#1e1b2e] border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Security Check</span>
             <button onClick={initGame} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-500 hover:text-white transition-colors" title="Refresh">
                <IconRefresh size={16} />
             </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
});

export default BotAntiVerification;
