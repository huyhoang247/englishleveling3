import React, { useState, useEffect } from 'react';

// Define interface for the revealed image data
interface RevealedImage {
  id: number;
  url: string;
}

// Define interface for component props
interface RevealedImagePopupProps {
  revealedImage: RevealedImage | null;
  pendingCoinReward: number;
  pendingGemReward: number;
  onClose: () => void;
  hideNavBar: () => void; // Added prop to hide the nav bar
  showNavBar: () => void; // Added prop to show the nav bar
}

const RevealedImagePopup: React.FC<RevealedImagePopupProps> = ({
  revealedImage,
  pendingCoinReward,
  pendingGemReward,
  onClose,
  hideNavBar, // Destructure hideNavBar prop
  showNavBar, // Destructure showNavBar prop
}) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [showRewards, setShowRewards] = useState(false);

  // Effect to manage nav bar visibility based on popup state
  useEffect(() => {
    if (revealedImage) {
      // If revealedImage is not null, popup is showing, hide nav bar
      hideNavBar();
    } else {
      // If revealedImage is null, popup is hidden, show nav bar
      showNavBar();
    }

    // Cleanup function: Ensure nav bar is shown if component unmounts while popup is open
    return () => {
      showNavBar();
    };
  }, [revealedImage, hideNavBar, showNavBar]); // Re-run effect when revealedImage, hideNavBar, or showNavBar changes


  useEffect(() => {
    // Only run the animation timer if the popup is actually showing (revealedImage is not null)
    if (revealedImage) {
        // Show the rewards after the initial animation
        const timer = setTimeout(() => {
          setShowAnimation(false);
          setShowRewards(true);
        }, 1500);

        return () => clearTimeout(timer);
    }
     // If revealedImage is null, no timer is needed
    return () => {};

  }, [revealedImage]); // Depend on revealedImage


  if (!revealedImage) {
    return null; // Don't render anything if there's no image to reveal
  }

  // Icon components
  const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y1="18" />
    </svg>
  );

  const CoinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill="#FFECB3" />
      <circle cx="12" cy="12" r="3" fill="#FFD700" />
    </svg>
  );

  const GemIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 3 22 9 12 21 2 9" fill="#C7D2FE" />
      <line x1="12" y1="9" x2="12" y2="15" stroke="#4F46E5" />
      <line x1="9" y1="12" x2="15" y2="12" stroke="#4F46E5" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-md">
      <div
        className={`relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-blue-600/30 border border-blue-500/30 overflow-hidden ${
          showAnimation ? 'animate-pulse' : ''
        }`}
      >
        {/* Enhanced background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-500 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
        </div>

        {/* Close button with improved hover effect */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-300 z-10 hover:bg-white/20 p-2 rounded-full transform hover:rotate-90"
          aria-label="Đóng popup"
        >
          <XIcon />
        </button>

        {/* Enhanced treasure found heading with animation */}
        <div className="text-center mb-6 relative">
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-500 bg-clip-text text-transparent mb-2 transform transition-all duration-700">
            Kho Báu Đã Mở!
          </div>
          <div className="text-blue-300 text-sm font-medium">
            Bạn đã tìm thấy một vật phẩm quý giá
          </div>
        </div>

        {/* Enhanced image container with improved glow effect */}
        <div className="relative mx-auto mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-md transform group-hover:scale-105 transition-all duration-500 opacity-75"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-transparent rounded-2xl blur-md transform transition-all duration-500 opacity-40 animate-pulse"></div>
          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 p-2 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="w-full h-64 flex items-center justify-center bg-slate-800/50 rounded-xl overflow-hidden">
              <img
                src={revealedImage.url}
                alt={`Vật phẩm #${revealedImage.id}`}
                className="w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400?text=Treasure';
                }}
              />
            </div>
          </div>

          {/* Light beams animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-1/4 w-1 h-full bg-blue-400/20 blur-sm transform -rotate-45 translate-y-full animate-lightbeam"></div>
            <div className="absolute top-0 right-1/3 w-1 h-full bg-purple-400/20 blur-sm transform rotate-45 translate-y-full animate-lightbeam-delayed"></div>
          </div>
        </div>

        {/* Enhanced item ID badge */}
        <div className="flex justify-center mb-8">
          <div className="px-6 py-2 bg-blue-900/40 rounded-full border border-blue-500/30 backdrop-blur-sm shadow-lg">
            <span className="text-blue-200 font-medium">Vật phẩm #{revealedImage.id}</span>
          </div>
        </div>

        {/* Enhanced rewards section with better animations */}
        {showRewards && (pendingCoinReward > 0 || pendingGemReward > 0) && (
          <div className="flex flex-col gap-4 mb-8">
            <div className="text-center text-lg font-semibold text-white mb-2">Phần thưởng của bạn</div>
            <div className="flex justify-center gap-4">
              {pendingCoinReward > 0 && (
                <div className="flex items-center bg-gradient-to-r from-yellow-600/30 to-amber-600/30 px-6 py-3 rounded-xl border border-yellow-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20">
                  <CoinIcon />
                  <span className="ml-2 text-yellow-300 font-bold">+{pendingCoinReward} Xu</span>
                </div>
              )}
              {pendingGemReward > 0 && (
                <div className="flex items-center bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-6 py-3 rounded-xl border border-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                  <GemIcon />
                  <span className="ml-2 text-blue-300 font-bold">+{pendingGemReward} Ngọc</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced continue button with better hover effect */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-10 rounded-xl font-medium transition-all duration-300 overflow-hidden group hover:shadow-lg hover:shadow-blue-500/50"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"></span>
            <span className="relative z-10">Tiếp tục</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Add the following CSS keyframes to your global CSS or styled-components
// @keyframes lightbeam {
//   0% { transform: translateY(100%) rotate(-45deg); }
//   100% { transform: translateY(-100%) rotate(-45deg); }
// }
// @keyframes lightbeam-delayed {
//   0% { transform: translateY(100%) rotate(45deg); }
//   100% { transform: translateY(-100%) rotate(45deg); }
// }

export default RevealedImagePopup;
