import { useState } from 'react';

const GameProgressBar = () => {
  const [currentLevel, setCurrentLevel] = useState(17);
  const maxLevel = 50;
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate progress percentage
  const progress = (currentLevel / maxLevel) * 100;
  
  // Increment progress
  const incrementProgress = () => {
    setCurrentLevel(prevLevel => Math.min(prevLevel + 1, maxLevel));
  };
  
  // Decrement progress
  const decrementProgress = () => {
    setCurrentLevel(prevLevel => Math.max(prevLevel - 1, 0));
  };
  
  // We no longer need the status color function since we're using the original gradient
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
      {/* Header with compact level counter design */}
      <div className="flex items-center mb-4">
        {/* Compact level counter on the left */}
        <div className="relative">
          <div className="bg-gray-900 rounded-lg px-2 py-1 shadow-inner border border-gray-700">
            <div className="flex items-center">
              {/* Current level */}
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {currentLevel}
              </span>
              
              {/* Separator */}
              <span className="mx-0.5 text-gray-500 text-xs">/</span>
              
              {/* Max level */}
              <span className="text-xs text-gray-400">{maxLevel}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar with cleaner design */}
      <div 
        className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full"></div>
        </div>
        
        {/* Progress fill with smooth animation */}
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Light reflex effect */}
          <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
          
          {/* Animated particles when hovered */}
          {isHovered && (
            <div className="absolute inset-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-ping opacity-80"
                  style={{
                    left: `${20 * i + 10}%`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Control buttons with modern design */}
      <div className="flex justify-center space-x-4 mt-4">
        <button 
          onClick={decrementProgress}
          className="p-1 w-8 h-8 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={currentLevel <= 0}
        >
          <span className="text-sm font-bold">-</span>
        </button>
        
        <button 
          onClick={incrementProgress}
          className="p-1 w-8 h-8 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={currentLevel >= maxLevel}
        >
          <span className="text-sm font-bold">+</span>
        </button>
      </div>
    </div>
  );
};

export default GameProgressBar;
