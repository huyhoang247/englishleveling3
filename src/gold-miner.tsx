import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js';
import MinerManagementSection from './miner/thomo.tsx';

// --- INTERFACES ---
interface GoldMineProps {
  onClose: () => void;
  currentCoins: number;
  onUpdateCoins: (amount: number) => Promise<void>;
  onUpdateDisplayedCoins: (amount: number) => void;
  currentUserId: string;
  isGamePaused: boolean;
}

interface MinerTypeConfig {
  id: 'basic' | 'advanced' | 'master';
  name: string;
  description: string;
  baseCost: number;
  baseRate: number;
  icon: React.FC<any>;
  levelUpCostBase: number;
  levelUpCostScaling: number;
  miningRateBonusPerLevel: number;
  sellValueBaseFactor: number;
  sellValueLevelBonusFactor: number;
}

interface MinerInstance {
  instanceId: string;
  typeId: 'basic' | 'advanced' | 'master';
  level: number;
}

// --- SVG ICONS ---
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const CoinIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} {...props} >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <path d="M12 6c-1.028 0-1.96.491-2.567 1.296A3.942 3.942 0 008.5 9c0 .978.357 1.859.933 2.533.667.768 1.592 1.267 2.567 1.267.975 0 1.899-.5 2.567-1.267.576-.674.933-1.555.933-2.533a3.94 3.94 0 00-.933-1.704C13.96 6.491 13.028 6 12 6zm0 5.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75.75.336.75.75-.336.75-.75.75z" />
  </svg>
);
const MinersIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const AdvancedMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);
const MasterMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m2 16 20-10-4 12L6 14l-4 2z"/><path d="m6 16 2 2 4-4"/>
  </svg>
);

// --- CONSTANTS ---
const MAX_MINER_LEVEL = 100;
const SAVE_DATA_INTERVAL = 15000; // Save data every 15 seconds

const MINER_TYPES_CONFIG: MinerTypeConfig[] = [
  { id: 'basic', name: 'Thợ Mỏ Cơ Bản', description: 'Người bạn đồng hành đầu tiên, khai thác ổn định.', baseCost: 100, baseRate: 0.1, icon: MinersIcon, levelUpCostBase: 20, levelUpCostScaling: 1.18, miningRateBonusPerLevel: 0.025, sellValueBaseFactor: 0.4, sellValueLevelBonusFactor: 0.01 },
  { id: 'advanced', name: 'Thợ Mỏ Cao Cấp', description: 'Khai thác nhanh hơn với kỹ năng vượt trội.', baseCost: 750, baseRate: 0.6, icon: AdvancedMinerIcon, levelUpCostBase: 150, levelUpCostScaling: 1.22, miningRateBonusPerLevel: 0.15, sellValueBaseFactor: 0.45, sellValueLevelBonusFactor: 0.012 },
  { id: 'master', name: 'Thợ Mỏ Bậc Thầy', description: 'Chuyên gia khai thác, hiệu suất đỉnh cao.', baseCost: 5000, baseRate: 3.5, icon: MasterMinerIcon, levelUpCostBase: 1000, levelUpCostScaling: 1.28, miningRateBonusPerLevel: 0.8, sellValueBaseFactor: 0.5, sellValueLevelBonusFactor: 0.015 },
];

// --- MODAL COMPONENT ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="relative bg-slate-900 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto border border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 border-b border-slate-600 pb-2">{title}</h2>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors text-gray-300" aria-label="Đóng">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        {children}
      </div>
    </div>
  );
};

// --- GOLDMINE COMPONENT ---
const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, onUpdateDisplayedCoins, currentUserId, isGamePaused }) => {
  const [minedGold, setMinedGold] = useState(0);
  const [individualMiners, setIndividualMiners] = useState<MinerInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isMinerManagementModalOpen, setIsMinerManagementModalOpen] = useState(false);

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const db = getFirestore();

  // --- UTILITY FUNCTIONS ---
  const calculateMinerRate = (miner: MinerInstance): number => {
    const typeConfig = MINER_TYPES_CONFIG.find(t => t.id === miner.typeId);
    if (!typeConfig) return 0;
    return typeConfig.baseRate + (miner.level - 1) * typeConfig.miningRateBonusPerLevel;
  };

  const getCurrentTotalMiningRate = () => {
    return individualMiners.reduce((total, miner) => total + calculateMinerRate(miner), 0);
  };

  const calculateLevelUpCost = (miner: MinerInstance): number => {
    const typeConfig = MINER_TYPES_CONFIG.find(t => t.id === miner.typeId);
    if (!typeConfig || miner.level >= MAX_MINER_LEVEL) return Infinity;
    return Math.floor(typeConfig.levelUpCostBase * Math.pow(typeConfig.levelUpCostScaling, miner.level - 1));
  };

  const calculateSellValue = (miner: MinerInstance): number => {
    const typeConfig = MINER_TYPES_CONFIG.find(t => t.id === miner.typeId);
    if (!typeConfig) return 0;
    const baseSell = typeConfig.baseCost * typeConfig.sellValueBaseFactor;
    const levelBonus = (miner.level - 1) * typeConfig.baseCost * typeConfig.sellValueLevelBonusFactor;
    return Math.floor(baseSell + levelBonus);
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {setMessage(''); setMessageType('');}, 3000);
  };

  // --- DATA HANDLING ---
  // Memoized save function to prevent re-creation if dependencies don't change
  const saveMineData = useCallback(async () => {
    if (!currentUserId || isLoading) return; // Don't save if not logged in or still loading initial data
    try {
      const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
      // Read current state values directly to ensure latest data is saved
      await setDoc(mineDocRef, {
        minedGold: Math.max(0, minedGoldRef.current), // Use ref for minedGold
        individualMiners: individualMinersRef.current, // Use ref for miners
        lastMineActivityTime: Date.now(),
      }, { merge: true });
      // console.log("GoldMine: Mine data saved via interval/cleanup.");
    } catch (error) {
      console.error("GoldMine: Error saving mine data:", error);
    }
  }, [currentUserId, db, isLoading]); // isLoading is included to prevent saving during initial load.

  // Refs to hold the latest state for saveMineData, avoiding stale closures
  const minedGoldRef = useRef(minedGold);
  const individualMinersRef = useRef(individualMiners);

  useEffect(() => {
    minedGoldRef.current = minedGold;
  }, [minedGold]);

  useEffect(() => {
    individualMinersRef.current = individualMiners;
  }, [individualMiners]);


  useEffect(() => {
    const fetchMineData = async () => {
      if (!currentUserId) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const mineDocSnap = await getDoc(mineDocRef);
        let initialMinedGold = 0;
        let initialMiners: MinerInstance[] = [];
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialMiners = Array.isArray(data.individualMiners) ? data.individualMiners : [];
          lastMineActivityTime = data.lastMineActivityTime || 0;

          if (initialMiners.length > 0 && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = Math.max(0, timeElapsedMs / 1000);
            const offlineMiningRate = initialMiners.reduce((total, miner) => total + calculateMinerRate(miner), 0);
            const goldAccumulatedOffline = offlineMiningRate * timeElapsedSeconds;
            initialMinedGold += goldAccumulatedOffline;
          }
        } else {
          await setDoc(mineDocRef, { minedGold: 0, individualMiners: [], lastMineActivityTime: Date.now(), createdAt: new Date() });
        }
        setMinedGold(Math.max(0, initialMinedGold));
        setIndividualMiners(initialMiners);
        // Initial save after calculating offline gold
        if (auth.currentUser) { // Ensure user is available for refs
            minedGoldRef.current = Math.max(0, initialMinedGold);
            individualMinersRef.current = initialMiners;
            saveMineData();
        }

      } catch (error) {
        console.error("GoldMine: Error fetching/initializing gold mine data:", error);
        showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMineData();
  }, [currentUserId, db]); // Removed saveMineData from here, it's called explicitly after fetch.

  // Mining interval effect
  useEffect(() => {
    if (isGamePaused || isLoading || individualMiners.length === 0) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
      }
      return;
    }

    if (miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => prevGold + getCurrentTotalMiningRate());
      }, 1000);
    }

    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
      }
    };
  }, [individualMiners, isGamePaused, isLoading]); // Removed db, minedGold. getCurrentTotalMiningRate depends on individualMiners.

  // Save data interval effect
  useEffect(() => {
    if (isGamePaused || isLoading) {
        if (saveDataIntervalRef.current) {
            clearInterval(saveDataIntervalRef.current);
            saveDataIntervalRef.current = null;
        }
        return;
    }

    // Start saving data periodically if not paused and not loading
    if (!saveDataIntervalRef.current) {
        saveDataIntervalRef.current = setInterval(() => {
            saveMineData();
        }, SAVE_DATA_INTERVAL);
    }
    
    // Cleanup function to clear interval and save one last time
    return () => {
      if (saveDataIntervalRef.current) {
        clearInterval(saveDataIntervalRef.current);
        saveDataIntervalRef.current = null;
      }
      saveMineData(); // Save on unmount or when dependencies change significantly
    };
  }, [isGamePaused, isLoading, saveMineData]);


  // --- MINER ACTIONS ---
  const handleHireNewMiner = async (typeId: 'basic' | 'advanced' | 'master') => {
    const minerTypeConfig = MINER_TYPES_CONFIG.find(m => m.id === typeId);
    if (!minerTypeConfig) return;
    if (currentCoins < minerTypeConfig.baseCost) { showMessage(`Không đủ vàng để thuê ${minerTypeConfig.name}!`, "error"); return; }
    if (!currentUserId) return;

    const newMinerInstance: MinerInstance = { instanceId: crypto.randomUUID(), typeId: typeId, level: 1 };

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);
        if (!userDocSnap.exists()) throw new Error("Dữ liệu người dùng không tồn tại.");
        const currentMainCoins = userDocSnap.data()?.coins || 0;
        if (currentMainCoins < minerTypeConfig.baseCost) throw new Error("Không đủ vàng (kiểm tra lại).");
        const currentMinersInDb: MinerInstance[] = mineDocSnap.exists() && Array.isArray(mineDocSnap.data()?.individualMiners) ? mineDocSnap.data()?.individualMiners : [];
        const updatedMiners = [...currentMinersInDb, newMinerInstance];
        transaction.update(userDocRef, { coins: currentMainCoins - minerTypeConfig.baseCost });
        transaction.set(mineDocRef, { individualMiners: updatedMiners, minedGold: mineDocSnap.exists() ? (mineDocSnap.data()?.minedGold || 0) : 0, lastMineActivityTime: Date.now() }, { merge: true });
        
        setIndividualMiners(updatedMiners); // Update local state
        individualMinersRef.current = updatedMiners; // Update ref
        onUpdateCoins(-minerTypeConfig.baseCost);
        onUpdateDisplayedCoins(currentCoins - minerTypeConfig.baseCost);
        showMessage(`Đã thuê ${minerTypeConfig.name} (Level 1) thành công!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thuê thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thuê thợ mỏ."}`, "error");
    }
  };

  const handleLevelUpSpecificMiner = async (instanceId: string) => {
    const minerToUpdate = individualMiners.find(m => m.instanceId === instanceId);
    if (!minerToUpdate) { showMessage("Không tìm thấy thợ mỏ này!", "error"); return; }
    if (minerToUpdate.level >= MAX_MINER_LEVEL) { showMessage("Thợ mỏ đã đạt cấp tối đa!", "error"); return; }
    const cost = calculateLevelUpCost(minerToUpdate);
    if (currentCoins < cost) { showMessage("Không đủ vàng để nâng cấp!", "error"); return; }
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);
        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
        const currentMainCoins = userDocSnap.data().coins || 0;
        if (currentMainCoins < cost) throw new Error("Không đủ vàng (kiểm tra lại).");
        const currentMinersInDb: MinerInstance[] = Array.isArray(mineDocSnap.data()?.individualMiners) ? mineDocSnap.data()?.individualMiners : [];
        const updatedMiners = currentMinersInDb.map(m => m.instanceId === instanceId ? { ...m, level: m.level + 1 } : m);
        const minerName = MINER_TYPES_CONFIG.find(mt => mt.id === minerToUpdate.typeId)?.name || "Thợ mỏ";
        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.set(mineDocRef, { individualMiners: updatedMiners, minedGold: mineDocSnap.data()?.minedGold || 0, lastMineActivityTime: Date.now() }, { merge: true });

        setIndividualMiners(updatedMiners); // Update local state
        individualMinersRef.current = updatedMiners; // Update ref
        onUpdateCoins(-cost);
        onUpdateDisplayedCoins(currentCoins - cost);
        showMessage(`${minerName} đã lên cấp ${minerToUpdate.level + 1}!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi nâng cấp thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể nâng cấp."}`, "error");
    }
  };

  const handleSellSpecificMiner = async (instanceId: string) => {
    const minerToSell = individualMiners.find(m => m.instanceId === instanceId);
    if (!minerToSell) { showMessage("Không tìm thấy thợ mỏ này!", "error"); return; }
    const sellValue = calculateSellValue(minerToSell);
    if (!currentUserId) return;
    const minerName = MINER_TYPES_CONFIG.find(mt => mt.id === minerToSell.typeId)?.name || "Thợ mỏ";

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);
        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentMinersInDb: MinerInstance[] = Array.isArray(mineDocSnap.data()?.individualMiners) ? mineDocSnap.data()?.individualMiners : [];
        const updatedMiners = currentMinersInDb.filter(m => m.instanceId !== instanceId);
        transaction.update(userDocRef, { coins: currentMainCoins + sellValue });
        transaction.set(mineDocRef, { individualMiners: updatedMiners, minedGold: mineDocSnap.data()?.minedGold || 0, lastMineActivityTime: Date.now() }, { merge: true });

        setIndividualMiners(updatedMiners); // Update local state
        individualMinersRef.current = updatedMiners; // Update ref
        onUpdateCoins(sellValue);
        onUpdateDisplayedCoins(currentCoins + sellValue);
        showMessage(`Đã bán ${minerName}, nhận được ${sellValue} vàng!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi bán thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể bán thợ mỏ."}`, "error");
    }
  };

  // --- GOLD COLLECTION ---
  const handleCollectGold = async () => {
    if (minedGold <= 0) { showMessage("Không có vàng để thu thập!", "error"); return; }
    if (!currentUserId) return;
    const goldToCollect = Math.floor(minedGold);

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);
        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentMinersInDb = Array.isArray(mineDocSnap.data()?.individualMiners) ? mineDocSnap.data()?.individualMiners : [];
        transaction.update(userDocRef, { coins: currentMainCoins + goldToCollect });
        const remainingFractionalGold = Math.max(0, minedGoldRef.current - goldToCollect); // Use ref
        transaction.set(mineDocRef, { minedGold: remainingFractionalGold, individualMiners: currentMinersInDb, lastMineActivityTime: Date.now() }, { merge: true });

        setMinedGold(remainingFractionalGold); // Update local state
        // minedGoldRef.current = remainingFractionalGold; // Ref updated by its own useEffect
        onUpdateCoins(goldToCollect);
        onUpdateDisplayedCoins(currentCoins + goldToCollect);
        showMessage(`Đã thu thập ${goldToCollect} vàng!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thu thập vàng:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thu thập vàng."}`, "error");
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-yellow-400 rounded-lg text-xl font-semibold">
        <PickaxeIcon className="animate-spin mr-3" size={32} /> Đang tải dữ liệu mỏ vàng...
      </div>
    );
  }

  const totalMiningRate = getCurrentTotalMiningRate();
  const totalMinersCount = individualMiners.length;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-gradient-to-b from-slate-800 to-slate-950 text-gray-200 p-3 sm:p-6 rounded-lg shadow-2xl overflow-y-auto">
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" width="100%" height="100%">
        <defs><pattern id="rockPatternGM" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="scale(1) rotate(45)"><path d="M0 30 Q15 0 30 30 Q45 60 60 30 Q45 0 30 30 Q15 60 0 30" stroke="#4A5568" strokeWidth="0.5" fill="transparent" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#rockPatternGM)" />
      </svg>
      <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors z-20" aria-label="Đóng">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)] z-10 flex items-center">
        <PickaxeIcon size={30} className="inline-block mr-2 -mt-1 sm:size-9" color="orange" /> Mỏ Vàng Bất Tận
      </h2>
      {message && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold z-[100] shadow-lg ${messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{message}</div>
      )}
      <div className="w-full max-w-lg z-10 space-y-4 sm:space-y-5">
        <div className="bg-slate-800/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-2 sm:mb-3 border-b border-slate-600 pb-2">Thông Tin Mỏ</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-base">
            <div className="flex items-center space-x-1.5 sm:space-x-2"><MinersIcon size={18} className="sm:size-5 text-blue-400" /><span>Tổng thợ mỏ:</span><span className="font-bold text-md sm:text-lg text-white">{totalMinersCount}</span></div>
            <div className="col-span-2 flex items-center space-x-1.5 sm:space-x-2"><PickaxeIcon size={18} className="sm:size-5 text-orange-400" /><span>Tổng tốc độ:</span><span className="font-bold text-md sm:text-lg text-yellow-400">{totalMiningRate.toFixed(2)} vàng/s</span></div>
          </div>
        </div>
        <button onClick={() => setIsMinerManagementModalOpen(true)} className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-md sm:text-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2">
          <MinersIcon size={20} className="sm:size-6" /><span>Quản Lý Thợ Mỏ</span>
        </button>
        <div className="bg-slate-800/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-lg border border-slate-700">
          <div className="flex flex-col items-center mb-3 sm:mb-4">
            <p className="text-sm sm:text-base text-gray-300 mb-1">Vàng đã khai thác</p>
            <div className="flex items-center space-x-2 text-yellow-300">
              <CoinIcon size={28} className="sm:size-8" color="gold" />
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold drop-shadow-md animate-pulse">{Math.floor(minedGold).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={handleCollectGold} disabled={minedGold < 1} className={`w-full py-2.5 sm:py-3 rounded-lg font-bold text-md sm:text-lg transition-all duration-200 ${minedGold < 1 ? 'bg-slate-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'}`}>Thu Thập Vàng</button>
        </div>
      </div>
      <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 z-10">Số vàng bạn có:<span className="font-bold text-yellow-300 ml-1">{currentCoins.toLocaleString()} <CoinIcon size={12} className="inline -mt-px sm:size-3.5" color="gold" /></span></p>
      <Modal isOpen={isMinerManagementModalOpen} onClose={() => setIsMinerManagementModalOpen(false)} title="Quản Lý Thợ Mỏ">
        <MinerManagementSection minerConfigs={MINER_TYPES_CONFIG} ownedMiners={individualMiners} onHireMiner={handleHireNewMiner} onLevelUpMiner={handleLevelUpSpecificMiner} onSellMiner={handleSellSpecificMiner} currentCoins={currentCoins} CoinIcon={CoinIcon} calculateLevelUpCost={calculateLevelUpCost} calculateSellValue={calculateSellValue} calculateMinerRate={calculateMinerRate} MAX_MINER_LEVEL={MAX_MINER_LEVEL} />
      </Modal>
    </div>
  );
};

export default GoldMine;
