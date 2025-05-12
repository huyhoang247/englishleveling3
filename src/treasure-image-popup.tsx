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
}

const RevealedImagePopup: React.FC<RevealedImagePopupProps> = ({
  revealedImage,
  pendingCoinReward,
  pendingGemReward,
  onClose,
}) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    // Show the rewards after the initial animation
    const timer = setTimeout(() => {
      setShowAnimation(false);
      setShowRewards(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!revealedImage) {
    return null;
  }

  // Icon components
  const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y1="18" />
    </svg>
  );

  const CoinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const GemIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 3 22 9 12 21 2 9" />
    </svg>
  );

  const StarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-md">
      <div className={`relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-blue-600/30 border border-blue-500/30 overflow-hidden ${showAnimation ? 'animate-pulse' : ''}`}>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Sparkling stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="absolute text-yellow-300 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7
              }}
            >
              <StarIcon />
            </div>
          ))}
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10 hover:bg-white/10 p-2 rounded-full"
          aria-label="Đóng popup"
        >
          <XIcon />
        </button>

        {/* Treasure found heading */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-500 bg-clip-text text-transparent mb-1">Kho Báu Đã Mở!</div>
          <div className="text-blue-300 text-sm font-medium">Bạn đã tìm thấy một vật phẩm quý giá</div>
        </div>

        {/* Image container with glow effect */}
        <div className="relative mx-auto mb-6 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-md transform group-hover:scale-105 transition-all duration-500 opacity-75"></div>
          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 p-1 rounded-2xl border border-slate-700/50 overflow-hidden">
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
        </div>

        {/* Item ID badge */}
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1 bg-blue-900/30 rounded-full border border-blue-500/20">
            <span className="text-blue-200 font-medium">Vật phẩm #{revealedImage.id}</span>
          </div>
        </div>

        {/* Rewards section with animations */}
        {showRewards && (pendingCoinReward > 0 || pendingGemReward > 0) && (
          <div className="flex flex-col gap-3 mb-6">
            <div className="text-center text-lg font-semibold text-white mb-2">Phần thưởng của bạn</div>
            <div className="flex justify-center gap-4">
              {pendingCoinReward > 0 && (
                <div className="flex items-center bg-gradient-to-r from-yellow-600/30 to-amber-600/30 px-4 py-2 rounded-xl border border-yellow-500/30 animate-fadeIn">
                  <CoinIcon />
                  <span className="ml-2 text-yellow-300 font-bold">+{pendingCoinReward} Xu</span>
                </div>
              )}
              {pendingGemReward > 0 && (
                <div className="flex items-center bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-4 py-2 rounded-xl border border-blue-500/30 animate-fadeIn">
                  <GemIcon />
                  <span className="ml-2 text-blue-300 font-bold">+{pendingGemReward} Ngọc</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue button with hover effect */}
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

export default RevealedImagePopup;
