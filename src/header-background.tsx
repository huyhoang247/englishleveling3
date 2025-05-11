import React from 'react';

// Component for the reusable header background
export default function HeaderBackground() {
  return (
    <>
      {/* CSS for animations - Included here so the component is self-contained */}
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); } /* Starts above the container */
          100% { transform: translateY(200%); } /* Ends below the container */
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; } /* Invisible at the start and end */
          50% { opacity: 1; } /* Fully visible in the middle */
        }

        /* Particle animations - Included for completeness, though not used in this specific header */
        @keyframes particle1 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-50px, -30px); opacity: 0; }
        }

        @keyframes particle2 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(60px, -20px); opacity: 0; }
        }

        @keyframes particle3 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-30px, 40px); opacity: 0; }
        }

        @keyframes particle4 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(40px, 30px); opacity: 0; }
        }

        @keyframes particle5 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(20px, -50px); opacity: 0; }
        }

        /* Apply animations using utility classes */
        .animate-scanline {
          animation: scanline 5s linear infinite;
        }

        .animate-twinkle {
          animation: twinkle 1.5s ease-in-out infinite;
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
          backgroundSize: '40px 40px' // Size of the grid cells
        }}
      ></div>

      {/* Hexagon pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          // Using a data URL for the hexagon SVG pattern
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpolygon points='14,0 28,14 14,28 0,14'/%3E%3Cpolygon points='14,21 28,35 14,49 0,35'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px' // Size of the hexagon pattern
        }}
      ></div>

      {/* Edge lighting effects - top, bottom, left, right */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600/0 via-blue-400/70 to-blue-600/0"></div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700/0 via-purple-500/20 to-slate-700/0"></div>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/50 via-blue-500/0 to-purple-500/30"></div>
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/50 via-blue-500/0 to-purple-500/30"></div>

      {/* Enhanced corner effects - detailed and layered design */}
      {/* Top-left corner details */}
      <div className="absolute top-0 left-0">
        <div className="absolute top-0 left-0 w-5 h-5 overflow-hidden">
          <div className="absolute w-6 h-6 bg-gradient-to-br from-blue-400/30 via-blue-500/10 to-transparent rounded-tl-lg border-t border-l border-blue-400/60"></div>
          <div className="absolute w-3 h-3 bg-gradient-to-br from-blue-400/20 via-blue-500/5 to-transparent rounded-tl-lg"></div>
          <div className="absolute w-1 h-1 bg-blue-400/40 rounded-full top-0.5 left-0.5 animate-twinkle"></div>
        </div>
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400/60 rounded-tl-lg"></div>
        <div className="absolute top-0 left-0 w-6 h-0.5 bg-gradient-to-r from-blue-400/60 to-transparent"></div>
        <div className="absolute top-0 left-0 h-6 w-0.5 bg-gradient-to-b from-blue-400/60 to-transparent"></div>
      </div>

      {/* Top-right corner details */}
      <div className="absolute top-0 right-0">
        <div className="absolute top-0 right-0 w-5 h-5 overflow-hidden">
          <div className="absolute -right-1 -top-1 w-6 h-6 bg-gradient-to-bl from-blue-400/30 via-blue-500/10 to-transparent rounded-tr-lg border-t border-r border-blue-400/60"></div>
          <div className="absolute right-0 top-0 w-3 h-3 bg-gradient-to-bl from-blue-400/20 via-blue-500/5 to-transparent rounded-tr-lg"></div>
          <div className="absolute w-1 h-1 bg-blue-400/40 rounded-full top-0.5 right-0.5 animate-twinkle" style={{animationDelay: '0.7s'}}></div>
        </div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400/60 rounded-tr-lg"></div>
        <div className="absolute top-0 right-0 w-6 h-0.5 bg-gradient-to-l from-blue-400/60 to-transparent"></div>
        <div className="absolute top-0 right-0 h-6 w-0.5 bg-gradient-to-b from-blue-400/60 to-transparent"></div>
      </div>

      {/* Bottom-left corner details */}
      <div className="absolute bottom-0 left-0">
        <div className="absolute bottom-0 left-0 w-5 h-5 overflow-hidden">
          <div className="absolute left-0 bottom-0 w-6 h-6 bg-gradient-to-tr from-purple-500/20 via-purple-500/5 to-transparent rounded-bl-lg border-b border-l border-purple-500/30"></div>
          <div className="absolute left-0 bottom-0 w-3 h-3 bg-gradient-to-tr from-purple-500/15 via-purple-500/3 to-transparent rounded-bl-lg"></div>
          <div className="absolute w-0.5 h-0.5 bg-purple-400/40 rounded-full bottom-0.5 left-0.5 animate-twinkle" style={{animationDelay: '1.2s'}}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 rounded-bl-lg"></div>
        <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-gradient-to-r from-purple-500/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 h-6 w-0.5 bg-gradient-to-t from-purple-500/30 to-transparent"></div>
      </div>

      {/* Bottom-right corner details */}
      <div className="absolute bottom-0 right-0">
        <div className="absolute bottom-0 right-0 w-5 h-5 overflow-hidden">
          <div className="absolute right-0 bottom-0 w-6 h-6 bg-gradient-to-tl from-purple-500/20 via-purple-500/5 to-transparent rounded-br-lg border-b border-r border-purple-500/30"></div>
          <div className="absolute right-0 bottom-0 w-3 h-3 bg-gradient-to-tl from-purple-500/15 via-purple-500/3 to-transparent rounded-br-lg"></div>
          <div className="absolute w-0.5 h-0.5 bg-purple-400/40 rounded-full bottom-0.5 right-0.5 animate-twinkle" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 rounded-br-lg"></div>
        <div className="absolute bottom-0 right-0 w-6 h-0.5 bg-gradient-to-l from-purple-500/30 to-transparent"></div>
        <div className="absolute bottom-0 right-0 h-6 w-0.5 bg-gradient-to-t from-purple-500/30 to-transparent"></div>
      </div>

       {/* Dynamic scan line effect overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-6 bg-gradient-to-b from-transparent via-slate-400/5 to-transparent absolute -top-3 animate-scanline"></div>
      </div>
    </>
  );
}

