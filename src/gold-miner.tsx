import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'; // Import auth functions
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

// Global variables for Firebase (provided by Canvas environment)
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string;

// Initialize Firebase outside the component to avoid re-initialization
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
    <path d="m2 16 20-10-4 12L6 14l-4 2z"/>
    <path d="m6 16 2 2 4-4"/>
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
  // State for individual miner levels
  const [basicMinerLevel, setBasicMinerLevel] = useState(0);
  const [advancedMinerLevel, setAdvancedMinerLevel] = useState(0);
  const [masterMinerLevel, setMasterMinerLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isMinerHiringModalOpen, setIsMinerHiringModalOpen] = useState(false); // State for modal

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Define miner types and their properties
  // These are definitions, actual levels are stored in state variables above
  const MINER_DEFINITIONS = [
    {
      id: 'basic',
      name: 'Thợ Mỏ Cơ Bản',
      description: 'Tăng sản lượng vàng ổn định.',
      baseCost: 200, // Cost to acquire at Level 1
      baseRate: 0.05, // Gold per second at Level 1
      rateIncreasePerLevel: 0.02, // Gold per second increase per level for each level
      upgradeCostBase: 100, // Base cost for Level 2 upgrade
      upgradeCostScale: 1.5, // Multiplier for subsequent level upgrades
      sellReturnFactor: 0.5, // 50% return on selling the miner type (resets level to 0)
      icon: MinersIcon,
    },
    {
      id: 'advanced',
      name: 'Thợ Mỏ Cao Cấp',
      description: 'Khai thác vàng nhanh hơn đáng kể.',
      baseCost: 1500,
      baseRate: 0.3,
      rateIncreasePerLevel: 0.1,
      upgradeCostBase: 500,
      upgradeCostScale: 1.6,
      sellReturnFactor: 0.5,
      icon: AdvancedMinerIcon,
    },
    {
      id: 'master',
      name: 'Thợ Mỏ Bậc Thầy',
      description: 'Bậc thầy khai thác, hiệu suất cực cao.',
      baseCost: 8000,
      baseRate: 1.5,
      rateIncreasePerLevel: 0.5,
      upgradeCostBase: 2000,
      upgradeCostScale: 1.7,
      sellReturnFactor: 0.6,
      icon: MasterMinerIcon,
    },
  ];

  // Helper to get current level of a miner type
  const getMinerCurrentLevel = (minerId: string) => {
    if (minerId === 'basic') return basicMinerLevel;
    if (minerId === 'advanced') return advancedMinerLevel;
    if (minerId === 'master') return masterMinerLevel;
    return 0;
  };

  // Helper to calculate the current mining rate based on all miner levels
  const getCurrentMiningRate = () => {
    let totalRate = 0;
    MINER_DEFINITIONS.forEach(minerDef => {
      const currentLevel = getMinerCurrentLevel(minerDef.id);
      if (currentLevel > 0) {
        // Rate = baseRate (at level 1) + (level - 1) * rateIncreasePerLevel
        totalRate += minerDef.baseRate + (currentLevel - 1) * minerDef.rateIncreasePerLevel;
      }
    });
    return totalRate;
  };

  // Helper to calculate the cost for the next level upgrade
  const getUpgradeCostForNextLevel = (minerId: string) => {
    const minerDef = MINER_DEFINITIONS.find(m => m.id === minerId);
    if (!minerDef) return Infinity; // Should not happen

    const currentLevel = getMinerCurrentLevel(minerId);
    if (currentLevel === 0) {
      // If miner is not yet hired (level 0), the cost is its baseCost to get to level 1
      return minerDef.baseCost;
    }
    if (currentLevel >= 100) {
      return Infinity; // Max level reached
    }
    // Cost scales based on current level
    return Math.floor(minerDef.upgradeCostBase * Math.pow(minerDef.upgradeCostScale, currentLevel - 1));
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Save mine data to Firestore
  const saveMineData = async (
    currentMinedGold: number,
    currentBasicMinerLevel: number,
    currentAdvancedMinerLevel: number,
    currentMasterMinerLevel: number
  ) => {
    if (!currentUserId) return;
    try {
      const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
      await setDoc(mineDocRef, {
        minedGold: Math.max(0, currentMinedGold),
        basicMiners: currentBasicMinerLevel,
        advancedMiners: currentAdvancedMinerLevel,
        masterMiners: currentMasterMinerLevel,
        lastMineActivityTime: Date.now(),
      }, { merge: true });
      // console.log("GoldMine: Mine data saved.");
    } catch (error) {
      console.error("GoldMine: Error saving mine data:", error);
    }
  };

  // Fetch mine data from Firestore on component mount
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
        let initialBasicMinerLevel = 0;
        let initialAdvancedMinerLevel = 0;
        let initialMasterMinerLevel = 0;
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialBasicMinerLevel = data.basicMiners || 0;
          initialAdvancedMinerLevel = data.advancedMiners || 0;
          initialMasterMinerLevel = data.masterMiners || 0;
          lastMineActivityTime = data.lastMineActivityTime || 0;

          // Calculate offline gold accumulation
          if ((initialBasicMinerLevel > 0 || initialAdvancedMinerLevel > 0 || initialMasterMinerLevel > 0) && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = Math.max(0, timeElapsedMs / 1000);

            let offlineMiningRate = 0;
            // Calculate rate for each miner type based on its initial level
            if (initialBasicMinerLevel > 0) {
                offlineMiningRate += MINER_DEFINITIONS[0].baseRate + (initialBasicMinerLevel - 1) * MINER_DEFINITIONS[0].rateIncreasePerLevel;
            }
            if (initialAdvancedMinerLevel > 0) {
                offlineMiningRate += MINER_DEFINITIONS[1].baseRate + (initialAdvancedMinerLevel - 1) * MINER_DEFINITIONS[1].rateIncreasePerLevel;
            }
            if (initialMasterMinerLevel > 0) {
                offlineMiningRate += MINER_DEFINITIONS[2].baseRate + (initialMasterMinerLevel - 1) * MINER_DEFINITIONS[2].rateIncreasePerLevel;
            }

            const goldAccumulatedOffline = offlineMiningRate * timeElapsedSeconds;
            initialMinedGold += goldAccumulatedOffline;
            console.log(`GoldMine: Accumulated ${goldAccumulatedOffline.toFixed(2)} gold offline over ${timeElapsedSeconds.toFixed(0)}s. Rate: ${offlineMiningRate.toFixed(2)}/s`);
          }
        } else {
          // Initialize new gold mine data if it doesn't exist
          await setDoc(mineDocRef, {
            minedGold: 0,
            basicMiners: 0,
            advancedMiners: 0,
            masterMiners: 0,
            lastMineActivityTime: Date.now(),
            createdAt: new Date()
          });
        }

        initialMinedGold = Math.max(0, initialMinedGold);
        setMinedGold(initialMinedGold);
        setBasicMinerLevel(initialBasicMinerLevel);
        setAdvancedMinerLevel(initialAdvancedMinerLevel);
        setMasterMinerLevel(initialMasterMinerLevel);
        // Save potentially updated offline gold back to Firestore
        saveMineData(initialMinedGold, initialBasicMinerLevel, initialAdvancedMinerLevel, initialMasterMinerLevel);
      } catch (error) {
        console.error("GoldMine: Error fetching/initializing gold mine data:", error);
        showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMineData();
  }, [currentUserId]); // Depend on currentUserId and db (db is constant here)

  // Effect for continuous gold mining
  useEffect(() => {
    const totalActiveMinerTypes = [basicMinerLevel, advancedMinerLevel, masterMinerLevel].filter(level => level > 0).length;

    if (isGamePaused || isLoading) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
      }
      return;
    }

    // Start mining interval if there are active miners and no interval is running
    if (totalActiveMinerTypes > 0 && miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => {
          const rate = getCurrentMiningRate();
          const newGold = prevGold + rate;
          // Periodically save data to Firestore (e.g., every 10 seconds on average)
          if (auth.currentUser && Math.random() < 0.1) {
            saveMineData(newGold, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
          }
          return newGold;
        });
      }, 1000); // Update every second
    } else if (totalActiveMinerTypes === 0 && miningIntervalRef.current) {
      // Clear interval if no active miners
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
      saveMineData(minedGold, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
    }

    // Cleanup function for the effect
    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMinerLevel, advancedMinerLevel, masterMinerLevel);
      }
    };
  }, [basicMinerLevel, advancedMinerLevel, masterMinerLevel, isGamePaused, isLoading, minedGold]); // Dependencies for this effect

  // Handle hiring a miner type (acquiring it at level 1)
  const handleHireMiner = async (minerId: string) => {
    const minerDef = MINER_DEFINITIONS.find(m => m.id === minerId);
    if (!minerDef) return;

    const currentLevel = getMinerCurrentLevel(minerId);
    if (currentLevel > 0) {
      showMessage(`Bạn đã sở hữu ${minerDef.name}. Hãy nâng cấp!`, "error");
      return;
    }

    const cost = minerDef.baseCost;
    if (currentCoins < cost) {
      showMessage(`Không đủ vàng để thuê ${minerDef.name}!`, "error");
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

        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentBasicMinerLevelInDb = mineDocSnap.data().basicMiners || 0;
        const currentAdvancedMinerLevelInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinerLevelInDb = mineDocSnap.data().masterMiners || 0;

        transaction.update(userDocRef, { coins: currentMainCoins - cost });

        const updatedLevels = {
          basicMiners: currentBasicMinerLevelInDb,
          advancedMiners: currentAdvancedMinerLevelInDb,
          masterMiners: currentMasterMinerLevelInDb,
        };
        if (minerId === 'basic') updatedLevels.basicMiners = 1;
        else if (minerId === 'advanced') updatedLevels.advancedMiners = 1;
        else if (minerId === 'master') updatedLevels.masterMiners = 1;

        transaction.update(mineDocRef, {
          ...updatedLevels,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
        });

        // Update local state after successful transaction
        if (minerId === 'basic') setBasicMinerLevel(1);
        else if (minerId === 'advanced') setAdvancedMinerLevel(1);
        else if (minerId === 'master') setMasterMinerLevel(1);

        onUpdateCoins(-cost); // Update parent's coin state
        onUpdateDisplayedCoins(currentCoins - cost); // Update displayed coins immediately
        showMessage(`Đã thuê ${minerDef.name} (Level 1) thành công!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thuê thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thuê thợ mỏ."}`, "error");
    }
  };

  // Handle upgrading a miner type to the next level
  const handleUpgradeMiner = async (minerId: string) => {
    const minerDef = MINER_DEFINITIONS.find(m => m.id === minerId);
    if (!minerDef) return;

    const currentLevel = getMinerCurrentLevel(minerId);
    if (currentLevel === 0) {
      showMessage(`Bạn chưa thuê ${minerDef.name}. Hãy thuê trước!`, "error");
      return;
    }
    if (currentLevel >= 100) {
      showMessage(`${minerDef.name} đã đạt cấp tối đa (Level 100)!`, "error");
      return;
    }

    const cost = getUpgradeCostForNextLevel(minerId);
    if (currentCoins < cost) {
      showMessage(`Không đủ vàng để nâng cấp ${minerDef.name}!`, "error");
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

        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentBasicMinerLevelInDb = mineDocSnap.data().basicMiners || 0;
        const currentAdvancedMinerLevelInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinerLevelInDb = mineDocSnap.data().masterMiners || 0;

        const updatedLevels = {
          basicMiners: currentBasicMinerLevelInDb,
          advancedMiners: currentAdvancedMinerLevelInDb,
          masterMiners: currentMasterMinerLevelInDb,
        };

        let newLevel = currentLevel + 1;
        if (minerId === 'basic') updatedLevels.basicMiners = newLevel;
        else if (minerId === 'advanced') updatedLevels.advancedMiners = newLevel;
        else if (minerId === 'master') updatedLevels.masterMiners = newLevel;

        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.update(mineDocRef, {
          ...updatedLevels,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
        });

        // Update local state after successful transaction
        if (minerId === 'basic') setBasicMinerLevel(newLevel);
        else if (minerId === 'advanced') setAdvancedMinerLevel(newLevel);
        else if (minerId === 'master') setMasterMinerLevel(newLevel);

        onUpdateCoins(-cost); // Update parent's coin state
        onUpdateDisplayedCoins(currentCoins - cost); // Update displayed coins immediately
        showMessage(`Đã nâng cấp ${minerDef.name} lên Level ${newLevel} thành công!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi nâng cấp thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể nâng cấp thợ mỏ."}`, "error");
    }
  };

  // Handle selling a miner type (resets its level to 0)
  const handleSellMiner = async (minerId: string) => {
    const minerDef = MINER_DEFINITIONS.find(m => m.id === minerId);
    if (!minerDef) return;

    const currentLevel = getMinerCurrentLevel(minerId);
    if (currentLevel === 0) {
      showMessage(`Bạn không sở hữu ${minerDef.name} để bán!`, "error");
      return;
    }

    // Sell value is a fraction of the base cost (cost to acquire at level 1)
    const sellValue = Math.floor(minerDef.baseCost * minerDef.sellReturnFactor);
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");

        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentBasicMinerLevelInDb = mineDocSnap.data().basicMiners || 0;
        const currentAdvancedMinerLevelInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinerLevelInDb = mineDocSnap.data().masterMiners || 0;

        const updatedLevels = {
          basicMiners: currentBasicMinerLevelInDb,
          advancedMiners: currentAdvancedMinerLevelInDb,
          masterMiners: currentMasterMinerLevelInDb,
        };

        // Reset level to 0 for the sold miner type
        if (minerId === 'basic') updatedLevels.basicMiners = 0;
        else if (minerId === 'advanced') updatedLevels.advancedMiners = 0;
        else if (minerId === 'master') updatedLevels.masterMiners = 0;

        transaction.update(userDocRef, { coins: currentMainCoins + sellValue });
        transaction.update(mineDocRef, {
          ...updatedLevels,
          lastMineActivityTime: Date.now(),
          minedGold: Math.max(0, currentMinedGoldInDb),
        });

        // Update local state after successful transaction
        if (minerId === 'basic') setBasicMinerLevel(0);
        else if (minerId === 'advanced') setAdvancedMinerLevel(0);
        else if (minerId === 'master') setMasterMinerLevel(0);

        onUpdateCoins(sellValue); // Update parent's coin state
        onUpdateDisplayedCoins(currentCoins + sellValue); // Update displayed coins immediately
        showMessage(`Đã bán ${minerDef.name}, nhận được ${sellValue} vàng!`, "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi bán thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể bán thợ mỏ."}`, "error");
    }
  };

  // Handle collecting mined gold
  const handleCollectGold = async () => {
    if (minedGold <= 0) {
      showMessage("Không có vàng để thu thập!", "error");
      return;
    }
    if (!currentUserId) return;

    const goldToCollect = Math.floor(minedGold); // Collect whole numbers only

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");

        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentBasicMinerLevelInDb = mineDocSnap.data().basicMiners || 0;
        const currentAdvancedMinerLevelInDb = mineDocSnap.data().advancedMiners || 0;
        const currentMasterMinerLevelInDb = mineDocSnap.data().masterMiners || 0;

        transaction.update(userDocRef, { coins: currentMainCoins + goldToCollect });
        const remainingFractionalGold = Math.max(0, minedGold - goldToCollect);
        transaction.update(mineDocRef, {
          minedGold: remainingFractionalGold,
          lastMineActivityTime: Date.now(),
          basicMiners: currentBasicMinerLevelInDb,
          advancedMiners: currentAdvancedMinerLevelInDb,
          masterMiners: currentMasterMinerLevelInDb,
        });

        setMinedGold(remainingFractionalGold); // Update local state
        onUpdateCoins(goldToCollect); // Update parent's coin state
        onUpdateDisplayedCoins(currentCoins + goldToCollect); // Update displayed coins immediately
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

  const totalMiningRate = getCurrentMiningRate();
  // Sum of levels for active miner types
  const totalMinerLevels = [basicMinerLevel, advancedMinerLevel, masterMinerLevel].reduce((sum, level) => sum + (level > 0 ? level : 0), 0);

  // Prepare MINER_TYPES data to pass to MinerHiringSection
  const MINER_TYPES_FOR_SECTION = MINER_DEFINITIONS.map(minerDef => {
    const currentLevel = getMinerCurrentLevel(minerDef.id);
    const nextUpgradeCost = getUpgradeCostForNextLevel(minerDef.id);
    // Current rate for this specific miner type
    const currentRate = currentLevel > 0 ? (minerDef.baseRate + (currentLevel - 1) * minerDef.rateIncreasePerLevel) : 0;
    const nextLevelRateIncrease = minerDef.rateIncreasePerLevel; // Rate increase for the next level
    const sellValue = Math.floor(minerDef.baseCost * minerDef.sellReturnFactor);

    return {
      ...minerDef,
      level: currentLevel,
      currentRate: currentRate,
      nextUpgradeCost: nextUpgradeCost,
      nextLevelRateIncrease: nextLevelRateIncrease,
      sellValue: sellValue,
      canHire: currentLevel === 0 && currentCoins >= minerDef.baseCost, // Can hire if not owned and afford base cost
      canUpgrade: currentLevel > 0 && currentLevel < 100 && currentCoins >= nextUpgradeCost, // Can upgrade if owned, not max level, and afford cost
      canSell: currentLevel > 0, // Can sell if owned
    };
  });

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
              <span>Tổng cấp độ thợ mỏ:</span>
              <span className="font-bold text-lg text-white">{totalMinerLevels}</span>
            </div>
            {/* Removed Efficiency Level as it's now per-miner level */}
            <div className="col-span-2 flex items-center space-x-2">
              <PickaxeIcon size={20} className="text-orange-400" />
              <span>Tổng tốc độ khai thác:</span>
              <span className="font-bold text-lg text-yellow-400">{totalMiningRate.toFixed(2)} vàng/s</span>
            </div>
          </div>
        </div>

        {/* Miner Management Button */}
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
          MINER_TYPES={MINER_TYPES_FOR_SECTION}
          handleHireMiner={handleHireMiner}
          handleUpgradeMiner={handleUpgradeMiner}
          handleSellMiner={handleSellMiner}
          currentCoins={currentCoins}
          CoinIcon={CoinIcon}
        />
      </Modal>
    </div>
  );
};

export default GoldMine;
