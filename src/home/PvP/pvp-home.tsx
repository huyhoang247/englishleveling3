// --- START OF FILE PvpPortal.tsx ---

import React, { useState } from 'react';
import { PvpStyles, PlayerData, getMockPlayerData } from './share.tsx';

import PvpSelection from './pvp-selection.tsx';
import PvpWager from './dau-cuoc.tsx';
import PvpRanked from './dau-xep-hang.tsx';
import PvpInvasion from './PvpInvasion';

export default function PvpPortal() {
  const [playerData, setPlayerData] = useState<PlayerData>(getMockPlayerData());
  const [mode, setMode] = useState<'selection' | 'wager' | 'ranked' | 'invasion'>('selection');

  const handleCoinChange = (amount: number) => {
    setPlayerData(prev => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
  };

  const handleRankChange = (rpChange: number) => {
    setPlayerData(prev => ({
        ...prev,
        rankInfo: { 
            ...prev.rankInfo, 
            rankPoints: Math.max(0, prev.rankInfo.rankPoints + rpChange) 
        }
    }));
  };

  const handleReturnToSelection = () => {
    setMode('selection');
  };
  
  const handleClosePortal = () => {
      // Logic to close the entire portal/feature, e.g., navigate away
      console.log("Đóng cổng PvP");
  }

  const renderContent = () => {
    switch (mode) {
      case 'wager':
        return <PvpWager player1={playerData} onClose={handleReturnToSelection} onCoinChange={handleCoinChange} />;
      case 'ranked':
        return <PvpRanked player1={playerData} onClose={handleReturnToSelection} onRankChange={handleRankChange} />;
      case 'invasion':
        return <PvpInvasion player1={playerData} onClose={handleReturnToSelection} onCoinChange={handleCoinChange} />;
      default:
        return <PvpSelection playerData={playerData} onSelectMode={setMode} onClose={handleClosePortal} />;
    }
  }

  return (
    <>
        <PvpStyles />
        {renderContent()}
    </>
  );
}
// --- END OF FILE PvpPortal.tsx ---
