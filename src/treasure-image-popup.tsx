import React from 'react';

// Define interface for the revealed image data (assuming it's the same as in TreasureChest)
interface RevealedImage {
    id: number; // Using index + 1 as ID (1-based)
    url: string;
}

// X Icon SVG (for closing modal) - Moved here as it's specific to the popup
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y1="18" />
  </svg>
);


// Define interface for component props
interface RevealedImagePopupProps {
  revealedImage: RevealedImage | null; // The image data to display
  pendingCoinReward: number; // Coins received
  pendingGemReward: number; // Gems received
  onClose: () => void; // Function to call when the popup is closed
}

const RevealedImagePopup: React.FC<RevealedImagePopupProps> = ({
  revealedImage,
  pendingCoinReward,
  pendingGemReward,
  onClose,
}) => {

  // If there's no image data, don't render the popup
  if (!revealedImage) {
    return null;
  }

  return (
    // Fixed overlay for the popup
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"> {/* Increased z-index */}
      {/* Popup container */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-lg shadow-blue-500/30 border border-slate-700 relative">
        {/* Close button */}
        <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200 z-10"
            aria-label="Đóng popup"
        >
            <XIcon size={28} /> {/* Use the XIcon component */}
        </button>

        {/* Decorative spinning element */}
        <div className="absolute -top-3 -right-3">
          <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
        </div>

        {/* Popup title */}
        <div className="text-xl font-bold text-white mb-4">Bạn nhận được</div>

        {/* Display the revealed image in the popup */}
        <div className="w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative bg-slate-700/50 overflow-hidden">
             <img
                src={revealedImage.url}
                alt={`Revealed item with ID ${revealedImage.id}`}
                // Use object-contain to ensure the whole image is visible
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                    // Handle image loading errors, show a placeholder
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/160x208?text=Image+Error';
                }}
             />
        </div>

        {/* Display the image ID */}
        <div className="text-lg font-medium text-gray-300 mb-4">ID: {revealedImage.id}</div>

         {/* Display rewards received (optional, based on your reward logic) */}
        {(pendingCoinReward > 0 || pendingGemReward > 0) && (
             <div className="text-sm text-gray-400 mb-4">
                {pendingCoinReward > 0 && <span>+{pendingCoinReward} Xu</span>}
                {pendingCoinReward > 0 && pendingGemReward > 0 && <span>, </span>}
                {pendingGemReward > 0 && <span>+{pendingGemReward} Ngọc</span>}
             </div>
        )}

        {/* Continue button */}
        <button
            onClick={onClose} // Call onClose when the button is clicked
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-8 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-105"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default RevealedImagePopup;
