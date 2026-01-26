// --- START OF FILE lucky-game-data.tsx ---

import React from 'react';
// Import các asset từ trung tâm quản lý tài nguyên
// Lưu ý: Đảm bảo đường dẫn '../game-assets' chính xác với cấu trúc thư mục của bạn
import { uiAssets, minerAssets } from '../../game-assets.ts'; 

// --- 1. ICONS (SVG DEFINITIONS) ---
// Định nghĩa các Icon cho tài nguyên mới bằng SVG để không phụ thuộc vào ảnh ngoài

export const WoodIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.7 12.9L14 7.2V2.5h-4v4.7L4.3 12.9c-.4.4-.4 1 0 1.4l1.4 1.4c.4.4 1 .4 1.4 0L12 10.8l4.9 4.9c.4.4 1 .4 1.4 0l1.4-1.4c.4-.4.4-1 0-1.4z" opacity="0.7" />
    <path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20h-13L12 5.5z" />
  </svg>
);

export const ClothIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 7h4v12h-4z" opacity="0.3"/>
    <path d="M12 2l-9 4v12l9 4 9-4V6l-9-4zm7 15.5l-7 3.11-7-3.11V6.5l7-3.11 7 3.11v11z"/>
  </svg>
);

export const OreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
  </svg>
);

export const LeatherIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 3v2h10V3h2v18h-2v2H7v-2H5V3h2zM7 7v10h10V7H7z"/>
  </svg>
);

export const FeatherIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3C19 3 15.5 8 13 10.5C10.5 13 4 15 4 15C4 15 6 15.5 8 16C10 16.5 13 16 13 16L9 20C9 20 12.5 19.5 15 18C17.5 16.5 20 12 20 12L19 3Z"/>
  </svg>
);

export const CoalIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8"/>
    <circle cx="9" cy="10" r="2" fill="black" opacity="0.5"/>
    <circle cx="15" cy="14" r="2" fill="black" opacity="0.5"/>
  </svg>
);

export const StoneLowIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L4 10l8 8 8-8-8-8zm0 13l-5-5 5-5 5 5-5 5z"/>
  </svg>
);

export const StoneMediumIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-8 4.5v9L12 22l8-6.5v-9L12 2zm0 16l-5-3v-5l5 3 5-3v5l-5 3z"/>
  </svg>
);

export const StoneHighIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 8l10 6 10-6-10-6zm0 14L4 10v6l8 6 8-6v-6l-8 6z"/>
  </svg>
);

export const BookIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
);

export const EqPieceIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5H2v2c0 1.1.9 2 2 2h3.8v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V21h4c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
    </svg>
);


// --- CONSTANTS (Lấy từ game-assets) ---
export const coinIconUrl = uiAssets.coinIcon;
export const pickaxeIconUrl = minerAssets.pickaxeIcon;
export const jackpotIconUrl = uiAssets.jackpotIcon;

// --- WRAPPER ICONS ---
export const CoinsIcon = ({ className, src = coinIconUrl }: { className?: string; src?: string }) => {
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
    src={pickaxeIconUrl} 
    alt="Pickaxe Icon" 
    className={className} 
    onError={(e) => { e.currentTarget.src = ''; }} 
  />
);

// --- INTERFACES ---
export interface Item {
  id: string; // ID duy nhất để xử lý logic trong Service
  icon: React.FC<{ className?: string }> | string;
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
    'rare': 400,       // Tỷ lệ rơi thấp (Pickaxe, Vàng)
    'epic': 50,        // Tỷ lệ rơi rất thấp (Sách, Mảnh trang bị)
    'legendary': 0,    // Tạm ẩn
    'jackpot': 5       // Cực hiếm
};

// --- DATA: BASE ITEMS ---
export const BASE_ITEMS: Item[] = [
    // --- COMMON (Resources x5) ---
    { 
        id: 'wood', 
        icon: WoodIcon, 
        name: 'Wood', 
        value: 0, 
        rarity: 'common', 
        color: 'text-amber-700', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'cloth', 
        icon: ClothIcon, 
        name: 'Cloth', 
        value: 0, 
        rarity: 'common', 
        color: 'text-indigo-300', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'ore', 
        icon: OreIcon, 
        name: 'Ore', 
        value: 0, 
        rarity: 'common', 
        color: 'text-slate-400', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'leather', 
        icon: LeatherIcon, 
        name: 'Leather', 
        value: 0, 
        rarity: 'common', 
        color: 'text-orange-800', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'feather', 
        icon: FeatherIcon, 
        name: 'Feather', 
        value: 0, 
        rarity: 'common', 
        color: 'text-white', 
        rewardType: 'resource', 
        rewardAmount: 5 
    },
    { 
        id: 'coal', 
        icon: CoalIcon, 
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
        icon: StoneLowIcon, 
        name: 'Low Stone', 
        value: 0, 
        rarity: 'uncommon', 
        color: 'text-emerald-400', 
        rewardType: 'stone', 
        rewardAmount: 1 
    },
    { 
        id: 'stone_medium', 
        icon: StoneMediumIcon, 
        name: 'Med Stone', 
        value: 0, 
        rarity: 'uncommon', 
        color: 'text-cyan-400', 
        rewardType: 'stone', 
        rewardAmount: 1 
    },
    { 
        id: 'stone_high', 
        icon: StoneHighIcon, 
        name: 'High Stone', 
        value: 0, 
        rarity: 'uncommon', 
        color: 'text-violet-400', 
        rewardType: 'stone', 
        rewardAmount: 1 
    },

    // --- RARE (Pickaxe x5, Coins x300) ---
    { 
        id: 'pickaxe', 
        icon: pickaxeIconUrl, 
        name: 'Pickaxes', 
        value: 0, 
        rarity: 'rare', 
        color: '', 
        rewardType: 'pickaxe', 
        rewardAmount: 5 
    },
    { 
        id: 'coins_pack', 
        icon: coinIconUrl, 
        name: 'Coins', 
        value: 300, 
        rarity: 'rare', 
        color: '', 
        rewardType: 'coin', 
        rewardAmount: 300 
    },

    // --- EPIC (Equipment Piece x10, Ancient Book x10) ---
    { 
        id: 'equipment_piece', 
        icon: EqPieceIcon, 
        name: 'Eq. Pieces', 
        value: 0, 
        rarity: 'epic', 
        color: 'text-fuchsia-400', 
        rewardType: 'material', 
        rewardAmount: 10 
    },
    { 
        id: 'ancient_book', 
        icon: BookIcon, 
        name: 'Anc. Books', 
        value: 0, 
        rarity: 'epic', 
        color: 'text-purple-300', 
        rewardType: 'material', 
        rewardAmount: 10 
    },

    // --- LEGENDARY (Tạm ẩn vì chưa có vật phẩm) ---
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
