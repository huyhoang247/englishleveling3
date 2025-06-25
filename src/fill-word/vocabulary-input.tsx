import React, { useEffect } from 'react';

interface WordSquaresInputProps {
  word: string | null;
  userInput: string;
  setUserInput: (value: string) => void;
  feedback: string;
  isCorrect: boolean | null;
  disabled: boolean;
}

const WordSquaresInput: React.FC<WordSquaresInputProps> = ({
  word,
  userInput,
  setUserInput,
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

  // Tính toán kích thước chữ dựa vào độ dài của từ
  const getFontSize = () => {
    if (wordLength <= 5) return 'text-xl';
    if (wordLength <= 7) return 'text-lg';
    if (wordLength <= 9) return 'text-base';
    return 'text-sm';
  };

  // Tính toán kích thước ô vuông dựa vào độ dài của từ
  const getSquareSize = () => {
    if (wordLength <= 5) return 'w-12 md:w-14';
    if (wordLength <= 7) return 'w-10 md:w-12';
    if (wordLength <= 9) return 'w-9 md:w-10';
    return 'w-8 md:w-9';
  };

  // Tính toán khoảng cách giữa các ô vuông
  const getGapSize = () => {
    if (wordLength <= 6) return 'gap-2';
    if (wordLength <= 9) return 'gap-1';
    return 'gap-0.5';
  };

  // Định dạng hiển thị từ với chữ cái đầu viết hoa
  const formatDisplayWord = (input: string) => {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  };

  return (
    <div className="w-full space-y-4">
      {/* Container các ô vuông từ */}
      <div className={`flex justify-center w-full ${getGapSize()} mb-3`}>
        {squares.map((char, index) => (
          <div
            key={index}
            className={`word-square aspect-square ${getSquareSize()} flex items-center justify-center border rounded-lg ${getFontSize()} font-bold transition-all duration-200
              ${index === userInput.length && !disabled && isCorrect === null ? 'scale-105 border-blue-400 ring-1 ring-blue-200' : ''}
              ${getSquareStyle(index)} ${getSquareAnimation(index)}`}
            onClick={() => handleSquareClick(index)}
          >
            {char.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Hộp hiển thị từ */}
      <div className="flex justify-center w-full min-h-[2.5rem]">
        {userInput.length > 0 && (
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm text-indigo-700 font-medium text-center transition-all duration-300 hover:scale-105">
            {formatDisplayWord(userInput)}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSquaresInput;
