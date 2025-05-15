import React, { useState, useEffect } from 'react';

const ImprovedConfetti = () => {
  const [isActive, setIsActive] = useState(true);
  const [pieces, setPieces] = useState([]);

  // Tạo confetti khi component mount
  useEffect(() => {
    // Tạo 100 mảnh confetti với thuộc tính ngẫu nhiên
    const generatePieces = () => {
      const newPieces = [];
      for (let i = 0; i < 100; i++) {
        newPieces.push({
          id: i,
          left: `${Math.random() * 100}%`,
          size: Math.random() * 10 + 5,
          duration: Math.random() * 4 + 3,
          shape: Math.random() > 0.5 ? 'circle' : 
                 Math.random() > 0.5 ? 'square' : 'triangle',
          delay: Math.random() * 3,
          rotationDirection: Math.random() > 0.5 ? 1 : -1,
          color: getRandomColor(),
          glow: Math.random() > 0.7,
          swayAmount: Math.random() * 40 + 20
        });
      }
      return newPieces;
    };

    // Khởi tạo confetti
    setPieces(generatePieces());

    // Tự động tạo confetti mới sau một khoảng thời gian
    const interval = setInterval(() => {
      if (isActive) {
        setPieces(generatePieces());
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Chọn màu ngẫu nhiên từ bảng màu sáng
  const getRandomColor = () => {
    const vibrantColors = [
      'bg-red-400', 'bg-pink-400', 'bg-rose-400', 
      'bg-purple-400', 'bg-violet-400', 'bg-indigo-400',
      'bg-blue-400', 'bg-cyan-400', 'bg-teal-400',
      'bg-green-400', 'bg-lime-400', 'bg-yellow-400',
      'bg-amber-400', 'bg-orange-400'
    ];
    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
  };

  // Tạo hình dạng cho confetti
  const renderShape = (shape, size, color, glow) => {
    const baseClasses = `${color} absolute w-full h-full`;
    
    const glowClass = glow ? 'filter blur-sm animate-pulse' : '';
    
    if (shape === 'circle') {
      return <div className={`${baseClasses} ${glowClass} rounded-full`} />;
    } else if (shape === 'square') {
      return <div className={`${baseClasses} ${glowClass} rounded-sm`} />;
    } else { // triangle
      return (
        <div className={`${baseClasses} ${glowClass}`} style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }} />
      );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.left,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
            animation: `
              fall-${piece.id} ${piece.duration}s ease-in forwards,
              sway-${piece.id} ${piece.duration * 0.8}s ease-in-out infinite alternate,
              rotate-${piece.id} ${piece.duration * 0.5}s linear infinite
            `
          }}
        >
          {renderShape(piece.shape, piece.size, piece.color, piece.glow)}
        </div>
      ))}

      <style jsx>{`
        ${pieces.map((piece) => `
          @keyframes fall-${piece.id} {
            0% { transform: translateY(-20px); opacity: 1; }
            80% { opacity: 0.8; }
            100% { transform: translateY(105vh); opacity: 0; }
          }
          
          @keyframes sway-${piece.id} {
            0% { transform: translateX(-${piece.swayAmount / 2}px); }
            100% { transform: translateX(${piece.swayAmount / 2}px); }
          }
          
          @keyframes rotate-${piece.id} {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(${360 * piece.rotationDirection}deg); }
          }
        `).join('\n')}
      `}</style>
      
      <div className="absolute bottom-8 right-8 bg-gray-800 bg-opacity-70 text-white px-4 py-2 rounded-full cursor-pointer z-50 pointer-events-auto" 
           onClick={() => setIsActive(!isActive)}>
        {isActive ? "Dừng hiệu ứng" : "Tiếp tục hiệu ứng"}
      </div>
    </div>
  );
};

export default ImprovedConfetti;
