// --- START OF FILE PvpWager.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import {
    PlayerData, OpponentData, CombatStats,
    executeTurn, simulateFullBattle, getMockOpponent,
    FloatingText, WagerModal, SearchingModal, HomeIcon, CoinDisplay, HealthBar, MatchResultModal
} from './pvp/shared';

interface PvpWagerProps {
  onClose: () => void;
  player1: PlayerData;
  onCoinChange: (amount: number) => void;
}

export default function PvpWager({ onClose, player1, onCoinChange }: PvpWagerProps) {
  const [battlePhase, setBattlePhase] = useState<'idle' | 'searching' | 'fighting' | 'finished'>('idle');
  const [player1Stats, setPlayer1Stats] = useState<CombatStats>(player1.initialStats);
  const [player2, setPlayer2] = useState<OpponentData | null>(null);
  const [player2Stats, setPlayer2Stats] = useState<CombatStats | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<'player1' | 'player2'>('player1');
  const [matchResult, setMatchResult] = useState<null | 'player1' | 'player2' | 'draw'>(null);
  const [damages, setDamages] = useState<{ id: number, text: string, positionClass: string, colorClass: string }[]>([]);
  const [goldPool, setGoldPool] = useState(0); 
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const [error, setError] = useState('');
  const [showWagerModal, setShowWagerModal] = useState(false); 

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDamageText = (num: number): string => num >= 1000 ? `${parseFloat((num / 1000).toFixed(1))}k` : String(Math.ceil(num));
  const addLog = (message: string) => setCombatLog(prev => [message, ...prev].slice(0, 50));
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

  const endMatch = (result: 'player1' | 'player2' | 'draw') => {
    if (matchResult) return;
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);

    if (result === 'player1') {
        addLog(`<b class="text-yellow-300">BẠN THẮNG!</b> Nhận được <b class="text-yellow-400">${totalPrizePool.toLocaleString()}</b> vàng.`);
        onCoinChange(totalPrizePool);
    } else if (result === 'player2') {
        addLog(`<b class="text-red-400">BẠN THUA!</b> Mất <b class="text-yellow-400">${goldPool.toLocaleString()}</b> vàng đã cược.`);
    } else if (result === 'draw') {
        addLog(`<b class="text-slate-400">HÒA!</b> Nhận lại <b class="text-yellow-400">${goldPool.toLocaleString()}</b> vàng đã cược.`);
        onCoinChange(goldPool);
    }
    setMatchResult(result);
    setBattlePhase('finished');
  };
  
  const handleSearch = () => {
    if (battlePhase !== 'idle' || goldPool <= 0) {
        setError('Bạn phải nạp vàng cược trước.');
        return;
    }
    setError('');
    addLog(`[Hệ thống] Đặt cược <b class="text-yellow-400">${goldPool.toLocaleString()}</b> vàng. Đang tìm đối thủ...`);
    setBattlePhase('searching');
  };
  
  const resetForNewSearch = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setCombatLog([]); setTurnCounter(0); setCurrentPlayerTurn('player1'); setMatchResult(null); 
    setBattlePhase('idle'); setDamages([]); setPlayer1Stats(player1.initialStats); setPlayer2(null); setPlayer2Stats(null);
    setGoldPool(0); setTotalPrizePool(0); setError('');
  };

  const handleDeposit = (amount: number) => {
    if (isNaN(amount) || amount <= 0) { setError('Số vàng không hợp lệ.'); return; }
    if (amount > player1.coins) { setError('Bạn không đủ vàng.'); return; }
    setError('');
    
    onCoinChange(-amount);
    setGoldPool(prev => prev + amount);
    setShowWagerModal(false);
    addLog(`[Hệ thống] Bạn đã nạp thêm <b class="text-yellow-400">${amount.toLocaleString()}</b> vàng vào bể cược.`);
  };

  useEffect(() => {
    if (battlePhase === 'searching') { 
        searchTimeoutRef.current = setTimeout(() => { 
            const opponent = getMockOpponent('wager');
            setPlayer2(opponent);
            setPlayer2Stats(opponent.initialStats);
            const prize = goldPool * 2;
            setTotalPrizePool(prize);
            addLog(`[Hệ thống] Bể cược tổng cộng là <b class="text-yellow-400">${prize.toLocaleString()}</b> vàng.`);
            addLog(`[Lượt 0] Đã tìm thấy đối thủ: ${opponent.name}. Trận đấu bắt đầu!`);
            setBattlePhase('fighting'); 
        }, 2500); 
    } else if (battlePhase === 'fighting' && !matchResult) { 
        battleIntervalRef.current = setInterval(runBattleTurn, 1500); 
    }
    return () => { 
        if (battleIntervalRef.current) clearInterval(battleIntervalRef.current); 
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); 
    };
  }, [battlePhase, matchResult]);

  return (
    <>
      {damages.map(d => (<FloatingText key={d.id} text={d.text} id={d.id} positionClass={d.positionClass} colorClass={d.colorClass} />))}
      {showWagerModal && <WagerModal onClose={() => setShowWagerModal(false)} onConfirm={handleDeposit} playerCoins={player1.coins}/>}
      {battlePhase === 'searching' && <SearchingModal />}
      
      <div className="main-bg relative w-full h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14 flex-shrink-0">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-full">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <HomeIcon className="w-5 h-5 text-slate-300" />
                  <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                </button>
                <h1 className="text-2xl font-bold text-red-400 text-shadow tracking-widest">ĐẤU CƯỢC</h1>
                <CoinDisplay displayedCoins={player1.coins} />
            </div>
        </header>

        <main className="w-full flex-1 overflow-y-auto p-4 flex flex-col items-center">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                {(battlePhase === 'idle' || battlePhase === 'fighting' || battlePhase === 'finished') && (
                    <div className="w-full max-w-2xl mx-auto mb-4 flex flex-col items-center gap-3 mt-4">
                        <div className="w-1/2">
                            <HealthBar current={player1Stats.hp} max={player1Stats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" />
                        </div>
                    </div>
                )}
                <div className="w-full flex justify-center items-center gap-3 mb-4">
                    {battlePhase === 'fighting' && !matchResult && (<button onClick={skipMatch} className="font-sans px-4 py-1.5 bg-slate-800/70 hover:bg-slate-700/80 rounded-lg font-semibold text-xs border border-slate-600 hover:border-orange-400 text-orange-300">Skip Battle</button>)}
                </div>
                <div className="w-full flex justify-center items-center my-8">
                    {battlePhase === 'idle' && (
                        <div className="flex flex-col items-center gap-8">
                          <div className="w-40 h-40 md:w-56 md:h-56 bg-black/20 rounded-full flex items-center justify-center border-4 border-slate-700"><span className="text-8xl font-black text-slate-500 select-none">?</span></div>
                          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                              <div className="flex items-center justify-center gap-4 bg-slate-900/50 border border-slate-700 rounded-lg p-2 w-full">
                                  <span className="font-sans text-slate-300">Bể Cược:</span>
                                  <span className="font-bold text-lg text-yellow-300">{(goldPool || 0).toLocaleString()}</span>
                                  <button onClick={() => setShowWagerModal(true)} className="ml-auto font-sans text-xs bg-sky-600/50 hover:bg-sky-600 border border-sky-500 rounded px-3 py-1">Nạp</button>
                              </div>
                              {error && <p className="text-red-400 text-sm font-sans mt-1">{error}</p>}
                          </div>
                          <button onClick={handleSearch} disabled={goldPool <= 0} className="btn-shine relative overflow-hidden px-10 py-3 bg-red-800/80 rounded-lg text-red-100 border border-red-500/40 transition-all hover:border-red-400 hover:shadow-[0_0_20px_theme(colors.red.500/0.6)] disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed">
                              <span className="font-bold text-xl tracking-widest uppercase">Search</span>
                          </button>
                        </div>
                    )}
                    {(battlePhase === 'fighting' || battlePhase === 'finished') && player2 && player2Stats && (
                      <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 ${currentPlayerTurn === 'player2' && battlePhase === 'fighting' ? 'animate-pulse-turn' : ''}`}>
                        <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">{player2.name}</h2>
                        <div className="w-40 h-40 md:w-56 md:h-56">
                          <img src={player2.avatarUrl} alt={player2.name} className="w-full h-full object-cover rounded-lg border-2 border-slate-600" />
                        </div>
                        <HealthBar current={player2Stats.hp} max={player2Stats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                      </div>
                    )}
                </div>
                {(battlePhase === 'fighting' || battlePhase === 'finished') && (
                  <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 mb-4">
                      <div className="h-40 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm scrollbar-thin font-sans">
                          {combatLog.length > 0 && totalPrizePool > 0 && (
                              <div className="text-center mb-2 font-bold text-yellow-300 border-t border-b border-yellow-600/30 py-1">Bể cược: {totalPrizePool.toLocaleString()} Vàng</div>
                          )}
                          {combatLog.map((entry, index) => <p key={index} className={`mb-1 ${index === 0 ? 'opacity-100' : 'opacity-70'}`} dangerouslySetInnerHTML={{__html: entry}}></p>)}
                      </div>
                  </div>
                )}
                {battlePhase === 'finished' && matchResult && player2 && <MatchResultModal result={matchResult} player1Name={player1.name} player2Name={player2.name} onSearchAgain={resetForNewSearch} prizePool={totalPrizePool} />}
            </div>
        </main>
      </div>
    </>
  );
}
// --- END OF FILE PvpWager.tsx ---
