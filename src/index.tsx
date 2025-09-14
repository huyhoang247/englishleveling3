// --- START OF FILE src/index.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { GameProvider } from './GameContext.tsx';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx';
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './profile.tsx';
import QuizAppHome from './courses/course-ui.tsx';
import GameBrowser from './ebook/ebook-ui.tsx';
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { allImageUrls } from './game-assets.ts';
import GameSkeletonLoader from './GameSkeletonLoader.tsx';

// Định nghĩa các loại tab và chế độ hiển thị
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';
type DisplayMode = 'fullscreen' | 'normal';
// Định nghĩa các bước của quá trình tải
type LoadingStep = 'authenticating' | 'downloading' | 'selecting_mode' | 'launching' | 'ready';

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

const ModeIcon: React.FC<{ mode: DisplayMode; className?: string }> = ({ mode, className }) => {
  if (mode === 'fullscreen') { return (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>); }
  return (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
};

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
  const [selectedMode, setSelectedMode] = useState<DisplayMode>('normal');
  const [rememberChoice, setRememberChoice] = useState(true);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [isAnimatingStart, setIsAnimatingStart] = useState(false);

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

  const handleAuthChange = async (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      await ensureUserDocumentExists(user);
      setLoadingStep('downloading');
    } else {
      setLoadingStep('ready');
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (isInitialAuthCheck.current) {
        isInitialAuthCheck.current = false;
        setTimeout(() => handleAuthChange(user), 1500);
      } else {
        handleAuthChange(user);
      }
    });
    return () => unsub();
  }, []);
  
  const handleStartClick = async (mode: DisplayMode, savePreference: boolean) => {
    if (isAnimatingStart) return;
    setIsAnimatingStart(true);
    if (savePreference) localStorage.setItem('displayMode', mode);
    if (mode === 'fullscreen') await enterFullScreen();
  };

  useEffect(() => {
    if (loadingStep !== 'downloading' || !currentUser) return;
    let isCancelled = false;
    async function preloadAssets() {
      const totalAssets = allImageUrls.length;
      for (let i = 0; i < totalAssets; i++) {
        if (isCancelled) return;
        await preloadImage(allImageUrls[i]);
        setLoadingProgress(Math.round(((i + 1) / totalAssets) * 100));
      }
      if (!isCancelled) {
        const savedMode = localStorage.getItem('displayMode') as DisplayMode | null;
         if (savedMode) {
            handleStartClick(savedMode, false); 
         } else {
            setLoadingStep('selecting_mode');
         }
      }
    }
    preloadAssets();
    return () => { isCancelled = true; };
  }, [loadingStep, currentUser]);
  
  useEffect(() => {
    if (!isAnimatingStart) return;
    
    const transitionTimer = setTimeout(() => {
        setLoadingStep('launching');
    }, 2000);

    return () => clearTimeout(transitionTimer);
  }, [isAnimatingStart]);


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

  if (loadingStep === 'authenticating' || loadingStep === 'downloading') {
    const isAuthenticating = loadingStep === 'authenticating';
    const progress = isAuthenticating ? authLoadProgress : loadingProgress;
    const text = isAuthenticating ? 'Authenticating' : 'Downloading assets';
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

  if (!currentUser) { return <AuthComponent appVersion={appVersion} logoFloating={logoFloating} />; }

  if (loadingStep === 'selecting_mode' || (loadingStep === 'launching' && isAnimatingStart)) {
    const ModeSelectionModal: React.FC<{ onSelect: (mode: DisplayMode) => void, onClose: () => void, currentMode: DisplayMode }> = ({ onSelect, onClose, currentMode }) => {
        const modes: DisplayMode[] = ['fullscreen', 'normal'];
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="relative w-72 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
              <div className="p-5">
                <h3 className="text-lg font-bold text-center text-cyan-300 text-shadow-sm tracking-wide mb-5 uppercase">Display Mode</h3>
                <div className="flex justify-center gap-4">
                  {modes.map(mode => {
                    const isSelected = currentMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => onSelect(mode)}
                        className={`w-28 h-28 flex flex-col items-center justify-center p-2 rounded-lg border-2 transform transition-all duration-200 hover:scale-105 ${isSelected ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/70 hover:border-slate-500'}`}
                      >
                        <ModeIcon mode={mode} className="w-8 h-8 mb-2 text-cyan-300" />
                        <span className="font-semibold tracking-wide text-sm">{mode === 'fullscreen' ? 'Full Screen' : 'Normal'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
    };
    const handleModeSelect = (mode: DisplayMode) => { setSelectedMode(mode); setIsModeModalOpen(false); };

    return (
      <div className="relative w-full h-screen">
        <GameSkeletonLoader show={isAnimatingStart} />
        
        <div className={`absolute inset-0 transition-opacity duration-500 ${isAnimatingStart ? 'opacity-0 delay-[2000ms]' : 'opacity-100'}`}>
            <LoadingScreenLayout logoFloating={logoFloating} appVersion={appVersion}>
            {isModeModalOpen && <ModeSelectionModal onSelect={handleModeSelect} onClose={() => setIsModeModalOpen(false)} currentMode={selectedMode} />}
            <div className="w-full flex flex-col items-center px-4 mt-5">
                <div className="relative w-full max-w-xs">
                <button onClick={() => !isAnimatingStart && setIsModeModalOpen(true)} className="w-full flex items-center justify-between p-3 bg-black/40 border-2 border-gray-600 rounded-lg text-white hover:border-cyan-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors duration-300">
                    <span className="flex items-center"><ModeIcon mode={selectedMode} className="w-5 h-5 mr-3 text-cyan-300" /><span className="font-semibold tracking-wide">{selectedMode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span></span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                </div>
                <div onClick={() => !isAnimatingStart && setRememberChoice(p => !p)} className="mt-4 flex items-center cursor-pointer p-2 rounded-md hover:bg-white/10 transition-colors">
                {rememberChoice ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
                <span className="ml-2 text-sm text-gray-300">Remember choice</span>
                </div>
                <button
                  onClick={() => handleStartClick(selectedMode, rememberChoice)}
                  disabled={isAnimatingStart}
                  className="mt-6 w-48 mx-auto flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-semibold text-lg tracking-wide hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transform transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-400/40 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
                >
                  Start
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-all ease-in-out ${isAnimatingStart ? 'duration-[2000ms] scale-[2.5] rotate-[360deg] opacity-0' : 'duration-300 scale-100 rotate-0 opacity-100'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
            </div>
            </LoadingScreenLayout>
        </div>
      </div>
    );
  }

  // --- THAY ĐỔI 1: Xóa bỏ block `if (loadingStep === 'launching')` ---
  // Đoạn code này đã được xóa:
  // if (loadingStep === 'launching') {
  //   return <GameSkeletonLoader show={true} />;
  // }

  // --- THAY ĐỔI 2: Cập nhật block return cuối cùng để render Game và Skeleton Loader đồng thời ---
  // Cấu trúc này cho phép `background-game` (thông qua component Home) được render
  // ngay khi `loadingStep` chuyển thành 'launching', với SkeletonLoader nằm ở trên.
  return (
    <div className="relative w-screen h-screen">
      {/* Lớp 1: Main App - Sẽ được render ngay khi 'launching', nhưng bị che bởi Skeleton */}
      <div className="app-container" style={{ height: 'var(--app-height, 100vh)' }}>
        {activeTab === 'home' && (
          <GameProvider hideNavBar={hideNavBar} showNavBar={showNavBar} assetsLoaded={true}>
            <Home hideNavBar={hideNavBar} showNavBar={showNavBar} />
          </GameProvider>
        )}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'story' && <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />}
        {activeTab === 'quiz' && <QuizAppHome hideNavBar={hideNavBar} showNavBar={showNavBar} />}
        {activeTab === 'game' && <GameBrowser hideNavBar={hideNavBar} showNavBar={showNavBar} />}
        {isNavBarVisible && <NavigationBarBottom activeTab={activeTab} onTabChange={handleTabChange} />}
      </div>
      
      {/* Lớp 2: Skeleton Loader Overlay - Chỉ hiển thị trong giai đoạn 'launching' */}
      <GameSkeletonLoader show={loadingStep === 'launching'} />
    </div>
  );
};

const container = document.getElementById('root');
if (!container) throw new Error('Root element with ID "root" not found in the document.');
const root = createRoot(container);
root.render(<App />);

export default App;

// --- END OF FILE src/index.tsx ---
