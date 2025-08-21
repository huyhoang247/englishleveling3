// src/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx';
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

// Định nghĩa các loại tab và chế độ hiển thị
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game';
type DisplayMode = 'fullscreen' | 'normal';
// Định nghĩa các bước của quá trình tải
// ===> BƯỚC 1: Thêm trạng thái 'launching'
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State chính để quản lý luồng
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('authenticating');

  // States phụ cho các màn hình loading
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [logoFloating, setLogoFloating] = useState(true);
  const [authLoadProgress, setAuthLoadProgress] = useState(0);
  const [ellipsis, setEllipsis] = useState('.');
  const [selectedMode, setSelectedMode] = useState<DisplayMode>('normal');
  const [rememberChoice, setRememberChoice] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const i = setInterval(() => setLogoFloating(p => !p), 2500); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setEllipsis(p => (p === '...' ? '.' : p + '.')), 500); return () => clearInterval(i); }, []);
  
  // Effect cho progress bar giả của màn hình authenticating
  useEffect(() => {
    if (loadingStep === 'authenticating') {
      const i = setInterval(() => { setAuthLoadProgress(p => (p >= 95 ? 95 : p + Math.floor(Math.random() * 5) + 2)); }, 120);
      return () => clearInterval(i);
    }
  }, [loadingStep]);

  // Effect quản lý luồng chính: Auth -> Download -> Select Mode
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setTimeout(async () => {
        setCurrentUser(user);
        if (user) {
          await ensureUserDocumentExists(user);
          setLoadingStep('downloading'); // Chuyển sang bước downloading
        }
        // Nếu không có user, component AuthComponent sẽ được render (ở cuối)
      }, 1500);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (loadingStep !== 'downloading' || !currentUser) return;
    
    let isCancelled = false;
    async function preloadAssets() {
      const totalAssets = allImageUrls.length;
      for (let i = 0; i < totalAssets; i++) {
        if (isCancelled) return;
        await preloadImage(allImageUrls[i]);
        const progress = Math.round(((i + 1) / totalAssets) * 100);
        setLoadingProgress(progress);
      }
      if (!isCancelled) {
        const savedMode = localStorage.getItem('displayMode') as DisplayMode | null;
        if (savedMode) {
          await startGame(savedMode, false); // Tự động bắt đầu game nếu đã lưu lựa chọn
        } else {
          setLoadingStep('selecting_mode'); // Chuyển sang bước chọn mode
        }
      }
    }
    preloadAssets();
    return () => { isCancelled = true; };
  }, [loadingStep, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===> BƯỚC 3: Thêm useEffect để xử lý chuyển tiếp từ 'launching' sang 'ready'
  useEffect(() => {
    if (loadingStep === 'launching') {
      // Delay này cho phép trình duyệt hoàn thành việc chuyển sang full-screen
      // và render skeleton UI mượt mà trước khi tải component Home nặng.
      const timer = setTimeout(() => {
        setLoadingStep('ready');
      }, 500); // Có thể điều chỉnh thời gian này
      return () => clearTimeout(timer);
    }
  }, [loadingStep]);


  const startGame = async (mode: DisplayMode, savePreference: boolean) => {
    if (savePreference) localStorage.setItem('displayMode', mode);
    if (mode === 'fullscreen') await enterFullScreen();
    // ===> BƯỚC 2: Chuyển sang trạng thái 'launching' thay vì 'ready'
    setLoadingStep('launching'); 
  };

  const handleTabChange = (tab: TabType) => { setActiveTab(tab); setIsNavBarVisible(true); };
  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);
  
  // ==================================================================
  // RENDER CÁC MÀN HÌNH LOADING
  // ==================================================================
  
  if (loadingStep === 'authenticating') {
    return (
      <div className="relative flex flex-col items-center justify-between pt-28 pb-56 w-full h-screen bg-slate-950 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black">
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Loading Logo" className={`w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`} style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
        <div className="w-full flex flex-col items-center px-4">
          <p className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">Authenticating<span className="inline-block w-3 text-left">{ellipsis}</span></p>
          <div className="w-80 lg:w-96 relative">
            <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end" style={{ width: `${authLoadProgress}%`, boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` }}>
                {authLoadProgress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{Math.min(100, Math.round(authLoadProgress))}%</div>
          </div>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
      </div>
    );
  }

  if (!currentUser) { // Nếu xác thực thất bại, hiển thị màn hình login
    return <AuthComponent appVersion={appVersion} />;
  }

  if (loadingStep === 'downloading') {
    return (
      <div className="relative flex flex-col items-center justify-between pt-28 pb-56 w-full h-screen bg-slate-950 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black overflow-hidden">
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Loading Logo" className={`w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`} style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
        <div className="w-full flex flex-col items-center px-4">
          <p className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">Downloading assets<span className="inline-block w-3 text-left">{ellipsis}</span></p>
          <div className="w-80 lg:w-96 relative">
            <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end" style={{ width: `${loadingProgress}%`, boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` }}>
                {loadingProgress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{Math.round(loadingProgress)}%</div>
          </div>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
      </div>
    );
  }

  if (loadingStep === 'selecting_mode') {
    return (
      <div className="relative flex flex-col items-center justify-between pt-28 pb-56 w-full h-screen bg-slate-950 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black overflow-hidden">
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Logo" className="w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms]" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
        <div className="w-full flex flex-col items-center px-4">
          <h2 className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">CHOOSE DISPLAY MODE</h2>
          <div className="relative w-full max-w-xs" ref={dropdownRef}>
             <button onClick={() => setIsDropdownOpen(p => !p)} className="w-full flex items-center justify-between p-3 bg-black/40 border-2 border-gray-600 rounded-lg text-white hover:border-cyan-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors duration-300">
               <span className="flex items-center"><ModeIcon mode={selectedMode} className="w-5 h-5 mr-3 text-cyan-300" /><span className="font-semibold tracking-wide">{selectedMode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span></span>
               <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
             </button>
             {isDropdownOpen && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
                 {(['fullscreen', 'normal'] as DisplayMode[]).map(mode => (
                   <button key={mode} onClick={() => { setSelectedMode(mode); setIsDropdownOpen(false); }} className="w-full text-left flex items-center p-3 text-white/90 hover:bg-cyan-500/20 transition-colors duration-200">
                     <ModeIcon mode={mode} className="w-5 h-5 mr-3 text-cyan-300" /><span className="font-semibold tracking-wide">{mode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span>
                   </button>
                 ))}
               </div>
             )}
          </div>
          <div onClick={() => setRememberChoice(p => !p)} className="mt-4 flex items-center cursor-pointer p-2 rounded-md hover:bg-white/10 transition-colors">
            {rememberChoice ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
            <span className="ml-2 text-sm text-gray-300">Remember choice</span>
          </div>
          <button onClick={() => startGame(selectedMode, rememberChoice)} className="mt-5 w-full max-w-xs py-3 bg-cyan-600/90 border border-cyan-400 rounded-lg text-white font-bold tracking-widest hover:bg-cyan-500 hover:scale-105 transform transition-all duration-300 shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-300">LAUNCH</button>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
      </div>
    );
  }

  // ===> BƯỚC 4: Render màn hình skeleton 'launching'
  if (loadingStep === 'launching') {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col justify-between animate-pulse">
        {/* Placeholder cho nội dung chính */}
        <div className="flex-grow flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        {/* Skeleton cho thanh Navigation Bar */}
        <div className="w-full h-[60px] md:h-[70px] bg-black/30 backdrop-blur-sm border-t border-gray-700/50 flex justify-around items-center p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center w-12 h-12">
              <div className="w-6 h-6 bg-gray-600 rounded-md"></div>
              <div className="w-8 h-2 mt-2 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================================================================
  // RENDER APP CHÍNH KHI ĐÃ SẴN SÀNG
  // ==================================================================
  return (
    <div className="app-container">
      {activeTab === 'home' && <Home hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} assetsLoaded={true} />}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'story' && <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />}
      {activeTab === 'quiz' && <QuizAppHome hideNavBar={hideNavBar} showNavBar={showNavBar} />}
      {activeTab === 'game' && <GameBrowser hideNavBar={hideNavBar} showNavBar={showNavBar} />}
      {isNavBarVisible && <NavigationBarBottom activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
};

const container = document.getElementById('root');
if (!container) throw new Error('Root element with ID "root" not found in the document.');

const root = createRoot(container);
root.render(<App />);

export default App;
