import React, { useState, useEffect, useCallback, useRef } from 'react';

// Các biểu tượng cho vòng quay
const symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎', '7️⃣'];
const REEL_ITEM_COUNT = 30; // Tăng số lượng item để cuộn trông dài hơn

// Bảng trả thưởng
const payouts = {
    '7️⃣7️⃣7️⃣': 100,
    '💎💎💎': 80,
    '⭐⭐⭐': 60,
    '🔔🔔🔔': 40,
    '🍉🍉🍉': 20,
    '🍊🍊🍊': 15,
    '🍋🍋🍋': 10,
    '🍒🍒🍒': 5,
};

// --- COMPONENT REEL ĐƯỢC NÂNG CẤP VỚI LOGIC LIỀN MẠCH ---
const Reel = ({ finalSymbol, spinning, onSpinEnd, index, isWinner }) => {
    const reelRef = useRef(null);
    const [reelSymbols, setReelSymbols] = useState([]);
    
    // Khởi tạo dải biểu tượng ban đầu
    useEffect(() => {
        const initialSymbols = Array.from({ length: REEL_ITEM_COUNT }, () => symbols[Math.floor(Math.random() * symbols.length)]);
        setReelSymbols(initialSymbols);
    }, []);

    // Hiệu ứng quay
    useEffect(() => {
        if (!spinning || !reelRef.current) return;

        // Tạo ra một dải biểu tượng mới cho vòng quay này, kết thúc bằng finalSymbol
        const newSymbols = Array.from({ length: REEL_ITEM_COUNT -1 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
        newSymbols.push(finalSymbol);
        
        // Cập nhật dải biểu tượng mới
        setReelSymbols(prevSymbols => [...prevSymbols.slice(-REEL_ITEM_COUNT), ...newSymbols]);
        
        // Delay một chút để React render dải symbols mới trước khi bắt đầu transition
        requestAnimationFrame(() => {
            const reelElement = reelRef.current;
            const symbolHeight = reelElement.firstChild.clientHeight;
            const targetPosition = (reelSymbols.length - REEL_ITEM_COUNT) * symbolHeight;
            
            // Đặt lại vị trí ban đầu mà không có animation
            reelElement.style.transition = 'none';
            reelElement.style.transform = `translateY(-${targetPosition}px)`;

            // Bắt đầu animation quay
            requestAnimationFrame(() => {
                const spinDuration = 2500 + index * 600; // ms
                reelElement.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                reelElement.style.transform = `translateY(-${(reelSymbols.length -1) * symbolHeight}px)`;
            });
        });

    }, [spinning]);

    // Lắng nghe sự kiện kết thúc transition
    useEffect(() => {
        const reelElement = reelRef.current;
        const handleTransitionEnd = () => {
            if(!spinning) onSpinEnd();
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
                        className={`flex items-center justify-center h-28 w-full md:h-40 ${isWinner && i === reelSymbols.length -1 ? 'animate-win-pulse' : ''}`}
                    >
                        <span className={`text-5xl md:text-7xl drop-shadow-lg ${isWinner && i === reelSymbols.length -1 ? 'scale-110' : ''} transition-transform duration-300`}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH CỦA ỨNG DỤNG ---
export default function App() {
    const [reelsResult, setReelsResult] = useState(['7️⃣', '7️⃣', '7️⃣']);
    const [spinning, setSpinning] = useState(false);
    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(10);
    const [message, setMessage] = useState('Chào mừng đến với Vòng Quay 777!');
    const [winnings, setWinnings] = useState(0);
    const [winningLine, setWinningLine] = useState([false, false, false]);
    const finishedReelsCount = useRef(0);

    const generateRandomReels = () => {
        return Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    };

    const handleSpin = () => {
        if (balance < bet) {
            setMessage('Không đủ số dư để cược!');
            return;
        }

        setSpinning(true);
        setBalance(prev => prev - bet);
        setMessage('Vòng quay đang diễn ra...');
        setWinnings(0);
        setWinningLine([false, false, false]);
        finishedReelsCount.current = 0;

        setReelsResult(generateRandomReels());
    };
    
    // Callback được gọi mỗi khi một Reel quay xong
    const handleSpinEnd = useCallback(() => {
        finishedReelsCount.current += 1;
        // Khi tất cả các reel đã dừng
        if (finishedReelsCount.current === reelsResult.length) {
            setSpinning(false);
            checkWin(reelsResult);
        }
    }, [reelsResult]);

    const checkWin = (currentReels) => {
        const [r1, r2, r3] = currentReels;
        let winAmount = 0;
        let winMessage = 'Chúc bạn may mắn lần sau!';
        let isWin = false;

        if (r1 === r2 && r2 === r3) {
            const key = `${r1}${r2}${r3}`;
            const payout = payouts[key] || 0;
            winAmount = payout * bet;
            if (winAmount > 0) {
                winMessage = `🎉 CHÚC MỪNG! BẠN THẮNG ${winAmount} XU! 🎉`;
                setWinningLine([true, true, true]);
                isWin = true;
            }
        } else {
            const sevens = currentReels.filter(s => s === '7️⃣').length;
            const diamonds = currentReels.filter(s => s === '💎').length;
            
            if (sevens === 2) {
                 winAmount = bet * 2;
                 winMessage = `May mắn! Thắng ${winAmount} xu!`;
                 setWinningLine(currentReels.map(s => s === '7️⃣'));
                 isWin = true;
            } else if (diamonds === 2) {
                winAmount = bet;
                winMessage = `Tuyệt! Thắng ${winAmount} xu!`;
                setWinningLine(currentReels.map(s => s === '💎'));
                isWin = true;
            }
        }

        if (isWin) {
            setBalance(prev => prev + winAmount);
            setWinnings(winAmount);
        }
        setMessage(winMessage);
    };
    
    const handleBetChange = (amount) => {
        setBet(prev => {
            const newBet = prev + amount;
            if (newBet > 0 && newBet <= balance) return newBet;
            return prev;
        });
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-900 bg-gradient-to-br from-indigo-900/50 to-slate-900 text-white font-sans">
            <div className="w-full max-w-2xl flex flex-col p-6 md:p-8">
                
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 tracking-wider" style={{ textShadow: '0 0 10px #facc15, 0 0 20px #facc15' }}>
                        LUCKY 777
                    </h1>
                    <p className="text-slate-300 mt-1">Vòng Quay May Mắn</p>
                </div>

                <div className="relative flex justify-center items-center gap-4 mb-6 p-4 bg-black/30 rounded-2xl ring-2 ring-yellow-500/30 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 rounded-2xl z-10 pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/70 shadow-lg z-20 pointer-events-none -translate-y-1/2"></div>
                    
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

                <div className={`text-center h-16 flex flex-col justify-center items-center transition-all duration-300 mb-4 rounded-lg ${winnings > 0 ? 'bg-yellow-500/20' : ''}`}>
                    <p className={`text-lg md:text-xl font-semibold transition-all duration-300 ${winnings > 0 ? 'text-yellow-300 animate-pulse' : 'text-slate-200'}`}>
                        {message}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center items-center mb-6">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-400">SỐ DƯ</p>
                        <p className="text-xl md:text-2xl font-bold text-green-400">{balance.toLocaleString()}</p>
                    </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg col-span-2 md:col-span-1">
                        <p className="text-sm text-slate-400">MỨC CƯỢC</p>
                         <div className="flex items-center justify-center gap-4">
                             <button onClick={() => handleBetChange(-10)} disabled={spinning || bet <= 10} className="px-2 py-0.5 bg-red-600 rounded-md disabled:opacity-50">-</button>
                             <p className="text-xl md:text-2xl font-bold text-yellow-400">{bet}</p>
                             <button onClick={() => handleBetChange(10)} disabled={spinning || balance < bet + 10} className="px-2 py-0.5 bg-green-600 rounded-md disabled:opacity-50">+</button>
                         </div>
                    </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-400">THẮNG</p>
                        <p className="text-xl md:text-2xl font-bold text-cyan-400">{winnings.toLocaleString()}</p>
                    </div>
                </div>

                <button
                    onClick={handleSpin}
                    disabled={spinning}
                    className="w-full py-4 text-2xl font-bold tracking-widest text-slate-900 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-xl shadow-lg
                               transform transition-all duration-150 ease-in-out 
                               hover:from-yellow-300 hover:to-amber-400 hover:shadow-xl
                               active:scale-95 active:shadow-inner
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400"
                >
                    {spinning ? 'ĐANG QUAY...' : 'QUAY'}
                </button>

                <footer className="text-center text-slate-500 mt-6 text-sm">
                    Tạo bởi Gemini. Chỉ mang tính chất giải trí.
                </footer>
            </div>
        </div>
    );
}
