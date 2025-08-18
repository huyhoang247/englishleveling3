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
    return `+${(num / 1000000).toFixed(1).replace('.0', '')}M`;
};

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
        // <<<--- THAY ĐỔI CHÍNH: Quay lại `absolute` và đặt `top-0`
        // Toast sẽ bắt đầu ở trên cùng của thẻ div cha (có position: relative)
        className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                    flex items-center justify-center gap-2 px-4 py-2 
                    rounded-full shadow-lg backdrop-blur-sm
                    bg-slate-900/80 border ${colorClasses.border}
                    animate-float-up`}
      >
        <div className="w-6 h-6">{icon}</div>
        <span className={`text-xl font-black ${colorClasses.text}`}>
          +{formatBonus(bonus)}
        </span>
      </div>
    </>
  );
};

export default StatUpgradeToast;
