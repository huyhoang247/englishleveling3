// --- START OF FILE lucky-game-data.tsx ---

import React from 'react';
// Import các asset từ trung tâm quản lý tài nguyên
// Đảm bảo đường dẫn '../../game-assets.ts' khớp với cấu trúc thư mục của bạn
import { 
  uiAssets, 
  minerAssets, 
  resourceAssets, 
  upgradeAssets, 
  equipmentUiAssets 
} from '../../game-assets.ts'; 

// --- WRAPPER ICONS ---
// Giữ lại các wrapper này để đảm bảo tính tương thích nếu UI gọi dưới dạng Component
// nhưng bên trong sẽ render thẻ img lấy nguồn từ game-assets.

export const CoinsIcon = ({ className, src = uiAssets.coinIcon }: { className?: string; src?: string }) => {
  return (
    <img
      src={src}
      alt="Coin Icon"
      className={className}
      onError={(e) => { e.currentTarget.src = ''; }}
    />
  );
};

export const PickaxeIcon = ({ className }: { className?: string }) => (
  <img 
    src={minerAssets.pickaxeIcon} 
    alt="Pickaxe Icon" 
    className={className} 
    onError={(e) => { e.currentTarget.src = ''; }} 
  />
);

// --- CONSTANTS ---
export const jackpotIconUrl = uiAssets.jackpotIcon;
export const coinIconUrl = uiAssets.coinIcon;
export const pickaxeIconUrl = minerAssets.pickaxeIcon;

// --- INTERFACES ---
export interface Item {
  id: string; // ID duy nhất để xử lý logic trong Service
  icon: React.FC<{ className?: string }> | string; // Hỗ trợ cả Component hoặc URL string
  name: string;
  value: number; 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
  rewardType: 'coin' | 'pickaxe' | 'resource' | 'stone' | 'material';
  rewardAmount?: number;
}

// --- UTILITY FUNCTIONS ---
export const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#9ca3af'; // Gray
      case 'uncommon': return '#34d399'; // Green
      case 'rare': return '#38bdf8'; // Blue
      case 'epic': return '#a78bfa'; // Purple
      case 'legendary': return '#fbbf24'; // Gold
      case 'jackpot': return '#f59e0b'; // Orange
      default: return '#9ca3af';
    }
};

export const getCardStyle = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-400' };
      case 'uncommon': return { bg: 'bg-emerald-900/40', border: 'border-emerald-600', text: 'text-emerald-400' };
      case 'rare': return { bg: 'bg-cyan-900/40', border: 'border-cyan-600', text: 'text-cyan-400' };
      case 'epic': return { bg: 'bg-fuchsia-900/40', border: 'border-fuchsia-600', text: 'text-fuchsia-400' };
      case 'legendary': return { bg: 'bg-amber-900/40', border: 'border-amber-500', text: 'text-amber-400' };
      case 'jackpot': return { bg: 'bg-gradient-to-b from-red-900/60 to-amber-900/60', border: 'border-yellow-400', text: 'text-yellow-400' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400' };
    }
};

// --- WEIGHT CONFIGURATION ---
// Tổng trọng số không cần phải là 100, code sẽ tự tính tỷ lệ phần trăm
export const RARITY_WEIGHTS = {
    'common': 4500,    // Tỷ lệ rơi cao nhất (Nguyên liệu)
    'uncommon': 1200,  // Tỷ lệ rơi trung bình (Đá)
    'rare': 400,       // Tỷ lệ rơi thấp (Chỉ còn Pickaxe)
    'epic': 50,        // Tỷ lệ rơi rất thấp (Sách, Mảnh trang bị)
    'legendary': 0,    // Tạm ẩn
    'jackpot': 5       // Cực hiếm
};

// --- DATA: BASE ITEMS ---
export const BASE_ITEMS: Item[] = [
    // --- COMMON (Resources x5) ---
    { 
        id: 'wood', 
        icon: resourceAssets.wood, 
        name: 'Wood', 
        value: 0, 
        rarity: 'common', 
        color: 'text-amber-700', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'cloth', 
        icon: resourceAssets.cloth, 
        name: 'Cloth', 
        value: 0, 
        rarity: 'common', 
        color: 'text-indigo-300', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'ore', 
        icon: resourceAssets.ore, 
        name: 'Ore', 
        value: 0, 
        rarity: 'common', 
        color: 'text-slate-400', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'leather', 
        icon: resourceAssets.leather, 
        name: 'Leather', 
        value: 0, 
        rarity: 'common', 
        color: 'text-orange-800', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'feather', 
        icon: resourceAssets.feather, 
        name: 'Feather', 
        value: 0, 
        rarity: 'common', 
        color: 'text-white', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'coal', 
        icon: resourceAssets.coal, 
        name: 'Coal', 
        value: 0, 
        rarity: 'common', 
        color: 'text-gray-900', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },

    // --- UNCOMMON (Stones x1) ---
    { 
        id: 'stone_low', 
        icon: upgradeAssets.stoneBasic, 
        name: 'Basic Stone', 
        value: 0, 
        rarity: 'uncommon', 
        color: 'text-emerald-400', 
        rewardType: 'stone', 
        rewardAmount: 1 
    },
    { 
        id: 'stone_medium', 
        icon: upgradeAssets.stoneIntermediate, 
        name: 'Inter. Stone', 
        value: 0, 
        rarity: 'uncommon', 
        color: 'text-cyan-400', 
        rewardType: 'stone', 
        rewardAmount: 1 
    },
    { 
        id: 'stone_high', 
        icon: upgradeAssets.stoneAdvanced, 
        name: 'Advanced Stone', 
        value: 0, 
        rarity: 'uncommon', 
        color: 'text-violet-400', 
        rewardType: 'stone', 
        rewardAmount: 1 
    },

    // --- RARE (Pickaxe x5) ---
    { 
        id: 'pickaxe', 
        icon: minerAssets.pickaxeIcon, 
        name: 'Pickaxes', 
        value: 0, 
        rarity: 'rare', 
        color: '', 
        rewardType: 'pickaxe', 
        rewardAmount: 5 
    },

    // --- EPIC (Equipment Piece x10, Ancient Book x10) ---
    { 
        id: 'equipment_piece', 
        icon: equipmentUiAssets.equipmentPieceIcon, 
        name: 'Eq. Pieces', 
        value: 0, 
        rarity: 'epic', 
        color: 'text-fuchsia-400', 
        rewardType: 'material', 
        rewardAmount: 10 
    },
    { 
        id: 'ancient_book', 
        icon: uiAssets.bookIcon, 
        name: 'Anc. Books', 
        value: 0, 
        rarity: 'epic', 
        color: 'text-purple-300', 
        rewardType: 'material', 
        rewardAmount: 10 
    },

    // --- LEGENDARY (Tạm ẩn) ---
    // { id: 'legendary_chest', ... } 

    // --- JACKPOT ---
    { 
        id: 'jackpot_prize', 
        icon: jackpotIconUrl, 
        name: 'JACKPOT', 
        value: 0, 
        rarity: 'jackpot', 
        color: '', 
        rewardType: 'coin' 
    },
];
