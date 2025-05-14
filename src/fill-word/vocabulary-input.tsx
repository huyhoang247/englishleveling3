import React, { useState, useEffect, useRef } from 'react';

interface WordSquaresInputProps {
  word: string | null;
  userInput: string;
  setUserInput: (value: string) => void;
  checkAnswer: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  feedback: string;
  isCorrect: boolean | null;
  disabled: boolean;
}

const WordSquaresInput: React.FC<WordSquaresInputProps> = ({
  word,
  userInput,
  setUserInput,
  checkAnswer,
  handleKeyPress,
  feedback,
  isCorrect,
  disabled,
}) => {
  // Create an array of individual characters from userInput
  const characters = userInput.split('');
  
  // Create an array of empty squares for the current word length
  const wordLength = word?.length || 5;
  const squares = Array(wordLength).fill('');
  
  // Populate squares with available characters
  for (let i = 0; i < characters.length && i < wordLength; i++) {
    squares[i] = characters[i];
  }
  
  // Reference to hidden input element
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the hidden input when clicking on the container
  const focusInput = () => {
    if (hiddenInputRef.current && !disabled) {
      hiddenInputRef.current.focus();
    }
  };
  
  // Handle backspace and delete keys
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= wordLength) {
      setUserInput(value);
    }
  };
  
  // Define custom animation keyframes
  useEffect(() => {
    // This adds a custom animation to the document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-5px); }
        40% { transform: translateX(5px); }
        60% { transform: translateX(-3px); }
        80% { transform: translateX(3px); }
      }
      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Get the appropriate styles for a specific letter box
  const getSquareStyle = (index: number) => {
    // If the answer has been submitted and is correct
    if (isCorrect === true) {
      return 'bg-gradient-to-br from-green-200 to-green-300 border-green-500 text-green-800 shadow-lg';
    }
    // If the answer has been submitted and is incorrect
    else if (isCorrect === false) {
      return 'bg-gradient-to-br from-red-100 to-red-200 border-red-500 text-red-800 shadow-md';
    }
    // If the square has a letter
    else if (squares[index]) {
      return 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-400 text-indigo-800 shadow-md';
    }
    // Empty square
    return 'bg-gradient-to-br from-gray-50 to-white border-gray-300 text-gray-500 shadow-sm';
  };

  // Get the appropriate animation for a specific letter box
  const getSquareAnimation = (index: number) => {
    if (index === userInput.length && !disabled) {
      return 'animate-pulse';
    }
    
    if (isCorrect === true) {
      // Different animation delays for each letter when correct
      const delays = ['animate-bounce delay-0', 'animate-bounce delay-100', 'animate-bounce delay-200', 'animate-bounce delay-300', 'animate-bounce delay-400'];
      return delays[index % delays.length];
    }
    
    if (isCorrect === false) {
      return 'animate-shake';
    }
    
    return '';
  };
  
  return (
    <div className="w-full space-y-6">
      {/* Hidden input field that captures keyboard input */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="opacity-0 absolute h-0 w-0"
        autoFocus
        disabled={disabled}
      />
      
      {/* Word squares container */}
      <div 
        className="flex justify-center w-full gap-3 mb-4"
        onClick={focusInput}
      >
        {squares.map((char, index) => (
          <div
            key={index}
            className={`aspect-square w-16 md:w-20 flex items-center justify-center border-2 rounded-xl text-2xl font-bold transition-all duration-300 transform ${
              index === userInput.length && !disabled ? 'scale-110 border-blue-500 ring-2 ring-blue-300 ring-opacity-50' : ''
            } ${getSquareStyle(index)} ${getSquareAnimation(index)}`}
          >
            {char.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Submit button */}
      <div className="flex justify-center">
        <button
          onClick={checkAnswer}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-md transform ${
            userInput.length === wordLength && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-lg'
              : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          disabled={userInput.length !== wordLength || disabled}
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kiểm tra
          </span>
        </button>
      </div>
      
      {/* Letter keyboard */}
      <div className="mt-8">
        <div className="flex justify-center flex-wrap gap-1.5 mb-1.5">
          {'QWERTYUIOP'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => {
                if (!disabled && userInput.length < wordLength) {
                  setUserInput(userInput + letter.toLowerCase());
                }
              }}
              className={`aspect-square w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                ${
                  disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-b from-white to-gray-100 border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow hover:from-gray-50 hover:-translate-y-0.5'
                }`}
              disabled={disabled || userInput.length >= wordLength}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-1.5 mb-1.5">
          {'ASDFGHJKL'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => {
                if (!disabled && userInput.length < wordLength) {
                  setUserInput(userInput + letter.toLowerCase());
                }
              }}
              className={`aspect-square w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                ${
                  disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-b from-white to-gray-100 border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow hover:from-gray-50 hover:-translate-y-0.5'
                }`}
              disabled={disabled || userInput.length >= wordLength}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-1.5">
          <button
            onClick={() => {
              if (!disabled) {
                checkAnswer();
              }
            }}
            className={`px-3 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
              ${
                disabled || userInput.length !== wordLength
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-sm hover:from-green-600 hover:to-green-700 hover:shadow-md hover:-translate-y-0.5'
              }`}
            disabled={disabled || userInput.length !== wordLength}
          >
            ENTER
          </button>
          {'ZXCVBNM'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => {
                if (!disabled && userInput.length < wordLength) {
                  setUserInput(userInput + letter.toLowerCase());
                }
              }}
              className={`aspect-square w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                ${
                  disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-b from-white to-gray-100 border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow hover:from-gray-50 hover:-translate-y-0.5'
                }`}
              disabled={disabled || userInput.length >= wordLength}
            >
              {letter}
            </button>
          ))}
          <button
            onClick={() => {
              if (!disabled && userInput.length > 0) {
                setUserInput(userInput.slice(0, -1));
              }
            }}
            className={`px-3 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
              ${
                disabled || userInput.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md hover:-translate-y-0.5'
              }`}
            disabled={disabled || userInput.length === 0}
          >
            ←
          </button>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center justify-center p-4 rounded-xl shadow-md mt-6 transition-all duration-300
          ${isCorrect 
            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200' 
            : 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200'}`}>
          {isCorrect ?
            <div className="flex items-center">
              <span className="flex items-center justify-center bg-gradient-to-br from-green-400 to-green-500 text-white rounded-full w-8 h-8 mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="font-medium">{feedback}</span>
            </div> :
            <div className="flex items-center">
              <span className="flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 text-white rounded-full w-8 h-8 mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
