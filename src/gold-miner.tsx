import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js'; // Giả sử firebase.js export auth
import MinerHiringSection from './miner/thomo.tsx'; // Import a MinerHiringSection component

// Định nghĩa props interface cho GoldMine component
interface GoldMineProps {
  onClose: () => void; // Hàm để đóng màn hình Mỏ Vàng
  currentCoins: number; // Số coin hiện tại từ component cha
  onUpdateCoins: (amount: number) => Promise<void>; // Hàm cập nhật coin chính ở component cha (và Firestore)
  onUpdateDisplayedCoins: (amount: number) => void; // MỚI: Hàm cập nhật coin hiển thị ở component cha ngay lập tức
  currentUserId: string; // ID người dùng đã xác thực hiện tại
  isGamePaused: boolean; // Prop để chỉ báo game chính có đang tạm dừng không
}

// --- BIỂU TƯỢNG SVG ---
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
    <path d="M2 13.17A2 2 0 0 0 3.17 12H0V9h3.17A2 2 0 0 0 2 7.83L4.93 2 12 6l7.07-4L22 7.83A2 2 0 0 0 20.83 9H24v3h-3.17A2 2 0 0 0 22 13.17L19.07 19H4.93Z"></path><path d="M12 6v12"></path>
  </svg>
);

// Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="relative bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-slate-600 pb-3">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 transition-colors z-20 backdrop-blur-sm flex items-center justify-center" // Removed rounded-full and bg-slate-700/80
          aria-label="Đóng"
        >
          <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" 
            alt="Close" 
            className="w-5 h-5" 
            onError="this.onerror=null;this.src='https://placehold.co/20x20/cccccc/000000?text=X';" 
          />
        </button>
        {children}
      </div>
    </div>
  );
};

const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, onUpdateDisplayedCoins, currentUserId, isGamePaused }) => {
  const [minedGold, setMinedGold] = useState(0);
  const [basicMiners, setBasicMiners] = useState(0);
  const [advancedMiners, setAdvancedMiners] = useState(0);
  const [masterMiners, setMasterMiners] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isMinerHiringModalOpen, setIsMinerHiringModalOpen] = useState(false);

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const db = getFirestore();

  const MINER_TYPES = [
    {
      id: 'basic',
      name: 'Thợ Mỏ Cơ Bản',
      description: 'Tăng sản lượng vàng ổn định.',
      baseCost: 200,
      baseRate: 0.05,
      icon: MinersIcon,
      count: basicMiners, // Sẽ được cập nhật từ state
      sellReturnFactor: 0.5,
    },
    {
      id: 'advanced',
      name: 'Thợ Mỏ Cao Cấp',
      description: 'Khai thác vàng nhanh hơn đáng kể.',
      baseCost: 1500,
      baseRate: 0.3,
      icon: AdvancedMinerIcon,
      count: advancedMiners, // Sẽ được cập nhật từ state
      sellReturnFactor: 0.5,
    },
    {
      id: 'master',
      name: 'Thợ Mỏ Bậc Thầy',
      description: 'Bậc thầy khai thác, hiệu suất cực cao.',
      baseCost: 8000,
      baseRate: 1.5,
      icon: MasterMinerIcon,
      count: masterMiners, // Sẽ được cập nhật từ state
      sellReturnFactor: 0.6,
    },
  ];

  const getCurrentMiningRate = () => {
    let totalRate = 0;
    MINER_TYPES.forEach(minerType => {
      // Lấy số lượng thợ mỏ hiện tại từ state tương ứng
      let currentCount = 0;
      if (minerType.id === 'basic') currentCount = basicMiners;
      else if (minerType.id === 'advanced') currentCount = advancedMiners;
      else if (minerType.id === 'master') currentCount = masterMiners;
      
      totalRate += currentCount * minerType.baseRate; // Chỉ sử dụng baseRate
    });
    return totalRate;
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
    currentMasterMiners: number
  ) => {
    if (!currentUserId) return;
    try {
      const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
      await setDoc(mineDocRef, {
        minedGold: Math.max(0, currentMinedGold),
        basicMiners: currentBasicMiners,
        advancedMiners: currentAdvancedMiners,
        masterMiners: currentMasterMiners,
        lastMineActivityTime: Date.now(),
      }, { merge: true });
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
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialBasicMiners = data.basicMiners || data.miners || 0;
          initialAdvancedMiners = data.advancedMiners || 0;
          initialMasterMiners = data.masterMiners || 0;
          lastMineActivityTime = data.lastMineActivityTime || 0;

          if ((initialBasicMiners > 0 || initialAdvancedMiners > 0 || initialMasterMiners > 0) && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = Math.max(0, timeElapsedMs / 1000);
            const offlineMiningRate =
              initialBasicMiners * (MINER_TYPES.find(m=>m.id==='basic')!.baseRate) +
              initialAdvancedMiners * (MINER_TYPES.find(m=>m.id==='advanced')!.baseRate) +
              initialMasterMiners * (MINER_TYPES.find(m=>m.id==='master')!.baseRate);
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
            lastMineActivityTime: Date.now(),
            createdAt: new Date()
          });
        }

        initialMinedGold = Math.max(0, initialMinedGold);
        setMinedGold(initialMinedGold);
        setBasicMiners(initialBasicMiners);
        setAdvancedMiners(initialAdvancedMiners);
        setMasterMiners(initialMasterMiners);
        saveMineData(initialMinedGold, initialBasicMiners, initialAdvancedMiners, initialMasterMiners);
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
        saveMineData(minedGold, basicMiners, advancedMiners, masterMiners);
      }
      return;
    }

    if (totalMiners > 0 && miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => {
          const rate = getCurrentMiningRate();
          const newGold = prevGold + rate;
          if (auth.currentUser && Math.random() < 0.1) {
            saveMineData(newGold, basicMiners, advancedMiners, masterMiners);
          }
          return newGold;
        });
      }, 1000);
    } else if (totalMiners === 0 && miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
      saveMineData(minedGold, basicMiners, advancedMiners, masterMiners);
    }

    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        saveMineData(minedGold, basicMiners, advancedMiners, masterMiners);
      }
    };
  }, [basicMiners, advancedMiners, masterMiners, isGamePaused, isLoading, db, minedGold]);

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

  const handleSellMiner = async (minerId: string) => {
    const minerType = MINER_TYPES.find(m => m.id === minerId);
    if (!minerType) return;

    let currentMinerCount = 0;
    if (minerId === 'basic') currentMinerCount = basicMiners;
    else if (minerId === 'advanced') currentMinerCount = advancedMiners;
    else if (minerId === 'master') currentMinerCount = masterMiners;
    
    if (currentMinerCount === 0) {
      showMessage(`Bạn không có ${minerType.name} để bán!`, "error");
      return;
    }

    const sellValue = Math.floor(minerType.baseCost * minerType.sellReturnFactor);
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
        
        transaction.update(userDocRef, { coins: currentMainCoins + goldToCollect });
        const remainingFractionalGold = Math.max(0, minedGold - goldToCollect);
        transaction.update(mineDocRef, {
          minedGold: remainingFractionalGold,
          lastMineActivityTime: Date.now(),
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
      <div className="flex items-center justify-center w-full h-full bg-slate-900 text-yellow-400 rounded-lg text-xl font-semibold p-4">
        <PickaxeIcon className="animate-spin mr-3 text-yellow-500" size={32} /> Đang tải dữ liệu mỏ vàng...
      </div>
    );
  }

  const totalMiningRate = getCurrentMiningRate();
  const totalMinersCount = basicMiners + advancedMiners + masterMiners;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/20 text-gray-200 p-4 sm:p-6 rounded-xl shadow-2xl overflow-y-auto before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] before:from-amber-900/10 before:via-transparent before:to-transparent before:pointer-events-none">
      {/* Existing SVG pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" width="100%" height="100%">
        <defs>
          <pattern id="rockPattern" patternUnits="userSpaceOnUse" width="80" height="80" patternTransform="scale(1) rotate(30)">
            <path d="M0 40 Q20 0 40 40 Q60 80 80 40 Q60 0 40 40 Q20 80 0 40" stroke="#FFFFFF" strokeWidth="0.3" fill="transparent" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rockPattern)" />
      </svg>

      {/* Animated particles for background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 transition-all duration-200 z-20 backdrop-blur-sm flex items-center justify-center"
        aria-label="Đóng"
      >
        <img 
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" 
          alt="Close" 
          className="w-5 h-5" 
          onError="this.onerror=null;this.src='https://placehold.co/20x20/cccccc/000000?text=X';" 
        />
      </button>

      {/* Upgraded Header Title */}
      <div className="relative mb-8 z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center">
          <div className="relative mr-4">
            <PickaxeIcon size={42} className="text-amber-500 drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <span className="relative">
            Mỏ Vàng Bất Tận
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          </span>
        </h2>
      </div>

      {message && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-base font-semibold z-[100] shadow-xl transition-all duration-300
          ${messageType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {message}
        </div>
      )}

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Upgraded "Tổng Quan Mỏ" section */}
        <div className="bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-600/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 border-b border-slate-600/50 pb-3 flex items-center gap-2 relative z-10">
            <MinersIcon size={24} className="text-cyan-400 drop-shadow-lg" />
            Tổng Quan Mỏ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base relative z-10">
            <div className="flex flex-col items-center bg-slate-700/30 backdrop-blur-sm p-4 rounded-xl border border-slate-600/20 hover:bg-slate-700/40 transition-all duration-300">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Tổng Thợ Mỏ</span>
              <span className="font-bold text-3xl text-white mt-2 drop-shadow-lg">{totalMinersCount}</span>
            </div>
            <div className="col-span-1 sm:col-span-2 flex flex-col items-center bg-gradient-to-br from-yellow-500/10 to-amber-500/10 backdrop-blur-sm p-4 rounded-xl border border-yellow-500/20 hover:from-yellow-500/15 hover:to-amber-500/15 transition-all duration-300">
              <span className="text-amber-300 text-xs uppercase tracking-wider font-medium">Tổng Tốc Độ Đào</span>
              <div className="flex items-center mt-2">
                <span className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 drop-shadow-lg">{totalMiningRate.toFixed(2)}</span>
                <span className="text-amber-400 ml-2 text-lg">vàng/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgraded "Quản Lý Đội Ngũ Thợ Mỏ" button */}
        <button
          onClick={() => setIsMinerHiringModalOpen(true)}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 border border-purple-500/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <MinersIcon size={26} className="drop-shadow-lg" />
          <span className="relative z-10">Quản Lý Đội Ngũ Thợ Mỏ</span>
        </button>

        {/* Upgraded Gold Collection Section */}
        <div className="bg-gradient-to-br from-slate-800/40 via-amber-900/10 to-slate-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-amber-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent"></div>
          <div className="flex flex-col items-center mb-6 relative z-10">
            <p className="text-base text-gray-300 mb-2 font-medium">Vàng Sẵn Sàng Thu Thập</p>
            <div className="flex items-center space-x-3 text-yellow-300 relative">
              <div className="relative">
                <CoinIcon size={42} className="text-yellow-400 drop-shadow-xl" />
                <div className="absolute inset-0 animate-ping">
                  <CoinIcon size={42} className="text-yellow-400/50" />
                </div>
              </div>
              <div className="relative">
                <p className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 drop-shadow-2xl">
                  {Math.floor(minedGold).toLocaleString()}
                </p>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent blur-sm"></div>
              </div>
            </div>
          </div>
          <button
            onClick={handleCollectGold}
            disabled={minedGold < 1}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 relative overflow-hidden group
              ${minedGold < 1
                ? 'bg-slate-600/50 text-gray-500 cursor-not-allowed border border-slate-500/30'
                : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-slate-900 border border-yellow-400/30'
              }`}
          >
            {minedGold >= 1 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            )}
            <span className="relative z-10 font-black text-xl">Thu Thập Toàn Bộ</span>
          </button>
        </div>
      </div>

      {/* Upgraded coin info in footer */}
      <div className="mt-8 text-center z-10 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/20">
        <p className="text-base text-gray-400 mb-2">Số vàng bạn đang có:</p>
        <div className="flex items-center justify-center space-x-2">
          <CoinIcon size={24} className="text-yellow-400 drop-shadow-lg" />
          <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
            {currentCoins.toLocaleString()}
          </span>
        </div>
      </div>

      <Modal isOpen={isMinerHiringModalOpen} onClose={() => setIsMinerHiringModalOpen(false)} title="Miner">
        <MinerHiringSection
          MINER_TYPES={MINER_TYPES.map(mt => ({...mt, count: mt.id === 'basic' ? basicMiners : mt.id === 'advanced' ? advancedMiners : masterMiners}))}
          handleHireMiner={handleHireMiner}
          handleSellMiner={handleSellMiner}
          currentCoins={currentCoins}
          CoinIcon={CoinIcon}
        />
      </Modal>
    </div>
  );
};

export default GoldMine;
