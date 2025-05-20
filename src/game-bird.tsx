import React, { useState, useEffect, useCallback, useRef } from 'react';

// Tailwind CSS is assumed to be available globally

const BIRD_SIZE = 30;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GRAVITY = 0.7;
const JUMP_STRENGTH = 12;
const PIPE_WIDTH = 70;
const PIPE_GAP = 150; // Vertical gap between pipes
const PIPE_SPAWN_INTERVAL = 2000; // Milliseconds
const PIPE_SPEED = 3;

// Utility function to generate random numbers
const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Main App Component
const App = () => {
  const [birdPosition, setBirdPosition] = useState(GAME_HEIGHT / 2 - BIRD_SIZE / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const gameAreaRef = useRef(null);

  // Game loop
  useEffect(() => {
    let gameLoopInterval;

    if (gameState === 'playing') {
      gameLoopInterval = setInterval(() => {
        // Bird physics
        setBirdVelocity(prevVelocity => prevVelocity + GRAVITY);
        setBirdPosition(prevPosition => {
          const newPosition = prevPosition + birdVelocity;
          // Prevent bird from going off top screen
          if (newPosition < 0) return 0;
          return newPosition;
        });

        // Move pipes
        setPipes(prevPipes =>
          prevPipes
            .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
            .filter(pipe => pipe.x + PIPE_WIDTH > 0) // Remove pipes off-screen
        );

        // Collision detection
        const birdRect = {
          x: GAME_WIDTH / 2 - BIRD_SIZE / 2, // Bird is centered horizontally
          y: birdPosition,
          width: BIRD_SIZE,
          height: BIRD_SIZE,
        };

        // Ground collision
        if (birdPosition + BIRD_SIZE > GAME_HEIGHT) {
          setGameState('gameOver');
          return;
        }

        // Pipe collision
        for (const pipe of pipes) {
          const topPipeRect = {
            x: pipe.x,
            y: 0,
            width: PIPE_WIDTH,
            height: pipe.topHeight,
          };
          const bottomPipeRect = {
            x: pipe.x,
            y: pipe.topHeight + PIPE_GAP,
            width: PIPE_WIDTH,
            height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
          };

          if (
            (birdRect.x < topPipeRect.x + topPipeRect.width &&
              birdRect.x + birdRect.width > topPipeRect.x &&
              birdRect.y < topPipeRect.y + topPipeRect.height &&
              birdRect.y + birdRect.height > topPipeRect.y) ||
            (birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
              birdRect.x + birdRect.width > bottomPipeRect.x &&
              birdRect.y < bottomPipeRect.y + bottomPipeRect.height &&
              birdRect.y + birdRect.height > bottomPipeRect.y)
          ) {
            setGameState('gameOver');
            return;
          }
        }

        // Score update
        const passedPipe = pipes.find(pipe => !pipe.passed && pipe.x + PIPE_WIDTH < birdRect.x);
        if (passedPipe) {
          setScore(prevScore => prevScore + 1);
          setPipes(prevPipes =>
            prevPipes.map(p => (p.id === passedPipe.id ? { ...p, passed: true } : p))
          );
        }
      }, 20); // Approx 50 FPS
    }

    return () => clearInterval(gameLoopInterval);
  }, [gameState, birdPosition, birdVelocity, pipes]);

  // Pipe spawner
  useEffect(() => {
    let pipeSpawnerInterval;
    if (gameState === 'playing') {
      pipeSpawnerInterval = setInterval(() => {
        const topHeight = getRandom(50, GAME_HEIGHT - PIPE_GAP - 50);
        setPipes(prevPipes => [
          ...prevPipes,
          {
            id: Date.now(), // Unique ID for pipe
            x: GAME_WIDTH,
            topHeight: topHeight,
            passed: false,
          },
        ]);
      }, PIPE_SPAWN_INTERVAL);
    }
    return () => clearInterval(pipeSpawnerInterval);
  }, [gameState]);

  // Handle user input (jump)
  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      setBirdVelocity(-JUMP_STRENGTH);
    } else if (gameState === 'start' || gameState === 'gameOver') {
      // Reset game
      setBirdPosition(GAME_HEIGHT / 2 - BIRD_SIZE / 2);
      setBirdVelocity(0);
      setPipes([]);
      setScore(0);
      setGameState('playing');
    }
  }, [gameState]);

  // Event listener for jump (click or spacebar)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.type === 'click' || e.type === 'touchstart') {
        e.preventDefault(); // Prevent spacebar from scrolling
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    // Add touch event for mobile
    const gameArea = gameAreaRef.current;
    if (gameArea) {
        gameArea.addEventListener('click', handleKeyPress);
        gameArea.addEventListener('touchstart', handleKeyPress, { passive: false });
    }


    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameArea) {
        gameArea.removeEventListener('click', handleKeyPress);
        gameArea.removeEventListener('touchstart', handleKeyPress);
      }
    };
  }, [handleJump]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 to-sky-600 font-mono select-none">
      <div
        ref={gameAreaRef}
        className="relative overflow-hidden bg-sky-200 border-4 border-gray-700 rounded-lg shadow-2xl cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        // onClick={handleJump} // Replaced by useEffect event listener for better control
      >
        {/* Bird */}
        <div
          className="absolute bg-yellow-400 rounded-full transition-transform duration-50 ease-linear shadow-md border-2 border-yellow-600"
          style={{
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            top: birdPosition,
            left: GAME_WIDTH / 2 - BIRD_SIZE / 2, // Center bird horizontally
            transform: `rotate(${Math.min(90, Math.max(-30, birdVelocity * 3))}deg)` // Bird tilt effect
          }}
        >
          {/* Bird Eye */}
          <div className="absolute w-2 h-2 bg-black rounded-full top-1/3 right-1/4 transform -translate-y-1/2"></div>
          {/* Bird Beak */}
          <div
            className="absolute w-4 h-2 bg-orange-500 rounded-sm top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 border border-orange-700"
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          ></div>
        </div>

        {/* Pipes */}
        {pipes.map(pipe => (
          <React.Fragment key={pipe.id}>
            {/* Top Pipe */}
            <div
              className="absolute bg-green-500 border-2 border-green-700 rounded-sm shadow-md"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
              }}
            />
            {/* Bottom Pipe */}
            <div
              className="absolute bg-green-500 border-2 border-green-700 rounded-sm shadow-md"
              style={{
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
              }}
            />
          </React.Fragment>
        ))}

        {/* Score Display */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white" style={{ textShadow: '2px 2px #000000' }}>
          {score}
        </div>

        {/* Game Over / Start Screen */}
        {(gameState === 'gameOver' || gameState === 'start') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4">
            {gameState === 'gameOver' && (
              <div className="text-5xl font-bold text-red-500 mb-4" style={{ textShadow: '2px 2px #ffffff' }}>
                Game Over
              </div>
            )}
            <div className="text-2xl text-white mb-2">
              {gameState === 'start' ? 'Nhấn để Bắt đầu' : 'Nhấn để Chơi lại'}
            </div>
            {gameState === 'gameOver' && (
              <div className="text-xl text-white">Điểm của bạn: {score}</div>
            )}
             <div className="text-sm text-gray-200 mt-4">
              (Nhấn phím cách hoặc chạm màn hình)
            </div>
          </div>
        )}
      </div>
       <div className="mt-4 text-center text-white">
        <p>Điều khiển: Nhấn phím cách hoặc chạm vào màn hình để chim bay lên.</p>
        <p className="text-xs mt-2">Tạo bởi Gemini</p>
      </div>
    </div>
  );
};

export default App;
