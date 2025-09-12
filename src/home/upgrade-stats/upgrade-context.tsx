// --- START OF FILE upgrade-context.tsx ---

// --- START OF FILE upgrade-stats-context.tsx ---

// SỬA ĐỔI: Thêm import useGame và bỏ import không cần thiết
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { auth } from '../../firebase.js';
// SỬA ĐỔI: Import useGame để lấy dữ liệu từ context cha
import { useGame } from '../../GameContext.tsx'; 
import { upgradeUserStats } from './upgrade-service.ts';

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
// SỬA ĐỔI: Xóa prop onDataUpdated
interface UpgradeStatsProviderProps {
  children: ReactNode;
}

// SỬA ĐỔI: Xóa prop onDataUpdated khỏi signature
export function UpgradeStatsProvider({ children }: UpgradeStatsProviderProps) {
  // SỬA ĐỔI: Lấy dữ liệu chính từ GameContext thay vì fetch riêng
  const { coins, userStats, isLoadingUserData } = useGame();

  // State cục bộ để thực hiện optimistic updates. Dữ liệu sẽ được đồng bộ từ GameContext.
  const [gold, setGold] = useState(0);
  const [stats, setStats] = useState<Stat[]>([
    { id: 'hp', level: 0, ...statConfig.hp },
    { id: 'atk', level: 0, ...statConfig.atk },
    { id: 'def', level: 0, ...statConfig.def },
  ]);

  const [message, setMessage] = useState<ReactNode>('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // SỬA ĐỔI: Bỏ useEffect fetch dữ liệu ban đầu, thay bằng useEffect để đồng bộ state từ GameContext
  useEffect(() => {
    // Đồng bộ state cục bộ của component này với state từ GameContext.
    // Điều này đảm bảo component luôn hiển thị dữ liệu mới nhất khi nó thay đổi từ bất kỳ nguồn nào khác.
    if (!isLoadingUserData) {
        setGold(coins);
        setStats([
            { id: 'hp', level: userStats.hp || 0, ...statConfig.hp },
            { id: 'atk', level: userStats.atk || 0, ...statConfig.atk },
            { id: 'def', level: userStats.def || 0, ...statConfig.def },
        ]);
    }
  }, [coins, userStats, isLoadingUserData]);

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

    // Cập nhật lạc quan (Optimistic Update) trên state cục bộ để UI phản hồi ngay lập tức
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
      // SỬA ĐỔI: Chỉ cần gọi service để cập nhật DB. GameContext sẽ tự nhận thay đổi qua onSnapshot.
      await upgradeUserStats(user.uid, upgradeCost, newStatsForFirestore);
      // Không cần gọi onDataUpdated hay setGold ở đây nữa.
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      // Rollback lại state cục bộ nếu có lỗi
      setGold(oldGold);
      setStats(oldStats);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTimeout(() => setUpgradingId(null), 300);
    }
  }, [upgradingId, stats, gold]); // SỬA ĐỔI: Bỏ onDataUpdated khỏi dependency array

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
    // SỬA ĐỔI: Dùng isLoading từ GameContext
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

// --- TẠO CUSTOM HOOK ĐỂ DỄ DÀNG SỬ DỤNG ---
export const useUpgradeStats = () => {
  const context = useContext(UpgradeStatsContext);
  if (context === undefined) {
    throw new Error('useUpgradeStats must be used within a UpgradeStatsProvider');
  }
  return context;
};
// --- END OF FILE upgrade-context.tsx ---
