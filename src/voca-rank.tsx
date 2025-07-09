import React, { useState, useCallback } from 'react';

// --- Định nghĩa Type cho dữ liệu ---
type VocabularyItem = {
  id: number;
  word: string;
  exp: number;
  level: number;
  maxExp: number;
};

// --- Dữ liệu mẫu ---
const initialVocabularyData: VocabularyItem[] = [
  { id: 1, word: 'Ephemeral', exp: 75, level: 3, maxExp: 100 },
  { id: 2, word: 'Serendipity', exp: 100, level: 5, maxExp: 100 },
  { id: 3, word: 'Luminous', exp: 30, level: 2, maxExp: 100 },
  { id: 4, word: 'Ubiquitous', exp: 95, level: 8, maxExp: 100 },
  { id: 5, word: 'Mellifluous', exp: 100, level: 1, maxExp: 100 },
  { id: 6, word: 'Petrichor', exp: 15, level: 4, maxExp: 100 },
  { id: 7, word: 'Ineffable', exp: 60, level: 7, maxExp: 100 },
];

// --- Biểu tượng (Icon) ---
const TrophyIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// --- Thành phần chính của ứng dụng ---
export default function App() {
  const [vocabulary, setVocabulary] = useState(initialVocabularyData);

  // Sắp xếp từ vựng theo level giảm dần, sau đó là EXP giảm dần
  const sortedVocabulary = [...vocabulary].sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return b.exp - a.exp;
  });

  const handleClaim = useCallback((id: number) => {
    setVocabulary(prevVocab =>
      prevVocab.map(item => {
        if (item.id === id && item.exp >= item.maxExp) {
          return { ...item, level: item.level + 1, exp: 0 };
        }
        return item;
      })
    );
  }, []);

  return (
    <>
      {/* Cập nhật animation để phù hợp với màu chữ mới của Level */}
      <style>{`
        @keyframes level-up-pop {
          0% { transform: scale(1); color: #fcd34d; } /* amber-300 */
          50% { transform: scale(1.5); color: #67e8f9; } /* cyan-300 */
          100% { transform: scale(1); color: #fcd34d; } /* amber-300 */
        }
        .animate-level-up-pop {
          animation: level-up-pop 0.6s ease-in-out;
        }
      `}</style>
      
      <div className="bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white min-h-screen font-sans p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 pb-2">
              Bảng Xếp Hạng Từ Vựng
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Theo dõi tiến độ và nhận phần thưởng thông thạo!</p>
          </header>

          <main className="bg-slate-900/40 p-2 sm:p-3 rounded-2xl shadow-2xl shadow-cyan-500/20 border border-slate-700">
            {/* --- Header của bảng --- */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-slate-400 hidden md:grid">
              <div className="col-span-1 text-center">HẠNG</div>
              <div className="col-span-3">TỪ VỰNG</div>
              <div className="col-span-5">TIẾN TRÌNH</div>
              <div className="col-span-1 text-center">LEVEL</div>
              <div className="col-span-2 text-center">PHẦN THƯỞỞNG</div>
            </div>

            {/* --- Danh sách từ vựng dạng thẻ --- */}
            <div className="flex flex-col gap-2">
              {sortedVocabulary.map((item, index) => (
                <VocabularyRow key={item.id} item={item} rank={index + 1} onClaim={handleClaim} />
              ))}
            </div>
          </main>
          
          <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Thiết kế bởi Gemini. Chúc bạn học tốt!</p>
          </footer>
        </div>
      </div>
    </>
  );
}

// --- Thành phần cho mỗi hàng (card) trong bảng ---
function VocabularyRow({ item, rank, onClaim }: { item: VocabularyItem, rank: number, onClaim: (id: number) => void }) {
  const { id, word, exp, level, maxExp } = item;
  const progressPercentage = Math.min((exp / maxExp) * 100, 100);
  const isClaimable = exp >= maxExp;

  const [justLeveledUp, setJustLeveledUp] = useState(false);

  const handleClaimClick = () => {
    if (!isClaimable) return;
    onClaim(id);
    setJustLeveledUp(true);
    setTimeout(() => setJustLeveledUp(false), 600); 
  };
  
  return (
    // Đây là một "thẻ" (card)
    <div className="grid grid-cols-12 gap-x-4 gap-y-3 items-center p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 hover:bg-slate-700/60 hover:border-cyan-500/50 transition-all duration-300">
      
      {/* Cột 0: Thứ hạng */}
      <div className="col-span-2 md:col-span-1 text-center flex items-center justify-center">
        <span className="text-xl font-bold text-slate-500">{rank}</span>
      </div>

      {/* Cột 1: Từ vựng */}
      <div className="col-span-10 md:col-span-3">
        <p className="font-bold text-lg text-white">{word}</p>
        <span className="md:hidden text-xs text-slate-400">Từ vựng</span>
      </div>

      {/* Cột 2: Thanh tiến trình */}
      <div className="col-span-12 md:col-span-5 md:px-2">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right font-mono">{exp} / {maxExp} EXP</p>
      </div>

      {/* Cột 3: Level Tag (Thiết kế mới) */}
      <div className="col-span-5 sm:col-span-4 md:col-span-1 flex items-center justify-start md:justify-center">
        <div className="flex items-baseline justify-center bg-amber-900/50 border border-amber-500/30 rounded-full px-3 py-1 w-fit">
          <span className="text-xs font-semibold text-amber-400/80 mr-1">
            Lv.
          </span>
          <span className={`font-bold text-lg text-amber-300 transition-colors duration-300 ${justLeveledUp ? 'animate-level-up-pop' : ''}`}>
            {level}
          </span>
        </div>
      </div>

      {/* Cột 4: Nút Claim */}
      <div className="col-span-7 sm:col-span-8 md:col-span-2 flex justify-end md:justify-center">
        <button
          onClick={handleClaimClick}
          disabled={!isClaimable}
          className={`
            flex items-center justify-center gap-2 w-full max-w-[150px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 border
            ${isClaimable
              ? 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transform hover:scale-105 cursor-pointer'
              : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          <TrophyIcon className="w-4 h-4" />
          {isClaimable ? 'Nhận Thưởng' : 'Chưa Đạt'}
        </button>
      </div>
    </div>
  );
}
