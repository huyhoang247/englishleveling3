import { useState } from 'react';
// Removed import { X, Delete } from 'lucide-react'; // Removed lucide-react import

export default function VirtualKeyboard() {
  const [input, setInput] = useState('');
  // Removed capsLock state as Caps Lock key is removed
  // Removed handleCapsLock function as Caps Lock key is removed
  // showSymbols state, handleSymbols, renderSymbolKeys, and handleSend functions removed

  const handleKeyPress = (key) => {
    // Always append lowercase as Caps Lock is removed
    setInput(prev => prev + key.toLowerCase());
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
  };

  const renderAlphaKeys = () => {
    const letters = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    return letters.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-center gap-1 mb-1">
        {/* Removed the Caps Lock button */}
        {row.map(key => (
          <button
            key={key}
            className="w-8 h-10 bg-white text-gray-800 rounded-lg flex items-center justify-center shadow active:bg-gray-200 active:shadow-inner"
            onClick={() => handleKeyPress(key)} // Call handleKeyPress directly with the key
          >
            {key} {/* Always display lowercase */}
          </button>
        ))}
        {rowIndex === 2 && (
          <button
            className="w-10 h-10 bg-white text-gray-800 rounded-lg flex items-center justify-center shadow active:bg-gray-200 active:shadow-inner"
            onClick={handleDelete}
          >
            {/* Replaced Delete icon with inline SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
              <line x1="18" x2="12" y1="9" y2="15" />
              <line x1="12" x2="18" y1="9" y2="15" />
            </svg>
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div>
        {/* Input display */}
        <div className="relative mb-3">
          <div className="bg-white border border-gray-300 rounded-lg p-3 min-h-10 text-gray-800 break-words">
            {input || <span className="text-gray-500">Nhập văn bản...</span>}
          </div>
          {input && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={handleClear}
            >
              {/* Replaced X icon with inline SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Keyboard layout */}
        <div className="mb-2 p-2">
          {/* Render alpha keys */}
          {renderAlphaKeys()}

          {/* Removed the bottom row div */}
        </div>
      </div>
    </div>
  );
}
