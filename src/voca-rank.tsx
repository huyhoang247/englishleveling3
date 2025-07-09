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

// --- Các biểu tượng (Icon) ---
const TrophyIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const ArrowRightIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

const LockClosedIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

// --- Thành phần chính của ứng dụng ---
export default function App() {
  const [vocabulary, setVocabulary] = useState(initialVocabularyData);

  const sortedVocabulary = [...vocabulary].sort((a, b) => b.level - a.level || b.exp - a.exp);

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
    <div className="bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white min-h-screen font-sans p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 pb-2">
            Bảng Xếp Hạng Từ Vựng
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Theo dõi tiến độ và nhận phần thưởng thông thạo!</p>
        </header>

        <main className="bg-slate-900/40 p-2 sm:p-3 rounded-2xl shadow-2xl shadow-cyan-500/20 border border-slate-700">
          {/* --- Header của bảng (Bố cục mới) --- */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-slate-400 hidden md:grid">
            <div className="col-span-1 text-center">HẠNG</div>
            <div className="col-span-4">TỪ VỰNG</div>
            <div className="col-span-4">TIẾN TRÌNH</div>
            <div className="col-span-3 text-center">PHẦN THƯỞNG & HÀNH ĐỘNG</div>
          </div>

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
  );
}

// --- Thành phần cho mỗi hàng (card) trong bảng ---
function VocabularyRow({ item, rank, onClaim }: { item: VocabularyItem, rank: number, onClaim: (id: number) => void }) {
  const { id, word, exp, level, maxExp } = item;
  const progressPercentage = Math.min((exp / maxExp) * 100, 100);
  const isClaimable = exp >= maxExp;

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-4 items-center p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 hover:bg-slate-700/60 hover:border-cyan-500/50 transition-all duration-300">
      
      {/* Cột 1: Thứ hạng */}
      <div className="col-span-1 self-start md:self-center text-center">
        <span className="text-xl font-bold text-slate-500">{rank}</span>
      </div>

      {/* Cột 2: Từ vựng & Level */}
      <div className="col-span-11 md:col-span-4">
        <p className="font-bold text-lg text-white">{word}</p>
        <p className="text-sm text-cyan-400/80 font-medium">Level {level}</p>
      </div>

      {/* Cột 3: Thanh tiến trình */}
      <div className="col-span-12 md:col-span-4">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right font-mono">{exp} / {maxExp} EXP</p>
      </div>

      {/* Cột 4: Phần thưởng và Nút hành động */}
      <div className="col-span-12 md:col-span-3 flex flex-col sm:flex-row items-center gap-4 md:justify-center">
        {/* Visual phần thưởng */}
        <div className="flex-1 flex items-center justify-center h-full text-slate-400">
            {isClaimable ? (
                <div className="flex items-center gap-2 font-semibold">
                    <span>Lv.{level}</span>
                    <ArrowRightIcon className="w-5 h-5 text-slate-500"/>
                    <span className="text-lg font-bold text-emerald-400 animate-pulse">Lv.{level + 1}</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-5 h-5" />
                    <span className="text-sm">Đã khóa</span>
                </div>
            )}
        </div>
        {/* Nút hành động */}
        <button
          onClick={() => onClaim(id)}
          disabled={!isClaimable}
          className={`
            flex items-center justify-center gap-2 w-full sm:w-auto flex-grow-0 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 border
            ${isClaimable
              ? 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transform hover:scale-105 cursor-pointer'
              : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          <TrophyIcon className="w-4 h-4" />
          {isClaimable ? 'Nhận' : 'Chưa Đạt'}
        </button>
      </div>
    </div>
  );
}
