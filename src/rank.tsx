import { useState, useEffect } from 'react';
// Removed lucide-react import

export default function EnhancedLeaderboard() {
  const [activeTab, setActiveTab] = useState('wealth');
  const [isHovering, setIsHovering] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [animation, setAnimation] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // Added timeFilter state

  // Function to format wealth number (replace comma with period)
  const formatWealth = (wealth) => {
    return wealth.replace(/,/g, '.');
  };

  // Sample data for wealth leaderboard (All time) - Removed 'change' property
  const wealthData = [
    { rank: 1, name: 'Dragon_Master', avatar: '🐉', wealth: '8,750,000' },
    { rank: 2, name: 'StarLord99', avatar: '⭐', wealth: '7,320,150' },
    { rank: 3, name: 'PhoenixRising', avatar: '🔥', wealth: '6,485,200' },
    { rank: 4, name: 'MoonWalker', avatar: '🌙', wealth: '5,965,750' },
    { rank: 5, name: 'IronHeart', avatar: '❤️', wealth: '5,125,300' },
    { rank: 6, name: 'ShadowNinja', avatar: '👤', wealth: '4,836,250' },
    { rank: 7, name: 'GoldenEagle', avatar: '🦅', wealth: '4,215,100' },
    { rank: 8, name: 'DiamondQueen', avatar: '💎', wealth: '3,785,450' },
    { rank: 9, name: 'TigerKing', avatar: '🐯', wealth: '3,150,200' },
    { rank: 10, name: 'MagicWizard', avatar: '🧙', wealth: '2,950,750' }
  ].map(player => ({ ...player, wealth: formatWealth(player.wealth) })); // Format wealth data

  // Sample data for collection leaderboard (All time) - Added 'floor' back
  const collectionData = [
    { rank: 1, name: 'CollectorKing', avatar: '👑', floor: '156', vocabulary: '85' },
    { rank: 2, name: 'ArtifactHunter', avatar: '🔍', floor: '143', vocabulary: '78' },
    { rank: 3, name: 'TreasureSeeker', avatar: '💰', floor: '132', vocabulary: '73' },
    { rank: 4, name: 'RarityFinder', avatar: '🧿', floor: '125', vocabulary: '68' },
    { rank: 5, name: 'GemCollector', avatar: '💎', floor: '118', vocabulary: '65' },
    { rank: 6, name: 'LootMaster', avatar: '🎁', floor: '110', vocabulary: '62' },
    { rank: 7, name: 'RelicHoarder', avatar: '🏺', floor: '102', vocabulary: '57' },
    { rank: 8, name: 'MysticFinder', avatar: '✨', floor: '98', vocabulary: '52' },
    { rank: 9, name: 'AntiqueDealer', avatar: '🕰️', floor: '92', vocabulary: '48' },
    { rank: 10, name: 'CurioCollector', avatar: '🔮', floor: '87', vocabulary: '45' }
  ];

  // Dữ liệu theo ngày cho wealth leaderboard - Removed 'change' property
  const dailyWealthData = [
    { rank: 1, name: 'PhoenixRising', avatar: '🔥', wealth: '350,000' },
    { rank: 2, name: 'ShadowNinja', avatar: '👤', wealth: '320,250' },
    { rank: 3, name: 'GoldenEagle', avatar: '🦅', wealth: '285,100' },
    { rank: 4, name: 'StarLord99', avatar: '⭐', wealth: '260,150' },
    { rank: 5, name: 'MoonWalker', avatar: '🌙', wealth: '235,750' },
    { rank: 6, name: 'Dragon_Master', avatar: '🐉', wealth: '210,000' },
    { rank: 7, name: 'DiamondQueen', avatar: '💎', wealth: '195,450' },
    { rank: 8, name: 'TigerKing', avatar: '🐯', wealth: '180,200' },
    { rank: 9, name: 'IronHeart', avatar: '❤️', wealth: '160,300' },
    { rank: 10, name: 'MagicWizard', avatar: '🧙', wealth: '145,750' }
  ].map(player => ({ ...player, wealth: formatWealth(player.wealth) })); // Format wealth data

  // Dữ liệu theo tuần cho wealth leaderboard - Removed 'change' property
  const weeklyWealthData = [
    { rank: 1, name: 'Dragon_Master', avatar: '🐉', wealth: '1,750,000' },
    { rank: 2, name: 'PhoenixRising', avatar: '🔥', wealth: '1,485,200' },
    { rank: 3, name: 'StarLord99', avatar: '⭐', wealth: '1,320,150' },
    { rank: 4, name: 'MoonWalker', avatar: '🌙', wealth: '1,165,750' },
    { rank: 5, name: 'DiamondQueen', avatar: '💎', wealth: '985,450' },
    { rank: 6, name: 'IronHeart', avatar: '❤️', wealth: '925,300' },
    { rank: 7, name: 'ShadowNinja', avatar: '👤', wealth: '836,250' },
    { rank: 8, name: 'GoldenEagle', avatar: '🦅', wealth: '815,100' },
    { rank: 9, name: 'TigerKing', avatar: '🐯', wealth: '750,200' },
    { rank: 10, name: 'MagicWizard', avatar: '🧙', wealth: '650,750' }
  ].map(player => ({ ...player, wealth: formatWealth(player.wealth) })); // Format wealth data

  // Dữ liệu theo tháng cho wealth leaderboard - Removed 'change' property
  const monthlyWealthData = [
    { rank: 1, name: 'Dragon_Master', avatar: '🐉', wealth: '4,750,000' },
    { rank: 2, name: 'StarLord99', avatar: '⭐', wealth: '4,320,150' },
    { rank: 3, name: 'MoonWalker', avatar: '🌙', wealth: '3,965,750' },
    { rank: 4, name: 'PhoenixRising', avatar: '🔥', wealth: '3,485,200' },
    { rank: 5, name: 'IronHeart', avatar: '❤️', wealth: '3,125,300' },
    { rank: 6, name: 'ShadowNinja', avatar: '👤', wealth: '2,836,250' },
    { rank: 7, name: 'DiamondQueen', avatar: '💎', wealth: '2,785,450' },
    { rank: 8, name: 'GoldenEagle', avatar: '🦅', wealth: '2,215,100' },
    { rank: 9, name: 'TigerKing', avatar: '🐯', wealth: '2,150,200' },
    { rank: 10, name: 'MagicWizard', avatar: '🧙', wealth: '1,950,750' }
  ].map(player => ({ ...player, wealth: formatWealth(player.wealth) })); // Format wealth data


  useEffect(() => {
    setAnimation(true);
    const timer = setTimeout(() => setAnimation(false), 700);
    return () => clearTimeout(timer);
  }, [activeTab, timeFilter]); // Added timeFilter to dependency array

  // Getting rank icon with animation
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            {/* Crown Icon (replaced lucide-react Crown) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400 transform scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 16-3-9L2 2h20l-7 5-3 9Z"/>
              <path d="M16 16l-3-9-1-2-1 2-3 9"/>
              <path d="M2 16h20"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-sm shadow-yellow-400/50"></div>
          </div>
        );
      case 2:
        return (
          // Silver Medal Icon (replaced lucide-react Medal)
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-6 6v7l-3-3-3 3V14a6 6 0 0 0 6-6Z"/>
            <path d="M14.5 17.5 12 20l-2.5-2.5"/>
            <path d="M8 14h8"/>
          </svg>
        );
      case 3:
        return (
          // Bronze Medal Icon (replaced lucide-react Medal)
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-6 6v7l-3-3-3 3V14a6 6 0 0 0 6-6Z"/>
            <path d="M14.5 17.5 12 20l-2.5-2.5"/>
            <path d="M8 14h8"/>
          </svg>
        );
      default:
        return <div className="w-5 h-5 flex items-center justify-center font-bold text-gray-400">{rank}</div>;
    }
  };

  // Removed getChangeIcon function

  // Lấy dữ liệu dựa vào bộ lọc thời gian
  const getFilteredWealthData = () => {
    switch(timeFilter) {
      case 'day': return dailyWealthData;
      case 'week': return weeklyWealthData;
      case 'month': return monthlyWealthData;
      default: return wealthData; // 'all'
    }
  };

  const getFilteredCollectionData = () => {
    switch(timeFilter) {
      case 'day': return dailyCollectionData;
      case 'week': return weeklyCollectionData;
      case 'month': return monthlyCollectionData;
      default: return collectionData; // 'all'
    }
  };

  // Filter data based on search term and time filter
  const filteredWealthData = getFilteredWealthData().filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCollectionData = getFilteredCollectionData().filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950 text-white p-4 shadow-2xl max-w-2xl mx-auto border border-indigo-700/30 relative overflow-hidden">
      {/* Sparkling stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="star bg-white h-1 w-1 rounded-full absolute top-1/4 left-1/3 animate-twinkle"></div>
        <div className="star bg-white h-px w-px rounded-full absolute top-1/2 left-1/4 animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
        <div className="star bg-white h-1 w-1 rounded-full absolute top-3/4 left-1/2 animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="star bg-white h-px w-px rounded-full absolute top-1/3 left-2/3 animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Glowing effects */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-indigo-500 rounded-full filter blur-3xl opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-purple-500 rounded-full filter blur-3xl opacity-10 pointer-events-none"></div>

      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="relative">
              {/* Trophy Icon (replaced lucide-react Trophy) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1v-2.34"/>
                <path d="M16 14.66V17c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2.34"/>
                <path d="M8 8v1c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V8"/>
                <path d="M12 17v5"/>
                <path d="M12 17H7"/>
                <path d="M12 17h5"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 text-transparent bg-clip-text">
                Bảng Xếp Hạng
              </h1>
              {/* Updated header text */}
              <div className="text-xs text-indigo-300 mt-0.5">
                {timeFilter === 'day' && 'Xếp hạng ngày'}
                {timeFilter === 'week' && 'Xếp hạng tuần'}
                {timeFilter === 'month' && 'Xếp hạng tháng'}
                {timeFilter === 'all' && 'Xếp hạng tổng'}
              </div>
            </div>
          </div>
          <div className="bg-indigo-900/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs flex items-center border border-indigo-700/50 shadow">
            {/* Clock Icon (replaced lucide-react Clock) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-indigo-200">16/05/2025</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Tìm kiếm người chơi..."
            className="w-full bg-indigo-900/30 border border-indigo-700/50 rounded-lg py-1.5 pl-8 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm text-indigo-100 placeholder-indigo-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Search Icon (replaced lucide-react Search) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-2 w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </div>

        {/* Time Filter Selector */}
        <div className="mb-4 p-0.5 bg-indigo-900/30 backdrop-blur-sm rounded-lg border border-indigo-700/40 flex items-center justify-between">
          <button
            className={`py-1.5 px-3 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-xs flex-1 ${
              timeFilter === 'day'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-blue-700/20'
                : 'bg-transparent text-indigo-300 hover:bg-indigo-700/30'
            }`}
            onClick={() => setTimeFilter('day')}
          >
            {/* Clock Icon (replaced lucide-react Clock) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Ngày
          </button>
          <button
            className={`py-1.5 px-3 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-xs flex-1 ${
              timeFilter === 'week'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-700/20'
                : 'bg-transparent text-indigo-300 hover:bg-indigo-700/30'
            }`}
            onClick={() => setTimeFilter('week')}
          >
            {/* Filter Icon (replaced lucide-react Filter) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Tuần
          </button>
          <button
            className={`py-1.5 px-3 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-xs flex-1 ${
              timeFilter === 'month'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm shadow-purple-700/20'
                : 'bg-transparent text-indigo-300 hover:bg-indigo-700/30'
            }`}
            onClick={() => setTimeFilter('month')}
          >
            {/* Calendar Icon (replaced lucide-react Calendar) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            Tháng
          </button>
          <button
            className={`py-1.5 px-3 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-xs flex-1 ${
              timeFilter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm shadow-pink-700/20'
                : 'bg-transparent text-indigo-300 hover:bg-indigo-700/30'
            }`}
            onClick={() => setTimeFilter('all')}
          >
            {/* Star Icon (replaced lucide-react Star) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Tổng
          </button>
        </div>


        {/* Tabs with enhanced design */}
        <div className="flex mb-4 p-0.5 bg-indigo-900/30 backdrop-blur-sm rounded-lg border border-indigo-700/40">
          <button
            className={`flex-1 py-1.5 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-sm ${
              activeTab === 'wealth'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                : 'bg-transparent text-indigo-300 hover:bg-indigo-700/30'
            }`}
            onClick={() => setActiveTab('wealth')}
          >
            {/* Coins Icon (replaced lucide-react Coins) */}
            <svg xmlns="http://www.w3.org/2000/svg" className={`mr-1.5 w-4 h-4 ${activeTab === 'wealth' ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6"/>
              <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
              <path d="M7 17l-2 2"/>
              <path d="m21 7-2 2"/>
            </svg>
            Tài Phú
          </button>
          <button
            className={`flex-1 py-1.5 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-sm ${
              activeTab === 'collection'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                : 'bg-transparent text-indigo-300 hover:bg-indigo-700/30'
            }`}
            onClick={() => setActiveTab('collection')}
          >
            {/* Database Icon (replaced lucide-react Database) */}
            <svg xmlns="http://www.w3.org/2000/svg" className={`mr-1.5 w-4 h-4 ${activeTab === 'collection' ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
              <path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
            Collection
          </button>
        </div>

        {/* Content with enhanced visuals */}
        <div className={`bg-indigo-900/20 backdrop-blur-sm rounded-xl p-3 border border-indigo-700/30 shadow-lg ${animation ? 'animate-fadeIn' : ''}`}>
          {activeTab === 'wealth' ? (
            <>
              {/* Wealth Header */}
              <div className="grid grid-cols-11 gap-2 py-2 px-3 bg-indigo-800/40 rounded-lg text-indigo-200 text-xs font-medium mb-2 border-b border-indigo-700/50">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">Người chơi</div>
                <div className="col-span-3 text-right flex items-center justify-end"> {/* Adjusted col-span and added flex, justify-end */}
                  <span>Tài sản</span> {/* Text "Tài sản" */}
                  {/* Coin Icon */}
                  <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin icon" className="w-3 h-3 ml-1 inline-block align-middle" onError={(e) => e.target.style.display = 'none'} /> {/* Moved icon here and adjusted size */}
                </div>
              </div>

              {filteredWealthData.length > 0 ? (
                filteredWealthData.map((player, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-11 gap-2 py-2 px-3 rounded-lg mb-1.5 items-center transition-all duration-200 ${
                      player.rank <= 3
                        ? 'bg-gradient-to-r from-indigo-800/60 to-purple-800/60 shadow-sm border border-indigo-600/40'
                        : 'bg-indigo-900/20 hover:bg-indigo-800/30 border border-indigo-800/20'
                    }`}
                    onMouseEnter={() => setIsHovering(index)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <div className="col-span-1 flex justify-center"> {/* Removed relative and change icon call */}
                      {getRankIcon(player.rank)}
                    </div>
                    <div className="col-span-7 flex items-center overflow-hidden">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm ${
                        player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-700 shadow-sm shadow-yellow-500/20' :
                        player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm' :
                        player.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-sm' :
                        'bg-gradient-to-br from-indigo-600 to-indigo-800'
                      }`}>
                        {player.avatar}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-sm">{player.name}</span>
                        {isHovering === index && (
                          <div className="text-xs text-indigo-300 mt-0.5">Thành viên từ: 03/2025</div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold text-xs flex items-center justify-end"> {/* Changed text-sm to text-xs and font-medium to font-bold */}
                      <div className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                        {player.wealth}
                      </div>
                      {/* Removed Coin Icon from here */}
                      {isHovering === index && timeFilter === 'day' && (
                        <div className="text-xs text-green-400 mt-0.5">+124.500/ngày</div> // Updated comma to period
                      )}
                       {isHovering === index && timeFilter === 'week' && (
                        <div className="text-xs text-green-400 mt-0.5">+500.000/tuần</div> // Updated comma to period
                      )}
                       {isHovering === index && timeFilter === 'month' && (
                        <div className="text-xs text-green-400 mt-0.5">+1.500.000/tháng</div> // Updated comma to period
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-indigo-300">
                  {/* AlertCircle Icon (replaced lucide-react AlertCircle) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-sm">Không tìm thấy người chơi phù hợp</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Collection Header - Updated (added Floor back and adjusted grid-cols/col-spans) */}
              <div className="grid grid-cols-9 gap-1 py-2 px-3 bg-indigo-800/40 rounded-lg text-indigo-200 text-xs font-medium mb-2 border-b border-indigo-700/50">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Người chơi</div> {/* Adjusted col-span */}
                <div className="col-span-3 text-center"> {/* Combined col-span for Floor | Vocabulary */}
                  <span className="mr-1">Floor</span> <span className="opacity-30">|</span> <span className="ml-1">Vocabulary</span> {/* Added separator and spacing */}
                </div>
              </div>

              {filteredCollectionData.length > 0 ? (
                filteredCollectionData.map((player, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-9 gap-1 py-2 px-3 rounded-lg mb-1.5 items-center transition-all duration-200 ${
                      player.rank <= 3
                        ? 'bg-gradient-to-r from-indigo-800/60 to-purple-800/60 shadow-sm border border-indigo-600/40'
                        : 'bg-indigo-900/20 hover:bg-indigo-800/30 border border-indigo-800/20'
                    }`}
                    onMouseEnter={() => setIsHovering(index + 100)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <div className="col-span-1 flex justify-center">
                      {getRankIcon(player.rank)}
                    </div>
                    <div className="col-span-5 flex items-center overflow-hidden"> {/* Adjusted col-span */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm ${
                        player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-700 shadow-sm shadow-yellow-500/20' :
                        player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm' :
                        player.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-sm' :
                        'bg-gradient-to-br from-indigo-600 to-indigo-800'
                      }`}>
                        {player.avatar}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-sm">{player.name}</span>
                        {isHovering === index + 100 && (
                          <div className="text-xs text-indigo-300 mt-0.5">Trưng bày: {/* You might want to add a relevant stat here */}</div>
                        )}
                      </div>
                    </div>
                    {/* Combined Floor and Vocabulary */}
                    <div className="col-span-3 text-center"> {/* Combined col-span */}
                       <span className="text-blue-300 bg-blue-900/30 px-1.5 py-0.5 rounded text-xs border border-blue-800/40 mr-1"> {/* Added margin-right */}
                        {player.floor}
                      </span>
                      <span className="opacity-30">|</span> {/* Added opacity-30 class */}
                      <span className="text-purple-300 bg-purple-900/30 px-1.5 py-0.5 rounded text-xs border border-purple-800/40 ml-1"> {/* Added margin-left */}
                        {player.vocabulary}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-indigo-300">
                   {/* AlertCircle Icon (replaced lucide-react AlertCircle) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-sm">Không tìm thấy người chơi phù hợp</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex justify-between items-center text-xs">
          <div className="flex items-center bg-indigo-900/30 rounded-full px-3 py-1 border border-indigo-700/30">
            {/* User Icon (replaced lucide-react User) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-indigo-300">Online: </span>
            <span className="text-white font-medium ml-1">347</span>
          </div>

          <div className="flex items-center bg-indigo-900/30 rounded-full px-3 py-1 border border-indigo-700/30">
            {/* Clock Icon (replaced lucide-react Clock) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-indigo-300">Cập nhật: </span>
            <span className="text-white font-medium ml-1">
              {timeFilter === 'day' && '1 giờ trước'}
              {timeFilter === 'week' && '12:00 hôm nay'}
              {timeFilter === 'month' && '01/05/2025'}
              {timeFilter === 'all' && '00:00 hôm nay'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
