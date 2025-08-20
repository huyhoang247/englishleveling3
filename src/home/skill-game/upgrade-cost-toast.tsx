// --- START OF FILE upgrade-cost-toast.tsx ---

import React from 'react';
import { uiAssets } from '../../game-assets.ts'; // Đảm bảo đường dẫn này đúng

interface UpgradeCostToastProps {
  isVisible: boolean;
  cost: number;
}

// Keyframes animation, tương tự file gốc
const animationStyle = `
  @keyframes float-up-fade-out-cost {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0.8);
    }
    20% {
      opacity: 1;
      transform: translateY(-20px) scale(1.05);
    }
    85% {
      opacity: 1;
      transform: translateY(-55px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-70px) scale(0.9);
    }
  }
  .animate-float-up-cost {
    animation: float-up-fade-out-cost 1.5s ease-out forwards;
  }
`;

const UpgradeCostToast: React.FC<UpgradeCostToastProps> = ({
  isVisible,
  cost,
}) => {
  if (!isVisible || cost <= 0) return null;

  return (
    <>
      <style>{animationStyle}</style>
      <div
        // Đặt toast ở trên nút Nâng Cấp
        className={`absolute -top-6 right-0 z-50 pointer-events-none
                    flex items-center justify-center gap-1.5 px-3 py-1.5
                    rounded-full shadow-lg backdrop-blur-sm
                    bg-slate-900/80 border border-yellow-500
                    animate-float-up-cost`}
      >
        <img src={uiAssets.goldIcon} alt="Vàng" className="w-4 h-4" />
        <span className={`text-sm font-bold text-yellow-300`}>
          -{cost.toLocaleString()}
        </span>
      </div>
    </>
  );
};

export default UpgradeCostToast;
// --- END OF FILE upgrade-cost-toast.tsx ---
