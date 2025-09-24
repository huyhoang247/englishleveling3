// --- START OF FILE 777.tsx (16).txt ---

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import ReactDOM from 'react-dom'; 
import { useGame } from './GameContext.tsx';
import { auth } from './firebase.js';
import { updateUserCoins, listenToJackpotPools, contributeToJackpot, resetJackpot } from './gameDataService.ts';

import HomeButton from './ui/home-button.tsx';
import CoinDisplay from './ui/display/coin-display.tsx';
import MasteryDisplay from './ui/display/mastery-display.tsx';
import { useAnimateValue } from './ui/useAnimateValue.ts';
import SlotLobbySkeleton from './777-loading.tsx'; 

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

const MasteryIcon = ({ className }: { className?: string }) => (
    <img 
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/assets/images/mastery-icon.webp" 
        alt="Mastery Icon" 
        className={className} 
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
    />
);

// --- NEW SYMBOL CONFIGURATION ---
const SYMBOLS = {
  SEVEN: { id: 'seven', src: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/777-slot/seven.webp', type: 'jackpot' },
  APPLE: { id: 'apple', src: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/777-slot/apple.webp', type: 'basic' },
  CHERRY: { id: 'cherry', src: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/777-slot/cherry.webp', type: 'basic' },
  ORANGE: { id: 'orange', src: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/777-slot/orange.webp', type: 'basic' },
  CROWN: { id: 'crown', src: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/777-slot/crown.webp', type: 'medium' },
  BELL: { id: 'bell', src: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/777-slot/bell.webp', type: 'medium' },
};

const ALL_SYMBOLS = Object.values(SYMBOLS);
const REEL_ITEM_COUNT = 30;

const rooms = [
    { id: 1, name: 'Floor 1', minMastery: 10, baseBet: 10, maxBet: 100, betStep: 10, initialJackpot: 10000 },
    { id: 2, name: 'Floor 2', minMastery: 50, baseBet: 50, maxBet: 500, betStep: 50, initialJackpot: 50000 },
    { id: 3, name: 'Floor 3', minMastery: 100, baseBet: 100, maxBet: 1000, betStep: 100, initialJackpot: 100000 },
    { id: 4, name: 'Floor 4', minMastery: 500, baseBet: 500, maxBet: 5000, betStep: 500, initialJackpot: 500000 },
    { id: 5, name: 'Floor 5', minMastery: 1000, baseBet: 1000, maxBet: 10000, betStep: 1000, initialJackpot: 1000000 },
    { id: 6, name: 'Floor 6', minMastery: 5000, baseBet: 5000, maxBet: 50000, betStep: 5000, initialJackpot: 5000000 },
    { id: 7, name: 'Floor 7', minMastery: 10000, baseBet: 10000, maxBet: 100000, betStep: 10000, initialJackpot: 10000000 }
];

// Payouts are now dynamic and not tied to rooms, so we can define the base type here.
type Room = typeof rooms[0];

const JackpotTag = ({ jackpot }: { jackpot: number; }) => (
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-yellow-600/50 rounded-full pl-2 pr-3 py-1 text-yellow-300 shadow-lg shadow-black/30">
        <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/jackpot-icon.webp" 
            alt="Jackpot" 
            className="w-5 h-5" 
        />
        <span className="text-sm font-bold tracking-wider">
            {jackpot.toLocaleString()}
        </span>
    </div>
);

const RoomInfoPanel = ({ room }: { room: Room }) => (
    <div className="mt-auto pt-4">
        <div className="bg-black/30 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center justify-around">
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Cược</span>
                    <div className="font-bold text-white text-lg flex items-center gap-1.5 mt-1">
                        {room.baseBet.toLocaleString()} - {room.maxBet.toLocaleString()}
                        <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-4 h-4" />
                    </div>
                </div>
                <div className="w-px h-10 bg-slate-700/80"></div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Yêu Cầu</span>
                    <div className="font-bold text-white text-lg flex items-center gap-1.5 mt-1">
                        {room.minMastery.toLocaleString()}
                        <MasteryIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- COMPONENT `Reel` PHIÊN BẢN ĐÃ SỬA LỖI ANIMATION VÀ DÙNG ICON ---
const Reel = ({ finalSymbol, spinning, onSpinEnd, index, isWinner }: { finalSymbol: string; spinning: boolean; onSpinEnd: () => void; index: number; isWinner: boolean; }) => {
    const reelRef = useRef<HTMLDivElement>(null);
    const [reelSymbols, setReelSymbols] = useState<string[]>(() => 
        Array.from({ length: REEL_ITEM_COUNT }, () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)].src)
    );

    useEffect(() => {
        if (!spinning) return;

        const el = reelRef.current;
        if (!el || !el.firstChild) return;
        
        const spinList = [
            ...Array.from({ length: REEL_ITEM_COUNT * 2 - 1 }, () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)].src),
            finalSymbol
        ];

        setReelSymbols(prev => [...prev.slice(-REEL_ITEM_COUNT), ...spinList]);

        requestAnimationFrame(() => {
            const el = reelRef.current;
            if (!el || !el.firstChild) return;

            const symbolHeight = (el.firstChild as HTMLElement).clientHeight;

            el.style.transition = 'none';
            el.style.transform = 'translateY(0)';
            
            requestAnimationFrame(() => {
                const spinDuration = 2500 + index * 600;
                const finalPosition = (REEL_ITEM_COUNT * 3 - 1) * symbolHeight;
                
                el.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                el.style.transform = `translateY(-${finalPosition}px)`;
            });
        });

    }, [spinning, finalSymbol, index]);

    useEffect(() => {
        const el = reelRef.current;
        if (!el) return;
        const handleEnd = () => {
            if (spinning) {
                onSpinEnd();
            }
        };
        el.addEventListener('transitionend', handleEnd);
        return () => el.removeEventListener('transitionend', handleEnd);
    }, [onSpinEnd, spinning]);

    return (
        <div className="h-28 w-24 md:h-40 md:w-32 bg-slate-800/80 border-2 border-slate-600 rounded-xl shadow-lg overflow-hidden">
            <div ref={reelRef} className={`will-change-transform ${isWinner ? 'filter brightness-150' : ''}`}>
                {reelSymbols.map((s, i) => (
                    <div key={i} className={`flex items-center justify-center h-28 w-full md:h-40 p-2 ${isWinner && i === reelSymbols.length - 1 ? 'animate-win-pulse' : ''}`}>
                        <img 
                            src={s} 
                            alt="slot icon" 
                            className={`h-20 w-20 md:h-28 md:w-28 object-contain drop-shadow-lg will-change-transform ${isWinner && i === reelSymbols.length - 1 ? 'scale-110' : ''} transition-transform duration-300`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const RoomCard = memo(({ room, jackpot, isAffordable, onEnterRoom }: {
    room: Room;
    jackpot: number;
    isAffordable: boolean;
    onEnterRoom: (id: number) => void;
}) => {
    return (
        <div
            className={`rounded-xl border-2 transition-all duration-300 will-change-transform ${isAffordable ? 'border-slate-600 hover:border-cyan-400 hover:scale-[1.03] cursor-pointer' : 'border-slate-700 cursor-not-allowed'}`}
            onClick={() => isAffordable && onEnterRoom(room.id)}
        >
            <div className={`relative p-4 flex flex-col h-full rounded-xl bg-slate-900/80 ${!isAffordable ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                    <span className="bg-slate-800 text-slate-300 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">{room.name}</span>
                    <JackpotTag jackpot={jackpot} />
                </div>
                <RoomInfoPanel room={room} />
            </div>
        </div>
    );
});


const LobbyScreen = ({ balance, onEnterRoom, onClose, jackpotPools, masteryCount }: { balance: number; onEnterRoom: (roomId: number) => void; onClose: () => void; jackpotPools: { [key: number]: number; }; masteryCount: number; }) => {
    const animatedBalance = useAnimateValue(balance, 500);
    return (
        <div className="flex flex-col h-full w-full bg-slate-900 bg-gradient-to-br from-indigo-900/50 to-slate-900 text-white font-sans overflow-hidden">
            <div className="flex items-center justify-between h-[53px] px-4 border-b border-slate-700/50 shrink-0 bg-slate-950 z-10">
                <HomeButton onClick={onClose} label="" title="Thoát trò chơi" />
                <div className="flex items-center gap-2">
                    <MasteryDisplay masteryCount={masteryCount} />
                    <CoinDisplay displayedCoins={animatedBalance} isStatsFullscreen={false} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-8 hide-scrollbar">
                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {rooms.map(room => (
                        <RoomCard
                            key={room.id}
                            room={room as Room}
                            jackpot={jackpotPools[room.id]}
                            isAffordable={masteryCount >= room.minMastery}
                            onEnterRoom={onEnterRoom}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const GameScreen = ({ room, balance, jackpot, onExit, onGameEnd, setCoins, masteryCount }: {
    room: Room;
    balance: number;
    jackpot: number;
    onExit: () => void;
    onGameEnd: (netDelta: number, bet: number, isJackpotWin?: boolean) => void;
    setCoins: React.Dispatch<React.SetStateAction<number>>;
    masteryCount: number;
}) => {
    const [reelsResult, setReelsResult] = useState([SYMBOLS.SEVEN.src, SYMBOLS.SEVEN.src, SYMBOLS.SEVEN.src]);
    const [spinning, setSpinning] = useState(false);
    const [bet, setBet] = useState(room.baseBet);
    const [message, setMessage] = useState(`Chào mừng đến ${room.name}!`);
    const [winnings, setWinnings] = useState(0);
    const [winningLine, setWinningLine] = useState([false, false, false]);
    const [jackpotAnimation, setJackpotAnimation] = useState(false);
    const finishedReelsCount = useRef(0);
    const animatedBalance = useAnimateValue(balance, 500);

    const generateSpinResult = () => {
        const roll = Math.random() * 100;
        const basicSymbols = ALL_SYMBOLS.filter(s => s.type === 'basic');
        const mediumSymbols = ALL_SYMBOLS.filter(s => s.type === 'medium');
        const allButSeven = [...basicSymbols, ...mediumSymbols];
    
        const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);
    
        // 0.5% for Jackpot (3 sevens)
        if (roll < 0.5) return [SYMBOLS.SEVEN, SYMBOLS.SEVEN, SYMBOLS.SEVEN];
        // 10% for 2 Sevens (Free Spins)
        if (roll < 10.5) {
            const nonSeven = allButSeven[Math.floor(Math.random() * allButSeven.length)];
            return shuffle([SYMBOLS.SEVEN, SYMBOLS.SEVEN, nonSeven]);
        }
        // 3% for 3 Medium
        if (roll < 13.5) {
            const symbol = mediumSymbols[Math.floor(Math.random() * mediumSymbols.length)];
            return [symbol, symbol, symbol];
        }
        // 6% for 2 Medium
        if (roll < 19.5) {
            const symbol = mediumSymbols[Math.floor(Math.random() * mediumSymbols.length)];
            const otherSymbols = ALL_SYMBOLS.filter(s => s.id !== symbol.id);
            const nonMatch = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
            return shuffle([symbol, symbol, nonMatch]);
        }
        // 15% for 3 Basic
        if (roll < 34.5) {
            const symbol = basicSymbols[Math.floor(Math.random() * basicSymbols.length)];
            return [symbol, symbol, symbol];
        }
        // 30% for 2 Basic
        if (roll < 64.5) {
            const symbol = basicSymbols[Math.floor(Math.random() * basicSymbols.length)];
            const otherSymbols = ALL_SYMBOLS.filter(s => s.id !== symbol.id && s.type !== 'jackpot');
            const nonMatch = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
            return shuffle([symbol, symbol, nonMatch]);
        }
    
        // 35.5% for Loss: Generate a non-winning combination
        let s1, s2, s3;
        const lossPool = allButSeven;
        s1 = lossPool[Math.floor(Math.random() * lossPool.length)];
        do { s2 = lossPool[Math.floor(Math.random() * lossPool.length)]; } while (s2.id === s1.id);
        do { s3 = lossPool[Math.floor(Math.random() * lossPool.length)]; } while (s3.id === s1.id || s3.id === s2.id);
        return [s1, s2, s3];
    };

    const handleSpin = () => {
        if (spinning || balance < bet) return;
        setCoins(prev => prev - bet);
        setSpinning(true);
        setMessage('Vòng quay đang diễn ra...');
        setWinnings(0);
        setWinningLine([false, false, false]);
        finishedReelsCount.current = 0;
        const resultSymbols = generateSpinResult();
        setReelsResult(resultSymbols.map(s => s.src));
    };

    const handleSpinEnd = useCallback(() => {
        finishedReelsCount.current += 1;
        if (finishedReelsCount.current === reelsResult.length) {
            setSpinning(false);
            
            const resultSymbols = reelsResult.map(src => ALL_SYMBOLS.find(s => s.src === src));
            const counts: { [id: string]: number } = {};
            resultSymbols.forEach(symbol => {
                if (symbol) { counts[symbol.id] = (counts[symbol.id] || 0) + 1; }
            });

            let winAmount = 0;
            let winMessage = 'Chúc bạn may mắn lần sau!';
            let isWin = false;
            let isJackpotWin = false;
            let winningSymbolId = '';

            if (counts.seven === 3) {
                winAmount = jackpot;
                winMessage = `🎉 JACKPOT! BẠN THẮNG ${winAmount.toLocaleString()} XU! 🎉`;
                isWin = true;
                isJackpotWin = true;
                winningSymbolId = 'seven';
                setJackpotAnimation(true);
                setTimeout(() => setJackpotAnimation(false), 3000);
            } else if (counts.seven === 2) {
                winAmount = bet * 5; // Reward for Free Spins trigger
                winMessage = `🎉 KÍCH HOẠT FREE SPINS! Thắng ${winAmount.toLocaleString()} xu! 🎉`;
                isWin = true;
                winningSymbolId = 'seven';
            } else {
                const winningEntry = Object.entries(counts).find(([, count]) => count >= 2);
                if (winningEntry) {
                    const [id, count] = winningEntry;
                    const symbol = ALL_SYMBOLS.find(s => s.id === id);
                    if (symbol) {
                        winningSymbolId = id;
                        isWin = true;
                        if (symbol.type === 'medium') {
                            if (count === 3) {
                                winAmount = Math.floor(jackpot * 0.20);
                                winMessage = `SIÊU THẮNG! Bạn nhận 20% Jackpot: ${winAmount.toLocaleString()} xu!`;
                            } else { // 2 of a kind
                                winAmount = Math.floor(jackpot * 0.05);
                                winMessage = `THẮNG LỚN! Bạn nhận 5% Jackpot: ${winAmount.toLocaleString()} xu!`;
                            }
                        } else if (symbol.type === 'basic') {
                            if (count === 3) {
                                winAmount = bet * 3;
                                winMessage = `CHIẾN THẮNG! Bạn thắng ${winAmount.toLocaleString()} xu!`;
                            } else { // 2 of a kind
                                winAmount = bet * 2;
                                winMessage = `Tuyệt! Thắng ${winAmount.toLocaleString()} xu!`;
                            }
                        }
                    }
                }
            }

            if (isWin) {
                setWinnings(winAmount);
                setCoins(prev => prev + winAmount);
                const winningSymbolSrc = ALL_SYMBOLS.find(s => s.id === winningSymbolId)?.src;
                if (winningSymbolSrc) {
                     setWinningLine(reelsResult.map(src => src === winningSymbolSrc));
                }
            }

            setMessage(winMessage);
            const netDelta = winAmount - bet;
            onGameEnd(netDelta, bet, isJackpotWin);
        }
    }, [reelsResult, bet, jackpot, room, onGameEnd, setCoins]);

    const handleBetChange = (amount: number) => {
        setBet(prev => Math.max(room.baseBet, Math.min(room.maxBet, prev + amount)));
    };

    useEffect(() => {
        setBet(currentBet => {
            const maxAllowed = Math.min(balance, room.maxBet);
            if (balance < room.baseBet) {
                return balance > 0 ? balance : room.baseBet;
            }
            return Math.max(room.baseBet, Math.min(currentBet, maxAllowed));
        });
    }, [balance, room.baseBet, room.maxBet]);

    return (
        <div className="flex flex-col h-full w-full bg-slate-900 bg-gradient-to-br from-indigo-900/50 to-slate-900 text-white font-sans transition-all duration-500">
            <div className="flex items-center justify-between h-[53px] px-4 border-b border-slate-700/50 shrink-0 bg-slate-950 z-10">
                <button onClick={onExit} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Rời phòng
                </button>
                <div className="flex items-center gap-2">
                    <MasteryDisplay masteryCount={masteryCount} />
                    <CoinDisplay displayedCoins={animatedBalance} isStatsFullscreen={false} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="w-full max-w-2xl mx-auto flex flex-col p-6 md:p-8">
                    <div className={`text-center mb-6 p-3 rounded-xl border-4 transition-all duration-500 relative will-change-transform ${jackpotAnimation ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg'}`}>
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
                    <div className="flex justify-center text-center items-center mb-6">
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-sm text-slate-400">MỨC CƯỢC</p>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => handleBetChange(-room.betStep)} disabled={spinning || bet <= room.baseBet} className="px-2 py-0.5 bg-red-600 rounded-md disabled:opacity-50">-</button>
                                <p className="text-xl md:text-2xl font-bold text-yellow-400">{bet.toLocaleString()}</p>
                                <button onClick={() => handleBetChange(room.betStep)} disabled={spinning || bet + room.betStep > room.maxBet || balance < bet + room.betStep} className="px-2 py-0.5 bg-green-600 rounded-md disabled:opacity-50">+</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center mt-2">
                        <button onClick={handleSpin} disabled={spinning || balance < bet || bet === 0} className="group w-36 h-20 rounded-xl bg-slate-900/80 border-2 border-cyan-500/60 flex flex-col items-center justify-center p-1 transition-all duration-200 hover:enabled:border-cyan-400 hover:enabled:bg-slate-900/90 hover:enabled:scale-105 active:enabled:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-500/50 disabled:cursor-not-allowed will-change-transform">
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
        </div>
    );
};


export default function SlotMachineGame() {
    const { coins, setCoins, toggle777Game, masteryCards } = useGame();
    const currentUser = auth.currentUser;

    const [jackpotPools, setJackpotPools] = useState<{ [key: number]: number } | null>(null);
    const [currentView, setCurrentView] = useState('lobby');
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isMinTimePassed, setIsMinTimePassed] = useState(false);

    useEffect(() => {
        const initialPools: { [key: number]: number } = {};
        rooms.forEach(room => { initialPools[room.id] = room.initialJackpot; });
        const unsubscribe = listenToJackpotPools(setJackpotPools, initialPools);

        const timer = setTimeout(() => {
            setIsMinTimePassed(true);
        }, 800);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const handleGameEnd = async (netDelta: number, bet: number, isJackpotWin: boolean = false) => {
        if (currentUser && netDelta !== 0) {
            await updateUserCoins(currentUser.uid, netDelta);
        }
        if (selectedRoomId) {
            const contribution = Math.ceil(bet * 0.1);
            if (contribution > 0) {
                await contributeToJackpot(selectedRoomId, contribution);
            }
        }
        if (isJackpotWin && selectedRoomId) {
            const room = rooms.find(r => r.id === selectedRoomId);
            if (room) {
                await resetJackpot(selectedRoomId, room.initialJackpot);
            }
        }
    };

    const handleEnterRoom = useCallback((roomId: number) => {
        setSelectedRoomId(roomId);
        setCurrentView('game');
    }, []);

    const handleExitRoom = () => {
        setCurrentView('lobby');
        setSelectedRoomId(null);
    };

    const isLoading = !jackpotPools || !isMinTimePassed;

    if (isLoading) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-slate-900 z-[60]">
                <GlobalStyles />
                <SlotLobbySkeleton />
            </div>,
            document.body
        );
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-slate-900 z-[60]">
            <GlobalStyles />
            <div className="relative w-full h-full">
                {currentView === 'lobby' && jackpotPools && (
                    <LobbyScreen
                        balance={coins}
                        onEnterRoom={handleEnterRoom}
                        onClose={toggle777Game}
                        jackpotPools={jackpotPools}
                        masteryCount={masteryCards}
                    />
                )}
                {currentView === 'game' && selectedRoomId && jackpotPools && (
                    <GameScreen
                        room={rooms.find(r => r.id === selectedRoomId) as Room}
                        balance={coins}
                        jackpot={jackpotPools[selectedRoomId]}
                        onExit={handleExitRoom}
                        onGameEnd={handleGameEnd}
                        setCoins={setCoins}
                        masteryCount={masteryCards}
                    />
                )}
            </div>
        </div>,
        document.body
    );
}

const GlobalStyles = () => (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;600;700&display=swap');
      body {
        font-family: 'Inter', sans-serif;
      }
      .font-lilita { font-family: 'Lilita One', cursive; }
      @keyframes win-pulse { 0%, 100% { transform: scale(1); filter: brightness(1.5); } 50% { transform: scale(1.1); filter: brightness(1.75); } }
      .animate-win-pulse { animation: win-pulse 0.8s ease-in-out infinite; }
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
      }
      .will-change-transform {
        will-change: transform;
      }
    `}</style>
);
