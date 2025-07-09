// --- START OF FILE image-carousel.tsx ---

import { useMemo, useCallback } from 'react';
import { defaultImageUrls } from '../image-url.ts'; // Giả sử bạn có file này

// Định nghĩa kiểu dữ liệu để đảm bảo tính nhất quán
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
}

// Hàm trợ giúp để tạo URL ảnh (sao chép từ component cha)
const generateImageUrl = (imageIndex?: number) => {
  if (imageIndex !== undefined && typeof imageIndex === 'number') {
    const adjustedIndex = imageIndex - 1;
    if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) {
      return defaultImageUrls[adjustedIndex];
    }
  }
  return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`;
};

interface ImageCarouselProps {
  words: VocabularyItem[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  onCenterImageClick: () => void; // Hàm để mở popup
  isAnswered: boolean; // Prop mới để vô hiệu hóa điều hướng
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ words, currentIndex, onIndexChange, onCenterImageClick, isAnswered }) => {
  // Sử dụng useMemo để tính toán danh sách hiển thị chỉ khi danh sách từ thay đổi
  const displayItems = useMemo(() => {
    if (!words || words.length === 0) {
      return [];
    }
    if (words.length === 1) {
      // Clone ảnh duy nhất thành 3 để tạo hiệu ứng vòng lặp
      return [words[0], words[0], words[0]];
    }
    if (words.length === 2) {
      // Tạo một mảng 3 phần tử để hiệu ứng mượt mà
      if (currentIndex === 0) return [words[1], words[0], words[1]];
      return [words[0], words[1], words[0]];
    }
    // Trường hợp có 3 ảnh trở lên
    const n = words.length;
    const prevIndex = (currentIndex - 1 + n) % n;
    const nextIndex = (currentIndex + 1) % n;
    return [words[prevIndex], words[currentIndex], words[nextIndex]];
  }, [words, currentIndex]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isAnswered || words.length <= 1) return; // Không điều hướng nếu đã trả lời đúng hoặc chỉ có 1 từ
    const n = words.length;
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + n) % n
      : (currentIndex + 1) % n;
    onIndexChange(newIndex);
  }, [currentIndex, words.length, onIndexChange, isAnswered]);

  if (displayItems.length === 0) {
    return (
      <div className="relative w-full h-64 flex items-center justify-center bg-gray-200 rounded-2xl mt-6">
        <p className="text-gray-500">Không có ảnh để hiển thị</p>
      </div>
    );
  }

  const [leftItem, centerItem, rightItem] = displayItems;
  const sideImageClasses = `absolute w-2/3 h-full transition-all duration-500 ease-in-out ${isAnswered ? '' : 'cursor-pointer'}`;
  const centerImageClasses = `absolute w-full h-full transition-all duration-500 ease-in-out cursor-pointer group`;

  return (
    <div 
      className="relative w-full h-64 mt-6 flex items-center justify-center"
      style={{ perspective: '1000px' }}
    >
      {/* Ảnh bên trái */}
      <div
        className={sideImageClasses}
        style={{
          transform: 'translateX(-55%) scale(0.7) rotateY(35deg)',
          filter: 'brightness(0.5) blur(4px)',
          zIndex: 10,
          opacity: isAnswered ? 0.3 : 0.8,
        }}
        onClick={() => navigate('prev')}
      >
        <img
          src={generateImageUrl(leftItem.imageIndex)}
          alt={leftItem.word}
          className="w-full h-full object-contain rounded-2xl shadow-lg"
        />
      </div>

      {/* Ảnh ở giữa (chính) */}
      <div
        className={centerImageClasses}
        style={{
          transform: 'translateX(0) scale(1) rotateY(0)',
          filter: 'brightness(1) blur(0)',
          zIndex: 20,
        }}
        onClick={onCenterImageClick}
      >
        <img
          src={generateImageUrl(centerItem.imageIndex)}
          alt={centerItem.word}
          className="w-full h-full object-contain rounded-2xl shadow-2xl"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-2xl flex items-center justify-center">
            <p className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">Chạm để xem chi tiết</p>
        </div>
      </div>

      {/* Ảnh bên phải */}
      <div
        className={sideImageClasses}
        style={{
          transform: 'translateX(55%) scale(0.7) rotateY(-35deg)',
          filter: 'brightness(0.5) blur(4px)',
          zIndex: 10,
          opacity: isAnswered ? 0.3 : 0.8,
        }}
        onClick={() => navigate('next')}
      >
        <img
          src={generateImageUrl(rightItem.imageIndex)}
          alt={rightItem.word}
          className="w-full h-full object-contain rounded-2xl shadow-lg"
        />
      </div>
    </div>
  );
};

export default ImageCarousel;
// --- END OF FILE image-carousel.tsx ---
