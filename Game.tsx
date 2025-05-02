import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Star } from 'lucide-react'; // Removed Activity and Heart icons

export default function ObstacleRunnerGame() {
  // Game states
  const [gameStarted, setGameStarted] = useState(false); // Tracks if the game has started
  const [gameOver, setGameOver] = useState(false); // Tracks if the game is over
  const [score, setScore] = useState(0); // Player's score
  const MAX_HEALTH = 3000; // Define max health
  const [health, setHealth] = useState(MAX_HEALTH); // Player's health, initialized to max
  const [jumping, setJumping] = useState(false); // Tracks if the character is jumping
  const [characterPos, setCharacterPos] = useState(0); // Vertical position of the character (0 is on the ground)
  const [obstacles, setObstacles] = useState([]); // Array of active obstacles
  const [isRunning, setIsRunning] = useState(false); // Tracks if the character is running animation
  const [runFrame, setRunFrame] = useState(0); // Current frame for run animation
  const [particles, setParticles] = useState([]); // Array of active particles (dust)
  const [clouds, setClouds] = useState([]); // Array of active clouds
  const [isPaused, setIsPaused] = useState(false); // Tracks if the game is paused
  const [highScore, setHighScore] = useState(0); // Stores the high score
  const [showHealthDamageEffect, setShowHealthDamageEffect] = useState(false); // State to trigger health bar damage effect
  const [showCharacterDamageEffect, setShowCharacterDamageEffect] = useState(false); // State to trigger character damage effect

  // Define the new ground level percentage
  const GROUND_LEVEL_PERCENT = 35; // Increased from 25%

  // Refs for timers to manage intervals and timeouts
  const gameRef = useRef(null); // Ref for the main game container div
  const obstacleTimerRef = useRef(null); // Timer for scheduling new obstacles
  const scoreTimerRef = useRef(null); // Timer for incrementing score
  const runAnimationRef = useRef(null); // Timer for character run animation
  const particleTimerRef = useRef(null); // Timer for generating particles
  // cloudTimerRef is removed, no need to clear it here

  // Character animation frames (simple representation of leg movement)
  const runFrames = [0, 1, 2, 1]; // Different leg positions for animation

  // Obstacle types with properties (Removed 'bird' type)
  const obstacleTypes = [
    { type: 'rock', height: 10, width: 10, color: 'from-gray-700 to-gray-500' },
    { type: 'cactus', height: 16, width: 8, color: 'from-green-800 to-green-600' },
  ];

  // Function to start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHealth(MAX_HEALTH); // Start with max health
    setCharacterPos(0); // Character starts on the ground (relative to ground level)
    setObstacles([]);
    setParticles([]);
    setIsRunning(true);
    setIsPaused(false);
    setShowHealthDamageEffect(false); // Reset health damage effect state
    setShowCharacterDamageEffect(false); // Reset character damage effect state

    // Generate initial obstacles to populate the screen at the start
    const initialObstacles = [];
    // First obstacle placed a bit further to give the player time to react
    initialObstacles.push({
      id: Date.now(), // Unique ID for React key
      position: 120, // Position off-screen to the right
      // Ensure we only pick from the remaining obstacle types
      ...obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
    });

    // Add a few more obstacles with increasing distance
    for (let i = 1; i < 5; i++) {
      initialObstacles.push({
        id: Date.now() + i,
        position: 150 + (i * 50),
        // Ensure we only pick from the remaining obstacle types
        ...obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      });
    }

    setObstacles(initialObstacles);

    // Generate initial clouds (a fixed, small number)
    generateInitialClouds(5); // Generate 5 clouds initially

    // Start the character run animation
    startRunAnimation();

    // Generate dust particles periodically
    particleTimerRef.current = setInterval(generateParticles, 300);

    // Score incrementer with increasing difficulty over time
    scoreTimerRef.current = setInterval(() => {
      if (!isPaused) { // Only increment score if not paused
        setScore(prevScore => {
          // Higher score increment as game progresses (score increases)
          const increment = Math.floor(prevScore / 1000) + 1;
          return prevScore + increment;
        });
      }
    }, 100); // Increment score every 100ms

    // Schedule the first obstacle after the initial ones
    scheduleNextObstacle();
  };

  // Effect to handle game over state when health reaches zero
  useEffect(() => {
    if (health <= 0 && gameStarted) { // Game over when health is 0 or less
      setGameOver(true);
      setIsRunning(false);
      // Clear all active timers
      clearInterval(scoreTimerRef.current);
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      // cloudTimerRef.current is removed, no need to clear it here

      // Update high score if the current score is higher
      if (score > highScore) {
        setHighScore(score);
      }
    }
  }, [health, gameStarted, score, highScore]); // Dependencies for this effect

  // Generate initial cloud elements (called only once at game start)
  const generateInitialClouds = (count) => {
    const newClouds = [];
    for (let i = 0; i < count; i++) {
      newClouds.push({
        id: Date.now() + i, // Unique ID
        x: Math.random() * 120 + 100, // Start off-screen to the right
        y: Math.random() * 40 + 10, // Vertical position
        size: Math.random() * 20 + 30, // Size of the cloud
        speed: Math.random() * 0.2 + 0.1 // Speed of the cloud
      });
    }
    setClouds(newClouds);
  };


  // Generate dust particles for visual effect
  const generateParticles = () => {
    if (!gameStarted || gameOver || isPaused) return; // Only generate if game is active and not paused

    const newParticles = [];
    for (let i = 0; i < 2; i++) { // Generate 2 particles at a time
      newParticles.push({
        id: Date.now() + i, // Unique ID
        x: 10 + Math.random() * 5, // Starting X position (near character)
        y: 0, // Starting Y position (relative to ground level)
        size: Math.random() * 4 + 2, // Size of the particle
        xVelocity: -Math.random() * 1 - 0.5, // Horizontal velocity (moving left)
        yVelocity: Math.random() * 2 - 1, // Vertical velocity (random up/down)
        opacity: 1, // Initial opacity
        color: Math.random() > 0.5 ? 'bg-yellow-600' : 'bg-yellow-700' // Random color
      });
    }
    // Add new particles to the existing array
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Start the character run animation loop
  const startRunAnimation = () => {
    if (runAnimationRef.current) clearInterval(runAnimationRef.current); // Clear any existing animation timer

    runAnimationRef.current = setInterval(() => {
      if (!isPaused) { // Only update animation frame if not paused
        setRunFrame(prev => (prev + 1) % runFrames.length); // Cycle through run frames
      }
    }, 150); // Update frame every 150ms
  };

  // Schedule the next obstacle to appear
  const scheduleNextObstacle = () => {
    if (gameOver) return; // Don't schedule if game is over

    // Random time delay before the next obstacle appears (between 5 and 20 seconds)
    const randomTime = Math.floor(Math.random() * 15000) + 5000;
    obstacleTimerRef.current = setTimeout(() => {
      if (!isPaused) { // Only generate obstacles if not paused
        // Create a group of 1 to 3 obstacles
        const obstacleCount = Math.floor(Math.random() * 3) + 1;
        const newObstacles = [];

        for (let i = 0; i < obstacleCount; i++) {
          // Ensure we only pick from the remaining obstacle types
          const randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          // Add spacing between grouped obstacles
          const spacing = i * (Math.random() * 10 + 10);

          newObstacles.push({
            id: Date.now() + i, // Unique ID
            position: 100 + spacing, // Position off-screen to the right with spacing
            ...randomObstacle // Include obstacle properties
          });
        }

        // Add new obstacles to the existing array
        setObstacles(prev => [...prev, ...newObstacles]);
      }
      scheduleNextObstacle(); // Schedule the next obstacle recursively
    }, randomTime);
  };

  // Handle character jump action
  const jump = () => {
    // Check if not already jumping, game is started, not over, and not paused
    if (!jumping && !gameOver && gameStarted && !isPaused) {
      setJumping(true); // Set jumping state to true
      setCharacterPos(80); // Move character up (jump height relative to ground)
      // Schedule landing after a delay
      setTimeout(() => {
        if (gameStarted && !gameOver) { // Ensure game is still active
          setCharacterPos(0); // Move character back to ground
          // Schedule setting jumping state to false after a short delay
          setTimeout(() => {
            setJumping(false);
          }, 100);
        }
      }, 600); // Jump duration
    }
  };

  // Handle tap/click on the game area to start or jump
  const handleTap = () => {
    if (!gameStarted) {
      startGame(); // Start the game if not started
    } else if (!gameOver && !isPaused) {
      jump(); // Jump if game is active and not paused
    } else if (gameOver) {
      startGame(); // Restart the game if game is over
    }
  };

  // Toggle pause state
  const togglePause = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to the game area tap handler
    setIsPaused(prev => !prev); // Toggle the pause state
  };

  // Trigger health bar damage effect (still useful visual cue)
  const triggerHealthDamageEffect = () => {
      setShowHealthDamageEffect(true);
      setTimeout(() => {
          setShowHealthDamageEffect(false);
      }, 300); // Effect duration
  };

  // Trigger character damage effect (new effect)
  const triggerCharacterDamageEffect = () => {
      setShowCharacterDamageEffect(true);
      setTimeout(() => {
          setShowCharacterDamageEffect(false);
      }, 500); // Effect duration (slightly longer for visibility)
  };


  // Move obstacles, clouds, particles and detect collisions
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return; // Only run if game is active and not paused

    // Game speed increases with score
    const baseSpeed = 2;
    const speedMultiplier = 1 + Math.min(score / 1000, 1); // Speed increases up to 2x based on score

    const moveInterval = setInterval(() => {
      // Move obstacles and handle endless loop effect
      setObstacles(prevObstacles => {
        return prevObstacles
          .map(obstacle => {
            // Calculate speed based on obstacle type (birds are slightly faster) and game speed multiplier
            // Speed is now consistent for all ground obstacles
            const speed = 2 * speedMultiplier;
            let newPosition = obstacle.position - speed; // Move obstacle left

            // Create infinite loop effect by resetting obstacles that move off-screen
            if (newPosition < -20) {
              // 70% chance to reuse the obstacle and loop it back
              if (Math.random() < 0.7) {
                // Ensure we only pick from the remaining obstacle types
                const randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                const randomOffset = Math.floor(Math.random() * 20); // Add random offset to position

                return {
                  ...obstacle, // Keep existing properties
                  ...randomObstacle, // Override with new random properties (type, color, height, width)
                  id: Date.now(), // Assign a new ID to ensure React re-renders
                  position: 120 + randomOffset // Place it off-screen to the right with random offset
                };
              } else {
                // If not reusing, let it move off-screen to be filtered out
                return { ...obstacle, position: newPosition };
              }
            }

            return { ...obstacle, position: newPosition }; // Return updated obstacle position
          })
          .filter(obstacle => {
            // Collision detection logic
            let collisionDetected = false;
            const characterWidth = 12;
            const characterHeight = 16;
            const characterX = 10; // Character's fixed X position
            const characterY = characterPos; // Character's current Y position (relative to ground)

            const obstacleX = obstacle.position; // Obstacle's current X position
            // ObstacleY is always 0 for ground obstacles (relative to ground)
            const obstacleY = 0;
            const obstacleWidth = obstacle.width; // Obstacle's width
            const obstacleHeight = obstacle.height; // Obstacle's height

            // Check for collision using bounding boxes
            if (
              characterX < obstacleX + obstacleWidth &&
              characterX + characterWidth > obstacleX &&
              characterY < obstacleY + obstacleHeight &&
              characterY + obstacleHeight > obstacleY
            ) {
              collisionDetected = true;
              // Decrease health by 1 point on collision
              setHealth(prev => Math.max(0, prev - 1)); // Decrease health by 1, ensuring it doesn't go below 0
              triggerHealthDamageEffect(); // Trigger health bar damage effect
              triggerCharacterDamageEffect(); // Trigger the new character damage effect
            }

            // Keep obstacles that haven't collided and are still visible or will loop back
            return !collisionDetected && obstacle.position > -20; // Filter out collided or far off-screen obstacles
          });
      });

      // Move clouds and handle infinite loop effect
      setClouds(prevClouds => {
        return prevClouds
          .map(cloud => {
            const newX = cloud.x - cloud.speed; // Move cloud left

            // Loop clouds back to the right side when they go off-screen
            if (newX < -50) {
              return {
                ...cloud,
                id: Date.now() + Math.random(), // New ID
                x: 120 + Math.random() * 30, // New position off-screen to the right
                y: Math.random() * 40 + 10, // New random height
                size: Math.random() * 20 + 30, // New random size
                speed: Math.random() * 0.2 + 0.1 // New random speed
              };
            }

            return { ...cloud, x: newX }; // Return updated cloud position
          });
          // No filtering needed for clouds, they are recycled
      });

      // Update particles (move and fade)
      setParticles(prevParticles =>
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.xVelocity, // Move particle horizontally
            y: particle.y + particle.yVelocity, // Move particle vertically
            opacity: particle.opacity - 0.03, // Decrease opacity (fade out)
            size: particle.size - 0.1 // Decrease size (shrink)
          }))
          .filter(particle => particle.opacity > 0 && particle.size > 0) // Remove particles that have faded or shrunk completely
      );

    }, 30); // Interval for movement updates (30ms for smoother animation)

    // Cleanup function to clear the interval when the effect dependencies change or component unmounts
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver, jumping, characterPos, isPaused, score, obstacleTypes]); // Dependencies for this effect

  // Effect to clean up all timers when the component unmounts
  useEffect(() => {
    return () => {
      clearInterval(scoreTimerRef.current);
      clearTimeout(obstacleTimerRef.current);
      clearInterval(runAnimationRef.current);
      clearInterval(particleTimerRef.current);
      // cloudTimerRef.current is removed
    };
  }, []); // Empty dependency array means this effect runs only on mount and unmount

  // Render the character with animation and damage effect
  const renderCharacter = () => {
    const legPos = jumping ? 1 : runFrames[runFrame]; // Determine leg position based on jumping state and run frame

    return (
      <div
        className="absolute w-12 h-16 transition-all duration-300 ease-out" // Base styles and transition
        style={{
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${characterPos}px)`, // Vertical position using characterPos state relative to new ground
          left: '10%', // Fixed horizontal position
          transition: jumping ? 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'bottom 0.3s cubic-bezier(0.33, 1, 0.68, 1)' // Different transition for jumping
        }}
      >
        {/* Character Body */}
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
            bottom: '-10px', // Position below the character
            left: '1px',
            transform: `scale(${1 - characterPos/100})`, // Scale shadow based on jump height
            opacity: 1 - characterPos/100 // Fade shadow based on jump height
          }}
        ></div>

        {/* Damage Effect on Character */}
        {showCharacterDamageEffect && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-red-500 font-bold text-xl opacity-0 animate-fadeOutUp">
                -1
            </div>
        )}
      </div>
    );
  };

  // Render obstacles based on their type
  const renderObstacle = (obstacle) => {
    let obstacleEl; // Element to render for the obstacle

    switch(obstacle.type) {
      case 'rock':
        obstacleEl = (
          <div className={`w-10 h-10 bg-gradient-to-br ${obstacle.color} rounded-lg`}>
            {/* Rock details */}
            <div className="w-3 h-2 bg-gray-600 rounded-full absolute top-2 left-1"></div>
            <div className="w-2 h-1 bg-gray-600 rounded-full absolute top-5 right-2"></div>
          </div>
        );
        break;
      case 'cactus':
        obstacleEl = (
          <div className="relative">
            {/* Cactus main body */}
            <div className={`w-8 h-16 bg-gradient-to-b ${obstacle.color} rounded-lg`}></div>
            {/* Cactus arms */}
            <div className={`w-4 h-6 bg-gradient-to-b ${obstacle.color} rounded-lg absolute -left-3 top-3 transform -rotate-45`}></div>
            <div className={`w-4 h-6 bg-gradient-to-b ${obstacle.color} rounded-lg absolute -right-3 top-5 transform rotate-45`}></div>
          </div>
        );
        break;
      default:
        // Default rendering if obstacle type is unknown
        obstacleEl = (
          <div className={`w-6 h-10 bg-gradient-to-b ${obstacle.color} rounded`}></div>
        );
    }

    return (
      <div
        key={obstacle.id} // Unique key for React list rendering
        className="absolute"
        style={{
          // ObstacleY is always relative to the new ground level
          bottom: `${GROUND_LEVEL_PERCENT}%`,
          left: `${obstacle.position}%` // Horizontal position
        }}
      >
        {obstacleEl} {/* Render the specific obstacle element */}
      </div>
    );
  };

  // Render clouds
  const renderClouds = () => {
    return clouds.map(cloud => (
      <div
        key={cloud.id} // Unique key
        className="absolute bg-white rounded-full opacity-60" // Base cloud styles
        style={{
          width: `${cloud.size}px`, // Size based on cloud state
          height: `${cloud.size * 0.6}px`, // Aspect ratio
          top: `${cloud.y}%`, // Vertical position (relative to top of game container)
          left: `${cloud.x}%` // Horizontal position
        }}
      >
        {/* Additional cloud shapes for variation */}
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
        key={particle.id} // Unique key
        className={`absolute rounded-full ${particle.color}`} // Base styles and color
        style={{
          width: `${particle.size}px`, // Size based on particle state
          height: `${particle.size}px`,
          bottom: `calc(${GROUND_LEVEL_PERCENT}% + ${particle.y}px)`, // Vertical position relative to new ground
          left: `calc(10% + ${particle.x}px)`, // Horizontal position relative to character
          opacity: particle.opacity // Opacity for fading effect
        }}
      ></div>
    ));
  };

  // Calculate health bar width percentage
  const healthBarWidth = (health / MAX_HEALTH) * 100;

  return (
    // Main container for the entire game, now taking full screen
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden">
      {/* Add Tailwind CSS animation for fadeOutUp */}
      <style>{`
        @keyframes fadeOutUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -20px); /* Move up slightly */
          }
        }
        .animate-fadeOutUp {
          animation: fadeOutUp 0.5s ease-out forwards; /* Animation duration and easing */
        }
      `}</style>

      {/* Main Game Container, now full screen */}
      <div
        ref={gameRef} // Assign ref
        className="relative w-full h-screen border-2 border-indigo-700 rounded-lg overflow-hidden shadow-2xl cursor-pointer" // Adjusted width and height
        onClick={handleTap} // Handle taps/clicks
      >
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600"></div>

        {/* Sun */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-500 -top-4 right-10"></div>

        {/* Clouds */}
        {renderClouds()}

        {/* Ground */}
        {/* Positioned relative to the new GROUND_LEVEL_PERCENT */}
        <div className="absolute bottom-0 w-full" style={{ height: `${GROUND_LEVEL_PERCENT}%` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-green-700">
                {/* Ground details (small elements on the ground) */}
                <div className="w-full h-1 bg-green-800 absolute top-0"></div>
                <div className="w-3 h-3 bg-green-800 rounded-full absolute top-6 left-20"></div>
                <div className="w-4 h-2 bg-green-800 rounded-full absolute top-10 left-40"></div>
                <div className="w-6 h-3 bg-green-800 rounded-full absolute top-8 right-10"></div>
                <div className="w-3 h-1 bg-green-800 rounded-full absolute top-12 right-32"></div>
            </div>
        </div>


        {/* Character */}
        {renderCharacter()}

        {/* Obstacles */}
        {obstacles.map(obstacle => renderObstacle(obstacle))}

        {/* Particles */}
        {renderParticles()}

        {/* Health Bar Display */}
        <div className="absolute top-2 left-2 w-32 h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-300 ease-linear ${showHealthDamageEffect ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-green-600'}`} // Change color on damage effect
            style={{ width: `${healthBarWidth}%` }} // Dynamic width based on health percentage
          ></div>
          {/* Optional: Health text inside the bar */}
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow-sm">
             {health} / {MAX_HEALTH}
          </span>
        </div>


        {/* Score display */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-30 rounded-lg p-1 flex items-center">
          <Trophy className="mr-1 h-4 w-4 text-yellow-400" />
          <span className="font-bold">{score}</span>
        </div>

        {/* High score display (only shown if high score is greater than 0) */}
        {highScore > 0 && (
          <div className="absolute top-10 right-2 bg-black bg-opacity-30 rounded-lg p-1 flex items-center">
            <Star className="mr-1 h-4 w-4 text-yellow-400" />
            <span className="text-xs">{highScore}</span>
          </div>
        )}

        {/* Pause button (only shown when game is started and not over) */}
        {gameStarted && !gameOver && (
          <button
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center z-10" // Added z-10 to ensure button is clickable
            onClick={togglePause} // Handle pause toggle
          >
            {isPaused ? (
              // Play icon when paused
              <div className="w-0 h-0 border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-8 border-r-white ml-1"></div>
            ) : (
              // Pause icon when not paused
              <div className="flex">
                <div className="w-2 h-6 bg-white rounded-sm mr-1"></div>
                <div className="w-2 h-6 bg-white rounded-sm"></div>
              </div>
            )}
          </button>
        )}

        {/* Start screen (shown when game is not started and not over) */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Vượt Chướng Ngại Vật</h2>
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
              onClick={startGame} // Start game on click
            >
              Bắt Đầu
            </button>
          </div>
        )}

        {/* Game over screen (shown when game is over) */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
            <div className="flex items-center mb-4">
              <Trophy className="mr-2 text-yellow-400" />
              <p className="text-xl">Điểm số: <span className="font-bold">{score}</span></p>
            </div>
            {/* Display new high score message if applicable */}
            {score >= highScore && score > 0 && (
              <div className="mb-4 py-1 px-3 bg-yellow-500 bg-opacity-30 rounded-full flex items-center">
                <Star className="mr-1 text-yellow-400" />
                <span className="text-yellow-300">Kỷ lục mới!</span>
              </div>
            )}
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-bold transform transition hover:scale-105 shadow-lg"
              onClick={startGame} // Restart game on click
            >
              Chơi Lại
            </button>
          </div>
        )}

        {/* Pause screen (shown when game is paused) */}
        {isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4">Tạm Dừng</h2>
            <button
              className="px-6 py-2 rounded-lg bg-blue-500 font-bold transform transition hover:scale-105"
              onClick={togglePause} // Resume game on click
            >
              Tiếp Tục
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
