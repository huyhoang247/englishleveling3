import React, { useState, useEffect, useRef } from 'react';

interface WordSquaresInputProps {
  word: string | null;
  userInput: string;
  setUserInput: (value: string) => void;
  checkAnswer: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Giữ lại prop này phòng trường hợp cần xử lý bàn phím vật lý
  feedback: string;
  isCorrect: boolean | null;
  disabled: boolean;
}

const WordSquaresInput: React.FC<WordSquaresInputProps> = ({
  word,
  userInput,
  setUserInput,
  checkAnswer,
  handleKeyPress, // Vẫn giữ prop này
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

  // Tham chiếu đến phần tử input ẩn.
  // Input này sẽ được cấu hình để không nhận focus trên thiết bị di động,
  // ngăn chặn bàn phím ảo của hệ điều hành xuất hiện.
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi nhấp vào một ô vuông
  const handleSquareClick = (index: number) => {
    if (disabled) return;

    // Kiểm tra xem ô vuông có chứa ký tự không
    if (index < userInput.length) {
      // Xóa ký tự tại vị trí index
      const newUserInput = userInput.slice(0, index) + userInput.slice(index + 1);
      setUserInput(newUserInput);
    }
    // *** Không gọi focus() ở đây ***
  };

  // Hàm này có thể không còn cần thiết nếu chỉ dùng bàn phím ảo,
  // nhưng giữ lại phòng trường hợp cần xử lý input từ bàn phím vật lý trên desktop.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cập nhật input nếu giá trị mới ngắn hơn hoặc bằng độ dài từ
    if (value.length <= wordLength) {
      setUserInput(value);
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

  // Bố cục bàn phím ảo
  const keyboardRows = [
    'QWERTYU'.split(''),
    'IOPASDF'.split(''),
    'GHJKLMN'.split(''),
    'BVCXZ'.split(''),
  ];

  return (
    <div className="w-full space-y-4">
      {/* Trường input ẩn. Đặt readOnly và tabIndex="-1" để ngăn focus và nhập liệu
          trên thiết bị di động, từ đó ngăn bàn phím ảo của hệ điều hành xuất hiện.
          Loại bỏ autoFocus. */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange} // Vẫn giữ onChange để xử lý input từ bàn phím vật lý nếu có
        onKeyPress={handleKeyPress} // Vẫn giữ onKeyPress
        className="opacity-0 absolute h-0 w-0"
        readOnly={true} // Ngăn nhập liệu trực tiếp vào input
        tabIndex={-1} // Ngăn focus thông qua phím Tab
        disabled={disabled}
        // Loại bỏ onBlur để tránh các hành vi không mong muốn liên quan đến focus
        onBlur={() => {}}
      />

      {/* Container các ô vuông từ */}
      <div
        className="flex justify-center w-full gap-2 mb-3"
        // Không có onClick để focus input ở đây
      >
        {squares.map((char, index) => (
          <div
            key={index}
            className={`word-square aspect-square w-12 md:w-14 flex items-center justify-center border rounded-lg text-xl font-bold transition-all duration-200
              ${
                index === userInput.length && !disabled && isCorrect === null ? 'scale-105 border-blue-400 ring-1 ring-blue-200' : ''
              }
              ${getSquareStyle(index)} ${getSquareAnimation(index)}`}
            onClick={() => handleSquareClick(index)} // Xử lý click để xóa chữ
          >
            {char.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Hộp hiển thị từ */}
      {userInput.length > 0 && (
        <div className="flex justify-center w-full">
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm text-indigo-700 font-medium text-center transition-all duration-300 transform hover:scale-105">
            {formatDisplayWord(userInput)}
          </div>
        </div>
      )}

      {/* Nút gửi */}
      <div className="flex justify-center">
        <button
          onClick={checkAnswer}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${
            userInput.length === wordLength && !disabled
              ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={userInput.length !== wordLength || disabled}
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kiểm tra
          </span>
        </button>
      </div>

      {/* Bàn phím chữ cái */}
      <div className="mt-6 mx-auto max-w-md">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center flex-wrap gap-1 mb-1">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => {
                  if (!disabled && userInput.length < wordLength) {
                    setUserInput(userInput + letter.toLowerCase());
                    // Không gọi focus() sau khi gõ phím
                  }
                }}
                className={`keyboard-button w-8 h-9 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150
                  ${
                    disabled
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5'
                  }`}
                disabled={disabled || userInput.length >= wordLength}
                tabIndex={-1} // Ngăn nút này nhận focus từ tab
              >
                {letter}
              </button>
            ))}

            {/* Nút Del */}
            {rowIndex === keyboardRows.length - 1 && (
              <button
                onClick={() => {
                  if (!disabled && userInput.length > 0) {
                    setUserInput(userInput.slice(0, -1));
                    // Không gọi focus() sau khi xóa
                  }
                }}
                className={`keyboard-button w-10 h-9 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150
                  ${
                    disabled || userInput.length === 0
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5'
                  }`}
                disabled={disabled || userInput.length === 0}
                tabIndex={-1} // Ngăn nút này nhận focus từ tab
              >
                Del
              </button>
            )}
          </div>
        ))}
         {/* Nút ENTER */}
        <div className="flex justify-center mt-2">
             <button
                onClick={() => {
                  if (!disabled) {
                    checkAnswer();
                    // Không gọi focus() sau khi gửi
                  }
                }}
                className={`keyboard-button px-4 py-2 flex items-center justify-center rounded-md text-sm font-medium transition-all duration-150 w-full max-w-[200px]
                  ${
                    disabled || userInput.length !== wordLength
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 hover:-translate-y-0.5'
                  }`}
                disabled={disabled || userInput.length !== wordLength}
                tabIndex={-1} // Ngăn nút này nhận focus từ tab
              >
                ENTER
              </button>
        </div>
      </div>

      {/* Phản hồi */}
      {feedback && (
        <div className={`flex items-center justify-center p-3 rounded-t-lg shadow-sm mt-4 text-sm transition-all duration-200
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
