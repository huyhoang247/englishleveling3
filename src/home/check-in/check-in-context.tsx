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
// SỬA ĐỔI: Thêm trường 'amount' để nhất quán và thay đổi 'name'
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

// --- THÊM MỚI: Type cho mốc streak ---
// SỬA ĐỔI: Thêm trường 'amount'
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
  // ========================= SỬA LỖI TẠI ĐÂY =========================
  // Lấy 'coins' trực tiếp, không qua 'playerStats' vì nó không tồn tại trong context
  const { loginStreak, lastCheckIn, isSyncingData, setIsSyncingData, coins } = useGame();
  // ====================================================================

  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [animatingReward, setAnimatingReward] = useState<any>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimableDay, setClaimableDay] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdown, setCountdown] = useState('00:00:00');

  const particleClasses = ["animate-float-particle-1", "animate-float-particle-2", "animate-float-particle-3", "animate-float-particle-4", "animate-float-particle-5"];

  // =========================================================================
  // --- BẮT ĐẦU PHẦN SỬA LỖI ---
  // =========================================================================
  useEffect(() => {
    const now = new Date();
    const last = lastCheckIn;

    // --- XỬ LÝ LẦN ĐẦU TIÊN ---
    if (!last) { 
        setCanClaimToday(true);
        // loginStreak lúc này là 0, ngày cần nhận là ngày 1
        setClaimableDay(1); 
        return;
    }

    // --- KIỂM TRA ĐÃ ĐIỂM DANH HÔM NAY CHƯA ---
    const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() &&
                      last.getUTCMonth() === now.getUTCMonth() &&
                      last.getUTCDate() === now.getUTCDate();

    setCanClaimToday(!isSameDay);

    if (isSameDay) {
        // TRƯỜNG HỢP 1: Đã điểm danh hôm nay.
        // Hiển thị ngày *tiếp theo* trong chu kỳ.
        // loginStreak đã được cập nhật. Ngày tiếp theo sẽ là (streak hiện tại % 7) + 1.
        const nextDayInCycle = (loginStreak % 7) + 1;
        setClaimableDay(nextDayInCycle);
    } else {
        // TRƯỜNG HỢP 2: Chưa điểm danh hôm nay.
        // Kiểm tra xem chuỗi có bị ngắt không.
        const yesterday = new Date(now);
        yesterday.setUTCDate(now.getUTCDate() - 1);
        const isConsecutive = last.getUTCFullYear() === yesterday.getUTCFullYear() &&
                              last.getUTCMonth() === yesterday.getUTCMonth() &&
                              last.getUTCDate() === yesterday.getUTCDate();
        
        if (isConsecutive) {
            // Chuỗi liên tục. Ngày cần nhận là ngày tiếp theo của chuỗi.
            // (loginStreak hiện tại % 7) + 1
            const dayToClaim = (loginStreak % 7) + 1;
            setClaimableDay(dayToClaim);
        } else {
            // Chuỗi đã bị ngắt. Reset về ngày 1.
            setClaimableDay(1);
        }
    }
  }, [lastCheckIn, loginStreak]);
  // =======================================================================
  // --- KẾT THÚC PHẦN SỬA LỖI ---
  // =======================================================================


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
    // ========================= SỬA LỖI TẠI ĐÂY =========================
    coins, // Sử dụng biến 'coins' đã lấy trực tiếp
    // ====================================================================
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
    // ========================= SỬA LỖI TẠI ĐÂY =========================
    coins, // Cập nhật dependency
    // ====================================================================
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
