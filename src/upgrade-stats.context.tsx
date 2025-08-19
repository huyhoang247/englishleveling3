// --- START OF FILE upgrade-stats.context.tsx ---

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  ReactNode 
} from 'react';
import { useAnimateValue } from './ui/useAnimateValue.ts';
import { auth } from './firebase.js'; 
import { fetchOrCreateUserGameData, upgradeUserStats } from './gameDataService.ts';

// --- INTERFACES & TYPES ---
interface Stat {
  id: 'hp' | 'atk' | 'def';
  name: string;
  level: number;
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

interface IUpgradeStatsContext {
  isLoading: boolean;
  stats: Stat[];
  animatedGold: number;
  message: ReactNode;
  upgradingId: string | null;
  toastData: ToastData | null;
  totalHp: number;
  totalAtk: number;
  totalDef: number;
  prestigeLevel: number;
  totalLevels: number;
  currentProgress: number;
  progressPercent: number;
  handleUpgrade: (statId: string) => Promise<void>;
}

// --- CONFIG (có thể được export nếu cần ở nơi khác) ---
// (Bạn có thể giữ các config và icon ở file cũ và import vào đây, hoặc chuyển hẳn sang đây)
import { uiAssets } from './game-assets.ts';
const icons = {
  coin: ( <img src={uiAssets.statCoinIcon} alt="Gold Coin Icon" /> ),
  heart: ( <img src={uiAssets.statHpIcon} alt="HP Icon" /> ),
  sword: ( <img src={uiAssets.statAtkIcon} alt="ATK Icon" /> ),
  shield: ( <img src={uiAssets.statDefIcon} alt="DEF Icon" /> )
};
export const statConfig = {
  hp: { name: 'HP', icon: icons.heart, baseUpgradeBonus: 50, color: "from-red-600 to-pink-600", toastColors: { border: 'border-pink-500', text: 'text-pink-400' } },
  atk: { name: 'ATK', icon: icons.sword, baseUpgradeBonus: 5, color: "from-sky-500 to-cyan-500", toastColors: { border: 'border-cyan-400', text: 'text-cyan-300' } },
  def: { name: 'DEF', icon: icons.shield, baseUpgradeBonus: 5, color: "from-blue-500 to-indigo-500", toastColors: { border: 'border-blue-400', text: 'text-blue-300' } },
};
export const calculateUpgradeCost = (level: number) => { const baseCost = 100; const tier = Math.floor(level / 10); return baseCost * Math.pow(2, tier); };
export const getBonusForLevel = (level: number, baseBonus: number) => { if (level === 0) return 0; const tier = Math.floor((level - 1) / 10); return baseBonus * Math.pow(2, tier); };
export const calculateTotalStatValue = (currentLevel: number, baseBonus: number) => { if (currentLevel === 0) return 0; let totalValue = 0; const fullTiers = Math.floor(currentLevel / 10); const remainingLevelsInCurrentTier = currentLevel % 10; for (let i = 0; i < fullTiers; i++) { const bonusInTier = baseBonus * Math.pow(2, i); totalValue += 10 * bonusInTier; } const bonusInCurrentTier = baseBonus * Math.pow(2, fullTiers); totalValue += remainingLevelsInCurrentTier * bonusInCurrentTier; return totalValue; };

// --- CONTEXT CREATION ---
const UpgradeStatsContext = createContext<IUpgradeStatsContext | null>(null);

// --- CUSTOM HOOK ---
export const useUpgradeStats = () => {
  const context = useContext(UpgradeStatsContext);
  if (!context) {
    throw new Error('useUpgradeStats must be used within a UpgradeStatsProvider');
  }
  return context;
};

// --- PROVIDER COMPONENT ---
interface UpgradeStatsProviderProps {
  children: ReactNode;
  onDataUpdated: (newCoins: number, newStats: { hp: number; atk: number; def: number; }) => void;
}

export const UpgradeStatsProvider = ({ children, onDataUpdated }: UpgradeStatsProviderProps) => {
  const [targetGold, setTargetGold] = useState(0);
  const animatedGold = useAnimateValue(targetGold, 400);
  const [stats, setStats] = useState<Stat[]>([
    { id: 'hp', level: 0, ...statConfig.hp },
    { id: 'atk', level: 0, ...statConfig.atk },
    { id: 'def', level: 0, ...statConfig.def },
  ]);
  const [message, setMessage] = useState<ReactNode>('');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Lỗi: Người dùng chưa đăng nhập.");
        setIsLoading(false);
        return;
      }
      try {
        const gameData = await fetchOrCreateUserGameData(user.uid);
        setTargetGold(gameData.coins);
        setStats([
          { id: 'hp', level: gameData.stats.hp || 0, ...statConfig.hp },
          { id: 'atk', level: gameData.stats.atk || 0, ...statConfig.atk },
          { id: 'def', level: gameData.stats.def || 0, ...statConfig.def },
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
        setMessage("Không thể tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpgrade = useCallback(async (statId: string) => {
    const user = auth.currentUser;
    if (upgradingId || !user) return;

    const statToUpgrade = stats.find(s => s.id === statId);
    if (!statToUpgrade) return;

    const upgradeCost = calculateUpgradeCost(statToUpgrade.level);
    if (targetGold < upgradeCost) {
      setMessage(
        <div className="flex items-center justify-center gap-1.5">
            <span>Not enough</span>
            <div className="w-5 h-5">{icons.coin}</div>
        </div>
      );
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
      const { newCoins } = await upgradeUserStats(user.uid, upgradeCost, newStatsForFirestore);
      setTargetGold(newCoins);
      onDataUpdated(newCoins, newStatsForFirestore);
    } catch (error) {
      console.error("Nâng cấp thất bại, đang khôi phục giao diện.", error);
      setMessage('Nâng cấp thất bại, vui lòng thử lại!');
      setTargetGold(oldGold);
      setStats(oldStats);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTimeout(() => setUpgradingId(null), 300); 
    }
  }, [upgradingId, stats, targetGold, onDataUpdated]);

  // --- DERIVED STATE (Tính toán một lần và truyền đi) ---
  const totalHp = calculateTotalStatValue(stats.find(s => s.id === 'hp')!.level, statConfig.hp.baseUpgradeBonus);
  const totalAtk = calculateTotalStatValue(stats.find(s => s.id === 'atk')!.level, statConfig.atk.baseUpgradeBonus);
  const totalDef = calculateTotalStatValue(stats.find(s => s.id === 'def')!.level, statConfig.def.baseUpgradeBonus);
  const totalLevels = stats.reduce((sum, stat) => sum + stat.level, 0);
  const maxProgress = 50;
  const prestigeLevel = Math.floor(totalLevels / maxProgress);
  const currentProgress = totalLevels % maxProgress;
  const progressPercent = (currentProgress / maxProgress) * 100;

  const value = {
    isLoading,
    stats,
    animatedGold,
    message,
    upgradingId,
    toastData,
    totalHp,
    totalAtk,
    totalDef,
    prestigeLevel,
    totalLevels,
    currentProgress,
    progressPercent,
    handleUpgrade,
  };

  return <UpgradeStatsContext.Provider value={value}>{children}</UpgradeStatsContext.Provider>;
};
