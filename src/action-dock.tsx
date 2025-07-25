// --- START OF FILE src/action-dock.tsx ---

import React from 'react';

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
}

/**
 * Component ActionButton: Một nút bấm riêng lẻ trong dock với tooltip.
 */
const ActionButton: React.FC<{ item: ActionItem }> = ({ item }) => (
  <button
    onClick={item.onClick}
    title={item.tooltip} // Tooltip gốc cho accessibility
    className="group relative w-14 h-14 flex items-center justify-center 
               bg-slate-800/50 hover:bg-slate-700/70 backdrop-blur-sm p-2.5 rounded-xl 
               transition-all duration-300 ease-in-out hover:scale-110
               focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <img src={item.iconSrc} alt={item.alt} className="w-full h-full object-contain" />
    
    {/* Tooltip tùy chỉnh, chỉ hiện khi hover vào button (group) */}
    <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
      {item.tooltip}
       {/* Mũi tên nhỏ cho tooltip */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
    </div>
  </button>
);

/**
 * Component ActionDock: Hiển thị một thanh dock chứa các nút hành động ở cuối màn hình.
 */
const ActionDock: React.FC<ActionDockProps> = ({ actions }) => {
  return (
    // Container chính của dock, định vị ở cuối và giữa màn hình
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
      <div
        className="flex items-center justify-center gap-x-3 sm:gap-x-4 p-2
                   bg-black/30 backdrop-blur-md 
                   rounded-2xl border border-slate-700/50 shadow-2xl"
      >
        {actions.map((action) => (
          <ActionButton key={action.id} item={action} />
        ))}
      </div>
    </div>
  );
};

export default ActionDock;

// --- END OF FILE src/action-dock.tsx ---
