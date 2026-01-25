// --- START OF FILE lucky-game-data.tsx ---

import React from 'react';
// Import các asset từ trung tâm quản lý tài nguyên
// Lưu ý: Đảm bảo đường dẫn '../game-assets' chính xác với cấu trúc thư mục của bạn
import { uiAssets, minerAssets } from '../../game-assets.ts'; 

// --- CONSTANTS (Lấy từ game-assets) ---
export const coinIconUrl = uiAssets.coinIcon;
export const pickaxeIconUrl = minerAssets.pickaxeIcon;
export const jackpotIconUrl = uiAssets.jackpotIcon;

// --- ICONS (Reward Icons Components) ---
export const CoinsIcon = ({ className, src = coinIconUrl }: { className?: string; src?: string }) => {
  return (
    <img
      src={src}
      alt="Coin Icon"
      className={className}
      onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }}
    />
  );
};

export const PickaxeIcon = ({ className }: { className?: string }) => (
  <img 
    src={pickaxeIconUrl} 
    alt="Pickaxe Icon" 
    className={className} 
    onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=P'; }} 
  />
);

export const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path>
  </svg>
);

export const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path>
  </svg>
);

export const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
  </svg>
);

export const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path>
  </svg>
);

// --- INTERFACES ---
export interface Item {
  icon: React.FC<{ className?: string }> | string;
  name: string;
  value: number; 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
  rewardType?: 'coin' | 'pickaxe' | 'other';
  rewardAmount?: number;
}

// --- UTILITY FUNCTIONS ---
export const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#9ca3af'; 
      case 'uncommon': return '#34d399'; 
      case 'rare': return '#38bdf8'; 
      case 'epic': return '#a78bfa'; 
      case 'legendary': return '#fbbf24'; 
      case 'jackpot': return '#f59e0b'; 
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
export const RARITY_WEIGHTS = {
    'common': 2000,
    'uncommon': 800,
    'rare': 300,
    'epic': 80,
    'legendary': 20,
    'jackpot': 5
};

// --- DATA: BASE ITEMS ---
// Toàn bộ icon được thay thế bằng biến từ game-assets
export const BASE_ITEMS: Item[] = [
    { icon: coinIconUrl, name: 'Coins', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Energy', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: coinIconUrl, name: 'Coins', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: coinIconUrl, name: 'Coins', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Trophy', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Life', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: jackpotIconUrl, name: 'JACKPOT', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Mystery', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: coinIconUrl, name: 'Coins', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
];
