import React from 'react';
import BackIcon from './icon/back-icon.tsx'; // Import the BackIcon component

interface BackButtonProps {
  onClick: () => void; // Function to handle the click event
  className?: string; // Optional className for additional styling
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className }) => {
  return (
    // This div contains the background styling and the BackIcon
    // It's designed to be fixed at the bottom, full width, with specific styling
    <div className={`fixed bottom-0 left-0 right-0 z-50 px-6 py-2 flex justify-start items-center bg-black bg-opacity-85 backdrop-blur-md rounded-t-2xl shadow-lg ${className || ''}`}>
      {/* The BackIcon component */}
      {/* Adjusted icon color for better visibility on dark background */}
      <BackIcon onClick={onClick} className="text-white" />
    </div>
  );
};

export default BackButton;
