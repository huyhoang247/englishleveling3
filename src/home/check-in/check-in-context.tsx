import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
import { uiAssets, equipmentUiAssets, minerAssets } from '../../game-assets.ts';
import { auth } from '../../firebase.js';
import { processDailyCheckIn } from './check-in-service.ts';

// Dữ liệu phần thưởng hàng ngày
export const dailyRewards = [
  { day: 1, name: "Vàng", type: 'coins', amount: "1000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
  { day: 2, name: "Sách Cổ", type: 'ancientBooks', amount: "10", icon: <img src={uiAssets.bookIcon} alt="Ancient Book" className="w-10 h-10 object-contain" /> },
  { day: 3, name: "Mảnh Trang Bị", type: 'equipmentPieces', amount: "10", icon: <img src={equipmentUiAssets.equipmentPieceIcon} alt="Equipment Piece" className="w-10 h-10 object-contain" /> },
  { day: 4, name: "Dung Lượng Thẻ", type: 'cardCapacity', amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Card Capacity" className="w-10 h-10 object-contain" /> },
  { day: 5, name: "Cúp", type: 'pickaxes', amount: "5", icon: <img src={minerAssets.pickaxeIcon} alt="Pickaxe" className="w-10 h-10 object-contain" /> },
  { day: 6, name: "Dung Lượng Thẻ", type: 'cardCapacity', amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Card Capacity" className="w-10 h-10 object-contain" /> },
  { day: 7, name: "Cúp", type: 'pickaxes', amount: "10", icon: <img src={minerAssets.pickaxeIcon} alt="Special Pickaxe" className="w-10 h-10 object-contain" /> },
];

// --- THÊM MỚI: Định nghĩa phần thưởng mốc chuỗi cho UI ---
export const streakMilestoneRewards = [
  { day: 7, name: "Thưởng Chuỗi 7 Ngày", type: 'coins', amount: "5000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
  { day: 14, name: "Thưởng Chuỗi 14 Ngày", type: 'coins', amount: "10000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
];


// --- ĐỊNH NGHĨA TYPES ---
interface Particle {
  id: number;
  style: React.CSSProperties;
  className: string;
}

interface CheckInContextType {
  loginStreak: number; // Chuỗi trong chu kỳ 7 ngày
  totalLoginStreak: number; // Tổng chuỗi
  isSyncingData: boolean;
  canClaimToday: boolean;
  claimableDay: number;
  isClaiming: boolean;
  showRewardAnimation: boolean;
  animatingReward: any;
  particles: Particle[];
  countdown: string;
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
  // --- SỬA ĐỔI: Lấy thêm totalLoginStreak từ GameContext ---
  const { loginStreak, totalLoginStreak, lastCheckIn, isSyncingData, setIsSyncingData } = useGame();

  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [animatingReward, setAnimatingReward] = useState<any>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimableDay, setClaimableDay] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdown, setCountdown] = useState('00:00:00');

  const particleClasses = ["animate-float-particle-1", "animate-float-particle-2", "animate-float-particle-3", "animate-float-particle-4", "animate-float-particle-5"];

  useEffect(() => {
    const now = new Date();
    const last = lastCheckIn;

    if (!last) {
        setCanClaimToday(true);
        setClaimableDay(1);
        return;
    }

    const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() && last.getUTCMonth() === now.getUTCMonth() && last.getUTCDate() === now.getUTCDate();
    setCanClaimToday(!isSameDay);

    const yesterday = new Date(now);
    yesterday.setUTCDate(now.getUTCDate() - 1);
    const isConsecutive = last.getUTCFullYear() === yesterday.getUTCFullYear() && last.getUTCMonth() === yesterday.getUTCMonth() && last.getUTCDate() === yesterday.getUTCDate();
    setClaimableDay(isConsecutive ? (loginStreak % 7) + 1 : 1);
  }, [lastCheckIn, loginStreak]);

  // --- useEffect để xử lý countdown ---
  useEffect(() => {
    if (canClaimToday) {
      setCountdown('00:00:00');
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const nextUTCDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diff = nextUTCDay.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('00:00:00');
        setCanClaimToday(true); 
        clearInterval(intervalId);
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60))).toString().padStart(2, '0');
        const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        setCountdown(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
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
      const { claimedReward: claimedRewardData, milestoneRewardClaimed } = await processDailyCheckIn(userId);
      setIsSyncingData(false);

      if (milestoneRewardClaimed) {
          // Bạn có thể thêm một thông báo toast ở đây để người dùng biết đã nhận thêm thưởng mốc
          console.log(`Nhận được phần thưởng mốc: ${milestoneRewardClaimed.name} x${milestoneRewardClaimed.amount}`);
      }

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

      const rewardForAnimation = dailyRewards.find(r => r.day === claimedRewardData.day);
      
      setAnimatingReward({ ...rewardForAnimation, amount: claimedRewardData.amount });
      setShowRewardAnimation(true);

      setTimeout(() => {
        setShowRewardAnimation(false);
        setIsClaiming(false);
        setParticles([]);
      }, 2000);
    } catch (error: any) {
        alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        setIsClaiming(false);
        setIsSyncingData(false);
    }
  }, [canClaimToday, claimableDay, isClaiming, isSyncingData, setIsSyncingData]);

  const value = useMemo(() => ({
    loginStreak, 
    totalLoginStreak, // --- THÊM MỚI: Cung cấp totalLoginStreak cho UI ---
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    showRewardAnimation, 
    animatingReward, 
    particles,
    countdown,
    claimReward, 
    handleClose: onClose,
  }), [
    loginStreak, 
    totalLoginStreak, // --- THÊM MỚI: Thêm vào dependencies của useMemo ---
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    showRewardAnimation, 
    animatingReward, 
    particles,
    countdown,
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
