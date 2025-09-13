// --- START OF FILE upgrade-context.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { auth } from '../../firebase.js';
// SỬA LỖI: Import useGame để lấy dữ liệu từ context cha
import { useGame } from '../../GameContext.tsx'; 
import { upgradeUserStat } from './upgrade-service.ts';

// --- IMPORT CÁC LOGIC TÍNH TOÁN VÀ CONFIG TỪ FILE GỐC ---
import { statConfig, calculateUpgradeCost, getBonusForLevel, calculateTotalStatValue } from './upgrade-ui.tsx';

// --- INTERFACES (Không thay đổi) ---
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

// --- ĐỊNH NGHĨA CONTEXT (Không thay đổi) ---
interface UpgradeStatsContextType {
  isLoading: boolean;
  isUpgrading: boolean;
  gold: number;
  stats: Stat[];
  message: ReactNode;
  toastData: ToastData | null;
  totalHp: number;
  totalAtk: number;
  totalDef: number;
  totalLevels: number;
  prestigeLevel: number;
  progressPercent: number;
  handleUpgrade: (statId: 'hp' | 'atk' | 'def') => Promise<void>;
}

const UpgradeStatsContext = createContext<UpgradeStatsContextType | undefined>(undefined);

interface UpgradeStatsProviderProps {
  children: ReactNode;
}

export function UpgradeStatsProvider({ children }: UpgradeStatsProviderProps) {
  // SỬA LỖI: Lấy `userStatsLevel` thay vì `userStats` không còn tồn tại
  const { coins, userStatsLevel, isLoadingUserData } = useGame();

  // State cục bộ để thực hiện optimistic updates.
  const [gold, setGold] = useState(0);
  const [stats, setStats] = useState<Stat[]>([
    { id: 'hp', level: 0, ...statConfig.hp },
    { id: 'atk', level: 0, ...statConfig.atk },
    { id: 'def', level: 0, ...statConfig.def },
  ]);

  const [message, setMessage] = useState<ReactNode>('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // SỬA LỖI: Đồng bộ state cục bộ từ `userStatsLevel` của GameContext
  useEffect(() => {
    // Kiểm tra `userStatsLevel` có tồn tại trước khi truy cập để tránh lỗi
    if (!isLoadingUserData && userStatsLevel) {
        setGold(coins);
        setStats([
            // Sử dụng `userStatsLevel` thay vì `userStats`
            { id: 'hp', level: userStatsLevel.hp || 0, ...statConfig.hp },
            { id: 'atk', level: userStatsLevel.atk || 0, ...statConfig.atk },
            { id: 'def', level: userStatsLevel.def || 0, ...statConfig.def },
        ]);
    }
  }, [coins, userStatsLevel, isLoadingUserData]); // Dependency array cũng được cập nhật

  // Hàm xử lý nâng cấp (logic không thay đổi, vẫn đúng)
  const handleUpgrade = useCallback(async (statId: 'hp' | 'atk' | 'def') => {
    const user = auth.currentUser;
    if (upgradingId || !user) return;

    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);
    if (gold < upgradeCost) {
      setMessage('ko đủ vàng'); 
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setUpgradingId(statId);
    setMessage('');

    const bonusGained = getBonusForLevel(statToUpgrade.level + 1, statToUpgrade.baseUpgradeBonus);
    setToastData({
      isVisible: true,
      icon: statToUpgrade.icon,
      bonus: bonusGained,
      colorClasses: statToUpgrade.toastColors,
    });
    setTimeout(() => setToastData(null), 1500);

    const oldGold = gold;
    const oldStats = JSON.parse(JSON.stringify(stats));
    setGold(prev => prev - upgradeCost);
    setStats(prevStats => prevStats.map(s => s.id === statId ? { ...s, level: s.level + 1 } : s));

    const newLevel = statToUpgrade.level + 1;
    const newValue = calculateTotalStatValue(newLevel, statToUpgrade.baseUpgradeBonus);

    try {
      await upgradeUserStat(user.uid, upgradeCost, statId, newLevel, newValue);
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      setGold(oldGold);
      setStats(oldStats);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTimeout(() => setUpgradingId(null), 300);
    }
  }, [upgradingId, stats, gold]);

  // Các giá trị được tính toán (không thay đổi, vẫn đúng)
  const calculatedValues = useMemo(() => {
    const hpStat = stats.find(s => s.id === 'hp');
    const atkStat = stats.find(s => s.id === 'atk');
    const defStat = stats.find(s => s.id === 'def');

    const totalHp = hpStat ? calculateTotalStatValue(hpStat.level, statConfig.hp.baseUpgradeBonus) : 0;
    const totalAtk = atkStat ? calculateTotalStatValue(atkStat.level, statConfig.atk.baseUpgradeBonus) : 0;
    const totalDef = defStat ? calculateTotalStatValue(defStat.level, statConfig.def.baseUpgradeBonus) : 0;
    
    const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
    const maxProgress = 50;
    const prestigeLevel = Math.floor(totalLevels / maxProgress);
    const currentProgress = totalLevels % maxProgress;
    const progressPercent = (currentProgress / maxProgress) * 100;
    
    return { totalHp, totalAtk, totalDef, totalLevels, prestigeLevel, progressPercent };
  }, [stats]);

  const value: UpgradeStatsContextType = {
    isLoading: isLoadingUserData,
    isUpgrading: upgradingId !== null,
    gold,
    stats,
    message,
    toastData,
    ...calculatedValues,
    handleUpgrade,
  };

  return <UpgradeStatsContext.Provider value={value}>{children}</UpgradeStatsContext.Provider>;
}

export const useUpgradeStats = () => {
  const context = useContext(UpgradeStatsContext);
  if (context === undefined) {
    throw new Error('useUpgradeStats must be used within a UpgradeStatsProvider');
  }
  return context;
};
// --- END OF FILE upgrade-context.tsx ---
