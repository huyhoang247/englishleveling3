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

// Modal Component - Optimized for Mobile
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    // Changed items-end to items-center to center the modal vertically
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2"> 
      {/* Changed rounded-t-2xl to rounded-2xl for full rounding on mobile */}
      <div className="relative bg-slate-900 rounded-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-700">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-600 p-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-yellow-400">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <img 
              src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" 
              alt="Close" 
              className="w-5 h-5" // Changed from w-4 h-4 to w-5 h-5
              onError="this.onerror=null;this.src='https://placehold.co/16x16/cccccc/000000?text=X';" 
            />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
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
      // 1. Thực hiện transaction chỉ với thao tác lên Firestore
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
      });

      // 2. Sau khi transaction thành công mới cập nhật UI
      if (minerId === 'basic') setBasicMiners(prev => prev + 1);
      else if (minerId === 'advanced') setAdvancedMiners(prev => prev + 1);
      else if (minerId === 'master') setMasterMiners(prev => prev + 1);

      onUpdateCoins(-minerType.baseCost);
      onUpdateDisplayedCoins(currentCoins - minerType.baseCost);
      showMessage(`Đã thuê ${minerType.name} thành công!`, "success");
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
      // 1. Thực hiện transaction chỉ với thao tác lên Firestore
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
        } else if (minerId === 'advanced') {
          if (updatedAdvanced === 0) throw new Error("Không có thợ mỏ cao cấp để bán.");
          updatedAdvanced -= 1;
        } else if (minerId === 'master') {
          if (updatedMaster === 0) throw new Error("Không có thợ mỏ bậc thầy để bán.");
          updatedMaster -= 1;
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
      });

      // 2. Sau khi transaction thành công mới cập nhật UI
      if (minerId === 'basic') setBasicMiners(prev => prev - 1);
      else if (minerId === 'advanced') setAdvancedMiners(prev => prev - 1);
      else if (minerId === 'master') setMasterMiners(prev => prev - 1);

      onUpdateCoins(sellValue);
      onUpdateDisplayedCoins(currentCoins + sellValue);
      showMessage(`Đã bán ${minerType.name} thành công, nhận được ${sellValue} vàng!`, "success");
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
      // 1. Thực hiện transaction chỉ với thao tác lên Firestore
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
      });

      // 2. Sau khi transaction thành công mới cập nhật UI
      setMinedGold(prev => Math.max(0, prev - goldToCollect)); // Cập nhật minedGold sau khi thu thập
      onUpdateCoins(goldToCollect);
      onUpdateDisplayedCoins(currentCoins + goldToCollect);
      showMessage(`Đã thu thập ${goldToCollect} vàng!`, "success");
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thu thập vàng:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thu thập vàng."}`, "error");
    }
  };

  const totalMiningRate = getCurrentMiningRate();
  const totalMinersCount = basicMiners + advancedMiners + masterMiners;

  // Responsive Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-slate-900 text-yellow-400 rounded-lg p-4">
        <div className="text-center">
          <PickaxeIcon className="animate-spin mx-auto mb-2 text-yellow-500" size={24} />
          <div className="text-sm">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    // Main container optimized for mobile
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200 p-3 rounded-lg shadow-xl overflow-y-auto">
      {/* Removed SVG pattern and animated particles for mobile optimization */}

      {/* Optimized Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 rounded-lg transition-colors z-20"
        aria-label="Đóng"
      >
        <img 
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" 
          alt="Close" 
          className="w-5 h-5" // Changed from w-4 h-4 to w-5 h-5
          onError="this.onerror=null;this.src='https://placehold.co/16x16/cccccc/000000?text=X';" 
        />
      </button>

      {/* Optimized Header Title for Mobile */}
      <div className="relative mb-4 z-10 w-full">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 flex items-center justify-center">
          <PickaxeIcon size={28} className="text-amber-500 mr-2" />
          <span>Mỏ Vàng</span>
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-1"></div>
      </div>

      {/* Optimized Message Notification */}
      {message && (
        <div className={`fixed top-3 left-3 right-3 px-4 py-2 rounded-lg text-sm font-medium z-[100] shadow-lg transition-all duration-300
          ${messageType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {message}
        </div>
      )}

      {/* Optimized Layout for all content */}
      <div className="w-full max-w-sm mx-auto z-10 space-y-3 flex-1 flex flex-col">
        {/* Compact Stats Overview */}
        <div className="w-full bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-slate-600/30 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-400 flex items-center gap-1">
              <MinersIcon size={16} />
              Tổng Quan
            </h3>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-white font-bold text-lg">{totalMinersCount}</div>
              <div className="text-slate-400 text-xs">Thợ Mỏ</div>
            </div>
            <div className="w-px h-8 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">{totalMiningRate.toFixed(1)}/s</div>
              <div className="text-slate-400 text-xs">Tốc Độ</div>
            </div>
          </div>
        </div>

        {/* Compact Button for Miner Management */}
        <button
          onClick={() => setIsMinerHiringModalOpen(true)}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-3"
        >
          <MinersIcon size={18} />
          <span>Quản Lý Thợ Mỏ</span>
        </button>

        {/* Compact Gold Collection */}
        <div className="w-full bg-gradient-to-r from-amber-900/20 to-yellow-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-500/30 mb-3">
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CoinIcon size={24} className="text-yellow-400" />
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                {Math.floor(minedGold).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-amber-300">Vàng Sẵn Sàng</div>
          </div>
          <button
            onClick={handleCollectGold}
            disabled={minedGold < 1}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
              ${minedGold < 1
                ? 'bg-slate-600/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 shadow-lg'
              }`}
          >
            Thu Thập
          </button>
        </div>
      </div>

      {/* Compact Footer Coins Display */}
      <div className="mt-auto pt-3 w-full">
        <div className="flex items-center justify-center gap-2 bg-slate-800/30 rounded-lg p-2 border border-slate-600/20">
          <CoinIcon size={16} className="text-yellow-400" />
          <span className="text-sm text-gray-300">Đang có:</span>
          <span className="font-bold text-yellow-400">{currentCoins.toLocaleString()}</span>
        </div>
      </div>

      <Modal isOpen={isMinerHiringModalOpen} onClose={() => setIsMinerHiringModalOpen(false)} title="Miner">
        <MinerHiringSection
          MINER_TYPES={MINER_TYPES.map(mt => ({...mt, count: mt.id === 'basic' ? basicMiners : mt.id === 'advanced' ? advancedMiners : masterMiners}))}
          handleHireMiner={handleHireMiner}
          handleSellMiner={handleSellMiner}
          currentCoins={currentCoins}
          // CoinIcon={CoinIcon} // This prop is not used in MinerHiringSection, can be removed
        />
      </Modal>
    </div>
  );
};

export default GoldMine;
