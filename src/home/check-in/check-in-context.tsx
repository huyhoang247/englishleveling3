// --- START OF FILE check-in-context.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
// Import các assets cần thiết cho UI
import { uiAssets, equipmentUiAssets, minerAssets, bossBattleAssets, upgradeAssets } from '../../game-assets.ts'; 
import { auth } from '../../firebase.js';
import { processDailyCheckIn, getCheckInMultiplier } from './check-in-service.ts';

// Re-export helper để UI sử dụng mà không cần import từ service
export { getCheckInMultiplier };

// --- CẤU HÌNH UI CHO PHẦN THƯỞNG (Full 7 ngày) ---
export const dailyRewardsUI = [
  { 
      day: 1, 
      items: [
          { name: "Gold", amount: "1000", type: 'coins', icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 2, 
      items: [
          { name: "Ancient Book", amount: "10", type: 'ancientBooks', icon: <img src={uiAssets.bookIcon} alt="Ancient Book" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 3, 
      items: [
          { name: "Equipment Piece", amount: "10", type: 'equipmentPieces', icon: <img src={equipmentUiAssets.equipmentPieceIcon} alt="Equipment Piece" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 4, 
      items: [
          { name: "Basic Stone", amount: "10", type: 'stone_low', icon: <img src={upgradeAssets.stoneBasic} alt="Basic Stone" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 5, 
      items: [
          { name: "Pickaxe", amount: "5", type: 'pickaxes', icon: <img src={minerAssets.pickaxeIcon} alt="Pickaxe" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 6, 
      items: [
          { name: "Inter. Stone", amount: "10", type: 'stone_medium', icon: <img src={upgradeAssets.stoneIntermediate} alt="Intermediate Stone" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 7, 
      items: [
          { name: "Pickaxe", amount: "10", type: 'pickaxes', icon: <img src={minerAssets.pickaxeIcon} alt="Special Pickaxe" className="w-full h-full object-contain" /> },
          { name: "Adv. Stone", amount: "10", type: 'stone_high', icon: <img src={upgradeAssets.stoneAdvanced} alt="Advanced Stone" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", type: 'energy', icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
];

// --- ĐỊNH NGHĨA TYPES ---
interface Particle {
  id: number;
  style: React.CSSProperties;
  className: string;
}

interface CheckInContextType {
  // Trạng thái cơ bản
  loginStreak: number;
  isSyncingData: boolean;
  canClaimToday: boolean;
  claimableDay: number;
  isClaiming: boolean;

  // Animation sau khi nhận quà
  showRewardAnimation: boolean;
  particles: Particle[];
  
  // State quản lý Modal Ads
  showAdsModal: boolean;
  pendingRewardDay: number | null; // Lưu lại ngày đang chọn để claim

  // Dữ liệu User
  coins: number;
  masteryCards: number; 

  // Actions
  openClaimModal: (day: number) => void; // Thay thế claimReward cũ
  confirmClaim: (multiplier: 1 | 2) => Promise<void>; // Hàm gọi service
  closeAdsModal: () => void;
  handleClose: () => void;
}

// --- KHỞI TẠO CONTEXT ---
const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface CheckInProviderProps {
  children: ReactNode;
  onClose: () => void;
}

export const CheckInProvider = ({ children, onClose }: CheckInProviderProps) => {
  // Lấy dữ liệu từ GameContext
  const { loginStreak, lastCheckIn, isSyncingData, setIsSyncingData, coins, masteryCards } = useGame();

  // States cho Animation Visual Feedback
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // NEW STATES: Quản lý Modal Ads
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [pendingRewardDay, setPendingRewardDay] = useState<number | null>(null);

  // States Logic Check-in
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimableDay, setClaimableDay] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);

  const particleClasses = ["animate-float-particle-1", "animate-float-particle-2", "animate-float-particle-3", "animate-float-particle-4", "animate-float-particle-5"];

  // --- EFFECT: XÁC ĐỊNH TRẠNG THÁI CLAIM (LOCK/AVAILABLE) ---
  useEffect(() => {
    const now = new Date();
    const last = lastCheckIn;

    if (!last) { 
        setCanClaimToday(true);
        setClaimableDay(1); 
        return;
    }

    const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() &&
                      last.getUTCMonth() === now.getUTCMonth() &&
                      last.getUTCDate() === now.getUTCDate();

    setCanClaimToday(!isSameDay);

    if (isSameDay) {
        // Nếu đã nhận hôm nay, ngày claim tiếp theo là ngày kế tiếp
        const nextDayInCycle = (loginStreak % 7) + 1;
        setClaimableDay(nextDayInCycle);
    } else {
        // Kiểm tra xem có phải là ngày liên tiếp không
        const yesterday = new Date(now);
        yesterday.setUTCDate(now.getUTCDate() - 1);
        const isConsecutive = last.getUTCFullYear() === yesterday.getUTCFullYear() &&
                              last.getUTCMonth() === yesterday.getUTCMonth() &&
                              last.getUTCDate() === yesterday.getUTCDate();
        
        if (isConsecutive) {
            const dayToClaim = (loginStreak % 7) + 1;
            setClaimableDay(dayToClaim);
        } else {
            // Mất chuỗi -> Reset về ngày 1
            setClaimableDay(1);
        }
    }
  }, [lastCheckIn, loginStreak]);

  // --- EFFECT: TIMER TỰ ĐỘNG BẬT NÚT CLAIM KHI QUA 00:00 UTC ---
  useEffect(() => {
    if (canClaimToday) return; 
    
    const now = new Date();
    const nextUTCDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diff = nextUTCDay.getTime() - now.getTime();

    const timer = setTimeout(() => {
        setCanClaimToday(true);
    }, diff);

    return () => clearTimeout(timer);
  }, [canClaimToday]);

  // --- ACTION: MỞ MODAL XÁC NHẬN (CHƯA GỌI API) ---
  const openClaimModal = useCallback((day: number) => {
      // Kiểm tra điều kiện hợp lệ
      if (!canClaimToday || day !== claimableDay || isClaiming || isSyncingData) return;
      
      // Set ngày đang chờ xử lý và mở Modal
      setPendingRewardDay(day);
      setShowAdsModal(true);
  }, [canClaimToday, claimableDay, isClaiming, isSyncingData]);

  // --- ACTION: ĐÓNG MODAL ---
  const closeAdsModal = useCallback(() => {
      setShowAdsModal(false);
      setPendingRewardDay(null);
  }, []);

  // --- ACTION: XÁC NHẬN NHẬN THƯỞNG (GỌI API SERVICE) ---
  // multiplier: 1 (Nhận thường) hoặc 2 (Xem Ads)
  const confirmClaim = useCallback(async (multiplier: 1 | 2) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Người dùng chưa được xác thực.");
      return;
    }

    setIsClaiming(true);
    
    // Đóng modal ngay lập tức để trải nghiệm mượt mà
    setShowAdsModal(false); 
    setPendingRewardDay(null);

    try {
      setIsSyncingData(true);
      
      // GỌI SERVICE: Truyền thêm tham số multiplier
      await processDailyCheckIn(userId, multiplier);
      
      setIsSyncingData(false);

      // --- CHẠY ANIMATION PARTICLES (Feedback visual) ---
      const generatedParticles: Particle[] = Array.from({ length: 20 }).map((_, i) => {
        const randomAnimClass = particleClasses[i % particleClasses.length];
        return {
          id: i,
          className: `absolute w-2 h-2 rounded-full ${randomAnimClass}`,
          style: {
            top: `${50 + (Math.random() * 40 - 20)}%`, left: `${50 + (Math.random() * 40 - 20)}%`,
            backgroundColor: i % 2 === 0 ? '#8b5cf6' : '#ffffff',
            boxShadow: `0 0 10px 2px rgba(255, 255, 255, 0.3)`,
            opacity: Math.random() * 0.7 + 0.3,
            animationDuration: `${2 + Math.random() * 2}s`, animationDelay: `${Math.random() * 0.5}s`
          }
        };
      });
      setParticles(generatedParticles);
      setShowRewardAnimation(true);

      // Reset trạng thái sau khi animation kết thúc
      setTimeout(() => {
        setShowRewardAnimation(false);
        setIsClaiming(false);
        setParticles([]);
      }, 3000); 

    } catch (error: any) {
        alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        setIsClaiming(false);
        setIsSyncingData(false);
    }
  }, [particleClasses, setIsSyncingData]);

  // --- MEMOIZE CONTEXT VALUE ---
  const value = useMemo(() => ({
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    
    showRewardAnimation, 
    particles,
    
    showAdsModal, 
    pendingRewardDay,
    
    coins, 
    masteryCards,
    
    openClaimModal, 
    confirmClaim, 
    closeAdsModal,
    handleClose: onClose,
  }), [
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    showRewardAnimation, 
    particles,
    showAdsModal, 
    pendingRewardDay,
    coins,
    masteryCards,
    openClaimModal, 
    confirmClaim, 
    closeAdsModal,
    onClose
  ]);

  return <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useCheckIn = (): CheckInContextType => {
  const context = useContext(CheckInContext);
  if (context === undefined) {
    throw new Error('useCheckIn phải được sử dụng trong CheckInProvider');
  }
  return context;
};
