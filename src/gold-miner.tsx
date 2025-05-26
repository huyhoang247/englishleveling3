import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, runTransaction } from 'firebase/firestore';
import { auth } from './firebase.js'; // Assuming firebase.js exports auth

interface GoldMineProps {
  currentCoins: number; // Current main coin balance
  onUpdateCoins: (amount: number) => void; // Function to update main coin balance
  isGamePaused: boolean; // Prop to check if the game is paused
  currentUserId: string | null; // Current authenticated user ID
}

const MINER_COST = 200; // Cost to hire one miner
const MINING_RATE_PER_MINER = 0.1; // Gold per second per miner

export default function GoldMine({ currentCoins, onUpdateCoins, isGamePaused, currentUserId }: GoldMineProps) {
  const [miners, setMiners] = useState(0); // Number of hired miners
  const [minedGold, setMinedGold] = useState(0); // Gold currently mined and awaiting collection
  const [showMineModal, setShowMineModal] = useState(false); // State to control modal visibility
  const [isLoadingMineData, setIsLoadingMineData] = useState(true); // State to track loading of mine data

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for the mining interval

  const db = getFirestore(); // Firestore instance

  // Function to fetch mine data from Firestore
  const fetchMineData = async (userId: string) => {
    setIsLoadingMineData(true);
    try {
      const mineDocRef = doc(db, 'users', userId, 'mine', 'data');
      const mineDocSnap = await getDoc(mineDocRef);

      if (mineDocSnap.exists()) {
        const mineData = mineDocSnap.data();
        setMiners(mineData.miners || 0);
        setMinedGold(mineData.minedGold || 0);
        console.log("Mine data fetched:", mineData);
      } else {
        // If mine document doesn't exist, create it with default values
        console.log("No mine document found, creating default.");
        await runTransaction(db, async (transaction) => {
          const newMineData = { miners: 0, minedGold: 0 };
          transaction.set(mineDocRef, newMineData);
        });
        setMiners(0);
        setMinedGold(0);
      }
    } catch (error) {
      console.error("Error fetching mine data:", error);
    } finally {
      setIsLoadingMineData(false);
    }
  };

  // Function to update mine data in Firestore using a transaction
  const updateMineDataInFirestore = async (userId: string, newMiners: number, newMinedGold: number) => {
    if (!userId) {
      console.error("Cannot update mine data: User not authenticated.");
      return;
    }

    const mineDocRef = doc(db, 'users', userId, 'mine', 'data');

    try {
      await runTransaction(db, async (transaction) => {
        const mineDoc = await transaction.get(mineDocRef);
        if (!mineDoc.exists()) {
          // Create if not exists (should be handled by fetchMineData, but good fallback)
          transaction.set(mineDocRef, { miners: newMiners, minedGold: newMinedGold });
        } else {
          transaction.update(mineDocRef, { miners: newMiners, minedGold: newMinedGold });
        }
      });
      console.log(`Mine data updated in Firestore: Miners=${newMiners}, MinedGold=${newMinedGold}`);
    } catch (error) {
      console.error("Firestore Transaction failed for mine data: ", error);
    }
  };

  // Effect to fetch mine data when the user is authenticated
  useEffect(() => {
    if (currentUserId) {
      fetchMineData(currentUserId);
    }
  }, [currentUserId]);

  // Effect for mining gold over time
  useEffect(() => {
    if (isGamePaused || !currentUserId || isLoadingMineData) {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
      }
      return;
    }

    if (miners > 0 && miningIntervalRef.current === null) {
      miningIntervalRef.current = setInterval(() => {
        setMinedGold(prev => {
          const newGold = prev + (miners * MINING_RATE_PER_MINER);
          // Update Firestore periodically to save mined gold
          if (currentUserId) {
            updateMineDataInFirestore(currentUserId, miners, newGold);
          }
          return newGold;
        });
      }, 1000); // Update every 1 second
    } else if (miners === 0 && miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
      miningIntervalRef.current = null;
    }

    return () => {
      if (miningIntervalRef.current) {
        clearInterval(miningIntervalRef.current);
        miningIntervalRef.current = null;
      }
    };
  }, [miners, isGamePaused, currentUserId, isLoadingMineData]);

  // Handle hiring a miner
  const handleHireMiner = async () => {
    if (!currentUserId) {
      console.error("User not authenticated.");
      return;
    }

    if (currentCoins >= MINER_COST) {
      onUpdateCoins(-MINER_COST); // Deduct cost from main coins
      const newMiners = miners + 1;
      setMiners(newMiners);
      await updateMineDataInFirestore(currentUserId, newMiners, minedGold);
    } else {
      console.log("Not enough coins to hire a miner!");
      // Optionally show a message to the user
    }
  };

  // Handle collecting mined gold
  const handleCollectGold = async () => {
    if (!currentUserId) {
      console.error("User not authenticated.");
      return;
    }

    if (minedGold > 0) {
      onUpdateCoins(minedGold); // Add mined gold to main coins
      setMinedGold(0); // Reset mined gold
      await updateMineDataInFirestore(currentUserId, miners, 0); // Update Firestore
    } else {
      console.log("No gold to collect!");
    }
  };

  if (isLoadingMineData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white">
        Đang tải dữ liệu mỏ vàng...
      </div>
    );
  }

  return (
    <>
      {/* Button to open the Gold Mine modal */}
      <button
        onClick={() => setShowMineModal(true)}
        className="absolute left-4 bottom-4 flex flex-col items-center justify-center w-14 h-14 bg-yellow-600 rounded-lg shadow-lg border-2 border-yellow-500 text-white font-bold transition-transform duration-200 hover:scale-110 z-30"
        title="Mỏ Vàng"
      >
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/gold-mine.png" // Placeholder for a gold mine icon
          alt="Mỏ Vàng"
          className="w-8 h-8 object-contain"
          onError={(e) => {
            const target = e as any;
            target.onerror = null;
            target.src = "https://placehold.co/32x32/gold/black?text=Mine";
          }}
        />
        <span className="text-xs mt-0.5">Mỏ Vàng</span>
      </button>

      {showMineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-950 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700 relative">
            <button
              onClick={() => setShowMineModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Mỏ Vàng</h2>

            <div className="mb-4 text-center">
              <p className="text-gray-300 text-lg">Thợ mỏ: <span className="font-bold text-white">{miners}</span></p>
              <p className="text-gray-300 text-lg">Vàng đang khai thác: <span className="font-bold text-yellow-300">{minedGold.toFixed(2)}</span></p>
              <p className="text-gray-400 text-sm">Tốc độ khai thác: {MINING_RATE_PER_MINER} vàng/giây/thợ</p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleHireMiner}
                disabled={currentCoins < MINER_COST}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thuê Thợ Mỏ ({MINER_COST} vàng)
              </button>

              <button
                onClick={handleCollectGold}
                disabled={minedGold <= 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thu Thập Vàng ({minedGold.toFixed(2)} vàng)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
