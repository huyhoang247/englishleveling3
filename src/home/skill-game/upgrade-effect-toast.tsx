// --- START OF FILE upgrade-effect-toast.tsx ---

import React from 'react';

interface UpgradeEffectToastProps {
  isVisible: boolean;
  oldValue: number;
  newValue: number;
}

// Keyframes animation
const animationStyle = `
  @keyframes float-up-fade-out-effect {
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
  .animate-float-up-effect {
    animation: float-up-fade-out-effect 1.6s ease-out forwards;
  }
`;

// Một icon mũi tên đơn giản
const RightArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);


const UpgradeEffectToast: React.FC<UpgradeEffectToastProps> = ({
  isVisible,
  oldValue,
  newValue,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <style>{animationStyle}</style>
      <div
        className={`absolute -top-8 left-4 z-50 pointer-events-none
                    flex items-center justify-center gap-1.5 px-3 py-1.5
                    rounded-full shadow-lg backdrop-blur-sm
                    bg-slate-900/80 border border-green-500
                    animate-float-up-effect`}
      >
        <span className={`text-sm font-bold text-slate-300`}>
          {oldValue}%
        </span>
        <RightArrowIcon />
        <span className={`text-sm font-bold text-green-400`}>
          {newValue}%
        </span>
      </div>
    </>
  );
};

export default UpgradeEffectToast;
// --- END OF FILE upgrade-effect-toast.tsx ---
