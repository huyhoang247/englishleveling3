import React, { useState, useEffect, useCallback, useRef } from 'react';

// Các biểu tượng cho vòng quay, lặp lại để tạo hiệu ứng cuộn vô tận
const symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎', '7️⃣'];

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

// --- COMPONENT REEL ĐƯỢC THIẾT KẾ LẠI HOÀN TOÀN ---
const Reel = ({ finalSymbol, spinning, index, isWinner }) => {
    const reelRef = useRef(null);
    // Tạo một dải biểu tượng dài để cuộn
    const reelSymbols = useRef([...symbols, ...symbols, ...symbols]).current;

    useEffect(() => {
        if (spinning) {
            // Khi bắt đầu quay, reset về vị trí ngẫu nhiên và bắt đầu animation
            const reelElement = reelRef.current;
            reelElement.style.transition = 'none';
            reelElement.style.transform = `translateY(-${Math.floor(Math.random() * 10) * 100}px)`;

            // Dùng timeout nhỏ để trình duyệt áp dụng thay đổi trên trước khi bắt đầu transition
            setTimeout(() => {
                const targetIndex = reelSymbols.findIndex((s, i) => i > symbols.length && s === finalSymbol);
                const symbolHeight = reelElement.firstChild.clientHeight;
                const targetPosition = targetIndex * symbolHeight;
                
                // Mỗi reel sẽ quay lâu hơn reel trước đó để tạo hiệu ứng dừng lần lượt
                const spinDuration = 2000 + index * 500; //ms
                
                reelElement.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                reelElement.style.transform = `translateY(-${targetPosition}px)`;
            }, 50);
        }
    }, [spinning, finalSymbol, index, reelSymbols]);
    
    return (
        <div className="h-28 w-24 md:h-40 md:w-32 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl shadow-lg overflow-hidden">
            <div ref={reelRef} className={`transition-transform duration-1000 ease-out ${isWinner ? 'filter brightness-150' : ''}`}>
                {reelSymbols.map((s, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center justify-center h-28 w-full md:h-40 ${isWinner ? 'animate-win-pulse' : ''}`}
                    >
                        <span className={`text-5xl md:text-7xl drop-shadow-lg ${isWinner ? 'scale-110' : ''} transition-transform duration-300`}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH CỦA ỨNG DỤNG ---
export default function App() {
    const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
    const [spinning, setSpinning] = useState(false);
    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(10);
    const [message, setMessage] = useState('Chào mừng đến với Vòng Quay 777!');
    const [winnings, setWinnings] = useState(0);
    const [winningLine, setWinningLine] = useState([false, false, false]);

    // Hàm tạo kết quả ngẫu nhiên cho vòng quay
    const generateRandomReels = () => {
        return [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
        ];
    };

    // Hàm xử lý khi nhấn nút quay
    const handleSpin = () => {
        if (balance < bet) {
            setMessage('Không đủ số dư để cược!');
            return;
        }

        setSpinning(true);
        setBalance(prev => prev - bet);
        setMessage('Vòng quay đang diễn ra...');
        setWinnings(0);
        setWinningLine([false, false, false]); // Reset hiệu ứng thắng

        const newReels = generateRandomReels();
        
        // Cập nhật kết quả cuối cùng vào state để các Reel biết phải dừng ở đâu
        setReels(newReels);

        // Đặt thời gian chờ bằng với thời gian reel cuối cùng dừng lại + một chút
        const totalSpinTime = 2000 + (reels.length - 1) * 500 + 500;
        
        setTimeout(() => {
            setSpinning(false);
            checkWin(newReels);
        }, totalSpinTime);
    };

    // Hàm kiểm tra thắng thua
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
                 const winningIndexes = currentReels.map(s => s === '7️⃣');
                 setWinningLine(winningIndexes);
                 isWin = true;
            } else if (diamonds === 2) {
                winAmount = bet;
                winMessage = `Tuyệt! Thắng ${winAmount} xu!`;
                const winningIndexes = currentReels.map(s => s === '💎');
                setWinningLine(winningIndexes);
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
            if (newBet > 0 && newBet <= balance) {
                return newBet;
            }
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

                {/* --- VÙNG HIỂN THỊ REELS ĐƯỢC CẬP NHẬT --- */}
                <div className="relative flex justify-center items-center gap-4 mb-6 p-4 bg-black/30 rounded-2xl ring-2 ring-yellow-500/30 shadow-2xl">
                    {/* Lớp phủ tạo hiệu ứng chiều sâu */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 rounded-2xl z-10 pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/70 shadow-lg z-20 pointer-events-none -translate-y-1/2"></div>
                    
                    {reels.map((symbol, index) => (
                        <Reel 
                            key={index} 
                            finalSymbol={symbol} 
                            spinning={spinning} 
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
                    disabled={spinning || balance < bet}
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
