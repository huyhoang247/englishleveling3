// --- START OF FILE upgrade-store.ts ---

import { create } from 'zustand';
import { ReactNode } from 'react';
import { auth } from '../../firebase.js';
import { fetchOrCreateUserGameData, upgradeUserStats } from '../../gameDataService.ts';

// --- IMPORT CÁC LOGIC TÍNH TOÁN VÀ CONFIG TỪ FILE UI (hoặc file utils chung) ---
// Tốt nhất là chuyển các hàm này vào một file utils riêng để cả store và UI cùng import
import { statConfig, calculateUpgradeCost, getBonusForLevel } from './upgrade-ui.tsx';

// --- INTERFACES (Định nghĩa kiểu dữ liệu) ---
interface Stat {
  id: 'hp' | 'atk' | 'def';
  level: number;
  name: string;
  icon: JSX.Element;
  baseUpgradeBonus: number;
  color: string;
  toastColors: {
    border: string;
    text: string;
  };
}

interface ToastData {
  isVisible: boolean;
  icon: JSX.Element;
  bonus: number;
  colorClasses: {
    border: string;
    text: string;
  };
}

// --- ĐỊNH NGHĨA "HÌNH DẠNG" CỦA STATE ---
interface UpgradeStatsState {
  // State cốt lõi
  gold: number;
  stats: Stat[];
  message: ReactNode;
  toastData: ToastData | null;
  isLoading: boolean;
  upgradingId: 'hp' | 'atk' | 'def' | null;

  // Actions (các hàm để thay đổi state)
  fetchInitialData: () => Promise<void>;
  handleUpgrade: (statId: 'hp' | 'atk' | 'def') => Promise<void>;
  clearMessage: () => void;
  clearToast: () => void;
}

// --- TẠO STORE VỚI ZUSTAND ---
export const useUpgradeStore = create<UpgradeStatsState>((set, get) => ({
  // --- STATE BAN ĐẦU ---
  gold: 0,
  stats: [
    { id: 'hp', level: 0, ...statConfig.hp },
    { id: 'atk', level: 0, ...statConfig.atk },
    { id: 'def', level: 0, ...statConfig.def },
  ],
  message: '',
  toastData: null,
  isLoading: true,
  upgradingId: null,

  // --- ACTIONS ---

  // Action để dọn dẹp message
  clearMessage: () => set({ message: '' }),
  
  // Action để dọn dẹp toast
  clearToast: () => set({ toastData: null }),

  // Action fetch dữ liệu ban đầu
  fetchInitialData: async () => {
    set({ isLoading: true });
    const user = auth.currentUser;
    if (!user) {
      set({ message: "Lỗi: Người dùng chưa đăng nhập.", isLoading: false });
      return;
    }
    try {
      const gameData = await fetchOrCreateUserGameData(user.uid);
      set({
        gold: gameData.coins,
        stats: [
          { id: 'hp', level: gameData.stats.hp || 0, ...statConfig.hp },
          { id: 'atk', level: gameData.stats.atk || 0, ...statConfig.atk },
          { id: 'def', level: gameData.stats.def || 0, ...statConfig.def },
        ],
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng:", error);
      set({ message: "Không thể tải dữ liệu." });
    } finally {
      set({ isLoading: false });
    }
  },

  // Action xử lý nâng cấp (logic chính)
  handleUpgrade: async (statId) => {
    const { upgradingId, gold, stats, clearMessage, clearToast } = get();
    const user = auth.currentUser;

    if (upgradingId || !user) return;

    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (gold < upgradeCost) {
      set({ message: 'ko đủ vàng' });
      setTimeout(clearMessage, 2000);
      return;
    }

    set({ upgradingId: statId, message: '' });

    // Logic Toast
    const bonusGained = getBonusForLevel(statToUpgrade.level + 1, statToUpgrade.baseUpgradeBonus);
    set({
      toastData: {
        isVisible: true,
        icon: statToUpgrade.icon,
        bonus: bonusGained,
        colorClasses: statToUpgrade.toastColors,
      }
    });
    setTimeout(clearToast, 1500);

    // Cập nhật UI lạc quan (Optimistic Update)
    const oldGold = gold;
    const oldStats = JSON.parse(JSON.stringify(stats)); // Deep copy để rollback
    const newStatsArray = stats.map(s => s.id === statId ? { ...s, level: s.level + 1 } : s);
    
    set({
      gold: prevGold => prevGold - upgradeCost,
      stats: newStatsArray,
    });

    const newStatsForFirestore = {
      hp: newStatsArray.find(s => s.id === 'hp')!.level,
      atk: newStatsArray.find(s => s.id === 'atk')!.level,
      def: newStatsArray.find(s => s.id === 'def')!.level,
    };
    
    // Gọi API
    try {
      const { newCoins } = await upgradeUserStats(user.uid, upgradeCost, newStatsForFirestore);
      set({ gold: newCoins }); // Đồng bộ lại gold chính xác từ server
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      // Rollback state nếu có lỗi
      set({
        message: 'Nâng cấp thất bại, vui lòng thử lại!',
        gold: oldGold,
        stats: oldStats,
      });
      setTimeout(clearMessage, 3000);
    } finally {
      // Dùng timeout nhỏ để hiệu ứng chuyển đổi mượt hơn
      setTimeout(() => set({ upgradingId: null }), 300);
    }
  },
}));
