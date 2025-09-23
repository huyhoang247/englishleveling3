// --- START OF FILE pvp-home.tsx ---

import React, { useState } from 'react';
import { PvpStyles, PlayerData as BasePlayerData } from './share.tsx';

import PvpSelection from './pvp-selection.tsx';
import PvpWager from './dau-cuoc.tsx';
import PvpRanked from './dau-xep-hang.tsx';
import PvpInvasion from './dau-xam-luoc.tsx';

// Mở rộng PlayerData để bao gồm các thuộc tính cần thiết khác nếu có
// Dựa trên cách bạn gọi trong background-game.tsx, nó có thể cần nhiều hơn
interface PlayerData extends BasePlayerData {
  // Thêm các thuộc tính khác nếu cần
}

// Định nghĩa props cho PvpArena component để khớp với cách gọi trong background-game.tsx
interface PvpArenaProps {
  onClose: () => void;
  userId: string;
  player1: {
    name: string;
    avatarUrl: string;
    coins: number;
    initialStats: any; // Nên định nghĩa kiểu cụ thể hơn
    equippedSkills: any[]; // Nên định nghĩa kiểu cụ thể hơn
  };
  // Thêm các props khác nếu cần, ví dụ: onCoinChange
  onCoinChange: (amount: number) => Promise<void>;
}

// Đổi tên PvpPortal thành PvpArena để khớp với cách import và sử dụng
export default function PvpArena({ onClose, player1, onCoinChange }: PvpArenaProps) {
  // Sử dụng dữ liệu thật từ props thay vì mock data
  const [playerData, setPlayerData] = useState<PlayerData>({
      name: player1.name,
      avatarUrl: player1.avatarUrl,
      coins: player1.coins,
      stats: player1.initialStats,
      skills: player1.equippedSkills,
      // Dữ liệu rank và invasion cần được lấy từ GameContext hoặc fetch từ DB
      rankInfo: {
        rankName: "Đồng IV",
        rankPoints: 120,
        rankMaxPoints: 200,
      },
      invasionLog: [
          { opponent: 'Shadow Hunter', result: 'win', resources: 1500, timestamp: new Date() },
          { opponent: 'Iron Golem', result: 'loss', resources: -800, timestamp: new Date() },
      ]
  });
  
  const [mode, setMode] = useState<'selection' | 'wager' | 'ranked' | 'invasion'>('selection');

  const handleCoinChange = async (amount: number) => {
    // Gọi hàm từ GameContext để cập nhật coin và đồng bộ DB
    await onCoinChange(amount);
    // Cập nhật state cục bộ để UI phản hồi ngay lập tức
    setPlayerData(prev => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
  };

  const handleRankChange = (rpChange: number) => {
    // Logic cập nhật rank point (cần đồng bộ với DB sau này)
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
  
  // SỬA Ở ĐÂY: Hàm này giờ sẽ gọi prop `onClose` từ background-game.tsx
  const handleClosePortal = () => {
      onClose();
  }

  const renderContent = () => {
    switch (mode) {
      case 'wager':
        // Truyền `playerData` đã được khởi tạo từ props
        return <PvpWager player1={playerData} onClose={handleReturnToSelection} onCoinChange={handleCoinChange} />;
      case 'ranked':
        return <PvpRanked player1={playerData} onClose={handleReturnToSelection} onRankChange={handleRankChange} />;
      case 'invasion':
        return <PvpInvasion player1={playerData} onClose={handleReturnToSelection} onCoinChange={handleCoinChange} />;
      default:
        // TRUYỀN `handleClosePortal` (đã được sửa) vào `PvpSelection`
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
// --- END OF FILE pvp-home.tsx ---
