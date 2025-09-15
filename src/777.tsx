import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Các biểu tượng cho vòng quay, sử dụng emoji cho đơn giản và đẹp mắt
const symbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎', '7️⃣'];

// Bảng trả thưởng (kèo)
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

// --- COMPONENT REEL ĐƯỢC NÂNG CẤP ---
const Reel = ({ finalSymbol, spinning, index }) => {
    const reelRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    
    // Tạo một dải biểu tượng dài để cuộn, có chứa biểu tượng cuối cùng ở gần cuối
    const reelStrip = useMemo(() => {
        const strip = [...symbols].sort(() => Math.random() - 0.5); // Xáo trộn
        // Lặp lại dải để đủ dài cho hiệu ứng cuộn
        return [...strip, ...strip, ...strip, finalSymbol];
    }, [finalSymbol]);

    useEffect(() => {
        if (spinning) {
            // Khi bắt đầu quay: Reset về vị trí đầu tiên ngay lập tức
            setStyle({
                transition: 'none',
                transform: 'translateY(0)',
            });

            // Sau một khoảng delay nhỏ để DOM cập nhật, bắt đầu animation cuộn
            setTimeout(() => {
                const reelHeight = reelRef.current?.offsetHeight || 0;
                const symbolHeight = reelHeight / reelStrip.length;
                const targetPosition = (reelStrip.length - 1) * symbolHeight;
                
                setStyle({
                    // Thời gian quay + hiệu ứng dừng lệch pha cho mỗi cột
                    transition: `transform ${2 + index * 0.4}s cubic-bezier(0.25, 0.1, 0.25, 1)`,
                    transform: `translateY(-${targetPosition}px)`,
                });
            }, 50);

        } else {
            // Khi dừng quay (lúc tải trang lần đầu)
            // Đặt nó vào vị trí cuối cùng mà không có animation
             setTimeout(() => {
                const reelHeight = reelRef.current?.offsetHeight || 0;
                const symbolHeight = reelHeight / reelStrip.length;
                const targetPosition = (reelStrip.length - 1) * symbolHeight;
                setStyle({
                    transition: 'none',
                    transform: `translateY(-${targetPosition}px)`,
                });
             }, 100);
        }
    }, [spinning, finalSymbol, index, reelStrip]);

    return (
        // Container ngoài cùng để che đi các biểu tượng thừa
        <div className="flex items-center justify-center h-28 w-24 md:h-40 md:w-32 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl shadow-lg overflow-hidden">
            {/* Dải các biểu tượng sẽ di chuyển bên trong */}
            <div ref={reelRef} style={style} className="w-full">
                {reelStrip.map((symbol, i) => (
                    <div key={i} className="flex items-center justify-center h-28 md:h-40">
                         <span className="text-5xl md:text-7xl drop-shadow-lg">{symbol}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENT APP CHÍNH ĐÃ ĐƯỢC CẬP NHẬT ---
export default function App() {
    const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
    const [spinning, setSpinning] = useState(false);
    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(10);
    const [message, setMessage] = useState('Chào mừng đến với Vòng Quay 777!');
    const [winnings, setWinnings] = useState(0);

    // Hàm kiểm tra thắng thua (không thay đổi)
    const checkWin = useCallback((currentReels) => {
        const [r1, r2, r3] = currentReels;

        if (r1 === r2 && r2 === r3) {
            const key = `${r1}${r2}${r3}`;
            const payout = payouts[key] || 0;
            const winAmount = payout * bet;
            if (winAmount > 0) {
                setBalance(prev => prev + winAmount);
                setMessage(`🎉 CHÚC MỪNG! BẠN THẮNG ${winAmount} XU! 🎉`);
                setWinnings(winAmount);
            }
        } else {
            const sevens = currentReels.filter(s => s === '7️⃣').length;
            const diamonds = currentReels.filter(s => s === '💎').length;
            
            if (sevens === 2) {
                 const winAmount = bet * 2;
                 setBalance(prev => prev + winAmount);
                 setMessage(`May mắn! Thắng ${winAmount} xu!`);
                 setWinnings(winAmount);
            } else if (diamonds === 2) {
                const winAmount = bet;
                setBalance(prev => prev + winAmount);
                setMessage(`Tuyệt! Thắng ${winAmount} xu!`);
                setWinnings(winAmount);
            } else {
                setMessage('Chúc bạn may mắn lần sau!');
            }
        }
    }, [bet]);

    // --- LOGIC QUAY ĐÃ ĐƯỢC THAY ĐỔI ---
    const handleSpin = () => {
        if (balance < bet) {
            setMessage('Không đủ số dư để cược!');
            return;
        }

        setSpinning(true);
        setBalance(prev => prev - bet);
        setMessage('Vòng quay đang diễn ra...');
        setWinnings(0);

        // Tạo kết quả ngẫu nhiên mới cho vòng quay
        const newReels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
        ];
        
        // Cập nhật state của reels để component Reel nhận được biểu tượng cuối cùng
        setReels(newReels);

        // Đặt thời gian chờ cho animation kết thúc
        // Thời gian này phải đủ dài để cột cuối cùng dừng lại (2s + 2*0.4s = 2.8s)
        setTimeout(() => {
            setSpinning(false);
            checkWin(newReels);
        }, 3000); // 3 giây
    };
    
    // Hàm tăng/giảm mức cược
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
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-white font-sans">
            <div className="w-full max-w-2xl flex flex-col p-6 md:p-8">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 tracking-wider" style={{ textShadow: '0 0 10px #facc15, 0 0 20px #facc15' }}>
                        LUCKY 777
                    </h1>
                    <p className="text-slate-300 mt-1">Vòng Quay May Mắn</p>
                </div>

                {/* Reels */}
                <div className="relative flex justify-center items-center gap-4 mb-6 p-4 bg-black/30 rounded-2xl ring-2 ring-yellow-500/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl z-10"></div>
                     {reels.map((symbol, index) => (
                        <Reel key={index} finalSymbol={symbol} spinning={spinning} index={index} />
                    ))}
                </div>

                {/* Message and Winnings Display */}
                <div className={`text-center h-16 flex flex-col justify-center items-center transition-all duration-300 mb-4 rounded-lg ${winnings > 0 ? 'bg-yellow-500/20' : ''}`}>
                    <p className={`text-lg md:text-xl font-semibold transition-all duration-300 ${winnings > 0 ? 'text-yellow-300 animate-pulse' : 'text-slate-200'}`}>
                        {message}
                    </p>
                </div>
                
                {/* Controls and Info */}
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

                {/* Spin Button */}
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
