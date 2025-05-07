import React from 'react';

interface BackIconProps {
  onClick?: () => void; // Optional click handler
  className?: string; // Optional class name for styling
}

const BackIcon: React.FC<BackIconProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      // Base styles for the button container
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors p-1 hover:bg-gray-100 ${className || ''}`}
      aria-label="Quay lại"
      title="Quay lại"
    >
      <img
        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/left-arrow%20(1).png"
        alt="Return icon"
        className="w-full h-full object-contain" // Ensure image fits and maintains aspect ratio
      />
    </button>
  );
};

export default BackIcon;

