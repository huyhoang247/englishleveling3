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

const MasteryCardIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
        <path fillRule="evenodd" d="M1.5 8.625v10.5a1.875 1.875 0 001.875 1.875h17.25A1.875 1.875 0 0022.5 19.125v-10.5a1.875 1.875 0 00-1.875-1.875H3.375A1.875 1.875 0 001.5 8.625zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

const GoldIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.83 3.755 4.145.604c.73.107 1.022.998.494 1.507l-2.998 2.922.708 4.129c.125.727-.635 1.285-1.29.938l-3.706-1.948-3.706 1.948c-.655.347-1.415-.211-1.29-.938l.708-4.129-2.998-2.922c-.528-.509-.236-1.4.494-1.507l4.145-.604 1.83-3.755z" clipRule="evenodd" />
  </svg>
);


// --- Thành phần chính của ứng dụng ---
export default function App() {
  const [vocabulary, setVocabulary] = useState(initialVocabularyData);

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
      <div className="bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 text-white min-h-screen font-sans p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 pb-2">
              Bảng Xếp Hạng Từ Vựng
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Theo dõi tiến độ và nhận phần thưởng thông thạo!</p>
          </header>

          <main className="bg-slate-900/40 p-2 sm:p-3 rounded-2xl shadow-2xl shadow-cyan-500/20 border border-slate-700">
            {/* --- Header của bảng (đã cập nhật) --- */}
            {/* Thay đổi ở đây: điều chỉnh col-span cho phù hợp */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-slate-400 hidden md:grid">
              <div className="col-span-1 text-center">HẠNG</div>
              <div className="col-span-3">TỪ VỰNG</div>
              <div className="col-span-3">TIẾN TRÌNH</div>
              <div className="col-span-3 text-center">THƯỞNG CẤP</div>
              <div className="col-span-2 text-center">HÀNH ĐỘNG</div>
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
    </>
  );
}

// --- Thành phần cho mỗi hàng (card) trong bảng ---
function VocabularyRow({ item, rank, onClaim }: { item: VocabularyItem, rank: number, onClaim: (id: number) => void }) {
  const { id, word, exp, level, maxExp } = item;
  const progressPercentage = Math.min((exp / maxExp) * 100, 100);
  const isClaimable = exp >= maxExp;
  const goldReward = 100 * level;

  const handleClaimClick = () => {
    if (!isClaimable) return;
    onClaim(id);
  };
  
  return (
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
      {/* Thay đổi ở đây: điều chỉnh col-span */}
      <div className="col-span-12 md:col-span-3 md:px-2">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right font-mono">{exp} / {maxExp} EXP</p>
      </div>

      {/* Cột 3: Phần thưởng cấp (Thiết kế mới trong ô) */}
      {/* Thay đổi ở đây: thiết kế lại hoàn toàn */}
      <div className="col-span-6 md:col-span-3 flex items-center justify-center">
        <div className="flex w-full max-w-[180px] items-center justify-around rounded-xl bg-black/20 p-2 shadow-inner border border-slate-700">
            <div className="flex items-center gap-1.5" title="1 Thẻ thông thạo">
                <MasteryCardIcon className="w-6 h-6 text-sky-300 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">x1</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${goldReward} Vàng`}>
                <GoldIcon className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">{goldReward}</span>
            </div>
        </div>
      </div>


      {/* Cột 4: Nút Claim */}
      {/* Thay đổi ở đây: điều chỉnh col-span */}
      <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center">
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
