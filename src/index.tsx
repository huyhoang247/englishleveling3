// src/index.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx';
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx'; // Vẫn import Story để lấy kiểu dữ liệu và exampleImages
import Profile from './newgame.tsx';
import Quiz from './quiz/quiz-app-home.tsx';
import Game from './game.tsx'; // Import component Game mới
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Import FlashcardDetailModal và các kiểu dữ liệu liên quan
import FlashcardDetailModal from './story/flashcard.tsx'; // Đường dẫn tới file flashcard.tsx của bạn

// Giả định bạn có file list-vocabulary.ts export defaultVocabulary
// Hãy đảm bảo file này tồn tại và có cấu trúc dữ liệu đúng
import { defaultVocabulary, VocabularyData } from './list-vocabulary.ts'; // Cần tạo file này

// Định nghĩa kiểu Flashcard (có thể lấy từ VerticalFlashcardGallery.tsx hoặc định nghĩa lại ở đây)
interface Flashcard {
  id: number;
  imageUrl: {
    default: string;
    anime?: string;
    comic?: string;
    realistic?: string;
  };
  isFavorite: boolean;
  vocabulary: VocabularyData;
}

// Lấy exampleImages từ VerticalFlashcardGallery.tsx (hoặc định nghĩa lại)
// Đây là một mảng các URL hình ảnh ví dụ
const exampleImages: string[] = [
  "https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1",
  "https://placehold.co/1024x1536/33FF57/FFFFFF?text=Example+2",
  "https://placehold.co/1024x1536/3357FF/FFFFFF?text=Example+3",
  "https://placehold.co/1024x1536/FF33A1/FFFFFF?text=Example+4",
  "https://placehold.co/1024x1536/A133FF/FFFFFF?text=Example+5",
];


// Định nghĩa các loại tab có thể có, bao gồm 'game'
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';

// Hàm kiểm tra và tạo tài liệu người dùng trong Firestore nếu chưa có
const ensureUserDocumentExists = async (user: User) => {
  if (!user || !user.uid) {
    console.error("User object or UID is missing.");
    return;
  }
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      console.log(`User document for ${user.uid} does not exist. Creating...`);
      await setDoc(userDocRef, {
        email: user.email,
        username: user.displayName || user.email?.split('@')[0] || `user_${user.uid.substring(0,5)}`,
        createdAt: new Date(),
        coins: 0,
        gems: 0,
        keys: 0,
        openedImageIds: [],
        listVocabulary: [], // Thêm trường listVocabulary
      });
      console.log(`User document for ${user.uid} created successfully.`);
    } else {
      console.log(`User document for ${user.uid} already exists.`);
      const userData = userDocSnap.data();
      if (userData?.email !== user.email) {
          console.log(`Updating email for user ${user.uid} in Firestore.`);
          await setDoc(userDocRef, { email: user.email }, { merge: true });
      }
      if (!userData?.openedImageIds) {
           console.log(`Adding openedImageIds field for user ${user.uid}.`);
           await setDoc(userDocRef, { openedImageIds: [] }, { merge: true });
       }
       if (!userData?.username) {
           console.log(`Adding username field for user ${user.uid}.`);
           await setDoc(userDocRef, { username: user.displayName || user.email?.split('@')[0] || `user_${user.uid.substring(0,5)}` }, { merge: true });
       }
       if (!userData?.listVocabulary) { // Đảm bảo trường listVocabulary tồn tại
        console.log(`Adding listVocabulary field for user ${user.uid}.`);
        await setDoc(userDocRef, { listVocabulary: [] }, { merge: true });
    }
    }
  } catch (error) {
    console.error("Error ensuring user document exists:", error);
  }
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // State cho popup flashcard từ tab Game
  const [selectedCardForPopup, setSelectedCardForPopup] = useState<Flashcard | null>(null);
  const [showVocabPopup, setShowVocabPopup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await ensureUserDocumentExists(user);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Luôn hiển thị navbar khi chuyển tab, trừ khi có logic ẩn đặc biệt (hiện tại không có)
    setIsNavBarVisible(true);
  };

  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);

  // Xử lý khi một từ tiếng Anh được nhấp trong tab Game
  const handleWordClickInGame = (word: string) => {
    console.log("Word clicked in Game tab:", word);
    const vocabularyEntry = defaultVocabulary.find(
      (vocab) => vocab.word.toLowerCase() === word.toLowerCase()
    );

    if (vocabularyEntry) {
      // Tạo một đối tượng Flashcard tạm thời để hiển thị trong modal
      const cardForPopup: Flashcard = {
        id: Date.now(), // ID tạm thời
        imageUrl: { default: `https://placehold.co/600x400/eee/ccc?text=${encodeURIComponent(vocabularyEntry.word)}` }, // Ảnh placeholder
        isFavorite: false, // Mặc định
        vocabulary: vocabularyEntry,
      };
      setSelectedCardForPopup(cardForPopup);
      setShowVocabPopup(true);
      hideNavBar(); // Ẩn navbar khi popup hiện
    } else {
      console.warn(`Vocabulary not found for word: ${word}`);
      // Có thể hiển thị thông báo không tìm thấy từ
    }
  };

  // Đóng popup flashcard
  const closeVocabPopup = () => {
    setShowVocabPopup(false);
    setSelectedCardForPopup(null);
    showNavBar(); // Hiện lại navbar
  };

  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (!currentUser) {
    return <AuthComponent />;
  }

  return (
    <div className="app-container h-screen flex flex-col"> {/* Đảm bảo app-container chiếm toàn bộ chiều cao */}
      {/* Phần nội dung chính, cho phép cuộn nếu cần */}
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'home' && (
          <Home
            hideNavBar={hideNavBar}
            showNavBar={showNavBar}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'story' && (
          <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />
        )}
        {activeTab === 'quiz' && <Quiz />}
        {activeTab === 'game' && (
          <Game onWordClick={handleWordClickInGame} currentUser={currentUser} />
        )}
      </div>

      {/* Thanh điều hướng dưới cùng */}
      {isNavBarVisible && (
        <NavigationBarBottom
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* Modal hiển thị chi tiết Flashcard */}
      {showVocabPopup && selectedCardForPopup && (
        <FlashcardDetailModal
          selectedCard={selectedCardForPopup}
          showVocabDetail={showVocabPopup}
          exampleImages={exampleImages} // Truyền exampleImages
          onClose={closeVocabPopup}
          currentVisualStyle={'default'} // Kiểu hiển thị mặc định cho popup
        />
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element with ID "root" not found in the document.');
}

const root = createRoot(container);
root.render(<App />);

export default App;
