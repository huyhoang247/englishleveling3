// src/components/StatUpgradeToast.tsx
import React from 'react';

interface StatUpgradeToastProps {
  isVisible: boolean;
  icon: JSX.Element;
  bonus: number;
  colorClasses: {
    border: string; // e.g., 'border-cyan-400'
    text: string;   // e.g., 'text-cyan-300'
  };
}

const formatBonus = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
    return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
};

// Đặt keyframes animation ngay trong file cho dễ quản lý
const animationStyle = `
  @keyframes float-up-fade-out {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0.7);
    }
    20% {
      opacity: 1;
      transform: translateY(-25px) scale(1.1);
    }
    85% {
      opacity: 1;
      transform: translateY(-65px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-80px) scale(0.8);
    }
  }
  .animate-float-up {
    animation: float-up-fade-out 1.5s ease-out forwards;
  }
`;

const StatUpgradeToast: React.FC<StatUpgradeToastProps> = ({
  isVisible,
  icon,
  bonus,
  colorClasses,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <style>{animationStyle}</style>
      <div
        // Pointer-events-none để không cản trở việc click vào các nút khác
        // THÊM "-ml-2" ĐỂ TINH CHỈNH VỊ TRÍ SANG TRÁI MỘT CHÚT
        className={`absolute -top-4 left-1/2 -translate-x-1/2 -ml-10 z-50 pointer-events-none
                    flex items-center justify-center gap-1 px-2.5 py-1
                    rounded-full shadow-lg backdrop-blur-sm
                    bg-slate-900/80 border ${colorClasses.border}
                    animate-float-up`}
      >
        <div className="w-4 h-4">{icon}</div>
        <span className={`text-sm font-bold ${colorClasses.text}`}>
          +{formatBonus(bonus)}
        </span>
      </div>
    </>
  );
};

export default StatUpgradeToast;
