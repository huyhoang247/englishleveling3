import React, { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// Import the image URLs list
import { defaultImageUrls } from './voca-data/image-url.ts'; // Adjust the path if necessary

// NEW: Import treasure assets
import { treasureAssets } from './game-assets.ts'; // Adjust path if necessary

// Import db from your firebase.js file
import { db } from './firebase.js'; // Adjust the path if necessary

// Import necessary Firestore functions
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User } from 'firebase/auth'; // Import User type

// Import the new popup component
import RevealedImagePopup from './treasure-image-popup.tsx'; // Adjust the path if necessary


// --- SVG Icon Components ---
// These icons are used in the card popup or other parts of the component, so they are kept here or in a shared file.

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
  initialChests?: number; // Initial number of chests (no longer used for opening logic)
  keyCount?: number; // Number of keys collected
  onKeyCollect?: (amount: number) => void; // Callback for when a key is collected (used for unlocking chests)
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

// Define interface for the revealed image data - KEPT HERE as TreasureChest manages this state
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


// Removed initialChests from props default value as it's no longer used for opening logic
export default function TreasureChest({ keyCount = 0, onKeyCollect, onCoinReward, onGemReward, isGamePaused = false, isStatsFullscreen = false, currentUserId }: TreasureChestProps) {
  // States for chest and popup
  const [isChestOpen, setIsChestOpen] = useState(false);
  // State to hold the revealed image data (ID and URL) - MANAGED HERE
  const [revealedImage, setRevealedImage] = useState<RevealedImage | null>(null);
  const [showShine, setShowShine] = useState(false);
  const [chestShake, setChestShake] = useState(false);
  // Removed chestsRemaining state as it's no longer used for opening logic
  // const [chestsRemaining, setChestsRemaining] = useState(initialChests);
  // State to hold pending coin reward - MANAGED HERE
  const [pendingCoinReward, setPendingCoinReward] = useState(0);
  // State to hold pending gem reward - MANAGED HERE
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
    // Prevent opening chest if game is paused, already open, not enough keys, or no images left
    // Also prevent if data is still loading, or user is not logged in
    // Removed chestsRemaining <= 0 condition
    if (isGamePaused || isChestOpen || keyCount < 1 || availableImageIndices.length === 0 || isLoading || !currentUserId) {
        if (isLoading) {
             console.log("Đang tải dữ liệu...");
        } else if (!currentUserId) {
             console.log("Vui lòng đăng nhập để mở rương!");
        } else if (keyCount < 1) {
            console.log("Không đủ chìa khóa để mở rương!"); // Log or show a message to the user
        } else if (availableImageIndices.length === 0) {
             console.log("Đã mở hết tất cả hình ảnh!"); // Log or show a message if all images are revealed
        }
        return;
    }

    setChestShake(true);
    setTimeout(() => {
      setChestShake(false);
      setIsChestOpen(true); // This will start the opening animation
      setShowShine(true); // This layers the particle effects on top
      // Removed Decrease chests remaining logic
      // setChestsRemaining(prev => prev - 1);
      if (onKeyCollect) {
          onKeyCollect(1); // Signal that 1 key was used (e.g., to decrease key count in parent)
      }

      // Wait for the opening animation to play out before showing the reward
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

      }, 2000); // Delay before showing the revealed item (image). Let Lottie play.
    }, 600); // Duration of shake animation
  };

  // Function to handle closing the popup and collecting rewards
  const handleClosePopup = () => {
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


  // CSS Animations (only chest/card related) - KEPT HERE as they are chest-specific
  const chestAnimations = `
    @keyframes float-card { 0% { transform: translateY(0px) rotate(0deg); filter: brightness(1); } 25% { transform: translateY(-15px) rotate(2deg); filter: brightness(1.2); } 50% { transform: translateY(-20px) rotate(0deg); filter: brightness(1.3); } 75% { transform: translateY(-15px) rotate(-2deg); filter: brightness(1.2); } 100% { translateY(0px) rotate(0deg); filter: brightness(1); } }
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

  // Define a consistent margin value for spacing above and below the chest
  const verticalSpacing = 'mb-6'; // Use mb-6 for space below the image count
  const verticalSpacingTop = 'mt-6'; // Use mt-6 for space above the keys

  return (
    <>
      {/* Add chest-specific CSS animations */}
      <style>{chestAnimations}</style>

      {/* Container for the image count, chest, and keys */}
      {/* Position this container, and its children will be laid out inside */}
      <div className="absolute bottom-32 flex flex-col items-center justify-center w-full z-20"> {/* Main container */}

        {/* Display available images count - Positioned above the chest */}
        {/* Use margin-bottom to create space below this element */}
        <div className={`${verticalSpacing} bg-black bg-opacity-60 px-2 py-1 rounded-lg border border-gray-700 shadow-lg flex items-center space-x-1 relative`}>
             <span className="text-blue-200 font-bold text-xs">Hình ảnh còn lại: {availableImageIndices.length}</span>
        </div>


        {/* Treasure chest button */}
        <button // Changed from div to button for accessibility and disabled state
          className={`cursor-pointer transition-all duration-300 relative ${!currentUserId || isGamePaused || isChestOpen || keyCount < 1 || availableImageIndices.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} // Added disabled styling and conditions, Removed chestsRemaining <= 0
          disabled={
            isGamePaused
            || isChestOpen
            || keyCount < 1
            || availableImageIndices.length === 0 // Use availableImageIndices.length
            || isLoading
            || !currentUserId // Disable if no user ID
          }
          onClick={openChest}
          // Updated aria-label to reflect dependency on keys and available images
          aria-label={availableImageIndices.length > 0 && keyCount > 0 ? "Mở rương báu" : availableImageIndices.length === 0 ? "Hết hình ảnh" : "Không đủ chìa khóa"}
          role="button"
          // Updated tabIndex condition
          tabIndex={!isGamePaused && keyCount >= 1 && availableImageIndices.length > 0 && !isLoading && currentUserId ? 0 : -1}
        >
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Static chest image - always visible, but scales up when open */}
            <img
                src={treasureAssets.chestClosed}
                alt="Treasure Chest"
                className={`w-32 h-32 object-contain transition-all duration-300 transform-gpu
                    ${chestShake ? 'animate-chest-shake' : ''}
                    ${isChestOpen ? 'scale-110' : 'scale-100'}`} // <<< THIS LINE WAS CHANGED: Removed opacity-0 so the chest stays visible
            />

            {/* Lottie animation for opening - only renders and plays when opening */}
            {isChestOpen && (
                <div className="absolute inset-0 pointer-events-none">
                    <DotLottieReact
                        src="https://lottie.host/1f7c7b86-a416-494a-a63e-10878a87319c/x7MAb2mDgC.lottie"
                        loop={false}
                        autoplay
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* The existing shine effect (only gold particles) is layered on top during the animation */}
            {showShine && (
                <div className="absolute inset-0 flex justify-center items-center overflow-hidden pointer-events-none">
                    {/* The large circle and star-like rays have been removed as requested. */}
                    {/* Only the small gold particles remain for a subtle effect. */}
                    {[...Array(20)].map((_, i) => (
                        <div key={`particle-${i}`} className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-gold-particle" style={{ left: '50%', top: '50%', animationDelay: `${i * 0.05}s`, '--random-x': `${Math.random() * 200 - 100}px`, '--random-y': `${Math.random() * 200 - 100}px` }}></div>
                    ))}
                </div>
            )}
        </div>


          {/* --- Coin Collection Effect Lottie near Chest --- */}
          {/* Position this absolutely relative to the chest button */}
          {isChestCoinEffectActive && (
              <div
                  className="absolute w-16 h-16 pointer-events-none z-50" // Adjust size and z-index as needed
                  style={{
                      // Position relative to the center-top of the chest container
                      top: '20%', // Adjust vertical position
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

        {/* Display keys count - Positioned below the chest */}
        {/* Use margin-top to create space above this element */}
        <div className={`${verticalSpacingTop} flex space-x-3 items-center justify-center`}>
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

      {/* Use the new RevealedImagePopup component */}
      <RevealedImagePopup
          revealedImage={revealedImage}
          pendingCoinReward={pendingCoinReward}
          pendingGemReward={pendingGemReward}
          onClose={handleClosePopup} // Pass the handler function
      />
    </>
  );
}
