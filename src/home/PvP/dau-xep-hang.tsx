// --- START OF FILE PvpRanked.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import {
    PlayerData, OpponentData, CombatStats,
    executeTurn, simulateFullBattle, getMockOpponent,
    FloatingText, SearchingModal, HomeIcon, CoinDisplay, HealthBar, RankedResultModal
} from './pvp/shared';

interface PvpRankedProps {
  onClose: () => void;
  player1: PlayerData;
  onRankChange: (rpChange: number) => void;
}

export default function PvpRanked({ onClose, player1, onRankChange }: PvpRankedProps) {
    const [battlePhase, setBattlePhase] = useState<'idle' | 'searching' | 'fighting' | 'finished'>('idle');
    const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
    const [player2, setPlayer2] = useState<OpponentData | null>(null);
    const [player2Stats, setPlayer2Stats] = useState<CombatStats | null>(null);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [turnCounter, setTurnCounter] = useState(0);
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
    const [matchResult, setMatchResult] = useState<null | 'player1' | 'player2' | 'draw'>(null);
    const [rpChange, setRpChange] = useState(0);
    const [damages, setDamages] = useState<{ id: number, text: string, positionClass: string, colorClass: string }[]>([]);

    const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
    const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
    const showFloatingText = (text: string, colorClass: string, target: 'player1' | 'player2') => {
        const id = Date.now() + Math.random();
        const positionClass = target === 'player1' ? 'left-[25%]' : 'right-[25%]'; 
        setDamages(prev => [...prev, { id, text, positionClass, colorClass }]);
        setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1500);
    };

    const runBattleTurn = () => {
        if (!player2 || !player2Stats) return;
        const nextTurn = turnCounter + 1;
        const isP1Turn = currentPlayerTurn === 'player1';
        const attacker = { data: isP1Turn ? player1 : player2, stats: isP1Turn ? player1Stats : player2Stats };
        const defender = { data: isP1Turn ? player2 : player1, stats: isP1Turn ? player2Stats : player1Stats };
        const attackerId = isP1Turn ? 'player1' : 'player2';
        const defenderId = isP1Turn ? 'player2' : 'player1';
        
        const { newAttackerStats, newDefenderStats, turnLogs, winner, turnEvents } = executeTurn(attacker, defender, nextTurn);
        
        if (turnEvents.defenderDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.defenderDmg)}`, 'text-red-500', defenderId);
        if (turnEvents.attackerHeal > 0) showFloatingText(`+${formatDamageText(turnEvents.attackerHeal)}`, 'text-green-400', attackerId);
        if (turnEvents.attackerReflectDmg > 0) showFloatingText(`-${formatDamageText(turnEvents.attackerReflectDmg)}`, 'text-orange-400', attackerId);
        
        if(isP1Turn) { setPlayer1Stats(newAttackerStats); setPlayer2Stats(newDefenderStats); } else { setPlayer2Stats(newAttackerStats); setPlayer1Stats(newDefenderStats); }
        
        setCombatLog(prev => [...turnLogs.reverse(), ...prev]);
        setTurnCounter(nextTurn);
        setCurrentPlayerTurn(isP1Turn ? 'player2' : 'player1');
        
        if (winner) { const finalWinner = winner === 'attacker' ? attackerId : defenderId; endMatch(finalWinner); } 
        else if (nextTurn >= 50) { endMatch('draw'); }
    };

    const skipMatch = () => {
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
        if (!player2 || !player2Stats) return;

        const simulation = simulateFullBattle(player1, player1.initialStats, player2, player2.initialStats);

        setPlayer1Stats(simulation.finalP1Stats);
        setPlayer2Stats(simulation.finalP2Stats);
        setCombatLog(simulation.combatLog);
        
        endMatch(simulation.result);
    };

    const handleSearch = () => {
        setBattlePhase('searching');
        addLog("Đang tìm đối thủ xứng tầm...");
        setTimeout(() => {
            const opponent = getMockOpponent('ranked');
            setPlayer2(opponent);
            setPlayer2Stats(opponent.initialStats);
            setBattlePhase('fighting');
            addLog(`Đã tìm thấy: ${opponent.name}! Trận đấu bắt đầu.`);
        }, 2000);
    };

    const endMatch = (result: 'player1' | 'player2' | 'draw') => {
        if (matchResult) return;
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

        const rpWin = 25; const rpLoss = -15; let change = 0;

        if (result === 'player1') { change = rpWin; addLog(`VICTORY! Bạn nhận được <b class="text-purple-400">${rpWin} RP</b>.`); } 
        else if (result === 'player2') { change = rpLoss; addLog(`DEFEAT! Bạn bị trừ <b class="text-red-500">${Math.abs(rpLoss)} RP</b>.`); } 
        else { addLog(`HÒA! Không có thay đổi về RP.`); }

        setRpChange(change);
        if (change !== 0) onRankChange(change);
        setMatchResult(result);
        setBattlePhase('finished');
    };
    
    const resetForNewSearch = () => {
        setBattlePhase('idle');
        setPlayer1Stats(player1.initialStats);
        setPlayer2(null);
        setPlayer2Stats(null);
        setCombatLog([]);
        setMatchResult(null);
        setTurnCounter(0);
        setCurrentPlayerTurn('player1');
        setRpChange(0);
        setDamages([]);
    };
    
    useEffect(() => {
        if (battlePhase === 'fighting' && !matchResult) { battleIntervalRef.current = setInterval(runBattleTurn, 1500); }
        return () => { if (battleIntervalRef.current) clearInterval(battleIntervalRef.current); };
    }, [battlePhase, matchResult]);

    return (
        <>
            {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} positionClass={d.positionClass} colorClass={d.colorClass} />))}
            {battlePhase === 'searching' && <SearchingModal />}

            <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
                <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
                    <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                            <HomeIcon className="w-5 h-5 text-slate-300" />
                            <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                        </button>
                        <h1 className="text-2xl font-bold text-purple-400 text-shadow tracking-widest">ĐẤU XẾP HẠNG</h1>
                        <CoinDisplay displayedCoins={player1.coins} />
                    </div>
                </header>

                <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col items-center">
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                        {battlePhase === 'idle' ? (
                            <div className="flex flex-col items-center gap-8 animate-fade-in mt-16">
                                <h2 className="text-3xl font-bold text-shadow text-yellow-300">Thông Tin Mùa Giải</h2>
                                <div className="w-full max-w-sm bg-black/30 p-4 rounded-lg border border-slate-700">
                                    <div className='flex justify-between items-baseline mb-1'><span className='font-bold text-xl text-slate-200'>{player1.rankInfo.rankName}</span><span className='font-sans text-sm text-slate-400'>{player1.rankInfo.rankPoints.toLocaleString()} / {player1.rankInfo.rankMaxPoints.toLocaleString()} RP</span></div>
                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${(player1.rankInfo.rankPoints / player1.rankInfo.rankMaxPoints) * 100}%` }}></div></div>
                                </div>
                                <button onClick={handleSearch} className="btn-shine relative overflow-hidden px-10 py-3 bg-purple-800/80 rounded-lg text-purple-100 border border-purple-500/40 transition-all hover:border-purple-400 hover:shadow-[0_0_20px_theme(colors.purple.500/0.6)]">
                                    <span className="font-bold text-xl tracking-widest uppercase">Tìm Trận</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-full max-w-2xl mx-auto mb-4 mt-4"><div className="w-1/2 mx-auto"><HealthBar current={player1Stats.hp} max={player1Stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" /></div></div>
                                <div className="w-full flex justify-center items-center gap-3 mb-4">
                                    {battlePhase === 'fighting' && !matchResult && (
                                        <button onClick={skipMatch} className="font-sans px-4 py-1.5 bg-slate-800/70 hover:bg-slate-700/80 rounded-lg font-semibold text-xs border border-slate-600 hover:border-purple-400 text-purple-300">Skip Battle</button>
                                    )}
                                </div>
                                <div className="w-full flex justify-center items-center my-8">
                                    {player2 && player2Stats && (
                                        <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 ${currentPlayerTurn === 'player2' && battlePhase === 'fighting' ? 'animate-pulse-turn' : ''}`}>
                                            <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">{player2.name}</h2>
                                            <div className="w-40 h-40 md:w-56 md:h-56"><img src={player2.avatarUrl} alt={player2.name} className="w-full h-full object-cover rounded-lg border-2 border-slate-600" /></div>
                                            <HealthBar current={player2Stats.hp} max={player2Stats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                                        </div>
                                    )}
                                </div>
                                <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mb-4">
                                    <div className="h-40 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm scrollbar-thin font-sans">
                                        {combatLog.map((entry, index) => <p key={index} className={`mb-1 ${index === 0 ? 'opacity-100' : 'opacity-70'}`} dangerouslySetInnerHTML={{__html: entry}}></p>)}
                                    </div>
                                </div>
                            </>
                        )}
                        {battlePhase === 'finished' && matchResult && <RankedResultModal result={matchResult} onSearchAgain={resetForNewSearch} rpChange={rpChange} />}
                    </div>
                </main>
            </div>
        </>
    );
}
// --- END OF FILE PvpRanked.tsx ---
