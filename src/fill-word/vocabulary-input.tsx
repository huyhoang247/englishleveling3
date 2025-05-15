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
  // Create an array of individual characters from userInput
  const characters = userInput.split('');

  // Create an array of empty squares for the current word length
  const wordLength = word?.length || 5;
  const squares = Array(wordLength).fill('');

  // Fill the squares with available characters
  for (let i = 0; i < characters.length && i < wordLength; i++) {
    squares[i] = characters[i];
  }

  // Handle click on a square (to delete character at that position)
  const handleSquareClick = (index: number) => {
    if (disabled) return;

    // Check if the square contains a character
    if (index < userInput.length) {
      // Remove character at the specified index
      const newUserInput = userInput.slice(0, index) + userInput.slice(index + 1);
      setUserInput(newUserInput);
    }
  };

  // Define custom keyframe animations
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

  // Get appropriate style for each letter square
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

  // Get appropriate animation for each letter square
  const getSquareAnimation = (index: number) => {
    // Pulsing animation for the next empty square when game is not over and not correctly answered
    if (index === userInput.length && !disabled && isCorrect === null) {
      return 'animate-pulse';
    }
    // Pop animation when correct
    if (isCorrect === true) {
      const delays = ['animate-pop delay-0', 'animate-pop delay-100', 'animate-pop delay-200', 'animate-pop delay-300', 'animate-pop delay-400'];
      return delays[index % delays.length];
    }
    // Shake animation when incorrect
    if (isCorrect === false) {
      return 'animate-shake';
    }
    return '';
  };

  // Format display word with first letter capitalized
  const formatDisplayWord = (input: string) => {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  };


  return (
    <div className="w-full space-y-4">
      {/* Container for word squares */}
      <div
        className="flex justify-center w-full gap-2 mb-3"
      >
        {squares.map((char, index) => (
          <div
            key={index}
            // Removed fixed width (w-12 md:w-14) and added flex properties for flexible sizing
            // Added min-w-0 to allow shrinking below content size in flex container
            // Added overflow-hidden and text-ellipsis to handle potential text overflow
            // Adjusted text size to text-lg by default and md:text-xl for larger screens
            className={`word-square aspect-square flex items-center justify-center border rounded-lg font-bold transition-all duration-200
            flex-grow flex-shrink min-w-0 overflow-hidden text-ellipsis text-lg md:text-xl
              ${
                // Highlight the next empty square
                index === userInput.length && !disabled && isCorrect === null ? 'scale-105 border-blue-400 ring-1 ring-blue-200' : ''
              }
              ${getSquareStyle(index)} ${getSquareAnimation(index)}`}
            onClick={() => handleSquareClick(index)} // Handle click to delete character at that position
          >
            {char.toUpperCase()} {/* Display uppercase character in the square */}
          </div>
        ))}
      </div>

      {/* Word display box - Always visible to maintain spacing */}
      <div className="flex justify-center w-full min-h-[2.5rem]"> {/* Added min-h to ensure space */}
          {/* Only display word when there is input */}
          {userInput.length > 0 && (
            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm text-indigo-700 font-medium text-center transition-all duration-300 hover:scale-105">
              {formatDisplayWord(userInput)}
            </div>
          )}
      </div>


      {/* Check button */}
      <div className="flex justify-center">
        <button
          onClick={checkAnswer}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center
          ${
            // Button is only active when input is full and game is not over
            userInput.length === wordLength && !disabled
              ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={userInput.length !== wordLength || disabled} // Disable button when input is not full or game over
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kiểm tra
        </button>
      </div>

      {/* Virtual alphabet keyboard */}
      {/* Pass userInput, setUserInput, wordLength, and disabled down to VirtualKeyboard component */}
      <VirtualKeyboard
        userInput={userInput}
        setUserInput={setUserInput}
        wordLength={wordLength}
        disabled={disabled}
      />


      {/* Feedback */}
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
