import React from 'react';

// Định nghĩa các props mà VirtualKeyboard sẽ nhận
interface VirtualKeyboardProps {
  userInput: string; // Giá trị input hiện tại từ component cha
  setUserInput: (value: string) => void; // Hàm cập nhật input từ component cha
  wordLength: number; // Độ dài từ cần đoán
  disabled: boolean; // Trạng thái disable của bàn phím
}

// Component bàn phím ảo
const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  userInput,
  setUserInput,
  wordLength,
  disabled,
}) => {

  // Xử lý khi nhấn một phím chữ cái
  const handleKeyPress = (key: string) => {
    // Nếu bàn phím bị disable hoặc input đã đạt độ dài từ, không làm gì cả
    if (disabled || userInput.length >= wordLength) {
      return;
    }
    // Thêm ký tự (chuyển sang chữ thường) vào input hiện tại
    setUserInput(userInput + key.toLowerCase());
  };

  // Xử lý khi nhấn phím xóa
  const handleDelete = () => {
    // Nếu bàn phím bị disable hoặc input rỗng, không làm gì cả
    if (disabled || userInput.length === 0) {
      return;
    }
    // Xóa ký tự cuối cùng khỏi input
    setUserInput(userInput.slice(0, -1));
  };

  // Bàn phím ảo sẽ không có nút "Clear" hay hiển thị input riêng nữa,
  // việc hiển thị và quản lý input sẽ do component cha (WordSquaresInput) đảm nhận.

  // Render các phím chữ cái
  const renderAlphaKeys = () => {
    const letters = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    return letters.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-center gap-1 mb-1">
        {row.map(key => (
          <button
            key={key}
            className="w-8 h-10 bg-white text-gray-800 rounded-lg flex items-center justify-center shadow active:bg-gray-200 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleKeyPress(key)}
            disabled={disabled || userInput.length >= wordLength} // Disable phím khi input đầy hoặc game over
          >
            {key.toUpperCase()} {/* Hiển thị chữ in hoa trên phím */}
          </button>
        ))}
        {rowIndex === 2 && (
          // Nút xóa (Delete)
          <button
            className="w-10 h-10 bg-white text-gray-800 rounded-lg flex items-center justify-center shadow active:bg-gray-200 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={disabled || userInput.length === 0} // Disable nút xóa khi input rỗng hoặc game over
          >
            {/* Inline SVG cho icon xóa */}
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
    <div className="w-full max-w-md mx-auto p-2 bg-gray-100 rounded-xl shadow-inner">
      {/* Bàn phím layout */}
      <div className="mb-2">
        {/* Render các hàng phím chữ cái */}
        {renderAlphaKeys()}
      </div>
      {/* Có thể thêm các phím chức năng khác ở đây nếu cần (ví dụ: Enter) */}
      {/* Ví dụ thêm nút Enter */}
      {/* <div className="flex justify-center gap-1">
        <button
          className="w-20 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center shadow active:bg-blue-600 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => checkAnswer()} // Giả định có prop checkAnswer
          disabled={userInput.length !== wordLength || disabled}
        >
          Enter
        </button>
      </div> */}
    </div>
  );
};

export default VirtualKeyboard;
