import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- ICONS, CONFIGS & SHARED COMPONENTS ---

const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return <img src={src} alt="Coin Icon" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }} />;
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
};

const symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎', '7️⃣'];
const REEL_ITEM_COUNT = 30;
const basePayouts = { '💎💎💎': 80, '⭐⭐⭐': 60, '🔔🔔🔔': 40, '🍉🍉🍉': 20, '🍊🍊🍊': 15, '🍋🍋🍋': 10, '🍒🍒🍒': 5 };

const rooms = [
    { id: 1, name: 'Floor 1', minBalance: 0, baseBet: 10, betStep: 10, initialJackpot: 10000, payoutMultiplier: 1, color: 'text-orange-400', bgGradient: 'from-orange-900/50 to-slate-900' },
    { id: 2, name: 'Floor 2', minBalance: 5000, baseBet: 100, betStep: 50, initialJackpot: 100000, payoutMultiplier: 10, color: 'text-slate-300', bgGradient: 'from-slate-800/50 to-slate-900' },
    { id: 3, name: 'Floor 3', minBalance: 50000, baseBet: 1000, betStep: 500, initialJackpot: 1000000, payoutMultiplier: 100, color: 'text-yellow-400', bgGradient: 'from-yellow-900/50 to-slate-900' },
    { id: 4, name: 'Floor 4', minBalance: 500000, baseBet: 10000, betStep: 1000, initialJackpot: 10000000, payoutMultiplier: 1000, color: 'text-cyan-300', bgGradient: 'from-cyan-800/50 to-slate-900' }
];
const generatePayouts = (multiplier: number) => { const newPayouts: { [key: string]: number } = {}; for (const key in basePayouts) { newPayouts[key] = basePayouts[key as keyof typeof basePayouts] * multiplier; } return newPayouts; };
rooms.forEach(room => { (room as any).payouts = generatePayouts(room.payoutMultiplier); });
// @ts-ignore
type Room = typeof rooms[0] & { payouts: typeof basePayouts };

// --- COMPONENT: Reel ---
const Reel = ({ finalSymbol, spinning, onSpinEnd, index, isWinner }: { finalSymbol: string; spinning: boolean; onSpinEnd: () => void; index: number; isWinner: boolean; }) => {
    const reelRef = useRef<HTMLDivElement>(null);
    const [reelSymbols, setReelSymbols] = useState<string[]>([]);
    useEffect(() => { setReelSymbols(Array.from({ length: REEL_ITEM_COUNT }, () => symbols[Math.floor(Math.random() * symbols.length)])); }, []);
    useEffect(() => {
        if (!spinning || !reelRef.current) return;
        const newSymbols = [...Array.from({ length: REEL_ITEM_COUNT - 1 }, () => symbols[Math.floor(Math.random() * symbols.length)]), finalSymbol];
        setReelSymbols(prev => [...prev.slice(-REEL_ITEM_COUNT), ...newSymbols]);
        requestAnimationFrame(() => {
            const el = reelRef.current;
            if (!el || !el.firstChild) return;
            const symbolHeight = (el.firstChild as HTMLElement).clientHeight;
            const initialPos = (reelSymbols.length - REEL_ITEM_COUNT) * symbolHeight;
            el.style.transition = 'none';
            el.style.transform = `translateY(-${initialPos}px)`;
            requestAnimationFrame(() => {
                const spinDuration = 2500 + index * 600;
                const finalPos = (reelSymbols.length - 1) * symbolHeight;
                el.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                el.style.transform = `translateY(-${finalPos}px)`;
            });
        });
    }, [spinning, finalSymbol, index, reelSymbols.length]);
    useEffect(() => {
        const el = reelRef.current;
        if (!el) return;
        const handleEnd = () => { if (spinning) onSpinEnd(); };
        el.addEventListener('transitionend', handleEnd);
        return () => el.removeEventListener('transitionend', handleEnd);
    }, [onSpinEnd, spinning]);
    return (
        <div className="h-28 w-24 md:h-40 md:w-32 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl shadow-lg overflow-hidden">
            <div ref={reelRef} className={isWinner ? 'filter brightness-150' : ''}>
                {reelSymbols.map((s, i) => (
                    <div key={i} className={`flex items-center justify-center h-28 w-full md:h-40 ${isWinner && i === reelSymbols.length - 1 ? 'animate-win-pulse' : ''}`}>
                        <span className={`text-5xl md:text-7xl drop-shadow-lg ${isWinner && i === reelSymbols.length - 1 ? 'scale-110' : ''} transition-transform duration-300`}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENT: LobbyScreen ---
const LobbyScreen = ({ balance, onEnterRoom }: { balance: number; onEnterRoom: (roomId: number) => void; }) => {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen w-full bg-slate-900 bg-gradient-to-br from-indigo-900/50 to-slate-900 text-white font-sans p-4 pt-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-bold font-lilita uppercase tracking-wider text-cyan-300 drop-shadow-[0_0_10px_rgba(100,220,255,0.6)]">
                    Casino Royale
                </h1>
                <p className="text-slate-400 mt-2">Hãy chọn phòng để thử vận may của bạn!</p>
                 <div className="mt-6 bg-slate-800/50 p-3 rounded-lg inline-flex items-center gap-2">
                    <p className="text-sm text-slate-400">SỐ DƯ CỦA BẠN:</p>
                    <p className="text-xl font-bold text-green-400">{balance.toLocaleString()}</p>
                    <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms.map(room => {
                    const isAffordable = balance >= room.minBalance;
                    return (
                        <div key={room.id} className={`rounded-xl border-2 transition-all duration-300 ${isAffordable ? 'border-slate-600 hover:border-cyan-400 hover:scale-[1.03]' : 'border-slate-700'}`}>
                           <div className={`relative p-6 flex flex-col h-full rounded-xl bg-slate-900/70 backdrop-blur-sm ${!isAffordable ? 'opacity-50' : ''}`}>
                               
                                {/* --- CHANGE START --- */}
                                {/* Hàng trên cùng chứa Tên phòng và Nút Chơi */}
                                <div className="flex items-center justify-between">
                                    <span className={`inline-block bg-slate-800 ${room.color} text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                                        {room.name}
                                    </span>
                                    <button
                                        onClick={() => onEnterRoom(room.id)}
                                        disabled={!isAffordable}
                                        className="bg-cyan-600 text-white font-bold px-5 py-2 rounded-lg text-sm uppercase tracking-wider
                                                    transition-all duration-200
                                                    hover:enabled:bg-cyan-500 hover:enabled:shadow-lg hover:enabled:shadow-cyan-500/20
                                                    focus:outline-none focus:ring-4 focus:ring-cyan-500/50
                                                    disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                                    >
                                        {isAffordable ? 'Chơi' : 'Khóa'}
                                    </button>
                                </div>

                                {/* Khu vực thông tin được thiết kế lại */}
                                <div className="mt-auto pt-4 flex items-center gap-6">
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase font-semibold">Cược</div>
                                        <div className="font-bold text-white text-lg">{room.baseBet.toLocaleString()}+</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase font-semibold">Cần</div>
                                        <div className="font-bold text-white text-lg flex items-center gap-1.5">
                                            {room.minBalance.toLocaleString()}
                                            <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                {/* --- CHANGE END --- */}
                           </div>
                        </div>
                    );
                })}
            </div>
             <footer className="text-center text-slate-500 mt-12 text-sm">Tạo bởi Gemini. Chỉ mang tính chất giải trí.</footer>
        </div>
    );
};

// --- COMPONENT: GameScreen ---
const GameScreen = ({ room, balance, jackpot, onExit, onBalanceUpdate, onJackpotUpdate }: {
    room: Room;
    balance: number;
    jackpot: number;
    onExit: () => void;
    onBalanceUpdate: (newBalance: number) => void;
    onJackpotUpdate: (roomId: number, newJackpot: number) => void;
}) => {
    const [reelsResult, setReelsResult] = useState(['7️⃣', '7️⃣', '7️⃣']);
    const [spinning, setSpinning] = useState(false);
    const [bet, setBet] = useState(room.baseBet);
    const [message, setMessage] = useState(`Chào mừng đến ${room.name}!`);
    const [winnings, setWinnings] = useState(0);
    const [winningLine, setWinningLine] = useState([false, false, false]);
    const [jackpotAnimation, setJackpotAnimation] = useState(false);
    const finishedReelsCount = useRef(0);

    const handleSpin = () => {
        if (spinning || balance < bet) return;
        
        const contribution = Math.ceil(bet * 0.1);
        onJackpotUpdate(room.id, jackpot + contribution);
        onBalanceUpdate(balance - bet);

        setSpinning(true);
        setMessage('Vòng quay đang diễn ra...');
        setWinnings(0);
        setWinningLine([false, false, false]);
        finishedReelsCount.current = 0;

        setReelsResult(Math.random() < 0.01 ? ['7️⃣', '7️⃣', '7️⃣'] : Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]));
    };
    
    const checkWin = useCallback((currentReels: string[]) => {
        const [r1, r2, r3] = currentReels;
        let winAmount = 0;
        let winMessage = 'Chúc bạn may mắn lần sau!';
        let isWin = false;

        if (r1 === '7️⃣' && r2 === '7️⃣' && r3 === '7️⃣') {
            winAmount = jackpot;
            winMessage = `🎉 JACKPOT! BẠN THẮNG ${winAmount.toLocaleString()} XU! 🎉`;
            setWinningLine([true, true, true]);
            isWin = true;
            setJackpotAnimation(true);
            setTimeout(() => setJackpotAnimation(false), 3000);
            onJackpotUpdate(room.id, room.initialJackpot);
        } else if (r1 === r2 && r2 === r3) {
            const key = `${r1}${r2}${r3}` as keyof typeof room.payouts;
            winAmount = (room.payouts[key] || 0) * (bet / room.baseBet);
            if (winAmount > 0) {
                winMessage = `🎉 CHÚC MỪNG! BẠN THẮNG ${winAmount.toLocaleString()} XU! 🎉`;
                setWinningLine([true, true, true]);
                isWin = true;
            }
        } else {
            const sevens = currentReels.filter(s => s === '7️⃣').length;
            const diamonds = currentReels.filter(s => s === '💎').length;
            if (sevens === 2) { winAmount = bet * 2; winMessage = `May mắn! Thắng ${winAmount.toLocaleString()} xu!`; setWinningLine(currentReels.map(s => s === '7️⃣')); isWin = true; }
            else if (diamonds === 2) { winAmount = bet; winMessage = `Tuyệt! Thắng ${winAmount.toLocaleString()} xu!`; setWinningLine(currentReels.map(s => s === '💎')); isWin = true; }
        }

        if (isWin) { 
            onBalanceUpdate(balance - bet + winAmount); // balance ở đây là balance CŨ trước khi quay
            setWinnings(winAmount); 
        }
        setMessage(winMessage);
    }, [bet, jackpot, room, balance, onBalanceUpdate, onJackpotUpdate]);

    const handleSpinEnd = useCallback(() => {
        finishedReelsCount.current += 1;
        if (finishedReelsCount.current === reelsResult.length) {
            setSpinning(false);
            const currentBalanceAfterBet = balance - bet; // Tính balance sau khi đã trừ tiền cược
            const [r1, r2, r3] = reelsResult;
            let winAmount = 0;
            let winMessage = 'Chúc bạn may mắn lần sau!';
            let isWin = false;
    
            if (r1 === '7️⃣' && r2 === '7️⃣' && r3 === '7️⃣') {
                winAmount = jackpot;
                winMessage = `🎉 JACKPOT! BẠN THẮNG ${winAmount.toLocaleString()} XU! 🎉`;
                setWinningLine([true, true, true]);
                isWin = true;
                setJackpotAnimation(true);
                setTimeout(() => setJackpotAnimation(false), 3000);
                onJackpotUpdate(room.id, room.initialJackpot);
            } else if (r1 === r2 && r2 === r3) {
                const key = `${r1}${r2}${r3}` as keyof typeof room.payouts;
                winAmount = (room.payouts[key] || 0) * (bet / room.baseBet);
                if (winAmount > 0) {
                    winMessage = `🎉 CHÚC MỪNG! BẠN THẮNG ${winAmount.toLocaleString()} XU! 🎉`;
                    setWinningLine([true, true, true]);
                    isWin = true;
                }
            } else {
                const sevens = reelsResult.filter(s => s === '7️⃣').length;
                const diamonds = reelsResult.filter(s => s === '💎').length;
                if (sevens === 2) { winAmount = bet * 2; winMessage = `May mắn! Thắng ${winAmount.toLocaleString()} xu!`; setWinningLine(reelsResult.map(s => s === '7️⃣')); isWin = true; }
                else if (diamonds === 2) { winAmount = bet; winMessage = `Tuyệt! Thắng ${winAmount.toLocaleString()} xu!`; setWinningLine(reelsResult.map(s => s === '💎')); isWin = true; }
            }
    
            if (isWin) {
                onBalanceUpdate(currentBalanceAfterBet + winAmount);
                setWinnings(winAmount);
            }
            setMessage(winMessage);
        }
    }, [reelsResult, bet, jackpot, room, balance, onBalanceUpdate, onJackpotUpdate]);

    
    const handleBetChange = (amount: number) => {
        setBet(prev => {
            const newBet = prev + amount;
            if (newBet >= room.baseBet && newBet <= balance) return newBet;
            if (newBet > balance) return balance;
            return prev;
        });
    };
    useEffect(() => {
        if (bet > balance) setBet(balance > room.baseBet ? balance : room.baseBet);
        if (balance < room.baseBet && balance > 0) setBet(balance);
    }, [balance, bet, room.baseBet]);


    return (
        <div className={`flex flex-col items-center justify-start min-h-screen w-full bg-slate-900 bg-gradient-to-br ${room.bgGradient} text-white font-sans transition-all duration-500 pt-8`}>
            <div className="w-full max-w-2xl flex flex-col p-6 md:p-8 relative">
                 <button onClick={onExit} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2 z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Rời phòng
                 </button>
                <div className={`text-center mb-6 p-3 rounded-xl border-4 transition-all duration-500 relative ${jackpotAnimation ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg'}`}>
                    <div className="text-yellow-200 text-base font-bold mb-1 tracking-wider">JACKPOT {room.name.toUpperCase()}</div>
                    <div className={`text-4xl font-black text-white drop-shadow-lg flex items-center justify-center gap-1 ${jackpotAnimation ? 'animate-bounce' : ''}`}>
                        {jackpot.toLocaleString()}
                        <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
                    </div>
                </div>

                <div className="relative flex justify-center items-center gap-4 mb-6 p-4 bg-black/30 rounded-2xl ring-2 ring-yellow-500/30 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 rounded-2xl z-10 pointer-events-none"></div>
                    {reelsResult.map((symbol, index) => (
                        <Reel key={index} finalSymbol={symbol} spinning={spinning} onSpinEnd={handleSpinEnd} index={index} isWinner={winningLine[index]} />
                    ))}
                </div>

                <div className={`text-center h-16 flex flex-col justify-center items-center transition-all duration-300 mb-4 rounded-lg ${winnings > 0 ? 'bg-yellow-500/20' : ''}`}>
                    <p className={`text-lg md:text-xl font-semibold transition-all duration-300 ${winnings > 0 ? 'text-yellow-300 animate-pulse' : 'text-slate-200'}`}>{message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center items-center mb-6">
                    <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-sm text-slate-400">SỐ DƯ</p><p className="text-xl md:text-2xl font-bold text-green-400">{balance.toLocaleString()}</p></div>
                    <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-sm text-slate-400">MỨC CƯỢC</p><div className="flex items-center justify-center gap-4"><button onClick={() => handleBetChange(-room.betStep)} disabled={spinning || bet <= room.baseBet} className="px-2 py-0.5 bg-red-600 rounded-md disabled:opacity-50">-</button><p className="text-xl md:text-2xl font-bold text-yellow-400">{bet.toLocaleString()}</p><button onClick={() => handleBetChange(room.betStep)} disabled={spinning || balance < bet + room.betStep} className="px-2 py-0.5 bg-green-600 rounded-md disabled:opacity-50">+</button></div></div>
                </div>

                <div className="flex flex-col items-center justify-center mt-2">
                    <button onClick={handleSpin} disabled={spinning || balance < bet} className="group w-36 h-20 rounded-xl bg-slate-900/60 border-2 border-cyan-500/60 backdrop-blur-sm flex flex-col items-center justify-center p-1 transition-all duration-200 hover:enabled:border-cyan-400 hover:enabled:bg-slate-900/80 hover:enabled:scale-105 active:enabled:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-500/50 disabled:cursor-not-allowed">
                        {spinning ? (
                            <div className="flex flex-col items-center font-lilita text-slate-400">
                                <svg className="animate-spin h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span className="text-base tracking-wider uppercase">Đang quay...</span>
                            </div>
                        ) : (
                            <>
                                <span className="font-lilita text-3xl uppercase text-cyan-400 drop-shadow-[0_0_6px_rgba(100,220,255,0.7)] group-disabled:text-slate-500 group-disabled:drop-shadow-none">QUAY</span>
                                <div className="flex items-center mt-1 group-disabled:opacity-50">{balance < bet ? <span className="font-lilita text-base text-red-400/80 tracking-wide">Hết xu</span> : <div className="flex items-center"><span className="font-lilita text-lg text-sky-400">{bet.toLocaleString()}</span><CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4 ml-1.5 drop-shadow-md" /></div>}</div>
                            </>
                        )}
                    </button>
                    {balance < bet && !spinning && (<p className="text-red-400 text-sm mt-3 font-semibold">Bạn không đủ xu để quay!</p>)}
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT CHÍNH: App ---
export default function App() {
    const [balance, setBalance] = useState(50000);
    const [jackpotPools, setJackpotPools] = useState(() => {
        const pools: { [key: number]: number } = {};
        rooms.forEach(room => { pools[room.id] = room.initialJackpot; });
        return pools;
    });

    const [currentView, setCurrentView] = useState('lobby');
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    const handleEnterRoom = (roomId: number) => {
        setSelectedRoomId(roomId);
        setCurrentView('game');
    };

    const handleExitRoom = () => {
        setCurrentView('lobby');
        setSelectedRoomId(null);
    };
    
    const handleBalanceUpdate = (newBalance: number) => {
        setBalance(newBalance);
    };
    
    const handleJackpotUpdate = (roomId: number, newJackpot: number) => {
        setJackpotPools(prev => ({...prev, [roomId]: newJackpot }));
    };

    return (
        <>
            <GlobalStyles />
            {currentView === 'lobby' && (
                <LobbyScreen balance={balance} onEnterRoom={handleEnterRoom} />
            )}

            {currentView === 'game' && selectedRoomId && (
                <GameScreen
                    room={rooms.find(r => r.id === selectedRoomId) as Room}
                    balance={balance}
                    jackpot={jackpotPools[selectedRoomId]}
                    onExit={handleExitRoom}
                    onBalanceUpdate={handleBalanceUpdate}
                    onJackpotUpdate={handleJackpotUpdate}
                />
            )}
        </>
    );
}

// Component chứa các style global
const GlobalStyles = () => (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;600;700&display=swap');
      body {
        font-family: 'Inter', sans-serif;
      }
      .font-lilita { font-family: 'Lilita One', cursive; }
      @keyframes win-pulse { 0%, 100% { transform: scale(1); filter: brightness(1.5); } 50% { transform: scale(1.1); filter: brightness(1.75); } }
      .animate-win-pulse { animation: win-pulse 0.8s ease-in-out infinite; }
    `}</style>
);
