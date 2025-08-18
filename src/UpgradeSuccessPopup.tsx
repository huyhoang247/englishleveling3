// src/components/UpgradeSuccessPopup.tsx

import React from 'react';

// Định nghĩa props cho component
interface UpgradeSuccessPopupProps {
  isVisible: boolean;
  icon: JSX.Element;
  statName: string;
  oldValue: number;
  newValue: number;
  bonus: number;
}

// Hàm format số cho ngắn gọn
const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  return `${(num / 1000000000).toFixed(1).replace('.0', '')}B`;
};

const UpgradeSuccessPopup: React.FC<UpgradeSuccessPopupProps> = ({
  isVisible,
  icon,
  statName,
  oldValue,
  newValue,
  bonus,
}) => {
  return (
    // Lớp phủ toàn màn hình, chỉ hiển thị khi isVisible là true
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 
                  ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Thẻ popup với hiệu ứng kính mờ và animation */}
      <div
        className={`
          flex flex-col items-center gap-3 p-6 rounded-2xl shadow-2xl
          bg-slate-900/80 backdrop-blur-md border border-cyan-500/30
          w-64 transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
      >
        {/* Icon chỉ số */}
        <div className="w-16 h-16 p-2 bg-slate-800/50 rounded-full border-2 border-slate-700">
            {icon}
        </div>

        {/* Tên chỉ số và giá trị bonus */}
        <div className="text-center">
          <p className="text-xl font-bold uppercase tracking-wider text-white">{statName}</p>
          <p className="text-4xl font-black text-green-400 text-shadow-green animate-pulse">
            +{formatNumber(bonus)}
          </p>
        </div>

        {/* Hiển thị giá trị cũ -> mới */}
        <div className="flex items-center justify-center gap-3 text-lg text-slate-300 font-semibold">
          <span>{formatNumber(oldValue)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-white font-bold text-xl">{formatNumber(newValue)}</span>
        </div>
      </div>
    </div>
  );
};

export default UpgradeSuccessPopup;
