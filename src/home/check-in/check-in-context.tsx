// --- START OF FILE CheckInContext.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';

// --- ĐỊNH NGHĨA ICON (được chuyển từ file check-in.tsx) ---
const StarIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> );
const SparklesIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17.8l-2.6-1.5L6.8 18l1.5-2.6-1.5-2.6 2.6-1.5 2.6-1.5 2.6 1.5 2.6 1.5-1.5 2.6 1.5 2.6-2.6 1.5-2.6 1.5z"></path><path d="M12 2v2"></path><path d="M4.2 4.2l1.4 1.4"></path><path d="M2 12h2"></path><path d="M4.2 19.8l1.4-1.4"></path><path d="M12 22v-2"></path><path d="M19.8 19.8l-1.4-1.4"></path><path d="M22 12h-2"></path><path d="M19.8 4.2l-1.4 1.4"></path></svg> );
const ZapIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> );
const ShieldIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> );
const GiftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg> );
const FlameIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.27 16.78A9.61 9.61 0 0 0 12 15c-3.6 0-6.73 1.08-9.27 3.22C1.96 18.85 2 22 2 22c0 0 3.22-.04 7.82-2.73C12.43 21.03 15 22 15 22c2.22 0 4.2-.8 5.73-2.11C22.72 18.39 21.27 16.78 21.27 16.78z"></path><path d="M12 15c1.66 0 3-1.34 3-3 0-1.33-.5-2-1-3 0 0-2 2-3 3l-3 3c.5 1 1.66 3 3 3z"></path></svg> );
const CrownIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6l-2 3H5l2-3-2-3h5l2-3 2 3h5l-2 3 2 3h-5l-2-3z"></path><path d="M2 15l.9 1.8a6 6 0 0 0 8.2 8.2l1.8.9 1.8-.9a6 6 0 0 0 8.2-8.2L22 15"></path></svg> );

// --- DỮ LIỆU PHẦN THƯỞNG (được chuyển từ file check-in.tsx) ---
export const dailyRewards = [
  { day: 1, name: "Vàng", amount: "1000", icon: <SparklesIcon className="text-yellow-400" /> },
  { day: 2, name: "Sách Cổ", amount: "10", icon: <ZapIcon className="text-purple-400" /> },
  { day: 3, name: "Mảnh Trang Bị", amount: "10", icon: <ShieldIcon className="text-emerald-400" /> },
  { day: 4, name: "Dung Lượng Thẻ", amount: "50", icon: <GiftIcon className="text-amber-400" /> },
  { day: 5, name: "Cúp", amount: "5", icon: <FlameIcon className="text-red-400" /> },
  { day: 6, name: "Dung Lượng Thẻ", amount: "50", icon: <GiftIcon className="text-amber-400" /> },
  { day: 7, name: "Cúp", amount: "10", icon: <CrownIcon className="text-yellow-400" /> },
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
