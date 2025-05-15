import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
// Import các module cần thiết từ firebase.js và firestore
import { db, auth } from '../firebase.js'; // Import db và auth
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Import doc, getDoc, updateDoc
import { onAuthStateChanged, User } from 'firebase/auth'; // Import onAuthStateChanged và User
import { defaultImageUrls } from '../image-url.ts';

// Import component Confetti đã tách ra
import Confetti from './chuc-mung.tsx'; // Import component Confetti

// Import CoinDisplay và StreakDisplay từ quiz.tsx
import CoinDisplay from '../coin-display.tsx';
import { getStreakIconUrl, streakIconUrls } from '../quiz.tsx'; // Import các hàm và biến liên quan đến streak từ quiz.tsx

// Định nghĩa kiểu dữ liệu cho một từ vựng, thêm trường imageIndex
interface VocabularyItem {
  word: string;
  hint: string; // Chúng ta sẽ tạo hint giả nếu dữ liệu gốc không có
  imageIndex?: number; // Thêm trường imageIndex để lưu chỉ mục ảnh
}

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

  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0); // Score will track correct answers
  // Sử dụng Set để quản lý các từ đã dùng hiệu quả hơn
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // State để điều khiển hiển thị Confetti

  // State cho Coins và Streak (thêm vào từ quiz)
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);


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
        // Không đặt lỗi ở đây, chỉ hiển thị thông báo "Vui lòng đăng nhập" ở UI
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
          let fetchedCoins = 0; // Lấy coins từ Firestore

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

          // Lấy coins
          if (userData && typeof userData.coins === 'number') {
              fetchedCoins = userData.coins;
              console.log("Fetched coins:", fetchedCoins);
              setCoins(fetchedCoins); // Cập nhật state coins
          } else {
              console.log("User document does not contain coins or it's not a number. Defaulting to 0.");
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
          setCoins(0);
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
       setCoins(0);
       // Không đặt lỗi ở đây, chỉ hiển thị thông báo "Vui lòng đăng nhập" ở UI
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

   // Function to update coins in Firestore (copy from quiz.tsx)
  const updateCoinsInFirestore = async (newCoins: number) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { coins: newCoins });
        console.log("Coins updated successfully in Firestore!");
      } catch (error) {
        console.error("Error updating coins in Firestore:", error);
      }
    }
  };


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
      // Thêm từ đã dùng vào Set
      setUsedWords(prevUsedWords => new Set(prevUsedWords).add(currentWord.word));
      setShowConfetti(true); // Hiển thị hiệu ứng confetti

      // Tăng streak và cộng coins (logic từ quiz.tsx)
      const newStreak = streak + 1;
      setStreak(newStreak);

      let coinsToAdd = 0;
      if (newStreak >= 20) {
        coinsToAdd = 20;
      } else if (newStreak >= 10) {
        coinsToAdd = 15;
      } else if (newStreak >= 5) {
        coinsToAdd = 10;
      } else if (newStreak >= 3) {
        coinsToAdd = 5;
      } else if (newStreak >= 1) {
        coinsToAdd = 1;
      }

      if (coinsToAdd > 0) {
        const totalCoins = coins + coinsToAdd;
        setCoins(totalCoins);
        updateCoinsInFirestore(totalCoins); // Update coins in Firestore
        setCoinAnimation(true);
        setTimeout(() => setCoinAnimation(false), 1500);
      }

      if (newStreak >= 1) {
        setStreakAnimation(true);
        setTimeout(() => setStreakAnimation(false), 1500);
      }


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
      setStreak(0); // Reset streak on wrong answer
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
    // Keep coins when retaking the game, coins are already saved in Firestore
    selectRandomWord(); // Bắt đầu lại với từ ngẫu nhiên
  };

  // Submit form on Enter key (handled within WordSquaresInput now)
  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter') {
  //     checkAnswer(); // Gọi checkAnswer khi nhấn Enter
  //   }
  // };

  // Calculate game progress percentage
  const gameProgress = vocabularyList.length > 0 ? (usedWords.size / vocabularyList.length) * 100 : 0;


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

   // Nếu không có người dùng đăng nhập
   if (!user && !loading) {
     return (
       <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
         Vui lòng đăng nhập để chơi trò chơi.
       </div>
     );
   }


  // Nếu không có từ vựng nào được tải (mảng rỗng) sau khi đã đăng nhập
  if (vocabularyList.length === 0 && !loading && !error && user) {
      return (
          <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
              Không có từ vựng nào trong danh sách của bạn.
          </div>
      );
  }


  return (
    // Removed min-h-screen to allow content to dictate height
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Sử dụng component Confetti */}
      {showConfetti && <Confetti />}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        {gameOver ? (
          <div className="p-10 text-center">
            <div className="mb-8">
                {/* Using AwardIcon SVG - Need to define it or import */}
                {/* For now, using a placeholder */}
                <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                   {/* Placeholder for Award Icon */}
                   <span className="text-indigo-600 text-6xl">🏆</span>
                </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Trò chơi kết thúc!</h2>
              <p className="text-gray-500">Bạn đã hoàn thành tất cả các từ!</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">Số từ đã đúng:</span>
                <span className="text-2xl font-bold text-indigo-600">{score}/{vocabularyList.length}</span>
              </div>

              <div className="mb-3">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${(score / vocabularyList.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1 text-sm text-gray-600 font-medium">
                  {Math.round((score / vocabularyList.length) * 100)}%
                </p>
              </div>

              {/* Using CoinDisplay component for coins in results */}
              <div className="flex items-center justify-between mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                   {/* Display streak icon in results - Using img tag directly */}
                   <img
                     src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                     alt="Streak Icon"
                     className="h-5 w-5 text-orange-500 mr-1" // Adjust size as needed
                   />
                  <span className="font-medium text-gray-700">Coins hiện có:</span> {/* Corrected text */}
                </div>
                 {/* Pass coins to CoinDisplay */}
                {/* Display total user coins from state */}
                <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} /> {/* Always display coins here */}
              </div>

              {/* Using StreakDisplay component for streak in results */}
              {/* Need to create StreakDisplay component or import */}
              {/* For now, using a placeholder */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Display streak icon in results - Using img tag directly */}
                     <img
                      src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                      alt="Streak Icon"
                      className="h-6 w-6 text-orange-500 mr-2" // Adjust size as needed
                    />
                    <span className="font-medium text-gray-700">Chuỗi đúng dài nhất:</span>
                  </div>
                   {/* Pass streak to StreakDisplay, no animation in results */}
                  {/* Placeholder for StreakDisplay */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400">
                      <img src={getStreakIconUrl(streak)} alt="Streak Icon" className="w-4 h-4"/>
                      <div className="font-bold text-gray-800 text-xs tracking-wide ml-1">{streak}</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm italic mt-4">
                {score === vocabularyList.length ?
                  "Tuyệt vời! Bạn đã hoàn thành tất cả các từ." :
                  score > vocabularyList.length / 2 ?
                    "Kết quả tốt! Bạn có thể cải thiện thêm." :
                    "Hãy thử lại để cải thiện điểm số của bạn."
                }
              </p>
            </div>

            <button
              onClick={resetGame}
              className="flex items-center justify-center mx-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {/* Using RefreshIcon SVG - Need to define it or import */}
              {/* For now, using a placeholder */}
              <span className="mr-2">🔄</span>
              Chơi lại
            </button>
          </div>
        ) : (
          <>
            {/* New Header Section (copied and adapted from quiz.tsx) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
              {/* Header row with word counter on the left and coins/streak on the right */}
              <div className="flex justify-between items-center mb-4"> {/* Reduced bottom margin */}
                {/* Word counter on the left - Styled like quiz counter */}
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30"> {/* Adjusted background and border */}
                    <div className="flex items-center">
                      {/* Current word number (usedWords.size + 1 if not game over) */}
                      <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"> {/* Adjusted gradient for white text */}
                        {usedWords.size + (currentWord ? 1 : 0)} {/* Display current word index + 1 */}
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
                  {/* Pass coins and showScore state to CoinDisplay - showScore is not relevant here, pass false */}
                  <CoinDisplay displayedCoins={coins} isStatsFullscreen={false} />

                  {/* Using StreakDisplay component */}
                  {/* Need to create StreakDisplay component or import */}
                  {/* For now, using a placeholder - will replace with actual component if available */}
                   <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
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
                         src={getStreakIconUrl(streak)}
                         alt="Streak Icon"
                         className="w-4 h-4" // Icon size is w-4 h-4
                         // Add onerror if needed, similar to CoinDisplay
                       />
                     </div>

                     {/* Streak Count - adjusted text color for contrast on grey background */}
                     <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1"> {/* Added ml-1 for spacing */}
                       {streak}
                     </div>

                      {/* Small pulsing dots - kept white/yellow as they contrast well */}
                     <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div>
                     <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div>
                   </div>
                </div>
              </div>

              {/* Progress bar under the header row */}
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative mb-6"> {/* Added margin bottom */}
                  {/* Progress fill with smooth animation */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                    style={{ width: `${gameProgress}%` }}
                  >
                    {/* Light reflex effect */}
                    <div className="absolute top-0 h-1 w-full bg-white opacity-30"></div>
                  </div>
              </div>

               {/* START: Updated word display block */}
               {currentWord && (
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mb-1">
                  {/* Hiệu ứng đồ họa - ánh sáng góc */}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>

                  {/* Hiệu ứng đồ họa - đường trang trí */}
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white/20"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-white/20"></div>

                  {/* Icon từ vựng */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-500/30 p-1.5 rounded-md">
                      {/* Placeholder for Word Icon */}
                      <span className="text-white text-lg">📖</span>
                    </div>
                    <h3 className="text-xs uppercase tracking-wider text-white/70 font-medium">Từ vựng</h3>
                  </div>

                  {/* Nội dung từ vựng (có thể hiển thị hint hoặc phần nào đó của từ) */}
                  {/* Hiện tại không hiển thị từ ở đây, chỉ hiển thị ảnh và hint trong popup */}
                   <h2 className="text-xl font-bold text-white leading-tight">
                     Đoán từ dựa trên hình ảnh
                   </h2>
                </div>
               )}
                {/* END: Updated word display block */}
            </div>

            <div className="p-6">
              {/* Streak text message (logic from quiz.tsx) */}
              {streak >= 1 && ( // Show streak text for streak 1 and above
                <div className={`mb-4 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center transition-all duration-300 ${streakAnimation ? 'scale-110' : 'scale-100'}`}>
                  <div className="flex items-center justify-center">
                     <img
                       src={getStreakIconUrl(streak)} // Use getStreakIconUrl here
                       alt="Streak Icon"
                       className="h-5 w-5 mr-2 text-white" // Adjust size as needed
                     />
                    <span className="text-white font-medium">
                      {/* Get streak text based on streak count */}
                      {streak >= 20 ? "Không thể cản phá!" :
                       streak >= 10 ? "Tuyệt đỉnh!" :
                       streak >= 5 ? "Siêu xuất sắc!" :
                       streak >= 3 ? "Xuất sắc!" :
                       streak >= 1 ? "Tuyệt vời!" : ""} {/* Added text for streak 1-2 */}
                    </span>
                  </div>
                </div>
              )}


              {currentWord && (
                <div className="w-full space-y-6">
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
                    feedback={feedback}
                    isCorrect={isCorrect}
                    disabled={isCorrect === true}
                  />
                </div>
              )}
            </div>
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
