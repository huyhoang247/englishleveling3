import { useState, useEffect } from 'react';
import WordSquaresInput from './vocabulary-input.tsx';
// Import các module cần thiết từ firebase.js và firestore
import { db, auth } from '../firebase.js'; // Import db và auth
import { doc, getDoc } from 'firebase/firestore'; // Import doc và getDoc
import { onAuthStateChanged, User } from 'firebase/auth'; // Import onAuthStateChanged và User

// Import mảng URL ảnh từ image-url.ts
// Giả định defaultImageUrls là mảng 0-based,
// và imageIndex từ Firestore có thể là 1-based hoặc có offset.
import { defaultImageUrls } from '../image-url.ts';

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
  const [score, setScore] = useState(0);
  // Sử dụng Set để quản lý các từ đã dùng hiệu quả hơn
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
    selectRandomWord(); // Bắt đầu lại với từ ngẫu nhiên
  };

  // Submit form on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer(); // Gọi checkAnswer khi nhấn Enter
    }
  };

  // Confetti component (giữ nguyên như cũ)
  const Confetti = () => {
    const confettiPieces = Array(50).fill(0);

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {confettiPieces.map((_, index) => {
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${Math.random() * 3 + 2}s`;
          const size = `${Math.random() * 10 + 5}px`;
          const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
          const color = colors[Math.floor(Math.random() * colors.length)];

          return (
            <div
              key={index}
              className={`absolute ${color} opacity-80 rounded-full`}
              style={{
                left,
                top: '-10px',
                width: size,
                height: size,
                animation: `fall ${animationDuration} linear forwards`,
              }}
            />
          );
        })}

        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

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


  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-xl font-sans">
      {showConfetti && <Confetti />}

      <div className="w-full flex flex-col items-center">
        {gameOver ? (
          <div className="text-center py-8 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2>
              <p className="text-xl mb-4">Điểm của bạn: <span className="font-bold text-indigo-600">{score}/{vocabularyList.length}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${(score / vocabularyList.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <span className="mr-2">🔄</span>
              Chơi lại
            </button>
          </div>
        ) : (
          <>
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

            {currentWord && (
              <div className="w-full space-y-6">
                {/* Image card */}
                <div
                  className="relative w-full bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-102 group flex items-center justify-center" // Đã bỏ h-64 và thêm flexbox
                  onClick={() => setShowImagePopup(true)}
                >
                  {/* Sử dụng ảnh thật nếu có imageIndex, ngược lại dùng overlay */}
                  {currentWord.imageIndex !== undefined ? (
                       <img
                           src={generateImageUrl(currentWord.imageIndex)}
                           alt={currentWord.word}
                           className="max-w-full max-h-64 object-contain" // Đặt max-h-64 cho ảnh để giới hạn chiều cao
                       />
                  ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 flex flex-col items-center justify-center h-64"> {/* Giữ h-64 cho overlay */}
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
                  handleKeyPress={handleKeyPress}
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
