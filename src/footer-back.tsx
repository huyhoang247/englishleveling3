import React from 'react';
import BackIcon from './icon/back-icon.tsx'; // Import the BackIcon component

interface BackButtonProps {
  onClick: () => void; // Function to handle the click event
  className?: string; // Optional className for additional styling
  rightContent?: React.ReactNode; // NEW: Optional prop to render content on the right side
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className, rightContent }) => {
  return (
    // This div contains the background styling and the BackIcon
    // It's designed to be fixed at the bottom, full width, with specific styling
    // Use flex and justify-between to place BackIcon on the left and rightContent on the right
    <div className={`fixed bottom-0 left-0 right-0 z-50 px-6 py-2 flex justify-between items-center bg-black bg-opacity-85 backdrop-blur-md rounded-t-2xl shadow-lg ${className || ''}`}>
      {/* Left side: The BackIcon component */}
      {/* Adjusted icon color for better visibility on dark background */}
      <BackIcon onClick={onClick} className="text-white" />

      {/* Right side: Render the content passed via rightContent prop */}
      {/* This div ensures proper alignment if rightContent is provided */}
      <div className="flex items-center">
        {rightContent}
      </div>
    </div>
  );
};

export default BackButton;
