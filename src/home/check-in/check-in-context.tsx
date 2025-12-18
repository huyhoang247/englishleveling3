// Filename: check-in-context.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
import { uiAssets, equipmentUiAssets, minerAssets } from '../../game-assets.ts';
import { auth } from '../../firebase.js';
import { processDailyCheckIn } from './check-in-service.ts';

// --- BƯỚC 2: CẬP NHẬT DỮ LIỆU PHẦN THƯỞNG VỚI ICON TỪ game-assets ---
export const dailyRewards = [
  { day: 1, name: "Gold", amount: "1000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
  { day: 2, name: "Ancient Book", amount: "10", icon: <img src={uiAssets.bookIcon} alt="Ancient Book" className="w-10 h-10 object-contain" /> },
  { day: 3, name: "Equipment Piece", amount: "10", icon: <img src={equipmentUiAssets.equipmentPieceIcon} alt="Equipment Piece" className="w-10 h-10 object-contain" /> },
  { day: 4, name: "Card Capacity", amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Card Capacity" className="w-10 h-10 object-contain" /> },
  { day: 5, name: "Pickaxe", amount: "5", icon: <img src={minerAssets.pickaxeIcon} alt="Pickaxe" className="w-10 h-10 object-contain" /> },
  { day: 6, name: "Card Capacity", amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Card Capacity" className="w-10 h-10 object-contain" /> },
  { day: 7, name: "Pickaxe", amount: "10", icon: <img src={minerAssets.pickaxeIcon} alt="Special Pickaxe" className="w-10 h-10 object-contain" /> },
];

// --- THÊM MỚI: ĐỊNH NGHĨA PHẦN THƯỞNG MỐC STREAK CHO UI ---
export const streakMilestoneRewards = [
    { streakGoal: 7, name: "Gold", amount: "5,000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
    { streakGoal: 14, name: "Gold", amount: "10,000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
];

// --- ĐỊNH NGHĨA TYPES ---
interface Particle {
  id: number;
  style: React.CSSProperties;
  className: string;
}

interface StreakMilestone {
    streakGoal: number;
    name: string;
    amount: string;
    icon: React.ReactNode;
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
  nextStreakGoal: StreakMilestone | null; 
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
  const { loginStreak, lastCheckIn, isSyncingData, setIsSyncingData, coins } = useGame();

  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [animatingReward, setAnimatingReward] = useState<any>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimableDay, setClaimableDay] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);

  const particleClasses = ["animate-float-particle-1", "animate-float-particle-2", "animate-float-particle-3", "animate-float-particle-4", "animate-float-particle-5"];

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
        const nextDayInCycle = (loginStreak % 7) + 1;
        setClaimableDay(nextDayInCycle);
    } else {
        const yesterday = new Date(now);
        yesterday.setUTCDate(now.getUTCDate() - 1);
        const isConsecutive = last.getUTCFullYear() === yesterday.getUTCFullYear() &&
                              last.getUTCMonth() === yesterday.getUTCMonth() &&
                              last.getUTCDate() === yesterday.getUTCDate();
        
        if (isConsecutive) {
            const dayToClaim = (loginStreak % 7) + 1;
            setClaimableDay(dayToClaim);
        } else {
            setClaimableDay(1);
        }
    }
  }, [lastCheckIn, loginStreak]);


  // --- SỬA ĐỔI: Thay thế đồng hồ đếm ngược bằng timeout để kích hoạt nút nhận quà ---
  useEffect(() => {
    if (canClaimToday) return; // Nếu đã nhận được thì không cần timer
    
    const now = new Date();
    // Tính thời điểm 00:00:00 UTC ngày mai
    const nextUTCDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diff = nextUTCDay.getTime() - now.getTime();

    // Thay vì nhảy số mỗi giây, ta chỉ đặt lịch hẹn giờ đến lúc qua ngày mới
    // để bật nút nhận thưởng
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
      const { dailyReward, streakReward } = await processDailyCheckIn(userId);
      setIsSyncingData(false);

      const dailyRewardForAnimation = dailyRewards.find(r => r.day === dailyReward.day);
      let streakRewardForAnimation = null;
      if (streakReward) {
          streakRewardForAnimation = streakMilestoneRewards.find(r => r.streakGoal === streakReward.streakGoal);
      }
      
      setAnimatingReward({ 
          daily: { ...dailyRewardForAnimation, amount: dailyReward.amount },
          streak: streakReward ? { ...streakRewardForAnimation, amount: streakReward.amount } : null
      });

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

  const nextStreakGoal = useMemo(() => {
    return streakMilestoneRewards.find(milestone => milestone.streakGoal > loginStreak) || null;
  }, [loginStreak]);

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
    nextStreakGoal, 
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
    nextStreakGoal, 
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
