// GoldMine.tsx

import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js';
import MinerHiringSection from './miner/thomo.tsx'; // Correct import

// ... (SVG Icons: PickaxeIcon, CoinIcon, MinersIcon, UpgradeIcon, AdvancedMinerIcon, MasterMinerIcon - keep these as they are) ...
// ... (Modal component - keep as is) ...

interface GoldMineProps {
  onClose: () => void;
  currentCoins: number;
  onUpdateCoins: (amount: number) => Promise<void>;
  onUpdateDisplayedCoins: (amount: number) => void;
  currentUserId: string;
  isGamePaused: boolean;
}

const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, onUpdateDisplayedCoins, currentUserId, isGamePaused }) => {
  const [minedGold, setMinedGold] = useState(0);
  const [basicMiners, setBasicMiners] = useState(0);
  const [advancedMiners, setAdvancedMiners] = useState(0);
  const [masterMiners, setMasterMiners] = useState(0);
  const [minerEfficiencyLevel, setMinerEfficiencyLevel] = useState(0); // Global efficiency

  // State for individual miner type levels
  const [basicMinerLevel, setBasicMinerLevel] = useState(0);
  const [advancedMinerLevel, setAdvancedMinerLevel] = useState(0);
  const [masterMinerLevel, setMasterMinerLevel] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isMinerHiringModalOpen, setIsMinerHiringModalOpen] = useState(false);

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const db = getFirestore();

  // Game Balance Constants
  const EFFICIENCY_BONUS_PER_LEVEL = 0.02; // Global bonus per efficiency level
  const UPGRADE_EFFICIENCY_BASE_COST = 100;
  const UPGRADE_EFFICIENCY_COST_SCALING_FACTOR = 1.8;

  // Define BASE miner configurations (static part)
  const BASE_MINER_CONFIG = [
    {
      id: 'basic',
      name: 'Thợ Mỏ Cơ Bản',
      description: 'Tăng sản lượng vàng ổn định.',
      baseCost: 200,
      baseRate: 0.05,
      iconName: 'basic' as 'basic' | 'advanced' | 'master',
      maxLevel: 10,
      rateIncreasePerLevel: 0.01, // Gold/s increase per THIS miner type's level
      upgradeCostBase: 50,
      upgradeCostScaling: 1.5,
      sellPriceRatio: 0.5, // Sells for 50% of baseCost
    },
    {
      id: 'advanced',
      name: 'Thợ Mỏ Cao Cấp',
      description: 'Khai thác vàng nhanh hơn đáng kể.',
      baseCost: 1500,
      baseRate: 0.3,
      iconName: 'advanced' as 'basic' | 'advanced' | 'master',
      maxLevel: 15,
      rateIncreasePerLevel: 0.05,
      upgradeCostBase: 400,
      upgradeCostScaling: 1.6,
      sellPriceRatio: 0.5,
    },
    {
      id: 'master',
      name: 'Thợ Mỏ Bậc Thầy',
      description: 'Bậc thầy khai thác, hiệu suất cực cao.',
      baseCost: 8000,
      baseRate: 1.5,
      iconName: 'master' as 'basic' | 'advanced' | 'master',
      maxLevel: 20,
      rateIncreasePerLevel: 0.2,
      upgradeCostBase: 2000,
      upgradeCostScaling: 1.7,
      sellPriceRatio: 0.5,
    },
  ];

  // Helper to calculate upgrade cost for a specific miner type
  const getMinerTypeUpgradeCost = (minerConfig: typeof BASE_MINER_CONFIG[0], currentLevel: number): number => {
    if (currentLevel >= minerConfig.maxLevel) return Infinity;
    return Math.floor(minerConfig.upgradeCostBase * Math.pow(minerConfig.upgradeCostScaling, currentLevel));
  };

  // Derive the data for the MinerHiringSection modal
  const minerTypesDataForModal = BASE_MINER_CONFIG.map(config => {
    let count = 0;
    let level = 0;
    if (config.id === 'basic') { count = basicMiners; level = basicMinerLevel; }
    else if (config.id === 'advanced') { count = advancedMiners; level = advancedMinerLevel; }
    else if (config.id === 'master') { count = masterMiners; level = masterMinerLevel; }

    return {
      ...config,
      count,
      level,
      currentUpgradeCost: getMinerTypeUpgradeCost(config, level),
      sellPrice: Math.floor(config.baseCost * config.sellPriceRatio),
    };
  });

  const showMessage = (msg: string, type: 'success' | 'error') => { /* ... (keep as is) ... */ };

  const saveMineData = async (
    currentMinedGold: number,
    currentBasicMiners: number, currentAdvancedMiners: number, currentMasterMiners: number,
    currentEfficiencyLevel: number,
    currentBasicLvl: number, currentAdvancedLvl: number, currentMasterLvl: number // Added levels
  ) => {
    if (!currentUserId) return;
    try {
      const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
      await setDoc(mineDocRef, {
        minedGold: Math.max(0, currentMinedGold),
        basicMiners: currentBasicMiners,
        advancedMiners: currentAdvancedMiners,
        masterMiners: currentMasterMiners,
        minerEfficiencyLevel: currentEfficiencyLevel,
        minerLevels: { // Store levels in a map
          basic: currentBasicLvl,
          advanced: currentAdvancedLvl,
          master: currentMasterLvl,
        },
        lastMineActivityTime: Date.now(),
      }, { merge: true });
    } catch (error) {
      console.error("GoldMine: Error saving mine data:", error);
    }
  };

  // --- useEffect to fetchMineData ---
  useEffect(() => {
    const fetchMineData = async () => {
      if (!currentUserId) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const mineDocSnap = await getDoc(mineDocRef);

        let initialMinedGold = 0;
        let initialBasicMiners = 0;
        let initialAdvancedMiners = 0;
        let initialMasterMiners = 0;
        let initialEfficiencyLevel = 0;
        let initialBasicLevel = 0;
        let initialAdvancedLevel = 0;
        let initialMasterLevel = 0;
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialBasicMiners = data.basicMiners || data.miners || 0;
          initialAdvancedMiners = data.advancedMiners || 0;
          initialMasterMiners = data.masterMiners || 0;
          initialEfficiencyLevel = data.minerEfficiencyLevel || 0;
          initialBasicLevel = data.minerLevels?.basic || 0;
          initialAdvancedLevel = data.minerLevels?.advanced || 0;
          initialMasterLevel = data.minerLevels?.master || 0;
          lastMineActivityTime = data.lastMineActivityTime || 0;

          // Offline gold calculation needs to use new structure
          if ((initialBasicMiners > 0 || initialAdvancedMiners > 0 || initialMasterMiners > 0) && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = Math.max(0, timeElapsedMs / 1000);
            
            let offlineMiningRate = 0;
            const tempMinerData = [
                { config: BASE_MINER_CONFIG[0], count: initialBasicMiners, level: initialBasicLevel },
                { config: BASE_MINER_CONFIG[1], count: initialAdvancedMiners, level: initialAdvancedLevel },
                { config: BASE_MINER_CONFIG[2], count: initialMasterMiners, level: initialMasterLevel },
            ];

            tempMinerData.forEach(miner => {
                if (miner.count > 0) {
                    const ratePerMinerFromTypeLevel = miner.level * miner.config.rateIncreasePerLevel;
                    const ratePerMinerFromGlobalEfficiency = initialEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL;
                    const actualRatePerMiner = miner.config.baseRate + ratePerMinerFromTypeLevel + ratePerMinerFromGlobalEfficiency;
                    offlineMiningRate += miner.count * actualRatePerMiner;
                }
            });
            
            const goldAccumulatedOffline = offlineMiningRate * timeElapsedSeconds;
            initialMinedGold += goldAccumulatedOffline;
            console.log(`GoldMine: Accumulated ${goldAccumulatedOffline.toFixed(2)} gold offline over ${timeElapsedSeconds.toFixed(0)}s. Rate: ${offlineMiningRate.toFixed(2)}/s`);
          }
        } else {
          // Initialize with levels
          await setDoc(mineDocRef, {
            minedGold: 0, basicMiners: 0, advancedMiners: 0, masterMiners: 0,
            minerEfficiencyLevel: 0,
            minerLevels: { basic: 0, advanced: 0, master: 0 },
            lastMineActivityTime: Date.now(), createdAt: new Date()
          });
        }

        setMinedGold(Math.max(0, initialMinedGold));
        setBasicMiners(initialBasicMiners);
        setAdvancedMiners(initialAdvancedMiners);
        setMasterMiners(initialMasterMiners);
        setMinerEfficiencyLevel(initialEfficiencyLevel);
        setBasicMinerLevel(initialBasicLevel);
        setAdvancedMinerLevel(initialAdvancedLevel);
        setMasterMinerLevel(initialMasterLevel);
        
        saveMineData(initialMinedGold, initialBasicMiners, initialAdvancedMiners, initialMasterMiners, initialEfficiencyLevel, initialBasicLevel, initialAdvancedLevel, initialMasterLevel);
      } catch (error) {
        console.error("GoldMine: Error fetching/initializing gold mine data:", error);
        showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMineData();
  }, [currentUserId, db]); // EFFICIENCY_BONUS_PER_LEVEL, BASE_MINER_CONFIG can be added if they change, but they are consts here

  // --- getCurrentMiningRate (Updated) ---
  const getCurrentMiningRate = () => {
    let totalRate = 0;
    minerTypesDataForModal.forEach(miner => { // Use the derived data
      if (miner.count > 0) {
        const ratePerMinerFromTypeLevel = miner.level * miner.rateIncreasePerLevel;
        const ratePerMinerFromGlobalEfficiency = minerEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL;
        const actualRatePerMiner = miner.baseRate + ratePerMinerFromTypeLevel + ratePerMinerFromGlobalEfficiency;
        totalRate += miner.count * actualRatePerMiner;
      }
    });
    return totalRate;
  };
  
  // --- useEffect for mining interval ---
  useEffect(() => {
    const totalMiners = basicMiners + advancedMiners + masterMiners;

    if (isGamePaused || isLoading) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
      }
      return;
    }

    if (totalMiners > 0 && miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => {
          const rate = getCurrentMiningRate();
          const newGold = prevGold + rate;
          if (auth.currentUser && Math.random() < 0.1) { // Save approx every 10 seconds
            saveMineData(newGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
          }
          return newGold;
        });
      }, 1000);
    } else if (totalMiners === 0 && miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
      saveMineData(minedGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
    }

    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
      }
    };
  }, [basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel, basicMinerLevel, advancedMinerLevel, masterMinerLevel, isGamePaused, isLoading, db, minedGold]); // Added level dependencies


  // --- handleHireMiner (mostly same, ensure it saves all data) ---
  const handleHireMiner = async (minerId: string) => {
    const minerType = minerTypesDataForModal.find(m => m.id === minerId); // Use derived data
    if (!minerType) return;

    if (currentCoins < minerType.baseCost) { /* ... (keep as is) ... */ return; }
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        // ... (transaction logic, make sure to fetch and update all relevant fields from mineDoc)
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
        
        const currentMainCoins = userDocSnap.data().coins || 0;
        if (currentMainCoins < minerType.baseCost) throw new Error("Không đủ vàng.");

        const mineData = mineDocSnap.data();
        transaction.update(userDocRef, { coins: currentMainCoins - minerType.baseCost });

        const updatedMinerCounts = {
          basicMiners: mineData.basicMiners || 0,
          advancedMiners: mineData.advancedMiners || 0,
          masterMiners: mineData.masterMiners || 0,
        };
        if (minerId === 'basic') updatedMinerCounts.basicMiners += 1;
        else if (minerId === 'advanced') updatedMinerCounts.advancedMiners += 1;
        else if (minerId === 'master') updatedMinerCounts.masterMiners += 1;

        transaction.update(mineDocRef, {
          ...updatedMinerCounts,
          minedGold: Math.max(0, mineData.minedGold || 0),
          minerEfficiencyLevel: mineData.minerEfficiencyLevel || 0,
          minerLevels: mineData.minerLevels || { basic: 0, advanced: 0, master: 0 },
          lastMineActivityTime: Date.now(),
        });

        if (minerId === 'basic') setBasicMiners(prev => prev + 1);
        else if (minerId === 'advanced') setAdvancedMiners(prev => prev + 1);
        else if (minerId === 'master') setMasterMiners(prev => prev + 1);

        onUpdateCoins(-minerType.baseCost);
        onUpdateDisplayedCoins(currentCoins - minerType.baseCost);
        showMessage(`Đã thuê ${minerType.name} thành công!`, "success");
      });
    } catch (error: any) { /* ... (keep as is) ... */ }
  };

  // --- handleUpgradeEfficiency (mostly same, ensure it saves all data) ---
  const handleUpgradeEfficiency = async () => {
    const cost = getCurrentUpgradeCost(); // Ensure this function is defined or use the constant directly
    if (currentCoins < cost) { /* ... */ return; }
    if (!currentUserId) return;
    try {
      await runTransaction(db, async (transaction) => {
         const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
        
        const currentMainCoins = userDocSnap.data().coins || 0;
        if (currentMainCoins < cost) throw new Error("Không đủ vàng.");

        const mineData = mineDocSnap.data();
        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.update(mineDocRef, {
          minerEfficiencyLevel: (mineData.minerEfficiencyLevel || 0) + 1,
          // Preserve other fields
          minedGold: Math.max(0, mineData.minedGold || 0),
          basicMiners: mineData.basicMiners || 0,
          advancedMiners: mineData.advancedMiners || 0,
          masterMiners: mineData.masterMiners || 0,
          minerLevels: mineData.minerLevels || { basic: 0, advanced: 0, master: 0 },
          lastMineActivityTime: Date.now(),
        });
        setMinerEfficiencyLevel(prev => prev + 1);
        onUpdateCoins(-cost);
        onUpdateDisplayedCoins(currentCoins - cost);
        showMessage("Nâng cấp hiệu suất thành công!", "success");
      });
    } catch (error: any) { /* ... */ }
  };
  const getCurrentUpgradeCost = () => { /* ... (keep as is) ... */ };


  // --- NEW: handleUpgradeMinerType ---
  const handleUpgradeMinerType = async (minerId: string) => {
    const minerData = minerTypesDataForModal.find(m => m.id === minerId);
    if (!minerData) return;

    if (minerData.level >= minerData.maxLevel) {
      showMessage("Đã đạt cấp tối đa!", "error");
      return;
    }
    const cost = minerData.currentUpgradeCost;
    if (currentCoins < cost) {
      showMessage(`Không đủ vàng để nâng cấp ${minerData.name}!`, "error");
      return;
    }
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
        
        const currentMainCoins = userDocSnap.data().coins || 0;
        if (currentMainCoins < cost) throw new Error("Không đủ vàng.");

        const mineData = mineDocSnap.data();
        const currentMinerLevels = mineData.minerLevels || { basic: 0, advanced: 0, master: 0 };
        const newLevel = (currentMinerLevels[minerId] || 0) + 1;
        currentMinerLevels[minerId] = newLevel;

        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.update(mineDocRef, {
          minerLevels: currentMinerLevels,
          // Preserve other fields
          minedGold: Math.max(0, mineData.minedGold || 0),
          basicMiners: mineData.basicMiners || 0,
          advancedMiners: mineData.advancedMiners || 0,
          masterMiners: mineData.masterMiners || 0,
          minerEfficiencyLevel: mineData.minerEfficiencyLevel || 0,
          lastMineActivityTime: Date.now(),
        });

        if (minerId === 'basic') setBasicMinerLevel(newLevel);
        else if (minerId === 'advanced') setAdvancedMinerLevel(newLevel);
        else if (minerId === 'master') setMasterMinerLevel(newLevel);

        onUpdateCoins(-cost);
        onUpdateDisplayedCoins(currentCoins - cost);
        showMessage(`${minerData.name} đã nâng cấp lên cấp ${newLevel}!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi nâng cấp loại thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể nâng cấp."}`, "error");
    }
  };

  // --- NEW: handleSellMiner ---
  const handleSellMiner = async (minerId: string) => {
    const minerData = minerTypesDataForModal.find(m => m.id === minerId);
    if (!minerData || minerData.count <= 0) {
      showMessage("Không có thợ mỏ để bán!", "error");
      return;
    }
    const sellValue = minerData.sellPrice;
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");

        const currentMainCoins = userDocSnap.data().coins || 0;
        const mineData = mineDocSnap.data();
        const updatedMinerCounts = {
          basicMiners: mineData.basicMiners || 0,
          advancedMiners: mineData.advancedMiners || 0,
          masterMiners: mineData.masterMiners || 0,
        };

        if (minerId === 'basic' && updatedMinerCounts.basicMiners > 0) updatedMinerCounts.basicMiners -= 1;
        else if (minerId === 'advanced' && updatedMinerCounts.advancedMiners > 0) updatedMinerCounts.advancedMiners -= 1;
        else if (minerId === 'master' && updatedMinerCounts.masterMiners > 0) updatedMinerCounts.masterMiners -= 1;
        else throw new Error("Không có thợ mỏ loại này để bán.");

        transaction.update(userDocRef, { coins: currentMainCoins + sellValue });
        transaction.update(mineDocRef, {
          ...updatedMinerCounts,
          // Preserve other fields
          minedGold: Math.max(0, mineData.minedGold || 0),
          minerEfficiencyLevel: mineData.minerEfficiencyLevel || 0,
          minerLevels: mineData.minerLevels || { basic: 0, advanced: 0, master: 0 },
          lastMineActivityTime: Date.now(),
        });

        if (minerId === 'basic') setBasicMiners(prev => prev - 1);
        else if (minerId === 'advanced') setAdvancedMiners(prev => prev - 1);
        else if (minerId === 'master') setMasterMiners(prev => prev - 1);

        onUpdateCoins(sellValue);
        onUpdateDisplayedCoins(currentCoins + sellValue);
        showMessage(`Đã bán ${minerData.name} nhận ${sellValue} vàng.`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi bán thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể bán."}`, "error");
    }
  };

  // --- handleCollectGold (mostly same, ensure it saves all data) ---
  const handleCollectGold = async () => { /* ... ensure this also preserves all fields in mineDoc when updating ... */ };

  if (isLoading) { /* ... (keep as is) ... */ }

  const upgradeCost = getCurrentUpgradeCost(); // Global efficiency upgrade cost
  const totalMiningRate = getCurrentMiningRate();
  const totalMinersCount = basicMiners + advancedMiners + masterMiners;

  return (
    <div /* ... (main layout) ... */ >
      {/* ... (Close button, Title, Message) ... */}

      <div className="w-full max-w-lg z-10 space-y-5">
        {/* ... (Stats Section - uses totalMinersCount, minerEfficiencyLevel, totalMiningRate) ... */}
        {/* ... (Upgrade Efficiency Section - uses handleUpgradeEfficiency, upgradeCost) ... */}
        
        <button
          onClick={() => setIsMinerHiringModalOpen(true)}
          /* ... (styling) ... */
        >
          <MinersIcon size={24} />
          <span>Cập nhật Thợ Mỏ</span> {/* Changed from "Quản Lý" if you prefer "Cập nhật" */}
        </button>

        {/* ... (Collection Section - uses minedGold, handleCollectGold) ... */}
      </div>

      {/* ... (Current coins display) ... */}

      {/* Miner Hiring Modal - CRITICAL: Pass correct props */}
      <Modal isOpen={isMinerHiringModalOpen} onClose={() => setIsMinerHiringModalOpen(false)} title="Quản Lý Thợ Mỏ">
        <MinerHiringSection
          MINER_TYPES_DATA={minerTypesDataForModal} // Use the derived data
          handleHireMiner={handleHireMiner}
          handleUpgradeMinerType={handleUpgradeMinerType} // NEW
          handleSellMiner={handleSellMiner}             // NEW
          currentCoins={currentCoins}
          CoinIcon={CoinIcon}
          minerEfficiencyLevel={minerEfficiencyLevel}         // NEW (Global efficiency level)
          EFFICIENCY_BONUS_PER_LEVEL={EFFICIENCY_BONUS_PER_LEVEL} // NEW (Global bonus constant)
        />
      </Modal>
    </div>
  );
};

export default GoldMine;
