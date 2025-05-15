import React, { useState, useEffect, useRef } from 'react';
import VirtualKeyboard from './keyboard.tsx'; // Import component bàn phím ảo

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
  // Tạo một mảng các ký tự riêng lẻ từ userInput
  const characters = userInput.split('');

  // Tạo một mảng các ô trống cho độ dài từ hiện tại
  const wordLength = word?.length || 5;
  const squares = Array(wordLength).fill('');

  // Điền các ô vuông bằng các ký tự có sẵn
  for (let i = 0; i < characters.length && i < wordLength; i++) {
    squares[i] = characters[i];
  }

  // Xử lý khi nhấp vào một ô vuông (để xóa ký tự tại vị trí đó)
  const handleSquareClick = (index: number) => {
    if (disabled) return;

    // Kiểm tra xem ô vuông có chứa ký tự không
    if (index < userInput.length) {
      // Xóa ký tự tại vị trí index
      const newUserInput = userInput.slice(0, index) + userInput.slice(index + 1);
      setUserInput(newUserInput);
    }
  };

  // Định nghĩa các keyframe animation tùy chỉnh
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
    // Animation nhấp nháy cho ô trống tiếp theo khi game chưa kết thúc và chưa trả lời đúng
    if (index === userInput.length && !disabled && isCorrect === null) {
      return 'animate-pulse';
    }
    // Animation pop khi trả lời đúng
    if (isCorrect === true) {
      const delays = ['animate-pop delay-0', 'animate-pop delay-100', 'animate-pop delay-200', 'animate-pop delay-300', 'animate-pop delay-400'];
      return delays[index % delays.length];
    }
    // Animation lắc khi trả lời sai
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
      {/* Container các ô vuông từ */}
      <div
        className="flex justify-center w-full gap-2 mb-3"
      >
        {squares.map((char, index) => (
          <div
            key={index}
            className={`word-square aspect-square w-12 md:w-14 flex items-center justify-center border rounded-lg text-xl font-bold transition-all duration-200
              ${
                // Highlight ô trống tiếp theo
                index === userInput.length && !disabled && isCorrect === null ? 'scale-105 border-blue-400 ring-1 ring-blue-200' : ''
              }
              ${getSquareStyle(index)} ${getSquareAnimation(index)}`}
            onClick={() => handleSquareClick(index)} // Xử lý click để xóa chữ tại vị trí đó
          >
            {char.toUpperCase()} {/* Hiển thị chữ in hoa trong ô vuông */}
          </div>
        ))}
      </div>

      {/* Hộp hiển thị từ - Luôn hiển thị để giữ khoảng cách */}
      <div className="flex justify-center w-full min-h-[2.5rem]"> {/* Added min-h to ensure space */}
          {/* Chỉ hiển thị từ khi có input */}
          {userInput.length > 0 && (
            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm text-indigo-700 font-medium text-center transition-all duration-300 hover:scale-105"
                 style={{ wordBreak: 'break-word' }} // Thêm CSS để từ xuống dòng khi quá dài
            >
              {formatDisplayWord(userInput)}
            </div>
          )}
      </div>


      {/* Nút kiểm tra */}
      <div className="flex justify-center">
        <button
          onClick={checkAnswer}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center
          ${
            // Nút chỉ active khi input đã đầy và game chưa kết thúc
            userInput.length === wordLength && !disabled
              ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={userInput.length !== wordLength || disabled} // Disable nút khi input chưa đầy hoặc game over
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kiểm tra
        </button>
      </div>

      {/* Bàn phím chữ cái ảo */}
      {/* Truyền userInput, setUserInput, wordLength và disabled xuống component VirtualKeyboard */}
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
