import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js'; // Assuming firebase.js exports auth

// Define props interface for GoldMine component
interface GoldMineProps {
  onClose: () => void; // Function to close the Gold Mine screen
  currentCoins: number; // Current main coin balance from parent
  onUpdateCoins: (amount: number) => Promise<void>; // Function to update main coins in parent (and Firestore)
  onUpdateDisplayedCoins: (amount: number) => void; // NEW: Function to update displayed coins in parent immediately
  currentUserId: string; // Current authenticated user ID
  isGamePaused: boolean; // Prop to indicate if the main game is paused
}

// Inline SVG for a pickaxe icon (original)
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Simplified path for better rendering, original path structure was very complex and possibly problematic */}
    <path d="M22 2 18 6l-4 4-4 4-4 4-2-2 4-4 2-2 6-6 2-2Z" />
    <path d="m14 10-2-2-2-2" />
    <path d="m6 18-2-2" />
    <path d="M2 12l4 4" />
    <path d="M12 2l4 4" />
  </svg>
);

// Inline SVG for an upgrade icon (up arrow)
const UpgradeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

// Inline SVG for a generic coin/gold icon
const GoldCoinIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" fill="gold" stroke="darkgoldenrod"/>
    <text x="12" y="16" fontSize="10" fill="darkgoldenrod" textAnchor="middle" fontWeight="bold">$</text>
  </svg>
);


const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, onUpdateDisplayedCoins, currentUserId, isGamePaused }) => {
  const [minedGold, setMinedGold] = useState(0);
  const [miners, setMiners] = useState(0);
  const [minerEfficiencyLevel, setMinerEfficiencyLevel] = useState(0); // New state
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [lastMinedIncrement, setLastMinedIncrement] = useState<number | null>(null);
  const [incrementKey, setIncrementKey] = useState(0); // To re-trigger animation

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const db = getFirestore();

  // --- Constants for Game Mechanics ---
  const BASE_HIRE_COST = 100;
  const HIRE_COST_MULTIPLIER = 1.15; // Cost increases by 15% per miner

  const BASE_MINING_RATE_PER_MINER = 0.05; // Base gold per second per miner
  const EFFICIENCY_UPGRADE_EFFECT_MULTIPLIER = 1.25; // Each level increases efficiency by 25%

  const BASE_EFFICIENCY_UPGRADE_COST = 300;
  const EFFICIENCY_UPGRADE_COST_MULTIPLIER = 1.8; // Cost increases by 80% per upgrade level

  // --- Calculated Values ---
  const calculateHireCost = (currentMiners: number) => 
    Math.floor(BASE_HIRE_COST * Math.pow(HIRE_COST_MULTIPLIER, currentMiners));

  const calculateEfficiencyUpgradeCost = (currentLevel: number) =>
    Math.floor(BASE_EFFICIENCY_UPGRADE_COST * Math.pow(EFFICIENCY_UPGRADE_COST_MULTIPLIER, currentLevel));

  const effectiveMiningRatePerMiner = 
    BASE_MINING_RATE_PER_MINER * Math.pow(EFFICIENCY_UPGRADE_EFFECT_MULTIPLIER, minerEfficiencyLevel);

  const totalMiningRate = miners * effectiveMiningRatePerMiner;

  const currentHireCost = calculateHireCost(miners);
  const currentEfficiencyUpgradeCost = calculateEfficiencyUpgradeCost(minerEfficiencyLevel);

  // Function to show a temporary message
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Function to save gold mine data to Firestore
  const saveMineData = async (currentMinedGold: number, currentMiners: number, currentEfficiencyLevel: number) => {
    if (!currentUserId) return;
    try {
      const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
      await setDoc(mineDocRef, {
        minedGold: Math.max(0, currentMinedGold),
        miners: currentMiners,
        minerEfficiencyLevel: currentEfficiencyLevel,
        lastMineActivityTime: Date.now(),
      }, { merge: true });
      // console.log("GoldMine: Mine data saved.");
    } catch (error) {
      console.error("GoldMine: Error saving mine data:", error);
    }
  };

  // Fetch gold mine data from Firestore
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
        let initialMiners = 0;
        let initialEfficiencyLevel = 0;
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialMiners = data.miners || 0;
          initialEfficiencyLevel = data.minerEfficiencyLevel || 0;
          lastMineActivityTime = data.lastMineActivityTime || 0;

          if (initialMiners > 0 && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = timeElapsedMs / 1000;
            const offlineRatePerMiner = BASE_MINING_RATE_PER_MINER * Math.pow(EFFICIENCY_UPGRADE_EFFECT_MULTIPLIER, initialEfficiencyLevel);
            const goldAccumulatedOffline = initialMiners * offlineRatePerMiner * timeElapsedSeconds;
            initialMinedGold += goldAccumulatedOffline;
            if (goldAccumulatedOffline > 0) {
                 showMessage(`Chào mừng trở lại! Bạn đã khai thác ${goldAccumulatedOffline.toFixed(2)} vàng khi vắng mặt.`, "success");
            }
          }
        } else {
          await setDoc(mineDocRef, { minedGold: 0, miners: 0, minerEfficiencyLevel: 0, lastMineActivityTime: Date.now(), createdAt: new Date() });
        }
        
        initialMinedGold = Math.max(0, initialMinedGold);
        setMinedGold(initialMinedGold);
        setMiners(initialMiners);
        setMinerEfficiencyLevel(initialEfficiencyLevel);
        saveMineData(initialMinedGold, initialMiners, initialEfficiencyLevel);

      } catch (error) {
        console.error("GoldMine: Error fetching gold mine data:", error);
        showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMineData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, db]); // Only on mount and user change

  // Effect for gold mining interval
  useEffect(() => {
    if (isGamePaused || isLoading) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, miners, minerEfficiencyLevel);
      }
      return;
    }

    if (miners > 0 && totalMiningRate > 0 && miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => {
          const increment = totalMiningRate; // Increment per second
          const newGold = prevGold + increment;
          
          setLastMinedIncrement(increment);
          setIncrementKey(prev => prev + 1); // For animation reset
          setTimeout(() => setLastMinedIncrement(null), 1500); // Display for 1.5 sec

          if (auth.currentUser) { // Periodically save
             saveMineData(newGold, miners, minerEfficiencyLevel);
          }
          return newGold;
        });
      }, 1000);
    } else if ((miners === 0 || totalMiningRate === 0) && miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, miners, minerEfficiencyLevel);
    }

    return () => { // Cleanup
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, miners, minerEfficiencyLevel);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miners, minerEfficiencyLevel, isGamePaused, isLoading, db, totalMiningRate]); // Add totalMiningRate as it depends on efficiency

  const handleHireMiner = async () => {
    const cost = currentHireCost;
    if (currentCoins < cost) {
      showMessage("Không đủ vàng để thuê thợ mỏ!", "error");
      return;
    }
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Tài liệu không tồn tại!");
        
        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentMinersInDb = mineDocSnap.data().miners || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;

        if (currentMainCoins < cost) throw new Error("Không đủ vàng.");

        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.update(mineDocRef, {
            miners: currentMinersInDb + 1,
            lastMineActivityTime: Date.now(),
            minedGold: Math.max(0, currentMinedGoldInDb), // Preserve current mined gold
            minerEfficiencyLevel: currentEfficiencyInDb // Preserve efficiency
        });

        setMiners(prev => prev + 1);
        onUpdateCoins(-cost);
        onUpdateDisplayedCoins(currentCoins - cost);
        showMessage("Đã thuê thợ mỏ thành công!", "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thuê thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thuê thợ mỏ."}`, "error");
    }
  };

  const handleUpgradeEfficiency = async () => {
    const cost = currentEfficiencyUpgradeCost;
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

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Tài liệu không tồn tại!");

        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;
        const currentMinedGoldInDb = mineDocSnap.data().minedGold || 0;
        const currentMinersInDb = mineDocSnap.data().miners || 0;


        if (currentMainCoins < cost) throw new Error("Không đủ vàng.");

        transaction.update(userDocRef, { coins: currentMainCoins - cost });
        transaction.update(mineDocRef, {
            minerEfficiencyLevel: currentEfficiencyInDb + 1,
            lastMineActivityTime: Date.now(), // Activity time also updates on upgrade
            minedGold: Math.max(0, currentMinedGoldInDb),
            miners: currentMinersInDb
        });
        
        setMinerEfficiencyLevel(prev => prev + 1);
        onUpdateCoins(-cost);
        onUpdateDisplayedCoins(currentCoins - cost);
        showMessage("Nâng cấp hiệu suất thành công!", "success");
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi nâng cấp hiệu suất:", error);
      showMessage(`Lỗi: ${error.message || "Không thể nâng cấp."}`, "error");
    }
  };

  const handleCollectGold = async () => {
    if (minedGold < 1) { // Only collect if at least 1 gold
      showMessage("Không có đủ vàng để thu thập (cần ít nhất 1 vàng).", "error");
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

        if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Tài liệu không tồn tại!");

        const currentMainCoins = userDocSnap.data().coins || 0;
        // Ensure we use the latest values from DB for safety, though local state should be in sync
        const currentMinersInDb = mineDocSnap.data().miners || 0;
        const currentEfficiencyInDb = mineDocSnap.data().minerEfficiencyLevel || 0;

        transaction.update(userDocRef, { coins: currentMainCoins + goldToCollect });
        const remainingFractionalGold = Math.max(0, minedGold - goldToCollect);
        transaction.update(mineDocRef, {
            minedGold: remainingFractionalGold,
            lastMineActivityTime: Date.now(),
            miners: currentMinersInDb, // Preserve current miners
            minerEfficiencyLevel: currentEfficiencyInDb // Preserve efficiency
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
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white rounded-lg p-4">
        <PickaxeIcon size={48} className="animate-spin-slow mr-4 text-yellow-400" />
        Đang tải dữ liệu mỏ vàng...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-gradient-to-br from-slate-800 to-slate-950 text-white p-6 rounded-lg shadow-2xl overflow-y-auto">
      {/* Background elements - more subtle */}
      <div className="absolute inset-0 opacity-[0.03] overflow-hidden">
        <PickaxeIcon size={300} color="gray" className="absolute top-10 left-10 transform -translate-x-1/2 -translate-y-1/2 rotate-[15deg]" />
        <PickaxeIcon size={250} color="gray" className="absolute bottom-10 right-10 transform translate-x-1/2 translate-y-1/2 -rotate-[25deg]" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors z-20"
        aria-label="Đóng"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <h2 className="text-4xl font-bold mb-6 text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] z-10">
        Mỏ Vàng Thần Tài
      </h2>

      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-base font-semibold z-50 shadow-xl
          ${messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          transition-all duration-300 ease-out transform ${message ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          {message}
        </div>
      )}
      
      <div className="w-full max-w-2xl space-y-6 z-10">
        {/* Stats Card */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-2xl font-semibold text-yellow-300 mb-4">Thông số Mỏ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-400">Thợ mỏ</p>
              <p className="text-3xl font-bold text-white">{miners}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Cấp Hiệu Suất</p>
              <p className="text-3xl font-bold text-white">Lv. {minerEfficiencyLevel}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tổng Tốc Độ</p>
              <p className="text-3xl font-bold text-yellow-400">
                {totalMiningRate.toFixed(2)} <span className="text-sm">vàng/s</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-2xl font-semibold text-yellow-300 mb-4">Nâng Cấp & Quản Lý</h3>
          <div className="space-y-4">
            <button
              onClick={handleHireMiner}
              disabled={currentCoins < currentHireCost}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 group
                disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed
                bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <PickaxeIcon size={20} className="mr-2 group-hover:animate-ping-once" />
              Thuê Thợ Mỏ ({currentHireCost.toLocaleString()} <GoldCoinIcon size={18} className="ml-1 inline-block" />)
            </button>
            <button
              onClick={handleUpgradeEfficiency}
              disabled={currentCoins < currentEfficiencyUpgradeCost}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 group
                disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed
                bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <UpgradeIcon size={20} className="mr-2 group-hover:animate-bounce-short" />
              Nâng Cấp Hiệu Suất ({currentEfficiencyUpgradeCost.toLocaleString()} <GoldCoinIcon size={18} className="ml-1 inline-block" />)
            </button>
          </div>
        </div>

        {/* Collection Card */}
        <div className="bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700 relative">
          <h3 className="text-2xl font-semibold text-yellow-300 mb-4 text-center">Kho Báu Tích Lũy</h3>
          <div className="flex flex-col items-center mb-6 relative">
            <div className="relative">
              <PickaxeIcon size={32} color="#FFD700" className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-50" />
              <p className="text-5xl md:text-6xl font-extrabold text-yellow-300 drop-shadow-lg">
                {Math.floor(minedGold).toLocaleString()}
              </p>
              <GoldCoinIcon size={32} className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-70" />
            </div>
            {lastMinedIncrement !== null && (
              <p key={incrementKey} className="absolute top-full mt-1 text-green-400 text-sm animate-fade-up-out">
                +{lastMinedIncrement.toFixed(2)}
              </p>
            )}
            <p className="text-sm text-slate-400 mt-2">Vàng sẵn sàng thu thập</p>
          </div>
          <button
            onClick={handleCollectGold}
            disabled={minedGold < 1}
            className="w-full py-3.5 rounded-lg font-bold text-xl transition-all duration-200 group
              disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed
              bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
          >
            <GoldCoinIcon size={24} className="mr-2 inline-block group-hover:animate-pulse" />
            Thu Thập Toàn Bộ
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-base text-slate-400 z-10">
        Ngân khố của bạn: <span className="font-bold text-yellow-300">{currentCoins.toLocaleString()}</span> <GoldCoinIcon size={18} className="ml-1 inline-block" />
      </p>

      {/* Add custom animations to tailwind.config.js or a <style> tag if needed */}
      <style jsx global>{`
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once {
          animation: ping-once 0.6s ease-out;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out;
        }
        @keyframes fade-up-out {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-up-out {
          animation: fade-up-out 1.5s forwards;
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GoldMine;
