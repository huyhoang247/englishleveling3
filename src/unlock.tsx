import { useState, useEffect } from 'react';

// SVG Icons (replacing lucide-react)

// ChevronRight Icon SVG
const ChevronRightIcon = ({ size = 20, color = 'currentColor', className = '' }) => ( // Reduced size
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucude-chevron-right ${className}`}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// NEW: Define props interface for the modal
interface GameUnlockModalProps {
    isOpen: boolean; // State to control modal visibility
    onClose: () => void; // Function to call when the modal should close
    onRevive: () => void; // Function to call when the player chooses to revive
}

// Update component signature to accept props
export default function GameUnlockModal({ isOpen, onClose, onRevive }: GameUnlockModalProps) {
  // Removed state variables for unlocking, success, sparkles, countdown, shake, glowPulse

  // Removed useEffect hooks

  // Removed handleUnlock and handleButtonHover functions

  // Placeholder function for closing modal
  // const handleCloseModal = () => {
  //   console.log("Close modal clicked");
  //   // In a real application, you would update state here to hide the modal
  // };

  // If modal is not open, return null to render nothing
  if (!isOpen) {
      return null;
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"> {/* Added z-50 to ensure it's on top */}
      {/* Background particles - Removed */}
      {/* Removed div with class "absolute inset-0 overflow-hidden" and its content */}

      {/* Adjusted width and padding */}
      <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 w-80 shadow-2xl border border-blue-700`}> {/* Reduced width and padding */}
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white opacity-5 rounded-2xl"></div>

        {/* Background glow effects - Adjusted positions and sizes */}
        <div className={`absolute -top-16 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse`}></div>
        <div className="absolute -bottom-16 left-1/4 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/4 -right-16 w-32 h-32 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>


        {/* Enhanced edge glow */}
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_10px_rgba(56,189,248,0.3)] pointer-events-none"></div> {/* Reduced shadow blur */}

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          onClick={onClose} // Use the onClose prop
        >
          <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png"
            alt="Close icon"
            className="w-5 h-5 text-white" // Adjust size as needed
          />
        </button>


        {/* Only render the initial state */}
        <>
          {/* Adjusted main heart icon container size and margin */}
          <div className="flex justify-center mb-6"> {/* Reduced margin-bottom */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-blue-500 opacity-30 blur-md animate-pulse"></div> {/* Adjusted inset */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-800 to-indigo-900 flex items-center justify-center"> {/* Reduced size */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 flex items-center justify-center shadow-inner"> {/* Reduced size */}
                  {/* Using img tag for heart icon - Adjusted size */}
                  <img
                      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/heart.png"
                      alt="Heart icon"
                      className="w-10 h-10" // Reduced size as needed
                  />
                </div>
              </div>
              {/* Decorative elements - Adjusted positions and sizes */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-cyan-400 rounded-full opacity-70 animate-pulse"></div> {/* Reduced size */}
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-purple-400 rounded-full opacity-70 animate-pulse"></div> {/* Reduced size */}
            </div>
          </div>

          {/* Adjusted font sizes and margins */}
          <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">HỒI SINH</h2> {/* Reduced font size and margin */}
          <p className="text-center text-slate-300 text-sm mb-6 font-medium">Chọn phương thức hồi sinh</p> {/* Reduced margin */}

          {/* Enhanced gold unlock button - Adjusted padding and margin */}
          <div className="relative mb-4"> {/* Reduced margin */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl opacity-70 blur-sm"></div> {/* Adjusted inset */}
            <button
              className={`relative flex items-center justify-between w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 p-4 rounded-xl transition-all duration-200 group border border-amber-400`} // Reduced padding
               onClick={onRevive} // Call onRevive when gold button is clicked
            >
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10"></div>
                <div className="absolute left-0 top-0 w-full h-1/2 bg-white opacity-20 transform -skew-y-12"></div>
              </div>

              <div className="flex items-center relative">
                <div className="relative mr-3"> {/* Reduced margin */}
                  <div className="absolute -inset-0.5 rounded-full bg-yellow-300 opacity-30 animate-pulse"></div> {/* Adjusted inset */}
                  {/* Using img tag for dollar icon - Adjusted size */}
                  <img
                      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png"
                      alt="Dollar icon"
                      className="w-7 h-7" // Reduced size as needed
                  />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping opacity-70"></div> {/* Reduced size */}
                </div>
                <div>
                  <p className="font-bold text-yellow-900 text-base">DÙNG VÀNG</p> {/* Reduced font size */}
                  <p className="text-xs text-yellow-800">Hồi sinh ngay lập tức</p> {/* Changed text */}
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-gradient-to-r from-yellow-300 to-amber-300 px-3 py-1.5 rounded-full text-yellow-900 font-bold flex items-center shadow-md"> {/* Adjusted padding */}
                  <span>100</span>
                  <ChevronRightIcon className="ml-1 transition-transform group-hover:translate-x-1 text-yellow-900" size={16} /> {/* Reduced size */}
                </div>
              </div>
            </button>
          </div>

          {/* Enhanced ad watch button - Adjusted padding */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-xl opacity-70 blur-sm"></div> {/* Adjusted inset */}
            <button
              className={`relative flex items-center justify-between w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 p-4 rounded-xl transition-all duration-200 group border border-blue-400`} // Reduced padding
              // TODO: Implement ad watching logic here
            >
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10"></div>
                <div className="absolute left-0 top-0 w-full h-1/2 bg-white opacity-20 transform -skew-y-12"></div>
              </div>

              <div className="flex items-center relative">
                <div className="relative mr-3"> {/* Reduced margin */}
                  <div className="absolute -inset-0.5 rounded-full bg-blue-300 opacity-30 animate-pulse"></div> {/* Adjusted inset */}
                  {/* Updated img tag for play icon - Adjusted size */}
                  <img
                      src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/play.png"
                      alt="Play icon"
                      className="w-7 h-7" // Reduced size as needed
                  />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-300 rounded-full animate-ping opacity-70"></div> {/* Reduced size */}
                </div>
                <div>
                  <p className="font-bold text-white text-base">XEM QUẢNG CÁO</p> {/* Reduced font size */}
                  <p className="text-xs text-blue-200">Miễn phí sau khi xem</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-full flex items-center shadow-md group-hover:from-blue-500 group-hover:to-indigo-500"> {/* Adjusted padding */}
                <ChevronRightIcon className="transition-transform group-hover:translate-x-1 text-white" size={16} /> {/* Reduced size */}
              </div>
            </button>
          </div>
        </>
      </div>

      {/* Custom CSS - Removed float animation */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(10px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        /* Removed .animate-float class */
      `}</style>
    </div>
  );
}

