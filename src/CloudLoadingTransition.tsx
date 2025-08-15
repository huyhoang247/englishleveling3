import { useState, useEffect } from 'react';

interface CloudLoadingTransitionProps {
  isLoading: boolean;
}

const CloudLoadingTransition = ({ isLoading }: CloudLoadingTransitionProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      setIsExiting(false);
    } else {
      // Khi loading xong, kích hoạt animation thoát
      setIsExiting(true);
    }
  }, [isLoading]);

  const handleAnimationEnd = () => {
    // Sau khi animation thoát kết thúc, gỡ component khỏi DOM
    if (isExiting) {
      setShouldRender(false);
    }
  };

  // Chỉ render component khi cần thiết
  if (!shouldRender) {
    return null;
  }

  // Cloud SVG - bạn có thể tùy chỉnh hoặc thêm nhiều hình dạng khác
  const Cloud = ({ className }: { className?: string }) => (
    <svg 
      className={`absolute text-white ${className}`} 
      viewBox="0 0 100 60" 
      fill="currentColor"
    >
      <path d="M82.5,25.8C80.6,16.2,71.8,9,61.3,9c-6.8,0-12.8,3.5-16.3,8.8c-2.3-2.1-5.4-3.4-8.8-3.4C29.4,14.4,24,19.8,24,26.6 c0,0.8,0.1,1.6,0.2,2.4C16.8,30.7,11,38,11,46.9c0,9.7,7.9,17.5,17.5,17.5h52.8c8.9,0,16.2-7.2,16.2-16.2 C97.5,38.8,91.1,31.4,82.5,25.8z"/>
    </svg>
  );

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gray-800/80 backdrop-blur-sm transition-opacity duration-700 ease-in-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      onTransitionEnd={handleAnimationEnd}
    >
      <style>{`
        @keyframes slide {
          0% { transform: translateX(120vw); }
          100% { transform: translateX(-120vw); }
        }
        @keyframes slide-slow {
          0% { transform: translateX(110vw); }
          100% { transform: translateX(-150vw); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        .animate-slide { animation: slide linear infinite; }
        .animate-slide-slow { animation: slide-slow linear infinite; }
      `}</style>

      {/* Các đám mây với tốc độ và vị trí khác nhau để tạo hiệu ứng chiều sâu (parallax) */}
      <Cloud className="w-64 opacity-20 -bottom-10 animate-slide-slow" style={{ animationDuration: '45s' }} />
      <Cloud className="w-80 opacity-40 bottom-[10%] animate-slide" style={{ animationDuration: '30s', animationDelay: '-5s' }} />
      <Cloud className="w-56 opacity-30 top-[15%] animate-slide-slow" style={{ animationDuration: '50s', animationDelay: '-10s' }} />
      <Cloud className="w-96 opacity-50 bottom-[25%] animate-slide" style={{ animationDuration: '25s', animationDelay: '-15s' }} />
      <Cloud className="w-72 opacity-25 top-[5%] animate-slide-slow" style={{ animationDuration: '55s', animationDelay: '-20s' }} />

      <div className="z-10 text-center text-white" style={{ animation: 'pulse-text 2.5s infinite ease-in-out' }}>
        <h2 className="text-2xl font-bold tracking-wider">Đang tải bộ sưu tập...</h2>
        <p className="text-sm opacity-80 mt-1">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export default CloudLoadingTransition;
