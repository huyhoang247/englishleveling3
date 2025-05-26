import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth } from './firebase.js'; // Assuming firebase.js exports auth

// Define props interface for GoldMine component
interface GoldMineProps {
  onClose: () => void; // Function to close the Gold Mine screen
  currentCoins: number; // Current main coin balance from parent
  onUpdateCoins: (amount: number) => Promise<void>; // Function to update main coins in parent (and Firestore)
  currentUserId: string; // Current authenticated user ID
  isGamePaused: boolean; // Prop to indicate if the main game is paused
}

// Inline SVG for a pickaxe icon
const PickaxeIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
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
    className={className}
    {...props}
  >
    <path d="M14 14l-4 4-2-2 4-4 2-2 2-2 2-2 2-2 2-2"></path>
    <path d="M18 6l-2-2"></path>
    <path d="M12 8l-2-2"></path>
    <path d="M8 12l-2-2"></path>
    <path d="M6 18l-2-2"></path>
    <path d="M16 10l-2-2"></path>
    <path d="M20 14l-2-2"></path>
    <path d="M14 18l-2-2"></path>
    <path d="M10 22l-2-2"></path>
    <path d="M2 10l-2-2"></path>
    <path d="M22 2l-2-2"></path>
    <path d="M20 20l-2-2"></path>
    <path d="M18 22l-2-2"></path>
    <path d="M22 18l-2-2"></path>
    <path d="M10 2l-2-2"></path>
    <path d="M6 6l-2-2"></path>
    <path d="M2 2l-2-2"></path>
    <path d="M22 6l-2-2"></path>
    <path d="M12 20l-2-2"></path>
    <path d="M16 22l-2-2"></path>
    <path d="M20 10l-2-2"></path>
    <path d="M14 2l-2-2"></path>
    <path d="M8 2l-2-2"></path>
    <path d="M4 22l-2-2"></path>
  </svg>
);


const GoldMine: React.FC<GoldMineProps> = ({ onClose, currentCoins, onUpdateCoins, currentUserId, isGamePaused }) => {
  const [minedGold, setMinedGold] = useState(0);
  const [miners, setMiners] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(''); // For displaying messages to the user
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>(''); // Type of message

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const db = getFirestore();

  const HIRE_COST = 200;
  const MINING_RATE_PER_MINER = 0.1; // Gold per second per miner

  // Function to show a temporary message
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000); // Message disappears after 3 seconds
  };

  // Function to save gold mine data to Firestore
  const saveMineData = async (currentMinedGold: number, currentMiners: number) => {
    if (!currentUserId) {
      console.error("GoldMine: No user ID available for saving mine data.");
      return;
    }
    try {
      const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
      await setDoc(mineDocRef, {
        minedGold: currentMinedGold,
        miners: currentMiners,
        lastMineActivityTime: Date.now(), // Save current timestamp
      }, { merge: true });
      console.log("GoldMine: Mine data saved to Firestore.");
    } catch (error) {
      console.error("GoldMine: Error saving mine data:", error);
    }
  };

  // Fetch gold mine data from Firestore
  useEffect(() => {
    const fetchMineData = async () => {
      if (!currentUserId) {
        console.error("GoldMine: No user ID available for fetching mine data.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');
        const mineDocSnap = await getDoc(mineDocRef);

        let initialMinedGold = 0;
        let initialMiners = 0;
        let lastMineActivityTime = 0;

        if (mineDocSnap.exists()) {
          const data = mineDocSnap.data();
          initialMinedGold = data.minedGold || 0;
          initialMiners = data.miners || 0;
          lastMineActivityTime = data.lastMineActivityTime || 0;
          console.log("GoldMine: Gold mine data fetched:", data);

          // Calculate offline mining
          if (initialMiners > 0 && lastMineActivityTime > 0) {
            const timeElapsedMs = Date.now() - lastMineActivityTime;
            const timeElapsedSeconds = timeElapsedMs / 1000;
            const goldAccumulatedOffline = initialMiners * MINING_RATE_PER_MINER * timeElapsedSeconds;
            initialMinedGold += goldAccumulatedOffline;
            console.log(`GoldMine: Accumulated ${goldAccumulatedOffline.toFixed(2)} gold offline over ${timeElapsedSeconds.toFixed(0)} seconds.`);
          }

        } else {
          // Initialize mine data if it doesn't exist
          await setDoc(mineDocRef, { minedGold: 0, miners: 0, lastMineActivityTime: Date.now(), createdAt: new Date() });
          console.log("GoldMine: Gold mine data initialized.");
        }

        setMinedGold(initialMinedGold);
        setMiners(initialMiners);
        // Save the updated minedGold (after offline calculation) back to Firestore
        saveMineData(initialMinedGold, initialMiners);

      } catch (error) {
        console.error("GoldMine: Error fetching gold mine data:", error);
        showMessage("Lỗi khi tải dữ liệu mỏ vàng.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMineData();
  }, [currentUserId, db]);

  // Effect for gold mining interval
  useEffect(() => {
    console.log("GoldMine: Mining effect running. isGamePaused:", isGamePaused, "isLoading:", isLoading, "miners:", miners);
    // Pause mining if the game is paused or loading
    if (isGamePaused || isLoading) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        console.log("GoldMine: Mining interval cleared due to game paused or loading.");
        // Save current state when pausing
        saveMineData(minedGold, miners);
      }
      return;
    }

    // Start mining if not already running and not paused/loading
    if (miners > 0 && miningIntervalRef.current === null) {
      console.log("GoldMine: Starting mining interval.");
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prevGold => {
          const newGold = prevGold + (miners * MINING_RATE_PER_MINER);
          console.log(`GoldMine: Mined gold increased to ${newGold.toFixed(2)}. Miners: ${miners}`);
          // Update Firestore periodically to save minedGold
          // We'll save more frequently now to keep lastMineActivityTime updated
          if (auth.currentUser) {
            saveMineData(newGold, miners);
          }
          return newGold;
        });
      }, 1000); // Update every 1 second
    } else if (miners === 0 && miningIntervalRef.current) {
        // If miners become 0, clear the interval
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        console.log("GoldMine: Mining interval cleared because miners count is 0.");
        // Save current state when stopping
        saveMineData(minedGold, miners);
    }

    // Cleanup function
    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
        console.log("GoldMine: Mining interval cleanup.");
        // Save current state when component unmounts or effect re-runs
        saveMineData(minedGold, miners);
      }
    };
  }, [miners, isGamePaused, isLoading, db, minedGold]); // Added minedGold to dependencies for saveMineData in cleanup

  const handleHireMiner = async () => {
    if (currentCoins < HIRE_COST) {
      showMessage("Không đủ vàng để thuê thợ mỏ!", "error");
      console.log("GoldMine: Not enough coins to hire miner.");
      return;
    }

    if (!currentUserId) {
      showMessage("Lỗi: Không tìm thấy ID người dùng.", "error");
      console.error("GoldMine: No user ID available for hiring miner.");
      return;
    }

    try {
      // Use a transaction to ensure atomicity for both main coins and mine data
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');

        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists()) {
          throw new Error("Tài liệu người dùng không tồn tại!");
        }
        if (!mineDocSnap.exists()) {
          throw new Error("Tài liệu mỏ vàng không tồn tại!");
        }

        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentMiners = mineDocSnap.data().miners || 0;
        const currentMinedGold = mineDocSnap.data().minedGold || 0; // Get current mined gold from Firestore

        if (currentMainCoins < HIRE_COST) {
          throw new Error("Không đủ vàng để thuê thợ mỏ.");
        }

        // Update main coins (deduct cost)
        transaction.update(userDocRef, { coins: currentMainCoins - HIRE_COST });
        // Update miners count and last activity time
        transaction.update(mineDocRef, {
            miners: currentMiners + 1,
            lastMineActivityTime: Date.now(),
            minedGold: currentMinedGold // Ensure minedGold is also passed
        });

        // Update local state after successful transaction
        setMiners(prev => prev + 1);
        onUpdateCoins(-HIRE_COST); // Notify parent to update its coin state
        showMessage("Đã thuê thợ mỏ thành công!", "success");
        console.log("GoldMine: Miner hired successfully. New miners count:", currentMiners + 1);
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thuê thợ mỏ:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thuê thợ mỏ."}`, "error");
    }
  };

  const handleCollectGold = async () => {
    if (minedGold <= 0) {
      showMessage("Không có vàng để thu thập!", "error");
      console.log("GoldMine: No gold to collect.");
      return;
    }

    if (!currentUserId) {
      showMessage("Lỗi: Không tìm thấy ID người dùng.", "error");
      console.error("GoldMine: No user ID available for collecting gold.");
      return;
    }

    const goldToCollect = Math.floor(minedGold); // Collect whole gold amounts

    try {
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUserId);
        const mineDocRef = doc(db, 'users', currentUserId, 'goldMine', 'data');

        const userDocSnap = await transaction.get(userDocRef);
        const mineDocSnap = await transaction.get(mineDocRef);

        if (!userDocSnap.exists()) {
          throw new Error("Tài liệu người dùng không tồn tại!");
        }
        if (!mineDocSnap.exists()) {
          throw new Error("Tài liệu mỏ vàng không tồn tại!");
        }

        const currentMainCoins = userDocSnap.data().coins || 0;
        const currentMinedGold = mineDocSnap.data().minedGold || 0;
        const currentMiners = mineDocSnap.data().miners || 0; // Get current miners from Firestore

        // Update main coins (add collected gold)
        transaction.update(userDocRef, { coins: currentMainCoins + goldToCollect });
        // Reset mined gold in the mine and update last activity time
        transaction.update(mineDocRef, {
            minedGold: currentMinedGold - goldToCollect,
            lastMineActivityTime: Date.now(),
            miners: currentMiners // Ensure miners is also passed
        });

        // Update local state after successful transaction
        setMinedGold(prev => prev - goldToCollect);
        onUpdateCoins(goldToCollect); // Notify parent to update its coin state
        showMessage(`Đã thu thập ${goldToCollect} vàng!`, "success");
        console.log(`GoldMine: Collected ${goldToCollect} gold. Remaining mined gold: ${minedGold - goldToCollect}`);
      });
    } catch (error: any) {
      console.error("GoldMine: Lỗi khi thu thập vàng:", error);
      showMessage(`Lỗi: ${error.message || "Không thể thu thập vàng."}`, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white rounded-lg">
        Đang tải dữ liệu mỏ vàng...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950 text-white p-4 rounded-lg shadow-2xl overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <PickaxeIcon size={200} color="gray" className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
        <PickaxeIcon size={150} color="gray" className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 -rotate-30" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500 rounded-full mix-blend-overlay opacity-5 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors z-10"
        aria-label="Đóng"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <h2 className="text-4xl font-bold mb-6 text-yellow-400 drop-shadow-lg">Mỏ Vàng</h2>

      {message && (
        <div className={`absolute top-16 px-4 py-2 rounded-lg text-sm font-semibold z-20
          ${messageType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {message}
        </div>
      )}

      <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-md z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg text-gray-300">Thợ mỏ:</p>
          <p className="text-2xl font-bold text-yellow-300">{miners}</p>
        </div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg text-gray-300">Tốc độ khai thác:</p>
          <p className="text-2xl font-bold text-yellow-300">{miners * MINING_RATE_PER_MINER} vàng/s</p>
        </div>

        <button
          onClick={handleHireMiner}
          disabled={currentCoins < HIRE_COST}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200
            ${currentCoins < HIRE_COST
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transform hover:scale-105'
            }`}
        >
          Thuê thợ mỏ ({HIRE_COST} vàng)
        </button>

        <div className="my-6 border-t border-gray-700"></div>

        <div className="flex flex-col items-center mb-6">
          <p className="text-lg text-gray-300 mb-2">Vàng đã khai thác:</p>
          <div className="flex items-center space-x-2">
            <PickaxeIcon size={24} color="#FFD700" />
            <p className="text-4xl font-extrabold text-yellow-300 drop-shadow-md">
              {Math.floor(minedGold).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleCollectGold}
          disabled={minedGold <= 0}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200
            ${minedGold <= 0
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transform hover:scale-105'
            }`}
        >
          Thu thập vàng
        </button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Số vàng hiện có: <span className="font-bold text-yellow-300">{currentCoins.toLocaleString()}</span>
      </p>
    </div>
  );
};

export default GoldMine;
