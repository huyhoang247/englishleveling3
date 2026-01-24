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
import { syncUserData } from './local-data/sync-service.ts';

// Định nghĩa các loại tab
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';
// Định nghĩa các bước của quá trình tải
type LoadingStep = 'authenticating' | 'downloading' | 'launching' | 'ready';

// ==================================================================
// CONSTANTS & PRELOAD
// ==================================================================
const appVersion = "1.0.1";
const BG_LOADING_URL = "/bg-loading.webp"; // URL ảnh background từ public folder

// Hàm tải trước ảnh nền để tránh nháy trắng
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

// Start preloading the background immediately
preloadImage(BG_LOADING_URL);

// ==================================================================
// HÀM HELPER FIREBASE (TỐI ƯU HÓA GHI DATABASE)
// ==================================================================

const ensureUserDocumentExists = async (user: User) => {
  if (!user || !user.uid) { console.error("User object or UID is missing."); return; }
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      // Nếu chưa có user, tạo mới hoàn toàn
      await setDoc(userDocRef, { 
        email: user.email, 
        username: user.displayName || null, 
        createdAt: new Date(), 
        coins: 0, 
        gems: 0, 
        keys: 0, 
        openedImageIds: [] 
      });
    } else {
      // TỐI ƯU: Chỉ ghi vào DB nếu dữ liệu thực sự thay đổi hoặc thiếu
      const userData = userDocSnap.data();
      const updates: any = {};
      
      if (userData?.email !== user.email) {
        updates.email = user.email;
      }
      if (userData?.openedImageIds === undefined) {
        updates.openedImageIds = [];
      }
      if (userData?.username === undefined) {
        updates.username = null;
      }

      // Chỉ gọi setDoc nếu có dữ liệu cần update
      if (Object.keys(updates).length > 0) {
        await setDoc(userDocRef, updates, { merge: true });
      }
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
  appVersion: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingScreenLayout: React.FC<LoadingScreenLayoutProps> = ({ appVersion, children, className }) => {
  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
      {/* Định nghĩa animation float nhẹ nhàng hơn */}
      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
      
      {/* 1. Background Image - Loaded immediately */}
      <img 
        src={BG_LOADING_URL} 
        alt="Loading Background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. Black Overlay with 75% Opacity */}
      <div className="absolute inset-0 bg-black/75 z-0"></div>

      {/* 3. Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-between pt-16 pb-56 w-full h-full text-white font-sans">
        
        {/* Phần Hình ảnh Header */}
        <div className="flex flex-col items-center gap-4 mt-24">
            {/* Gameplay Image - Nhỏ hơn (w-64), dịch xuống (mt-24 ở parent), opacity 90%, animation nhẹ */}
            <img 
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/gameplay.webp" 
                alt="Gameplay" 
                className="w-64 h-auto object-contain opacity-90" 
                style={{ animation: 'gentleFloat 4s ease-in-out infinite' }}
            />
            
            {/* Logo đã được dời xuống footer */}
        </div>
        
        {children}

        {/* Footer: Logo và Version nằm góc phải dưới, căn giữa với nhau */}
        <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-1">
            {/* Logo Image - Nhỏ, opacity 60% */}
            <img 
                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" 
                alt="Loading Logo" 
                className="w-14 h-14 object-contain opacity-60" 
            />
            
            <p className="text-xs font-mono text-gray-500 tracking-wider opacity-60">
                Version {appVersion}
            </p>
        </div>
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

  const [authLoadProgress, setAuthLoadProgress] = useState(0);
  const [ellipsis, setEllipsis] = useState('.');
  const [loadingText, setLoadingText] = useState('Authenticating');

  const isInitialAuthCheck = useRef(true);
  
  // Hiệu ứng dấu chấm chạy (...)
  useEffect(() => { const i = setInterval(() => setEllipsis(p => (p === '...' ? '.' : p + '.')), 500); return () => clearInterval(i); }, []);

  // Thiết lập chiều cao app (tránh lỗi trên iOS Safari)
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  // Giả lập loading thanh auth lúc đầu
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

  // Lắng nghe trạng thái đăng nhập Firebase
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

  // =========================================================================
  // LOGIC TẢI ẢNH SONG SONG + MƯỢT MÀ (SMOOTH PARALLEL LOADING)
  // =========================================================================
  useEffect(() => {
    if (loadingStep !== 'downloading' || !currentUser) return;
    let isCancelled = false;

    async function preloadAndCacheAssets() {
      // Include the background image in the list of assets to verify/cache
      const fullAssetList = [BG_LOADING_URL, ...allImageUrls];

      const isCacheValid = await checkAreAllAssetsCached(fullAssetList);
      
      if (isCacheValid) {
        console.log("All assets are already cached. Skipping download.");
        setLoadingText("Assets loaded from cache");
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log("Starting download...");
        setLoadingText("Downloading assets");
        await cleanupOldCaches();

        const totalAssets = fullAssetList.length;
        
        // CHUNK_SIZE: Số lượng ảnh tải cùng một lúc (Song song)
        const CHUNK_SIZE = 6; 
        let assetsLoadedCount = 0; // Biến đếm cục bộ để theo dõi tiến độ chính xác

        // Vòng lặp tải theo nhóm
        for (let i = 0; i < totalAssets; i += CHUNK_SIZE) {
          if (isCancelled) return;
          
          // Lấy ra một nhóm ảnh
          const chunk = fullAssetList.slice(i, i + CHUNK_SIZE);
          
          // Tạo một mảng các Promise để tải ảnh song song
          const chunkPromises = chunk.map(async (url) => {
            // Tải từng ảnh
            await cacheAsset(url);
            
            // Ngay khi ảnh này tải xong, cập nhật tiến độ ngay lập tức
            if (!isCancelled) {
              assetsLoadedCount++;
              const percent = (assetsLoadedCount / totalAssets) * 100;
              setLoadingProgress(percent);
            }
          });

          // Chờ cho TẤT CẢ các ảnh trong nhóm này tải xong mới sang nhóm tiếp theo
          // (Để tránh làm nghẽn mạng nếu tải hết 1 lần)
          await Promise.all(chunkPromises);
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
      <LoadingScreenLayout appVersion={appVersion}>
        <div className="w-full flex flex-col items-center px-4">
          
          <p className="mt-1 mb-5 text-sm text-white/85 tracking-widest font-['Lilita_One'] uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {text}<span className="inline-block w-3 text-left">{ellipsis}</span>
          </p>

          <div className="w-80 lg:w-96 relative">
            <div className="h-6 w-full bg-black/60 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
              
              {/* THANH PROGRESS BAR MƯỢT MÀ */}
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-end transition-all ease-out"
                // 'duration-300' kết hợp 'ease-out' giúp làm mịn các bước nhảy số liệu
                style={{ 
                  width: `${progress}%`, 
                  transitionDuration: '300ms',
                  boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` 
                }}>
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
    <div className="relative w-screen bg-black" style={{ height: 'var(--app-height, 100vh)' }}>
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
