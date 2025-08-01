// src/contexts/UIStateContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type OverlayType = 
  | 'rank' | 'inventory' | 'shop' | 'boss' | 'luckyGame' | 'minerChallenge' 
  | 'achievements' | 'skill' | 'equipment' | 'admin' | 'upgrade' | 'baseBuilding' 
  | 'vocabularyChest' | null;

interface UIStateContextType {
  activeOverlay: OverlayType;
  isOverlayOpen: boolean;
  openOverlay: (overlay: OverlayType) => void;
  closeOverlay: () => void;
  showRateLimitToast: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

// Component Toast có thể được định nghĩa ở đây hoặc import từ file khác
const RateLimitToast = ({ show }: { show: boolean }) => (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="bg-red-800/90 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-lg border border-red-500 backdrop-blur-sm">
            Vui lòng chờ thao tác trước hoàn tất!
        </div>
    </div>
);

export const UIStateProvider: React.FC<{ 
  children: React.ReactNode, 
  hideNavBar: () => void, 
  showNavBar: () => void 
}> = ({ children, hideNavBar, showNavBar }) => {
  
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [isRateLimitToastVisible, setRateLimitToastVisible] = useState(false);

  useEffect(() => {
    if (isRateLimitToastVisible) {
      const timer = setTimeout(() => setRateLimitToastVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isRateLimitToastVisible]);

  const openOverlay = useCallback((overlay: OverlayType) => {
    setActiveOverlay(overlay);
    if (hideNavBar) hideNavBar();
  }, [hideNavBar]);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
    if (showNavBar) showNavBar();
  }, [showNavBar]);

  const showRateLimitToast = useCallback(() => {
    setRateLimitToastVisible(true);
  }, []);

  const value = {
    activeOverlay,
    isOverlayOpen: activeOverlay !== null,
    openOverlay,
    closeOverlay,
    showRateLimitToast,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
      <RateLimitToast show={isRateLimitToastVisible} />
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};
