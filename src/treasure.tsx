import React, { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// Import the image URLs list
import { defaultImageUrls } from './image-url.ts'; // Adjust the path if necessary

// Import db from your firebase.js file
import { db } from './firebase.js'; // Adjust the path if necessary

// Import necessary Firestore functions
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User } from 'firebase/auth'; // Import User type


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
    <path d="M5 20a1 1 0 0 1 1-1h12a1 0 0 1 1 1v0a1 0 0 1-1 1H6a1 0 0 1-1-1v0z" />
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
    <line x1="6" y1="6" x2="18" y1="18" />
  </svg>
);

// Key Icon Component
const KeyIcon = () => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
    alt="Key Icon"
    className="w-4 h-4 object-contain"
  />
);


// Define interface for component props
interface TreasureChestProps {
  initialChests?: number; // Initial number of chests (still needed for logic)
  keyCount?: number; // NEW: Number of keys collected
  onKeyCollect?: (amount: number) => void; // NEW: Callback for when a key is collected (used for unlocking chests)
  onCoinReward: (amount: number) => void; // Callback function to add coins
  onGemReward: (amount: number) => void; // Callback function to add gems
  isGamePaused?: boolean; // Indicates if the game is paused (e.g., game over, stats fullscreen)
  isStatsFullscreen?: boolean; // Indicates if stats are in fullscreen
  currentUserId: string | null; // Pass the current user ID as a prop (can be null if not logged in)
}

// Define interface for card data (keeping this for potential future use or if other rewards are still cards)
interface Card {
  id: number;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: React.ReactNode; // Use React.ReactNode for SVG components
  color: string;
  background: string;
}

// Define interface for the revealed image data
interface RevealedImage {
    id: number; // Using index + 1 as ID (1-based)
    url: string;
}


// Helper function to get rarity color (still needed if card rewards are kept)
const getRarityColor = (rarity: Card['rarity']) => {
  switch(rarity) {
    case "common": return "text-gray-200";
    case "rare": return "text-blue-400";
    case "epic": return "text-purple-400";
    case "legendary": return "text-amber-400";
    default: return "text-white";
  }
};


export default function TreasureChest({ initialChests = 3, keyCount = 0, onKeyCollect, onCoinReward, onGemReward, isGamePaused = false, isStatsFullscreen = false, currentUserId }: TreasureChestProps) {
  // States for chest and popup
  const [isChestOpen, setIsChestOpen] = useState(false);
  // State to hold the revealed image data (ID and URL)
  const [revealedImage, setRevealedImage] = useState<RevealedImage | null>(null);
  const [showShine, setShowShine] = useState(false);
  const [chestShake, setChestShake] = useState(false);
  // State for chests remaining - This state will now represent chests that can be opened with keys
  // It's still needed for the openChest logic, but won't be displayed directly as a number
  const [chestsRemaining, setChestsRemaining] = useState(initialChests);
  const [pendingCoinReward, setPendingCoinReward] = useState(0);
  // State to hold pending gem reward
  const [pendingGemReward, setPendingGemReward] = useState(0);

  // State to manage the list of available image indices (0-based)
  const [availableImageIndices, setAvailableImageIndices] = useState<number[]>([]);
  // State to track if data is being loaded from Firestore
  const [isLoading, setIsLoading] = useState(true);

  // --- Firestore Interaction ---
  // Effect to fetch opened image IDs (1-based) from Firestore on component mount or user change
  useEffect(() => {
      const fetchOpenedImages = async () => {
          // If no user is logged in, initialize with all images and stop loading
          if (!currentUserId) {
              console.log("User not logged in, cannot fetch opened images. Initializing with all images.");
              setIsLoading(false);
              // Initialize with all indices (0 to length-1)
              const initialIndices = defaultImageUrls.map((_, index) => index);
              setAvailableImageIndices(initialIndices);
              return;
          }

          setIsLoading(true);
          const userDocRef = doc(db, 'users', currentUserId);

          try {
              const userDocSnap = await getDoc(userDocRef);

              let openedImageIds: number[] = []; // These are 1-based IDs
              if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  // Ensure openedImageIds is treated as an array of numbers (1-based)
                  if (userData?.openedImageIds && Array.isArray(userData.openedImageIds)) {
                      // Filter to ensure only valid numbers (greater than 0) are included
                      openedImageIds = userData.openedImageIds.filter(id => typeof id === 'number' && id > 0);
                  }
              } else {
                  // If user document doesn't exist, create it with an empty array.
                  console.warn(`User document for ${currentUserId} not found during fetch. Creating...`);
                   await setDoc(userDocRef, { openedImageIds: [] }, { merge: true }); // Use merge: true
              }

              // Convert openedImageIds (1-based) to openedImageIndices (0-based)
              const openedImageIndices = openedImageIds.map(id => id - 1).filter(index => index >= 0 && index < defaultImageUrls.length);

              // Filter out the opened image indices from the full list of indices (0-based)
              const allIndices = defaultImageUrls.map((_, index) => index);
              const remainingIndices = allIndices.filter(index => !openedImageIndices.includes(index));
              setAvailableImageIndices(remainingIndices);

          } catch (error) {
              console.error("Error fetching opened images:", error);
              // In case of error, initialize with all images to allow some functionality
              const initialIndices = defaultImageUrls.map((_, index) => index);
              setAvailableImageIndices(initialIndices);
          } finally {
              setIsLoading(false);
          }
      };

      fetchOpenedImages();

  }, [currentUserId, db]); // Re-run effect if currentUserId or db instance changes

  // Function to add a revealed image ID (1-based) to Firestore
  const addOpenedImageToFirestore = async (imageId: number) => {
      if (!currentUserId) {
          console.log("User not logged in, cannot save opened image.");
          return;
      }
      // Ensure the imageId is valid (greater than 0)
      if (imageId <= 0) {
          console.error("Invalid image ID for saving:", imageId);
          return;
      }

      const userDocRef = doc(db, 'users', currentUserId);

      try {
          // Use arrayUnion to add the imageId (1-based) to the openedImageIds array
          await updateDoc(userDocRef, {
              openedImageIds: arrayUnion(imageId)
          });
          console.log(`Image ID ${imageId} added to Firestore for user ${currentUserId}`);
      } catch (error) {
          console.error("Error adding opened image to Firestore:", error);
      }
  };
  // --- End Firestore Interaction ---


  // State for chest coin effect
  const [isChestCoinEffectActive, setIsChestCoinEffectActive] = useState(false);
  // Timer for chest coin effect
  const chestCoinEffectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to open the chest
  const openChest = () => {
    // Prevent opening chest if game is paused, already open, no chests left, or not enough keys
    // Also prevent if there are no images left to reveal, data is still loading, or user is not logged in
    if (isGamePaused || isChestOpen || chestsRemaining <= 0 || keyCount < 1 || availableImageIndices.length === 0 || isLoading || !currentUserId) {
        if (isLoading) {
             console.log("Đang tải dữ liệu...");
        } else if (!currentUserId) {
             console.log("Vui lòng đăng nhập để mở rương!");
        } else if (keyCount < 1) {
            console.log("Không đủ chìa khóa để mở rương!"); // Log or show a message to the user
        } else if (chestsRemaining <= 0) {
             console.log("Hết rương để mở!"); // Log or show a message if no chests are left
        } else if (availableImageIndices.length === 0) {
             console.log("Đã mở hết tất cả hình ảnh!"); // Log or show a message if all images are revealed
        }
        return;
    }

    setChestShake(true);
    setTimeout(() => {
      setChestShake(false);
      setIsChestOpen(true);
      setShowShine(true);
      // Decrease chests remaining and use one key
      setChestsRemaining(prev => prev - 1);
      if (onKeyCollect) {
          onKeyCollect(1); // Signal that 1 key was used (e.g., to decrease key count in parent)
      }

      setTimeout(() => {
        // --- Image Selection Logic ---
        // Select a random index (0-based) from the available indices
        const randomIndex = Math.floor(Math.random() * availableImageIndices.length);
        const selectedImageIndex = availableImageIndices[randomIndex];
        const selectedImageUrl = defaultImageUrls[selectedImageIndex];

        // Store the revealed image data (ID is index + 1)
        setRevealedImage({ id: selectedImageIndex + 1, url: selectedImageUrl });

        // Remove the selected index from the available indices state immediately
        setAvailableImageIndices(prevIndices =>
            prevIndices.filter(index => index !== selectedImageIndex)
        );

        // --- Save the opened image ID (1-based) to Firestore ---
        addOpenedImageToFirestore(selectedImageIndex + 1);
        // --- End Save to Firestore ---

        // --- Reward Logic (Example: Still give a small coin/gem reward with each image) ---
        // You can adjust or remove this if opening a chest only gives an image
        let coinReward = 10; // Example: Always give 10 coins per image
        let gemReward = 1; // Example: Always give 1 gem per image
        setPendingCoinReward(coinReward);
        setPendingGemReward(gemReward);
        // --- End Reward Logic ---


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

      }, 1500); // Delay before showing the revealed item (image)
    }, 600); // Duration of shake animation
  };

  // Function to reset the chest state and collect reward
  const resetChest = () => {
    setIsChestOpen(false);
    setRevealedImage(null); // Reset the revealed image state
    setShowShine(false);
    if (pendingCoinReward > 0) {
        // Call the parent's function to add coins
        onCoinReward(pendingCoinReward);
        setPendingCoinReward(0); // Reset pending reward after giving it to the parent
    }
     // Call the parent's function to add gems if there's a pending reward
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

  // Show loading indicator while fetching data
  if (isLoading) {
      return (
          <div className="absolute bottom-32 flex flex-col items-center justify-center w-full z-20 text-white">
              Đang tải dữ liệu rương...
          </div>
      );
  }


  return (
    <>
      {/* Add chest-specific CSS animations */}
      <style>{chestAnimations}</style>

      {/* Display available images count - Positioned above the chest */}
      {/* Adjusted bottom value to position it above the chest */}
      <div className="absolute bottom-64 flex flex-col items-center justify-center w-full z-20">
           <div className="bg-black bg-opacity-60 px-2 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
               <span className="text-blue-200 font-bold text-xs">Hình ảnh còn lại: {availableImageIndices.length}</span>
           </div>
      </div>


      {/* Treasure chest and keys count - Positioned on top of the game */}
      {/* Kept original bottom value for the chest and added keys back */}
      <div className="absolute bottom-32 flex flex-col items-center justify-center w-full z-20"> {/* Adjusted z-index */}
        <button // Changed from div to button for accessibility and disabled state
          className={`cursor-pointer transition-all duration-300 relative ${isChestOpen ? 'scale-110' : ''} ${chestShake ? 'animate-chest-shake' : ''} ${!currentUserId || isGamePaused || isChestOpen || chestsRemaining <= 0 || keyCount < 1 || availableImageIndices.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} // Added disabled styling and conditions
          disabled={
            isGamePaused
            || isChestOpen
            || chestsRemaining === 0
            || keyCount < 1
            || availableImageIndices.length === 0 // Use availableImageIndices.length
            || isLoading
            || !currentUserId // Disable if no user ID
          }
          onClick={openChest}
          aria-label={availableImageIndices.length > 0 ? "Mở rương báu" : "Hết hình ảnh"}
          role="button"
          tabIndex={!isGamePaused && chestsRemaining > 0 && keyCount >= 1 && availableImageIndices.length > 0 && !isLoading && currentUserId ? 0 : -1} // Make focusable only when usable
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
                {/* Display the revealed image if available */}
                {revealedImage ? (
                  <div className="w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative z-10 bg-slate-700/50 overflow-hidden">
                     <img
                        src={revealedImage.url}
                        alt={`Revealed item with ID ${revealedImage.id}`}
                        // Changed object-cover to object-contain here
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                            // Optional: Handle image loading errors, e.g., show a placeholder
                            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/160x208?text=Image+Error';
                        }}
                     />
                  </div>
                ) : (
                  // Show the bounce animation when no image is revealed yet
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


        </button>

        {/* Display keys count - Positioned next to the chest */}
        <div className="mt-4 flex space-x-3 items-center justify-center">
          {/* Keys */}
          <div className="bg-black bg-opacity-60 px-2 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative">
            {keyCount > 0 && (
              <div className="absolute inset-0 bg-green-500/10 rounded-lg animate-pulse-slow"></div>
            )}
            <KeyIcon /> {/* Kept KeyIcon here */}
            <span className="text-green-200 font-bold text-xs">{keyCount}</span>
             {keyCount > 0 && (<div className="absolute -inset-0.5 bg-green-500/20 rounded-lg blur-sm -z-10"></div>)}
          </div>
        </div>
      </div>


      {/* Revealed Image Popup - Positioned on top of everything */}
      {revealedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"> {/* Increased z-index */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-lg shadow-blue-500/30 border border-slate-700 relative">
            <div className="absolute -top-3 -right-3">
              <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-dashed border-blue-400 opacity-30"></div>
            </div>
            <div className="text-xl font-bold text-white mb-4">Bạn nhận được</div>
            {/* Display the revealed image in the popup */}
            <div className="w-40 h-52 mx-auto rounded-xl shadow-xl mb-6 flex flex-col items-center justify-center relative bg-slate-700/50 overflow-hidden">
                 <img
                    src={revealedImage.url}
                    alt={`Revealed item with ID ${revealedImage.id}`}
                    // Changed object-cover to object-contain here
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
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

            <button onClick={resetChest} className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-8 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/50 hover:scale-105">
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </>
  );
}
