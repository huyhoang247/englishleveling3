// src/index.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Component chính của màn hình 'home'
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './building.tsx';
import QuizAppHome from './courses/course-ui.tsx';
import GameBrowser from './game.tsx';
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { allImageUrls } from './game-assets.ts';
// import { AchievementsProvider } from './contexts/AchievementsContext.tsx'; // Đã loại bỏ

// Định nghĩa các loại tab có thể có
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';

// ==================================================================
// HÀM HELPER ĐỂ TẢI TRƯỚC HÌNH ẢNH
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


const appVersion = "1.0.1"; // VERSION CỦA ỨNG DỤNG

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [logoFloating, setLogoFloating] = useState(true);
  const [authLoadProgress, setAuthLoadProgress] = useState(0);

  // Effect để tạo animation "float" cho logo trên màn hình loading
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoFloating(prev => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Effect để tạo hiệu ứng tải cho màn hình xác thực
  useEffect(() => {
    if (loadingAuth) {
      const interval = setInterval(() => {
        setAuthLoadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 5) + 2; 
        });
      }, 120);
      return () => clearInterval(interval);
    }
  }, [loadingAuth]);

  // Effect để tải trước tất cả tài nguyên game
  useEffect(() => {
    let isCancelled = false;
    async function preloadAssets() {
      console.log("Preloading ALL game assets from index.tsx (triggered by login)...");
      const totalAssets = allImageUrls.length;

      for (let i = 0; i < totalAssets; i++) {
        if (isCancelled) return;
        await preloadImage(allImageUrls[i]);
        const progress = Math.round(((i + 1) / totalAssets) * 100);
        setLoadingProgress(progress);
      }
      
      if (!isCancelled) {
        console.log("All game assets preloaded and cached.");
        setTimeout(() => {
            if (!isCancelled) setAssetsLoaded(true);
        }, 300);
      }
    }
    if (currentUser && !assetsLoaded) {
        preloadAssets();
    }
    return () => { isCancelled = true; };
  }, [currentUser, assetsLoaded]);

  // Effect để lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
       setTimeout(async () => {
        setCurrentUser(user);
        if (user) {
          await ensureUserDocumentExists(user);
        }
        setLoadingAuth(false);
      }, 1500);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsNavBarVisible(true);
  };

  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);

  // Giai đoạn 1: Chờ kiểm tra trạng thái đăng nhập ban đầu
  if (loadingAuth) {
    const progress = authLoadProgress;
    return (
      <div className="relative flex flex-col items-center justify-start pt-40 w-full h-screen bg-slate-950 text-white font-sans
                      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black">
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp"
          alt="Loading Logo"
          className={`w-48 h-48 object-contain mb-8 transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`}
          style={{
              filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))',
          }}
        />
        {/* SỬA ĐỔI: Đồng bộ giao diện */}
        <h1 className="text-xl font-bold tracking-wider text-gray-200 uppercase"
            style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.3)' }}>
            ĐANG TẢI
        </h1>
        <p className="mt-1 mb-5 text-sm text-cyan-400/70 tracking-wide">
            Xác thực người dùng...
        </p>
        <div className="w-80 lg:w-96 relative"> {/* SỬA ĐỔI: Bỏ mt-5 */}
          <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1"
               style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(0, 255, 255, 0.1)' }}>
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
              style={{ width: `${progress}%` }} >
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
               style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
             {Math.min(100, Math.round(progress))}%
          </div>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          Version {appVersion}
        </p>
      </div>
    );
  }

  // Giai đoạn 2: Nếu chưa đăng nhập, hiển thị màn hình đăng nhập
  if (!currentUser) {
    return <AuthComponent appVersion={appVersion} />;
  }

  // Giai đoạn 3: Đã đăng nhập, nhưng đang chờ tải tài nguyên game
  if (!assetsLoaded) {
    return (
      <div className="relative flex flex-col items-center justify-start pt-40 w-full h-screen bg-slate-950 text-white font-sans
                      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black">
        <img
          src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp"
          alt="Loading Logo"
          className={`w-48 h-48 object-contain mb-8 transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`}
          style={{
              filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))',
          }}
        />
        <h1 className="text-xl font-bold tracking-wider text-gray-200 uppercase"
            style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.3)' }}>
            ĐANG TẢI
        </h1>
        <p className="mt-1 mb-5 text-sm text-cyan-400/70 tracking-wide">
            Chuẩn bị tài nguyên...
        </p>
        <div className="w-80 lg:w-96 relative">
          <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1"
               style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(0, 255, 255, 0.1)' }}>
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
              style={{
                width: `${loadingProgress}%`,
                boxShadow: `0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 200, 255, 0.3)`
              }}
            >
                {loadingProgress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
               style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
             {Math.round(loadingProgress)}%
          </div>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          Version {appVersion}
        </p>
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
            assetsLoaded={assetsLoaded}
          />
        )}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'story' && (
          <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />
        )}
        
        {activeTab === 'quiz' && (
          <QuizAppHome hideNavBar={hideNavBar} showNavBar={showNavBar} />
        )}
        
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
