// --- START OF FILE src/index.tsx ---

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

  useEffect(() => { const i = setInterval(() => setLogoFloating(p => !p), 2500); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setEllipsis(p => (p === '...' ? '.' : p + '.')), 500); return () => clearInterval(i); }, []);
  
  useEffect(() => {
    if (loadingStep === 'authenticating') {
      const i = setInterval(() => { setAuthLoadProgress(p => (p >= 95 ? 95 : p + Math.floor(Math.random() * 5) + 2)); }, 120);
      return () => clearInterval(i);
    }
  }, [loadingStep]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setTimeout(async () => {
        setCurrentUser(user);
        if (user) {
          await ensureUserDocumentExists(user);
          setLoadingStep('downloading');
        }
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
        setLoadingProgress(Math.round(((i + 1) / totalAssets) * 100));
      }
      if (!isCancelled) {
        const savedMode = localStorage.getItem('displayMode') as DisplayMode | null;
        if (savedMode) { await startGame(savedMode, false); } else { setLoadingStep('selecting_mode'); }
      }
    }
    preloadAssets();
    return () => { isCancelled = true; };
  }, [loadingStep, currentUser]);

  useEffect(() => {
    if (loadingStep === 'launching') {
      const stepTimer = setTimeout(() => setLoadingStep('ready'), 800);
      return () => { clearTimeout(stepTimer); };
    }
  }, [loadingStep]);

  const startGame = async (mode: DisplayMode, savePreference: boolean) => {
    if (savePreference) localStorage.setItem('displayMode', mode);
    if (mode === 'fullscreen') await enterFullScreen();
    setLoadingStep('launching'); 
  };

  const handleTabChange = (tab: TabType) => { setActiveTab(tab); setIsNavBarVisible(true); };
  const hideNavBar = () => setIsNavBarVisible(false);
  const showNavBar = () => setIsNavBarVisible(true);
  
  if (loadingStep === 'authenticating' || loadingStep === 'downloading') {
    const isAuthenticating = loadingStep === 'authenticating';
    const progress = isAuthenticating ? authLoadProgress : loadingProgress;
    const text = isAuthenticating ? 'Authenticating' : 'Downloading assets';
    return (
      <div className="relative flex flex-col items-center justify-between pt-28 pb-56 w-full h-screen bg-slate-950 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black">
        <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Loading Logo" className={`w-48 h-48 object-contain transition-transform ease-in-out duration-[2500ms] ${logoFloating ? '-translate-y-3' : 'translate-y-0'}`} style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
        <div className="w-full flex flex-col items-center px-4">
          <p className="mt-1 mb-5 text-sm text-white tracking-wide font-lilita">{text}<span className="inline-block w-3 text-left">{ellipsis}</span></p>
          <div className="w-80 lg:w-96 relative">
            <div className="h-6 w-full bg-black/40 border border-cyan-900/50 rounded-full p-1" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 255, 0.08)' }}>
              {/* ===== START OF CHANGE ===== */}
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end" // Thêm flex, items-center, justify-end
                style={{ width: `${progress}%`, boxShadow: `0 0 8px rgba(0, 255, 255, 0.35), 0 0 15px rgba(0, 200, 255, 0.2)` }}>
                {/* Thêm chấm tròn nhấp nháy */}
                {progress > 10 && <div className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse opacity-80"></div>}
              </div>
              {/* ===== END OF CHANGE ===== */}
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{Math.round(progress)}%</div>
          </div>
        </div>
        <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
      </div>
    );
  }

  if (!currentUser) { return <AuthComponent appVersion={appVersion} />; }

  if (loadingStep === 'selecting_mode') {
    const ModeSelectionModal: React.FC<{ onSelect: (mode: DisplayMode) => void, onClose: () => void, currentMode: DisplayMode }> = ({ onSelect, onClose, currentMode }) => {
        const modes: DisplayMode[] = ['fullscreen', 'normal'];
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
              <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
              <div className="p-5 pt-8">
                <h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide mb-6 uppercase">Choose Display Mode</h3>
                <div className="flex flex-col gap-3">
                  {modes.map(mode => {
                    const isSelected = currentMode === mode;
                    return (
                      <button key={mode} onClick={() => onSelect(mode)} className={`w-full text-left flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/70 hover:border-slate-500'}`}>
                        <ModeIcon mode={mode} className="w-6 h-6 mr-4 text-cyan-300" />
                        <span className="font-semibold tracking-wide text-lg">{mode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span>
                        {isSelected && (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-auto text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>)}
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
      <>
        {isModeModalOpen && <ModeSelectionModal onSelect={handleModeSelect} onClose={() => setIsModeModalOpen(false)} currentMode={selectedMode} />}
        <div className="relative flex flex-col items-center justify-between pt-28 pb-56 w-full h-screen bg-slate-950 text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-slate-950 to-black overflow-hidden">
          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/logo.webp" alt="Logo" className="w-48 h-48 object-contain" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(0, 150, 255, 0.2))' }} />
          <div className="w-full flex flex-col items-center px-4 mt-5">
            <div className="relative w-full max-w-xs">
              <button onClick={() => setIsModeModalOpen(true)} className="w-full flex items-center justify-between p-3 bg-black/40 border-2 border-gray-600 rounded-lg text-white hover:border-cyan-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors duration-300">
                <span className="flex items-center"><ModeIcon mode={selectedMode} className="w-5 h-5 mr-3 text-cyan-300" /><span className="font-semibold tracking-wide">{selectedMode === 'fullscreen' ? 'Full Screen' : 'Normal Mode'}</span></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div onClick={() => setRememberChoice(p => !p)} className="mt-4 flex items-center cursor-pointer p-2 rounded-md hover:bg-white/10 transition-colors">
              {rememberChoice ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
              <span className="ml-2 text-sm text-gray-300">Remember choice</span>
            </div>
            <button onClick={() => startGame(selectedMode, rememberChoice)} className="mt-5 w-full max-w-xs py-3 bg-cyan-600/90 border border-cyan-400 rounded-lg text-white font-bold tracking-widest hover:bg-cyan-500 hover:scale-105 transform transition-all duration-300 shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-300">LAUNCH</button>
          </div>
          <p className="fixed right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">Version {appVersion}</p>
        </div>
      </>
    );
  }

  if (loadingStep === 'launching') {
    return <GameSkeletonLoader show={true} />;
  }

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

// --- END OF FILE src/index.tsx ---
