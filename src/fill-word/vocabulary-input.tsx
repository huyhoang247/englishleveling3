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
  
  // Get the appropriate background color for a specific letter box
  const getSquareStyle = (index: number) => {
    // If the answer has been submitted and is correct
    if (isCorrect === true) {
      return 'bg-green-100 border-green-500 text-green-800';
    }
    // If the answer has been submitted and is incorrect
    else if (isCorrect === false) {
      return 'bg-red-50 border-red-500 text-red-800';
    }
    // If the square has a letter
    else if (squares[index]) {
      return 'bg-indigo-50 border-indigo-400 text-indigo-800';
    }
    // Empty square
    return 'bg-white border-gray-300 text-gray-500';
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
        className="flex justify-center w-full gap-2 mb-4"
        onClick={focusInput}
      >
        {squares.map((char, index) => (
          <div
            key={index}
            className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-2 rounded-lg text-2xl font-bold transition-all transform ${
              index === userInput.length && !disabled ? 'scale-105 border-blue-500 shadow-md' : ''
            } ${getSquareStyle(index)}`}
          >
            {char.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Submit button */}
      <div className="flex justify-center">
        <button
          onClick={checkAnswer}
          className={`px-8 py-3 rounded-xl transition-all shadow-md transform hover:shadow-lg ${
            userInput.length === wordLength && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={userInput.length !== wordLength || disabled}
        >
          Kiểm tra
        </button>
      </div>
      
      {/* Letter keyboard */}
      <div className="mt-8">
        <div className="flex justify-center flex-wrap gap-1 mb-1">
          {'QWERTYUIOP'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => {
                if (!disabled && userInput.length < wordLength) {
                  setUserInput(userInput + letter.toLowerCase());
                }
              }}
              className={`w-9 h-10 flex items-center justify-center rounded-md text-sm font-medium shadow-sm 
                ${
                  disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              disabled={disabled || userInput.length >= wordLength}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-1 mb-1">
          {'ASDFGHJKL'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => {
                if (!disabled && userInput.length < wordLength) {
                  setUserInput(userInput + letter.toLowerCase());
                }
              }}
              className={`w-9 h-10 flex items-center justify-center rounded-md text-sm font-medium shadow-sm 
                ${
                  disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              disabled={disabled || userInput.length >= wordLength}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-1">
          <button
            onClick={() => {
              if (!disabled) {
                checkAnswer();
              }
            }}
            className={`px-2 h-10 flex items-center justify-center rounded-md text-sm font-medium shadow-sm 
              ${
                disabled || userInput.length !== wordLength
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
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
              className={`w-9 h-10 flex items-center justify-center rounded-md text-sm font-medium shadow-sm 
                ${
                  disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
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
            className={`px-2 h-10 flex items-center justify-center rounded-md text-sm font-medium shadow-sm 
              ${
                disabled || userInput.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            disabled={disabled || userInput.length === 0}
          >
            ←
          </button>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center justify-center p-4 rounded-xl shadow-sm mt-6
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

export default WordSquaresInput;
