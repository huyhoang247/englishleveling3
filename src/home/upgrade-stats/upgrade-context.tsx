// --- START OF FILE upgrade-context.tsx ---

// --- START OF FILE upgrade-stats-context.tsx ---

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { auth } from '../../firebase.js';
// SỬA ĐỔI: Tách import để rõ ràng hơn
import { fetchOrCreateUserGameData } from '../../gameDataService.ts';
import { upgradeUserStats } from './upgrade-service.ts'; // SỬA ĐỔI: Import từ file mới

// --- IMPORT CÁC LOGIC TÍNH TOÁN VÀ CONFIG TỪ FILE GỐC ---
import { statConfig, calculateUpgradeCost, getBonusForLevel, calculateTotalStatValue } from './upgrade-ui.tsx';

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
  gold: number;
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
interface UpgradeStatsProviderProps {
  children: ReactNode;
  onDataUpdated: (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => void;
}

export function UpgradeStatsProvider({ children, onDataUpdated }: UpgradeStatsProviderProps) {
  const [gold, setGold] = useState(0);

  const [stats, setStats] = useState<Stat[]>([
    { id: 'hp', level: 0, ...statConfig.hp },
    { id: 'atk', level: 0, ...statConfig.atk },
    { id: 'def', level: 0, ...statConfig.def },
  ]);

  const [message, setMessage] = useState<ReactNode>('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // Effect fetch dữ liệu ban đầu
  useEffect(() => {
    const MIN_LOADING_TIME_MS = 500;
    const startTime = Date.now();

    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Lỗi: Người dùng chưa đăng nhập.");
        setIsLoading(false);
        return;
      }
      try {
        const gameData = await fetchOrCreateUserGameData(user.uid);
        setGold(gameData.coins);
        setStats([
          { id: 'hp', level: gameData.stats.hp || 0, ...statConfig.hp },
          { id: 'atk', level: gameData.stats.atk || 0, ...statConfig.atk },
          { id: 'def', level: gameData.stats.def || 0, ...statConfig.def },
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
        setMessage("Không thể tải dữ liệu.");
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = MIN_LOADING_TIME_MS - elapsedTime;
        const delay = Math.max(0, remainingTime);
        
        setTimeout(() => {
            setIsLoading(false);
        }, delay);
      }
    };
    fetchData();
  }, []);

  // Hàm xử lý nâng cấp (logic chính)
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
    const newStatsArray = stats.map(s => s.id === statId ? { ...s, level: s.level + 1 } : s);
    setStats(newStatsArray);

    const newStatsForFirestore = {
      hp: newStatsArray.find(s => s.id === 'hp')!.level,
      atk: newStatsArray.find(s => s.id === 'atk')!.level,
      def: newStatsArray.find(s => s.id === 'def')!.level,
    };

    try {
      const { newCoins } = await upgradeUserStats(user.uid, upgradeCost, newStatsForFirestore);
      setGold(newCoins);
      onDataUpdated(newCoins, newStatsForFirestore);
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      setGold(oldGold);
      setStats(oldStats);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTimeout(() => setUpgradingId(null), 300);
    }
  }, [upgradingId, stats, gold, onDataUpdated]);

  // Các giá trị được tính toán (dùng useMemo để tối ưu)
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


  // Giá trị cuối cùng mà Provider sẽ cung cấp
  const value: UpgradeStatsContextType = {
    isLoading,
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

// --- TẠO CUSTOM HOOK ĐỂ DỄ DÀNG SỬ DỤNG ---
// SỬA ĐỔI: Thêm "export" vào đây
export const useUpgradeStats = () => {
  const context = useContext(UpgradeStatsContext);
  if (context === undefined) {
    throw new Error('useUpgradeStats must be used within a UpgradeStatsProvider');
  }
  return context;
};
// --- END OF FILE upgrade-context.tsx ---
