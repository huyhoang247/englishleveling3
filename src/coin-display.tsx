import React, { useState, useEffect, useRef } from 'react';

// Define the props for the CoinDisplay component
interface CoinDisplayProps {
  // The actual number of coins the player has
  coins: number;
  // Flag to indicate if the game is in fullscreen stats mode (optional, for pausing animation)
  isStatsFullscreen?: boolean;
}

// CoinDisplay component to show the coin icon and animated count
const CoinDisplay: React.FC<CoinDisplayProps> = ({ coins, isStatsFullscreen }) => {
  // State to manage the number displayed during the animation
  const [displayedCoins, setDisplayedCoins] = useState(coins);
  // Ref for the animation timer
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle the coin count animation when the actual coins count changes
  useEffect(() => {
    // If the displayed count is already the same as the actual count, do nothing
    if (displayedCoins === coins) {
      return;
    }

    // Clear any existing animation timer to prevent multiple animations running
    if (coinCountAnimationTimerRef.current) {
      clearInterval(coinCountAnimationTimerRef.current);
    }

    const oldCoins = displayedCoins; // Start animation from the currently displayed number
    const newCoins = coins; // Animate towards the new actual coin count
    const difference = newCoins - oldCoins; // Calculate the difference
    const duration = 500; // Animation duration in ms
    const steps = duration / 50; // Calculate number of steps based on interval (50ms)
    const stepAmount = difference / steps; // Amount to add/subtract per step

    let current = oldCoins;

    const countInterval = setInterval(() => {
      current += stepAmount;

      // Determine if we have reached or passed the target
      const reachedTarget = difference > 0 ? current >= newCoins : current <= newCoins;

      if (reachedTarget) {
        // Set the final value and clear the interval
        setDisplayedCoins(newCoins);
        clearInterval(countInterval);
        coinCountAnimationTimerRef.current = null; // Clear the ref
      } else {
        // Update the displayed value (round to nearest integer)
        setDisplayedCoins(Math.round(current));
      }
    }, 50); // Update interval (e.g., every 50ms)

    // Store the interval ID in the ref
    coinCountAnimationTimerRef.current = countInterval;

    // Cleanup function to clear the interval if the component unmounts or effect re-runs
    return () => {
      if (coinCountAnimationTimerRef.current) {
        clearInterval(coinCountAnimationTimerRef.current);
        coinCountAnimationTimerRef.current = null;
      }
    };
  }, [coins]); // Dependency array: re-run effect when the 'coins' prop changes

   // Effect to handle the 'number-changing' CSS class for visual animation feedback
   useEffect(() => {
      const coinElement = document.querySelector('.coin-counter');
      if (coinElement) {
          // Add the class when the displayed count is different from the actual count
          if (displayedCoins !== coins) {
              coinElement.classList.add('number-changing');
          } else {
              // Remove the class when the animation finishes (displayed count equals actual count)
              coinElement.classList.remove('number-changing');
          }

          // Cleanup function to ensure the class is removed
          return () => {
              if (coinElement) {
                  coinElement.classList.remove('number-changing');
              }
          };
      }
      // No cleanup needed if coinElement is not found
      return () => {};
  }, [displayedCoins, coins]); // Dependencies: trigger when displayedCoins or coins change


  return (
    // Container for the coin icon and the count
    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      {/* Shine effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      {/* Coin Icon */}
      <div className="relative mr-0.5 flex items-center justify-center">
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
          alt="Dollar Coin Icon" // Add alt text
          className="w-4 h-4" // Adjust size as needed
          // Optional: Add onerror to handle broken image link
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = "https://placehold.co/16x16/ffd700/000000?text=$"; // Placeholder image
          }}
        />
      </div>
      {/* Coin Count Display */}
      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter">
        {/* Display the animated coin count */}
        {displayedCoins.toLocaleString()}
      </div>
      {/* Plus button for Coins - Functionality can be added later */}
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
        <span className="text-white font-bold text-xs">+</span>
      </div>
      {/* Small highlight dots */}
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

export default CoinDisplay;
