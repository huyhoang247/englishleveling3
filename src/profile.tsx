import React, { useState, useEffect } from 'react';

// Component IconSVG mới để chứa các biểu tượng SVG
const IconSVG = ({ icon, size = 24, className = "", ...props }) => {
  const icons = {
    trendingUp: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
    zap: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
    layers: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    ),
    gem: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polygon points="16 2 8 2 2 8 8 16 16 8 22 14 16 2"></polygon>
      </svg>
    ),
    chevronUp: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    ),
    book: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    star: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
    award: (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </svg>
    )
  };

  return icons[icon] || null;
};


const GameLevelSystem = () => {
  const [playerStats, setPlayerStats] = useState({
    name: "Dragon Slayer",
    level: 12,
    maxLevel: 50,
    exp: 1450,
    maxExp: 2000,
    energy: 75,
    maxEnergy: 100,
    floor: 15,
    maxFloor: 100,
    gems: 530,
    vocabulary: 327,
    maxVocabulary: 500,
    stars: 42,
    maxStars: 100
  });

  // State để quản lý việc hiển thị các nút hành động
  const [showActionButtons, setShowActionButtons] = useState(true);

  // Determine rank based on level
  const getRank = (level) => {
    if (level >= 30) return {
      name: "S Rank",
      color: "from-rose-500 to-red-600",
      text: "text-rose-300",
      border: "border-rose-500/50",
      bg: "bg-rose-900/30",
      minLevel: 30,
      maxLevel: 50
    };
    if (level >= 21) return {
      name: "A Rank",
      color: "from-amber-500 to-orange-600",
      text: "text-amber-300",
      border: "border-amber-500/50",
      bg: "bg-amber-900/30",
      minLevel: 21,
      maxLevel: 30
    };
    if (level >= 11) return {
      name: "B Rank",
      color: "from-blue-500 to-indigo-600",
      text: "text-blue-300",
      border: "border-blue-500/50",
      bg: "bg-blue-900/30",
      minLevel: 11,
      maxLevel: 21
    };
    if (level >= 6) return {
      name: "D Rank",
      color: "from-green-500 to-emerald-600",
      text: "text-green-300",
      border: "border-green-500/50",
      bg: "bg-green-900/30",
      minLevel: 6,
      maxLevel: 11
    };
    return {
      name: "E Rank",
      color: "from-gray-500 to-slate-600",
      text: "text-gray-300",
      border: "border-gray-500/50",
      bg: "bg-gray-900/30",
      minLevel: 1,
      maxLevel: 6
    };
  };

  const playerRank = getRank(playerStats.level);

  // Calculate percentages for progress bars
  const expPercentage = (playerStats.exp / playerStats.maxExp) * 100;
  const floorPercentage = (playerStats.floor / playerStats.maxFloor) * 100;
  const vocabPercentage = (playerStats.vocabulary / playerStats.maxVocabulary) * 100;
  const starsPercentage = (playerStats.stars / playerStats.maxStars) * 100;

  // Calculate level percentage within current rank instead of overall max level
  const currentRankProgress = playerStats.level - playerRank.minLevel;
  const currentRankTotal = playerRank.maxLevel - playerRank.minLevel;
  const levelPercentage = (currentRankProgress / currentRankTotal) * 100;

  // Level up effects (Removed as per previous version)
  const glowing = false;


  // Simulate EXP gain
  const increaseExp = () => {
    if (playerStats.exp < playerStats.maxExp) {
      setPlayerStats(prev => ({
        ...prev,
        exp: Math.min(prev.exp + 200, prev.maxExp)
      }));
    } else {
      const currentRank = getRank(playerStats.level).name;
      setPlayerStats(prev => {
        const newLevel = prev.level + 1;
        const newRank = getRank(newLevel).name;
        return {
          ...prev,
          level: newLevel,
          exp: 0,
          maxExp: Math.floor(prev.maxExp * 1.2),
          gems: prev.gems + 50
        };
      });
    }
  };

  // Simulate energy usage
  const useEnergy = () => {
    if (playerStats.energy > 10) {
      setPlayerStats(prev => ({
        ...prev,
        energy: prev.energy - 10,
        floor: Math.min(prev.floor + 1, prev.maxFloor),
        gems: prev.gems + 10,
        vocabulary: Math.min(prev.vocabulary + 5, prev.maxVocabulary),
        stars: Math.min(prev.stars + 2, prev.maxStars)
      }));
    } else {
      // showFloatingText('Not enough gems!', 'text-red-400'); // Removed
    }
  };

  // Simulate energy restoration
  const restoreEnergy = () => {
    if (playerStats.gems >= 20) {
      setPlayerStats(prev => ({
        ...prev,
        energy: Math.min(prev.energy + 25, prev.maxEnergy),
        gems: prev.gems - 20
      }));
    } else {
      // showFloatingText('Not enough gems!', 'text-red-400'); // Removed
    }
  };

  // Hàm xử lý ẩn/hiện các nút hành động
  const toggleActionButtons = () => {
    setShowActionButtons(prev => !prev);
  };


  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-gray-900 to-indigo-950 text-white p-4 min-h-screen">
      <div className="relative">
        {/* Level Up Animation (Removed) */}
        {/* Rank Up Animation (Removed) */}
        {/* Floating text animation (Removed) */}
        {/* Particle effect (Removed) */}

        <div className={`w-full max-w-lg bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/30 ${glowing ? 'ring-4 ring-yellow-400 animate-pulse shadow-yellow-400/50' : ''}`}>

          {/* Header with Redesigned Level Display */}
          <div className={`relative bg-gradient-to-r ${playerRank.color} p-6`}>
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-white/10 transform skew-x-12"></div>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 transform -skew-x-12"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex flex-col items-start">
                <div className="text-xs text-white/80 mb-1">PLAYER NAME</div>
                <div className="text-2xl font-bold text-white mb-2">{playerStats.name}</div>

                {/* Rank Badge - Updated with new design */}
                <div className={`relative px-4 py-1.5 rounded-md ${playerRank.bg} ${playerRank.border} border overflow-hidden`}>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent opacity-30"></div>
                  <div className="relative flex items-center">
                    {/* Thay thế Award bằng IconSVG */}
                    <IconSVG icon="award" size={16} className={`mr-1.5 ${playerRank.text}`} />
                    <span className="font-bold text-white">{playerRank.name}</span>
                  </div>
                </div>
              </div>

              {/* Redesigned Level Display */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Outer Decorative Ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-indigo-300/20 transform rotate-45"></div>
                  </div>

                  {/* Level Progress Ring */}
                  <div className="relative w-24 h-24">
                    {/* Background Ring */}
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-indigo-900/30"
                      />
                      {/* Progress Arc - Now shows progress within current rank */}
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${levelPercentage * 2.89}, 1000`}
                        className={`${playerRank.text} ${glowing ? 'animate-pulse' : ''}`}
                      />
                    </svg>

                    {/* Orbital Decoration */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${playerRank.text} absolute ${glowing ? 'animate-orbit-fast' : 'animate-orbit'}`} style={{
                        transform: `rotate(${levelPercentage * 3.6}deg) translateX(10px)`
                      }}></div>
                    </div>

                    {/* Enhanced Inner Background */}
                    <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${playerRank.bg} flex items-center justify-center shadow-inner overflow-hidden`}>
                      {/* Decorative background elements */}
                      <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-full h-1/3 bg-white/5 rounded-t-full"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-black/20 rounded-b-full"></div>
                      </div>

                      {/* Level Number */}
                      <div className={`relative z-10 ${glowing ? 'text-yellow-300' : 'text-white'}`}>
                        <div className="text-3xl font-bold" style={{
                          textShadow: glowing ? '0 0 10px rgba(250, 204, 21, 0.8)' : '0 0 5px rgba(99, 102, 241, 0.5)'
                        }}>
                          {playerStats.level}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Notches */}
                  {Array(8).fill().map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 ${playerRank.text} rounded-full opacity-50`}
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 45}deg) translate(48px, 0px)`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Body with stats */}
          <div className="p-6 space-y-4">
            {/* EXP Bar with blue colors */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 mr-2">
                    {/* Thay thế TrendingUp bằng IconSVG */}
                    <IconSVG icon="trendingUp" size={18} className="text-blue-400" />
                  </div>
                  <span className="font-medium">EXP</span>
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-mono bg-black/30 px-2 py-0.5 rounded-l-md text-blue-400">
                    {playerStats.exp}
                  </div>
                  <div className="text-sm font-mono bg-blue-900/40 px-2 py-0.5 rounded-r-md text-blue-300">
                    {playerStats.maxExp}
                  </div>
                </div>
              </div>
              <div className="h-4 bg-gray-900/50 rounded-full overflow-hidden shadow-inner p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${expPercentage}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full"></div>
                </div>
              </div>
              {/* EXP percentage */}
              <div className="text-right text-xs text-blue-300/80">
                {Math.round(expPercentage)}% to next level
              </div>
            </div>

            {/* Floor Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-lg bg-green-500/20 mr-2">
                    {/* Thay thế Layers bằng IconSVG */}
                    <IconSVG icon="layers" size={18} className="text-green-400" />
                  </div>
                  <span className="font-medium">Floor</span>
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-mono bg-black/30 px-2 py-0.5 rounded-l-md text-green-400">
                    {playerStats.floor}
                  </div>
                  <div className="text-sm font-mono bg-green-900/40 px-2 py-0.5 rounded-r-md text-green-300">
                    {playerStats.maxFloor}
                  </div>
                </div>
              </div>
              <div className="h-4 bg-gray-900/50 rounded-full overflow-hidden shadow-inner p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-green-600 via-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${floorPercentage}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full"></div>
                  {floorPercentage > 20 && (
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  )}
                </div>
              </div>
              {/* Floor milestones - Changed text here */}
              <div className="flex justify-between text-xs text-green-300/80 px-1">
                <span>Begin</span>
                <span>Intermediate</span>
                <span>Master</span>
              </div>
            </div>

            {/* Resource Stats in a 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {/* Energy */}
              <div className="bg-gray-900/50 rounded-xl p-3 border border-yellow-500/30">
                <div className="flex items-center">
                  <div className="relative w-10 h-10 mr-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-yellow-400/30"
                      style={{
                        background: `conic-gradient(#EAB308 ${(playerStats.energy / playerStats.maxEnergy) * 100}%, transparent 0)`
                      }}
                    >
                      <div className="absolute inset-1 bg-gray-900 rounded-full flex items-center justify-center">
                        {/* Thay thế Zap bằng IconSVG */}
                        <IconSVG icon="zap" size={14} className="text-yellow-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-yellow-400">ENERGY</span>
                    <div className="flex items-baseline">
                      <span className="font-bold text-lg text-yellow-100">{playerStats.energy}</span>
                      <span className="text-xs text-yellow-200/70 ml-1">/ {playerStats.maxEnergy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gems */}
              <div className="bg-gray-900/50 rounded-xl p-3 border border-purple-500/30">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-900/30 rounded-full mr-3">
                    {/* Thay thế Gem bằng IconSVG */}
                    <IconSVG icon="gem" size={16} className="text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-purple-400">GEMS</span>
                    <div className="flex items-baseline">
                      <span className="font-bold text-lg text-purple-100">{playerStats.gems}</span>
                      <span className="text-xs text-purple-300/70 ml-1 opacity-70">available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vocabulary */}
              <div className="bg-gray-900/50 rounded-xl p-3 border border-teal-500/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 relative">
                    <div className="w-full h-full rounded-full bg-teal-900/30 flex items-center justify-center overflow-hidden">
                      {/* Thay thế Book bằng IconSVG */}
                      <IconSVG icon="book" size={16} className="text-teal-400" />
                      <div className="absolute bottom-0 w-full bg-teal-500/50 h-1/2 opacity-20"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{ width: `${vocabPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-teal-400">VOCABULARY</span>
                    <div className="flex items-baseline">
                      <span className="font-bold text-lg text-teal-100">{playerStats.vocabulary}</span>
                      <span className="text-xs text-teal-300/70 ml-1">/ {playerStats.maxVocabulary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="bg-gray-900/50 rounded-xl p-3 border border-amber-500/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-2 bg-amber-500/10 rounded-full"></div>
                    </div>
                    {/* Thay thế Star bằng IconSVG */}
                    <IconSVG icon="star" size={24} className="text-amber-400 z-10 drop-shadow-lg" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${starsPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-amber-400">STARS</span>
                    <div className="flex items-baseline">
                      <span className="font-bold text-lg text-amber-100">{playerStats.stars}</span>
                      <span className="text-xs text-amber-300/70 ml-1">/ {playerStats.maxStars}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút ẩn/hiện các nút hành động */}
            <div className="flex justify-center pt-4">
              <button
                onClick={toggleActionButtons}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white py-2 px-4 rounded-full font-medium transition-all duration-300 text-sm"
              >
                {showActionButtons ? 'Ẩn Nút Hành Động' : 'Hiện Nút Hành Động'}
              </button>
            </div>


            {/* Action Buttons with enhanced styling and conditional rendering */}
            {showActionButtons && (
              // Adjusted spacing and padding for smaller buttons
              <div className="flex justify-center gap-2 pt-2">
                {/* Gain EXP Button - Compact */}
                <button
                  onClick={increaseExp}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-700 to-indigo-600 rounded-full font-bold hover:from-blue-600 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-700/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 border border-blue-500/30 group"
                  title="Gain EXP" // Tooltip/Hover text
                >
                   {/* Icon only, increased size slightly for focus */}
                  <IconSVG icon="trendingUp" size={20} className="text-white group-hover:scale-110 transition-transform duration-300" />
                </button>

                {/* Next Floor Button - Compact */}
                <button
                  onClick={useEnergy}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-700 to-emerald-600 rounded-full font-bold hover:from-green-600 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-green-700/30 hover:shadow-green-600/40 hover:-translate-y-0.5 border border-green-500/30 group"
                  title="Next Floor" // Tooltip/Hover text
                >
                   {/* Icon only, increased size slightly for focus */}
                  <IconSVG icon="layers" size={20} className="text-white group-hover:scale-110 transition-transform duration-300" />
                </button>

                {/* Restore Button - Compact */}
                <button
                  onClick={restoreEnergy}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-700 to-violet-600 rounded-full font-bold hover:from-purple-600 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-purple-700/30 hover:shadow-purple-600/40 hover:-translate-y-0.5 border border-purple-500/30 group"
                  title="Restore Energy" // Tooltip/Hover text
                >
                  {/* Icon only, increased size slightly for focus */}
                  <IconSVG icon="gem" size={20} className="text-white group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLevelSystem;
