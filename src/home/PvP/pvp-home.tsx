// --- START OF FULL FILE: src/home/PvP/pvp-home.tsx ---

import React, { useState, Fragment } from 'react';
import { useGame } from '../../GameContext'; // Điều chỉnh đường dẫn nếu cần
import { auth } from '../../firebase'; // Điều chỉnh đường dẫn nếu cần
import { 
    findInvasionOpponents, 
    resolveInvasionBattleClientSide, 
    PvpOpponent, 
    BattleResult,
    CombatStats 
} from './pvp-service.ts'; // Điều chỉnh đường dẫn nếu cần

// --- INTERFACES (có thể chuyển ra file riêng) ---

export interface PlayerData {
  name: string;
  avatarUrl: string;
  coins: number;
  initialStats: CombatStats; 
  invasionLog: {
    opponent: string;
    result: 'win' | 'loss';
    resources: number;
    timestamp: Date;
  }[];
}

// ===================================================================================
// --- START OF SHARED UI COMPONENTS ---
// ===================================================================================

const PvpStyles = () => (
    <style>{`
        .main-bg {
            background-image: url('https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/assets/images/pvp-bg.webp');
            background-size: cover;
            background-position: center;
        }
        .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .btn-shine::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 20%;
            height: 200%;
            background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
            transform: rotate(25deg);
            animation: shine 5s infinite;
        }
        @keyframes shine {
            0% { left: -50%; }
            20% { left: 120%; }
            100% { left: 120%; }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-scale-fast {
            animation: fadeInScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 20px; }
    `}</style>
);

const HomeIcon = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const InvasionIcon = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CoinDisplay = ({ displayedCoins }: { displayedCoins: number }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/50 border border-yellow-700">
        <svg className="w-5 h-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="font-bold text-yellow-300 font-sans tracking-wider">{displayedCoins.toLocaleString()}</span>
    </div>
);

const SearchingModal = () => (
    <div className="text-center animate-fade-in">
        <h2 className="text-3xl mb-4">Đang tìm kiếm...</h2>
        <div className="flex justify-center items-center gap-2">
            <div className="w-4 h-4 bg-sky-400 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-sky-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-4 h-4 bg-sky-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
    </div>
);

const DefenseLogModal = ({ log, onClose }: { log: PlayerData['invasionLog'], onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center" onClick={onClose}>
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full max-w-md animate-fade-in-scale-fast" onClick={e => e.stopPropagation()}>
      <h2 className="text-2xl font-bold text-center mb-4 text-sky-400">Nhật Ký Phòng Thủ</h2>
      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {log.length > 0 ? log.map((entry, index) => (
          <div key={index} className="bg-slate-900/70 p-3 rounded-lg flex justify-between items-center text-sm font-sans">
            <div>
              <p>Đối thủ: <span className="font-bold text-slate-200">{entry.opponent}</span></p>
              <p className="text-xs text-slate-400">{entry.timestamp.toLocaleString()}</p>
            </div>
            <div>
              <span className={`font-bold text-lg ${entry.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                {entry.result === 'win' ? 'THẮNG' : 'THUA'}
              </span>
            </div>
          </div>
        )) : <p className="text-center text-slate-400 font-sans">Không có dữ liệu.</p>}
      </div>
      <button onClick={onClose} className="mt-6 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold uppercase transition-colors">Đóng</button>
    </div>
  </div>
);

// ===================================================================================
// --- START OF PVP COMPONENTS ---
// ===================================================================================

function PvpSelection({ onClose, playerData, onSelectMode }: {
    onClose: () => void;
    playerData: PlayerData;
    onSelectMode: (mode: 'invasion') => void;
}) {
    return (
        <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
            <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
                <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                        <HomeIcon className="w-5 h-5 text-slate-300" />
                        <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                    </button>
                    <CoinDisplay displayedCoins={playerData.coins} />
                </div>
            </header>
            <main className="w-full flex-1 overflow-y-auto p-4 pt-20 flex flex-col items-center">
                <div className="flex justify-center w-full max-w-md">
                    <div className="group relative bg-slate-900/50 border-2 border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-all duration-300 hover:border-sky-500/80 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/10 w-full">
                         <div className="absolute -top-8 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-sky-900/50 group-hover:border-sky-500"><InvasionIcon className="w-9 h-9 text-slate-400 transition-colors duration-300 group-hover:text-sky-400" /></div>
                        <h2 className="text-3xl font-bold mt-8 text-shadow text-sky-400">XÂM LƯỢC</h2>
                        <p className="font-sans text-sm text-slate-400 mt-2 mb-6 h-10">Tấn công người chơi khác, cướp tài nguyên, hoặc xây dựng phòng tuyến bất khả xâm phạm.</p>
                        <div className="w-full bg-black/30 p-3 rounded-lg border border-slate-700 mb-6 flex flex-col items-center justify-center h-[76px]">
                            <span className='font-sans text-sm text-slate-300'>Phòng thủ gần nhất: {playerData.invasionLog[0] ? <span className={`font-bold ${playerData.invasionLog[0].result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{playerData.invasionLog[0].result === 'win' ? 'THẮNG' : 'THUA'}</span> : <span className='text-slate-400'>N/A</span>}</span>
                            <button onClick={() => alert("Mở nhật ký")} className="mt-2 text-xs font-sans text-slate-400 hover:text-white underline">Xem nhật ký</button>
                        </div>
                        <div className="mt-auto w-full flex gap-3">
                             <button onClick={() => onSelectMode('invasion')} className="w-full py-3 bg-sky-600/50 hover:bg-sky-600 rounded-lg font-bold tracking-wider uppercase border border-sky-500 hover:border-sky-400 transition-all">Hành Động</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function PvpInvasion({ onClose, player1 }: {
    onClose: () => void;
    player1: PlayerData;
}) {
    const [view, setView] = useState<'main' | 'scouting' | 'battle'>('main');
    const [opponents, setOpponents] = useState<PvpOpponent[]>([]);
    const [currentTarget, setCurrentTarget] = useState<PvpOpponent | null>(null);
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [isActionInProgress, setIsActionInProgress] = useState(false);

    const handleScout = async () => {
        if (isActionInProgress) return;
        setIsActionInProgress(true);
        setView('scouting');
        try {
            const playerPower = player1.initialStats.atk * 1.5 + player1.initialStats.def;
            const foundOpponents = await findInvasionOpponents(auth.currentUser!.uid, playerPower);
            setOpponents(foundOpponents);
        } catch (error) {
            console.error("Failed to scout opponents:", error);
            alert("Không thể tìm thấy đối thủ. Vui lòng thử lại.");
            setView('main');
        } finally {
            setIsActionInProgress(false);
        }
    };

    const handleAttack = async (target: PvpOpponent) => {
        if (isActionInProgress) return;
        setIsActionInProgress(true);
        setCurrentTarget(target);
        setView('battle');
        
        const result = await resolveInvasionBattleClientSide(
            auth.currentUser!.uid,
            target.userId,
            player1.initialStats
        );
        
        setBattleResult(result);
        setIsActionInProgress(false);
        // Dữ liệu coins sẽ tự cập nhật qua real-time listener của GameContext
    };

    const reset = () => {
        setView('main');
        setOpponents([]);
        setCurrentTarget(null);
        setBattleResult(null);
    };

    return (
        <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
            {showLogModal && <DefenseLogModal log={player1.invasionLog} onClose={() => setShowLogModal(false)} />}
            <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
                <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                        <HomeIcon className="w-5 h-5 text-slate-300" />
                        <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                    </button>
                    <h1 className="text-2xl font-bold text-sky-400 text-shadow tracking-widest">XÂM LƯỢC</h1>
                    <CoinDisplay displayedCoins={player1.coins} />
                </div>
            </header>
            <main className="w-full flex-1 overflow-y-auto p-4 pt-20 flex flex-col items-center">
                {view === 'main' && (
                    <div className="text-center animate-fade-in-scale-fast w-full max-w-sm">
                        <h2 className="text-4xl">Chuẩn bị Xâm Lược</h2>
                        <p className="font-sans text-slate-400 mt-2 mb-8">Tấn công người chơi khác để cướp vàng hoặc củng cố phòng tuyến.</p>
                        <div className="flex flex-col gap-4 max-w-xs mx-auto">
                            <button onClick={handleScout} disabled={isActionInProgress} className="w-full py-3 bg-sky-600/50 hover:bg-sky-600 rounded-lg font-bold tracking-wider uppercase border border-sky-500 disabled:bg-slate-600/50 disabled:cursor-not-allowed">
                                {isActionInProgress ? 'Đang tìm...' : 'Dò Tìm Mục Tiêu'}
                            </button>
                            <button onClick={() => alert("Tính năng đang phát triển!")} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold tracking-wider uppercase border border-slate-600">Thiết Lập Phòng Thủ</button>
                            <button onClick={() => setShowLogModal(true)} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold tracking-wider uppercase border border-slate-600">Nhật Ký Phòng Thủ</button>
                        </div>
                    </div>
                )}
                {view === 'scouting' && (
                    <div className="w-full max-w-4xl animate-fade-in">
                        <h2 className="text-3xl text-center mb-6">Chọn Mục Tiêu Tấn Công</h2>
                        {isActionInProgress && opponents.length === 0 ? <SearchingModal /> : 
                         !isActionInProgress && opponents.length === 0 ? (
                            <div className="text-center text-slate-400 font-sans p-8 bg-slate-900/50 rounded-lg">
                                <h3 className="text-xl text-white mb-2">Không tìm thấy đối thủ</h3>
                                <p>Không có người chơi nào trong tầm sức mạnh của bạn. Hãy thử lại sau.</p>
                            </div>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {opponents.map((op, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 flex flex-col items-center gap-3 text-center">
                                        <img src={op.avatarUrl} alt={op.name} className="w-24 h-24 rounded-full border-2 border-slate-600" />
                                        <h3 className="text-xl font-bold">{op.name}</h3>
                                        <p className="font-sans text-sm text-slate-400">Vàng có thể cướp:</p>
                                        <p className="font-bold text-lg text-yellow-300">~{Math.floor(op.coins * 0.12).toLocaleString()}</p>
                                        <p className="font-sans text-xs text-slate-400">Sức mạnh: {op.powerLevel.toLocaleString()}</p>
                                        <button onClick={() => handleAttack(op)} disabled={isActionInProgress} className="mt-2 w-full py-2 bg-red-600/50 hover:bg-red-600 rounded-lg font-bold border border-red-500 disabled:bg-slate-600/50 disabled:cursor-not-allowed">
                                            {isActionInProgress ? '...' : 'Tấn Công'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                         <div className="text-center mt-8">
                             <button onClick={reset} disabled={isActionInProgress} className="font-sans text-slate-400 hover:text-white underline disabled:text-slate-600 disabled:cursor-not-allowed">Hủy và quay lại</button>
                         </div>
                    </div>
                )}
                {view === 'battle' && (
                    <div className="text-center animate-fade-in-scale-fast">
                        {!battleResult ? <SearchingModal /> :
                         battleResult.result === 'win' ? (
                            <div>
                                <h2 className="text-5xl text-green-400">THẮNG LỢI!</h2>
                                <p className="font-sans mt-4 text-lg">Bạn đã cướp được <span className="font-bold text-yellow-300">{battleResult.goldStolen.toLocaleString()}</span> vàng từ {currentTarget?.name}.</p>
                                <button onClick={reset} className="mt-8 px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold">OK</button>
                            </div>
                         ) : (
                            <div>
                                <h2 className="text-5xl text-red-400">THẤT BẠI!</h2>
                                <p className="font-sans mt-4 text-lg">Bạn đã bị phòng tuyến của {currentTarget?.name} đánh bại.</p>
                                <button onClick={reset} className="mt-8 px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold">OK</button>
                            </div>
                         )
                        }
                    </div>
                )}
            </main>
        </div>
    );
}

// ===================================================================================
// --- START OF MAIN EXPORTED COMPONENT ---
// ===================================================================================

export default function PvpArena({ onClose }: { onClose: () => void }) {
  const { coins, getPlayerBattleStats } = useGame(); // Giả sử GameContext có invasionLog
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return (
        <div className="w-full h-screen bg-black flex items-center justify-center text-white">
            <p>Vui lòng đăng nhập để truy cập Đấu trường.</p>
        </div>
    );
  }

  const battleStats = getPlayerBattleStats();
  const playerData: PlayerData = {
      name: currentUser.displayName || "Adventurer",
      avatarUrl: currentUser.photoURL || `https://api.dicebear.com/8.x/adventurer/svg?seed=${currentUser.uid}`,
      coins: coins,
      initialStats: {
        ...battleStats,
        // Các giá trị này nên được lấy từ context trong tương lai
        critRate: 0.1, 
        critDmg: 1.5,
        healPower: 50,
        reflectDmg: 10,
      },
      // Dữ liệu này cũng nên được lấy từ GameContext sau này
      invasionLog: [
          { opponent: 'Bot Phòng Thủ', result: 'win', resources: 100, timestamp: new Date() },
          { opponent: 'Bot Xâm Lược', result: 'loss', resources: -50, timestamp: new Date() },
      ]
  };
  
  const [mode, setMode] = useState<'selection' | 'invasion'>('selection');

  const renderContent = () => {
    if (mode === 'invasion') {
        return <PvpInvasion player1={playerData} onClose={() => setMode('selection')} />;
    }
    // Chuyển onClose về cho component PvpSelection để đóng toàn bộ modal
    return <PvpSelection playerData={playerData} onSelectMode={setMode} onClose={onClose} />;
  }

  return (
    <Fragment>
        <PvpStyles />
        {renderContent()}
    </Fragment>
  );
}

// --- END OF FULL FILE: src/home/PvP/pvp-home.tsx ---
