import React, { useState, useEffect, useRef, Component } from 'react';
// Import the CharacterCard component
import CharacterCard from './stats/stats-main.tsx'; // Giả sử stats.tsx nằm trong cùng thư mục

// Import DotLottieReact component
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// NEW: Import the TreasureChest component
import TreasureChest from './treasure.tsx';

// NEW: Import the CoinDisplay component
import CoinDisplay from './coin-display.tsx';

// NEW: Import Firestore functions
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { auth } from './firebase.js'; // Import auth từ firebase.js của bạn
// Import User type from firebase/auth
import { User } from 'firebase/auth';

// NEW: Import the custom useSessionStorage hook
import useSessionStorage from './bo-nho-tam.tsx';


// --- SVG Icon Components (Thay thế cho lucide-react) ---
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
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GemIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => (
  <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }} {...props}>
    <img
      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/tourmaline.png"
      alt="Biểu tượng Đá quý Tourmaline"
      className="w-full h-full object-contain"
      onError={(e) => {
        const target = e as any; // Ép kiểu sang any để truy cập target
        target.onerror = null;
        target.src = "https://placehold.co/24x24/8a2be2/ffffff?text=Gem";
      }}
    />
  </div>
);

const KeyIcon = () => (
  <img
    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png"
    alt="Biểu tượng Chìa khóa"
    className="w-4 h-4 object-contain"
  />
);


// --- NEW: Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lỗi không bắt được trong component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          <p>Có lỗi xảy ra khi hiển thị nội dung.</p>
          <p>Chi tiết lỗi: {this.state.error?.message}</p>
          <p>(Kiểm tra Console để biết thêm thông tin)</p>
        </div>
      );
    }

    return this.props.children;
  }
}


// Định nghĩa interface cho props của component
interface ObstacleRunnerGameProps {
  className?: string;
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null; // Thêm prop currentUser
}

// Định nghĩa interface cho Obstacle với health
interface GameObstacle {
  id: number;
  position: number; // Vị trí ngang tính bằng %
  type: string;
  height: number; // Chiều cao theo đơn vị Tailwind (ví dụ: 8 cho h-8)
  width: number; // Chiều rộng theo đơn vị Tailwind (ví dụ: w-8)
  color: string; // Lớp gradient Tailwind hoặc định danh khác
  baseHealth: number; // Máu cơ bản cho loại chướng ngại vật này
  health: number; // Máu hiện tại của chướng ngại vật
  maxHealth: number; // Máu tối đa của chướng ngại vật
  damage: number; // Sát thương mà chướng ngại vật gây ra khi va chạm
  lottieSrc?: string; // URL nguồn Lottie tùy chọn cho chướng ngại vật Lottie
  hasKey?: boolean; // Cờ để chỉ ra nếu chướng ngại vật rơi ra chìa khóa
}

// --- NEW: Định nghĩa interface cho Coin ---
interface GameCoin {
  id: number;
  x: number; // Vị trí ngang tính bằng %
  y: number; // Vị trí dọc tính bằng %
  initialSpeedX: number; // Tốc độ cho chuyển động ngang ban đầu (trái)
  initialSpeedY: number; // Tốc độ cho chuyển động dọc ban đầu (xuống)
  attractSpeed: number; // Hệ số tốc độ để di chuyển về phía nhân vật sau va chạm
  isAttracted: boolean; // Cờ để chỉ ra nếu đồng xu đang di chuyển về phía nhân vật
}

// --- NEW: Định nghĩa interface cho Cloud với nguồn ảnh ---
interface GameCloud {
  id: number;
  x: number; // Vị trí ngang tính bằng %
  y: number; // Vị trí dọc tính bằng %
  size: number; // Kích thước của đám mây (tính bằng pixel)
  speed: number; // Tốc độ của đám mây
  imgSrc: string; // URL nguồn cho ảnh đám mây
}

// Định nghĩa interface cho dữ liệu session storage (hiện được hook sử dụng nội bộ)
// Chúng ta cũng định nghĩa nó ở đây để làm rõ những gì đang được lưu/tải
interface GameSessionData {
    health: number;
    characterPos: number;
    obstacles: GameObstacle[];
    activeCoins: GameCoin[];
    isShieldActive: boolean;
    shieldHealth: number;
    isShieldOnCooldown: boolean;
    remainingCooldown: number;
    shieldCooldownStartTime: number | null;
    pausedShieldCooldownRemaining: number | null;
    nextKeyIn: number; // SỬA ĐỔI: Đã sửa tên biến này cho nhất quán
    // Thêm các trạng thái game tạm thời khác bạn muốn lưu
}


// Cập nhật chữ ký component để chấp nhận props className, hideNavBar, showNavBar, và currentUser
export default function ObstacleRunnerGame({ className, hideNavBar, showNavBar, currentUser }: ObstacleRunnerGameProps) {
  // Trạng thái game - Hiện sử dụng useSessionStorage cho các trạng thái cần duy trì trong session
  const MAX_HEALTH = 3000; // Định nghĩa máu tối đa
  const [health, setHealth] = useSessionStorage<number>('gameHealth', MAX_HEALTH); // Sử dụng hook cho health
  const [characterPos, setCharacterPos] = useSessionStorage<number>('gameCharacterPos', 0); // Sử dụng hook cho vị trí nhân vật
  const [obstacles, setObstacles] = useSessionStorage<GameObstacle[]>('gameObstacles', []); // Sử dụng hook cho obstacles
  const [activeCoins, setActiveCoins] = useSessionStorage<GameCoin[]>('gameActiveCoins', []); // Sử dụng hook cho active coins
  const [isShieldActive, setIsShieldActive] = useSessionStorage<boolean>('gameIsShieldActive', false); // Sử dụng hook cho shield active
  const [shieldHealth, setShieldHealth] = useSessionStorage<number>('gameShieldHealth', 2000); // Sử dụng hook cho shield health
  const [isShieldOnCooldown, setIsShieldOnCooldown] = useSessionStorage<boolean>('gameIsShieldOnCooldown', false); // Sử dụng hook cho shield cooldown
  const [remainingCooldown, setRemainingCooldown] = useSessionStorage<number>('gameRemainingCooldown', 0); // Sử dụng hook cho remaining cooldown

  // Các trạng thái KHÔNG cần duy trì qua session storage (reset khi làm mới)
  const [gameStarted, setGameStarted] = useState(false); // Theo dõi xem game đã bắt đầu chưa
  const [gameOver, setGameOver] = useState(false); // Theo dõi xem game đã kết thúc chưa
  const [jumping, setJumping] = useState(false); // Theo dõi xem nhân vật có đang nhảy không
  const [isRunning, setIsRunning] = useState(false); // Theo dõi xem nhân vật có đang chạy animation không
  const [runFrame, setRunFrame] = useState(0); // Frame hiện tại cho animation chạy
  const [particles, setParticles] = useState<any[]>([]); // Mảng các hạt đang hoạt động (bụi) - sửa kiểu any nếu có thể
  const [clouds, setClouds] = useState<GameCloud[]>([]); // Mảng các đám mây đang hoạt động với nguồn ảnh
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // Trạng thái để kích hoạt hiệu ứng sát thương thanh máu

  // Trạng thái cho hiển thị trực quan Thanh Máu
  const [damageAmount, setDamageAmount] = useState(0); // Trạng thái để lưu trữ lượng sát thương nhận được để hiển thị
  const [showDamageNumber, setShowDamageNumber] = useState(false); // Trạng thái để kiểm soát khả năng hiển thị của số sát thương

  // Bộ đếm thời gian Khiên (Refs tốt hơn cho bộ đếm thời gian vì chúng không kích hoạt re-render)
  const SHIELD_MAX_HEALTH = 2000; // Máu cơ bản cho khiên
  const SHIELD_COOLDOWN_TIME = 200000; // Thời gian hồi chiêu khiên tính bằng ms (200 giây)
  const shieldCooldownTimerRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian cho hồi chiêu khiên (200s) - Chỉ định kiểu
  const cooldownCountdownTimerRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian cho hiển thị đếm ngược hồi chiêu - Chỉ định kiểu

  // SỬA ĐỔI: Sử dụng state trực tiếp từ useSessionStorage, không phải cấu trúc ref
  const [shieldCooldownStartTime, setShieldCooldownStartTime] = useSessionStorage<number | null>('gameShieldCooldownStartTime', null);
  const [pausedShieldCooldownRemaining, setPausedShieldCooldownRemaining] = useSessionStorage<number | null>('gamePausedShieldCooldownRemaining', null);


  // --- Trạng thái Coin và Gem (Duy trì trong Firestore) ---
  const [coins, setCoins] = useState(0); // Khởi tạo với 0, sẽ tải từ Firestore
  const [displayedCoins, setDisplayedCoins] = useState(0); // Số coin hiển thị với animation
  const coinScheduleTimerRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian để lên lịch coin mới
  const coinCountAnimationTimerRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian cho animation đếm coin

  const [gems, setGems] = useState(42); // Số gem của người chơi, đã khởi tạo

  // NEW: Trạng thái chìa khóa và SỬA ĐỔI cách sử dụng cho khoảng thời gian rơi chìa khóa
  const [nextKeyIn, setNextKeyIn] = useSessionStorage<number>('gameNextKeyIn', randomBetween(5, 10)); // Sử dụng hook cho trạng thái khoảng thời gian rơi chìa khóa
  const [keyCount, setKeyCount] = useState(0); // Số chìa khóa của người chơi


  // Trạng thái UI
  const [isStatsFullscreen, setIsStatsFullscreen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // NEW: Trạng thái để theo dõi việc tải dữ liệu người dùng

  // Định nghĩa phần trăm mức mặt đất mới
  const GROUND_LEVEL_PERCENT = 45;

  // Refs cho các bộ đếm thời gian KHÔNG cần duy trì qua session storage
  const gameRef = useRef<HTMLDivElement | null>(null); // Ref cho div container game chính - Chỉ định kiểu
  const obstacleTimerRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian để lên lịch chướng ngại vật mới - Chỉ định kiểu
  const runAnimationRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian cho animation chạy của nhân vật - Chỉ định kiểu
  const particleTimerRef = useRef<NodeJS.Timeout | null>(null); // Bộ đếm thời gian để tạo hạt - Chỉ định kiểu

  // NEW: Ref cho interval vòng lặp game chính
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); // Chỉ định kiểu


  // NEW: Instance Firestore
  const db = getFirestore();

  // Các loại chướng ngại vật với thuộc tính (thêm máu cơ bản)
  const obstacleTypes: Omit<GameObstacle, 'id' | 'position' | 'health' | 'maxHealth' | 'hasKey'>[] = [
    {
      type: 'lottie-obstacle-1',
      height: 16,
      width: 16,
      color: 'transparent',
      baseHealth: 500,
      damage: 100,
      lottieSrc: "https://lottie.host/c5b645bf-7a29-4471-a9ce-f1a2a7d5a4d9/7dneXvCDQg.lottie"
    },
    {
      type: 'lottie-obstacle-2',
      height: 20,
      width: 20,
      color: 'transparent',
      baseHealth: 700,
      damage: 150,
      lottieSrc: "https://lottie.host/04726a23-b46c-4574-9d0d-570ea2281f00/ydAEtXnQRN.lottie"
    },
  ];

  // --- NEW: Mảng các URL ảnh Đám mây ---
  const cloudImageUrls = [
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud-computing.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/clouds.png",
      "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/cloud.png"
  ];

  // NEW: Hàm trợ giúp để tạo số ngẫu nhiên giữa min và max (bao gồm cả hai)
  function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // --- NEW: Hàm để lấy dữ liệu người dùng từ Firestore ---
  const fetchUserData = async (userId: string) => {
    setIsLoadingUserData(true); // Bắt đầu tải
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("Dữ liệu người dùng đã được lấy:", userData);
        // Cập nhật trạng thái với dữ liệu đã lấy
        setCoins(userData.coins || 0); // Sử dụng coin đã lấy hoặc mặc định là 0
        setDisplayedCoins(userData.coins || 0); // Cập nhật coin hiển thị ngay lập tức
        setGems(userData.gems || 0); // Lấy cả gem nếu được lưu trữ
        setKeyCount(userData.keys || 0); // Lấy chìa khóa nếu được lưu trữ
        // Bạn có thể lấy dữ liệu cụ thể khác của người dùng ở đây
      } else {
        // Nếu tài liệu người dùng không tồn tại, tạo nó với giá trị mặc định
        console.log("Không tìm thấy tài liệu người dùng, đang tạo mặc định.");
        await setDoc(userDocRef, {
          coins: 0,
          gems: 0,
          keys: 0,
          createdAt: new Date(), // Tùy chọn: thêm dấu thời gian tạo
        });
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      // Xử lý lỗi, có thể hiển thị thông báo cho người dùng
    } finally {
      setIsLoadingUserData(false); // Kết thúc tải
    }
  };

  // --- NEW: Hàm để cập nhật số coin của người dùng trong Firestore bằng giao dịch ---
  // Hàm này hiện là nơi trung tâm cho các cập nhật coin.
  const updateCoinsInFirestore = async (userId: string, amount: number) => {
    console.log("updateCoinsInFirestore được gọi với số lượng:", amount); // Debug Log 4
    if (!userId) {
      console.error("Không thể cập nhật coin: Người dùng chưa được xác thực.");
      return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
      console.log("Đang thử giao dịch Firestore cho coin..."); // Debug Log 5
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          console.error("Tài liệu người dùng không tồn tại cho giao dịch coin.");
          // Tùy chọn tạo tài liệu ở đây nếu thiếu, mặc dù fetchUserData nên xử lý việc này
          // Đảm bảo tất cả các trường cần thiết được đặt nếu tạo
          transaction.set(userDocRef, {
            coins: coins, // Sử dụng trạng thái coin cục bộ hiện tại cho tài liệu mới
            gems: gems, // Sử dụng trạng thái gem cục bộ hiện tại cho tài liệu mới
            keys: keyCount, // Sử dụng trạng thái chìa khóa cục bộ hiện tại cho tài liệu mới
            createdAt: new Date()
          });
        } else {
          const currentCoins = userDoc.data().coins || 0;
          const newCoins = currentCoins + amount;
          // Đảm bảo coin không xuống dưới 0 nếu trừ
          const finalCoins = Math.max(0, newCoins);
          transaction.update(userDocRef, { coins: finalCoins });
          console.log(`Coin đã được cập nhật trong Firestore cho người dùng ${userId}: ${currentCoins} -> ${finalCoins}`);
          // Cập nhật trạng thái cục bộ sau khi cập nhật Firestore thành công
          setCoins(finalCoins);
        }
      });
      console.log("Giao dịch Firestore cho coin thành công."); // Debug Log 6
    } catch (error) {
      console.error("Giao dịch Firestore cho coin thất bại: ", error); // Debug Log 8
      // Xử lý lỗi, có thể thử lại hoặc thông báo cho người dùng
    }
  };

   // Hàm animation đếm coin (Giữ trong tệp game chính)
   // Hàm này hiện chỉ xử lý animation, việc cập nhật Firestore được tách riêng.
  const startCoinCountAnimation = (reward: number) => {
      console.log("startCoinCountAnimation được gọi với phần thưởng:", reward); // Debug Log 2
      const oldCoins = coins; // Sử dụng giá trị trạng thái
      const newCoins = oldCoins + reward;
      let step = Math.ceil(reward / 30);
      let current = oldCoins;

      // Xóa bất kỳ interval animation đếm coin nào hiện có
      if (coinCountAnimationTimerRef.current) {
          clearInterval(coinCountAnimationTimerRef.current);
      }

      const countInterval = setInterval(() => {
          current += step;
          if (current >= newCoins) {
              setDisplayedCoins(newCoins);
              clearInterval(countInterval);
              coinCountAnimationTimerRef.current = null; // Xóa ref sau khi animation kết thúc
              console.log("Animation đếm coin đã kết thúc."); // Debug Log 3

              // NEW: Kích hoạt cập nhật Firestore SAU KHI animation kết thúc
              if (auth.currentUser) {
                 updateCoinsInFirestore(auth.currentUser.uid, reward); // Cập nhật Firestore với số lượng phần thưởng
              } else {
                 console.log("Người dùng chưa được xác thực, bỏ qua cập nhật Firestore.");
              }

          } else {
              setDisplayedCoins(current);
          }
      }, 50);

      coinCountAnimationTimerRef.current = countInterval;
  };

  // --- NEW: Hàm để cập nhật số chìa khóa của người dùng trong Firestore bằng giao dịch ---
  const updateKeysInFirestore = async (userId: string, amount: number) => {
    console.log("updateKeysInFirestore được gọi với số lượng:", amount);
    if (!userId) {
      console.error("Không thể cập nhật chìa khóa: Người dùng chưa được xác thực.");
      return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
      console.log("Đang thử giao dịch Firestore cho chìa khóa...");
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          console.error("Tài liệu người dùng không tồn tại cho giao dịch chìa khóa.");
           // Tùy chọn tạo tài liệu ở đây nếu thiếu
          transaction.set(userDocRef, {
            coins: coins,
            gems: gems,
            keys: amount,
            createdAt: new Date()
          });
        } else {
          const currentKeys = userDoc.data().keys || 0;
          const newKeys = currentKeys + amount;
          const finalKeys = Math.max(0, newKeys);
          transaction.update(userDocRef, { keys: finalKeys });
          console.log(`Chìa khóa đã được cập nhật trong Firestore cho người dùng ${userId}: ${currentKeys} -> ${finalKeys}`);
          setKeyCount(finalKeys); // Cập nhật trạng thái cục bộ
        }
      });
      console.log("Giao dịch Firestore cho chìa khóa thành công.");
    } catch (error) {
      console.error("Giao dịch Firestore cho chìa khóa thất bại: ", error);
    }
  };


  // NEW: Hàm để xử lý phần thưởng gem nhận được từ TreasureChest
  const handleGemReward = (amount: number) => {
      setGems(prev => prev + amount);
      console.log(`Đã nhận ${amount} gem từ rương.`);
      // TODO: Thực hiện cập nhật Firestore cho gem
  };

  // NEW: Hàm để xử lý việc thu thập chìa khóa (được gọi khi chướng ngại vật có chìa khóa bị đánh bại)
  const handleKeyCollect = (amount: number) => {
      console.log(`Đã thu thập ${amount} chìa khóa.`);
      setKeyCount(prev => prev + amount); // Cập nhật trạng thái cục bộ trước
      if (auth.currentUser) { // Sau đó cập nhật Firestore
        updateKeysInFirestore(auth.currentUser.uid, amount);
      } else {
        console.log("Người dùng chưa được xác thực, bỏ qua cập nhật chìa khóa Firestore.");
      }
  };


  // Hàm để bắt đầu một game MỚI (reset các trạng thái session storage)
  const startNewGame = () => {
    // Reset các trạng thái session storage về giá trị ban đầu
    setHealth(MAX_HEALTH);
    setCharacterPos(0);
    setObstacles([]);
    setActiveCoins([]);
    setIsShieldActive(false);
    setShieldHealth(SHIELD_MAX_HEALTH);
    setIsShieldOnCooldown(false);
    setRemainingCooldown(0);
    setShieldCooldownStartTime(null);
    setPausedShieldCooldownRemaining(null);
    // SỬA ĐỔI: Reset trạng thái nextKeyIn
    setNextKeyIn(randomBetween(5, 10));

    // Reset các trạng thái không sử dụng session storage
    setGameStarted(true);
    setGameOver(false);
    setIsRunning(true);
    setShowHealthDamageEffect(false);
    setDamageAmount(0);
    setShowDamageNumber(false);
    setIsStatsFullscreen(false);

    // Thiết lập các yếu tố game
    const initialObstacles: GameObstacle[] = [];
    if (obstacleTypes.length > 0) {
        const firstObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        // SỬA ĐỔI: Sử dụng biến trạng thái nextKeyIn và hàm setNextKeyIn
        let currentNextKeyIn = nextKeyIn; // Lấy giá trị hiện tại
        const hasKeyFirst = (() => {
          currentNextKeyIn -= 1;
          if (currentNextKeyIn <= 0) {
            setNextKeyIn(randomBetween(5, 10)); // Cập nhật trạng thái
            return true;
          }
          setNextKeyIn(currentNextKeyIn); // Cập nhật trạng thái
          return false;
        })();

        initialObstacles.push({
          id: Date.now(),
          position: 120,
          ...firstObstacleType,
          health: firstObstacleType.baseHealth,
          maxHealth: firstObstacleType.baseHealth,
          hasKey: hasKeyFirst,
        });

        for (let i = 1; i < 5; i++) {
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

          // SỬA ĐỔI: Sử dụng biến trạng thái nextKeyIn và hàm setNextKeyIn
          const hasKey = (() => {
            currentNextKeyIn -= 1; // Tiếp tục giảm giá trị đã được cập nhật
            if (currentNextKeyIn <= 0) {
              setNextKeyIn(randomBetween(5, 10)); // Cập nhật trạng thái
              return true;
            }
            setNextKeyIn(currentNextKeyIn); // Cập nhật trạng thái
            return false;
          })();

          initialObstacles.push({
            id: Date.now() + i,
            position: 150 + (i * 50),
            ...obstacleType,
            health: obstacleType.baseHealth,
            maxHealth: obstacleType.baseHealth,
            hasKey: hasKey,
          });
        }
    }

    setObstacles(initialObstacles);
    generateInitialClouds(5);

    if (particleTimerRef.current) clearInterval(particleTimerRef.current);
    particleTimerRef.current = setInterval(generateParticles, 300);

    scheduleNextObstacle();
    scheduleNextCoin();
  };


  // Effect để lấy dữ liệu người dùng từ Firestore khi trạng thái xác thực thay đổi
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("Người dùng đã xác thực:", user.uid);
        fetchUserData(user.uid); // Lấy dữ liệu người dùng khi đã xác thực
        setGameStarted(true); // Giả sử game có thể bắt đầu nếu người dùng đã xác thực
        setIsRunning(true); // Bắt đầu animation chạy
      } else {
        console.log("Người dùng đã đăng xuất.");
        // Reset tất cả trạng thái game khi đăng xuất, bao gồm xóa session storage
        setGameStarted(false);
        setGameOver(false);
        setHealth(MAX_HEALTH);
        setCharacterPos(0);
        setObstacles([]);
        setActiveCoins([]);
        setIsShieldActive(false);
        setShieldHealth(SHIELD_MAX_HEALTH);
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        setShieldCooldownStartTime(null);
        setPausedShieldCooldownRemaining(null);
        // SỬA ĐỔI: Reset trạng thái nextKeyIn
        setNextKeyIn(randomBetween(5, 10));


        setIsRunning(false);
        setShowHealthDamageEffect(false);
        setDamageAmount(0);
        setShowDamageNumber(false);
        setIsStatsFullscreen(false);
        setCoins(0);
        setDisplayedCoins(0);
        setGems(0);
        setKeyCount(0);
        setIsLoadingUserData(false);

        // Xóa tất cả session storage liên quan đến game khi đăng xuất
        sessionStorage.removeItem('gameHealth');
        sessionStorage.removeItem('gameCharacterPos');
        sessionStorage.removeItem('gameObstacles');
        sessionStorage.removeItem('gameActiveCoins');
        sessionStorage.removeItem('gameIsShieldActive');
        sessionStorage.removeItem('gameShieldHealth');
        sessionStorage.removeItem('gameIsShieldOnCooldown');
        sessionStorage.removeItem('gameRemainingCooldown');
        sessionStorage.removeItem('gameShieldCooldownStartTime');
        sessionStorage.removeItem('gamePausedShieldCooldownRemaining');
        sessionStorage.removeItem('gameNextKeyIn'); // SỬA ĐỔI: Đảm bảo key này cũng được xóa

        // Xóa các bộ đếm thời gian và interval
        if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
        if(runAnimationRef.current) clearInterval(runAnimationRef.current);
        if(particleTimerRef.current) clearInterval(particleTimerRef.current);
        if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
        if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
        if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
        if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
      }
    });

    // Dọn dẹp subscription khi component unmount
    return () => unsubscribe();
  }, [auth, setHealth, setCharacterPos, setObstacles, setActiveCoins, setIsShieldActive, setShieldHealth, setIsShieldOnCooldown, setRemainingCooldown, setShieldCooldownStartTime, setPausedShieldCooldownRemaining, setNextKeyIn]); // Thêm các setter vào dependencies

  // Effect để xử lý trạng thái game over khi máu về 0
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if (shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if (cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
          gameLoopIntervalRef.current = null;
      }
    };
  }, [health, gameStarted]);

  // Tạo các yếu tố đám mây ban đầu
  const generateInitialClouds = (count: number) => {
    const newClouds: GameCloud[] = [];
    for (let i = 0; i < count; i++) {
      const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
      newClouds.push({
        id: Date.now() + i,
        x: Math.random() * 120 + 100,
        y: Math.random() * 40 + 10,
        size: Math.random() * 40 + 30,
        speed: Math.random() * 0.3 + 0.15,
        imgSrc: randomImgSrc
      });
    }
    setClouds(newClouds);
  };

  // Tạo hạt bụi cho hiệu ứng hình ảnh
  const generateParticles = () => {
    if (!gameStarted || gameOver || isStatsFullscreen) return;

    const newParticles: any[] = []; // Sửa kiểu any nếu có thể
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 5 + Math.random() * 5,
        y: 0, // Bắt đầu từ mặt đất
        size: Math.random() * 3 + 2, // Kích thước hạt
        xVelocity: -Math.random() * 1 - 0.5, // Tốc độ ngang (về phía sau)
        yVelocity: Math.random() * 2 - 1, // Tốc độ dọc (hơi lên hoặc xuống)
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700' // Màu hạt
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Lên lịch cho chướng ngại vật tiếp theo xuất hiện
  const scheduleNextObstacle = () => {
    if (gameOver || isStatsFullscreen) {
        if (obstacleTimerRef.current) {
            clearTimeout(obstacleTimerRef.current);
            obstacleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 15000) + 5000; // Thời gian ngẫu nhiên từ 5-20 giây
    obstacleTimerRef.current = setTimeout(() => {
      const obstacleCount = Math.floor(Math.random() * 3) + 1; // 1 đến 3 chướng ngại vật
      const newObstacles: GameObstacle[] = [];

      if (obstacleTypes.length > 0) {
          // SỬA ĐỔI: Lấy giá trị nextKeyIn hiện tại một lần trước vòng lặp
          let currentNextKeyIn = nextKeyIn;
          for (let i = 0; i < obstacleCount; i++) {
            const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

            // SỬA ĐỔI: Logic gán chìa khóa sử dụng currentNextKeyIn và setNextKeyIn
            const hasKey = (() => {
              currentNextKeyIn -= 1;
              if (currentNextKeyIn <= 0) {
                // Quan trọng: Cập nhật trạng thái nextKeyIn bằng setNextKeyIn
                // và giá trị mới này sẽ được sử dụng cho lần gọi scheduleNextObstacle tiếp theo.
                // Tuy nhiên, để đảm bảo các chướng ngại vật trong cùng một "đợt" này
                // không cùng lúc có chìa khóa nếu currentNextKeyIn về 0 ở giữa chừng,
                // chúng ta cần reset nó ngay lập tức cho logic của vòng lặp này.
                const newKeyValue = randomBetween(5, 10);
                setNextKeyIn(newKeyValue);
                currentNextKeyIn = newKeyValue; // Cập nhật biến cục bộ cho vòng lặp hiện tại
                return true;
              }
              // Cập nhật trạng thái nếu không reset
              setNextKeyIn(currentNextKeyIn);
              return false;
            })();

            newObstacles.push({
              id: Date.now() + i,
              position: 100 + (i * (Math.random() * 15 + 20)), // Tăng khoảng cách giữa các chướng ngại vật
              ...randomObstacleType,
              health: randomObstacleType.baseHealth,
              maxHealth: randomObstacleType.baseHealth,
              hasKey: hasKey,
            });
          }
      }

      setObstacles(prev => [...prev, ...newObstacles]);
      scheduleNextObstacle();
    }, randomTime);
  };

  // --- NEW: Lên lịch cho đồng xu tiếp theo xuất hiện ---
  const scheduleNextCoin = () => {
    if (gameOver || isStatsFullscreen) {
        if (coinScheduleTimerRef.current) {
            clearTimeout(coinScheduleTimerRef.current);
            coinScheduleTimerRef.current = null;
        }
        return;
    }

    const randomTime = Math.floor(Math.random() * 4000) + 1000; // Thời gian ngẫu nhiên từ 1-5 giây
    if (coinScheduleTimerRef.current) { // Xóa bộ đếm thời gian cũ trước khi đặt bộ đếm mới
        clearTimeout(coinScheduleTimerRef.current);
    }
    coinScheduleTimerRef.current = setTimeout(() => {
      const newCoin: GameCoin = {
        id: Date.now(),
        x: 110, // Bắt đầu từ ngoài màn hình bên phải
        y: Math.random() * 60, // Vị trí Y ngẫu nhiên (0-60%)
        initialSpeedX: Math.random() * 0.5 + 0.5, // Tốc độ X ban đầu
        initialSpeedY: Math.random() * 0.3, // Tốc độ Y ban đầu (hơi rơi xuống)
        attractSpeed: Math.random() * 0.05 + 0.03, // Tốc độ hút về nhân vật
        isAttracted: false // Ban đầu không bị hút
      };

      setActiveCoins(prev => [...prev, newCoin]);
      scheduleNextCoin(); // Lên lịch cho đồng xu tiếp theo
    }, randomTime);
  };


  // Xử lý hành động nhảy của nhân vật
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isStatsFullscreen) {
      setJumping(true);
      setCharacterPos(80); // Độ cao nhảy
      setTimeout(() => {
        if (gameStarted && !gameOver && !isStatsFullscreen) { // Kiểm tra lại trạng thái game
          setCharacterPos(0); // Quay lại mặt đất
          setTimeout(() => {
            setJumping(false);
          }, 100); // Thời gian ngắn để hoàn tất việc hạ cánh
        } else {
             // Nếu game đã kết thúc hoặc bị tạm dừng trong khi nhảy, vẫn hạ cánh
             setCharacterPos(0);
             setJumping(false);
        }
      }, 600); // Thời gian ở trên không
    }
  };

  // Xử lý chạm/nhấp vào khu vực game để bắt đầu hoặc nhảy
  const handleTap = () => {
    if (isStatsFullscreen || isLoadingUserData) return; // Bỏ qua nếu đang tải dữ liệu hoặc bảng chỉ số đang toàn màn hình

    if (!gameStarted) {
      startNewGame(); // Bắt đầu game mới nếu chưa bắt đầu
    } else if (gameOver) {
      startNewGame(); // Bắt đầu game mới nếu game over
    }
    // Logic nhảy được kích hoạt bằng phím hoặc nút nhảy riêng nếu bạn thêm vào
  };


  // Kích hoạt hiệu ứng sát thương thanh máu
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300); // Thời gian hiệu ứng
  };

  // Kích hoạt hiệu ứng sát thương nhân vật và số nổi
  const triggerCharacterDamageEffect = (amount: number) => {
      setDamageAmount(amount);
      setShowDamageNumber(true);

      setTimeout(() => {
          setShowDamageNumber(false);
      }, 800); // Thời gian hiển thị số sát thương
  };

  // --- NEW: Hàm để kích hoạt kỹ năng Khiên ---
  const activateShield = () => {
    if (!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData) { // Thêm kiểm tra isLoadingUserData
      console.log("Không thể kích hoạt Khiên:", { gameStarted, gameOver, isShieldActive, isShieldOnCooldown, isStatsFullscreen, isLoadingUserData });
      return;
    }

    console.log("Đang kích hoạt Khiên!");

    setIsShieldActive(true);
    setShieldHealth(SHIELD_MAX_HEALTH); // Đặt lại máu khiên

    setIsShieldOnCooldown(true);
    setRemainingCooldown(Math.ceil(SHIELD_COOLDOWN_TIME / 1000)); // Đặt thời gian hồi chiêu ban đầu (giây)

    const now = Date.now();
    setShieldCooldownStartTime(now);
    console.log(`Khiên được kích hoạt lúc: ${now}. Trạng thái shieldCooldownStartTime được đặt thành: ${now}`);


    setPausedShieldCooldownRemaining(null); // Xóa thời gian hồi chiêu còn lại đã tạm dừng

    // Đặt bộ đếm thời gian hồi chiêu chính
    if (shieldCooldownTimerRef.current) { // Xóa bộ đếm thời gian cũ
        clearTimeout(shieldCooldownTimerRef.current);
    }
    shieldCooldownTimerRef.current = setTimeout(() => {
        console.log("Thời gian hồi chiêu Khiên đã kết thúc.");
        setIsShieldOnCooldown(false);
        setRemainingCooldown(0);
        setShieldCooldownStartTime(null);
        setPausedShieldCooldownRemaining(null);
    }, SHIELD_COOLDOWN_TIME);

  };


  // Di chuyển chướng ngại vật, đám mây, hạt, và NEW: Đồng xu, và phát hiện va chạm
  // useEffect này là vòng lặp game chính cho việc di chuyển và phát hiện va chạm
  useEffect(() => {
    if (!gameStarted || gameOver || isStatsFullscreen || isLoadingUserData) { // Thêm kiểm tra isLoadingUserData
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null;
        }
        if (particleTimerRef.current) { // Dừng tạo hạt khi game không hoạt động
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
        return;
    }

    if (!gameLoopIntervalRef.current) { // Chỉ bắt đầu interval nếu chưa có
        gameLoopIntervalRef.current = setInterval(() => {
            const speed = 0.5; // Tốc độ di chuyển của chướng ngại vật

            // Cập nhật vị trí chướng ngại vật và phát hiện va chạm
            setObstacles(prevObstacles => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevObstacles; // Thoát nếu không có container game

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Tính toán kích thước và vị trí nhân vật bằng pixel
                const characterWidth_px = (24 / 4) * 16; // Giả sử kích thước cơ sở là 1rem = 16px, w-24 -> 6rem
                const characterHeight_px = (24 / 4) * 16; // h-24 -> 6rem
                const characterXPercent = 5; // Vị trí X của nhân vật (%)
                const characterX_px = (characterXPercent / 100) * gameWidth;

                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                // Tọa độ Y của nhân vật (tính từ đỉnh màn hình)
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx); // characterPos là độ cao so với mặt đất
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                // Tọa độ Y của đáy chướng ngại vật (tính từ đỉnh màn hình)
                const obstacleBottomFromTop_px = gameHeight - (GROUND_LEVEL_PERCENT / 100) * gameHeight;


                return prevObstacles
                    .map(obstacle => {
                        let newPosition = obstacle.position - speed; // Di chuyển chướng ngại vật

                        let collisionDetected = false;
                        // Tính toán vị trí X của chướng ngại vật bằng pixel
                        const obstacleX_px = (newPosition / 100) * gameWidth;

                        // Tính toán kích thước chướng ngại vật bằng pixel
                        let obstacleWidth_px, obstacleHeight_px;
                        // Giả sử kích thước cơ sở là 1rem = 16px
                        obstacleWidth_px = (obstacle.width / 4) * 16;
                        obstacleHeight_px = (obstacle.height / 4) * 16;

                        // Tọa độ Y của đỉnh chướng ngại vật (tính từ đỉnh màn hình)
                        const obstacleTopFromTop_px = obstacleBottomFromTop_px - obstacleHeight_px;

                        // Phát hiện va chạm (AABB - Axis-Aligned Bounding Box)
                        const collisionTolerance = 5; // Độ dung sai va chạm
                        if (
                            characterRight_px > obstacleX_px - collisionTolerance &&
                            characterLeft_px < obstacleX_px + obstacleWidth_px + collisionTolerance &&
                            characterBottomFromTop_px > obstacleTopFromTop_px - collisionTolerance && // Nhân vật ở trên đáy chướng ngại vật
                            characterTopFromTop_px < obstacleBottomFromTop_px + collisionTolerance    // Nhân vật ở dưới đỉnh chướng ngại vật
                        ) {
                            collisionDetected = true;
                            if (isShieldActive) {
                                setShieldHealth(prev => {
                                    const damageToShield = obstacle.damage;
                                    const newShieldHealth = Math.max(0, prev - damageToShield);
                                    if (newShieldHealth <= 0) {
                                        console.log("Máu khiên đã cạn.");
                                        setIsShieldActive(false); // Tắt khiên nếu hết máu
                                    }
                                    return newShieldHealth;
                                });
                            } else {
                                const damageTaken = obstacle.damage;
                                setHealth(prev => Math.max(0, prev - damageTaken));
                                triggerHealthDamageEffect(); // Kích hoạt hiệu ứng thanh máu
                                triggerCharacterDamageEffect(damageTaken); // Kích hoạt hiệu ứng số sát thương
                            }
                        }

                        // Xử lý chướng ngại vật đi ra khỏi màn hình và tái tạo
                        if (newPosition < -20 && !collisionDetected) { // Nếu chướng ngại vật ra khỏi màn hình và không va chạm
                            if (Math.random() < 0.7) { // 70% cơ hội tái tạo
                                if (obstacleTypes.length === 0) return obstacle; // Không có loại chướng ngại vật để tái tạo

                                const randomObstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                                const randomOffset = Math.floor(Math.random() * 20); // Offset ngẫu nhiên

                                // SỬA ĐỔI: Logic gán chìa khóa khi tái tạo chướng ngại vật
                                let currentNextKeyIn = nextKeyIn;
                                const hasKey = (() => {
                                  currentNextKeyIn -= 1;
                                  if (currentNextKeyIn <= 0) {
                                    setNextKeyIn(randomBetween(5, 10));
                                    return true;
                                  }
                                  setNextKeyIn(currentNextKeyIn);
                                  return false;
                                })();

                                return {
                                    ...obstacle,
                                    ...randomObstacleType,
                                    id: Date.now(), // ID mới
                                    position: 120 + randomOffset, // Vị trí mới ngoài màn hình bên phải
                                    health: randomObstacleType.baseHealth, // Reset máu
                                    maxHealth: randomObstacleType.baseHealth,
                                    hasKey: hasKey, // Gán chìa khóa nếu có
                                };
                            } else {
                                // Nếu không tái tạo, giữ nguyên vị trí để bị lọc ra sau
                                return { ...obstacle, position: newPosition };
                            }
                        }

                        // Nếu va chạm, đánh dấu để xóa
                        if (collisionDetected) {
                            if (obstacle.hasKey) {
                                handleKeyCollect(1); // Gọi handleKeyCollect khi chướng ngại vật có chìa khóa bị va chạm
                            }
                            return { ...obstacle, position: newPosition, collided: true }; // Đánh dấu đã va chạm
                        }

                        return { ...obstacle, position: newPosition };
                    })
                    .filter(obstacle => { // Lọc bỏ chướng ngại vật đã va chạm, ra khỏi màn hình hoặc hết máu
                        return !obstacle.collided && obstacle.position > -20 && obstacle.health > 0;
                    });
            });

            // Cập nhật vị trí đám mây
            setClouds(prevClouds => {
                return prevClouds
                    .map(cloud => {
                        const newX = cloud.x - cloud.speed; // Di chuyển đám mây

                        // Nếu đám mây ra khỏi màn hình, tái tạo nó
                        if (newX < -50) { // -50 để đảm bảo đám mây hoàn toàn ra khỏi màn hình
                            const randomImgSrc = cloudImageUrls[Math.floor(Math.random() * cloudImageUrls.length)];
                            return {
                                ...cloud,
                                id: Date.now() + Math.random(), // ID mới
                                x: 120 + Math.random() * 30, // Vị trí X mới (ngoài màn hình bên phải)
                                y: Math.random() * 40 + 10, // Vị trí Y ngẫu nhiên
                                size: Math.random() * 40 + 30, // Kích thước ngẫu nhiên
                                speed: Math.random() * 0.3 + 0.15, // Tốc độ ngẫu nhiên
                                imgSrc: randomImgSrc // Ảnh ngẫu nhiên
                            };
                        }

                        return { ...cloud, x: newX };
                    });
            });

            // Cập nhật vị trí và độ mờ của hạt
            setParticles(prevParticles =>
                prevParticles
                    .map(particle => ({
                        ...particle,
                        x: particle.x + particle.xVelocity,
                        y: particle.y + particle.yVelocity,
                        opacity: particle.opacity - 0.03, // Giảm độ mờ dần
                        size: particle.size - 0.1 // Giảm kích thước dần (nếu có)
                    }))
                    .filter(particle => particle.opacity > 0 && particle.size > 0) // Lọc bỏ hạt đã mờ hẳn hoặc quá nhỏ
            );

            // --- NEW: Di chuyển đồng xu và phát hiện va chạm ---
            setActiveCoins(prevCoins => {
                const gameContainer = gameRef.current;
                if (!gameContainer) return prevCoins;

                const gameWidth = gameContainer.offsetWidth;
                const gameHeight = gameContainer.offsetHeight;

                // Kích thước và vị trí nhân vật (tương tự như trong logic chướng ngại vật)
                const characterWidth_px = (24 / 4) * 16;
                const characterHeight_px = (24 / 4) * 16;
                const characterXPercent = 5;
                const characterX_px = (characterXPercent / 100) * gameWidth;
                const groundLevelPx = (GROUND_LEVEL_PERCENT / 100) * gameHeight;
                const characterBottomFromTop_px = gameHeight - (characterPos + groundLevelPx);
                const characterTopFromTop_px = characterBottomFromTop_px - characterHeight_px;
                const characterLeft_px = characterX_px;
                const characterRight_px = characterX_px + characterWidth_px;

                // Tâm nhân vật
                const characterCenterX_px = characterLeft_px + characterWidth_px / 2;
                const characterCenterY_px = characterTopFromTop_px + characterHeight_px / 2;


                return prevCoins
                    .map(coin => {
                        const coinSize_px = 40; // Kích thước đồng xu (giả sử)

                        // Vị trí đồng xu bằng pixel
                        const coinX_px = (coin.x / 100) * gameWidth;
                        const coinY_px = (coin.y / 100) * gameHeight;

                        let newX = coin.x;
                        let newY = coin.y;
                        let collisionDetected = false;
                        let shouldBeAttracted = coin.isAttracted; // Giữ trạng thái hút hiện tại


                        // Kiểm tra va chạm ban đầu để bắt đầu hút (nếu chưa bị hút)
                        if (!shouldBeAttracted) {
                            if (
                                characterRight_px > coinX_px &&
                                characterLeft_px < coinX_px + coinSize_px &&
                                characterBottomFromTop_px > coinY_px &&
                                characterTopFromTop_px < coinY_px + coinSize_px
                            ) {
                                shouldBeAttracted = true; // Bắt đầu hút
                            }
                        }


                        if (shouldBeAttracted) {
                            // Di chuyển đồng xu về phía tâm nhân vật
                            const dx = characterCenterX_px - coinX_px;
                            const dy = characterCenterY_px - coinY_px;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            const moveStep = distance * coin.attractSpeed; // Bước di chuyển tỷ lệ với khoảng cách

                            // Thành phần di chuyển
                            const moveX_px = distance === 0 ? 0 : (dx / distance) * moveStep;
                            const moveY_px = distance === 0 ? 0 : (dy / distance) * moveStep;

                            // Vị trí mới của đồng xu (pixel)
                            const newCoinX_px = coinX_px + moveX_px;
                            const newCoinY_px = coinY_px + moveY_px;

                            // Chuyển đổi lại sang %
                            newX = (newCoinX_px / gameWidth) * 100;
                            newY = (newCoinY_px / gameHeight) * 100;

                            // Phát hiện va chạm cuối cùng (khi đồng xu đủ gần nhân vật)
                            if (distance < (characterWidth_px / 2 + coinSize_px / 2) * 0.8) { // 0.8 là hệ số để va chạm sớm hơn một chút
                                collisionDetected = true;
                                const awardedCoins = Math.floor(Math.random() * 5) + 1; // Phần thưởng ngẫu nhiên 1-5 coin
                                console.log(`Đồng xu đã thu thập! Phần thưởng: ${awardedCoins}. Gọi startCoinCountAnimation.`); // Debug Log 1
                                startCoinCountAnimation(awardedCoins); // Kích hoạt animation và cập nhật Firestore

                                console.log(`Đồng xu đã thu thập! Phần thưởng: ${awardedCoins}`);
                            }

                        } else {
                            // Nếu không bị hút, di chuyển theo tốc độ ban đầu
                            newX = coin.x - coin.initialSpeedX; // Di chuyển sang trái
                            newY = coin.y + coin.initialSpeedY; // Hơi rơi xuống
                        }

                        return {
                            ...coin,
                            x: newX,
                            y: newY,
                            isAttracted: shouldBeAttracted, // Cập nhật trạng thái hút
                            collided: collisionDetected // Đánh dấu đã va chạm
                        };
                    })
                    .filter(coin => { // Lọc bỏ đồng xu đã va chạm hoặc ra khỏi màn hình
                        const isOffScreen = coin.x < -20 || coin.y > 120; // Ngoài biên trái hoặc dưới
                        return !coin.collided && !isOffScreen;
                    });
            });


        }, 30); // Tần suất cập nhật game (khoảng 33 FPS)
    }

    // Dọn dẹp interval khi component unmount hoặc các dependencies thay đổi
    return () => {
        if (gameLoopIntervalRef.current) {
            clearInterval(gameLoopIntervalRef.current);
            gameLoopIntervalRef.current = null; // Quan trọng: reset ref
        }
        if (particleTimerRef.current) { // Dừng tạo hạt
            clearInterval(particleTimerRef.current);
            particleTimerRef.current = null;
        }
    };
  }, [gameStarted, gameOver, jumping, characterPos, obstacles, activeCoins, isShieldActive, isStatsFullscreen, coins, isLoadingUserData, health, shieldHealth, nextKeyIn, GROUND_LEVEL_PERCENT, setHealth, setShieldHealth, setIsShieldActive, setObstacles, setActiveCoins, setParticles, setClouds, setNextKeyIn]); // Thêm các dependencies cần thiết


  // Effect để quản lý các bộ đếm thời gian lên lịch chướng ngại vật và coin dựa trên trạng thái game và toàn màn hình
  useEffect(() => {
      if (gameOver || isStatsFullscreen || isLoadingUserData) { // Thêm kiểm tra isLoadingUserData
          // Dừng các bộ đếm thời gian nếu game over, toàn màn hình hoặc đang tải
          if (obstacleTimerRef.current) {
              clearTimeout(obstacleTimerRef.current);
              obstacleTimerRef.current = null;
          }
          if (coinScheduleTimerRef.current) {
              clearTimeout(coinScheduleTimerRef.current);
              coinScheduleTimerRef.current = null;
          }
           if (particleTimerRef.current) { // Dừng tạo hạt
               clearInterval(particleTimerRef.current);
               particleTimerRef.current = null;
           }
      } else if (gameStarted && !gameOver && !isStatsFullscreen && !isLoadingUserData) { // Thêm kiểm tra isLoadingUserData
          // Bắt đầu/tiếp tục các bộ đếm thời gian nếu game đang chạy và không toàn màn hình, không tải
          if (!obstacleTimerRef.current) { // Chỉ bắt đầu nếu chưa có
              scheduleNextObstacle();
          }
          if (!coinScheduleTimerRef.current) { // Chỉ bắt đầu nếu chưa có
              scheduleNextCoin();
          }
           if (!particleTimerRef.current) { // Chỉ bắt đầu nếu chưa có
               particleTimerRef.current = setInterval(generateParticles, 300);
           }
      }

      // Dọn dẹp khi component unmount hoặc dependencies thay đổi
      return () => {
          if (obstacleTimerRef.current) {
              clearTimeout(obstacleTimerRef.current);
              obstacleTimerRef.current = null;
          }
          if (coinScheduleTimerRef.current) {
              clearTimeout(coinScheduleTimerRef.current);
              coinScheduleTimerRef.current = null;
          }
           if (particleTimerRef.current) {
               clearInterval(particleTimerRef.current);
               particleTimerRef.current = null;
           }
      };
  }, [gameStarted, gameOver, isStatsFullscreen, isLoadingUserData]); // Dependencies bao gồm trạng thái tải

  // *** MODIFIED Effect: Quản lý hiển thị đếm ngược hồi chiêu khiên VÀ tạm dừng/tiếp tục bộ đếm thời gian hồi chiêu chính ***
  useEffect(() => {
      let countdownInterval: NodeJS.Timeout | null = null;

      // SỬA ĐỔI: Sử dụng trực tiếp các biến trạng thái
      console.log("Effect Hồi chiêu Khiên đang chạy:", {
          isShieldOnCooldown,
          gameOver,
          isStatsFullscreen,
          isLoadingUserData,
          gameStarted,
          shieldCooldownStartTime, // Sử dụng biến trạng thái
          pausedShieldCooldownRemaining, // Sử dụng biến trạng thái
          currentCooldownTimer: !!shieldCooldownTimerRef.current,
          currentCountdownTimer: !!cooldownCountdownTimerRef.current
      });


      // Xóa các bộ đếm thời gian nếu game không hoạt động hoặc bị tạm dừng
      if (isStatsFullscreen || isLoadingUserData || gameOver || !gameStarted) {
          console.log("Game không hoạt động hoặc bị tạm dừng. Đang xóa các bộ đếm thời gian khiên.");
          // Tạm dừng bộ đếm thời gian hồi chiêu chính nếu đang chạy
          if (shieldCooldownTimerRef.current && shieldCooldownStartTime !== null) { // Kiểm tra null trước khi tính thời gian còn lại
              const elapsedTime = Date.now() - shieldCooldownStartTime;
              const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
              setPausedShieldCooldownRemaining(remainingTimeMs);
              clearTimeout(shieldCooldownTimerRef.current);
              shieldCooldownTimerRef.current = null;
              console.log(`Hồi chiêu chính của khiên ĐÃ TẠM DỪNG với ${remainingTimeMs}ms còn lại.`);
          }

          // Tạm dừng bộ đếm thời gian hiển thị đếm ngược nếu đang chạy
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Đếm ngược hiển thị khiên ĐÃ TẠM DỪNG.");
          }
      } else if (isShieldOnCooldown) { // Bắt đầu/tiếp tục đếm ngược nếu khiên đang hồi chiêu và game đang hoạt động
           console.log("Khiên đang hồi chiêu và game đang hoạt động.");
           // Tiếp tục bộ đếm thời gian hồi chiêu chính nếu đã bị tạm dừng
           if (pausedShieldCooldownRemaining !== null && pausedShieldCooldownRemaining > 0) {
               const remainingTimeToResume = pausedShieldCooldownRemaining;
               console.log(`Tiếp tục hồi chiêu chính của khiên với ${remainingTimeToResume}ms.`);
               shieldCooldownTimerRef.current = setTimeout(() => {
                   console.log("Thời gian hồi chiêu Khiên đã kết thúc (sau khi tạm dừng).");
                   setIsShieldOnCooldown(false);
                   setRemainingCooldown(0);
                   setShieldCooldownStartTime(null);
                   setPausedShieldCooldownRemaining(null);
               }, remainingTimeToResume);

               // Điều chỉnh thời gian bắt đầu để phản ánh trạng thái tiếp tục
               setShieldCooldownStartTime(Date.now() - (SHIELD_COOLDOWN_TIME - remainingTimeToResume));
               setPausedShieldCooldownRemaining(null); // Xóa thời gian còn lại đã tạm dừng

               // Bắt đầu hiển thị đếm ngược ngay khi tiếp tục
               const initialRemainingSeconds = Math.ceil(remainingTimeToResume / 1000);
               setRemainingCooldown(initialRemainingSeconds);
               if (cooldownCountdownTimerRef.current === null) { // Chỉ bắt đầu nếu chưa chạy
                   console.log(`Bắt đầu hiển thị đếm ngược khiên khi tiếp tục với ${initialRemainingSeconds}s.`);
                   countdownInterval = setInterval(() => {
                       setRemainingCooldown(prev => {
                           const newRemaining = Math.max(0, prev - 1);
                           if (newRemaining === 0) {
                               if(countdownInterval) clearInterval(countdownInterval); // Quan trọng: kiểm tra countdownInterval trước khi xóa
                               cooldownCountdownTimerRef.current = null;
                               console.log("Hiển thị đếm ngược khiên đã kết thúc.");
                           }
                           return newRemaining;
                       });
                   }, 1000); // Cập nhật mỗi 1 giây
                   cooldownCountdownTimerRef.current = countdownInterval;
               }


           } else if (shieldCooldownStartTime !== null) { // Nếu không bị tạm dừng, đảm bảo bộ đếm thời gian chính đang chạy (nên được đặt trong activateShield)
               // Khối này chủ yếu để đảm bảo hiển thị đếm ngược bắt đầu nếu chưa có
               if (cooldownCountdownTimerRef.current === null) { // Chỉ bắt đầu hiển thị đếm ngược nếu chưa chạy
                    const now = Date.now();
                    const elapsedTime = now - shieldCooldownStartTime;
                    const remainingTimeMs = Math.max(0, SHIELD_COOLDOWN_TIME - elapsedTime);
                    const initialRemainingSeconds = Math.ceil(remainingTimeMs / 1000);

                    console.log(`Tính toán thời gian hồi chiêu còn lại: now=${now}, startTime=${shieldCooldownStartTime}, elapsedTime=${elapsedTime}, remainingMs=${remainingTimeMs}, initialSeconds=${initialRemainingSeconds}`);


                    if (initialRemainingSeconds > 0) {
                        console.log(`Bắt đầu hiển thị đếm ngược khiên từ thời gian bắt đầu với ${initialRemainingSeconds}s.`);
                         setRemainingCooldown(initialRemainingSeconds);
                         countdownInterval = setInterval(() => {
                             setRemainingCooldown(prev => {
                                 const newRemaining = Math.max(0, prev - 1);
                                 if (newRemaining === 0) {
                                     if(countdownInterval) clearInterval(countdownInterval);
                                     cooldownCountdownTimerRef.current = null;
                                     console.log("Hiển thị đếm ngược khiên đã kết thúc.");
                                 }
                                 return newRemaining;
                             });
                         }, 1000); // Cập nhật mỗi 1 giây
                         cooldownCountdownTimerRef.current = countdownInterval;
                    } else {
                         // Nếu thời gian còn lại là 0 hoặc ít hơn, hồi chiêu nên kết thúc
                         setIsShieldOnCooldown(false);
                         setRemainingCooldown(0);
                         setShieldCooldownStartTime(null);
                         setPausedShieldCooldownRemaining(null);
                         console.log("Thời gian hồi chiêu Khiên đã kết thúc dựa trên thời gian bắt đầu.");
                    }

               }
           } else {
                // Xử lý rõ ràng trường hợp shieldCooldownStartTime là null/undefined
                console.warn("Khiên đang hồi chiêu nhưng shieldCooldownStartTime là null/undefined. Điều này không nên xảy ra nếu activateShield chạy đúng.");
                // Có thể reset trạng thái hồi chiêu ở đây nếu trạng thái này không hợp lệ
                setIsShieldOnCooldown(false);
                setRemainingCooldown(0);
                setShieldCooldownStartTime(null);
                setPausedShieldCooldownRemaining(null);
           }
      } else {
          // Nếu khiên KHÔNG đang hồi chiêu, đảm bảo hiển thị đếm ngược bị dừng và reset
          if (cooldownCountdownTimerRef.current) {
              clearInterval(cooldownCountdownTimerRef.current);
              cooldownCountdownTimerRef.current = null;
              console.log("Khiên không đang hồi chiêu. Đang dừng hiển thị đếm ngược.");
          }
          if (remainingCooldown !== 0) { // Reset nếu chưa phải là 0
              setRemainingCooldown(0);
          }
      }


      // Hàm dọn dẹp để xóa interval khi effect chạy lại hoặc component unmount
      return () => {
          console.log("Dọn dẹp Effect Hồi chiêu Khiên.");
          if (countdownInterval) {
              clearInterval(countdownInterval);
              console.log("Dọn dẹp: Đã xóa countdownInterval.");
          }
          // Lưu ý: shieldCooldownTimerRef chính được quản lý trong logic của effect,
          // xóa nó ở đây trong phần dọn dẹp có thể gây nhiễu logic tạm dừng/tiếp tục.
          // Chúng ta dựa vào logic nội bộ của effect để xóa shieldCooldownTimerRef.
      };

  }, [isShieldOnCooldown, gameOver, isStatsFullscreen, isLoadingUserData, shieldCooldownStartTime, pausedShieldCooldownRemaining, gameStarted, SHIELD_COOLDOWN_TIME, setIsShieldOnCooldown, setRemainingCooldown, setShieldCooldownStartTime, setPausedShieldCooldownRemaining]); // Dependencies được cập nhật để sử dụng biến trạng thái


  // Effect để dọn dẹp tất cả các bộ đếm thời gian khi component unmount
  useEffect(() => {
    return () => {
      console.log("Component đang unmount. Đang xóa tất cả các bộ đếm thời gian.");
      if(obstacleTimerRef.current) clearTimeout(obstacleTimerRef.current);
      if(runAnimationRef.current) clearInterval(runAnimationRef.current);
      if(particleTimerRef.current) clearInterval(particleTimerRef.current);
      if(shieldCooldownTimerRef.current) clearTimeout(shieldCooldownTimerRef.current);
      if(cooldownCountdownTimerRef.current) clearInterval(cooldownCountdownTimerRef.current);
      if(coinScheduleTimerRef.current) clearInterval(coinScheduleTimerRef.current);
      if(coinCountAnimationTimerRef.current) clearInterval(coinCountAnimationTimerRef.current);

      if (gameLoopIntervalRef.current) {
          clearInterval(gameLoopIntervalRef.current);
      }
      console.log("Tất cả các bộ đếm thời gian đã được xóa khi unmount.");
    };
  }, []);

    // Effect cho animation bộ đếm coin
  useEffect(() => {
    // Chỉ kích hoạt animation nếu coin hiển thị cần bắt kịp trạng thái coin thực tế
    if (displayedCoins === coins) return;

    const coinElement = document.querySelector('.coin-counter');
    if (coinElement) {
      coinElement.classList.add('number-changing');
      const animationEndHandler = () => {
        coinElement.classList.remove('number-changing');
        coinElement.removeEventListener('animationend', animationEndHandler);
      };
      coinElement.addEventListener('animationend', animationEndHandler);

      // Dọn dẹp event listener
      return () => {
        if (coinElement) { // Kiểm tra lại coinElement trước khi xóa listener
            coinElement.removeEventListener('animationend', animationEndHandler);
             coinElement.classList.remove('number-changing'); // Đảm bảo xóa class nếu component unmount giữa chừng
        }
      };
    }
     return () => {}; // Trả về hàm rỗng nếu không có coinElement
  }, [displayedCoins, coins]); // Phụ thuộc vào cả displayedCoins và trạng thái coins


  // Tính toán phần trăm máu cho thanh máu
  const healthPct = health / MAX_HEALTH;

  // Xác định màu thanh máu dựa trên phần trăm máu
  const getColor = () => {
    if (healthPct > 0.6) return 'bg-green-500';
    if (healthPct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // NEW: Tính toán phần trăm máu khiên
  const shieldHealthPct = isShieldActive ? shieldHealth / SHIELD_MAX_HEALTH : 0;


  // Render nhân vật với animation và hiệu ứng sát thương
  const renderCharacter = () => {
    return (
      <div
        className="character-container absolute w-24 h-24 transition-all duration-300 ease-out" // Container cho nhân vật
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`, // Vị trí Y của nhân vật
          left: '5%', // Vị trí X của nhân vật
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)' // Hiệu ứng chuyển động khi nhảy
        }}
      >
        <DotLottieReact
          src="https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie" // Nguồn animation Lottie
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData} // Tự động phát khi game không toàn màn hình và không tải
          className="w-full h-full" // Kích thước Lottie
        />
      </div>
    );
  };

  // Render chướng ngại vật dựa trên loại của chúng
  const renderObstacle = (obstacle: GameObstacle) => {
    let obstacleEl; // Phần tử chướng ngại vật sẽ được render

    // Kích thước chướng ngại vật bằng pixel (giả sử 1rem = 16px)
    const obstacleWidthPx = (obstacle.width / 4) * 16;
    const obstacleHeightPx = (obstacle.height / 4) * 16;


    switch(obstacle.type) {
      // Các trường hợp cho các loại chướng ngại vật khác nhau
      case 'rock': // Ví dụ: chướng ngại vật đá
        obstacleEl = (
          <div className={`w-${obstacle.width} h-${obstacle.height} bg-gradient-to-br ${obstacle.color} rounded-lg`}>
            {/* Các chi tiết trang trí cho đá */}
            <div className="w-2 h-1 bg-gray-600 rounded-full absolute top-1 left-0.5"></div>
            <div className="w-1.5 h-0.5 bg-gray-600 rounded-full absolute top-3 right-1"></div>
          </div>
        );
        break;
      case 'lottie-obstacle-1': // Chướng ngại vật Lottie loại 1
        obstacleEl = (
          <div
            className="relative" // Để định vị Lottie bên trong
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && ( // Chỉ render nếu có nguồn Lottie
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData} // Tự động phát
                className="w-full h-full"
              />
            )}
          </div>
        );
        break;
      case 'lottie-obstacle-2': // Chướng ngại vật Lottie loại 2
        obstacleEl = (
          <div
            className="relative"
            style={{ width: `${obstacleWidthPx}px`, height: `${obstacleHeightPx}px` }}
          >
            {obstacle.lottieSrc && (
              <DotLottieReact
                src={obstacle.lottieSrc}
                loop
                autoplay={!isStatsFullscreen && !isLoadingUserData}
                className="w-full h-full"
              />
              )}
          </div>
        );
        break;
      default: // Chướng ngại vật mặc định
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color} rounded`}></div>
        );
    }

    // Phần trăm máu của chướng ngại vật
    const obstacleHealthPct = obstacle.health / obstacle.maxHealth;

    return (
      <div
        key={obstacle.id} // Key duy nhất cho mỗi chướng ngại vật
        className="absolute" // Định vị tuyệt đối
        style={{
          bottom: `${GROUND_LEVEL_PERCENT}%`, // Vị trí Y (trên mặt đất)
          left: `${obstacle.position}%` // Vị trí X
        }}
      >
        {/* Thanh máu của chướng ngại vật */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-12 h-2 bg-gray-800 rounded-full overflow-visible border border-gray-600 shadow-sm relative">
            <div
                className={`h-full ${obstacleHealthPct > 0.6 ? 'bg-green-500' : obstacleHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                style={{ width: `${obstacleHealthPct * 100}%` }} // Chiều rộng thanh máu
            ></div>

             {/* Hiển thị biểu tượng chìa khóa nếu chướng ngại vật có chìa khóa */}
            {obstacle.hasKey && (
              <img
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png" // Nguồn ảnh chìa khóa
                alt="Chìa khóa"
                className="absolute w-4 h-4" // Kích thước chìa khóa
                style={{
                    bottom: 'calc(100% + 4px)', // Vị trí phía trên thanh máu
                    left: '50%',
                    transform: 'translateX(-50%)', // Căn giữa
                }}
              />
            )}
        </div>

        {obstacleEl} {/* Render phần tử chướng ngại vật */}
      </div>
    );
  };

  // Render đám mây
  const renderClouds = () => {
    return clouds.map(cloud => (
      <img
        key={cloud.id}
        src={cloud.imgSrc} // Nguồn ảnh đám mây
        alt="Biểu tượng Đám mây"
        className="absolute object-contain" // Đảm bảo ảnh vừa vặn
        style={{
          width: `${cloud.size}px`, // Kích thước đám mây
          height: `${cloud.size * 0.6}px`, // Chiều cao tỷ lệ
          top: `${cloud.y}%`, // Vị trí Y
          left: `${cloud.x}%`, // Vị trí X
          opacity: 0.8 // Độ mờ
        }}
        onError={(e) => { // Xử lý lỗi tải ảnh
          const target = e as any;
          target.onerror = null;
          target.src = "https://placehold.co/40x24/ffffff/000000?text=Cloud"; // Ảnh thay thế
        }}
      />
    ));
  };

  // Render hạt bụi
  const renderParticles = () => {
    return particles.map(particle => (
      <div
        key={particle.id}
        className={`absolute rounded-full ${particle.color}`} // Màu hạt
        style={{
          width: `${particle.size}px`, // Kích thước hạt
          height: `${particle.size}px`,
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`, // Vị trí Y (trên mặt đất)
          left: `calc(5% + ${particle.x}px)`, // Vị trí X (gần nhân vật)
          opacity: particle.opacity // Độ mờ
        }}
      ></div>
    ));
  };

  // --- NEW: Render Khiên ---
  const renderShield = () => {
    if (!isShieldActive) return null; // Không render nếu khiên không hoạt động

    const shieldSizePx = 80; // Kích thước khiên (pixel)

    return (
      <div
        key="character-shield" // Key cho khiên
        className="absolute w-20 h-20 flex flex-col items-center justify-center pointer-events-none z-20" // Container khiên
         style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px + 96px)`, // Vị trí Y (quanh nhân vật, hơi cao hơn)
          left: '13%', // Vị trí X (quanh nhân vật)
          transform: 'translate(-50%, -50%)', // Căn giữa khiên
          transition: 'bottom 0.3s ease-out, left 0.3s ease-out', // Hiệu ứng chuyển động
          width: `${shieldSizePx}px`, // Kích thước khiên
          height: `${shieldSizePx}px`,
        }}
      >
        {/* Thanh máu của khiên */}
        {shieldHealth > 0 && ( // Chỉ hiển thị nếu máu khiên > 0
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-sm mb-1">
                <div
                    className={`h-full ${shieldHealthPct > 0.6 ? 'bg-green-500' : shieldHealthPct > 0.3 ? 'bg-yellow-500' : 'bg-red-500'} transform origin-left transition-transform duration-200 ease-linear`}
                    style={{ width: `${shieldHealthPct * 100}%` }} // Chiều rộng thanh máu khiên
                ></div>
            </div>
        )}

        {/* Animation Lottie cho khiên */}
        <DotLottieReact
          src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
          loop
          autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData} // Tự động phát khi khiên hoạt động
          className="w-full h-full"
        />
      </div>
    );
  };


  // --- NEW: Render Đồng xu ---
  const renderCoins = () => {
    return activeCoins.map(coin => (
      <div
        key={coin.id} // Key duy nhất cho mỗi đồng xu
        className="absolute w-10 h-10" // Kích thước container đồng xu
        style={{
          top: `${coin.y}%`, // Vị trí Y
          left: `${coin.x}%`, // Vị trí X
          transform: 'translate(-50%, -50%)', // Căn giữa đồng xu
          pointerEvents: 'none' // Không bắt sự kiện chuột
        }}
      >
        {/* Animation Lottie cho đồng xu */}
        <DotLottieReact
          src="https://lottie.host/9a6ca3bb-cc97-4e95-ba15-3f67db78868c/i88e6svjxV.lottie"
          loop
          autoplay={!isStatsFullscreen && !isLoadingUserData} // Tự động phát
          className="w-full h-full"
        />
      </div>
    ));
  };


  // NEW: Hàm để bật/tắt toàn màn hình bảng chỉ số
  const toggleStatsFullscreen = () => {
    if (gameOver || isLoadingUserData) return; // Ngăn mở nếu game over hoặc đang tải dữ liệu

    setIsStatsFullscreen(prev => {
        const newState = !prev;
        if (newState) { // Nếu chuyển sang toàn màn hình
            hideNavBar(); // Ẩn thanh điều hướng
        } else { // Nếu thoát toàn màn hình
            showNavBar(); // Hiện thanh điều hướng
        }
        return newState;
    });
  };

  // Hiển thị chỉ báo tải nếu đang lấy dữ liệu người dùng
  if (isLoadingUserData) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* CSS nội bộ cho các animation và hiệu ứng */}
      <style>{`
        @keyframes fadeOutUp { /* Animation cho số sát thương nổi lên và mờ dần */
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
        }
        .animate-fadeOutUp {
          animation: fadeOutUp 0.5s ease-out forwards;
        }
        @keyframes pulse-subtle { /* Animation nhấp nháy nhẹ */
          0%, 100% { opacity: 0.8; box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
        }
        @keyframes bounce-subtle { /* Animation nảy nhẹ */
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse-button { /* Animation nhấp nháy cho nút */
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .add-button-pulse { animation: pulse-button 1.5s infinite; }
        @keyframes number-change { /* Animation khi số thay đổi (ví dụ: coin) */
          0% { color: #FFD700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); transform: scale(1.1); }
          100% { color: #fff; text-shadow: none; transform: scale(1); }
        }
        .number-changing { animation: number-change 0.3s ease-out; }
         @keyframes pulse-fast { /* Animation nhấp nháy nhanh */
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }

        @keyframes pulse { /* Animation nhấp nháy cho hiệu ứng thanh máu */
          0% { opacity: 0; }
          50% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        @keyframes floatUp { /* Animation nổi lên cho số sát thương */
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -20px); opacity: 0; }
        }

        /* NEW: Hiệu ứng viền bóng kính (Giảm cường độ) */
        .glass-shadow-border {
            box-shadow:
                0 2px 4px rgba(0, 0, 0, 0.4), /* Giảm độ lan và độ mờ */
                0 4px 8px rgba(0, 0, 0, 0.3), /* Giảm độ lan và độ mờ */
                inset 0 -1px 2px rgba(255, 255, 255, 0.15); /* Giảm độ nổi bật bên trong */
        }

      `}</style>
       {/* CSS toàn cục để ẩn thanh cuộn body */}
       <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>


      {/* Hiển thị bảng chỉ số toàn màn hình hoặc game */}
      {isStatsFullscreen ? (
        <ErrorBoundary fallback={<div className="text-center p-4 bg-red-900 text-white rounded-lg">Lỗi hiển thị bảng chỉ số!</div>}>
            {/* Truyền coin và updateCoinsInFirestore vào CharacterCard */}
            {auth.currentUser && ( // Chỉ render nếu có người dùng hiện tại
                <CharacterCard
                    onClose={toggleStatsFullscreen} // Hàm để đóng bảng chỉ số
                    coins={coins} // Truyền trạng thái coin
                    onUpdateCoins={(amount) => updateCoinsInFirestore(auth.currentUser!.uid, amount)} // Truyền hàm cập nhật coin
                />
            )}
        </ErrorBoundary>
      ) : (
        // Container game chính
        <div
          ref={gameRef} // Ref cho container game
          className={`${className ?? ''} relative w-full h-screen rounded-lg overflow-hidden shadow-2xl`} // Class Tailwind
          onClick={handleTap} // Xử lý chạm để bắt đầu/khởi động lại
        >
          {/* Nền game */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600"></div> {/* Bầu trời */}

          {/* Mặt trời/Mặt trăng (trang trí) */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10"></div>

          {/* Render các đám mây */}
          {renderClouds()}

          {/* Mặt đất */}
          <div className="absolute bottom-0 w-full" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}> {/* Chiều cao mặt đất */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-600"> {/* Màu mặt đất */}
                  {/* Các chi tiết trang trí trên mặt đất */}
                  <div className="w-full h-1 bg-gray-900 absolute top-0"></div>
                  <div className="w-3 h-3 bg-gray-900 rounded-full absolute top-6 left-20"></div>
                  <div className="w-4 h-2 bg-gray-900 rounded-full absolute top-10 left-40"></div>
                  <div className="w-6 h-3 bg-gray-900 rounded-full absolute top-8 right-10"></div>
                  <div className="w-3 h-1 bg-gray-900 rounded-full absolute top-12 right-32"></div>
              </div>
          </div>

          {/* Render nhân vật */}
          {renderCharacter()}

          {/* Render khiên (nếu có) */}
          {renderShield()}

          {/* Render các chướng ngại vật */}
          {obstacles.map(obstacle => renderObstacle(obstacle))}

          {/* Render các đồng xu */}
          {renderCoins()}

          {/* Render các hạt bụi */}
          {renderParticles()}

          {/* Thanh thông tin trên cùng (máu, coin, gem) */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-black bg-opacity-60 shadow-lg z-30 glass-shadow-border"> {/* Áp dụng class viền bóng kính mới */}
            {/* Phần bên trái: Nút chỉ số và thanh máu */}
            <div className="flex items-center">
                {/* Biểu tượng Chỉ số */}
                <div
                  className="relative mr-2 cursor-pointer w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={toggleStatsFullscreen} // Mở/đóng bảng chỉ số
                  title="Xem chỉ số nhân vật"
                >
                     <img
                        src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/award.png" // Nguồn ảnh biểu tượng
                        alt="Biểu tượng Phần thưởng"
                        className="w-full h-full object-contain" // Đảm bảo ảnh vừa vặn
                         onError={(e) => { // Xử lý lỗi tải ảnh
                            const target = e as any;
                            target.onerror = null;
                            target.src = "https://placehold.co/32x32/ffffff/000000?text=Stats"; // Ảnh thay thế
                        }}
                      />
                </div>

                {/* Thanh máu */}
                <div className="w-32 relative"> {/* Container thanh máu */}
                    <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-md overflow-hidden border border-gray-600 shadow-inner"> {/* Nền thanh máu */}
                        <div className="h-full overflow-hidden"> {/* Để tạo hiệu ứng đổ bóng bên trong */}
                            <div
                                className={`${getColor()} h-full transform origin-left`} // Màu thanh máu
                                style={{
                                    transform: `scaleX(${healthPct})`, // Chiều rộng thanh máu dựa trên % máu
                                    transition: 'transform 0.5s ease-out', // Hiệu ứng chuyển động
                                }}
                            >
                                <div className="w-full h-1/2 bg-white bg-opacity-20" /> {/* Hiệu ứng bóng đổ nhẹ */}
                            </div>
                        </div>

                        {/* Hiệu ứng nhấp nháy nhẹ trên thanh máu */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 pointer-events-none"
                            style={{ animation: 'pulse 3s infinite' }}
                        />

                        {/* Hiển thị số máu */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md tracking-wider">
                                {Math.round(health)}/{MAX_HEALTH}
                            </span>
                        </div>
                    </div>

                    {/* Hiển thị số sát thương nổi */}
                    <div className="absolute top-4 left-0 right-0 h-4 w-full overflow-hidden pointer-events-none">
                        {showDamageNumber && (
                            <div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xs"
                                style={{ animation: 'floatUp 0.8s ease-out forwards' }} // Animation nổi lên
                            >
                                -{damageAmount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
             {/* Phần bên phải: Hiển thị Gem và Coin (chỉ khi không ở chế độ toàn màn hình) */}
             {!isStatsFullscreen && (
                <div className="flex items-center space-x-1 currency-display-container relative">
                    {/* Hiển thị Gem */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-lg p-0.5 flex items-center shadow-lg border border-purple-300 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> {/* Hiệu ứng lướt qua */}
                        <div className="relative mr-0.5 flex items-center justify-center">
                            <GemIcon size={16} color="#a78bfa" className="relative z-20" /> {/* Biểu tượng Gem */}
                        </div>
                        <div className="font-bold text-purple-200 text-xs tracking-wide">
                            {gems.toLocaleString()} {/* Số Gem */}
                        </div>
                        {/* Nút "+" (trang trí hoặc chức năng mua Gem) */}
                        <div className="ml-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer border border-purple-300 shadow-inner hover:shadow-purple-300/50 hover:scale-110 transition-all duration-200 group-hover:add-button-pulse">
                            <span className="text-white font-bold text-xs">+</span>
                        </div>
                        {/* Các chấm nhấp nháy trang trí */}
                        <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse-fast"></div>
                    </div>

                    {/* Hiển thị Coin (sử dụng component CoinDisplay) */}
                    <CoinDisplay
                      displayedCoins={displayedCoins} // Số coin hiển thị
                      isStatsFullscreen={isStatsFullscreen} // Trạng thái toàn màn hình
                    />
                </div>
             )}
          </div>

          {/* Màn hình Game Over */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-40">
              <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
                onClick={startNewGame} // Gọi startNewGame khi nhấp nút
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Các nút chức năng bên trái (Shop, Inventory) - chỉ hiển thị khi không toàn màn hình */}
          {!isStatsFullscreen && (
            <div className="absolute left-4 bottom-32 flex flex-col space-y-4 z-30">
              {[ // Mảng các mục menu
                {
                  icon: ( // Biểu tượng Shop
                    <div className="relative">
                      <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md shadow-indigo-500/30 relative overflow-hidden border border-indigo-600">
                        {/* Các chi tiết trang trí cho biểu tượng */}
                        <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                        <div className="absolute top-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full border-t border-indigo-300"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-100/30 rounded-full animate-pulse-subtle"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                    </div>
                  ),
                  label: "Shop", // Nhãn nút
                  notification: true, // Có thông báo hay không (trang trí)
                  special: true, // Kiểu đặc biệt (trang trí)
                  centered: true // Căn giữa nội dung (trang trí)
                },
                {
                  icon: ( // Biểu tượng Inventory
                    <div className="relative">
                      <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/30 relative overflow-hidden border border-amber-600">
                        <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                        <div className="absolute inset-0.5 bg-amber-500/30 rounded-sm flex items-center justify-center">
                          <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-400 rounded-sm shadow-sm shadow-emerald-300/50 animate-pulse-subtle"></div>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                    </div>
                  ),
                  label: "Inventory",
                  notification: true,
                  special: true,
                  centered: true
                }
              ].map((item, index) => ( // Render các mục menu
                <div key={index} className="group cursor-pointer">
                  {item.special && item.centered ? ( // Kiểu hiển thị đặc biệt
                      <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                          {item.icon}
                          {item.label && (
                              <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                          )}
                      </div>
                  ) : ( // Kiểu hiển thị thông thường
                    <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}>
                      {item.icon}
                      <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

           {/* Các nút chức năng bên phải (Khiên, Mission, Blacksmith) - chỉ hiển thị khi không toàn màn hình */}
           {!isStatsFullscreen && (
            <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-30">

               {/* Nút Khiên */}
               <div
                className={`w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg border-2 border-blue-600 flex flex-col items-center justify-center transition-transform duration-200 relative ${!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`} // Class điều kiện cho trạng thái nút
                onClick={activateShield} // Kích hoạt khiên khi nhấp
                title={ // Tooltip cho nút
                  !gameStarted || gameOver || isLoadingUserData ? "Không khả dụng" :
                  isShieldActive ? `Khiên: ${Math.round(shieldHealth)}/${SHIELD_MAX_HEALTH}` :
                  isShieldOnCooldown ? `Hồi chiêu: ${remainingCooldown}s` :
                  isStatsFullscreen ? "Không khả dụng" :
                  "Kích hoạt Khiên chắn"
                }
                aria-label="Sử dụng Khiên chắn"
                role="button"
                tabIndex={!gameStarted || gameOver || isShieldActive || isShieldOnCooldown || isStatsFullscreen || isLoadingUserData ? -1 : 0} // Khả năng truy cập bàn phím
              >
                {/* Animation Lottie cho biểu tượng khiên */}
                <div className="w-10 h-10">
                   <DotLottieReact
                      src="https://lottie.host/fde22a3b-be7f-497e-be8c-47ac1632593d/jx7sBGvENC.lottie"
                      loop
                      autoplay={isShieldActive && !isStatsFullscreen && !isLoadingUserData} // Tự động phát khi khiên hoạt động
                      className="w-full h-full"
                   />
                </div>
                {/* Hiển thị thời gian hồi chiêu */}
                {isShieldOnCooldown && remainingCooldown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg text-white text-sm font-bold">
                    {remainingCooldown}s
                  </div>
                )}
              </div>

              {/* Các nút Mission và Blacksmith (tương tự như các nút bên trái) */}
              {[
                {
                  icon: ( // Biểu tượng Mission
                    <div className="relative">
                      <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-md shadow-emerald-500/30 relative overflow-hidden border border-emerald-600">
                        <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                        <div className="absolute inset-0.5 bg-emerald-500/30 rounded-sm flex items-center justify-center">
                          <div className="w-3 h-2 border-t border-l border-emerald-300/70 absolute top-1 left-1"></div>
                          <div className="w-3 h-2 border-b border-r border-emerald-300/70 absolute bottom-1 right-1"></div>
                          <div className="absolute right-1 bottom-1 w-1 h-1 bg-red-400 rounded-full animate-pulse-subtle"></div>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                    </div>
                  ),
                  label: "Mission",
                  notification: true,
                  special: true,
                  centered: true
                },
                {
                  icon: ( // Biểu tượng Blacksmith
                    <div className="relative">
                      <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md shadow-orange-500/30 relative overflow-hidden border border-orange-600">
                        <div className="absolute top-0 left-0 w-1.5 h-0.5 bg-white/50 rounded-sm"></div>
                        <div className="absolute inset-0.5 bg-orange-500/30 rounded-sm flex items-center justify-center">
                          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 bg-gray-700 rounded-sm"></div>
                          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gray-800 rounded-sm"></div>
                          <div className="absolute top-0.5 right-1 w-1.5 h-2 bg-gray-700 rotate-45 rounded-sm"></div>
                          <div className="absolute top-1 left-1 w-0.5 h-2 bg-amber-700 rotate-45 rounded-full"></div>
                          <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-subtle"></div>
                          <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse-subtle"></div>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full w-2 h-2 flex items-center justify-center shadow-md"></div>
                    </div>
                  ),
                  label: "Blacksmith",
                  notification: true,
                  special: true,
                  centered: true
                },
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  {item.special && item.centered ? (
                      <div className="scale-105 relative transition-all duration-300 flex flex-col items-center justify-center bg-black bg-opacity-60 p-1 px-3 rounded-lg w-14 h-14 flex-shrink-0">
                          {item.icon}
                          {item.label && (
                              <span className="text-white text-xs text-center block mt-0.5" style={{fontSize: '0.65rem'}}>{item.label}</span>
                          )}
                      </div>
                  ) : (
                    <div className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full p-3 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 relative flex flex-col items-center justify-center`}>
                      {item.icon}
                      <span className="text-white text-xs text-center block mt-1">{item.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Component Rương Báu */}
          <TreasureChest
            initialChests={3} // Số rương ban đầu
            keyCount={keyCount} // Số chìa khóa hiện có
            onKeyCollect={(n) => { // Hàm xử lý khi mở rương bằng chìa khóa
              console.log(`Rương đã mở bằng ${n} chìa khóa.`);
              setKeyCount(prev => Math.max(0, prev - n)); // Giảm số chìa khóa cục bộ
              if (auth.currentUser) { // Cập nhật Firestore
                updateKeysInFirestore(auth.currentUser.uid, -n); // Trừ chìa khóa
              } else {
                console.log("Người dùng chưa được xác thực, bỏ qua cập nhật chìa khóa Firestore.");
              }
            }}
            onCoinReward={startCoinCountAnimation} // Hàm xử lý khi nhận thưởng coin từ rương
            onGemReward={handleGemReward} // Hàm xử lý khi nhận thưởng gem từ rương
            isGamePaused={gameOver || !gameStarted || isLoadingUserData} // Trạng thái tạm dừng game
            isStatsFullscreen={isStatsFullscreen} // Trạng thái toàn màn hình
            currentUserId={currentUser ? currentUser.uid : null} // ID người dùng hiện tại
          />

        </div>
      )}
    </div>
  );
}

