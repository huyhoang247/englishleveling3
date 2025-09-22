import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
// --- THÊM MỚI: Import tài nguyên từ game-assets (thêm minerAssets) ---
import { uiAssets, equipmentUiAssets, minerAssets } from '../../game-assets.ts';
import { auth } from '../../firebase.js';
import { processDailyCheckIn } from './check-in-service.ts';

// --- BƯỚC 1: XÓA BỎ CÁC ĐỊNH NGHĨA ICON SVG NỘI TUYẾN ---
// Các component StarIcon, SparklesIcon, ZapIcon, ShieldIcon, GiftIcon, FlameIcon, CrownIcon đã được xóa.

// --- BƯỚC 2: CẬP NHẬT DỮ LIỆU PHẦN THƯỞNG VỚI ICON TỪ game-assets ---
// Thay thế các component SVG bằng thẻ <img> với src từ file tài nguyên.
// Một className chung được áp dụng để đảm bảo kích thước đồng nhất.
export const dailyRewards = [
  { day: 1, name: "Gold", amount: "1000", icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
  { day: 2, name: "Ancient Book", amount: "10", icon: <img src={uiAssets.bookIcon} alt="Ancient Book" className="w-10 h-10 object-contain" /> },
  { day: 3, name: "Equipment Piece", amount: "10", icon: <img src={equipmentUiAssets.equipmentPieceIcon} alt="Equipment Piece" className="w-10 h-10 object-contain" /> },
  { day: 4, name: "Card Capacity", amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Card Capacity" className="w-10 h-10 object-contain" /> },
  // --- SỬA ĐỔI: Thay icon cho Pickaxe ---
  { day: 5, name: "Pickaxe", amount: "5", icon: <img src={minerAssets.pickaxeIcon} alt="Pickaxe" className="w-10 h-10 object-contain" /> },
  { day: 6, name: "Card Capacity", amount: "50", icon: <img src={uiAssets.cardCapacityIcon} alt="Card Capacity" className="w-10 h-10 object-contain" /> },
  // --- SỬA ĐỔI: Thay icon cho Pickaxe ---
  { day: 7, name: "Pickaxe", amount: "10", icon: <img src={minerAssets.pickaxeIcon} alt="Special Pickaxe" className="w-10 h-10 object-contain" /> },
];

// --- THÊM MỚI: ĐỊNH NGHĨA PHẦN THƯỞNG MỐC STREAK CHO UI ---
export const streakMilestoneRewards = [
    { streakGoal: 7, name: "Thưởng 7 Ngày", amount: 5000, icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
    { streakGoal: 14, name: "Thưởng 14 Ngày", amount: 10000, icon: <img src={uiAssets.goldIcon} alt="Gold" className="w-10 h-10 object-contain" /> },
];

// --- ĐỊNH NGHĨA TYPES ---
interface Particle {
  id: number;
  style: React.CSSProperties;
  className: string;
}

// --- THÊM MỚI: Type cho mốc streak ---
interface StreakMilestone {
    streakGoal: number;
    name: string;
    amount: number;
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
  countdown: string; 
  nextStreakGoal: StreakMilestone | null; // Thêm mốc streak tiếp theo
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
  const { loginStreak, lastCheckIn, isSyncingData, setIsSyncingData } = useGame();

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
        // --- SỬA ĐỔI: Tính claimableDay dựa trên loginStreak ---
        setClaimableDay((loginStreak % 7) + 1);
        return;
    }

    const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() && last.getUTCMonth() === now.getUTCMonth() && last.getUTCDate() === now.getUTCDate();
    setCanClaimToday(!isSameDay);

    const yesterday = new Date(now);
    yesterday.setUTCDate(now.getUTCDate() - 1);
    const isConsecutive = last.getUTCFullYear() === yesterday.getUTCFullYear() && last.getUTCMonth() === yesterday.getUTCMonth() && last.getUTCDate() === yesterday.getUTCDate();
    // --- SỬA ĐỔI: Tính claimableDay dựa trên loginStreak, reset về 1 nếu gián đoạn ---
    setClaimableDay(isConsecutive ? (loginStreak % 7) + 1 : 1);
  }, [lastCheckIn, loginStreak]);

  // --- useEffect để xử lý countdown (Không đổi) ---
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
      // --- SỬA ĐỔI: Xử lý response mới từ service ---
      const { dailyReward, streakReward } = await processDailyCheckIn(userId);
      setIsSyncingData(false);

      // --- SỬA ĐỔI: Chuẩn bị dữ liệu animation cho cả hai loại thưởng ---
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
      }, 3000); // Tăng thời gian hiển thị animation một chút
    } catch (error: any) {
        alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        setIsClaiming(false);
        setIsSyncingData(false);
    }
  }, [canClaimToday, claimableDay, isClaiming, isSyncingData, setIsSyncingData]);

  // --- THÊM MỚI: useMemo để tính mốc streak tiếp theo ---
  const nextStreakGoal = useMemo(() => {
    // Tìm mốc streak đầu tiên lớn hơn streak hiện tại
    return streakMilestoneRewards.find(milestone => milestone.streakGoal > loginStreak) || null;
  }, [loginStreak]);

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
    countdown,
    nextStreakGoal, // Thêm vào context value
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
    countdown,
    nextStreakGoal, // Thêm vào dependencies
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
