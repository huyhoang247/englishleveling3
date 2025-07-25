// --- START OF FILE src/action-dock.tsx ---

import React, { useState, useRef, useEffect } from 'react';

// --- Icon Components (thêm vào đầu file cho tiện) ---

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


// --- Main Component Definitions ---

// Định nghĩa cấu trúc cho một mục hành động
interface ActionItem {
  id: string;
  iconSrc: string;
  alt: string;
  onClick?: () => void;
  tooltip: string;
}

// Props cho component ActionDock
interface ActionDockProps {
  actions: ActionItem[];
  maxVisibleActions?: number; // Số lượng action tối đa hiển thị trên dock chính
}

/**
 * Component ActionButton: Một nút bấm riêng lẻ trong dock với tooltip.
 * Gần như giữ nguyên, chỉ điều chỉnh lại một chút để đẹp hơn.
 */
const ActionButton: React.FC<{ item: ActionItem }> = ({ item }) => (
  <button
    onClick={item.onClick}
    title={item.tooltip} // Tooltip gốc cho accessibility
    className="group relative w-14 h-14 flex items-center justify-center 
               bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-sm p-2.5 rounded-xl
               border border-slate-700/50
               transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-1
               focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <img src={item.iconSrc} alt={item.alt} className="w-full h-full object-contain" />
    
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
      {item.tooltip}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
    </div>
  </button>
);


/**
 * Component ActionDock: Hiển thị một thanh dock CÓ THỂ MỞ RỘNG ở cuối màn hình.
 */
const ActionDock: React.FC<ActionDockProps> = ({ actions, maxVisibleActions = 4 }) => {
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Tách các hành động thành 2 nhóm: chính và phụ (trong menu "thêm")
  const mainActions = actions.slice(0, maxVisibleActions);
  const moreActions = actions.slice(maxVisibleActions);

  // Xử lý click ra ngoài để đóng menu "thêm"
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreMenuRef]);

  return (
    // Container chính của dock, định vị ở cuối và giữa màn hình
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-end justify-center gap-x-3 sm:gap-x-4">
        
        {/* Render các hành động chính */}
        {mainActions.map((action) => (
          <ActionButton key={action.id} item={action} />
        ))}

        {/* Nếu có hành động phụ, render nút "Mở rộng" */}
        {moreActions.length > 0 && (
          <div className="relative" ref={moreMenuRef}>
            {/* Menu phụ, chỉ hiển thị khi isMoreMenuOpen = true */}
            <div className={`absolute bottom-full mb-3 flex flex-col items-center gap-y-3 transition-all duration-300 ease-in-out
                           ${isMoreMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Đây là container cho các item trong menu phụ, có nền riêng */}
                <div className="flex flex-col gap-y-3 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl">
                    {moreActions.map(action => (
                         <ActionButton key={action.id} item={action} />
                    ))}
                </div>
            </div>

            {/* Nút bấm để Mở/Đóng menu phụ */}
            <button
              onClick={() => setMoreMenuOpen(prev => !prev)}
              title={isMoreMenuOpen ? "Đóng menu" : "Mở rộng"}
              className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out
                         border border-purple-500/80
                         hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-400
                         ${isMoreMenuOpen 
                            ? 'bg-purple-600/90 text-white' 
                            : 'bg-slate-800/60 hover:bg-purple-800/80 text-purple-400'
                         }`}
            >
              <div className="transform transition-transform duration-300">
                {isMoreMenuOpen ? <XIcon className="w-5 h-5"/> : <PlusIcon className="w-5 h-5"/>}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionDock;
// --- END OF FILE src/action-dock.tsx ---
