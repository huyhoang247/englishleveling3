import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions
import { db } from './firebase.js'; // Import the db instance from your firebase config file
import HomeButton from './ui/home-button.tsx'; // Import the HomeButton component
import { auth } from './firebase.js'; // Import auth to get current user info

// Define prop types for EnhancedLeaderboard
interface EnhancedLeaderboardProps {
  onClose: () => void; // Add a prop for the close function
  currentUserId: string;
}

// Define interface for user data fetched from Firestore
interface UserData {
  id: string; // Document ID
  username: string;
  coins: number;
  avatar?: string; // Optional avatar field
  vocabularyCount: number; // Add field for vocabulary count
}

// Accept the onClose prop
export default function EnhancedLeaderboard({ onClose, currentUserId }: EnhancedLeaderboardProps) {
  const [activeTab, setActiveTab] = useState('wealth');
  const [isHovering, setIsHovering] = useState<number | null>(null); // Use number or null for index
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [animation, setAnimation] = useState(false);

  // State to hold fetched user data
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [currentPlayerData, setCurrentPlayerData] = useState<(UserData & { rank: number }) | null>(null);

  // Function to fetch data from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a query to the 'users' collection
      const usersCollectionRef = collection(db, 'users');

      // Determine the sorting criteria based on the active tab
      let q;
      if (activeTab === 'wealth') {
          q = query(usersCollectionRef, orderBy('coins', 'desc'));
      } else { // activeTab === 'collection'
           q = query(usersCollectionRef); // Fetch all users
      }


      // Time-based filtering is removed as per request
      const querySnapshot = await getDocs(q);
      const fetchedUsers: UserData[] = [];
      
      querySnapshot.forEach((doc) => {
        // Assuming each user document has 'username', 'coins', and 'listVocabulary' fields
        const data = doc.data();
        const listVocabulary = data.listVocabulary || []; // Get the listVocabulary array, default to empty array if not exists
        const vocabularyCount = listVocabulary.length; // Get the count of vocabulary words

        fetchedUsers.push({
          id: doc.id,
          username: data.username,
          coins: data.coins,
          avatar: data.avatar || '❓', // Use a default avatar if not present
          vocabularyCount: vocabularyCount, // Store the vocabulary count
        });
      });

      setUsersData(fetchedUsers); // Set the fetched data
    } catch (err) {
      console.error("Error fetching users: ", err);
      setError("Không thể tải dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts or activeTab changes
  useEffect(() => {
    fetchUsers();
  }, [activeTab]); // Re-run fetch when tab changes

  // Animation effect
  useEffect(() => {
    setAnimation(true);
    const timer = setTimeout(() => setAnimation(false), 700);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Getting rank icon with animation
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/first.png"
            alt="Rank 1 Icon"
            className="w-5 h-5 object-contain" // Adjust size as needed
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} // Hide if image fails to load
          />
        );
      case 2:
        return (
           <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/number-2.png"
            alt="Rank 2 Icon"
            className="w-5 h-5 object-contain" // Adjust size as needed
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} // Hide if image fails to load
          />
        );
      case 3:
        return (
           <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/number-3.png"
            alt="Rank 3 Icon"
            className="w-5 h-5 object-contain" // Adjust size as needed
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} // Hide if image fails to load
          />
        );
      default:
        return <div className="w-5 h-5 flex items-center justify-center font-bold text-gray-500">{rank}</div>;
    }
  };

  // Function to format numbers (add commas/periods for readability)
  const formatNumber = (num: number): string => {
      return num.toLocaleString('vi-VN'); // Format with Vietnamese locale for thousands separator
  };


  // Memoize sorted data to prevent re-computation on every render
  const filteredAndSortedData = useMemo(() => {
    return [...usersData] // Create a shallow copy before sorting
      .sort((a, b) => {
          if (activeTab === 'wealth') {
              return b.coins - a.coins;
          } else if (activeTab === 'collection') {
              return b.vocabularyCount - a.vocabularyCount;
          }
          return 0;
      })
      .map((user, index) => ({
          ...user,
          rank: index + 1,
      }));
  }, [usersData, activeTab]);

  // Find current player's rank data
  useEffect(() => {
    const currentUser = filteredAndSortedData.find(user => user.id === currentUserId);
    setCurrentPlayerData(currentUser || null);
  }, [filteredAndSortedData, currentUserId]);


  return (
    // UPDATED: Main background gradient changed to a sleek dark theme
    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-4 shadow-2xl w-full border border-slate-800/50 relative overflow-hidden h-full flex flex-col">
      {/* Sparkling stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="star bg-white h-1 w-1 rounded-full absolute top-1/4 left-1/3 animate-twinkle"></div>
        <div className="star bg-white h-px w-px rounded-full absolute top-1/2 left-1/4 animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
        <div className="star bg-white h-1 w-1 rounded-full absolute top-3/4 left-1/2 animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="star bg-white h-px w-px rounded-full absolute top-1/3 left-2/3 animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* UPDATED: Glowing effects color changed to fit the new theme */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-cyan-500 rounded-full filter blur-3xl opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue-500 rounded-full filter blur-3xl opacity-10 pointer-events-none"></div>

      <div className="relative flex flex-col h-full">
        
        {/* ===== HEADER CORNERS FIXED ===== */}
        <div className="flex justify-start items-center mb-3 flex-shrink-0 bg-black/30 -mt-4 -mx-4 px-4 py-2">
            <HomeButton
              onClick={onClose}
              label="" // Use an empty label to only show the icon
              title="Về trang chính" // Tooltip for the button
            />
        </div>
        
        {/* REMOVED: Time Filter Selector is hidden as requested */}
        
        {/* UPDATED: Tabs with new color scheme */}
        <div className="flex mb-4 p-0.5 bg-slate-900/40 backdrop-blur-sm rounded-lg border border-slate-700/60 flex-shrink-0">
          <button
            className={`flex-1 py-1.5 font-medium flex items-center justify-center rounded-md transition-all duration-300 text-sm ${
              activeTab === 'wealth'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                : 'bg-transparent text-slate-300 hover:bg-slate-800/50'
            }`}
            onClick={() => setActiveTab('wealth')}
          >
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
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                : 'bg-transparent text-slate-300 hover:bg-slate-800/50'
            }`}
            onClick={() => setActiveTab('collection')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`mr-1.5 w-4 h-4 ${activeTab === 'collection' ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
              <path d="M3 12A9 9 0 0 0 21 12"/>
            </svg>
            Collection
          </button>
        </div>

        {/* UPDATED: Main Content Area with new color scheme */}
        <div className={`bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-slate-800/70 shadow-lg ${animation ? 'animate-fadeIn' : ''} flex-grow flex flex-col overflow-hidden`}>

          {loading && (
            <div className="flex items-center justify-center py-6 text-slate-400">
              Đang tải dữ liệu...
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-6 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && activeTab === 'wealth' && (
            <>
              {/* UPDATED: Wealth Header with new color scheme */}
              <div className="grid grid-cols-11 gap-2 py-2 px-3 bg-slate-800/30 rounded-lg text-slate-300 text-xs font-medium mb-2 border-b border-slate-700/50 flex-shrink-0">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">Người chơi</div>
                <div className="col-span-3 text-right flex items-center justify-end">
                  <span>Tài sản</span>
                  <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin icon" className="w-3 h-3 ml-1 inline-block align-middle" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
              </div>

              {/* UPDATED: Wealth List with new color scheme */}
              <div className="overflow-y-auto custom-scrollbar-hidden flex-1">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((player, index) => (
                    <div
                      key={player.id} // Use document ID as key
                      className={`grid grid-cols-11 gap-2 py-2 px-3 rounded-lg mb-1.5 items-center transition-all duration-200 ${
                        player.rank <= 3
                          ? 'bg-gradient-to-r from-slate-800/70 to-slate-900/50 shadow-sm border border-slate-700'
                          : 'bg-slate-900/40 hover:bg-slate-800/60 border border-transparent hover:border-slate-700'
                      }`}
                      onMouseEnter={() => setIsHovering(index)}
                      onMouseLeave={() => setIsHovering(null)}
                    >
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="col-span-7 flex items-center overflow-hidden">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm ${
                          player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-700 shadow-sm shadow-yellow-500/20' :
                          player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm' :
                          player.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-sm' :
                          'bg-gradient-to-br from-slate-600 to-slate-800' // UPDATED: Default avatar bg
                        }`}>
                          {player.avatar}
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-sm text-slate-100">{player.username}</span>
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-xs flex items-center justify-end">
                        <div className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                          {formatNumber(player.coins)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-sm">Không tìm thấy người chơi phù hợp</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !error && activeTab === 'collection' && (
            <>
              {/* UPDATED: Collection Header with new color scheme */}
              <div className="grid grid-cols-9 gap-1 py-2 px-3 bg-slate-800/30 rounded-lg text-slate-300 text-xs font-medium mb-2 border-b border-slate-700/50 flex-shrink-0">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Người chơi</div>
                <div className="col-span-4 text-center flex items-center justify-center">
                  <span className="mr-1">Floor</span> <span className="opacity-30">|</span> <span className="ml-1">Vocabulary</span>
                </div>
              </div>

              {/* UPDATED: Collection List with new color scheme */}
              <div className="overflow-y-auto custom-scrollbar-hidden flex-1">
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((player, index) => (
                    <div
                      key={player.id} // Use document ID as key
                      className={`grid grid-cols-9 gap-1 py-2 px-3 rounded-lg mb-1.5 items-center transition-all duration-200 ${
                        player.rank <= 3
                          ? 'bg-gradient-to-r from-slate-800/70 to-slate-900/50 shadow-sm border border-slate-700'
                          : 'bg-slate-900/40 hover:bg-slate-800/60 border border-transparent hover:border-slate-700'
                      }`}
                       onMouseEnter={() => setIsHovering(index + 100)} // Offset index to differentiate from wealth
                       onMouseLeave={() => setIsHovering(null)}
                    >
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="col-span-5 flex items-center overflow-hidden">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm ${
                          player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-700 shadow-sm shadow-yellow-500/20' :
                          player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm' :
                          player.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-sm' :
                          'bg-gradient-to-br from-slate-600 to-slate-800' // UPDATED: Default avatar bg
                        }`}>
                          {player.avatar}
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-sm text-slate-100">{player.username}</span>
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="text-cyan-300 bg-cyan-900/40 px-1.5 py-0.5 rounded text-xs border border-cyan-800/50 mr-1">
                          N/A {/* Placeholder for Floor */}
                        </span>
                        <span className="opacity-30">|</span>
                        <span className="text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded text-xs border border-blue-800/50 ml-1">
                           {formatNumber(player.vocabularyCount)} {/* Display vocabulary count */}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-sm">Không tìm thấy người chơi phù hợp</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* ============= CURRENT PLAYER RANK DISPLAY ============= */}
          {/* ========================================= */}
          {currentPlayerData && (
            <div className="mt-auto pt-2 flex-shrink-0">
              <div 
                className="relative grid gap-2 py-2.5 px-3 rounded-lg items-center transition-all duration-200 bg-gradient-to-r from-slate-700/60 via-slate-800/80 to-slate-700/60 shadow-lg border-t border-slate-600"
                style={{ gridTemplateColumns: activeTab === 'wealth' ? 'repeat(11, minmax(0, 1fr))' : 'repeat(9, minmax(0, 1fr))' }}
              >
                 {/* Column for Rank */}
                 <div className="col-span-1 flex justify-center">
                    {getRankIcon(currentPlayerData.rank)}
                 </div>

                 {/* Column for Player Info */}
                 <div className={activeTab === 'wealth' ? 'col-span-7' : 'col-span-5'}>
                     <div className="flex items-center overflow-hidden">
                       <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm flex-shrink-0 ${
                         currentPlayerData.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-700 shadow-sm shadow-yellow-500/20' :
                         currentPlayerData.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm' :
                         currentPlayerData.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-sm' :
                         'bg-gradient-to-br from-slate-600 to-slate-800'
                       }`}>
                         {currentPlayerData.avatar}
                       </div>
                       <div className="truncate">
                         <span className="font-medium text-sm text-slate-100">{currentPlayerData.username}</span>
                       </div>
                     </div>
                 </div>

                 {/* Column for Stats */}
                 <div className="col-span-3">
                    {activeTab === 'wealth' ? (
                       <div className="text-right font-mono font-bold text-xs flex items-center justify-end">
                         <div className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                           {formatNumber(currentPlayerData.coins)}
                         </div>
                       </div>
                    ) : (
                       <div className="text-center">
                         <span className="text-cyan-300 bg-cyan-900/40 px-1.5 py-0.5 rounded text-xs border border-cyan-800/50 mr-1">
                           N/A
                         </span>
                         <span className="opacity-30">|</span>
                         <span className="text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded text-xs border border-blue-800/50 ml-1">
                            {formatNumber(currentPlayerData.vocabularyCount)}
                         </span>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          )}

        </div>

        {/* UPDATED: Footer with new color scheme */}
        <div className="mt-3 mb-4 flex justify-between items-center text-xs flex-shrink-0">
          <div className="flex items-center bg-slate-900/50 rounded-full px-3 py-1 border border-slate-700/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-slate-300">Online: </span>
            <span className="text-white font-medium ml-1">...</span> {/* Placeholder for online count */}
          </div>

          <div className="flex items-center bg-slate-900/50 rounded-full px-3 py-1 border border-slate-700/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-slate-300">Cập nhật: </span>
            <span className="text-white font-medium ml-1">
              00:00 hôm nay
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
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .custom-scrollbar-hidden {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
