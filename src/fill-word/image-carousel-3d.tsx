// --- START OF FILE image-carousel-3d.tsx ---

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarousel3DProps {
  imageUrls: string[];
  onImageClick: () => void;
  word: string; // Thêm prop word để dùng cho alt text
}

const ImageCarousel3D: React.FC<ImageCarousel3DProps> = ({ imageUrls, onImageClick, word }) => {
  const [index, setIndex] = useState(0);

  // Xử lý trường hợp chỉ có 1 ảnh duy nhất (clone nó ra) hoặc không có ảnh thật
  // Luôn đảm bảo có ít nhất 3 ảnh để carousel hoạt động đúng
  const displayImages = imageUrls.length < 3 ? [imageUrls[0], imageUrls[0], imageUrls[0]] : imageUrls;
  const numImages = displayImages.length;

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % numImages);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + numImages) % numImages);
  };

  const getStyle = (imageIndex: number) => {
    // Tính toán vị trí tương đối của ảnh so với ảnh ở giữa
    const offset = (imageIndex - index + numImages) % numImages;

    // Ảnh ở giữa (vị trí 0)
    if (offset === 0) {
      return {
        transform: 'translateX(0) translateZ(0) scale(1)',
        opacity: 1,
        zIndex: 3,
        filter: 'blur(0px) brightness(1)',
      };
    } 
    // Ảnh bên phải (vị trí 1)
    else if (offset === 1) { 
      return {
        transform: 'translateX(50%) translateZ(-150px) scale(0.75)',
        opacity: 0.4,
        zIndex: 2,
        filter: 'blur(4px) brightness(0.8)',
      };
    } 
    // Ảnh bên trái (vị trí cuối cùng trong vòng lặp)
    else { 
      return {
        transform: 'translateX(-50%) translateZ(-150px) scale(0.75)',
        opacity: 0.4,
        zIndex: 1,
        filter: 'blur(4px) brightness(0.8)',
      };
    }
  };
  
  // Xử lý cử chỉ vuốt
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50; // Khoảng cách vuốt tối thiểu để chuyển ảnh
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    // Container chính tạo ra không gian 3D
    <div className="relative w-full h-64 mt-6 flex items-center justify-center" style={{ perspective: '1000px' }}>
      {/* Container cho các ảnh, cho phép các phần tử con tồn tại trong không gian 3D */}
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        <AnimatePresence initial={false}>
          {displayImages.map((url, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-full cursor-grab active:cursor-grabbing"
              style={{
                top: 0,
                left: 0,
                width: '60%', // Giảm kích thước ảnh để 2 ảnh phụ có không gian
                height: '100%',
                margin: '0 auto',
                right: 0,
              }}
              initial={getStyle(i)}
              animate={getStyle(i)}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              onClick={() => {
                 // Chỉ cho phép click vào ảnh ở giữa để mở popup
                 const offset = (i - index + numImages) % numImages;
                 if (offset === 0) {
                    onImageClick();
                 }
              }}
            >
              <img
                src={url}
                alt={`${word} - view ${i + 1}`}
                className="w-full h-full object-contain rounded-2xl shadow-lg bg-white p-1"
                style={{
                  pointerEvents: 'none', // Ngăn ảnh bắt sự kiện drag riêng, để thẻ motion xử lý
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Nút điều hướng (tùy chọn) */}
      <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/50 p-2 rounded-full backdrop-blur-sm hover:bg-white/80 transition-all focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/50 p-2 rounded-full backdrop-blur-sm hover:bg-white/80 transition-all focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

export default ImageCarousel3D;

// --- END OF FILE image-carousel-3d.tsx ---
