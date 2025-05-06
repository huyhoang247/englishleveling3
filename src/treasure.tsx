import React, { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// --- SVG Icon Components ---
// These icons are used in the card popup, so they are kept here.

// Star Icon SVG
const StarIcon = ({ size = 24, color = 'currentColor', fill = 'none', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill === 'currentColor' ? color : fill} // Use color prop for fill if fill is 'currentColor'
    stroke={color} // Use color prop for stroke
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide-icon ${className}`} // Add a base class if needed + user className
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Sword Icon SVG
const SwordIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" x2="19" y1="19" y2="13" />
    <line x1="16" x2="20" y1="16" y2="20" />
    <line x1="19" x2="21" y1="21" y2="19" />
  </svg>
);

// Shield Icon SVG
const ShieldIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Crown Icon SVG
const CrownIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm18 16H4" />
    <path d="M12 4a2 2 0 0 1 2 2 2 2 0 0 1-4 0 2 2 0 0 1 2-2z" />
    <path d="M5 20a1 1 0 0 1 1-1h12a1 0 0 1 1 1v0a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v0z" />
  </svg>
);

// X Icon SVG (for closing modal) - Keep here as it's used in the chest popup
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
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// NEW: Key Icon Component using Image (Copied from background-game.tsx)
const KeyIcon = ({ size = 24, className = '', ...props }) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
        <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
            alt="Key Icon" // Added alt text
            className="w-full h-full object-contain" // Make image fit the container
            // Optional: Add onerror to handle broken image link
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = "https://placehold.co/24x24/FFD700/000000?text=Key"; // Placeholder image
            }}
        />
    </div>
);


// Define interface for component props
interface TreasureChestProps {
  initialChests?: number; // Initial number of chests
  // REMOVED: initialGems prop
  onCoinReward: (amount: number) => void; // Callback function to add coins
  onGemReward: (amount: number) => void; // NEW: Callback function to add gems
  isGamePaused?: boolean; // Indicates if the game is paused (e.g., game over, stats fullscreen)
  isStatsFullscreen?: boolean; // Indicates if stats are in fullscreen
  collectedKeys: number; // NEW: Number of keys collected by the player
}

// Define interface for card data
interface Card {
  id: number;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: React.ReactNode; // Use React.ReactNode for SVG components
  color: string;
  background: string;
}

// Updated cards array to use SVG components
const cards: Card[] = [
  { id: 1, name: "Kiếm Sắt", rarity: "common", icon: <SwordIcon size={36} />, color: "#d4d4d8", background: "bg-gradient-to-br from-gray-200 to-gray-400" },
  { id: 2, name: "Khiên Ma Thuật", rarity: "rare", icon: <ShieldIcon size={36} />, color: "#4287f5", background: "bg-gradient-to-br from-blue-300 to-blue-500" },
  { id: 3, name: "Vương Miện", rarity: "epic", icon: <CrownIcon size={36} />, color: "#9932CC", background: "bg-gradient-to-br from-purple-400 to-purple-600" },
  // GemIcon is now in background-game.tsx, so we can't use it directly here for the card icon.
  // For now, let's use a placeholder or a different icon if needed, or assume GemIcon is imported (but it shouldn't be if it's moved).
  // Let's keep the GemIcon here for now, assuming it's needed *only* for the card display within TreasureChest.
  // If GemIcon is needed in background-game.tsx for the header display, it should be moved there.
  // Let's move GemIcon to background-game.tsx as requested by the user's goal.
  // We will need to update the legendary card icon here. Let's use StarIcon for legendary card icon as a placeholder.
  { id: 4, name: "Ngọc Rồng", rarity: "legendary", icon: <StarIcon size={36} color="#FFD700" fill="currentColor" />, color: "#FFD700", background: "bg-gradient-to-br from-yellow-300 to-amber-500" }
];

// Helper function to get rarity color
const getRarityColor = (rarity: Card['rarity']) => {
  switch(rarity) {
    case "common": return "text-gray-200";
    case "rare": return "text-blue-400";
    case "epic": return "text-purple-400";
    case "legendary": return "text-amber-400";
    default: return "text-white";
  }
};


export default function TreasureChest({ initialChests = 3, onCoinReward, onGemReward, isGamePaused = false, isStatsFullscreen = false, collectedKeys }: TreasureChestProps) {
  // States for chest and popup
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [showCard, setShowCard] = useState<Card | null>(null); // Changed to null to store card object directly
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  // REMOVED: gems state
  const [showShine, setShowShine] = useState(false);
  const [chestShake, setChestShake] = useState(false);
  const [chestsRemaining, setChestsRemaining] = useState(initialChests);
  const [pendingCoinReward, setPendingCoinReward] = useState(0);
  // NEW: State to hold pending gem reward
  const [pendingGemReward, setPendingGemReward] = useState(0);


  // State for chest coin effect
  const [isChestCoinEffectActive, setIsChestCoinEffectActive] = useState(false);
  // Timer for chest coin effect
  const chestCoinEffectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to open the chest
  const openChest = () => {
    // Prevent opening chest if game is paused, already open, or no chests left
    if (isGamePaused || isChestOpen || chestsRemaining <= 0) return;

    setChestShake(true);
    setTimeout(() => {
      setChestShake(false);
      setIsChestOpen(true);
      setShowShine(true);
      setChestsRemaining(prev => prev - 1);
      setTimeout(() => {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        setCurrentCard(randomCard);
        setShowCard(randomCard); // Set showCard to the card object
        let coinReward = 0;
        let gemReward = 0; // Initialize gem reward

        switch(randomCard.rarity) {
          case "common": coinReward = 10; break;
          case "rare": coinReward = 25; break;
          case "epic":
              coinReward = 50;
              gemReward = 2; // Award 2 gems for Epic
              break;
          case "legendary":
              coinReward = 100;
              gemReward = 5; // Award 5 gems for Legendary
              break;
        }
        setPendingCoinReward(coinReward);
        setPendingGemReward(gemReward); // Store pending gem reward

        // --- Trigger Coin Collection Effect near Chest ---
        // Clear any existing chest coin effect timer
        if (chestCoinEffectTimerRef.current) {
            clearTimeout(chestCoinEffectTimerRef.current);
        }
        // Activate the chest coin effect
        setIsChestCoinEffectActive(true);
        // Set a timer to deactivate the chest coin effect after a duration
        chestCoinEffectTimerRef.current = setTimeout(() => {
            setIsChestCoinEffectActive(false);
        }, 800); // Effect duration
        // --- END Trigger Coin Collection Effect near Chest ---

      }, 1500); // Delay before showing card
    }, 600); // Duration of shake animation
  };

  // Function to reset the chest state and collect reward
  const resetChest = () => {
    setIsChestOpen(false);
    setShowCard(null); // Reset showCard to null
    setCurrentCard(null);
    setShowShine(false);
    if (pendingCoinReward > 0) {
        // Call the parent's function to add coins
        onCoinReward(pendingCoinReward);
        setPendingCoinReward(0); // Reset pending reward after giving it to the parent
    }
     // NEW: Call the parent's function to add gems if there's a pending reward
    if (pendingGemReward > 0) {
        onGemReward(pendingGemReward);
        setPendingGemReward(0); // Reset pending gem reward
    }
  };

  // Effect to clear chest coin effect timer on unmount
  useEffect(() => {
      return () => {
          if (chestCoinEffectTimerRef.current) {
              clearTimeout(chestCoinEffectTimerRef.current);
          }
      };
  }, []); // Empty dependency array means this effect runs only on mount and unmount


  // CSS Animations (only chest/card related)
  const chestAnimations = `
    @keyframes float-card { 0% { transform: translateY(0px) rotate(0deg); filter: brightness(1); } 25% { transform: translateY(-15px) rotate(2deg); filter: brightness(1.2); } 50% { transform: translateY(-20px) rotate(0deg); filter: brightness(1.3); } 75% { transform: translateY(-15px) rotate(-2deg); filter: brightness(1.2); } 100% { transform: translateY(0px) rotate(0deg); filter: brightness(1); } }
    @keyframes chest-shake { 0% { transform: translateX(0) rotate(0deg); } 10% { transform: translateX(-4px) rotate(-3deg); } 20% { transform: translateX(4px) rotate(3deg); } 30% { transform: translateX(-4px) rotate(-3deg); } 40% { transform: translateX(4px) rotate(3deg); } 50% { transform: translateX(-4px) rotate(-2deg); } 60% { transform: translateX(4px) rotate(2deg); } }
    @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1); } }
    @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
    @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes ray-rotate { 0% { opacity: 0.3; } 50% { opacity: 0.7; } 100% { opacity: 0.3; } }
    @keyframes shine { 0% { transform: translateX(-200px) rotate(45deg); } 100% { transform: translateX(400px) rotate(45deg); } }
    @keyframes gold-particle { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 50% { opacity: 0.7; } 100% { transform: translate( calc(-50% + var(--random-x)), calc(-50% + var(--random-y)) ) scale(0); opacity: 0; } }
    @keyframes lid-open { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-100%) rotate(60deg); } } /* This animation might not be used directly with Lottie */
    .animate-float-card { animation: float-card 3s ease-in-out infinite; }
    .animate-chest-shake { animation: chest-shake 0.6s ease-in-out; }
    .animate-twinkle { animation: twinkle 5s ease-in-out infinite; }
    .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
    .animate-spin-slow { animation: spin-slow 10s linear infinite; }
    .animate-ray-rotate { animation: ray-rotate 2s ease-in-out infinite; }
    .animate-shine { animation: shine 2s linear infinite; }
    .animate-gold-particle { animation: gold-particle 1.5s ease-out forwards; }
    .animate-lid-open { animation: lid-open 0.5s ease-out forwards; }
  `;


  // Render the treasure chest and related UI
  // HIDE chest when stats are in fullscreen
  if (isStatsFullscreen) {
      return null; // Don't render anything if stats are fullscreen
  }


  return (
    <>
      {/* Add chest-specific CSS animations */}
      <style>{chestAnimations}</style>

      {/* Treasure chest and remaining chests count - Positioned on top of the game */}
      <div className="absolute bottom-32 flex flex-col items-center justify-center w-full z-20"> {/* Adjusted z-index */}
        <div
          className={`cursor-pointer transition-all duration-300 relative ${isChestOpen ? 'scale-110' : ''} ${chestShake ? 'animate-chest-shake' : ''}`}
          // Disable click if game is paused, already open, or no chests left
          onClick={!isGamePaused && !isChestOpen && chestsRemaining > 0 ? openChest : null}
          aria-label={chestsRemaining > 0 ? "Mở rương báu" : "Hết rương"}
          role="button"
          tabIndex={!isGamePaused && chestsRemaining > 0 ? 0 : -1} // Make focusable only when usable
        >
          <div className="flex flex-col items-center justify-center relative"> {/* Added relative positioning here for the coin effect */}
            {/* Chest main body */}
            <div className="flex flex-col items-center">
              {/* Chest top part */}
              <div className="bg-gradient-to-b from-amber-700 to-amber-900 w-32 h-24 rounded-t-xl relative shadow-2xl shadow-amber-950/70 overflow-hidden z-10 border-2 border-amber-600">
                {/* Decorations */}
                <div className="absolute inset-x-0 top-0 h-full">
                  <div className="absolute left-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  <div className="absolute right-3 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-700 to-yellow-500"></div>
                </div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-br border-b border-r border-yellow-600"></div>
                <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-bl from-yellow-300 to-yellow-500 rounded-bl border-b border-l border-yellow-600"></div>
                <div className="absolute bottom-1 left-1 w-4 h-4 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-tr border-t border-r border-yellow-600"></div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-tl from-yellow-400 to-yellow-600 rounded-tl border-t border-l border-yellow-600"></div>

                {/* Chest closed view */}
                <div className={`absolute inset-0 transition-all duration-1000 ${isChestOpen ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="bg-gradient-to-b from-amber-600 to-amber-800 h-7 w-full absolute top-0 rounded-t-xl flex justify-center items-center overflow-hidden border-b-2 border-amber-500/80">
                    <div className="relative">
                      <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 w-12 h-3 rounded-md shadow-md"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/50">
                        <div className="w-2 h-2 bg-yellow-100 rounded-full animate-pulse-subtle"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center h-full pt-7 pb-4">
                    <div className="bg-gradient-to-b from-amber-600 to-amber-800 w-16 h-14 rounded-lg flex justify-center items-center border-2 border-amber-500/80 relative shadow-inner shadow-amber-950/50">
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 w-full bg-gradient-to-r from-yellow-300/40 via-transparent to-yellow-300/40"></div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 w-7 h-7 rounded-md shadow-inner shadow-yellow-100/50 relative overflow-hidden transform rotate-45">
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/50 rounded-full"></div>
                        <div className="absolute bottom-0 right-0 bg-yellow-600/40 w-full h-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {showShine && (
                  <div className="absolute inset-0 top-0 flex justify-center items-center overflow-hidden">
                    <div className="w-40 h-40 bg-gradient-to-b from-yellow-100 to-transparent rounded-full animate-pulse-fast opacity-60"></div>
                    {[...Array(16)].map((_, i) => (
                      <div key={`ray-${i}`} className="absolute w-1.5 h-32 bg-gradient-to-t from-yellow-100/0 via-yellow-100/80 to-yellow-100/0 opacity-80 animate-ray-rotate" style={{ transform: `rotate(${i * 22.5}deg)`, transformOrigin: 'center' }}></div>
                    ))}
                    {[...Array(20)].map((_, i) => (
                      <div key={`particle-${i}`} className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-gold-particle" style={{ left: '50%', top: '50%', animationDelay: `${i * 0.05}s`, '--random-x': `${Math.random() * 200 - 100}px`, '--random-y': `${Math.random() * 200 - 100}px` }}></div>
                    ))}
                  </div>
                )}
                {showCard ? (
                  <div className={`w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative z-10 ${currentCard?.background}`}>
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <div className="absolute -inset-20 w-40 h-[300px] bg-white/30 rotate-45 transform translate-x-[-200px] animate-shine"></div>
                    </div>
                    {/* Render the card icon */}
                    <div className="text-6xl mb-2" style={{ color: currentCard.color }}>{currentCard?.icon}</div>
                    <h3 className="text-xl font-bold text-white mt-4">{currentCard.name}</h3>
                    <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-2 font-medium`}>{currentCard.rarity}</p>
                    <div className="flex mt-3">
                      {[...Array(currentCard.rarity === "legendary" ? 5 : currentCard.rarity === "epic" ? 4 : currentCard.rarity === "rare" ? 3 : 2)].map((_, i) => (
                        <StarIcon key={i} size={16} className={getRarityColor(currentCard.rarity)} fill="currentColor" color="currentColor"/>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="animate-bounce w-10 h-10 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 relative z-10">
                    <div className="absolute inset-1 bg-gradient-to-br from-white/80 to-transparent rounded-full"></div>
                  </div>
                )}
                </div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-500 to-amber-700 border-t-2 border-amber-600/80 flex items-center justify-center">
                <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
            </div>
            {/* Chest base */}
            <div className="flex flex-col items-center relative -mt-1 z-0"></div>
          </div>

          {/* --- Coin Collection Effect Lottie near Chest --- */}
          {/* Position this absolutely relative to the chest container */}
          {isChestCoinEffectActive && (
              <div
                  className="absolute w-16 h-16 pointer-events-none z-50" // Adjust size and z-index as needed
                  style={{
                      // Position relative to the center-top of the chest container
                      top: '-20px', // Adjust vertical position above the chest
                      left: '50%', // Center horizontally
                      transform: 'translate(-50%, -50%)', // Ensure perfect centering
                  }}
              >
                  <DotLottieReact
                      src="https://lottie.host/07b8de00-e2ad-4d17-af12-9cbb13149269/vjmhfykbUL.lottie" // Lottie URL provided by user
                      loop={false} // Play once
                      autoplay
                      className="w-full h-full"
                  />
              </div>
          )}


        </div>

        {/* Display remaining chests count and key count */}
        <div className="mt-4 flex items-center space-x-2"> {/* Use flex and space-x for layout */}
          {/* Chest count */}
          <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
            {chestsRemaining > 0 && (<div className="absolute inset-0 bg-yellow-500/10 rounded-lg animate-pulse-slow"></div>)}
            <div className="flex items-center">
              <span className="text-amber-200 font-bold text-xs">{chestsRemaining}</span>
              <span className="text-amber-400/80 text-xs">/{initialChests}</span> {/* Use initialChests for total count */}
            </div>
            {chestsRemaining > 0 && (<div className="absolute -inset-0.5 bg-yellow-500/20 rounded-lg blur-sm -z-10"></div>)}
          </div>

          {/* Key count */}
          {/* NEW: Added Key Icon and collectedKeys count */}
          <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
             {collectedKeys > 0 && (<div className="absolute inset-0 bg-yellow-500/10 rounded-lg animate-pulse-slow"></div>)}
             <div className="flex items-center">
                 <KeyIcon size={16} className="mr-1" /> {/* Key Icon */}
                 <span className="text-amber-200 font-bold text-xs">{collectedKeys}</span> {/* Collected Keys Count */}
             </div>
             {collectedKeys > 0 && (<div className="absolute -inset-0.5 bg-yellow-500/20 rounded-lg blur-sm -z-10"></div>)}
          </div>

        </div>
      </div>


      {/* Card info popup - Positioned on top of everything */}
      {showCard && currentCard && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"> {/* Increased z-index */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-lg shadow-blue-500/30 border border-slate-700 relative">
            <div className="absolute -top-3 -right-3">
              <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
            </div>
            <div className="text-xl font-bold text-white mb-6">Bạn nhận được</div>
            <div className={`w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative ${currentCard.background}`}>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-20 w-40 h-[300px] bg-white/30 rotate-45 transform translate-x-[-200px] animate-shine"></div>
              </div>
              {/* Render the card icon */}
              <div className="text-6xl mb-2" style={{ color: currentCard.color }}>{currentCard?.icon}</div>
              <h3 className="text-xl font-bold text-white mt-4">{currentCard.name}</h3>
              <p className={`${getRarityColor(currentCard.rarity)} capitalize mt-2 font-medium`}>{currentCard.rarity}</p>
              <div className="flex mt-3">
                {[...Array(currentCard.rarity === "legendary" ? 5 : currentCard.rarity === "epic" ? 4 : currentCard.rarity === "rare" ? 3 : 2)].map((_, i) => (
                  <StarIcon key={i} size={16} className={getRarityColor(currentCard.rarity)} fill="currentColor" color="currentColor"/>
                ))}
              </div>
            </div>
            <button onClick={resetChest} className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-8 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-105">
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </>
  );
}
