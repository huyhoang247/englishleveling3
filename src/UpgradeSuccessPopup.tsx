// src/components/UpgradeSuccessPopup.tsx

import React, { useEffect, useState } from 'react';
import { formatNumber } from './upgrade-stats.tsx'; // Import hàm formatNumber

// --- ICONS ---
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400">
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
);

interface UpgradeSuccessPopupProps {
  statName: string;
  statIcon: JSX.Element;
  oldLevel: number;
  newLevel: number;
  bonusValue: number;
  colorClass: string;
  onClose: () => void;
}

const UpgradeSuccessPopup: React.FC<UpgradeSuccessPopupProps> = ({
  statName,
  statIcon,
  oldLevel,
  newLevel,
  bonusValue,
  colorClass,
  onClose,
}) => {
  const [animationClass, setAnimationClass] = useState('animate-scale-in');

  useEffect(() => {
    // Bắt đầu timer để tự động đóng popup
    const closeTimer = setTimeout(() => {
      setAnimationClass('animate-scale-out');
    }, 2500); // Popup hiển thị trong 2.5 giây

    // Timer để gọi hàm onClose sau khi animation-out kết thúc
    const unmountTimer = setTimeout(() => {
      onClose();
    }, 2800); // 2500ms hiển thị + 300ms animation-out

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${animationClass}`}>
      <div className={`relative w-full max-w-xs rounded-2xl bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/80 overflow-hidden shadow-2xl shadow-cyan-500/10`}>
        {/* Lớp viền màu gradient động */}
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colorClass} animate-pulse`}></div>
        
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          {/* Icon chính */}
          <div className="w-16 h-16 p-3 bg-slate-800/50 rounded-full border-2 border-slate-700 flex items-center justify-center">
            {statIcon}
          </div>

          {/* Tiêu đề */}
          <h2 className="text-2xl font-bold tracking-wider uppercase text-shadow-cyan">
            {statName} LEVEL UP!
          </h2>

          {/* Thay đổi Level */}
          <div className="flex items-center justify-center gap-3 text-lg font-semibold text-slate-300">
            <span>Level {oldLevel}</span>
            <ArrowRightIcon />
            <span className={`font-bold text-xl text-yellow-400`}>Level {newLevel}</span>
          </div>

          {/* Phần thưởng chính */}
          <div className="w-full bg-black/30 rounded-lg p-4 mt-2 border border-slate-700">
            <p className="text-4xl sm:text-5xl font-black text-green-400 text-shadow-green animate-pulse">
              +{formatNumber(bonusValue)}
            </p>
            <p className="text-sm text-slate-400 mt-1">Chỉ số đã tăng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeSuccessPopup;
