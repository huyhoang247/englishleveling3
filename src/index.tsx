// --- START OF FILE src/index.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { GameProvider } from './GameContext.tsx';
import { QuizAppProvider } from './courses/course-context.tsx';
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
// Import service đồng bộ dữ liệu mới tạo
import { syncUserData } from './local-data/sync-service.ts';

// Định nghĩa các loại tab
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';
// Định nghĩa các bước của quá trình tải
type LoadingStep = 'authenticating' | 'downloading' | 'launching' | 'ready';

// ==================================================================
// CONSTANTS & PRELOAD
// ==================================================================
const appVersion = "1.0.1";
const BG_LOADING_URL = "/bg-loading.jpeg"; // URL ảnh background từ public folder

function loadGlobalFonts() {
  const fontUrl = "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap";
  
  if (!document.querySelector(`link[href="${fontUrl}"]`)) {
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    console.log("Global font 'Lilita One' loaded via index.tsx");
  }
}
loadGlobalFonts();

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

// Start preloading the background immediately to avoid white flash
preloadImage(BG_LOADING_URL);

// ==================================================================
// HÀM HELPER FIREBASE
// ==================================================================

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

// ==================================================================
// CÁC HÀM HELPER ĐỂ QUẢN LÝ CACHE
// ==================================================================
const ASSET_CACHE_PREFIX = 'english-leveling-assets';
const ASSET_CACHE_NAME = `${ASSET_CACHE_PREFIX}-v${appVersion}`;

async function checkAreAllAssetsCached(urls: string[]): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(ASSET_CACHE_NAME);
    const cachedRequests = await cache.keys();
    const cachedUrls = new Set(cachedRequests.map(req => req.url));
    // Check both relative and absolute paths
    return urls.every(url => {
        const absoluteUrl = new URL(url, window.location.origin).href;
        return cachedUrls.has(absoluteUrl);
    });
  } catch (error) {
    console.error("Error checking asset cache:", error);
    return false;
  }
}

async function cacheAsset(url: string): Promise<void> {
    if (!('caches' in window)) return;
    try {
        const cache = await caches.open(ASSET_CACHE_NAME);
        // Use 'no-cache' to ensure we get a fresh copy if we are caching explicitly
        const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
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
// COMPONENT LAYOUT CHUNG CHO MÀN HÌNH LOADING
// ==================================================================
interface LoadingScreenLayoutProps {
  logoFloating: boolean;
  appVersion: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingScreenLayout: React.FC<LoadingScreenLayoutProps> = ({ logoFloating, appVersion, children, className }) => {
  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      
      {/* 1. Background Image - Loaded immediately */}
      <img 
        src={BG_LOADING_URL} 
        alt="Loading Background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. Black Overlay with 75% Opacity */}
      <div className="absolute inset-0 bg-black/75 z-0"></div>

      {/* 3. Content Container (Z-Index 10 to float above overlay) */}
      <div className="relative z-10 flex flex-col items-center justify-between pt-28 pb-56 w-full h-full text-white font-sans">
        <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" 
            alt="Loading Logo" 
            className={`w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`} 
            style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} 
        />
        
        {children}

        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
            Version {appVersion}
        </p>
      </div>
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
            try {
              await syncUserData(user.uid);
            } catch (err) {
              console.error("Initial sync failed but continuing app load:", err);
            }
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
        if (user) {
            syncUserData(user.uid).catch(console.error);
        }
        handleAuthChange(user);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (loadingStep !== 'downloading' || !currentUser) return;
    let isCancelled = false;

    async function preloadAndCacheAssets() {
      // Include the background image in the list of assets to verify/cache
      const fullAssetList = [BG_LOADING_URL, ...allImageUrls];

      const isCacheValid = await checkAreAllAssetsCached(fullAssetList);
      
      if (isCacheValid) {
        console.log("All assets (including BG) are already cached. Skipping download.");
        setLoadingText("Assets loaded from cache");
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log("Cache is outdated or incomplete. Starting download...");
        setLoadingText("Downloading assets");
        await cleanupOldCaches();

        const totalAssets = fullAssetList.length;
        for (let i = 0; i < totalAssets; i++) {
          if (isCancelled) return;
          await cacheAsset(fullAssetList[i]);
          setLoadingProgress(Math.round(((i + 1) / totalAssets) * 100));
        }
      }

      if (!isCancelled) {
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
  
  useEffect(() => {
    if (loadingStep === 'launching') {
      const stepTimer = setTimeout(() => {
          setLoadingStep('ready');
      }, 2000);
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
          
          <p className="mt-1 mb-5 text-sm text-white/85 tracking-widest font-['Lilita_One'] uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {text}<span className="inline-block w-3 text-left">{ellipsis}</span>
          </p>

          <div className="w-80 lg:w-96 relative">
            <div className="h-6 w-full bg-black/60 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
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
  
  // Giao diện chính của ứng dụng
  return (
    <div className="relative w-screen" style={{ height: 'var(--app-height, 100vh)' }}>
      <GameProvider hideNavBar={hideNavBar} showNavBar={showNavBar} assetsLoaded={true}>
        <QuizAppProvider>
          <div className="app-container" style={{ height: '100%' }}>
            {activeTab === 'home' && <Home hideNavBar={hideNavBar} showNavBar={showNavBar} />}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'story' && <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />}
            {activeTab === 'quiz' && <QuizAppHome hideNavBar={hideNavBar} showNavBar={showNavBar} />}
            {activeTab === 'game' && <GameBrowser hideNavBar={hideNavBar} showNavBar={showNavBar} />}
            {isNavBarVisible && <NavigationBarBottom activeTab={activeTab} onTabChange={handleTabChange} />}
          </div>
          
          <GameSkeletonLoader show={loadingStep === 'launching'} />
        </QuizAppProvider>
      </GameProvider>
    </div>
  );
};

const container = document.getElementById('root');
if (!container) throw new Error('Root element with ID "root" not found in the document.');
const root = createRoot(container);
root.render(<App />);

export default App;
