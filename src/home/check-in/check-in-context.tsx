// --- START OF FILE CheckInContext.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
// --- THÊM MỚI: Import tài nguyên từ game-assets ---
import { uiAssets, equipmentUiAssets } from '../../game-assets.ts'; 

// --- BƯỚC 1: XÓA BỎ CÁC ĐỊNH NGHĨA ICON SVG NỘI TUYẾN ---
// Các component StarIcon, SparklesIcon, ZapIcon, ShieldIcon, GiftIcon, FlameIcon, CrownIcon đã được xóa.

// --- BƯỚC 2: CẬP NHẬT DỮ LIỆU PHẦN THƯỞNG VỚI ICON TỪ game-assets ---
// Thêm class `align-middle` vào mỗi icon để sửa lỗi căn chỉnh bị lệch xuống dưới.
export const dailyRewards = [
  { day: 1, name: "Vàng", amount: "1000", icon: <img src={uiAssets.goldIcon} alt="Vàng" className="w-10 h-10 object-contain align-middle" /> },
  { day: 2, name: "Sách Cổ", amount: "10", icon: <img src={uiAssets.bookIcon} alt="Sách Cổ" className="w-10 h-10 object-contain align-middle" /> },
  { day: 3, name: "Mảnh Trang Bị", amount: "10", icon: <img src={equipmentUiAssets.equipmentPieceIcon} alt="Mảnh Trang Bị" className="w-10 h-10 object-contain align-middle" /> },
  { day: 4, name: "Dung Lượng Thẻ", amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Dung Lượng Thẻ" className="w-10 h-10 object-contain align-middle" /> },
  { day: 5, name: "Cúp", amount: "5", icon: <img src={uiAssets.pvpIcon} alt="Cúp" className="w-10 h-10 object-contain align-middle" /> },
  { day: 6, name: "Dung Lượng Thẻ", amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Dung Lượng Thẻ" className="w-10 h-10 object-contain align-middle" /> },
  { day: 7, name: "Cúp", amount: "10", icon: <img src={uiAssets.gemIcon} alt="Cúp đặc biệt" className="w-10 h-10 object-contain align-middle" /> },
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
  const { loginStreak, lastCheckIn, handleCheckInClaim, isSyncingData } = useGame();

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

    const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() && last.getUTCMonth() === now.getUTCMonth() && last.getUTCDate() === now.getUTCDate();
    setCanClaimToday(!isSameDay);

    const yesterday = new Date(now);
    yesterday.setUTCDate(now.getUTCDate() - 1);
    const isConsecutive = last.getUTCFullYear() === yesterday.getUTCFullYear() && last.getUTCMonth() === yesterday.getUTCMonth() && last.getUTCDate() === yesterday.getUTCDate();
    setClaimableDay(isConsecutive ? (loginStreak % 7) + 1 : 1);
  }, [lastCheckIn, loginStreak]);

  const claimReward = useCallback(async (day: number) => {
    if (!canClaimToday || day !== claimableDay || isClaiming || isSyncingData) return;
    setIsClaiming(true);
    try {
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
      
      const claimedRewardData = await handleCheckInClaim();
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
    }
  }, [canClaimToday, claimableDay, isClaiming, isSyncingData, handleCheckInClaim]);

  // --- TỐI ƯU HÓA: SỬ DỤNG useMemo ĐỂ TRÁNH TẠO LẠI OBJECT 'value' KHÔNG CẦN THIẾT ---
  const value = useMemo(() => ({
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    showRewardAnimation, 
    animatingReward, 
    particles,
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

// --- END OF FILE CheckInContext.tsx ---
