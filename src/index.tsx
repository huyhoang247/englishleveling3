// --- START OF FILE src/index.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { GameProvider } from './GameContext.tsx';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx';
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './profile/profile.tsx';
import QuizAppHome from './courses/course-ui.tsx';
import GameBrowser from './ebook/ebook-ui.tsx';
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { allImageUrls } from './game-assets.ts';
import GameSkeletonLoader from './GameSkeletonLoader.tsx';

// Định nghĩa các loại tab
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';
// Định nghĩa các bước của quá trình tải (ĐÃ ĐƠN GIẢN HÓA)
type LoadingStep = 'authenticating' | 'downloading' | 'launching' | 'ready';

// ==================================================================
// HÀM HELPER (Không thay đổi)
// ==================================================================
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => {
        console.warn(`Failed to preload image, but continuing: ${src}`);
        resolve();
    };
  });
}

const ensureUserDocumentExists = async (user: User) => {
  if (!user || !user.uid) { console.error("User object or UID is missing."); return; }
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, { email: user.email, username: user.displayName || null, createdAt: new Date(), coins: 0, gems: 0, keys: 0, openedImageIds: [] });
    } else {
      const userData = userDocSnap.data();
      if (userData?.email !== user.email) { await setDoc(userDocRef, { email: user.email }, { merge: true }); }
      if (!userData?.openedImageIds) { await setDoc(userDocRef, { openedImageIds: [] }, { merge: true }); }
      if (!userData?.username) { await setDoc(userDocRef, { username: null }, { merge: true }); }
    }
  } catch (error) { console.error("Error ensuring user document exists:", error); }
};

const enterFullScreen = async () => {
  const element = document.documentElement;
  try {
    if (element.requestFullscreen) { await element.requestFullscreen(); }
    else if ((element as any).mozRequestFullScreen) { await (element as any).mozRequestFullScreen(); }
    else if ((element as any).webkitRequestFullscreen) { await (element as any).webkitRequestFullscreen(); }
    else if ((element as any).msRequestFullscreen) { await (element as any).msRequestFullscreen(); }
  } catch (error) { console.warn("Failed to enter full-screen mode:", error); }
};

const appVersion = "1.0.1";

// ==================================================================
// CÁC HÀM HELPER ĐỂ QUẢN LÝ CACHE (Không thay đổi)
// ==================================================================
const ASSET_CACHE_PREFIX = 'english-leveling-assets';
const ASSET_CACHE_NAME = `${ASSET_CACHE_PREFIX}-v${appVersion}`;

async function checkAreAllAssetsCached(urls: string[]): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(ASSET_CACHE_NAME);
    const cachedRequests = await cache.keys();
    const cachedUrls = new Set(cachedRequests.map(req => req.url));
    return urls.every(url => cachedUrls.has(new URL(url, window.location.origin).href));
  } catch (error) {
    console.error("Error checking asset cache:", error);
    return false;
  }
}

async function cacheAsset(url: string): Promise<void> {
    if (!('caches' in window)) return;
    try {
        const cache = await caches.open(ASSET_CACHE_NAME);
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
            await cache.put(url, response);
        } else {
            console.warn(`Failed to fetch and cache asset: ${url}, status: ${response.status}`);
        }
    } catch (error) {
        console.warn(`Could not cache asset ${url}:`, error);
    }
}

async function cleanupOldCaches() {
    if (!('caches' in window)) return;
    try {
        const cacheKeys = await caches.keys();
        const cachesToDelete = cacheKeys.filter(key => key.startsWith(ASSET_CACHE_PREFIX) && key !== ASSET_CACHE_NAME);
        await Promise.all(cachesToDelete.map(key => caches.delete(key)));
        console.log("Old caches cleaned up.");
    } catch (error) {
        console.error("Error cleaning up old caches:", error);
    }
}

// ==================================================================
// COMPONENT LAYOUT CHUNG CHO MÀN HÌNH LOADING (Không thay đổi)
// ==================================================================
interface LoadingScreenLayoutProps {
  logoFloating: boolean;
  appVersion: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingScreenLayout: React.FC<LoadingScreenLayoutProps> = ({ logoFloating, appVersion, children, className }) => {
  return (
    <div className={`relative flex flex-col items-center justify-between pt-28 pb-56 w-full h-screen bg-slate-950 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black overflow-hidden ${className}`}>
      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Loading Logo" className={`w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`} style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
      {children}
      <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
    </div>
  );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('authenticating');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [logoFloating, setLogoFloating] = useState(true);
  const [authLoadProgress, setAuthLoadProgress] = useState(0);
  const [ellipsis, setEllipsis] = useState('.');
  const [loadingText, setLoadingText] = useState('Authenticating');

  const isInitialAuthCheck = useRef(true);
  useEffect(() => { const i = setInterval(() => setLogoFloating(p => !p), 2500); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setEllipsis(p => (p === '...' ? '.' : p + '.')), 500); return () => clearInterval(i); }, []);

  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  useEffect(() => {
    if (loadingStep === 'authenticating') {
      const i = setInterval(() => { setAuthLoadProgress(p => (p >= 95 ? 95 : p + Math.floor(Math.random() * 5) + 2)); }, 120);
      return () => clearInterval(i);
    }
  }, [loadingStep]);

  const handleAuthChange = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
        setLoadingText('Verifying assets');
        setLoadingStep('downloading');
    } else {
        setLoadingStep('ready');
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (isInitialAuthCheck.current) {
        isInitialAuthCheck.current = false;
        const processInitialAuth = async () => {
          const startTime = Date.now();
          if (user) {
            await ensureUserDocumentExists(user);
          }
          const elapsedTime = Date.now() - startTime;
          const remainingDelay = 1500 - elapsedTime;
          if (remainingDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingDelay));
          }
          handleAuthChange(user);
        };
        processInitialAuth();
      } else {
        handleAuthChange(user);
      }
    });
    return () => unsub();
  }, []);

  // --- THAY ĐỔI LỚN: Logic tải và cache tài nguyên, tự động chuyển tiếp ---
  useEffect(() => {
    if (loadingStep !== 'downloading' || !currentUser) return;
    let isCancelled = false;

    async function preloadAndCacheAssets() {
      const isCacheValid = await checkAreAllAssetsCached(allImageUrls);
      
      if (isCacheValid) {
        console.log("All assets are already cached. Skipping download.");
        setLoadingText("Assets loaded from cache");
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log("Cache is outdated or incomplete. Starting download...");
        setLoadingText("Downloading assets");
        await cleanupOldCaches();

        const totalAssets = allImageUrls.length;
        for (let i = 0; i < totalAssets; i++) {
          if (isCancelled) return;
          await cacheAsset(allImageUrls[i]);
          setLoadingProgress(Math.round(((i + 1) / totalAssets) * 100));
        }
      }

      // 3. Sau khi hoàn tất, tự động chuyển sang bước launching
      if (!isCancelled) {
        // Tự động vào game sau khi tải xong, không cần hỏi
        // Thử vào chế độ toàn màn hình nếu đã lưu trước đó
        const savedMode = localStorage.getItem('displayMode');
        if (savedMode === 'fullscreen') {
            await enterFullScreen();
        }
        setLoadingStep('launching');
      }
    }

    preloadAndCacheAssets();
    return () => { isCancelled = true; };
  }, [loadingStep, currentUser]);
  
  // Tự động chuyển từ launching sang ready sau một khoảng thời gian
  useEffect(() => {
    if (loadingStep === 'launching') {
      const stepTimer = setTimeout(() => {
          setLoadingStep('ready');
      }, 2000); // Thời gian cho hiệu ứng chuyển cảnh
      return () => { clearTimeout(stepTimer); };
    }
  }, [loadingStep]);


  const handleTabChange = (tab: TabType) => { setActiveTab(tab); setIsNavBarVisible(true); };
  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);

  // Màn hình loading (authenticating và downloading)
  if (loadingStep === 'authenticating' || loadingStep === 'downloading') {
    const isAuthenticating = loadingStep === 'authenticating';
    const progress = isAuthenticating ? authLoadProgress : loadingProgress;
    const text = isAuthenticating ? 'Authenticating' : loadingText;
    return (
      <LoadingScreenLayout logoFloating={logoFloating} appVersion={appVersion}>
        <div className="w-full flex flex-col items-center px-4">
          <p className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">{text}<span className="inline-block w-3 text-left">{ellipsis}</span></p>
          <div className="w-80 lg:w-96 relative">
            <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end"
                style={{ width: `${progress}%`, boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` }}>
                {progress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{Math.round(progress)}%</div>
          </div>
        </div>
      </LoadingScreenLayout>
    );
  }

  // Màn hình đăng nhập nếu chưa có user
  if (!currentUser) { return <AuthComponent appVersion={appVersion} />; }
  
  // --- CHANGE START ---
  // Khi loadingStep đã là 'ready' hoặc 'launching', hiển thị giao diện game
  // Bọc toàn bộ ứng dụng trong GameProvider để context có sẵn ở mọi nơi.
  return (
    <div className="relative w-screen" style={{ height: 'var(--app-height, 100vh)' }}>
      <GameProvider hideNavBar={hideNavBar} showNavBar={showNavBar} assetsLoaded={true}>
        <div className="app-container" style={{ height: '100%' }}>
          {activeTab === 'home' && <Home hideNavBar={hideNavBar} showNavBar={showNavBar} />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'story' && <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />}
          {activeTab === 'quiz' && <QuizAppHome hideNavBar={hideNavBar} showNavBar={showNavBar} />}
          {activeTab === 'game' && <GameBrowser hideNavBar={hideNavBar} showNavBar={showNavBar} />}
          {isNavBarVisible && <NavigationBarBottom activeTab={activeTab} onTabChange={handleTabChange} />}
        </div>
        
        {/* Hiệu ứng mờ dần khi game bắt đầu */}
        <GameSkeletonLoader show={loadingStep === 'launching'} />
      </GameProvider>
    </div>
  );
  // --- CHANGE END ---
};

const container = document.getElementById('root');
if (!container) throw new Error('Root element with ID "root" not found in the document.');
const root = createRoot(container);
root.render(<App />);

export default App;

// --- END OF FILE src/index.tsx ---
