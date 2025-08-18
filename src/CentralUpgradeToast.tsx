// src/components/CentralUpgradeToast.tsx

import React from 'react';

interface CentralUpgradeToastProps {
  isVisible: boolean;
  icon: JSX.Element;
  bonus: number;
  statName: string;
  colorClasses: {
    border: string; // e.g., 'border-cyan-400/50'
    shadow: string; // e.g., 'shadow-cyan-500/50'
  };
}

const formatBonus = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
    return `+${(num / 1000000).toFixed(1).replace('.0', '')}M`;
};

// Keyframes animation cho hiệu ứng xuất hiện và biến mất
const animationStyle = `
  @keyframes celebrate-and-fade {
    0% {
      opacity: 0;
      transform: scale(0.7) translateY(20px);
    }
    30% {
      opacity: 1;
      transform: scale(1.1) translateY(0);
    }
    50% {
      transform: scale(1);
    }
    80% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.8) translateY(-20px);
    }
  }
  .animate-celebrate {
    animation: celebrate-and-fade 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
`;

const CentralUpgradeToast: React.FC<CentralUpgradeToastProps> = ({
  isVisible,
  icon,
  bonus,
  statName,
  colorClasses,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <style>{animationStyle}</style>
      {/* Lớp phủ toàn màn hình để định vị component ở giữa */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {/* Thẻ thông báo chính */}
        <div
          className={`
            flex flex-col items-center gap-3 p-6 w-56
            bg-slate-900/80 backdrop-blur-lg rounded-2xl 
            border ${colorClasses.border} 
            shadow-2xl ${colorClasses.shadow}
            animate-celebrate
          `}
        >
          {/* Icon được bọc trong vòng tròn trang trí */}
          <div className={`
            w-20 h-20 p-3 rounded-full flex items-center justify-center
            bg-slate-800/50 border-2 ${colorClasses.border}
          `}>
            {icon}
          </div>

          {/* Tên chỉ số */}
          <p className="text-xl font-bold uppercase tracking-widest text-slate-300">{statName}</p>
          
          {/* Lượng bonus tăng thêm - điểm nhấn chính */}
          <p className="text-5xl font-black text-green-400 text-shadow-green">
            +{formatBonus(bonus)}
          </p>
        </div>
      </div>
    </>
  );
};

export default CentralUpgradeToast;
