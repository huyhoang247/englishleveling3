import React, { useState, useEffect } from 'react';

// Define the props for the VocabularyInput component
interface VocabularyInputProps {
  userInput: string; // The current value of the input field
  setUserInput: (value: string) => void; // Function to update the input value
  checkAnswer: () => void; // Function to check the user's answer
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Function to handle key presses (like Enter)
  feedback: string; // The feedback message to display
  isCorrect: boolean | null; // State indicating if the answer is correct (true, false, or null)
  disabled: boolean; // State to disable the input and button
}

const VocabularyInput: React.FC<VocabularyInputProps> = ({
  userInput,
  setUserInput,
  checkAnswer,
  handleKeyPress,
  feedback,
  isCorrect,
  disabled,
}) => {
  // Animation states
  const [animate, setAnimate] = useState(false);
  
  // Trigger animation when feedback changes
  useEffect(() => {
    if (feedback) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="w-full space-y-6">
      {/* Input field with enhanced design */}
      <div className="relative">
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${userInput ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
          <span className="text-lg">🔍</span>
        </div>
        
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập từ vựng tiếng Anh..."
          className={`w-full p-4 pl-12 pr-16 border-2 rounded-xl text-lg shadow-md focus:outline-none focus:ring-2 transition-all duration-300
            ${isCorrect === true ? 'border-green-500 bg-green-50 focus:ring-green-200' :
              isCorrect === false ? 'border-red-500 bg-red-50 focus:ring-red-200' :
              'border-indigo-300 focus:ring-blue-200 focus:border-blue-500'}`}
          disabled={disabled}
          autoComplete="off"
        />
        
        <button
          onClick={checkAnswer}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-lg transition-all duration-300 shadow
            ${userInput.trim() && !disabled 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg active:scale-95' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          disabled={!userInput.trim() || disabled}
        >
          <span className="text-lg">🔍</span>
        </button>
      </div>

      {/* Enhanced feedback with animations */}
      {feedback && (
        <div 
          className={`flex items-center p-4 rounded-xl shadow-md transition-all duration-300 transform ${animate ? 'scale-105' : 'scale-100'}
            ${isCorrect 
              ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200'}`}
        >
          {isCorrect ? (
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 flex items-center justify-center bg-green-500 text-white rounded-full w-10 h-10 shadow-sm">
                <span className="font-bold text-xl">✓</span>
              </div>
              <div className="ml-4 flex-grow">
                <p className="font-medium text-lg">{feedback}</p>
                <p className="text-sm text-green-600 opacity-75">Tuyệt vời! Tiếp tục phát huy.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 flex items-center justify-center bg-red-500 text-white rounded-full w-10 h-10 shadow-sm">
                <span className="font-bold text-xl">✕</span>
              </div>
              <div className="ml-4 flex-grow">
                <p className="font-medium text-lg">{feedback}</p>
                <p className="text-sm text-red-600 opacity-75">Hãy thử lại nhé.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabularyInput;
