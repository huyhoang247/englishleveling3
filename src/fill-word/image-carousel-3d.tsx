// --- START OF FILE image-carousel-3d.tsx (OPTIMIZED & FULL CODE) ---

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarousel3DProps {
  imageUrls: string[];
  onImageClick: () => void;
  word: string;
}

// TỐI ƯU HÓA 1: Virtualization (Ảo hóa)
// Chỉ render 2 ảnh ở mỗi bên của ảnh trung tâm.
// Tổng cộng sẽ có tối đa 5 ảnh được render tại một thời điểm (2 trái + 1 giữa + 2 phải).
const RENDER_WINDOW = 2;

const ImageCarousel3D: React.FC<ImageCarousel3DProps> = ({ imageUrls, onImageClick, word }) => {
  const [index, setIndex] = useState(0);
  // Đảm bảo carousel hoạt động ngay cả khi chỉ có 1 hoặc 2 ảnh
  const displayImages = imageUrls.length < 3 ? [imageUrls[0], imageUrls[0], imageUrls[0]] : imageUrls;
  const numImages = displayImages.length;

  const handleNext = () => setIndex((prevIndex) => (prevIndex + 1) % numImages);
  const handlePrev = () => setIndex((prevIndex) => (prevIndex - 1 + numImages) % numImages);

  const getStyle = (imageIndex: number) => {
    const offset = (imageIndex - index + numImages) % numImages;
    // TỐI ƯU HÓA 2: Đã loại bỏ `filter: blur()` để giảm tải cho GPU.
    // Hiệu ứng chiều sâu giờ chỉ dựa vào `transform`, `opacity` và `brightness`.
    if (offset === 0) return { transform: 'translateX(0) translateZ(0) scale(1)', opacity: 1, zIndex: 3, filter: 'brightness(1)' };
    if (offset === 1) return { transform: 'translateX(50%) translateZ(-120px) scale(0.75)', opacity: 0.4, zIndex: 2, filter: 'brightness(0.7)' };
    // Mặc định cho các ảnh bên trái
    return { transform: 'translateX(-50%) translateZ(-120px) scale(0.75)', opacity: 0.4, zIndex: 1, filter: 'brightness(0.7)' };
  };
  
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) handleNext();
    else if (info.offset.x > swipeThreshold) handlePrev();
  };

  return (
    <div className="relative w-full h-52 mt-6 flex items-center justify-center" style={{ perspective: '1000px' }}>
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-d' }}>
        {/* AnimatePresence giờ đây rất hữu ích để xử lý animation khi các ảnh bị ẩn/hiện do virtualization */}
        <AnimatePresence initial={false}>
          {displayImages.map((url, i) => {
            // TỐI ƯU HÓA 1: Logic của Virtualization
            // Tính khoảng cách vòng tròn từ ảnh hiện tại đến ảnh trung tâm (index)
            const distance = Math.abs(index - i);
            const circularDistance = Math.min(distance, numImages - distance);
            
            // Nếu ảnh nằm ngoài "cửa sổ render", không render nó
            if (circularDistance > RENDER_WINDOW) {
              return null;
            }

            return (
              <motion.div
                // Sử dụng key ổn định hơn, phòng trường hợp url bị trùng lặp
                key={url + i}
                className="absolute w-full h-full cursor-grab active:cursor-grabbing"
                style={{ top: 0, left: 0, width: '60%', height: '100%', margin: '0 auto', right: 0 }}
                initial={getStyle(i)}
                animate={getStyle(i)}
                // exit prop được AnimatePresence sử dụng khi component bị loại bỏ khỏi DOM
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                onClick={() => { if (((i - index + numImages) % numImages) === 0) onImageClick(); }}
              >
                <img 
                  src={url} 
                  alt={`${word} - view ${i + 1}`} 
                  className="w-full h-full object-contain rounded-2xl shadow-lg" 
                  style={{ pointerEvents: 'none' }} 
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Nút Previous */}
      <button 
        onClick={handlePrev} 
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/50 p-1.5 rounded-full hover:bg-white/80 transition-all focus:outline-none"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      {/* Nút Next */}
      <button 
        onClick={handleNext} 
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/50 p-1.5 rounded-full hover:bg-white/80 transition-all focus:outline-none"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

export default memo(ImageCarousel3D);
