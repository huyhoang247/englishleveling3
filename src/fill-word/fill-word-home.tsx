import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
// Import các module cần thiết từ firebase.js và firestore
import { db, auth } from '../firebase.js'; // Import db và auth
import { doc, getDoc } from 'firebase/firestore'; // Import doc và getDoc
import { onAuthStateChanged, User } from 'firebase/auth'; // Import onAuthStateChanged và User
import { defaultImageUrls } from '../image-url.ts';

// Import component Confetti đã tách ra
import Confetti from './chuc-mung.tsx'; // Import component Confetti
// Import CoinDisplay component (assuming it's in the parent directory)
import CoinDisplay from '../coin-display.tsx';

// Định nghĩa kiểu dữ liệu cho một từ vựng, thêm trường imageIndex
interface VocabularyItem {
  word: string;
  hint: string; // Chúng ta sẽ tạo hint giả nếu dữ liệu gốc không có
  imageIndex?: number; // Thêm trường imageIndex để lưu chỉ mục ảnh
}

// --- START: Components và Logic được sao chép từ quiz.tsx ---

// Define streak icon URLs (assuming these are available or passed down)
const streakIconUrls = {
  default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png', // Default icon
  streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png', // 1 correct answer
  streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png', // 5 consecutive correct answers
  streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png', // 10 consecutive correct answers
  streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png', // 20 consecutive correct answers
};

// Function to get the correct streak icon URL based on streak count
const getStreakIconUrl = (streak: number) => {
  if (streak >= 20) return streakIconUrls.streak20;
  if (streak >= 10) return streakIconUrls.streak10;
  if (streak >= 5) return streakIconUrls.streak5;
  if (streak >= 1) return streakIconUrls.streak1;
  return streakIconUrls.default;
};

// StreakDisplay component (Integrated) - Copied from quiz.tsx
interface StreakDisplayProps {
  displayedStreak: number; // The number of streak to display
  isAnimating: boolean; // Flag to trigger animation
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ displayedStreak, isAnimating }) => {
  return (
    // Streak Container - Adjusted vertical padding (py-0.5)
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}>
       {/* Add necessary styles for animations used here */}
      <style jsx>{`
         @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s infinite;
        }
      `}</style>
      {/* Background highlight effect - adjusted for grey scale */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div>

      {/* Streak Icon */}
      <div className="relative flex items-center justify-center">
        <img
          src={getStreakIconUrl(displayedStreak)}
          alt="Streak Icon"
          className="w-4 h-4" // Icon size is w-4 h-4
          // Add onerror if needed, similar to CoinDisplay
        />
      </div>

      {/* Streak Count - adjusted text color for contrast on grey background */}
      <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1"> {/* Added ml-1 for spacing */}
        {displayedStreak}
      </div>

       {/* Small pulsing dots - kept white/yellow as they contrast well */}
      <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
      <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
    </div>
  );
};

// SVG Icons (Replaced lucide-react icons) - Copied from quiz.tsx
const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17L4 12"></path>
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path>
    <path d="M3 12a9 9 0 0 1 9-9c2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path>
  </svg>
);

const AwardIcon = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinecap="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
</svg>
);

const getStreakText = (streak: number) => {
  if (streak >= 20) return "Không thể cản phá!";
  if (streak >= 10) return "Tuyệt đỉnh!";
  if (streak >= 5) return "Siêu xuất sắc!";
  if (streak >= 3) return "Xuất sắc!";
  return "";
};

// --- END: Components và Logic được sao chép từ quiz.tsx ---


export default function VocabularyGame() {
  // State để lưu trữ danh sách từ vựng với thông tin ảnh
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  // State để theo dõi trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để theo dõi lỗi khi tải dữ liệu
  const [error, setError] = useState<string | null>(null);
  // State để lưu thông tin người dùng đã đăng nhập
  const [user, setUser] = useState<User | null>(null);
  // State để lưu trữ mảng openedImageIds từ Firestore
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);

  // State cho game
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0); // Score can still track correct answers if needed internally
  // Sử dụng Set để quản lý các từ đã dùng hiệu quả hơn
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // State để điều khiển hiển thị Confetti

  // State cho Coins và Streak (từ quiz.tsx)
  const [coins, setCoins] = useState(0); // Coins state already exists, will use this
  const [streak, setStreak] = useState(0); // New streak state
  const [streakAnimation, setStreakAnimation] = useState(false); // New streak animation state

  // Lắng nghe trạng thái xác thực người dùng
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Khi trạng thái user thay đổi, chúng ta sẽ fetch lại data trong effect khác
    });
    return () => unsubscribe(); // Hủy đăng ký lắng nghe khi component unmount
  }, []); // Chỉ chạy một lần khi component mount

  // Effect để tải dữ liệu từ Firestore khi user thay đổi
  useEffect(() => {
    const fetchUserData = async () => {
      // Chỉ fetch nếu có người dùng đăng nhập
      if (!user) {
        console.log("No user logged in, cannot fetch data from user document.");
        setLoading(false);
        setVocabularyList([]); // Đặt danh sách trống nếu không có user
        setOpenedImageIds([]); // Đặt danh sách ảnh trống
        setCoins(0); // Reset coins if no user
        setError("Vui lòng đăng nhập để chơi.");
        return;
      }

      try {
        setLoading(true); // Bắt đầu tải, đặt loading là true
        setError(null); // Xóa lỗi cũ

        // Lấy tham chiếu đến document của người dùng hiện tại
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          let fetchedVocabulary: VocabularyItem[] = [];
          let fetchedImageIds: number[] = [];

          // Lấy danh sách từ vựng
          if (userData && Array.isArray(userData.listVocabulary)) {
            console.log("Fetched listVocabulary array:", userData.listVocabulary);
            // Chuyển đổi mảng chuỗi thành cấu trúc VocabularyItem
            fetchedVocabulary = userData.listVocabulary.map((word: string, index: number) => ({
              word: word,
              // Tạo hint giả từ từ vựng, hoặc bạn có thể bỏ qua hint nếu không cần
              hint: `Nghĩa của từ "${word}"`,
              // Lưu trữ chỉ mục gốc để liên kết với ảnh sau
              originalIndex: index
            }));
            console.log("Transformed vocabulary list with original index:", fetchedVocabulary);
          } else {
            console.log("User document does not contain a listVocabulary array or it's not an array.");
            setError("Không tìm thấy danh sách từ vựng trong tài khoản của bạn hoặc định dạng sai.");
          }

          // Lấy danh sách ID ảnh đã mở
          if (userData && Array.isArray(userData.openedImageIds)) {
             // Kiểm tra xem các phần tử có phải là số không
             const areAllNumbers = userData.openedImageIds.every((id: any) => typeof id === 'number');
             if(areAllNumbers) {
                fetchedImageIds = userData.openedImageIds as number[];
                console.log("Fetched openedImageIds array:", fetchedImageIds);
                setOpenedImageIds(fetchedImageIds); // Cập nhật state openedImageIds
             } else {
                 console.log("User document contains openedImageIds but it's not an array of numbers.");
                 setError("Dữ liệu ảnh trong tài khoản của bạn có định dạng sai.");
             }
          } else {
            console.log("User document does not contain an openedImageIds array or it's not an array.");
            // Không có openedImageIds là bình thường, không cần đặt lỗi
            setOpenedImageIds([]); // Đặt mảng rỗng nếu không có
          }

          // Lấy số coins
          if (userData && typeof userData.coins === 'number') {
            setCoins(userData.coins); // Cập nhật state coins
          } else {
            setCoins(0); // Mặc định là 0 nếu không có hoặc sai định dạng
          }


          // Kết hợp danh sách từ vựng với chỉ mục ảnh tương ứng
          // Giả định rằng thứ tự trong listVocabulary tương ứng với thứ tự trong openedImageIds
          const vocabularyWithImages = fetchedVocabulary.map((item, index) => {
              const imageIndex = fetchedImageIds[index]; // Lấy chỉ mục ảnh tương ứng
              // Kiểm tra xem chỉ mục ảnh có hợp lệ trong mảng defaultImageUrls không
              // Điều chỉnh index ở đây nếu cần thiết, ví dụ: imageIndex - 1 nếu ID là 1-based
              // const adjustedImageIndex = imageIndex !== undefined ? imageIndex - 1 : undefined; // Ví dụ điều chỉnh
              const isValidImageIndex = imageIndex !== undefined && imageIndex >= 0 && imageIndex < defaultImageUrls.length; // Kiểm tra tính hợp lệ sau khi điều chỉnh (nếu có)
              return {
                  ...item,
                  // Chỉ thêm imageIndex nếu nó hợp lệ
                  // Sử dụng adjustedImageIndex nếu bạn đã điều chỉnh ở trên
                  imageIndex: isValidImageIndex ? imageIndex : undefined
              };
          });

          setVocabularyList(vocabularyWithImages); // Cập nhật state danh sách từ vựng với thông tin ảnh

        } else {
          console.log("User document does not exist.");
          setVocabularyList([]); // Đặt danh sách trống nếu document không tồn tại
          setOpenedImageIds([]);
          setCoins(0); // Reset coins if document doesn't exist
          setError("Không tìm thấy dữ liệu người dùng.");
        }

        setLoading(false); // Tải xong, đặt loading là false

      } catch (err: any) {
        console.error("Error fetching user data from document:", err);
        setError(`Không thể tải dữ liệu người dùng: ${err.message}`); // Cập nhật state lỗi
        setLoading(false); // Tải thất bại, đặt loading là false
      }
    };

    // Chỉ chạy fetchUserData khi user có giá trị (đã đăng nhập)
    if (user) {
      fetchUserData();
    } else {
       // Nếu không có user, đặt loading false ngay lập tức và danh sách trống
       setLoading(false);
       setVocabularyList([]);
       setOpenedImageIds([]);
       setCoins(0); // Reset coins if no user
       setError("Vui lòng đăng nhập để chơi.");
    }

  }, [user]); // Dependency array bao gồm user để fetch lại khi trạng thái user thay đổi

  // Effect để bắt đầu trò chơi sau khi dữ liệu từ vựng đã được tải VÀ không còn loading VÀ không có lỗi
  useEffect(() => {
    // Bắt đầu game chỉ khi danh sách từ vựng có dữ liệu, không loading và không có lỗi
    if (vocabularyList.length > 0 && !loading && !error) {
      selectRandomWord(); // Chọn từ đầu tiên khi danh sách từ vựng có sẵn và không có lỗi/loading
    } else if (vocabularyList.length === 0 && !loading && !error) {
       // Nếu danh sách trống, không loading, không lỗi (trường hợp document user tồn tại nhưng mảng rỗng)
       setCurrentWord(null); // Đảm bảo không có từ hiện tại
       setGameOver(false); // Đảm bảo không phải trạng thái game over (chỉ là không có từ để chơi)
    }
  }, [vocabularyList, loading, error]); // Chạy khi vocabularyList, loading hoặc error thay đổi

  // Select a random word that hasn't been used yet
  const selectRandomWord = () => {
    // Lọc ra các từ chưa được sử dụng
    const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word));

    if (unusedWords.length === 0) {
      setGameOver(true); // Nếu không còn từ chưa dùng, kết thúc trò chơi
      return;
    }

    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    setCurrentWord(unusedWords[randomIndex]); // Chọn một từ ngẫu nhiên từ danh sách chưa dùng
    setUserInput(''); // Đặt lại input người dùng
    setFeedback(''); // Đặt lại feedback
    setIsCorrect(null); // Đặt lại trạng thái đúng/sai
  };

  // Check the user's answer
  const checkAnswer = () => {
    if (!currentWord || !userInput.trim()) return; // Kiểm tra từ hiện tại và input không rỗng

    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback('Chính xác!'); // Feedback khi đúng
      setIsCorrect(true); // Đặt trạng thái đúng
      setScore(score + 1); // Tăng điểm

      // Tăng streak khi trả lời đúng
      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakAnimation(true); // Kích hoạt animation
      setTimeout(() => setStreakAnimation(false), 1500); // Tắt animation sau 1.5s

      // Thêm từ đã dùng vào Set
      setUsedWords(prevUsedWords => new Set(prevUsedWords).add(currentWord.word));
      setShowConfetti(true); // Hiển thị hiệu ứng confetti

      // Ẩn confetti sau 2 giây
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      // Chờ một chút trước khi chuyển sang từ tiếp theo
      setTimeout(() => {
        selectRandomWord();
      }, 1500);
    } else {
      // Feedback khi sai, hiển thị từ đúng
      setFeedback(`Không đúng, hãy thử lại! Từ đúng là: ${currentWord.word}`);
      setIsCorrect(false); // Đặt trạng thái sai
      setStreak(0); // Đặt lại streak khi trả lời sai
    }
  };

  // Generate image URL based on the imageIndex from the vocabulary item
  const generateImageUrl = (imageIndex?: number) => {
     // Kiểm tra nếu imageIndex tồn tại và là số
     if (imageIndex !== undefined && typeof imageIndex === 'number') {
         // Điều chỉnh imageIndex để phù hợp với mảng 0-based nếu imageIndex từ Firestore là 1-based
         // Ví dụ: nếu imageIndex 1 tương ứng với phần tử đầu tiên của mảng (index 0), ta trừ đi 1.
         // Nếu imageIndex 1 tương ứng với phần tử thứ hai của mảng (index 1), ta không cần trừ.
         // Dựa trên mô tả của bạn "id1 là bắt đầu từ hàng 2", có thể imageIndex 1 tương ứng với defaultImageUrls[0].
         // Tuy nhiên, cách điều chỉnh chính xác phụ thuộc vào cách imageIndex được lưu trong Firestore
         // và cách mảng defaultImageUrls được định nghĩa.
         // Tạm thời, tôi sẽ giả định imageIndex 1 trong Firestore tương ứng với index 0 trong mảng.
         // Nếu không đúng, bạn cần điều chỉnh lại phần này.
         const adjustedIndex = imageIndex - 1; // Giả định imageIndex từ Firestore là 1-based

         // Kiểm tra xem chỉ mục đã điều chỉnh có hợp lệ trong mảng defaultImageUrls không
         if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) {
             return defaultImageUrls[adjustedIndex];
         } else {
             console.warn(`Adjusted image index ${adjustedIndex} is out of bounds for defaultImageUrls array.`);
         }
     }
     // Nếu không có imageIndex hợp lệ hoặc sau khi điều chỉnh vẫn không hợp lệ, sử dụng placeholder
     return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`;
  };

  // Reset the game
  const resetGame = () => {
    setUsedWords(new Set()); // Đặt lại danh sách từ đã dùng
    setScore(0); // Đặt lại điểm
    setGameOver(false); // Đặt lại trạng thái kết thúc trò chơi
    setStreak(0); // Reset streak on game reset
    selectRandomWord(); // Bắt đầu lại với từ ngẫu nhiên
  };

  // Submit form on Enter key
  // This is handled within WordSquaresInput now, no need here.
  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter') {
  //     checkAnswer(); // Gọi checkAnswer khi nhấn Enter
  //   }
  // };

  // Hiển thị trạng thái loading hoặc lỗi
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  // Nếu không có từ vựng nào được tải (mảng rỗng)
  if (vocabularyList.length === 0 && !loading && !error) {
      return (
          <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
              Không có từ vựng nào trong danh sách của bạn.
          </div>
      );
  }

  // Calculate game progress percentage based on completed words
  const gameProgress = vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0;


  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans">
      {/* Sử dụng component Confetti */}
      {showConfetti && <Confetti />}

      <div className="w-full flex flex-col items-center">
        {gameOver ? (
          <div className="text-center py-8 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2>
              {/* Display score based on completed words */}
              <p className="text-xl mb-4">Số từ đã hoàn thành: <span className="font-bold text-indigo-600">{usedWords.size}/{vocabularyList.length}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${gameProgress}%` }} // Use gameProgress here
                ></div>
              </div>
              {/* Display final streak and coins if needed in game over screen */}
              {/* <div className="flex items-center justify-center gap-4 mt-4">
                 <CoinDisplay displayedCoins={coins} isStatsFullscreen={true} />
                 <StreakDisplay displayedStreak={streak} isAnimating={false} />
              </div> */}
            </div>
            <button
              onClick={resetGame}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {/* Using RefreshIcon SVG */}
              <RefreshIcon className="mr-2 h-5 w-5" />
              Chơi lại
            </button>
          </div>
        ) : (
          <>
            {/* START: New Header Structure (Copied and adapted from quiz.tsx) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-t-xl"> {/* Added w-full and rounded-t-xl */}
                {/* Header row with word counter on the left and coins/streak on the right */}
                <div className="flex justify-between items-center mb-4"> {/* Reduced bottom margin */}
                  {/* Word counter on the left - Styled like quiz counter */}
                  <div className="relative">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30"> {/* Adjusted background and border */}
                      <div className="flex items-center">
                        {/* Completed words count */}
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"> {/* Adjusted gradient for white text */}
                          {usedWords.size}
                        </span>

                        {/* Separator */}
                        <span className="mx-0.5 text-white/70 text-xs">/</span> {/* Adjusted color */}

                        {/* Total words */}
                        <span className="text-xs text-white/50">{vocabularyList.length}</span> {/* Adjusted color */}
                      </div>
                    </div>
                  </div>
                  {/* Coins and Streak on the right */}
                  <div className="flex items-center gap-2">
                    {/* Using CoinDisplay component for coins */}
                    {/* Pass coins state to CoinDisplay */}
                    <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} /> {/* isStatsFullscreen is false in game */}

                    {/* Using StreakDisplay component */}
                    {/* Pass streak and streakAnimation state to StreakDisplay */}
                    <StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} />
                  </div>
                </div>

                {/* Progress bar under the header row */}
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6"> {/* Added margin bottom */}
                    {/* Progress fill with smooth animation */}
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                      style={{ width: `${gameProgress}%` }} // Use gameProgress here
                    >
                      {/* Light reflex effect */}
                      <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                    </div>
                </div>

                 {/* START: Updated question display block (adapted for word game) */}
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mb-1">
                  {/* Hiệu ứng đồ họa - ánh sáng góc */}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>

                  {/* Hiệu ứng đồ họa - đường trang trí */}
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white/20"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-white/20"></div>

                  {/* Icon câu hỏi (adapted for word game) */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-500/30 p-1.5 rounded-md">
                       {/* Using a different icon for word game, e.g., a lightbulb for hint */}
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                        </svg>
                    </div>
                    <h3 className="text-xs uppercase tracking-wider text-white/70 font-medium">Gợi ý</h3> {/* Changed text to Gợi ý */}
                  </div>

                  {/* Nội dung câu hỏi (adapted for word game - showing hint) */}
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {currentWord?.hint} {/* Display hint here */}
                  </h2>
                </div>
                {/* END: Updated question display block */}

            </div>
            {/* END: New Header Structure */}

            {/* Removed the old score/progress bar div */}
            {/*
            <div className="w-full flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl mr-2">⭐</span>
                <span className="font-bold text-gray-800">{score}/{vocabularyList.length}</span>
              </div>
              <div className="h-2 w-1/2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${(usedWords.size / vocabularyList.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-800 font-medium">{vocabularyList.length - usedWords.size}</span>
                <span className="ml-1 text-gray-500">còn lại</span>
              </div>
            </div>
            */}

            {currentWord && (
              <div className="w-full space-y-6">
                 {/* Streak text message */}
                {streak >= 1 && getStreakText(streak) !== "" && ( // Show streak text for streak 1 and above, and if getStreakText is not empty
                  <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                    <div className="flex items-center justify-center">
                       <img
                         src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                         alt="Streak Icon"
                         className="h-5 w-5 mr-2 text-white" // Adjust size as needed
                       />
                      <span className="text-white font-medium">{getStreakText(streak)}</span>
                    </div>
                  </div>
                )}

                {/* Image card */}
                <div
                  className="relative w-full h-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-102 group"
                  onClick={() => setShowImagePopup(true)}
                >
                  {/* Sử dụng ảnh thật nếu có imageIndex, ngược lại dùng overlay */}
                  {currentWord.imageIndex !== undefined ? (
                       <img
                           src={generateImageUrl(currentWord.imageIndex)}
                           alt={currentWord.word}
                           className="w-full h-full object-contain" // Đã thay đổi từ object-cover sang object-contain
                       />
                  ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 flex flex-col items-center justify-center">
                        <span className="text-white text-8xl font-bold mb-2">?</span>
                        <span className="text-white text-lg opacity-80">Chạm để xem</span>
                      </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-center">Đoán từ này là gì?</p>
                  </div>
                </div>

                {/* Word Squares Input Component */}
                <WordSquaresInput
                  word={currentWord.word}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  checkAnswer={checkAnswer}
                  // handleKeyPress={handleKeyPress} // Đã bỏ handleKeyPress ở đây vì nó được xử lý trong WordSquaresInput
                  feedback={feedback}
                  isCorrect={isCorrect}
                  disabled={isCorrect === true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Image popup */}
      {showImagePopup && currentWord && ( // Thêm kiểm tra currentWord
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 max-w-3xl max-h-full overflow-auto shadow-2xl">
            <button
              onClick={() => setShowImagePopup(false)}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
            <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">{currentWord.word}</h3>
            <img
              // Sử dụng generateImageUrl với imageIndex từ currentWord
              src={generateImageUrl(currentWord.imageIndex)}
              alt={currentWord.word}
              className="rounded-lg shadow-md max-w-full max-h-full object-contain" // Thêm object-contain cho popup
            />
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="font-medium text-gray-700 mb-1">Định nghĩa:</p>
              <p className="text-gray-800">{currentWord.hint}</p> {/* Sử dụng hint đã tạo */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
