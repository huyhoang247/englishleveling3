import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, Trophy, Star } from 'lucide-react';

export default function ObstacleRunnerGame() {
  // Game states
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [jumping, setJumping] = useState(false);
  const [characterPos, setCharacterPos] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runFrame, setRunFrame] = useState(0);
  const [particles, setParticles] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const gameRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const scoreTimerRef = useRef(null);
  const runAnimationRef = useRef(null);
  const particleTimerRef = useRef(null);
  const cloudTimerRef = useRef(null);
  
  // Character animation frames
  const runFrames = [0, 1, 2, 1]; // Different leg positions
  
  // Obstacle types
  const obstacleTypes = [
    { type: 'rock', height: 10, width: 10, color: 'from-gray-700 to-gray-500' },
    { type: 'cactus', height: 16, width: 8, color: 'from-green-800 to-green-600' },
    { type: 'bird', height: 8, width: 12, color: 'from-blue-500 to-purple-500', floatHeight: 40 }
  ];

  // Start game function
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHealth(3);
    setCharacterPos(0);
    setObstacles([]);
    setParticles([]);
    setIsRunning(true);
    setIsPaused(false);
    
    // Generate initial obstacles (so player doesn't start with empty screen)
    const initialObstacles = [];
    // First obstacle a bit further to give player time to react
    initialObstacles.push({
      id: Date.now(),
      position: 120,
      ...obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
    });
    
    // Add a few more obstacles with increasing distance
    for (let i = 1; i < 5; i++) {
      initialObstacles.push({
        id: Date.now() + i,
        position: 150 + (i * 50),
        ...obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      });
    }
    
    setObstacles(initialObstacles);
    
    // Generate initial clouds
    generateClouds();
    
    // Start run animation
    startRunAnimation();
    
    // Generate particles periodically
    particleTimerRef.current = setInterval(generateParticles, 300);
    
    // Score incrementer with increasing difficulty
    scoreTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setScore(prevScore => {
          // Higher score increment as game progresses
          const increment = Math.floor(prevScore / 1000) + 1;
          return prevScore + increment;
        });
      }
    }, 100);
    
    // Schedule obstacles
    scheduleNextObstacle();
  };

  // Handle game over
  useEffect(() => {
    if (health <= 0 && gameStarted) {
      setGameOver(true);
      setIsRunning(false);
      clearInterval(scoreTimerRef.current);
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      
      // Update high score if necessary
      if (score > highScore) {
        setHighScore(score);
      }
    }
  }, [health, gameStarted, score, highScore]);

  // Generate cloud elements
  const generateClouds = () => {
    // Create more clouds initially for a full environment
    const cloudCount = clouds.length < 5 ? 5 : 3;
    const newClouds = [];
    
    for (let i = 0; i < cloudCount; i++) {
      // Distribute clouds more evenly across the screen initially
      const xPosition = clouds.length < 5 
        ? (i * 30) + Math.random() * 20 // Distributed for initial setup
        : Math.random() * 120 + 100;    // Random for later additions
        
      newClouds.push({
        id: Date.now() + i,
        x: xPosition,
        y: Math.random() * 40 + 10,
        size: Math.random() * 20 + 30,
        speed: Math.random() * 0.2 + 0.1
      });
    }
    setClouds(prev => [...prev, ...newClouds]);
    
    // Schedule next cloud generation only if we don't have too many
    // (we're now recycling clouds in the movement loop)
    if (clouds.length < 8) {
      cloudTimerRef.current = setTimeout(generateClouds, Math.random() * 10000 + 5000);
    }
  };

  // Generate dust particles
  const generateParticles = () => {
    if (!gameStarted || gameOver || isPaused) return;
    
    const newParticles = [];
    for (let i = 0; i < 2; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 10 + Math.random() * 5,
        y: 0,
        size: Math.random() * 4 + 2,
        xVelocity: -Math.random() * 1 - 0.5,
        yVelocity: Math.random() * 2 - 1,
        opacity: 1,
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Start character run animation
  const startRunAnimation = () => {
    if (runAnimationRef.current) clearInterval(runAnimationRef.current);
    
    runAnimationRef.current = setInterval(() => {
      if (!isPaused) {
        setRunFrame(prev => (prev + 1) % runFrames.length);
      }
    }, 150);
  };

  // Create obstacles continuously
  const scheduleNextObstacle = () => {
    if (gameOver) return;
    
    // Random time between 5-20 seconds
    const randomTime = Math.floor(Math.random() * 15000) + 5000; 
    obstacleTimerRef.current = setTimeout(() => {
      if (!isPaused) {
        // Create 1-3 obstacles in a group
        const obstacleCount = Math.floor(Math.random() * 3) + 1;
        const newObstacles = [];
        
        for (let i = 0; i < obstacleCount; i++) {
          const randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          // Add spacing between grouped obstacles
          const spacing = i * (Math.random() * 10 + 10);
          
          newObstacles.push({ 
            id: Date.now() + i, 
            position: 100 + spacing,
            ...randomObstacle
          });
        }
        
        setObstacles(prev => [...prev, ...newObstacles]);
      }
      scheduleNextObstacle();
    }, randomTime);
  };

  // Handle jumping
  const jump = () => {
    if (!jumping && !gameOver && gameStarted && !isPaused) {
      setJumping(true);
      setCharacterPos(80);
      setTimeout(() => {
        if (gameStarted && !gameOver) {
          setCharacterPos(0);
          setTimeout(() => {
            setJumping(false);
          }, 100);
        }
      }, 600);
    }
  };

  // Handle tap/click on game area
  const handleTap = () => {
    if (!gameStarted) {
      startGame();
    } else if (!gameOver && !isPaused) {
      jump();
    } else if (gameOver) {
      startGame();
    }
  };

  // Toggle pause
  const togglePause = (e) => {
    e.stopPropagation();
    setIsPaused(prev => !prev);
  };

  // Flash screen on collision
  const flashScreen = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
  };

  // Move obstacles and detect collisions
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;
    
    // Game speed increases with score
    const baseSpeed = 2;
    const speedMultiplier = 1 + Math.min(score / 1000, 1); // Max 2x speed
    
    const moveInterval = setInterval(() => {
      // Move obstacles with endless loop
      setObstacles(prevObstacles => {
        return prevObstacles
          .map(obstacle => {
            // Calculate speed based on obstacle type and current score
            const speed = (obstacle.type === 'bird' ? 2.5 : 2) * speedMultiplier;
            let newPosition = obstacle.position - speed;
            
            // Create infinite loop effect by resetting obstacles
            if (newPosition < -20) {
              // Instead of removing, loop them back to right side with new properties
              if (Math.random() < 0.7) { // 70% chance to reuse obstacle
                const randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                const randomOffset = Math.floor(Math.random() * 20);
                
                return {
                  ...obstacle,
                  ...randomObstacle, // New type
                  id: Date.now(), // New ID to ensure React updates properly
                  position: 120 + randomOffset // Place it off-screen to the right with random offset
                };
              } else {
                return { ...obstacle, position: newPosition }; // Will be filtered out below
              }
            }
            
            return { ...obstacle, position: newPosition };
          })
          .filter(obstacle => {
            // Detect collision based on obstacle type
            let collisionDetected = false;
            const characterWidth = 12;
            const characterHeight = 16;
            const characterX = 10;
            const characterY = characterPos;
            
            const obstacleX = obstacle.position;
            const obstacleY = obstacle.floatHeight || 0;
            const obstacleWidth = obstacle.width;
            const obstacleHeight = obstacle.height;
            
            // Check for collision with accurate hitboxes
            if (
              characterX < obstacleX + obstacleWidth &&
              characterX + characterWidth > obstacleX &&
              characterY < obstacleY + obstacleHeight &&
              characterY + characterHeight > obstacleY
            ) {
              collisionDetected = true;
              setHealth(prev => prev - 1);
              flashScreen();
            }
            
            // Keep obstacles that are still visible or will loop back
            return !collisionDetected && obstacle.position > -20;
          });
      });
      
      // Move clouds with infinite loop
      setClouds(prevClouds => {
        const updatedClouds = prevClouds
          .map(cloud => {
            const newX = cloud.x - cloud.speed;
            
            // Loop clouds back to right side
            if (newX < -50) {
              return {
                ...cloud,
                id: Date.now() + Math.random(), // New ID
                x: 120 + Math.random() * 30, // New position off-screen
                y: Math.random() * 40 + 10, // New height
                size: Math.random() * 20 + 30 // New size
              };
            }
            
            return { ...cloud, x: newX };
          });
          
        // Ensure we always have enough clouds
        if (updatedClouds.length < 5) {
          const newCloud = {
            id: Date.now() + Math.random(),
            x: 120 + Math.random() * 30,
            y: Math.random() * 40 + 10,
            size: Math.random() * 20 + 30,
            speed: Math.random() * 0.2 + 0.1
          };
          return [...updatedClouds, newCloud];
        }
        
        return updatedClouds;
      });
      
      // Update particles
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.xVelocity,
            y: particle.y + particle.yVelocity,
            opacity: particle.opacity - 0.03,
            size: particle.size - 0.1
          }))
          .filter(particle => particle.opacity > 0 && particle.size > 0)
      );
      
    }, 30); // Smoother motion with faster interval
    
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver, jumping, characterPos, isPaused, score]);

  // Clean up timers
  useEffect(() => {
    return () => {
      clearInterval(scoreTimerRef.current);
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      clearTimeout(cloudTimerRef.current);
    };
  }, []);

  // Render health hearts
  const renderHealth = () => {
    return Array(3).fill(0).map((_, i) => (
      <Heart 
        key={i} 
        className={`w-6 h-6 ${i < health ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
      />
    ));
  };

  // Render character with animation
  const renderCharacter = () => {
    const legPos = jumping ? 1 : runFrames[runFrame];
    
    return (
      <div 
        className="absolute w-12 h-16 transition-all duration-300 ease-out"
        style={{ 
          bottom: `calc(25% + ${characterPos}px)`,
          left: '10%',
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        {/* Body */}
        <div className="absolute w-10 h-12 bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-lg left-1">
          {/* Eyes */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
          
          {/* Mouth */}
          <div className={`absolute top-6 left-2 w-6 h-1 ${jumping ? 'rounded-t-full bg-red-500' : 'rounded-full bg-white'}`}></div>
          
          {/* Arms */}
          <div className={`absolute top-4 left-0 w-2 h-4 bg-blue-700 rounded-full transform ${jumping ? 'rotate-45' : 'rotate-12'}`}></div>
          <div className={`absolute top-4 right-0 w-2 h-4 bg-blue-700 rounded-full transform ${jumping ? '-rotate-45' : '-rotate-12'}`}></div>
        </div>
        
        {/* Legs */}
        <div className={`absolute bottom-0 left-2 w-3 h-5 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-b-lg transform ${legPos === 0 ? '' : legPos === 1 ? 'translate-x-1 -translate-y-1' : 'translate-x-2 -translate-y-2'}`}></div>
        <div className={`absolute bottom-0 right-2 w-3 h-5 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-b-lg transform ${legPos === 0 ? '' : legPos === 2 ? 'translate-x-1 -translate-y-1' : '-translate-x-2 -translate-y-2'}`}></div>
        
        {/* Shadow */}
        <div 
          className="absolute w-10 h-2 bg-black bg-opacity-20 rounded-full" 
          style={{ 
            bottom: '-10px', 
            left: '1px',
            transform: `scale(${1 - characterPos/100})`,
            opacity: 1 - characterPos/100
          }}
        ></div>
      </div>
    );
  };

  // Render obstacles with different designs
  const renderObstacle = (obstacle) => {
    let obstacleEl;
    
    switch(obstacle.type) {
      case 'rock':
        obstacleEl = (
          <div className={`w-10 h-10 bg-gradient-to-br ${obstacle.color} rounded-lg`}>
            <div className="w-3 h-2 bg-gray-600 rounded-full absolute top-2 left-1"></div>
            <div className="w-2 h-1 bg-gray-600 rounded-full absolute top-5 right-2"></div>
          </div>
        );
        break;
      case 'cactus':
        obstacleEl = (
          <div className="relative">
            <div className={`w-8 h-16 bg-gradient-to-b ${obstacle.color} rounded-lg`}></div>
            <div className={`w-4 h-6 bg-gradient-to-b ${obstacle.color} rounded-lg absolute -left-3 top-3 transform -rotate-45`}></div>
            <div className={`w-4 h-6 bg-gradient-to-b ${obstacle.color} rounded-lg absolute -right-3 top-5 transform rotate-45`}></div>
          </div>
        );
        break;
      case 'bird':
        obstacleEl = (
          <div className="relative">
            <div className={`w-12 h-8 bg-gradient-to-br ${obstacle.color} rounded-full`}>
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1">
                <div className="w-2 h-2 bg-black rounded-full absolute top-1 left-1"></div>
              </div>
              <div className={`w-8 h-1 border-t-2 border-purple-700 absolute top-6 left-2 ${runFrame % 2 === 0 ? 'transform -rotate-12' : 'transform rotate-12'}`}></div>
              <div className={`w-8 h-1 border-t-2 border-purple-700 absolute top-4 left-2 ${runFrame % 2 === 0 ? 'transform rotate-12' : 'transform -rotate-12'}`}></div>
              <div className="w-4 h-2 bg-yellow-500 rounded absolute top-3 right-0 transform rotate-45"></div>
            </div>
          </div>
        );
        break;
      default:
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color} rounded`}></div>
        );
    }
    
    return (
      <div 
        key={obstacle.id}
        className="absolute"
        style={{ 
          bottom: obstacle.floatHeight ? `calc(25% + ${obstacle.floatHeight}px)` : '25%', 
          left: `${obstacle.position}%` 
        }}
      >
        {obstacleEl}
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <div 
        key={cloud.id}
        className="absolute bg-white rounded-full opacity-60"
        style={{ 
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`,
          top: `${cloud.y}%`,
          left: `${cloud.x}%`
        }}
      >
        <div 
          className="absolute bg-white rounded-full"
          style={{ 
            width: `${cloud.size * 0.7}px`,
            height: `${cloud.size * 0.7}px`,
            top: `-${cloud.size * 0.1}px`,
            left: `${cloud.size * 0.1}px`
          }}
        ></div>
        <div 
          className="absolute bg-white rounded-full"
          style={{ 
            width: `${cloud.size * 0.8}px`,
            height: `${cloud.size * 0.8}px`,
            top: `-${cloud.size * 0.15}px`,
            left: `${cloud.size * 0.3}px`
          }}
        ></div>
      </div>
    ));
  };

  // Render dust particles
  const renderParticles = () => {
    return particles.map(particle => (
      <div 
        key={particle.id}
        className={`absolute rounded-full ${particle.color}`}
        style={{ 
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          bottom: `calc(25% + ${particle.y}px)`,
          left: `calc(10% + ${particle.x}px)`,
          opacity: particle.opacity
        }}
      ></div>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <Activity className="mr-2 text-blue-400" /> 
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Game Vượt Chướng Ngại Vật</span>
      </h1>
      
      {/* Game Container */}
      <div 
        ref={gameRef}
        className="relative w-full max-w-md h-64 border-2 border-indigo-700 rounded-lg overflow-hidden shadow-2xl"
        onClick={handleTap}
      >
        {/* Background with parallax effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600"></div>
        
        {/* Sun */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10"></div>
        
        {/* Clouds */}
        {renderClouds()}
        
        {/* Mountains */}
        <div className="absolute bottom-1/4 w-full">
          <div className="absolute bottom-0 w-full h-16 bg-gradient-to-b from-indigo-900 to-indigo-700 transform skew-x-12" style={{ left: '-10%', width: '50%' }}></div>
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-indigo-800 to-indigo-600 transform -skew-x-12" style={{ left: '30%', width: '60%' }}></div>
          <div className="absolute bottom-0 w-full h-12 bg-gradient-to-b from-purple-800 to-purple-600 transform skew-x-12" style={{ left: '70%', width: '50%' }}></div>
        </div>
        
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-green-900 to-green-700">
          {/* Ground details */}
          <div className="w-full h-1 bg-green-800 absolute top-0"></div>
          <div className="w-3 h-3 bg-green-800 rounded-full absolute top-6 left-20"></div>
          <div className="w-4 h-2 bg-green-800 rounded-full absolute top-10 left-40"></div>
          <div className="w-6 h-3 bg-green-800 rounded-full absolute top-8 right-10"></div>
          <div className="w-3 h-1 bg-green-800 rounded-full absolute top-12 right-32"></div>
        </div>
        
        {/* Character */}
        {renderCharacter()}
        
        {/* Obstacles */}
        {obstacles.map(obstacle => renderObstacle(obstacle))}
        
        {/* Particles */}
        {renderParticles()}
        
        {/* Health display */}
        <div className="absolute top-2 left-2 flex space-x-1 bg-black bg-opacity-30 rounded-lg p-1">
          {renderHealth()}
        </div>
        
        {/* Score display */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-30 rounded-lg p-1 flex items-center">
          <Trophy className="mr-1 h-4 w-4 text-yellow-400" />
          <span className="font-bold">{score}</span>
        </div>
        
        {/* High score display */}
        {highScore > 0 && (
          <div className="absolute top-10 right-2 bg-black bg-opacity-30 rounded-lg p-1 flex items-center">
            <Star className="mr-1 h-4 w-4 text-yellow-400" />
            <span className="text-xs">{highScore}</span>
          </div>
        )}
        
        {/* Pause button */}
        {gameStarted && !gameOver && (
          <button 
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center"
            onClick={togglePause}
          >
            {isPaused ? (
              <div className="w-0 h-0 border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-8 border-r-white ml-1"></div>
            ) : (
              <div className="flex">
                <div className="w-2 h-6 bg-white rounded-sm mr-1"></div>
                <div className="w-2 h-6 bg-white rounded-sm"></div>
              </div>
            )}
          </button>
        )}
        
        {/* Start screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Vượt Chướng Ngại Vật</h2>
            <button 
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
              onClick={startGame}
            >
              Bắt Đầu
            </button>
          </div>
        )}
        
        {/* Game over screen */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
            <div className="flex items-center mb-4">
              <Trophy className="mr-2 text-yellow-400" />
              <p className="text-xl">Điểm số: <span className="font-bold">{score}</span></p>
            </div>
            {score >= highScore && score > 0 && (
              <div className="mb-4 py-1 px-3 bg-yellow-500 bg-opacity-30 rounded-full flex items-center">
                <Star className="mr-1 text-yellow-400" />
                <span className="text-yellow-300">Kỷ lục mới!</span>
              </div>
            )}
            <button 
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
              onClick={startGame}
            >
              Chơi Lại
            </button>
          </div>
        )}
        
        {/* Pause screen */}
        {isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4">Tạm Dừng</h2>
            <button 
              className="px-6 py-2 rounded-lg bg-blue-500 font-bold transform transition hover:scale-105"
              onClick={togglePause}
            >
              Tiếp Tục
            </button>
          </div>
        )}
        
        {/* Collision flash effect */}
        {showFlash && (
          <div className="absolute inset-0 bg-red-500 opacity-30 z-50"></div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center max-w-md px-4 bg-gray-800 bg-opacity-50 rounded-lg py-2">
        <p className="mb-2">Chạm vào màn hình để nhảy qua chướng ngại vật.</p>
        <p>Mất 1 máu khi chạm vào chướng ngại vật. Game kết thúc khi hết máu.</p>
      </div>
    </div>
  );
}
