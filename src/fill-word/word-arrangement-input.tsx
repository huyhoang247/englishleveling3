import React, { useState, useEffect } from 'react';

// Helper function to shuffle an array
const shuffleArray = <T extends any[]>(array: T): T => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray as T;
};

interface WordArrangementInputProps {
  word: string;
  onAnswerChange: (value: string) => void;
  isCorrect: boolean | null;
  disabled: boolean;
}

const WordArrangementInput: React.FC<WordArrangementInputProps> = ({
  word,
  onAnswerChange,
  isCorrect,
  disabled,
}) => {
  const wordLength = word.length;
  // State cho các chữ cái người dùng đã sắp xếp
  const [arrangedLetters, setArrangedLetters] = useState<(string | null)[]>(Array(wordLength).fill(null));
  // State cho các chữ cái trong "ngân hàng" để chọn
  const [letterBank, setLetterBank] = useState<string[]>([]);

  // Effect để xáo trộn các chữ cái khi từ mới được truyền vào
  useEffect(() => {
    if (word) {
      const shuffled = shuffleArray(word.toLowerCase().split(''));
      setLetterBank(shuffled);
      setArrangedLetters(Array(wordLength).fill(null));
      onAnswerChange(''); // Reset câu trả lời ở component cha
    }
  }, [word]);

  // Effect để cập nhật câu trả lời ở component cha mỗi khi arrangedLetters thay đổi
  useEffect(() => {
    const currentAnswer = arrangedLetters.filter(Boolean).join('');
    onAnswerChange(currentAnswer);
  }, [arrangedLetters, onAnswerChange]);


  const handleBankClick = (letter: string, index: number) => {
    if (disabled) return;

    // Tìm ô trống đầu tiên trong khu vực trả lời
    const firstEmptyIndex = arrangedLetters.findIndex(l => l === null);
    if (firstEmptyIndex !== -1) {
      // Di chuyển chữ cái từ ngân hàng vào ô trống
      const newArranged = [...arrangedLetters];
      newArranged[firstEmptyIndex] = letter;
      setArrangedLetters(newArranged);

      // Xóa chữ cái khỏi ngân hàng
      const newBank = [...letterBank];
      newBank.splice(index, 1);
      setLetterBank(newBank);
    }
  };

  const handleAnswerClick = (letter: string, index: number) => {
    if (disabled || letter === null) return;

    // Trả chữ cái về lại ngân hàng
    const newBank = [...letterBank, letter];
    setLetterBank(newBank);

    // Xóa chữ cái khỏi khu vực trả lời
    const newArranged = [...arrangedLetters];
    newArranged[index] = null;
    setArrangedLetters(newArranged);
  };

  // Style cho các ô vuông trả lời
  const getSquareStyle = (letter: string | null) => {
    if (isCorrect === true) return 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-700 shadow-md';
    if (isCorrect === false) return 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 text-red-700 shadow-sm';
    if (letter) return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-700 shadow-sm cursor-pointer';
    return 'bg-white border-gray-200';
  };
  
  const getSquareAnimation = () => {
     if (isCorrect === true) return 'animate-pop';
     if (isCorrect === false) return 'animate-shake';
     return '';
  }

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {/* Khu vực hiển thị các ô chữ cái đã sắp xếp */}
      <div className="flex justify-center gap-2 flex-wrap mb-4 min-h-[3.5rem]">
        {Array.from({ length: wordLength }).map((_, index) => (
          <div
            key={index}
            className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg text-xl font-bold transition-all duration-200 ${getSquareStyle(arrangedLetters[index])} ${getSquareAnimation()}`}
            onClick={() => handleAnswerClick(arrangedLetters[index]!, index)}
          >
            {arrangedLetters[index] ? arrangedLetters[index]?.toUpperCase() : ''}
          </div>
        ))}
      </div>

      {/* Ngân hàng các chữ cái chưa sắp xếp */}
      <div className="flex justify-center gap-2 flex-wrap p-4 bg-gray-100/50 rounded-xl shadow-inner min-h-[4rem] w-full">
        {letterBank.map((char, index) => (
          <button
            key={`${char}-${index}`}
            onClick={() => handleBankClick(char, index)}
            disabled={disabled}
            className="w-10 h-12 bg-white text-gray-800 rounded-lg flex items-center justify-center shadow-md active:bg-gray-200 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transform transition-all hover:scale-110 hover:-translate-y-1"
          >
            {char.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordArrangementInput;
