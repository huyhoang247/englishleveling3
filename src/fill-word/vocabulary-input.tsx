import React, { useState, useEffect, useRef } from 'react';
import VirtualKeyboard from './keyboard.tsx';

interface WordSquaresInputProps {
  word: string | null;
  userInput: string;
  setUserInput: (value: string) => void;
  checkAnswer: () => void;
  feedback: string;
  isCorrect: boolean | null;
  disabled: boolean;
}

const WordSquaresInput: React.FC<WordSquaresInputProps> = ({
  word,
  userInput,
  setUserInput,
  checkAnswer,
  feedback,
  isCorrect,
  disabled,
}) => {
  const characters = userInput.split('');
  const wordLength = word?.length || 5;
  const squares = Array(wordLength).fill('');

  for (let i = 0; i < characters.length && i < wordLength; i++) {
    squares[i] = characters[i];
  }

  const handleSquareClick = (index: number) => {
    if (disabled) return;

    if (index < userInput.length) {
      const newUserInput = userInput.slice(0, index) + userInput.slice(index + 1);
      setUserInput(newUserInput);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-3px); }
        40% { transform: translateX(3px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
      }
      .animate-shake {
        animation: shake 0.4s ease-in-out;
      }
      @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .animate-pop {
        animation: pop 0.3s ease-out;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
      .animate-pulse {
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      /* Tiện ích ẩn thanh cuộn */
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Lấy style phù hợp cho từng ô chữ cái
  const getSquareStyle = (index: number) => {
    if (isCorrect === true) {
      return 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-700 shadow-md';
    } else if (isCorrect === false) {
      return 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 text-red-700 shadow-sm';
    } else if (squares[index]) {
      return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-700 shadow-sm cursor-pointer';
    }
    return 'bg-white border-gray-200 text-gray-400';
  };

  // Lấy animation phù hợp cho từng ô chữ cái
  const getSquareAnimation = (index: number) => {
    if (index === userInput.length && !disabled && isCorrect === null) {
      return 'animate-pulse';
    }
    if (isCorrect === true) {
      const delays = ['animate-pop delay-0', 'animate-pop delay-100', 'animate-pop delay-200', 'animate-pop delay-300', 'animate-pop delay-400'];
      return delays[index % delays.length];
    }
    if (isCorrect === false) {
      return 'animate-shake';
    }
    return '';
  };

  // Định dạng hiển thị từ với chữ cái đầu viết hoa
  const formatDisplayWord = (input: string) => {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  };

  return (
    <div className="w-full space-y-4">
      {/* Container cho phép cuộn ngang và ẩn thanh cuộn */}
      <div className="w-full flex justify-center">
        <div className="w-full overflow-x-auto hide-scrollbar">
            {/* Container nội bộ để các ô không bị ngắt dòng và căn giữa khi ít ô */}
            <div className="inline-flex justify-center p-1 gap-2 w-full">
                {squares.map((char, index) => (
                <div
                    key={index}
                    // [START] Kích thước ô và font chữ đã được điều chỉnh cho hợp lý hơn
                    className={`word-square aspect-square w-10 md:w-12 flex-shrink-0 flex items-center justify-center border rounded-lg text-xl font-bold transition-all duration-200
                    // [END]
                    ${index === userInput.length && !disabled && isCorrect === null ? 'scale-105 border-blue-400 ring-1 ring-blue-200' : ''}
                    ${getSquareStyle(index)} ${getSquareAnimation(index)}`}
                    onClick={() => handleSquareClick(index)}
                >
                    {char.toUpperCase()}
                </div>
                ))}
            </div>
        </div>
      </div>

      {/* Container cho ô hiển thị từ và nút kiểm tra */}
      <div className="flex justify-center items-center gap-3 w-full min-h-[3.5rem]">
        {/* Hộp hiển thị từ */}
        {userInput.length > 0 && (
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm text-indigo-700 font-medium text-center transition-all duration-300 hover:scale-105">
            {formatDisplayWord(userInput)}
          </div>
        )}

        {/* Nút kiểm tra - Chỉ hiển thị khi nhập đủ ký tự */}
        {userInput.length === wordLength && !disabled && (
          <button
            onClick={checkAnswer}
            className="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5"
            disabled={disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kiểm tra
          </button>
        )}
      </div>

      {/* Bàn phím chữ cái ảo */}
      <VirtualKeyboard
        userInput={userInput}
        setUserInput={setUserInput}
        wordLength={wordLength}
        disabled={disabled}
      />

      {/* Phản hồi */}
      {feedback && (
        <div className={`flex items-center justify-center p-3 rounded-lg shadow-sm mt-4 text-sm transition-all duration-200
          ${isCorrect
            ? 'bg-green-50 text-green-700 border border-green-100'
            : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {isCorrect ?
            <div className="flex items-center">
              <span className="flex items-center justify-center bg-green-100 text-green-500 rounded-full w-6 h-6 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="font-medium">{feedback}</span>
            </div> :
            <div className="flex items-center">
              <span className="flex items-center justify-center bg-red-100 text-red-500 rounded-full w-6 h-6 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <span>{feedback}</span>
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default WordSquaresInput;
