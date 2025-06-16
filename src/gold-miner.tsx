// --- START OF FILE gold-miner.tsx (17-upgraded).txt ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js'; 
import MinerHiringSection from './miner/thomo.tsx'; 

// --- INTERFACES ---
interface GoldMineProps {
  onClose: () => void;
  currentCoins: number;
  onUpdateCoins: (amount: number) => Promise<void>; 
  onUpdateDisplayedCoins: (amount: number) => void;
  currentUserId: string;
  isGamePaused: boolean;
}

// --- HELPER COMPONENTS ---

// AnimatedNumber Component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const valueRef = useRef(value);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startValue = valueRef.current;
    const endValue = value;
    const duration = 500; // Animation duration in ms
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const newDisplayValue = Math.floor(startValue + (endValue - startValue) * progress);
      
      setCurrentValue(newDisplayValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
        valueRef.current = endValue;
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span>{Math.floor(currentValue).toLocaleString()}</span>;
};

// Floating Gold Particle Component
const FloatingGold = ({ id, onAnimationEnd }: { id: number, onAnimationEnd: (id: number) => void }) => {
    const style = {
        left: `${20 + Math.random() * 60}%`, // Random horizontal position
        animationDuration: `${1.5 + Math.random()}s`,
    };
    return (
        <div 
            className="floating-gold-particle" 
            style={style} 
            onAnimationEnd={() => onAnimationEnd(id)}
        >
            <CoinIcon size={20} className="text-yellow-400 drop-shadow-lg" />
        </div>
    );
};


// --- ICONS (same as before) ---
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props} >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const CoinIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="gold" strokeWidth="1" className={className} {...props} >
    <circle cx="12" cy="12" r="10" fill="gold" />
    <text x="12" y="16" fontSize="12" textAnchor="middle" fill="darkgoldenrod" fontWeight="bold">$</text>
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
const UpgradeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m2 16 4-4 4 4M2 8l4 4 4-4"/><path d="M14 4h6v6"/><path d="m22 4-7 7"/></svg>
);
const BoostIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m14.31 8.69 1.4-1.4M8.69 14.31l-1.4 1.4M12 17v-5"/><path d="M12 8V7"/></svg>
);

// --- MODAL COMPONENT (Optimized) ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 font-sans">
            <div className="relative bg-slate-900 rounded-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-700">
                <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-600 p-3 flex items-center justify-between z-10">
                    <h2 className="text-xl font-display text-yellow-400">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-slate-700" aria-label="Đóng">
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close" className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// --- MAIN GOLDMINE COMPONENT ---
const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, onUpdateDisplayedCoins, currentUserId, isGamePaused }) => {
    // --- STATE MANAGEMENT ---
    const [minedGold, setMinedGold] = useState(0);
    const [basicMiners, setBasicMiners] = useState(0);
    const [advancedMiners, setAdvancedMiners] = useState(0);
    const [masterMiners, setMasterMiners] = useState(0);
    const [mineLevel, setMineLevel] = useState(1);
    const [boostEndTime, setBoostEndTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [isMinerHiringModalOpen, setIsMinerHiringModalOpen] = useState(false);
    const [floatingParticles, setFloatingParticles] = useState<number[]>([]);
    
    const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const db = getFirestore();

    // --- CONSTANTS & CONFIG ---
    const MINE_LEVEL_COST_BASE = 5000;
    const MINE_LEVEL_COST_MULTIPLIER = 1.8;
    const MINE_LEVEL_BONUS_PER_LEVEL = 0.05; // 5% bonus per level
    const BOOST_COST = 2500;
    const BOOST_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    const MINER_TYPES = useMemo(() => [
        { id: 'basic', name: 'Thợ Mỏ Cơ Bản', description: 'Tăng sản lượng vàng ổn định.', baseCost: 200, baseRate: 0.05, icon: MinersIcon, sellReturnFactor: 0.5 },
        { id: 'advanced', name: 'Thợ Mỏ Cao Cấp', description: 'Khai thác vàng nhanh hơn đáng kể.', baseCost: 1500, baseRate: 0.3, icon: AdvancedMinerIcon, sellReturnFactor: 0.5 },
        { id: 'master', name: 'Bậc Thầy Khai Thác', description: 'Bậc thầy khai thác, hiệu suất cực cao.', baseCost: 8000, baseRate: 1.5, icon: MasterMinerIcon, sellReturnFactor: 0.6 },
    ], []);

    const mineUpgradeCost = useMemo(() => Math.floor(MINE_LEVEL_COST_BASE * Math.pow(MINE_LEVEL_COST_MULTIPLIER, mineLevel - 1)), [mineLevel]);
    
    // --- CORE LOGIC ---
    const getCurrentMiningRate = useCallback(() => {
        const baseRate = (basicMiners * MINER_TYPES[0].baseRate) + (advancedMiners * MINER_TYPES[1].baseRate) + (masterMiners * MINER_TYPES[2].baseRate);
        const levelBonus = 1 + ((mineLevel - 1) * MINE_LEVEL_BONUS_PER_LEVEL);
        const boostMultiplier = Date.now() < boostEndTime ? 2 : 1;
        return baseRate * levelBonus * boostMultiplier;
    }, [basicMiners, advancedMiners, masterMiners, mineLevel, boostEndTime, MINER_TYPES]);

    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const saveMineData = useCallback(async (dataToSave: { [key: string]: any }) => {
        if (!currentUserId) return;
        try {
            const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
            await setDoc(mineDocRef, { ...dataToSave, lastMineActivityTime: Date.now() }, { merge: true });
        } catch (error) {
            console.error("GoldMine: Error saving mine data:", error);
        }
    }, [currentUserId, db]);

    // --- DATA FETCHING & INITIALIZATION ---
    useEffect(() => {
        const fetchMineData = async () => {
            if (!currentUserId) { setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
                const mineDocSnap = await getDoc(mineDocRef);

                if (mineDocSnap.exists()) {
                    const data = mineDocSnap.data();
                    let { minedGold = 0, basicMiners = 0, advancedMiners = 0, masterMiners = 0, lastMineActivityTime = 0, mineLevel: dbMineLevel = 1, boostEndTime: dbBoostEndTime = 0 } = data;
                    
                    if ((basicMiners > 0 || advancedMiners > 0 || masterMiners > 0) && lastMineActivityTime > 0) {
                        const timeElapsedMs = Date.now() - lastMineActivityTime;
                        const timeElapsedSeconds = Math.max(0, timeElapsedMs / 1000);
                        const offlineBaseRate = (basicMiners * MINER_TYPES[0].baseRate) + (advancedMiners * MINER_TYPES[1].baseRate) + (masterMiners * MINER_TYPES[2].baseRate);
                        const offlineLevelBonus = 1 + ((dbMineLevel - 1) * MINE_LEVEL_BONUS_PER_LEVEL);
                        const goldAccumulatedOffline = offlineBaseRate * offlineLevelBonus * timeElapsedSeconds;
                        minedGold += goldAccumulatedOffline;
                        console.log(`GoldMine: Accumulated ${goldAccumulatedOffline.toFixed(2)} gold offline.`);
                    }
                    
                    setMinedGold(Math.max(0, minedGold));
                    setBasicMiners(basicMiners);
                    setAdvancedMiners(advancedMiners);
                    setMasterMiners(masterMiners);
                    setMineLevel(dbMineLevel);
                    setBoostEndTime(dbBoostEndTime);
                    saveMineData({ minedGold: Math.max(0, minedGold), basicMiners, advancedMiners, masterMiners, mineLevel: dbMineLevel, boostEndTime: dbBoostEndTime });
                } else {
                    await setDoc(mineDocRef, { minedGold: 0, basicMiners: 0, advancedMiners: 0, masterMiners: 0, mineLevel: 1, boostEndTime: 0, lastMineActivityTime: Date.now(), createdAt: new Date() });
                }
            } catch (error) {
                console.error("GoldMine: Error fetching data:", error);
                showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMineData();
    }, [currentUserId, db, MINER_TYPES, saveMineData]);

    // --- MINING INTERVAL ---
    useEffect(() => {
        const totalMiners = basicMiners + advancedMiners + masterMiners;
        if (isGamePaused || isLoading || totalMiners === 0) {
            if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
            miningIntervalRef.current = null;
            return;
        }

        if (miningIntervalRef.current === null) {
            miningIntervalRef.current = setInterval(() => {
                setMinedGold(prevGold => prevGold + getCurrentMiningRate());
            }, 1000);
        }
        
        // Save data periodically
        const saveDataInterval = setInterval(() => {
             saveMineData({ minedGold, basicMiners, advancedMiners, masterMiners, mineLevel, boostEndTime });
        }, 30000); // Save every 30 seconds

        return () => {
            if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
            clearInterval(saveDataInterval);
            saveMineData({ minedGold, basicMiners, advancedMiners, masterMiners, mineLevel, boostEndTime });
        };
    }, [basicMiners, advancedMiners, masterMiners, isGamePaused, isLoading, minedGold, mineLevel, boostEndTime, saveMineData, getCurrentMiningRate]);

    // --- ACTION HANDLERS (using transactions) ---
    const handleAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
        try {
            await action();
            showMessage(successMessage, "success");
        } catch (error: any) {
            console.error(`GoldMine Error: ${errorMessage}`, error);
            showMessage(`Lỗi: ${error.message || errorMessage}`, "error");
        }
    };
    
    const handleHireMiner = (minerId: string) => { /* ... implementation in child ... */ }; // Placeholder, logic now in child section
    const handleSellMiner = (minerId: string) => { /* ... implementation in child ... */ }; // Placeholder
    
    const handleCollectGold = () => handleAction(async () => {
        if (minedGold < 1 || !currentUserId) throw new Error("Không có vàng để thu thập.");
        const goldToCollect = Math.floor(minedGold);
        
        await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'users', currentUserId);
            const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
            const [userDocSnap, mineDocSnap] = await Promise.all([transaction.get(userDocRef), transaction.get(mineDocRef)]);

            if (!userDocSnap.exists() || !mineDocSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
            
            const remainingFractionalGold = Math.max(0, minedGold - goldToCollect);
            transaction.update(userDocRef, { coins: (userDocSnap.data().coins || 0) + goldToCollect });
            transaction.update(mineDocRef, { minedGold: remainingFractionalGold, lastMineActivityTime: Date.now() });
        });

        setMinedGold(prev => Math.max(0, prev - goldToCollect));
        onUpdateCoins(goldToCollect);
        onUpdateDisplayedCoins(currentCoins + goldToCollect);
        
        // Particle effect
        const newParticles = Array.from({ length: Math.min(20, goldToCollect/10) }, (_, i) => Date.now() + i);
        setFloatingParticles(prev => [...prev, ...newParticles]);

    }, `Đã thu thập ${Math.floor(minedGold).toLocaleString()} vàng!`, "Không thể thu thập vàng.");

    const handleUpgradeMine = () => handleAction(async () => {
        if (currentCoins < mineUpgradeCost) throw new Error("Không đủ vàng để nâng cấp.");
        await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'users', currentUserId);
            const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
            const userDocSnap = await transaction.get(userDocRef);
            if (!userDocSnap.exists()) throw new Error("User data not found.");
            
            transaction.update(userDocRef, { coins: userDocSnap.data().coins - mineUpgradeCost });
            transaction.update(mineDocRef, { mineLevel: mineLevel + 1 });
        });
        
        onUpdateCoins(-mineUpgradeCost);
        onUpdateDisplayedCoins(currentCoins - mineUpgradeCost);
        setMineLevel(prev => prev + 1);

    }, `Đã nâng cấp mỏ lên Cấp ${mineLevel + 1}!`, "Không thể nâng cấp mỏ.");

    const handleActivateBoost = () => handleAction(async () => {
        if (currentCoins < BOOST_COST) throw new Error("Không đủ vàng để tăng tốc.");
        if (Date.now() < boostEndTime) throw new Error("Tăng tốc vẫn đang hoạt động.");
        
        await runTransaction(db, async (transaction) => {
             const userDocRef = doc(db, 'users', currentUserId);
             const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
             const userDocSnap = await transaction.get(userDocRef);
             if (!userDocSnap.exists()) throw new Error("User data not found.");
             
             transaction.update(userDocRef, { coins: userDocSnap.data().coins - BOOST_COST });
             transaction.update(mineDocRef, { boostEndTime: Date.now() + BOOST_DURATION_MS });
        });

        onUpdateCoins(-BOOST_COST);
        onUpdateDisplayedCoins(currentCoins - BOOST_COST);
        setBoostEndTime(Date.now() + BOOST_DURATION_MS);
    }, `Đã kích hoạt Tăng Tốc x2 trong 5 phút!`, "Không thể kích hoạt tăng tốc.");

    // --- RENDER ---
    const totalMiningRate = getCurrentMiningRate();
    const totalMinersCount = basicMiners + advancedMiners + masterMiners;
    const boostTimeLeft = Math.max(0, Math.round((boostEndTime - Date.now()) / 1000));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-slate-900 text-yellow-400 rounded-lg p-4">
                <div className="text-center font-display">
                    <PickaxeIcon className="animate-bounce mx-auto mb-2 text-yellow-500" size={32} />
                    <div className="text-lg">ĐANG TIẾN VÀO HẦM MỎ...</div>
                </div>
            </div>
        );
    }
    
    // Add some global styles for animations
    const globalStyles = `
        @keyframes float-up {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-100px); opacity: 0; }
        }
        .floating-gold-particle {
            position: absolute;
            bottom: 50%;
            pointer-events: none;
            animation: float-up ease-out forwards;
        }
    `;

    return (
        <>
            <style>{globalStyles}</style>
            <div 
                className="relative w-full h-full flex flex-col items-center justify-between bg-cover bg-center text-gray-200 p-3 rounded-lg shadow-xl overflow-hidden font-sans"
                style={{backgroundImage: "url('https://i.imgur.com/kYmIrO5.jpeg')"}}
            >
                {/* Background overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                {/* Main Content Area */}
                <div className="relative z-10 w-full flex-1 flex flex-col">
                    {/* Header */}
                    <div className="w-full text-center mb-4">
                        <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                            HẦM MỎ HOÀNG GIA
                        </h2>
                    </div>

                    {/* Stats Panel */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="bg-black/40 p-2 rounded-lg border border-slate-600/50">
                            <p className="text-xs text-cyan-300 font-semibold">THỢ MỎ</p>
                            <p className="text-lg font-bold text-white">{totalMinersCount}</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded-lg border border-slate-600/50">
                             <p className="text-xs text-yellow-300 font-semibold">SẢN LƯỢNG</p>
                             <p className="text-lg font-bold text-yellow-400">{totalMiningRate.toFixed(2)}/s</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded-lg border border-slate-600/50">
                            <p className="text-xs text-purple-300 font-semibold">CẤP MỎ</p>
                            <p className="text-lg font-bold text-white">Lv. {mineLevel}</p>
                        </div>
                    </div>
                    
                    {/* Main Collection Area */}
                    <div className="relative flex-grow w-full flex flex-col items-center justify-center bg-black/30 border border-amber-600/30 rounded-xl p-4 my-2 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
                        <div className="absolute -top-3 bg-slate-800 px-3 py-1 rounded-full text-xs text-amber-300 border border-amber-600/30">VÀNG ĐÃ KHAI THÁC</div>
                        
                        {/* Floating particles container */}
                        <div className="absolute inset-0 z-20 overflow-hidden">
                            {floatingParticles.map(id => <FloatingGold key={id} id={id} onAnimationEnd={(endedId) => setFloatingParticles(p => p.filter(pId => pId !== endedId))} />)}
                        </div>
                        
                        <div className="text-center mb-4">
                            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
                                <AnimatedNumber value={minedGold} />
                            </span>
                        </div>
                        <button
                            onClick={handleCollectGold}
                            disabled={minedGold < 1}
                            className={`w-full max-w-xs py-3 rounded-lg font-bold text-lg transition-all duration-200 transform active:scale-95
                                ${minedGold < 1
                                    ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-b from-yellow-500 to-amber-600 text-slate-900 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:brightness-110'
                                }`}
                        >
                            THU THẬP
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <button
                            onClick={() => setIsMinerHiringModalOpen(true)}
                            className="p-2 bg-gradient-to-b from-cyan-600 to-blue-800 rounded-lg text-white font-semibold text-xs flex flex-col items-center gap-1 shadow-md hover:brightness-125 transition-all"
                        >
                           <MinersIcon size={20}/> Quản Lý
                        </button>
                        <button
                            onClick={handleUpgradeMine}
                            disabled={currentCoins < mineUpgradeCost}
                            className="p-2 bg-gradient-to-b from-purple-600 to-indigo-800 rounded-lg text-white font-semibold text-xs flex flex-col items-center gap-1 shadow-md hover:brightness-125 transition-all disabled:bg-slate-600/50 disabled:from-slate-600 disabled:to-slate-800 disabled:cursor-not-allowed disabled:hover:brightness-100"
                        >
                           <UpgradeIcon size={20}/>
                           Nâng Cấp
                           <span className="text-xxs opacity-80">({mineUpgradeCost.toLocaleString()})</span>
                        </button>
                        <button
                            onClick={handleActivateBoost}
                            disabled={currentCoins < BOOST_COST || boostTimeLeft > 0}
                            className="p-2 bg-gradient-to-b from-pink-500 to-red-700 rounded-lg text-white font-semibold text-xs flex flex-col items-center gap-1 shadow-md hover:brightness-125 transition-all disabled:bg-slate-600/50 disabled:from-slate-600 disabled:to-slate-800 disabled:cursor-not-allowed disabled:hover:brightness-100"
                        >
                           <BoostIcon size={20}/>
                           Tăng Tốc
                           {boostTimeLeft > 0 ? (
                                <span className="text-xxs opacity-80">{`${Math.floor(boostTimeLeft/60)}:${(boostTimeLeft%60).toString().padStart(2,'0')}`}</span>
                           ) : (
                                <span className="text-xxs opacity-80">({BOOST_COST.toLocaleString()})</span>
                           )}
                        </button>
                    </div>

                </div>

                {/* Footer and Close button */}
                <div className="relative z-10 w-full pt-3">
                     <button
                        onClick={onClose}
                        className="absolute -top-10 right-0 p-1.5 bg-black/30 rounded-full transition-colors hover:bg-red-500/50 z-20"
                        aria-label="Đóng"
                    >
                        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Close" className="w-5 h-5"/>
                    </button>
                    <div className="flex items-center justify-center gap-2 bg-black/50 rounded-lg p-2 border border-slate-600/20">
                        <CoinIcon size={20} className="text-yellow-400" />
                        <span className="text-sm text-gray-300">Vàng hiện có:</span>
                        <span className="font-bold text-yellow-400 text-lg"><AnimatedNumber value={currentCoins} /></span>
                    </div>
                </div>

                {/* Message Notification */}
                {message && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-sm font-semibold z-[100] shadow-lg transition-all duration-300
                    ${messageType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {message}
                    </div>
                )}
            </div>
            
            <Modal isOpen={isMinerHiringModalOpen} onClose={() => setIsMinerHiringModalOpen(false)} title="THUÊ THỢ MỎ">
              <MinerHiringSection
                // Cập nhật lại logic để truyền props đúng cách. 
                // Ta cần các hàm handleHire/Sell thực sự.
                // Tạm thời để đơn giản, chúng ta sẽ định nghĩa chúng lại ở đây, nhưng lý tưởng là chúng nên được định nghĩa 1 lần.
                // Trong thực tế, bạn sẽ truyền `handleHireMiner` và `handleSellMiner` đã được định nghĩa ở component cha.
                // Để code này chạy được ngay, tôi sẽ định nghĩa chúng lại.
                handleHireMiner={(minerId) => {
                    const minerType = MINER_TYPES.find(m => m.id === minerId);
                    if(!minerType) return;
                    handleAction(async () => {
                        if (currentCoins < minerType.baseCost) throw new Error("Không đủ vàng.");
                        await runTransaction(db, async(t) => {
                            const userRef = doc(db, 'users', currentUserId);
                            const mineRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
                            const [userSnap, mineSnap] = await Promise.all([t.get(userRef), t.get(mineRef)]);
                            if(!userSnap.exists() || !mineSnap.exists()) throw new Error("Dữ liệu không tồn tại.");
                            
                            const newCount = (mineSnap.data()[`${minerId}Miners`] || 0) + 1;
                            t.update(userRef, {coins: userSnap.data().coins - minerType.baseCost});
                            t.update(mineRef, {[`${minerId}Miners`]: newCount});
                        });

                        if (minerId === 'basic') setBasicMiners(p => p+1);
                        else if (minerId === 'advanced') setAdvancedMiners(p => p+1);
                        else if (minerId === 'master') setMasterMiners(p => p+1);
                        onUpdateCoins(-minerType.baseCost);
                        onUpdateDisplayedCoins(currentCoins-minerType.baseCost);
                    }, `Thuê ${minerType.name} thành công!`, `Lỗi khi thuê ${minerType.name}.`)
                }}
                handleSellMiner={(minerId) => {
                    const minerType = MINER_TYPES.find(m => m.id === minerId);
                    if(!minerType) return;
                    let currentMinerCount = 0;
                    if(minerId === 'basic') currentMinerCount = basicMiners;
                    else if (minerId === 'advanced') currentMinerCount = advancedMiners;
                    else if (minerId === 'master') currentMinerCount = masterMiners;

                    const sellValue = Math.floor(minerType.baseCost * minerType.sellReturnFactor);
                    handleAction(async () => {
                         if (currentMinerCount <= 0) throw new Error(`Không có ${minerType.name} để bán.`);
                         await runTransaction(db, async(t) => {
                             const userRef = doc(db, 'users', currentUserId);
                             const mineRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
                             const [userSnap, mineSnap] = await Promise.all([t.get(userRef), t.get(mineRef)]);
                             if(!userSnap.exists() || !mineSnap.exists()) throw new Error("Dữ liệu không tồn tại.");

                             const newCount = (mineSnap.data()[`${minerId}Miners`] || 0) - 1;
                             t.update(userRef, {coins: userSnap.data().coins + sellValue});
                             t.update(mineRef, {[`${minerId}Miners`]: newCount});
                         });

                         if (minerId === 'basic') setBasicMiners(p => p-1);
                         else if (minerId === 'advanced') setAdvancedMiners(p => p-1);
                         else if (minerId === 'master') setMasterMiners(p => p-1);
                         onUpdateCoins(sellValue);
                         onUpdateDisplayedCoins(currentCoins+sellValue);
                    }, `Bán ${minerType.name} thành công!`, `Lỗi khi bán ${minerType.name}.`)
                }}
                MINER_TYPES={MINER_TYPES.map(mt => ({...mt, count: mt.id === 'basic' ? basicMiners : mt.id === 'advanced' ? advancedMiners : masterMiners}))}
                currentCoins={currentCoins}
              />
            </Modal>
        </>
    );
};

export default GoldMine;
