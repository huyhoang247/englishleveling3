// --- START OF FILE check-in-context.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
// Import upgradeAssets để lấy icon Đá cường hóa
import { uiAssets, equipmentUiAssets, minerAssets, bossBattleAssets, upgradeAssets } from '../../game-assets.ts'; 
import { auth } from '../../firebase.js';
import { processDailyCheckIn } from './check-in-service.ts';

// --- CẬP NHẬT DỮ LIỆU UI VỚI ENERGY VÀ ĐÁ CƯỜNG HÓA ---
// Mỗi ngày giờ đây chứa mảng 'items', trong đó item thứ 2 luôn là Energy x5 (trừ ngày 7 có 3 món)
export const dailyRewardsUI = [
  { 
      day: 1, 
      items: [
          { name: "Gold", amount: "1000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 2, 
      items: [
          { name: "Ancient Book", amount: "10", icon: <img src={uiAssets.bookIcon} alt="Ancient Book" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 3, 
      items: [
          { name: "Equipment Piece", amount: "10", icon: <img src={equipmentUiAssets.equipmentPieceIcon} alt="Equipment Piece" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 4, 
      items: [
          // Đã thay đổi: Card Capacity -> Basic Stone
          { name: "Basic Stone", amount: "10", icon: <img src={upgradeAssets.stoneBasic} alt="Basic Stone" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 5, 
      items: [
          { name: "Pickaxe", amount: "5", icon: <img src={minerAssets.pickaxeIcon} alt="Pickaxe" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 6, 
      items: [
          // Đã thay đổi: Card Capacity -> Intermediate Stone
          { name: "Inter. Stone", amount: "10", icon: <img src={upgradeAssets.stoneIntermediate} alt="Intermediate Stone" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
      ]
  },
  { 
      day: 7, 
      items: [
          { name: "Pickaxe", amount: "10", icon: <img src={minerAssets.pickaxeIcon} alt="Special Pickaxe" className="w-full h-full object-contain" /> },
          // Đã thêm: Advanced Stone
          { name: "Adv. Stone", amount: "10", icon: <img src={upgradeAssets.stoneAdvanced} alt="Advanced Stone" className="w-full h-full object-contain" /> },
          { name: "Energy", amount: "5", icon: <img src={bossBattleAssets.energyIcon} alt="Energy" className="w-full h-full object-contain" /> }
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
  loginStreak: number;
  isSyncingData: boolean;
  canClaimToday: boolean;
  claimableDay: number;
  isClaiming: boolean;
  showRewardAnimation: boolean;
  animatingReward: any;
  particles: Particle[];
  coins: number;
  masteryCards: number; // Thêm Mastery vào context để UI sử dụng
  claimReward: (day: number) => Promise<void>;
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
  // Lấy masteryCards từ GameContext
  const { loginStreak, lastCheckIn, isSyncingData, setIsSyncingData, coins, masteryCards } = useGame();

  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [animatingReward, setAnimatingReward] = useState<any>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimableDay, setClaimableDay] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);

  const particleClasses = ["animate-float-particle-1", "animate-float-particle-2", "animate-float-particle-3", "animate-float-particle-4", "animate-float-particle-5"];

  // Logic xác định trạng thái Check-in (Claimable, Claimed, Locked)
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
        // Nếu đã nhận hôm nay, ngày claim tiếp theo là ngày kế tiếp trong chu kỳ
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


  // --- Timeout để tự động kích hoạt nút nhận quà khi qua ngày mới (00:00 UTC) ---
  useEffect(() => {
    if (canClaimToday) return; // Nếu đã nhận được thì không cần timer
    
    const now = new Date();
    // Tính thời điểm 00:00:00 UTC ngày mai
    const nextUTCDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diff = nextUTCDay.getTime() - now.getTime();

    const timer = setTimeout(() => {
        setCanClaimToday(true);
    }, diff);

    return () => clearTimeout(timer);
  }, [canClaimToday]);

  const claimReward = useCallback(async (day: number) => {
    if (!canClaimToday || day !== claimableDay || isClaiming || isSyncingData) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Người dùng chưa được xác thực.");
      return;
    }

    setIsClaiming(true);
    try {
      setIsSyncingData(true);
      
      // Gọi service để cập nhật DB
      const { dailyReward } = await processDailyCheckIn(userId);
      setIsSyncingData(false);

      // Tìm cấu hình UI tương ứng với ngày vừa nhận để hiển thị animation
      const dailyRewardUIItem = dailyRewardsUI.find(r => r.day === dailyReward.day);
      
      // Animation hiển thị phần thưởng chính (Item đầu tiên trong mảng items)
      // Phần UI Overlay sẽ chịu trách nhiệm hiển thị thêm dòng "+5 Energy"
      setAnimatingReward({ 
          daily: dailyRewardUIItem ? dailyRewardUIItem.items[0] : null
      });

      // Tạo hiệu ứng hạt (Particles)
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

      // Tắt animation sau 3 giây
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
  }, [canClaimToday, claimableDay, isClaiming, isSyncingData, setIsSyncingData]);

  const value = useMemo(() => ({
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    showRewardAnimation, 
    animatingReward, 
    particles,
    coins, 
    masteryCards, // Pass masteryCards xuống Context Consumer
    claimReward, 
    handleClose: onClose,
  }), [
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    showRewardAnimation, 
    animatingReward, 
    particles,
    coins,
    masteryCards,
    claimReward, 
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
