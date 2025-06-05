import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app'; // Thêm getApps, getApp
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';


// --- CoinDisplay Component (Moved here for self-containment) ---
// Component hiển thị số xu của người chơi
interface CoinDisplayProps {
  displayedCoins: number; // Số xu cần hiển thị
  isStatsFullscreen: boolean; // Cờ để ẩn/hiện màn hình khi bảng thống kê ở chế độ toàn màn hình
}

// URL icon xu và placeholder
const coinIconUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png";
const coinIconPlaceholderUrl = "https://placehold.co/16x16/ffd700/000000?text=$"; // Placeholder khi lỗi hình ảnh

const CoinDisplay: React.FC<CoinDisplayProps> = ({ displayedCoins, isStatsFullscreen }) => {
  // Không hiển thị nếu bảng thống kê đang ở chế độ toàn màn hình
  if (isStatsFullscreen) {
    return null;
  }

  return (
    // Container cho xu
    <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg border border-amber-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
      {/* Các kiểu dáng cần thiết cho hoạt ảnh */}
      <style jsx>{`
        @keyframes number-change {
          0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); }
          100% { color: #fff; text-shadow: none; transform: scale(1); }
        }
        .number-changing {
          animation: number-change 0.3s ease-out;
        }
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>
      {/* Container cho icon xu */}
      <div className="relative mr-0.5 flex items-center justify-center">
        <img
          src={coinIconUrl}
          alt="Dollar Coin Icon" // Văn bản thay thế cho hình ảnh
          className="w-4 h-4" // Điều chỉnh kích thước
           // Xử lý lỗi khi tải hình ảnh
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Ngăn chặn vòng lặp vô hạn
            target.src = coinIconPlaceholderUrl; // Hiển thị hình ảnh placeholder
          }}
        />
      </div>
      <div className="font-bold text-amber-100 text-xs tracking-wide coin-counter"> {/* Kích thước văn bản vẫn là xs */}
        {displayedCoins.toLocaleString()}
      </div>
      {/* Nút Cộng xu - Chức năng có thể thêm sau */}
      <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center cursor-pointer border border-amber-300 shadow-inner hover:shadow-amber-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
        <span className="text-white font-bold text-xs">+</span> {/* Kích thước văn bản vẫn là xs */}
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};
// --- End CoinDisplay Component ---


// SVG Icons
// Icon xu đã chỉnh sửa để chấp nhận prop src cho URL hình ảnh
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Coin Icon"
        className={className}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }} // Fallback
      />
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
};

const GemIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 16.5l-6.5-6.5L10 3.5l6.5 6.5L10 16.5zM10 0.5L0.5 10l9.5 9.5 9.5-9.5L10 0.5z"></path>
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a8 8 0 00-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 00-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5V5.5c0-.828.672-1.5 1.5-1.5h10c.828 0 1.5.672 1.5 1.5v4.5c0 3.59-2.91 6.5-6.5 6.5z"></path>
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path>
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
  </svg>
);

const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path>
  </svg>
);

// Giao diện cho thuộc tính vật phẩm
interface Item {
  icon: React.FC<{ className?: string }> | string; // icon có thể là component hoặc URL hình ảnh
  name: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
  timestamp?: number; // Tùy chọn: để lưu thời điểm nhận được vật phẩm
}

interface LuckyChestGameProps {
  onClose: () => void;
}

// Component Popup Phần thưởng
interface RewardPopupProps {
  item: Item; // Vật phẩm này giờ sẽ có giá trị 'value' chính xác cho các lần trúng độc đắc
  jackpotWon: boolean;
  onClose: () => void;
}

const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
  const getRarityBgClass = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'uncommon': return 'bg-green-100 border-green-300 text-green-800';
      case 'rare': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'epic': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'legendary': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'jackpot': return 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 border-4 border-yellow-200 shadow-lg shadow-yellow-500/50 text-white';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`relative p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full transform transition-all duration-300 scale-100 animate-pop-in ${getRarityBgClass(item.rarity)}`}>
        {jackpotWon ? (
          <>
            <div className="text-5xl mb-4 animate-bounce-once">🎊💰🎊</div>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-wider text-white drop-shadow">JACKPOT!</h2>
            {/* Hiển thị item.value hiện đang giữ số tiền độc đắc thực tế đã thắng */}
            <p className="text-xl font-semibold mb-4 text-white">Bạn đã trúng {item.value.toLocaleString()} xu từ Pool!</p>
            <p className="text-sm mt-3 opacity-90 text-yellow-100">🌟 Chúc mừng người chơi siêu may mắn!🌟</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">🎉 Chúc mừng! 🎉</h2>
            {typeof item.icon === 'string' ? (
              <img src={item.icon} alt={item.name} className="w-24 h-24 mx-auto mb-4 animate-float" onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/cccccc/000000?text=Lỗi'; }} />
            ) : (
              <item.icon className={`w-24 h-24 ${item.color} mx-auto mb-4 animate-float`} />
            )}
            <p className="text-2xl font-semibold mb-2">Bạn nhận được <span className="font-bold">{item.name}</span></p>
            {item.value > 0 && (
              <p className="text-xl font-bold text-green-600">+{item.value.toLocaleString()} xu</p>
            )}
          </>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};


const LuckyChestGame = ({ onClose }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // Để làm nổi bật trực quan trong quá trình quay
  const [finalLandedItemIndex, setFinalLandedItemIndex] = useState(-1); // Chỉ số vật phẩm thực tế đã thắng
  const [hasSpun, setHasSpun] = useState(false);
  const [coins, setCoins] = useState(0); // Khởi tạo với 0, sẽ tải từ Firestore
  const [displayedCoins, setDisplayedCoins] = useState(0); // Số xu hiển thị với hiệu ứng động
  const [rewardHistory, setRewardHistory] = useState<Item[]>([]); // Đã thay đổi từ inventory
  // Đặt pool jackpot ban đầu thành 200
  const [jackpotPool, setJackpotPool] = useState(200);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'spin' | 'history'>('spin'); // Trạng thái mới cho các tab

  // Các trạng thái mới cho popup
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  // Trạng thái Firebase
  const [db, setDb] = useState<any>(null);
  const [authInstance, setAuthInstance] = useState<any>(null);
  const [currentAuthenticatedUserId, setCurrentAuthenticatedUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Trạng thái sẵn sàng của Auth

  // Khởi tạo Firebase
  useEffect(() => {
    const initFirebase = async () => {
        try {
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            let app;
            if (!getApps().length) { // Kiểm tra xem ứng dụng Firebase mặc định đã tồn tại chưa
                app = initializeApp(firebaseConfig);
            } else {
                app = getApp(); // Lấy ứng dụng Firebase mặc định hiện có
            }
            
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);

            setDb(firestoreDb);
            setAuthInstance(firebaseAuth);

            // Đăng nhập bằng token tùy chỉnh được cung cấp hoặc ẩn danh
            if (typeof __initial_auth_token !== 'undefined') {
                await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            } else {
                await signInAnonymously(firebaseAuth);
            }

            // Lắng nghe thay đổi trạng thái xác thực
            const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
                if (user) {
                    setCurrentAuthenticatedUserId(user.uid);
                } else {
                    setCurrentAuthenticatedUserId(null);
                }
                setIsAuthReady(true); // Trạng thái xác thực đã được xác định
            });

            return () => unsubscribe(); // Hủy đăng ký khi component unmount
        } catch (error) {
            console.error("Lỗi khi khởi tạo Firebase hoặc xác thực:", error);
            setIsAuthReady(true); // Đảm bảo trạng thái sẵn sàng được đặt ngay cả khi có lỗi
        }
    };

    initFirebase();
  }, []); // Chạy một lần khi component mount


  // Lấy dữ liệu người dùng (xu) khi ID người dùng được xác thực có sẵn và Auth đã sẵn sàng
  useEffect(() => {
    if (db && currentAuthenticatedUserId && isAuthReady) {
        const fetchCoins = async () => {
            try {
                const userDocRef = doc(db, 'users', currentAuthenticatedUserId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setCoins(userData.coins || 0);
                    setDisplayedCoins(userData.coins || 0); // Khởi tạo xu hiển thị
                } else {
                    // Nếu tài liệu người dùng không tồn tại, tạo nó với giá trị mặc định
                    await setDoc(userDocRef, { coins: 0, gems: 0, keys: 0, createdAt: new Date() });
                    setCoins(0);
                    setDisplayedCoins(0);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu xu:", error);
            }
        };
        fetchCoins();
    } else if (!currentAuthenticatedUserId && isAuthReady) { // Đảm bảo db được khởi tạo trước khi dừng tải
        setCoins(0);
        setDisplayedCoins(0);
    }
  }, [db, currentAuthenticatedUserId, isAuthReady]); // Phụ thuộc vào db, currentAuthenticatedUserId và isAuthReady

  // Hàm để cập nhật số xu trong Firestore bằng giao dịch (transaction)
  const updateCoinsInFirestore = useCallback(async (userId: string, amount: number) => {
    if (!db || !userId) {
        console.error("Firestore DB không được khởi tạo hoặc Người dùng chưa được xác thực.");
        return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                console.error("Tài liệu người dùng không tồn tại cho giao dịch xu.");
                // Tạo tài liệu nếu nó bị thiếu (mặc dù fetch thường xử lý điều này)
                transaction.set(userDocRef, { coins: amount, gems: 0, keys: 0, createdAt: new Date() });
            } else {
                const currentCoins = userDoc.data().coins || 0;
                const newCoins = currentCoins + amount;
                const finalCoins = Math.max(0, newCoins); // Đảm bảo số xu không xuống dưới 0
                transaction.update(userDocRef, { coins: finalCoins });
            }
        });
        // Cập nhật trạng thái cục bộ SAU khi giao dịch thành công
        setCoins(prev => prev + amount); // Điều này sẽ kích hoạt hiệu ứng động
    } catch (error) {
        console.error("Giao dịch Firestore thất bại cho xu: ", error);
    }
  }, [db]); // Tạo lại nếu db thay đổi


  // Danh sách các vật phẩm có sẵn
  const items: Item[] = [
    // Vật phẩm đã cập nhật: "100 Vàng" đã đổi thành "100 Xu" với icon mới
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: '100 Xu', value: 100, rarity: 'common', color: 'text-yellow-500' },
    { icon: GemIcon, name: 'Ngọc quý', value: 300, rarity: 'rare', color: 'text-blue-500' },
    { icon: StarIcon, name: 'Sao may mắn', value: 500, rarity: 'epic', color: 'text-purple-500' },
    { icon: ZapIcon, name: 'Tia chớp', value: 200, rarity: 'uncommon', color: 'text-cyan-500' },
    { icon: ShieldIcon, name: 'Khiên bảo vệ', value: 400, rarity: 'rare', color: 'text-green-500' },
    { icon: TrophyIcon, name: 'Cúp vàng', value: 800, rarity: 'legendary', color: 'text-orange-500' },
    { icon: HeartIcon, name: 'Trái tim', value: 250, rarity: 'uncommon', color: 'text-red-500' },
    { icon: GiftIcon, name: 'Quà bí ẩn', value: 600, rarity: 'epic', color: 'text-pink-500' },
    { icon: CoinsIcon, name: 'Vàng+', value: 150, rarity: 'common', color: 'text-yellow-500' },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT!', value: 0, rarity: 'jackpot', color: 'text-amber-400' },
    { icon: StarIcon, name: 'Sao bạc', value: 300, rarity: 'uncommon', color: 'text-gray-400' },
    { icon: ZapIcon, name: 'Sét đỏ', value: 450, rarity: 'rare', color: 'text-red-400' },
    { icon: ShieldIcon, name: 'Khiên ma thuật', value: 700, rarity: 'epic', color: 'text-indigo-500' },
    { icon: TrophyIcon, name: 'Cúp bạc', value: 400, rarity: 'rare', color: 'text-gray-500' },
    { icon: HeartIcon, name: 'Trái tim vàng', value: 500, rarity: 'epic', color: 'text-yellow-400' },
    { icon: GiftIcon, name: 'Hộp quà', value: 200, rarity: 'uncommon', color: 'text-violet-500' }
  ];

  // Vị trí các vật phẩm trên vòng quay
  const itemPositionsOnWheel = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
    { row: 1, col: 3 }, { row: 2, col: 3 },
    { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
    { row: 2, col: 0 }, { row: 1, col: 0 }
  ];
  const NUM_WHEEL_SLOTS = itemPositionsOnWheel.length;

  // Lấy màu nền dựa trên độ hiếm của vật phẩm
  const getRarityBg = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'uncommon': return 'bg-green-100 border-green-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-orange-100 border-orange-300';
      case 'jackpot': return 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 border-4 border-yellow-200 shadow-lg shadow-yellow-500/50';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Hàm xử lý cơ chế quay
  const spinChest = async () => { // Đã biến thành async để chờ cập nhật Firestore
    if (isSpinning || coins < 100) return;

    // Trừ xu cục bộ để có phản hồi tức thì
    setCoins(prev => prev - 100);
    // Trừ xu từ Firestore ngay lập tức
    if (currentAuthenticatedUserId) {
      await updateCoinsInFirestore(currentAuthenticatedUserId, -100);
    } else {
      console.warn("Người dùng chưa được xác thực. Không thể trừ xu từ Firestore.");
    }


    // Thêm ngẫu nhiên 10-100 xu vào pool jackpot khi quay
    const randomCoinsToAdd = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    setJackpotPool(prev => prev + randomCoinsToAdd);

    setIsSpinning(true);
    setSelectedIndex(-1);
    setFinalLandedItemIndex(-1);
    setHasSpun(false);
    setJackpotWon(false);
    setShowRewardPopup(false); // Ẩn popup trước khi quay mới

    let targetLandedItemIndex: number;
    const jackpotItemArrayIndex = items.findIndex(item => item.rarity === 'jackpot');

    // Xác định chỉ số hạ cánh (1% cơ hội trúng Jackpot)
    if (jackpotItemArrayIndex >= 0 && jackpotItemArrayIndex < NUM_WHEEL_SLOTS && Math.random() < 0.01) {
        targetLandedItemIndex = jackpotItemArrayIndex;
    } else {
        const otherItemIndicesOnWheel: number[] = [];
        for (let i = 0; i < NUM_WHEEL_SLOTS; i++) {
            if (i !== jackpotItemArrayIndex) {
                otherItemIndicesOnWheel.push(i);
            }
        }

        if (otherItemIndicesOnWheel.length > 0) {
            targetLandedItemIndex = otherItemIndicesOnWheel[Math.floor(Math.random() * otherItemIndicesOnWheel.length)];
        } else if (NUM_WHEEL_SLOTS === 1 && jackpotItemArrayIndex === 0) {
            targetLandedItemIndex = jackpotItemArrayIndex;
        } else {
            const allWheelIndices = Array.from(Array(NUM_WHEEL_SLOTS).keys());
             if (allWheelIndices.length > 0) {
                targetLandedItemIndex = allWheelIndices[Math.floor(Math.random() * allWheelIndices.length)];
            } else {
                targetLandedItemIndex = 0; // Dự phòng tuyệt đối
            }
        }
    }

    setFinalLandedItemIndex(targetLandedItemIndex);

    const numFullRotations = 2;
    const totalVisualSteps = (NUM_WHEEL_SLOTS * numFullRotations) + targetLandedItemIndex;

    let currentVisualStepIndex = 0;
    let currentSpeed = 50;
    const finalPauseDuration = 700;

    const spinAnimation = () => {
      const currentHighlightIndex = currentVisualStepIndex % NUM_WHEEL_SLOTS;
      setSelectedIndex(currentHighlightIndex);

      if (currentVisualStepIndex < totalVisualSteps) {
        const remainingVisualSteps = totalVisualSteps - currentVisualStepIndex;
        const fastSpeed = 50;
        const moderateSpeed = 120;
        const finalSlowdownSpeeds = [650, 500, 400, 300, 220, 160];

        if (remainingVisualSteps <= finalSlowdownSpeeds.length) {
          currentSpeed = finalSlowdownSpeeds[remainingVisualSteps - 1];
        } else if (remainingVisualSteps <= NUM_WHEEL_SLOTS + Math.floor(NUM_WHEEL_SLOTS / 2)) {
          currentSpeed = moderateSpeed;
        } else {
          currentSpeed = fastSpeed;
        }

        currentVisualStepIndex++;
        setTimeout(spinAnimation, currentSpeed);
      } else {
        // Hoạt ảnh đã kết thúc
        setTimeout(() => {
          setIsSpinning(false);
          setHasSpun(true);
          setSelectedIndex(targetLandedItemIndex);

          const wonItem = { ...items[targetLandedItemIndex], timestamp: Date.now() }; // Thêm timestamp
          setRewardHistory(prev => [wonItem, ...prev].slice(0, 10)); // Thêm vào lịch sử, giữ tối đa 10 vật phẩm
          
          let actualWonAmount = wonItem.value; // Mặc định là giá trị của vật phẩm

          if (wonItem.rarity === 'jackpot') {
            actualWonAmount = jackpotPool; // Chụp giá trị pool hiện tại để giành chiến thắng
            setJackpotWon(true);
            setJackpotAnimation(true);
            // Không setCoins cục bộ ở đây, nó được xử lý bởi updateCoinsInFirestore
            setJackpotPool(200); // Đặt lại sau khi sử dụng
            
            setTimeout(() => {
              setJackpotAnimation(false);
            }, 3000);
          } else {
            // Không setCoins cục bộ ở đây, nó được xử lý bởi updateCoinsInFirestore
          }
          
          // Gọi cập nhật Firestore cho số tiền đã thắng
          if (currentAuthenticatedUserId) {
            updateCoinsInFirestore(currentAuthenticatedUserId, actualWonAmount);
          } else {
            console.warn("Người dùng chưa được xác thực. Không thể cập nhật xu đã trúng.");
          }

          // Đặt chi tiết cho popup, đảm bảo số tiền độc đắc được chuyển chính xác nếu đó là độc đắc
          setWonRewardDetails({ ...wonItem, value: actualWonAmount }); // Cập nhật giá trị trong wonRewardDetails
          setShowRewardPopup(true); // Hiển thị popup sau khi thắng
        }, finalPauseDuration);
      }
    };
    spinAnimation();
  };

  // Hiển thị lưới vòng quay
  const renderGrid = () => {
    const grid: ({ item: Item; isWheelItem: boolean; isSelected: boolean } | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));

    itemPositionsOnWheel.forEach((pos, indexOnWheel) => {
      if (indexOnWheel < items.length && items[indexOnWheel]) {
        grid[pos.row][pos.col] = {
          item: items[indexOnWheel],
          isWheelItem: true,
          isSelected: selectedIndex === indexOnWheel
        };
      }
    });

    return (
      <div className="grid grid-cols-4 gap-2 p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl border-4 border-amber-300">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (rowIndex === 1 && colIndex === 1) {
              return (
                <div
                  key={`chest-${rowIndex}-${colIndex}`}
                  className="col-span-2 row-span-2 flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg border-4 border-yellow-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                  {/* Đã thay thế emoji bằng hình ảnh và loại bỏ văn bản "RƯƠNG", điều chỉnh kích thước */}
                  <img
                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/treasure-chest.png"
                    alt="Treasure Chest"
                    className={`w-16 h-16 transform transition-all duration-500 ${isSpinning ? 'animate-bounce scale-110' : 'scale-100'}`} // Giảm kích thước xuống w-16 h-16
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/cccccc/000000?text=Lỗi'; }}
                  />
                </div>
              );
            }
            if ((rowIndex === 1 && colIndex === 2) ||
                (rowIndex === 2 && colIndex === 1) ||
                (rowIndex === 2 && colIndex === 2)) {
              return null;
            }

            if (cell && cell.isWheelItem) {
              const itemRarity = cell.item.rarity;
              const wheelIndexOfCurrentCell = itemPositionsOnWheel.findIndex(p => p.row === rowIndex && p.col === colIndex);
              const isTrulySelected = !isSpinning && hasSpun && finalLandedItemIndex === wheelIndexOfCurrentCell;
              const displaySelected = cell.isSelected || isTrulySelected;

              return (
                <div
                  key={`item-${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 relative overflow-hidden
                    ${getRarityBg(itemRarity)}
                    ${displaySelected && itemRarity !== 'jackpot' ? 'shadow-[inset_0_0_0_3px_theme(\'colors.yellow.400\')] scale-110 bg-gradient-to-br from-yellow-200 to-orange-300 z-10' : ''}
                    ${displaySelected && itemRarity === 'jackpot' ? 'shadow-[inset_0_0_0_4px_theme(\'colors.amber.500\')] scale-110 z-20 animate-pulse' : ''}
                    ${isSpinning && cell.isSelected ? (itemRarity === 'jackpot' ? 'animate-none' : 'animate-pulse') : ''}
                    ${isTrulySelected && itemRarity !== 'jackpot' ? 'animate-none shadow-[inset_0_0_0_3px_theme(\'colors.green.500\')] bg-green-200' : ''}
                    ${isTrulySelected && itemRarity === 'jackpot' ? 'animate-none shadow-[inset_0_0_0_4px_theme(\'colors.red.600\')] z-20' : ''}
                    hover:scale-105
                  `}
                >
                  {(displaySelected || (isSpinning && cell.isSelected)) && itemRarity !== 'jackpot' && (
                    <div className={`absolute inset-0 ${isTrulySelected ? 'bg-green-400/30' : 'bg-yellow-300/50'} ${isSpinning && cell.isSelected ? 'animate-pulse' : ''}`}></div>
                  )}
                    {(displaySelected || (isSpinning && cell.isSelected)) && itemRarity === 'jackpot' && (
                    <div className={`absolute inset-0 ${isTrulySelected ? 'bg-red-500/50' : 'bg-amber-400/60'} ${isSpinning && cell.isSelected ? 'animate-pulse' : ''}`}></div>
                  )}
                  {/* Hiển thị icon chính - chỉ hiển thị nếu không phải vật phẩm '100 Xu' */}
                  {!(typeof cell.item.icon === 'string' && cell.item.name === '100 Xu') && (
                    typeof cell.item.icon === 'string' ? (
                      <img src={cell.item.icon} alt={cell.item.name} className="w-10 h-10 relative z-10" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/cccccc/000000?text=Lỗi'; }} />
                    ) : (
                      <cell.item.icon className={`w-6 h-6 ${cell.item.color} relative z-10`} />
                    )
                  )}
                  
                  {/* Hiển thị có điều kiện cho giá trị và tên */}
                  {itemRarity !== 'jackpot' && (
                    <div className="flex flex-col items-center mt-1 relative z-10">
                      {/* Nếu icon là một chuỗi (như hình ảnh đô la) và nó có giá trị, hiển thị giá trị + icon */}
                      {typeof cell.item.icon === 'string' && cell.item.value > 0 && cell.item.name === '100 Xu' ? (
                        <div className="flex items-center text-xs font-semibold text-gray-700">
                          <span>{cell.item.value}</span>
                          <CoinsIcon src={cell.item.icon} className="w-3 h-3 ml-0.5" />
                        </div>
                      ) : (
                        // Ngược lại, hiển thị tên và sau đó là giá trị + emoji tiền xu
                        <>
                          <span className={`text-xs font-semibold ${itemRarity === 'jackpot' ? 'text-red-700' : 'text-gray-700'} text-center`}>
                            {cell.item.name}
                          </span>
                          {cell.item.value > 0 && (
                            <span className="text-xs text-gray-600">
                              {cell.item.value}💰
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return <div key={`empty-outer-${rowIndex}-${colIndex}`} className="aspect-square bg-transparent"></div>;
          })
        )}
      </div>
    );
  };

  // Hàm hiệu ứng động bộ đếm xu
  useEffect(() => {
    // Chỉ kích hoạt hiệu ứng động nếu số xu hiển thị cần theo kịp trạng thái xu thực tế
    if (displayedCoins === coins) return;

    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
        coinElement.removeEventListener('animationend', animationEndHandler);
      };
      coinElement.addEventListener('animationend', animationEndHandler);

      return () => {
        if (coinElement) {
            coinElement.removeEventListener('animationend', animationEndHandler);
             coinElement.classList.remove('number-changing');
        }
      };
    }
     return () => {};
  }, [displayedCoins, coins]); // Phụ thuộc vào cả displayedCoins và coins state


  // Hiển thị chỉ báo tải nếu dữ liệu Auth chưa sẵn sàng
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white text-lg">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center font-sans">
      {/* Header chứa nút Đóng và các Tab */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        {/* Điều hướng Tab */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('spin')}
            className={`px-4 py-2 rounded-l-xl text-md font-bold transition-all duration-300 ${
              activeTab === 'spin'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Quay
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-r-xl text-md font-bold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Lịch sử
          </button>
        </div>

        {/* Nút Đóng */}
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png"
            alt="Close icon"
            className="w-5 h-5 text-indigo-300"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/20x20/cccccc/000000?text=X'; }}
          />
        </button>
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          {/* Hiển thị có điều kiện cho Jackpot Pool */}
          {activeTab === 'spin' && (
            <div className={`mt-2 p-3 rounded-xl border-4 transition-all duration-500 relative ${ /* Đã điều chỉnh padding */
              jackpotAnimation
                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg'
            }`}>
              <div className="text-yellow-200 text-base font-bold mb-1 tracking-wider"> {/* Đã điều chỉnh kích thước văn bản */}
                JACKPOT POOL
              </div>
              <div className={`text-4xl font-black text-white drop-shadow-lg flex items-center justify-center gap-1 ${ /* Đã điều chỉnh kích thước văn bản và khoảng cách */
                jackpotAnimation ? 'animate-bounce' : ''
              }`}>
                {jackpotPool.toLocaleString()}
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" /> {/* Đã điều chỉnh kích thước icon */}
              </div>
              <div className="text-yellow-200 text-xs mt-2 opacity-90">
                Tỉ lệ quay trúng ô JACKPOT: 1%!
              </div>
              {jackpotAnimation && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div>
              )}
            </div>
          )}

          {/* Hiển thị có điều kiện cho Coins */}
          {activeTab === 'spin' && (
            <div className="flex justify-center items-center gap-2 text-white text-sm sm:text-base mt-2"> {/* Đã điều chỉnh khoảng cách và thêm mt-2 */}
              <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />
            </div>
          )}
        </div>

        {/* Nội dung Tab có điều kiện */}
        {activeTab === 'spin' && (
          <>
            <div className="flex justify-center mb-6">
              {renderGrid()}
            </div>

            {/* Div cha của nút Quay đã có flex justify-center, nút sẽ được căn giữa */}
            <div className="flex justify-center mb-6">
              <button
                onClick={spinChest}
                disabled={isSpinning || coins < 100}
                className={`
                  px-3 py-2 text-sm rounded-full transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-75
                  inline-flex items-center justify-center relative group /* Đổi thành inline-flex để vừa với nội dung */
                  ${isSpinning || coins < 100
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed shadow-inner opacity-80'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:ring-green-400'
                  }
                `}
              >
                {isSpinning ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang quay...
                  </span>
                ) : (
                  <div className="flex items-center justify-center"> {/* Đã loại bỏ w-full ở đây */}
                    <span className="font-semibold tracking-wide">
                      QUAY
                    </span>
                    <span className={`
                      h-4 w-px mx-1.5 transition-colors duration-200 
                      ${coins < 100 ? 'bg-gray-400/60' : 'bg-white/40 group-hover:bg-white/60'}
                    `}></span>
                    <span className="flex items-center">
                      {coins < 100 ? (
                        <span className="font-medium">Hết xu</span>
                      ) : (
                        <>
                          <span className="font-medium">100</span>
                          <CoinsIcon
                            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                            className="w-4 h-4 inline-block ml-1"
                          />
                        </>
                      )}
                    </span>
                  </div>
                )}
              </button>
              {coins < 100 && !isSpinning && (
                <p className="text-red-400 text-sm mt-2 font-semibold">Bạn không đủ xu để quay!</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && rewardHistory.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg">
            <h3 className="text-white font-bold mb-4 text-lg text-center">📜 Lịch sử nhận thưởng 📜</h3>
            <div className="flex overflow-x-auto space-x-3 pb-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-800/50">
              {rewardHistory.map((item, index) => {
                const itemRarity = item.rarity;
                return (
                  <div
                    key={`${item.name}-${item.timestamp}-${index}`} // Key duy nhất hơn
                    className={`
                      flex-shrink-0 w-28 h-32 ${getRarityBg(itemRarity)}
                      p-2.5 rounded-lg text-center flex flex-col items-center justify-around shadow-md
                      hover:shadow-xl transition-all duration-200 transform hover:scale-105
                    `}
                  >
                    {typeof item.icon === 'string' ? (
                      <img src={item.icon} alt={item.name} className="w-10 h-10 mx-auto mb-1" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/cccccc/000000?text=Lỗi'; }} />
                    ) : (
                      <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-1`} />
                    )}
                    <div className={`text-xs font-semibold ${itemRarity === 'jackpot' ? 'text-red-700' : 'text-gray-800'} leading-tight line-clamp-2`}>
                      {item.name}
                    </div>
                    {itemRarity !== 'jackpot' && <div className="text-xs text-gray-700 mt-0.5">{item.value.toLocaleString()}<CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3 h-3 inline-block ml-0.5 -mt-0.5" /></div>}
                    {itemRarity === 'jackpot' && <div className="text-xs font-bold text-red-600 mt-0.5">POOL WIN!</div>}
                  </div>
                );
              })}
            </div>
            {rewardHistory.length > 10 && <p className="text-xs text-center text-gray-300 mt-3">Hiển thị 10 phần thưởng mới nhất.</p>}
          </div>
        )}
        {activeTab === 'history' && rewardHistory.length === 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg text-center text-white">
            <p className="text-lg">Chưa có phần thưởng nào trong lịch sử.</p>
            <p className="text-sm opacity-80 mt-2">Hãy quay để bắt đầu nhận thưởng!</p>
          </div>
        )}
      </div>

      {/* Popup Phần thưởng */}
      {showRewardPopup && wonRewardDetails && (
        <RewardPopup
          item={wonRewardDetails} // wonRewardDetails giờ chứa số tiền độc đắc thực tế nếu thắng
          jackpotWon={jackpotWon}
          onClose={() => setShowRewardPopup(false)}
        />
      )}

      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }

        @keyframes celebrate {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(253, 224, 71, 0.3); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.7); }
        }
        .animate-celebrate { animation: celebrate 0.8s ease-in-out forwards; }

        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }
        .animate-shine { animation: shine 1.5s linear infinite; }

        /* Các hiệu ứng động dành riêng cho Popup */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        @keyframes bounce-once {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-7px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.8s ease-in-out;
        }

        body {
          font-family: 'Inter', sans-serif; /* Ví dụ phông chữ */
        }

        /* Thanh cuộn tùy chỉnh cho lịch sử phần thưởng */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #a855f7 /* thumb */ #3b0764 /* track, semi-transparent purple-800 */;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(59, 7, 100, 0.5); /* purple-800 với độ trong suốt */
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #a855f7; /* purple-400 */
          border-radius: 10px;
          border: 2px solid rgba(59, 7, 100, 0.5); /* màu track cho viền */
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
