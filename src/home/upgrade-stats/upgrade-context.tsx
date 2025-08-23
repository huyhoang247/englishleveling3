// --- START OF FILE upgrade-context.tsx (ĐÃ REFACTOR) ---

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import { auth } from '../../firebase.js';
import { fetchOrCreateUserGameData, upgradeUserStats } from '../../gameDataService.ts';

// --- IMPORT CÁC LOGIC TÍNH TOÁN VÀ CONFIG TỪ FILE GỐC ---
import { statConfig, calculateUpgradeCost, getBonusForLevel, calculateTotalStatValue } from './upgrade-ui.tsx';

// --- THAY ĐỔI: IMPORT CONTEXT TOÀN CỤC ---
import { useGameData } from '../../GameDataContext.tsx';

// --- INTERFACES ---
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

// --- ĐỊNH NGHĨA "HÌNH DẠNG" CỦA CONTEXT ---
interface UpgradeStatsContextType {
  // State for UI
  isLoading: boolean;
  isUpgrading: boolean;
  animatedGold: number;
  stats: Stat[];
  message: ReactNode;
  toastData: ToastData | null;

  // Calculated Values
  totalHp: number;
  totalAtk: number;
  totalDef: number;
  totalLevels: number;
  prestigeLevel: number;
  progressPercent: number;

  // Actions
  handleUpgrade: (statId: 'hp' | 'atk' | 'def') => Promise<void>;
}

// --- TẠO CONTEXT ---
const UpgradeStatsContext = createContext<UpgradeStatsContextType | undefined>(undefined);

// --- TẠO PROVIDER COMPONENT (CHỨA TOÀN BỘ LOGIC) ---
// --- THAY ĐỔI: Bỏ prop `onDataUpdated` ---
interface UpgradeStatsProviderProps {
  children: ReactNode;
}

export function UpgradeStatsProvider({ children }: UpgradeStatsProviderProps) {
  // --- THAY ĐỔI: Lấy dữ liệu và actions từ context toàn cục ---
  const { coins: globalCoins, userStats: globalStats, refreshUserData } = useGameData();

  // State cục bộ VẪN CẦN THIẾT cho UI và optimistic updates
  const [targetGold, setTargetGold] = useState(0);
  const animatedGold = useAnimateValue(targetGold, 400);
  const [stats, setStats] = useState<Stat[]>([]);
  
  const [message, setMessage] = useState<ReactNode>('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Dùng để xử lý việc khởi tạo state cục bộ
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // --- THAY ĐỔI: Bỏ useEffect fetch dữ liệu ban đầu. Thay bằng useEffect để đồng bộ từ global context. ---
  useEffect(() => {
    setIsLoading(true);
    setTargetGold(globalCoins);
    setStats([
      { id: 'hp', level: globalStats.hp || 0, ...statConfig.hp },
      { id: 'atk', level: globalStats.atk || 0, ...statConfig.atk },
      { id: 'def', level: globalStats.def || 0, ...statConfig.def },
    ]);
    setIsLoading(false);
  }, [globalCoins, globalStats]);

  // Hàm xử lý nâng cấp (logic chính)
  const handleUpgrade = useCallback(async (statId: 'hp' | 'atk' | 'def') => {
    const user = auth.currentUser;
    if (upgradingId || !user) return;

    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);

    if (targetGold < upgradeCost) {
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

    const oldGold = targetGold;
    const oldStats = JSON.parse(JSON.stringify(stats));
    setTargetGold(prev => prev - upgradeCost);
    const newStatsArray = stats.map(s => s.id === statId ? { ...s, level: s.level + 1 } : s);
    setStats(newStatsArray);

    const newStatsForFirestore = {
      hp: newStatsArray.find(s => s.id === 'hp')!.level,
      atk: newStatsArray.find(s => s.id === 'atk')!.level,
      def: newStatsArray.find(s => s.id === 'def')!.level,
    };

    try {
      await upgradeUserStats(user.uid, upgradeCost, newStatsForFirestore);
      
      // --- THAY ĐỔI LỚN: Gọi refreshUserData từ context toàn cục để cập nhật state ---
      await refreshUserData();

    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      setTargetGold(oldGold);
      setStats(oldStats);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTimeout(() => setUpgradingId(null), 300);
    }
  }, [upgradingId, stats, targetGold, refreshUserData]);

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
    isLoading,
    isUpgrading: upgradingId !== null,
    animatedGold,
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
// --- END OF FILE upgrade-context.tsx (ĐÃ REFACTOR) ---
