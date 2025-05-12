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
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Show the rewards after the initial animation
    const rewardsTimer = setTimeout(() => {
      setShowAnimation(false);
      setShowRewards(true);
    }, 1500);
    
    // Show sparkles around the image after 500ms
    const sparklesTimer = setTimeout(() => {
      setShowSparkles(true);
    }, 500);

    return () => {
      clearTimeout(rewardsTimer);
      clearTimeout(sparklesTimer);
    };
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
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-lg">
      {/* Deep space background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep space gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-indigo-900/40 via-slate-900/80 to-black"></div>
        
        {/* Cosmic dust particles */}
        {[...Array(50)].map((_, i) => (
          <div 
            key={`bg-star-${i}`} 
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#ffffff', '#8be9fd', '#f8f8f2', '#bd93f9'][Math.floor(Math.random() * 4)],
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)',
              animation: `pulse ${Math.random() * 4 + 2}s ease-in-out infinite alternate`
            }}
          />
        ))}
        
        {/* Galaxy-like swirls */}
        <div className="absolute top-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-gradient-to-r from-purple-800/10 to-indigo-800/10 blur-3xl animate-slow-spin"></div>
        <div className="absolute bottom-1/5 left-1/3 w-1/4 h-1/4 rounded-full bg-gradient-to-r from-blue-800/10 to-cyan-800/10 blur-3xl animate-reverse-slow-spin"></div>
      </div>
      
      <div className={`relative bg-gradient-to-b from-slate-900/90 to-slate-800/90 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-indigo-600/30 border border-indigo-500/30 backdrop-blur-sm overflow-hidden ${showAnimation ? 'animate-pulse' : ''}`}>
        
        {/* Glass-morphism background effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-slow-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-slow-pulse delay-700"></div>
        </div>
        
        {/* Universe effect with stars and particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars layer */}
          {[...Array(30)].map((_, i) => (
            <div 
              key={`star-${i}`} 
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                backgroundColor: ['#fff', '#8be9fd', '#bd93f9', '#50fa7b'][Math.floor(Math.random() * 4)],
                boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.7)',
                opacity: Math.random() * 0.9 + 0.1,
                animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite alternate`
              }}
            />
          ))}
          
          {/* Nebula effects */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          {/* Moving particles */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={`particle-${i}`} 
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: ['#ff79c6', '#8be9fd', '#f1fa8c'][Math.floor(Math.random() * 3)],
                boxShadow: '0 0 6px 2px rgba(189, 147, 249, 0.5)',
                opacity: Math.random() * 0.8 + 0.2,
                transform: 'translateZ(0)',
                animation: `floatAround ${Math.random() * 15 + 10}s linear infinite`
              }}
            />
          ))}
        </div>
        
        {/* Add keyframes for animations in a style tag */}
        <style jsx>{`
          @keyframes twinkle {
            0% { opacity: 0.1; }
            100% { opacity: 1; }
          }
          
          @keyframes floatAround {
            0% { transform: translate(0, 0); }
            25% { transform: translate(${Math.random() * 50}px, ${Math.random() * 50}px); }
            50% { transform: translate(${Math.random() * -50}px, ${Math.random() * 50}px); }
            75% { transform: translate(${Math.random() * -50}px, ${Math.random() * -50}px); }
            100% { transform: translate(0, 0); }
          }
        `}</style>
        
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

        {/* Image container with cosmic glow effect */}
        <div className="relative mx-auto mb-6 group">
          {/* Animated glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl blur-md transform group-hover:scale-105 transition-all duration-500 opacity-80 animate-pulse"></div>
          
          {/* Image frame */}
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 p-1 rounded-2xl border border-indigo-500/30 overflow-hidden">
            <div className="w-full h-64 flex items-center justify-center bg-slate-900/90 rounded-xl overflow-hidden">
              {/* Treasure image */}
              <img
                src={revealedImage.url}
                alt={`Vật phẩm #${revealedImage.id}`}
                className="w-full h-full object-contain transition-transform duration-700 hover:scale-110 z-10"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400?text=Treasure';
                }}
              />
              
              {/* Sparkle effects around image */}
              {showSparkles && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={`sparkle-${i}`} 
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        top: `${30 + Math.random() * 40}%`,
                        left: `${30 + Math.random() * 40}%`,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(161,252,255,0.4) 50%, rgba(36,0,255,0) 100%)',
                        transform: 'translateZ(0) scale(0)',
                        animation: `sparkleEffect ${1 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Cosmos portal effect behind the image */}
          <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden pointer-events-none opacity-30">
            <div className="absolute inset-0 bg-black rounded-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 mix-blend-screen opacity-50 animate-pulse"></div>
            {[...Array(20)].map((_, i) => (
              <div 
                key={`cosmicdust-${i}`} 
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#ffffff', '#8be9fd', '#bd93f9'][Math.floor(Math.random() * 3)],
                  opacity: Math.random() * 0.8,
                  boxShadow: '0 0 8px 1px rgba(139, 233, 253, 0.8)',
                  animation: `cosmicFloat ${Math.random() * 10 + 5}s linear infinite`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Additional keyframes for sparkle and cosmic dust effects */}
        <style jsx>{`
          @keyframes sparkleEffect {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          
          @keyframes cosmicFloat {
            0% { transform: translate(0, 0); }
            50% { transform: translate(${Math.random() * 20}px, ${Math.random() * 20}px); }
            100% { transform: translate(0, 0); }
          }
        `}</style>

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

        {/* Continue button with cosmic hover effect */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white py-3 px-10 rounded-xl font-medium transition-all duration-300 overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/50"
          >
            {/* Button hover effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"></span>
            
            {/* Stars inside button */}
            <span className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {[...Array(10)].map((_, i) => (
                <span
                  key={`btn-star-${i}`}
                  className="absolute inline-block rounded-full"
                  style={{
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 3px 1px rgba(255, 255, 255, 0.8)',
                    opacity: Math.random() * 0.8 + 0.2
                  }}
                />
              ))}
            </span>
            
            {/* Button text */}
            <span className="relative z-10 font-bold tracking-wide">Tiếp tục</span>
          </button>
        </div>
        
        {/* Additional animation keyframes */}
        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 0.2; }
            100% { opacity: 1; }
          }
          
          @keyframes slow-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes reverse-slow-spin {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          
          @keyframes slow-pulse {
            0% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0.2; transform: scale(0.8); }
          }
          
          .animate-slow-spin {
            animation: slow-spin 60s linear infinite;
          }
          
          .animate-reverse-slow-spin {
            animation: reverse-slow-spin 45s linear infinite;
          }
          
          .animate-slow-pulse {
            animation: slow-pulse 8s ease-in-out infinite;
          }
          
          .delay-700 {
            animation-delay: 700ms;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RevealedImagePopup;
