// --- START OF FILE upgrade-on-icon-toast.tsx ---

import React from 'react';

interface UpgradeOnIconToastProps {
  isVisible: boolean;
  oldValue: number;
  newValue: number;
}

// Animation được tinh chỉnh để "bung" ra từ trung tâm
const animationStyle = `
  @keyframes emerge-and-float-up {
    0% {
      opacity: 0;
      transform: scale(0.6) translateY(0);
    }
    30% {
      opacity: 1;
      transform: scale(1.1) translateY(-15px);
    }
    85% {
      opacity: 1;
      transform: scale(1) translateY(-50px);
    }
    100% {
      opacity: 0;
      transform: scale(0.8) translateY(-65px);
    }
  }
  .animate-emerge-float {
    animation: emerge-and-float-up 1.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  }
`;

const RightArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);


const UpgradeOnIconToast: React.FC<UpgradeOnIconToastProps> = ({
  isVisible,
  oldValue,
  newValue,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <style>{animationStyle}</style>
      <div
        // Pointer-events-none để không cản trở tương tác
        // inset-0 và flexbox để căn giữa tuyệt đối bên trong parent `relative`
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10`}
      >
        <div className="flex items-center justify-center gap-1.5 px-3.5 py-2
                        rounded-full shadow-xl shadow-black/50 backdrop-blur-md
                        bg-slate-900/80 border border-green-500
                        animate-emerge-float"
        >
            <span className={`text-base font-bold text-slate-300`}>
            {oldValue}%
            </span>
            <RightArrowIcon />
            <span className={`text-base font-bold text-green-400`}>
            {newValue}%
            </span>
        </div>
      </div>
    </>
  );
};

export default UpgradeOnIconToast;
// --- END OF FILE upgrade-on-icon-toast.tsx ---
