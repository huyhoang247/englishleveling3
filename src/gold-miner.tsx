import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js'; // Assuming firebase.js exports auth
import MinerHiringSection from './miner/thomo.tsx'; // Import the MinerHiringSection component

// Define props interface for GoldMine component
interface GoldMineProps {
  onClose: () => void; // Function to close the Gold Mine screen
  currentCoins: number; // Current main coin balance from parent
  onUpdateCoins: (amount: number) => Promise<void>; // Function to update main coins in parent (and Firestore)
  onUpdateDisplayedCoins: (amount: number) => void; // NEW: Function to update displayed coins in parent immediately
  currentUserId: string; // Current authenticated user ID
  isGamePaused: boolean; // Prop to indicate if the main game is paused
}

// --- SVG ICONS ---
// Simpler Pickaxe Icon
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
// Coin Icon
const CoinIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} {...props} >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <path d="M12 6c-1.028 0-1.96.491-2.567 1.296A3.942 3.942 0 008.5 9c0 .978.357 1.859.933 2.533.667.768 1.592 1.267 2.567 1.267.975 0 1.899-.5 2.567-1.267.576-.674.933-1.555.933-2.533a3.94 3.94 0 00-.933-1.704C13.96 6.491 13.028 6 12 6zm0 5.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75.75.336.75.75-.336.75-.75.75z" />
  </svg>
);
// Miners Icon (User Group)
const MinersIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
// Upgrade Icon (Arrow Up Circle)
const UpgradeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>
  </svg>
);

// New Icon for Advanced Miner (using a gear for now)
const AdvancedMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z" />
  </svg>
);

// New Icon for Master Miner (using a crown for now)
const MasterMinerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m2 16 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2v-2l-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2v2z" /><path d="M12 14v-2" /><path d="M12 10V8" /><path d="M12 6V4" /><path d="M12 2v2" /><path d="M12 22v-2" /><path d="M12 18v-2" /><path d="M12 20v-2" />
  </svg>
);

// Sell Icon (Dollar Sign)
const SellIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

// Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-600 pb-2">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors text-gray-300"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, onUpdateDisplayedCoins, currentUserId, isGamePaused }) => {
  const [minedGold, setMinedGold] = useState(0);
  const [basicMiners, setBasicMiners] = useState(0); // Existing miners, renamed for clarity
  const [advancedMiners, setAdvancedMiners] = useState(0); // New state for advanced miners
  const [masterMiners, setMasterMiners] = useState(0); // New state for master miners
  const [minerEfficiencyLevel, setMinerEfficiencyLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isMinerHiringModalOpen, setIsMinerHiringModalOpen] = useState(false); // State for modal

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const db = getFirestore();

  // Constants for game balance
  const EFFICIENCY_BONUS_PER_LEVEL = 0.02; // Additional gold per second per miner per efficiency level
  const UPGRADE_EFFICIENCY_BASE_COST = 100;
  const UPGRADE_EFFICIENCY_COST_SCALING_FACTOR = 1.8; // Cost multiplier for each efficiency level

  // Define miner types and their properties
  const MINER_TYPES = [
    {
      id: 'basic',
      name: 'Thợ Mỏ Cơ Bản',
      description: 'Tăng sản lượng vàng ổn định.',
      baseCost: 200,
      baseRate: 0.05, // Gold per second
      icon: MinersIcon, // Icon component reference
      count: basicMiners,
      setCount: setBasicMiners,
      upgradeCostMultiplier: 2.5, // Cost to upgrade one basic miner to advanced
      sellReturnFactor: 0.5, // 50% return on sell
    },
    {
      id: 'advanced',
      name: 'Thợ Mỏ Cao Cấp',
      description: 'Khai thác vàng nhanh hơn đáng kể.',
      baseCost: 1500,
      baseRate: 0.3,
      icon: AdvancedMinerIcon, // Icon component reference
      count: advancedMiners,
      setCount: setAdvancedMiners,
      upgradeCostMultiplier: 2.0, // Cost to upgrade one advanced miner to master
      sellReturnFactor: 0.5, // 50% return on sell
    },
    {
      id: 'master',
      name: 'Thợ Mỏ Bậc Thầy',
      description: 'Bậc thầy khai thác, hiệu suất cực cao.',
      baseCost: 8000,
      baseRate: 1.5,
      icon: MasterMinerIcon, // Icon component reference
      count: masterMiners,
      setCount: setMasterMiners,
      upgradeCostMultiplier: 1, // No further upgrade
      sellReturnFactor: 0.6, // Slightly better return for master
    },
  ];

  const getCurrentMiningRate = () => {
    let totalRate = 0;
    MINER_TYPES.forEach(minerType => {
      totalRate += minerType.count * (minerType.baseRate + minerEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL);
    });
    return totalRate;
  };

  const getCurrentUpgradeEfficiencyCost = () => {
    return Math.floor(UPGRADE_EFFICIENCY_BASE_COST * Math.pow(UPGRADE_EFFICIENCY_COST_SCALING_FACTOR, minerEfficiencyLevel));
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const saveMineData = async (
    currentMinedGold: number,
    currentBasicMiners: number,
    currentAdvancedMiners: number,
    currentMasterMiners: number,
    currentEfficiencyLevel: number
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
        lastMineActivityTime: Date.now(),
      }, { merge: true });
      // console.log("GoldMine: Mine data saved.");
    } catch (error) {
      console.error("GoldMine: Error saving mine data:", error);
    }
  };

  useEffect(() => {
    const fetchMineData = async () => {
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const mineDocSnap = await getDoc(mineDocRef);

        let initialMinedGold = 0;
        let initialBasicMiners = 0;
        let initialAdvancedMiners = 0;
        let initialMasterMiners = 0;
        let initialEfficiencyLevel = 0;
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialBasicMiners = data.basicMiners || data.miners || 0; // Fallback for old 'miners' field
          initialAdvancedMiners = data.advancedMiners || 0;
          initialMasterMiners = data.masterMiners || 0;
          initialEfficiencyLevel = data.minerEfficiencyLevel || 0;
          lastMineActivityTime = data.lastMineActivityTime || 0;

          if ((initialBasicMiners > 0 || initialAdvancedMiners > 0 || initialMasterMiners > 0) && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = Math.max(0, timeElapsedMs / 1000);
            const offlineMiningRate =
              initialBasicMiners * (MINER_TYPES[0].baseRate + initialEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL) +
              initialAdvancedMiners * (MINER_TYPES[1].baseRate + initialEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL) +
              initialMasterMiners * (MINER_TYPES[2].baseRate + initialEfficiencyLevel * EFFICIENCY_BONUS_PER_LEVEL);
            const goldAccumulatedOffline = offlineMiningRate * timeElapsedSeconds;
            initialMinedGold += goldAccumulatedOffline;
            console.log(`GoldMine: Accumulated ${goldAccumulatedOffline.toFixed(2)} gold offline over ${timeElapsedSeconds.toFixed(0)}s. Rate: ${offlineMiningRate.toFixed(2)}/s`);
          }
        } else {
          await setDoc(mineDocRef, {
            minedGold: 0,
            basicMiners: 0,
            advancedMiners: 0,
            masterMiners: 0,
            minerEfficiencyLevel: 0,
            lastMineActivityTime: Date.now(),
            createdAt: new Date()
          });
        }

        initialMinedGold = Math.max(0, initialMinedGold);
        setMinedGold(initialMinedGold);
        setBasicMiners(initialBasicMiners);
        setAdvancedMiners(initialAdvancedMiners);
        setMasterMiners(initialMasterMiners);
        setMinerEfficiencyLevel(initialEfficiencyLevel);
        saveMineData(initialMinedGold, initialBasicMiners, initialAdvancedMiners, initialMasterMiners, initialEfficiencyLevel); // Save potentially updated offline gold
      } catch (error) {
        console.error("GoldMine: Error fetching/initializing gold mine data:", error);
        showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMineData();
  }, [currentUserId, db]);

  useEffect(() => {
    const totalMiners = basicMiners + advancedMiners + masterMiners;

    if (isGamePaused || isLoading) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel);
      }
      return;
    }

    if (totalMiners > 0 && miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => {
          const rate = getCurrentMiningRate();
          const newGold = prevGold + rate;
          if (auth.currentUser && Math.random() < 0.1) { // Save approx every 10 seconds
            saveMineData(newGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel);
          }
          return newGold;
        });
      }, 1000);
    } else if (totalMiners === 0 && miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
      saveMineData(minedGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel);
    }

    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel);
      }
    };
  }, [basicMiners, advancedMiners, masterMiners, minerEfficiencyLevel, isGamePaused, isLoading, db, minedGold]);

  const handleHireMiner = async (minerId: string) => {
    const minerType = MINER_TYPES.find(m => m.id === minerId);
    if (!minerType) return;

    if (currentCoins < minerType.baseCost) {
      showMessage(`Không đủ vàng để thuê ${minerType.name}!`, "error");
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
        if (currentMainCoins < minerType.baseCost) throw new Error("Không đủ vàng.");

        const currentBasicMinersInDb = mineDocSnap.data().basicMiners || mineDocSnap.data().miners || 0;
        const currentAdvancedMinersInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinersInDb = mineDocSnap.data().masterMiners || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;

        transaction.update(userDocRef, { coins: currentMainCoins - minerType.baseCost });

        const updatedMinerCounts = {
          basicMiners: currentBasicMinersInDb,
          advancedMiners: currentAdvancedMinersInDb,
          masterMiners: currentMasterMinersInDb,
        };
        if (minerId === 'basic') updatedMinerCounts.basicMiners += 1;
        else if (minerId === 'advanced') updatedMinerCounts.advancedMiners += 1;
        else if (minerId === 'master') updatedMinerCounts.masterMiners += 1;

        transaction.update(mineDocRef, {
          ...updatedMinerCounts,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
          minerEfficiencyLevel: currentEfficiencyInDb
        });

        if (minerId === 'basic') setBasicMiners(prev => prev + 1);
        else if (minerId === 'advanced') setAdvancedMiners(prev => prev + 1);
        else if (minerId === 'master') setMasterMiners(prev => prev + 1);

        onUpdateCoins(-minerType.baseCost);
        onUpdateDisplayedCoins(currentCoins - minerType.baseCost);
        showMessage(`Đã thuê ${minerType.name} thành công!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thuê thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thuê thợ mỏ."}`, "error");
    }
  };

  const handleUpgradeMiner = async (minerId: string) => {
    const minerType = MINER_TYPES.find(m => m.id === minerId);
    if (!minerType) return;

    if (minerType.count === 0) {
      showMessage(`Bạn không có ${minerType.name} để nâng cấp!`, "error");
      return;
    }

    const upgradeCost = minerType.upgradeCost;
    if (currentCoins < upgradeCost) {
      showMessage(`Không đủ vàng để nâng cấp ${minerType.name}!`, "error");
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
        if (currentMainCoins < upgradeCost) throw new Error("Không đủ vàng.");

        const currentBasicMinersInDb = mineDocSnap.data().basicMiners || mineDocSnap.data().miners || 0;
        const currentAdvancedMinersInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinersInDb = mineDocSnap.data().masterMiners || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;

        let updatedBasic = currentBasicMinersInDb;
        let updatedAdvanced = currentAdvancedMinersInDb;
        let updatedMaster = currentMasterMinersInDb;

        if (minerId === 'basic') {
          if (updatedBasic === 0) throw new Error("Không có thợ mỏ cơ bản để nâng cấp.");
          updatedBasic -= 1;
          updatedAdvanced += 1;
          setBasicMiners(prev => prev - 1);
          setAdvancedMiners(prev => prev + 1);
        } else if (minerId === 'advanced') {
          if (updatedAdvanced === 0) throw new Error("Không có thợ mỏ cao cấp để nâng cấp.");
          updatedAdvanced -= 1;
          updatedMaster += 1;
          setAdvancedMiners(prev => prev - 1);
          setMasterMiners(prev => prev + 1);
        } else {
          throw new Error("Loại thợ mỏ này không thể nâng cấp.");
        }

        transaction.update(userDocRef, { coins: currentMainCoins - upgradeCost });
        transaction.update(mineDocRef, {
          basicMiners: updatedBasic,
          advancedMiners: updatedAdvanced,
          masterMiners: updatedMaster,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
          minerEfficiencyLevel: currentEfficiencyInDb
        });

        onUpdateCoins(-upgradeCost);
        onUpdateDisplayedCoins(currentCoins - upgradeCost);
        showMessage(`Đã nâng cấp ${minerType.name} thành công!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi nâng cấp thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể nâng cấp thợ mỏ."}`, "error");
    }
  };

  const handleSellMiner = async (minerId: string) => {
    const minerType = MINER_TYPES.find(m => m.id === minerId);
    if (!minerType) return;

    if (minerType.count === 0) {
      showMessage(`Bạn không có ${minerType.name} để bán!`, "error");
      return;
    }

    const sellValue = minerType.sellValue;
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");

        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentBasicMinersInDb = mineDocSnap.data().basicMiners || mineDocSnap.data().miners || 0;
        const currentAdvancedMinersInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinersInDb = mineDocSnap.data().masterMiners || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;

        let updatedBasic = currentBasicMinersInDb;
        let updatedAdvanced = currentAdvancedMinersInDb;
        let updatedMaster = currentMasterMinersInDb;

        if (minerId === 'basic') {
          if (updatedBasic === 0) throw new Error("Không có thợ mỏ cơ bản để bán.");
          updatedBasic -= 1;
          setBasicMiners(prev => prev - 1);
        } else if (minerId === 'advanced') {
          if (updatedAdvanced === 0) throw new Error("Không có thợ mỏ cao cấp để bán.");
          updatedAdvanced -= 1;
          setAdvancedMiners(prev => prev - 1);
        } else if (minerId === 'master') {
          if (updatedMaster === 0) throw new Error("Không có thợ mỏ bậc thầy để bán.");
          updatedMaster -= 1;
          setMasterMiners(prev => prev - 1);
        } else {
          throw new Error("Loại thợ mỏ không hợp lệ để bán.");
        }

        transaction.update(userDocRef, { coins: currentMainCoins + sellValue });
        transaction.update(mineDocRef, {
          basicMiners: updatedBasic,
          advancedMiners: updatedAdvanced,
          masterMiners: updatedMaster,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
          minerEfficiencyLevel: currentEfficiencyInDb
        });

        onUpdateCoins(sellValue);
        onUpdateDisplayedCoins(currentCoins + sellValue);
        showMessage(`Đã bán ${minerType.name} thành công, nhận được ${sellValue} vàng!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi bán thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể bán thợ mỏ."}`, "error");
    }
  };

  const handleUpgradeEfficiency = async () => {
    const cost = getCurrentUpgradeEfficiencyCost();
    if (currentCoins < cost) {
      showMessage("Không đủ vàng để nâng cấp!", "error");
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

        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentBasicMinersInDb = mineDocSnap.data().basicMiners || mineDocSnap.data().miners || 0;
        const currentAdvancedMinersInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinersInDb = mineDocSnap.data().masterMiners || 0;


        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.update(mineDocRef, {
          minerEfficiencyLevel: currentEfficiencyInDb + 1,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
          basicMiners: currentBasicMinersInDb,
          advancedMiners: currentAdvancedMinersInDb,
          masterMiners: currentMasterMinersInDb,
        });

        setMinerEfficiencyLevel(prev => prev + 1);
        onUpdateCoins(-cost);
        onUpdateDisplayedCoins(currentCoins - cost);
        showMessage("Nâng cấp hiệu suất thành công!", "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi nâng cấp:", error);
      showMessage(`Lỗi: ${error.message || "Không thể nâng cấp."}`, "error");
    }
  };

  const handleCollectGold = async () => {
    if (minedGold <= 0) {
      showMessage("Không có vàng để thu thập!", "error");
      return;
    }
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
        const currentBasicMinersInDb = mineDocSnap.data().basicMiners || mineDocSnap.data().miners || 0;
        const currentAdvancedMinersInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinersInDb = mineDocSnap.data().masterMiners || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;

        transaction.update(userDocRef, { coins: currentMainCoins + goldToCollect });
        const remainingFractionalGold = Math.max(0, minedGold - goldToCollect);
        transaction.update(mineDocRef, {
          minedGold: remainingFractionalGold,
          lastMineActivityTime: Date.now(),
          basicMiners: currentBasicMinersInDb,
          advancedMiners: currentAdvancedMinersInDb,
          masterMiners: currentMasterMinersInDb,
          minerEfficiencyLevel: currentEfficiencyInDb
        });

        setMinedGold(remainingFractionalGold);
        onUpdateCoins(goldToCollect);
        onUpdateDisplayedCoins(currentCoins + goldToCollect);
        showMessage(`Đã thu thập ${goldToCollect} vàng!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thu thập vàng:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thu thập vàng."}`, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-yellow-400 rounded-lg text-xl font-semibold">
        <PickaxeIcon className="animate-spin mr-3" size={32} /> Đang tải dữ liệu mỏ vàng...
      </div>
    );
  }

  const upgradeEfficiencyCost = getCurrentUpgradeEfficiencyCost();
  const totalMiningRate = getCurrentMiningRate();
  const totalMinersCount = basicMiners + advancedMiners + masterMiners;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-gradient-to-b from-slate-800 to-slate-950 text-gray-200 p-4 sm:p-6 rounded-lg shadow-2xl overflow-y-auto">
      {/* Subtle background pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" width="100%" height="100%">
        <defs>
          <pattern id="rockPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="scale(1) rotate(45)">
            <path d="M0 30 Q15 0 30 30 Q45 60 60 30 Q45 0 30 30 Q15 60 0 30" stroke="#4A5568" strokeWidth="0.5" fill="transparent" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rockPattern)" />
      </svg>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors z-20"
        aria-label="Đóng"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)] z-10">
        <PickaxeIcon size={36} className="inline-block mr-2 -mt-1" color="orange" />
        Mỏ Vàng Bất Tận
      </h2>

      {message && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-sm font-semibold z-50 shadow-lg
          ${messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {message}
        </div>
      )}

      <div className="w-full max-w-lg z-10 space-y-5">
        {/* Stats Section */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-slate-600 pb-2">Thông Tin Mỏ</h3>
          <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
            <div className="flex items-center space-x-2">
              <MinersIcon size={20} className="text-blue-400" />
              <span>Tổng số thợ mỏ:</span>
              <span className="font-bold text-lg text-white">{totalMinersCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UpgradeIcon size={20} className="text-green-400" />
              <span>Cấp hiệu suất:</span>
              <span className="font-bold text-lg text-white">{minerEfficiencyLevel}</span>
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <PickaxeIcon size={20} className="text-orange-400" />
              <span>Tổng tốc độ:</span>
              <span className="font-bold text-lg text-yellow-400">{totalMiningRate.toFixed(2)} vàng/s</span>
            </div>
          </div>
        </div>

        {/* Upgrade Efficiency Section */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-green-300 mb-3 border-b border-slate-600 pb-2">Nâng Cấp Hiệu Suất Tổng Thể</h3>
          <p className="text-sm text-gray-400 mb-3">Tăng lượng vàng mỗi thợ mỏ khai thác được cho tất cả các loại thợ mỏ.</p>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <UpgradeIcon size={24} className="text-green-400" />
              <span className="text-lg font-bold text-white">Cấp hiện tại: {minerEfficiencyLevel}</span>
            </div>
            <button
              onClick={handleUpgradeEfficiency}
              disabled={currentCoins < upgradeEfficiencyCost}
              className={`py-2.5 px-4 rounded-lg font-bold text-base transition-all duration-200 flex items-center justify-center space-x-2
                ${currentCoins < upgradeEfficiencyCost
                  ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`}
            >
              <CoinIcon size={18} className="inline -mt-0.5" color="gold" />
              <span>Nâng cấp ({upgradeEfficiencyCost.toLocaleString()})</span>
            </button>
          </div>
        </div>

        {/* Update Miners Button */}
        <button
          onClick={() => setIsMinerHiringModalOpen(true)}
          className="w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <MinersIcon size={24} />
          <span>Quản Lý Thợ Mỏ</span>
        </button>

        {/* Collection Section */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700">
          <div className="flex flex-col items-center mb-4">
            <p className="text-base text-gray-300 mb-1">Vàng đã khai thác</p>
            <div className="flex items-center space-x-2 text-yellow-300 animate-pulse-slow">
              <CoinIcon size={32} color="gold" />
              <p className="text-3xl sm:text-4xl font-extrabold drop-shadow-md">
                {Math.floor(minedGold).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleCollectGold}
            disabled={minedGold < 1} // Only allow collecting whole numbers
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200
              ${minedGold < 1
                ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              }`}
          >
            Thu Thập Vàng
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-400 z-10">
        Số vàng bạn có:
        <span className="font-bold text-yellow-300 ml-1">
          {currentCoins.toLocaleString()} <CoinIcon size={14} className="inline -mt-0.5" color="gold" />
        </span>
      </p>

      {/* Miner Hiring Modal */}
      <Modal isOpen={isMinerHiringModalOpen} onClose={() => setIsMinerHiringModalOpen(false)} title="Quản Lý Thợ Mỏ">
        <MinerHiringSection
          MINER_TYPES={MINER_TYPES}
          handleHireMiner={handleHireMiner}
          handleUpgradeMiner={handleUpgradeMiner}
          handleSellMiner={handleSellMiner}
          currentCoins={currentCoins}
          CoinIcon={CoinIcon}
          minerEfficiencyLevel={minerEfficiencyLevel}
          efficiencyBonusPerLevel={EFFICIENCY_BONUS_PER_LEVEL}
        />
      </Modal>
    </div>
  );
};

export default GoldMine;
