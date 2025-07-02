// --- START OF FILE index.tsx (17).txt ---

// src/index.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Component chính của màn hình 'home'
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './check-grammar.tsx';
import Quiz from './quiz/quiz-app-home.tsx';
import GameBrowser from './game.tsx';
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { allImageUrls } from './game-assets.ts'; // <-- IMPORT MỚI: Danh sách tài nguyên cần tải

// Định nghĩa các loại tab có thể có
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';

// ==================================================================
// HÀM HELPER ĐỂ TẢI TRƯỚC HÌNH ẢNH (ĐÃ CHUYỂN TỪ background-game.tsx)
// ==================================================================
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => {
        console.warn(`Failed to preload image, but continuing: ${src}`);
        resolve(); // Vẫn resolve để không làm kẹt quá trình tải
    };
  });
}

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
        username: user.displayName || null,
        createdAt: new Date(),
        coins: 0,
        gems: 0,
        keys: 0,
        openedImageIds: []
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
           await setDoc(userDocRef, { username: null }, { merge: true });
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
  const [assetsLoaded, setAssetsLoaded] = useState(false); // <-- STATE MỚI: Theo dõi tải tài nguyên

  // Effect để tải trước tất cả tài nguyên game
  useEffect(() => {
    let isCancelled = false;
    async function preloadAssets() {
      console.log("Preloading ALL game assets from index.tsx...");
      await Promise.all(allImageUrls.map(preloadImage));
      if (!isCancelled) {
        console.log("All game assets preloaded and cached.");
        setAssetsLoaded(true); // Đánh dấu đã tải xong
      }
    }
    preloadAssets();
    return () => { isCancelled = true; };
  }, []); // Chạy 1 lần duy nhất khi App được mount

  // Effect để lắng nghe trạng thái đăng nhập
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
    if (tab !== 'story' && tab !== 'game') {
      setIsNavBarVisible(true);
    }
    if (tab === 'story' || tab === 'game') {
      setIsNavBarVisible(true);
    }
  };

  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);

  // Màn hình tải hợp nhất: Chờ cả xác thực VÀ tài nguyên
  if (loadingAuth || !assetsLoaded) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-950 text-white">
            <div className="text-lg font-semibold">Đang tải...</div>
            <div className="w-64 bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
                <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    // Tính toán thanh tiến trình dựa trên cả 2 tác vụ
                    style={{ width: `${(loadingAuth ? 0 : 50) + (assetsLoaded ? 50 : 0)}%` }}>
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-400">
                {loadingAuth ? "Đang xác thực người dùng..." : "Đang chuẩn bị tài nguyên..."}
            </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthComponent />;
  }

  return (
    <div className="app-container">
      {activeTab === 'home' && (
        <Home
          hideNavBar={hideNavBar}
          showNavBar={showNavBar}
          currentUser={currentUser}
          assetsLoaded={assetsLoaded} // <-- TRUYỀN PROP `assetsLoaded` VÀO HOME
        />
      )}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'story' && (
        <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />
      )}
      {activeTab === 'quiz' && <Quiz />}
      {activeTab === 'game' && (
        <GameBrowser hideNavBar={hideNavBar} showNavBar={showNavBar} />
      )}

      {isNavBarVisible && (
        <NavigationBarBottom
          activeTab={activeTab}
          onTabChange={handleTabChange}
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
