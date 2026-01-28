// --- START OF FILE check-in-context.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useGame } from '../../GameContext.tsx';
import { uiAssets, equipmentUiAssets, minerAssets, bossBattleAssets, upgradeAssets } from '../../game-assets.ts'; 
import { auth } from '../../firebase.js';
import { processDailyCheckIn, getCheckInMultiplier } from './check-in-service.ts';
import { AdData } from '../../gameDataService.ts';

// Re-export helper để UI sử dụng mà không cần import từ service
export { getCheckInMultiplier };

// --- CẬP NHẬT DỮ LIỆU UI VỚI ENERGY VÀ ĐÁ CƯỜNG HÓA ---
// LƯU Ý: Icon ở đây giờ là STRING (đường dẫn ảnh), không phải JSX <img />
export const dailyRewardsUI = [
  { 
      day: 1, 
      items: [
          { name: "Gold", amount: "1000", type: 'coins', icon: uiAssets.goldIcon },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
  { 
      day: 2, 
      items: [
          { name: "Ancient Book", amount: "10", type: 'ancientBooks', icon: uiAssets.bookIcon },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
  { 
      day: 3, 
      items: [
          { name: "Equipment Piece", amount: "10", type: 'equipmentPieces', icon: equipmentUiAssets.equipmentPieceIcon },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
  { 
      day: 4, 
      items: [
          { name: "Basic Stone", amount: "10", type: 'stone_low', icon: upgradeAssets.stoneBasic },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
  { 
      day: 5, 
      items: [
          { name: "Pickaxe", amount: "5", type: 'pickaxes', icon: minerAssets.pickaxeIcon },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
  { 
      day: 6, 
      items: [
          { name: "Inter. Stone", amount: "10", type: 'stone_medium', icon: upgradeAssets.stoneIntermediate },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
  { 
      day: 7, 
      items: [
          { name: "Pickaxe", amount: "10", type: 'pickaxes', icon: minerAssets.pickaxeIcon }, // Dùng chung icon cúp
          { name: "Adv. Stone", amount: "10", type: 'stone_high', icon: upgradeAssets.stoneAdvanced },
          { name: "Energy", amount: "5", type: 'energy', icon: bossBattleAssets.energyIcon }
      ]
  },
];

// --- ĐỊNH NGHĨA TYPES ---
interface CheckInContextType {
  loginStreak: number;
  isSyncingData: boolean;
  canClaimToday: boolean;
  claimableDay: number;
  isClaiming: boolean;
  
  coins: number;
  masteryCards: number; // Để UI tính toán hiển thị số lượng x Multiplier

  // --- State mới cho Ads Popup ---
  pendingReward: any | null;       // Dữ liệu ngày đang được chọn để nhận
  showAdsPopup: boolean;           // Trạng thái hiển thị Popup Ads
  adsData: AdData;                 // Dữ liệu quảng cáo từ GameContext
  
  // --- Functions ---
  initiateClaim: (day: number) => void;                // Hàm kích hoạt Popup (Click vào ngày)
  finalizeClaim: (isDouble: boolean) => Promise<void>; // Hàm chốt nhận thưởng (Ghi DB)
  handleRegisterAdWatch: () => Promise<boolean>;       // Hàm xem quảng cáo từ GameContext
  
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
  const { 
      loginStreak, lastCheckIn, isSyncingData, setIsSyncingData, 
      coins, masteryCards, adsData, handleRegisterAdWatch 
  } = useGame();

  // State logic Check-in cơ bản
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [claimableDay, setClaimableDay] = useState(1);
  const [isClaiming, setIsClaiming] = useState(false);

  // State logic Popup Ads
  const [showAdsPopup, setShowAdsPopup] = useState(false);
  const [pendingReward, setPendingReward] = useState<any | null>(null);

  // --- Logic xác định trạng thái Check-in (Claimable, Claimed, Locked) ---
  useEffect(() => {
    const now = new Date();
    const last = lastCheckIn;

    if (!last) { 
        setCanClaimToday(true);
        setClaimableDay(1); 
        return;
    }

    // Kiểm tra xem lần check-in cuối cùng có phải hôm nay không (theo UTC)
    // Lưu ý: Logic chi tiết hơn về giờ VN nằm trong Service, ở đây check sơ bộ UI
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

  // --- STEP 1: NGƯỜI DÙNG CLICK VÀO NGÀY ---
  // Hàm này không gọi API ngay, mà mở Popup để người dùng chọn
  const initiateClaim = useCallback((day: number) => {
      // Validate cơ bản
      if (!canClaimToday || day !== claimableDay || isClaiming || isSyncingData) return;
      
      // Tìm thông tin phần thưởng của ngày đó
      const rewardConfig = dailyRewardsUI.find(r => r.day === day);
      
      if (rewardConfig) {
          setPendingReward(rewardConfig);
          setShowAdsPopup(true);
      }
  }, [canClaimToday, claimableDay, isClaiming, isSyncingData]);

  // --- STEP 2: NGƯỜI DÙNG CHỐT NHẬN THƯỞNG (CÓ THỂ X2 HOẶC KHÔNG) ---
  const finalizeClaim = useCallback(async (isDouble: boolean) => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("Người dùng chưa được xác thực.");
        return;
      }

      setIsClaiming(true);
      // Đóng popup để tránh click đúp
      setShowAdsPopup(false); 

      try {
          setIsSyncingData(true);
          
          // Gọi service để cập nhật DB, truyền cờ isDouble vào
          await processDailyCheckIn(userId, isDouble);
          
          // Reset states sau khi thành công
          setPendingReward(null);

      } catch (error: any) {
          console.error("Lỗi khi check-in:", error);
          alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
          setIsClaiming(false);
          setIsSyncingData(false);
      }
  }, [setIsSyncingData]);

  const value = useMemo(() => ({
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    coins, 
    masteryCards,
    
    // Ads UI Props
    pendingReward,
    showAdsPopup,
    adsData,
    handleRegisterAdWatch,
    
    initiateClaim, 
    finalizeClaim,
    handleClose: onClose,
  }), [
    loginStreak, 
    isSyncingData, 
    canClaimToday, 
    claimableDay, 
    isClaiming,
    coins,
    masteryCards,
    
    pendingReward,
    showAdsPopup,
    adsData,
    handleRegisterAdWatch,
    
    initiateClaim,
    finalizeClaim, 
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
