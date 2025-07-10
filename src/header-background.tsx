// FILE: header-background.tsx (Đã tối ưu)

import React from 'react';

// Component for the reusable header background
export default function HeaderBackground() {
  return (
    <>
      {/* 
        CSS for animations and refactored corners.
        - Các keyframes animation được giữ nguyên.
        - Các class .corner-* mới được thêm vào để áp dụng kỹ thuật pseudo-element.
      */}
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .animate-scanline {
          animation: scanline 5s linear infinite;
        }

        .animate-twinkle {
          animation: twinkle 1.5s ease-in-out infinite;
        }
        
        /* --- REFACTORED CORNER STYLES --- */

        /* Base styles for all corner pieces */
        .corner-piece {
          position: absolute;
          width: 1.5rem; /* w-6 */
          height: 1.5rem; /* h-6 */
          pointer-events: none;
        }
        .corner-piece::before,
        .corner-piece::after {
          content: '';
          position: absolute;
          background: transparent; /* Fallback */
        }

        /* Top-Left Corner */
        .corner-tl {
          border-top: 1px solid rgba(59, 130, 246, 0.6);
          border-left: 1px solid rgba(59, 130, 246, 0.6);
          border-radius: 0.5rem 0 0 0; /* rounded-tl-lg */
          background-image: radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.2), transparent 50%);
        }
        .corner-tl::before { /* Horizontal line */
          top: -1px; left: 0; height: 1px; width: 100%;
          background-image: linear-gradient(to right, rgba(59, 130, 246, 0.6), transparent);
        }
        .corner-tl::after { /* Vertical line */
          top: 0; left: -1px; width: 1px; height: 100%;
          background-image: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), transparent);
        }

        /* Top-Right Corner */
        .corner-tr {
          border-top: 1px solid rgba(59, 130, 246, 0.6);
          border-right: 1px solid rgba(59, 130, 246, 0.6);
          border-radius: 0 0.5rem 0 0; /* rounded-tr-lg */
          background-image: radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.2), transparent 50%);
        }
        .corner-tr::before { /* Horizontal line */
          top: -1px; right: 0; height: 1px; width: 100%;
          background-image: linear-gradient(to left, rgba(59, 130, 246, 0.6), transparent);
        }
        .corner-tr::after { /* Vertical line */
          top: 0; right: -1px; width: 1px; height: 100%;
          background-image: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), transparent);
        }

        /* Bottom-Left Corner */
        .corner-bl {
          border-bottom: 1px solid rgba(168, 85, 247, 0.3);
          border-left: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 0 0 0 0.5rem; /* rounded-bl-lg */
          background-image: radial-gradient(circle at 10% 90%, rgba(168, 85, 247, 0.15), transparent 50%);
        }
        .corner-bl::before { /* Horizontal line */
          bottom: -1px; left: 0; height: 1px; width: 100%;
          background-image: linear-gradient(to right, rgba(168, 85, 247, 0.3), transparent);
        }
        .corner-bl::after { /* Vertical line */
          bottom: 0; left: -1px; width: 1px; height: 100%;
          background-image: linear-gradient(to top, rgba(168, 85, 247, 0.3), transparent);
        }

        /* Bottom-Right Corner */
        .corner-br {
          border-bottom: 1px solid rgba(168, 85, 247, 0.3);
          border-right: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 0 0 0.5rem 0; /* rounded-br-lg */
          background-image: radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.15), transparent 50%);
        }
        .corner-br::before { /* Horizontal line */
          bottom: -1px; right: 0; height: 1px; width: 100%;
          background-image: linear-gradient(to left, rgba(168, 85, 247, 0.3), transparent);
        }
        .corner-br::after { /* Vertical line */
          bottom: 0; right: -1px; width: 1px; height: 100%;
          background-image: linear-gradient(to top, rgba(168, 85, 247, 0.3), transparent);
        }
      `}</style>

      {/* Inner background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900/80 to-slate-950/90"></div>

      {/* Cyber grid pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(80, 175, 255, .3) 25%, rgba(80, 175, 255, .3) 26%, transparent 27%, transparent 74%, rgba(80, 175, 255, .3) 75%, rgba(80, 175, 255, .3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(80, 175, 255, .3) 25%, rgba(80, 175, 255, .3) 26%, transparent 27%, transparent 74%, rgba(80, 175, 255, .3) 75%, rgba(80, 175, 255, .3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Hexagon pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpolygon points='14,0 28,14 14,28 0,14'/%3E%3Cpolygon points='14,21 28,35 14,49 0,35'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Edge lighting effects */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600/0 via-blue-400/70 to-blue-600/0"></div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700/0 via-purple-500/20 to-slate-700/0"></div>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/50 via-blue-500/0 to-purple-500/30"></div>
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/50 via-blue-500/0 to-purple-500/30"></div>

      {/* --- REFACTORED CORNERS (8 DIVs TOTAL) --- */}
      
      {/* Top-left corner */}
      <div className="absolute top-0 left-0 w-6 h-6">
        <div className="corner-piece corner-tl"></div>
        <div className="absolute w-1 h-1 bg-blue-400/40 rounded-full top-0.5 left-0.5 animate-twinkle"></div>
      </div>

      {/* Top-right corner */}
      <div className="absolute top-0 right-0 w-6 h-6">
        <div className="corner-piece corner-tr"></div>
        <div className="absolute w-1 h-1 bg-blue-400/40 rounded-full top-0.5 right-0.5 animate-twinkle" style={{ animationDelay: '0.7s' }}></div>
      </div>

      {/* Bottom-left corner */}
      <div className="absolute bottom-0 left-0 w-6 h-6">
        <div className="corner-piece corner-bl"></div>
        <div className="absolute w-0.5 h-0.5 bg-purple-400/40 rounded-full bottom-0.5 left-0.5 animate-twinkle" style={{ animationDelay: '1.2s' }}></div>
      </div>

      {/* Bottom-right corner */}
      <div className="absolute bottom-0 right-0 w-6 h-6">
        <div className="corner-piece corner-br"></div>
        <div className="absolute w-0.5 h-0.5 bg-purple-400/40 rounded-full bottom-0.5 right-0.5 animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Dynamic scan line effect overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-6 bg-gradient-to-b from-transparent via-slate-400/5 to-transparent absolute -top-3 animate-scanline"></div>
      </div>
    </>
  );
}
