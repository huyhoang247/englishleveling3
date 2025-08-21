// src/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Component chính của màn hình 'home'
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './candy.tsx';
import QuizAppHome from './courses/course-ui.tsx';
import GameBrowser from './game.tsx';
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { allImageUrls } from './game-assets.ts';

// Định nghĩa các loại tab có thể có
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';
// Định nghĩa các chế độ hiển thị
type DisplayMode = 'fullscreen' | 'normal';

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

// ==================================================================
// HÀM HELPER CHO CHẾ ĐỘ TOÀN MÀN HÌNH
// ==================================================================
const enterFullScreen = async () => {
  const element = document.documentElement;
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).mozRequestFullScreen) { // Firefox
      await (element as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) { // IE/Edge
      await (element as any).msRequestFullscreen();
    }
  } catch (error) {
    console.warn("Failed to enter full-screen mode:", error);
  }
};

const appVersion = "1.0.1"; // VERSION CỦA ỨNG DỤNG

// Component Icon cho các lựa chọn trong dropdown
const ModeIcon: React.FC<{ mode: DisplayMode; className?: string }> = ({ mode, className }) => {
  if (mode === 'fullscreen') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [logoFloating, setLogoFloating] = useState(true);
  const [authLoadProgress, setAuthLoadProgress] = useState(0);
  const [ellipsis, setEllipsis] = useState('.');

  // State cho thiết kế dropdown
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedMode, setSelectedMode] = useState<DisplayMode>('normal');
  const [rememberChoice, setRememberChoice] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect cho animation logo, ellipsis, và loading auth
  useEffect(() => {
    const interval = setInterval(() => setLogoFloating(prev => !prev), 2500);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const ellipsisInterval = setInterval(() => setEllipsis(prev => (prev === '...' ? '.' : prev + '.')), 500);
    return () => clearInterval(ellipsisInterval);
  }, []);

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

  // Hàm bắt đầu game
  const startGame = async (mode: DisplayMode, savePreference: boolean) => {
    if (savePreference) {
      localStorage.setItem('displayMode', mode);
    }
    if (mode === 'fullscreen') {
      await enterFullScreen();
    }
    setTimeout(() => setAssetsLoaded(true), 150);
  };

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
        const savedMode = localStorage.getItem('displayMode') as DisplayMode | null;
        if (savedMode) {
            await startGame(savedMode, false);
        } else {
            setTimeout(() => { if (!isCancelled) setShowModeSelector(true); }, 500);
        }
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

  // Effect để đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsNavBarVisible(true);
  };
  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);

  // Giai đoạn 1: Loading xác thực
  if (loadingAuth) {
    const progress = authLoadProgress;
    return (
      <div className="relative flex flex-col items-center justify-start pt-28 w-full h-screen bg-slate-950 text-white font-sans
                      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black">
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Loading Logo"
             className={`w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`}
             style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
        <div className="flex-grow" />
        <div className="w-full flex flex-col items-center px-4 pb-56">
            <p className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">Authenticating<span className="inline-block w-3 text-left">{ellipsis}</span></p>
            <div className="w-80 lg:w-96 relative">
              <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
                     style={{ width: `${progress}%`, boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` }}>
                  {progress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                 {Math.min(100, Math.round(progress))}%
              </div>
            </div>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
      </div>
    );
  }

  // Giai đoạn 2: Chưa đăng nhập
  if (!currentUser) {
    return <AuthComponent appVersion={appVersion} />;
  }

  // Giai đoạn 3: Đã đăng nhập, chờ tải tài nguyên
  if (!assetsLoaded) {
    return (
      <div className="relative flex flex-col items-center justify-start pt-20 sm:pt-28 w-full h-screen bg-slate-950 text-white font-sans
                      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black overflow-hidden">
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Loading Logo"
             className={`w-40 h-40 sm:w-48 sm:h-48 object-contain transition-all ease-in-out duration-1000 ${logoFloating ? '-translate-y-3' : 'translate-y-0'} ${showModeSelector ? 'scale-90 -translate-y-4' : ''}`}
             style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
        <div className="flex-grow" />

        {/* --- Giao diện lựa chọn chế độ Dropdown --- */}
        <div className="w-full flex flex-col items-center px-4 pb-24 sm:pb-32 transition-opacity duration-500"
             style={{ opacity: showModeSelector ? 1 : 0, visibility: showModeSelector ? 'visible' : 'hidden' }}>
            <div className="relative w-full max-w-xs" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between p-3 bg-black/40 border-2 border-gray-600 rounded-lg text-white hover:border-cyan-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors duration-300">
                <span className="flex items-center">
                  <ModeIcon mode={selectedMode} className="w-5 h-5 mr-3 text-cyan-300" />
                  <span className="font-semibold tracking-wide">{selectedMode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
                  {(['fullscreen', 'normal'] as DisplayMode[]).map(mode => (
                    <button key={mode} onClick={() => { setSelectedMode(mode); setIsDropdownOpen(false); }}
                            className="w-full text-left flex items-center p-3 text-white/90 hover:bg-cyan-500/20 transition-colors duration-200">
                      <ModeIcon mode={mode} className="w-5 h-5 mr-3 text-cyan-300" />
                      <span className="font-semibold tracking-wide">{mode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div onClick={() => setRememberChoice(prev => !prev)}
                 className="mt-4 flex items-center cursor-pointer p-2 rounded-md hover:bg-white/10 transition-colors">
              {rememberChoice ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <span className="ml-2 text-sm text-gray-300">Remember choice</span>
            </div>
            <button onClick={() => startGame(selectedMode, rememberChoice)}
                    className="mt-5 w-full max-w-xs py-3 bg-cyan-600/90 border border-cyan-400 rounded-lg text-white font-bold tracking-widest hover:bg-cyan-500 hover:scale-105 transform transition-all duration-300 shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-300">
              LAUNCH
            </button>
        </div>
        
        {/* Thanh tiến trình tải */}
        <div className="w-full flex flex-col items-center px-4 pb-32 sm:pb-40 transition-opacity duration-500 absolute bottom-0"
             style={{ opacity: !showModeSelector ? 1 : 0, visibility: !showModeSelector ? 'visible' : 'hidden' }}>
            <p className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">Downloading assets<span className="inline-block w-3 text-left">{ellipsis}</span></p>
            <div className="w-80 lg:w-96 relative">
              <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
                     style={{ width: `${loadingProgress}%`, boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` }}>
                    {loadingProgress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                 {Math.round(loadingProgress)}%
              </div>
            </div>
        </div>
        
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
      </div>
    );
  }

  // Giai đoạn 4: Mọi thứ đã sẵn sàng, hiển thị ứng dụng
  return (
    <div className="app-container">
      {activeTab === 'home' && (
        <Home hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} assetsLoaded={assetsLoaded} />
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
        <NavigationBarBottom activeTab={activeTab} onTabChange={handleTabChange} />
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
