// src/index.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Component chính của màn hình 'home'
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './voca-rank.tsx';
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
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // <-- STATE MỚI: Theo dõi tiến trình tải

  // Effect để tải trước tất cả tài nguyên game, CHỈ KHI ĐÃ ĐĂNG NHẬP
  useEffect(() => {
    let isCancelled = false;
    async function preloadAssets() {
      console.log("Preloading ALL game assets from index.tsx (triggered by login)...");
      const totalAssets = allImageUrls.length;

      // <-- Bắt đầu tải tài nguyên bằng vòng lặp để cập nhật tiến trình
      for (let i = 0; i < totalAssets; i++) {
        if (isCancelled) return; // Dừng lại nếu component bị unmount

        await preloadImage(allImageUrls[i]); // Tải từng ảnh một

        // <-- Tính toán và cập nhật tiến trình
        const progress = Math.round(((i + 1) / totalAssets) * 100);
        setLoadingProgress(progress);
      }
      
      if (!isCancelled) {
        console.log("All game assets preloaded and cached.");
        // <-- Đặt một khoảng chờ ngắn để người dùng thấy 100% trước khi chuyển màn hình
        setTimeout(() => {
            if (!isCancelled) setAssetsLoaded(true);
        }, 300);
      }
    }
    // Bắt đầu tải tài nguyên chỉ khi có người dùng và tài nguyên chưa được tải.
    if (currentUser && !assetsLoaded) {
        preloadAssets();
    }
    return () => { isCancelled = true; };
  }, [currentUser, assetsLoaded]); // Chạy lại khi người dùng đăng nhập hoặc khi tài nguyên tải xong

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

  // Giai đoạn 1: Chờ kiểm tra trạng thái đăng nhập ban đầu
  if (loadingAuth) {
    const progress = 10; // Giả lập một chút tiến trình cho việc xác thực
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-slate-950 text-white font-sans
                      bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-slate-950 to-black">

        {/* --- Game-like Logo Animation --- */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '6s', animationTimingFunction: 'linear' }}></div>
            <div className="absolute inset-2 border-t-2 border-cyan-500/80 rounded-full animate-spin" style={{ animationDuration: '2.5s', animationTimingFunction: 'ease-in-out' }}></div>
            <div className="text-5xl font-black text-cyan-400/80" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                G
            </div>
        </div>

        {/* --- Loading Status Text --- */}
        <h1 className="text-xl font-bold tracking-wider text-gray-200 uppercase"
            style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.3)' }}>
            Đang Tải
        </h1>
        <p className="mt-1 mb-5 text-sm text-cyan-400/70 tracking-wide">
            Xác thực người dùng...
        </p>

        {/* --- Progress Bar --- */}
        <div className="w-80 lg:w-96 relative">
          <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1"
               style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(0, 255, 255, 0.1)' }}>
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
              style={{ width: `${progress}%` }} >
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
               style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
             {Math.round(progress)}%
          </div>
        </div>
      </div>
    );
  }

  // Giai đoạn 2: Nếu chưa đăng nhập, hiển thị màn hình đăng nhập
  if (!currentUser) {
    return <AuthComponent />;
  }

  // Giai đoạn 3: Đã đăng nhập, nhưng đang chờ tải tài nguyên game
  if (!assetsLoaded) {
    // <-- KHÔNG còn gán cứng `const progress = 50` nữa
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-slate-950 text-white font-sans
                      bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-slate-950 to-black">

        {/* --- Game-like Logo Animation --- */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '6s', animationTimingFunction: 'linear' }}></div>
            <div className="absolute inset-2 border-t-2 border-cyan-500/80 rounded-full animate-spin" style={{ animationDuration: '2.5s', animationTimingFunction: 'ease-in-out' }}></div>
            <div className="text-5xl font-black text-cyan-400/80" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                G
            </div>
        </div>

        {/* --- Loading Status Text --- */}
        <h1 className="text-xl font-bold tracking-wider text-gray-200 uppercase"
            style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.3)' }}>
            ĐANG TẢI
        </h1>
        <p className="mt-1 mb-5 text-sm text-cyan-400/70 tracking-wide">
            Chuẩn bị tài nguyên...
        </p>

        {/* --- Progress Bar --- */}
        <div className="w-80 lg:w-96 relative">
          <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1"
               style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(0, 255, 255, 0.1)' }}>
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
              style={{
                width: `${loadingProgress}%`, // <-- SỬ DỤNG STATE Ở ĐÂY
                boxShadow: `0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 200, 255, 0.3)`
              }}
            >
                {/* <-- SỬ DỤNG STATE Ở ĐÂY */}
                {loadingProgress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
               style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
             {Math.round(loadingProgress)}%  {/* <-- VÀ Ở ĐÂY */}
          </div>
        </div>
      </div>
    );
  }

  // Giai đoạn 4: Mọi thứ đã sẵn sàng, hiển thị ứng dụng
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
