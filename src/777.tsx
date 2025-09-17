import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- ICONS & CONFIGURATION ---

// SVG Icon (không thay đổi)
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Coin Icon"
        className={className}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }}
      />
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
};

const symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎', '7️⃣'];
const REEL_ITEM_COUNT = 30;

// Bảng trả thưởng cơ bản (sẽ được nhân lên theo phòng)
const basePayouts = {
    '💎💎💎': 80, '⭐⭐⭐': 60, '🔔🔔🔔': 40, '🍉🍉🍉': 20,
    '🍊🍊🍊': 15, '🍋🍋🍋': 10, '🍒🍒🍒': 5,
};

// --- CẤU HÌNH CÁC PHÒNG CHƠI ---
const rooms = [
    {
        id: 1,
        name: 'Phòng Đồng',
        minBalance: 0,
        baseBet: 10,
        betStep: 10,
        initialJackpot: 10000,
        payoutMultiplier: 1,
        color: 'bg-orange-800/60 border-orange-600',
        textColor: 'text-orange-300',
    },
    {
        id: 2,
        name: 'Phòng Bạc',
        minBalance: 5000,
        baseBet: 100,
        betStep: 50,
        initialJackpot: 100000,
        payoutMultiplier: 10,
        color: 'bg-slate-600/60 border-slate-400',
        textColor: 'text-slate-200',
    },
    {
        id: 3,
        name: 'Phòng Vàng',
        minBalance: 50000,
        baseBet: 1000,
        betStep: 500,
        initialJackpot: 1000000,
        payoutMultiplier: 100,
        color: 'bg-yellow-600/60 border-yellow-400',
        textColor: 'text-yellow-200',
    },
    {
        id: 4,
        name: 'Phòng Kim Cương',
        minBalance: 500000,
        baseBet: 10000,
        betStep: 1000,
        initialJackpot: 10000000,
        payoutMultiplier: 1000,
        color: 'bg-cyan-500/60 border-cyan-300',
        textColor: 'text-cyan-100',
    }
];

// Hàm helper để tạo bảng trả thưởng cho từng phòng
const generatePayouts = (multiplier: number) => {
    const newPayouts: { [key: string]: number } = {};
    for (const key in basePayouts) {
        newPayouts[key] = basePayouts[key as keyof typeof basePayouts] * multiplier;
    }
    return newPayouts;
};

// Thêm bảng trả thưởng vào từng object phòng
rooms.forEach(room => {
    // @ts-ignore
    room.payouts = generatePayouts(room.payoutMultiplier);
});


// --- COMPONENT REEL (Không thay đổi) ---
const Reel = ({ finalSymbol, spinning, onSpinEnd, index, isWinner }: { finalSymbol: string; spinning: boolean; onSpinEnd: () => void; index: number; isWinner: boolean; }) => {
    const reelRef = useRef<HTMLDivElement>(null);
    const [reelSymbols, setReelSymbols] = useState<string[]>([]);
    
    useEffect(() => {
        const initialSymbols = Array.from({ length: REEL_ITEM_COUNT }, () => symbols[Math.floor(Math.random() * symbols.length)]);
        setReelSymbols(initialSymbols);
    }, []);

    useEffect(() => {
        if (!spinning || !reelRef.current) return;

        const newSymbols = Array.from({ length: REEL_ITEM_COUNT -1 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
        newSymbols.push(finalSymbol);
        
        setReelSymbols(prevSymbols => [...prevSymbols.slice(-REEL_ITEM_COUNT), ...newSymbols]);
        
        requestAnimationFrame(() => {
            const reelElement = reelRef.current;
            if (!reelElement || !reelElement.firstChild) return;
            
            const symbolHeight = (reelElement.firstChild as HTMLElement).clientHeight;
            const targetPosition = (reelSymbols.length - REEL_ITEM_COUNT) * symbolHeight;
            
            reelElement.style.transition = 'none';
            reelElement.style.transform = `translateY(-${targetPosition}px)`;

            requestAnimationFrame(() => {
                const spinDuration = 2500 + index * 600; // ms
                reelElement.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                reelElement.style.transform = `translateY(-${(reelSymbols.length -1) * symbolHeight}px)`;
            });
        });

    }, [spinning, finalSymbol, index, reelSymbols.length]);

    useEffect(() => {
        const reelElement = reelRef.current;
        if (!reelElement) return;
        const handleTransitionEnd = () => {
            if (spinning) {
                onSpinEnd();
            }
        };
        
        reelElement.addEventListener('transitionend', handleTransitionEnd);
        return () => reelElement.removeEventListener('transitionend', handleTransitionEnd);
    }, [onSpinEnd, spinning]);

    return (
        <div className="h-28 w-24 md:h-40 md:w-32 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl shadow-lg overflow-hidden">
            <div ref={reelRef} className={isWinner ? 'filter brightness-150' : ''}>
                {reelSymbols.map((s, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center justify-center h-28 w-full md:h-40 ${isWinner && i === reelSymbols.length - 1 ? 'animate-win-pulse' : ''}`}
                    >
                        <span className={`text-5xl md:text-7xl drop-shadow-lg ${isWinner && i === reelSymbols.length - 1 ? 'scale-110' : ''} transition-transform duration-300`}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH CỦA ỨNG DỤNG ---
export default function App() {
    const [balance, setBalance] = useState(10000); // Tăng số dư ban đầu để test
    
    // State mới để quản lý phòng
    const [currentRoomId, setCurrentRoomId] = useState(rooms[0].id);
    const [jackpotPools, setJackpotPools] = useState(() => {
        const pools: { [key: number]: number } = {};
        rooms.forEach(room => { pools[room.id] = room.initialJackpot; });
        return pools;
    });

    // Lấy thông tin phòng hiện tại
    const currentRoom = rooms.find(r => r.id === currentRoomId)!;
    const currentJackpot = jackpotPools[currentRoomId];
    const currentPayouts = currentRoom.payouts as typeof basePayouts;

    const [reelsResult, setReelsResult] = useState(['7️⃣', '7️⃣', '7️⃣']);
    const [spinning, setSpinning] = useState(false);
    const [bet, setBet] = useState(currentRoom.baseBet);
    const [message, setMessage] = useState('Chào mừng! Hãy chọn phòng để bắt đầu.');
    const [winnings, setWinnings] = useState(0);
    const [winningLine, setWinningLine] = useState([false, false, false]);
    const [jackpotAnimation, setJackpotAnimation] = useState(false);
    const finishedReelsCount = useRef(0);
    
    // Cập nhật mức cược khi đổi phòng
    useEffect(() => {
        const room = rooms.find(r => r.id === currentRoomId)!;
        setBet(room.baseBet);
        setMessage(`Chào mừng đến ${room.name}!`);
    }, [currentRoomId]);

    const generateRandomReels = () => {
        // Giảm tỉ lệ jackpot cho thực tế hơn
        if (Math.random() < 0.01) { 
            return ['7️⃣', '7️⃣', '7️⃣'];
        }
        return Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    };

    const handleSpin = () => {
        if (spinning || balance < bet) {
            return;
        }
        
        const contribution = Math.ceil(bet * 0.1);
        setJackpotPools(prev => ({...prev, [currentRoomId]: prev[currentRoomId] + contribution }));

        setSpinning(true);
        setBalance(prev => prev - bet);
        setMessage('Vòng quay đang diễn ra...');
        setWinnings(0);
        setWinningLine([false, false, false]);
        finishedReelsCount.current = 0;

        setReelsResult(generateRandomReels());
    };
    
    const checkWin = useCallback((currentReels: string[]) => {
        const [r1, r2, r3] = currentReels;
        let winAmount = 0;
        let winMessage = 'Chúc bạn may mắn lần sau!';
        let isWin = false;

        if (r1 === '7️⃣' && r2 === '7️⃣' && r3 === '7️⃣') {
            winAmount = currentJackpot;
            winMessage = `🎉 JACKPOT! BẠN THẮNG TOÀN BỘ ${winAmount.toLocaleString()} XU! 🎉`;
            setWinningLine([true, true, true]);
            isWin = true;
            setJackpotAnimation(true);
            setTimeout(() => setJackpotAnimation(false), 3000);
            // Reset jackpot của phòng hiện tại
            setJackpotPools(prev => ({...prev, [currentRoomId]: currentRoom.initialJackpot }));
        } else if (r1 === r2 && r2 === r3) {
            const key = `${r1}${r2}${r3}` as keyof typeof currentPayouts;
            const payout = currentPayouts[key] || 0;
            winAmount = payout * (bet / currentRoom.baseBet); // Thắng dựa trên bội số cược
            if (winAmount > 0) {
                winMessage = `🎉 CHÚC MỪNG! BẠN THẮNG ${winAmount.toLocaleString()} XU! 🎉`;
                setWinningLine([true, true, true]);
                isWin = true;
            }
        } else {
            // Logic thưởng phụ có thể điều chỉnh theo phòng nếu muốn
            const sevens = currentReels.filter(s => s === '7️⃣').length;
            const diamonds = currentReels.filter(s => s === '💎').length;
            
            if (sevens === 2) {
                 winAmount = bet * 2;
                 winMessage = `May mắn! Thắng ${winAmount.toLocaleString()} xu!`;
                 setWinningLine(currentReels.map(s => s === '7️⃣'));
                 isWin = true;
            } else if (diamonds === 2) {
                winAmount = bet;
                winMessage = `Tuyệt! Thắng ${winAmount.toLocaleString()} xu!`;
                setWinningLine(currentReels.map(s => s === '💎'));
                isWin = true;
            }
        }

        if (isWin) {
            setBalance(prev => prev + winAmount);
            setWinnings(winAmount);
        }
        setMessage(winMessage);
    }, [bet, currentJackpot, currentRoomId, currentRoom.initialJackpot, currentRoom.baseBet, currentPayouts]);

    const handleSpinEnd = useCallback(() => {
        finishedReelsCount.current += 1;
        if (finishedReelsCount.current === reelsResult.length) {
            setSpinning(false);
            checkWin(reelsResult);
        }
    }, [reelsResult, checkWin]);
    
    const handleBetChange = (amount: number) => {
        setBet(prev => {
            const newBet = prev + amount;
            if (newBet >= currentRoom.baseBet && newBet <= balance) return newBet;
            if (newBet > balance) return balance; // prevent bet from exceeding balance
            return prev;
        });
    }

    const handleRoomChange = (roomId: number) => {
        if(spinning) return;
        setCurrentRoomId(roomId);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-900 bg-gradient-to-br from-indigo-900/50 to-slate-900 text-white font-sans">
            <div className="w-full max-w-3xl flex flex-col p-4 md:p-6">
                
                {/* --- ROOM SELECTOR --- */}
                <div className="mb-6">
                    <h2 className="text-center text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">Chọn Phòng Chơi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {rooms.map(room => {
                            const isAffordable = balance >= room.minBalance;
                            const isActive = room.id === currentRoomId;
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => handleRoomChange(room.id)}
                                    disabled={!isAffordable || spinning}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200
                                        ${isActive ? `${room.color} ring-4 ring-offset-2 ring-offset-slate-900 ring-white/80 scale-105` : 'bg-slate-800/70 border-slate-700'}
                                        ${isAffordable ? 'hover:border-slate-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    <p className={`font-bold text-lg ${isActive ? room.textColor : 'text-slate-300'}`}>{room.name}</p>
                                    <p className="text-xs text-slate-400">Cược: {room.baseBet.toLocaleString()}+</p>
                                    {!isAffordable && <p className="text-xs text-red-400 mt-1">Cần {room.minBalance.toLocaleString()}</p>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- JACKPOT DISPLAY --- */}
                <div className="text-center mb-6">
                    <div className={`mt-2 p-3 rounded-xl border-4 transition-all duration-500 relative ${ jackpotAnimation ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg' }`}>
                      <div className="text-yellow-200 text-base font-bold mb-1 tracking-wider"> JACKPOT {currentRoom.name.toUpperCase()} </div>
                      <div className={`text-4xl font-black text-white drop-shadow-lg flex items-center justify-center gap-1 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                        {currentJackpot.toLocaleString()}
                        <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
                      </div>
                      <div className="text-yellow-200 text-xs mt-2 opacity-90"> Quay trúng 777 để thắng toàn bộ! </div>
                      {jackpotAnimation && ( <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div> )}
                    </div>
                </div>

                {/* --- REELS --- */}
                <div className="relative flex justify-center items-center gap-4 mb-6 p-4 bg-black/30 rounded-2xl ring-2 ring-yellow-500/30 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 rounded-2xl z-10 pointer-events-none"></div>
                    {reelsResult.map((symbol, index) => (
                        <Reel 
                            key={index} 
                            finalSymbol={symbol} 
                            spinning={spinning}
                            onSpinEnd={handleSpinEnd}
                            index={index}
                            isWinner={winningLine[index]}
                        />
                    ))}
                </div>

                {/* --- MESSAGE & CONTROLS --- */}
                <div className={`text-center h-16 flex flex-col justify-center items-center transition-all duration-300 mb-4 rounded-lg ${winnings > 0 ? 'bg-yellow-500/20' : ''}`}>
                    <p className={`text-lg md:text-xl font-semibold transition-all duration-300 ${winnings > 0 ? 'text-yellow-300 animate-pulse' : 'text-slate-200'}`}>
                        {message}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center items-center mb-6">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-400">SỐ DƯ</p>
                        <p className="text-xl md:text-2xl font-bold text-green-400">{balance.toLocaleString()}</p>
                    </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-400">MỨC CƯỢC</p>
                         <div className="flex items-center justify-center gap-4">
                             <button onClick={() => handleBetChange(-currentRoom.betStep)} disabled={spinning || bet <= currentRoom.baseBet} className="px-2 py-0.5 bg-red-600 rounded-md disabled:opacity-50">-</button>
                             <p className="text-xl md:text-2xl font-bold text-yellow-400">{bet}</p>
                             <button onClick={() => handleBetChange(currentRoom.betStep)} disabled={spinning || balance < bet + currentRoom.betStep} className="px-2 py-0.5 bg-green-600 rounded-md disabled:opacity-50">+</button>
                         </div>
                    </div>
                </div>

                {/* --- SPIN BUTTON --- */}
                <div className="flex flex-col items-center justify-center mt-2">
                  <button
                    onClick={handleSpin}
                    disabled={spinning || balance < bet}
                    className="group w-36 h-20 rounded-xl bg-slate-900/60 border-2 border-cyan-500/60 backdrop-blur-sm flex flex-col items-center justify-center p-1 transition-all duration-200 hover:enabled:border-cyan-400 hover:enabled:bg-slate-900/80 hover:enabled:scale-105 active:enabled:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-500/50 disabled:cursor-not-allowed"
                  >
                    {spinning ? (
                      <div className="flex flex-col items-center font-lilita text-slate-400">
                        <svg className="animate-spin h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                        <span className="text-base tracking-wider uppercase">Đang quay...</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-lilita text-3xl uppercase text-cyan-400 drop-shadow-[0_0_6px_rgba(100,220,255,0.7)] group-disabled:text-slate-500 group-disabled:drop-shadow-none">QUAY</span>
                        <div className="flex items-center mt-1 group-disabled:opacity-50">
                          {balance < bet ? (
                            <span className="font-lilita text-base text-red-400/80 tracking-wide">Hết xu</span>
                          ) : (
                            <div className="flex items-center">
                              <span className="font-lilita text-lg text-sky-400">{bet}</span>
                              <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4 ml-1.5 drop-shadow-md" />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                  {balance < bet && !spinning && (<p className="text-red-400 text-sm mt-3 font-semibold">Bạn không đủ xu để quay!</p>)}
                </div>


                <footer className="text-center text-slate-500 mt-8 text-sm">
                    Tạo bởi Gemini. Chỉ mang tính chất giải trí.
                </footer>
            </div>
            
            <style jsx global>{`
              @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
              .font-lilita { font-family: 'Lilita One', cursive; }
              @keyframes win-pulse { 0%, 100% { transform: scale(1); filter: brightness(1.5); } 50% { transform: scale(1.1); filter: brightness(1.75); } }
              .animate-win-pulse { animation: win-pulse 0.8s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
