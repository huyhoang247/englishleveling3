import React from 'react';

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
  return (
    <div className="w-full space-y-6">
      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập từ vựng tiếng Anh..."
          className={`w-full p-4 pr-16 border-2 rounded-xl text-lg shadow-sm focus:outline-none focus:ring-2 transition-all
            ${isCorrect === true ? 'border-green-500 bg-green-50 focus:ring-green-200' :
              isCorrect === false ? 'border-red-500 bg-red-50 focus:ring-red-200' :
              'border-indigo-200 focus:ring-blue-200 focus:border-blue-400'}`}
          disabled={disabled} // Use the disabled prop
        />
        <button
          onClick={checkAnswer}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-lg transition-all shadow-sm
            ${userInput.trim() && !disabled ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' :
            'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          disabled={!userInput.trim() || disabled} // Disable if input is empty or component is disabled
        >
          <span className="text-lg">🔍</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center justify-center p-4 rounded-xl shadow-sm animation-pulse
          ${isCorrect ? 'bg-green-100 text-green-800 border border-green-200' :
                     'bg-red-100 text-red-800 border border-red-200'}`}>
          {isCorrect ?
            <div className="flex items-center">
              <span className="flex items-center justify-center bg-green-500 text-white rounded-full w-8 h-8 mr-3">✓</span>
              <span className="font-medium">{feedback}</span>
            </div> :
            <div className="flex items-center">
              <span className="flex items-center justify-center bg-red-500 text-white rounded-full w-8 h-8 mr-3">✕</span>
              <span>{feedback}</span>
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default VocabularyInput;
