// src/components/VirtualizedFlashcardGrid.tsx (File mới)

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FlashcardItem } from './FlashcardItem.tsx'; // Import component thẻ

// --- Lấy các Interface cần thiết ---
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
}
interface VocabularyData { /* ... */ }
interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  vocabulary: VocabularyData;
}
interface DisplayCard {
    card: Flashcard;
    isFavorite: boolean;
}

// --- Props cho component ảo hóa ---
interface VirtualizedFlashcardGridProps {
  items: DisplayCard[]; // Chỉ nhận mảng 50 thẻ của trang hiện tại
  layoutMode: 'single' | 'double';
  visualStyle: string;
  onImageClick: (card: Flashcard) => void;
  onFavoriteClick: (id: number) => void;
  getImageUrlForStyle: (card: Flashcard, style: string) => string;
}

export const VirtualizedFlashcardGrid = ({ items, layoutMode, ...itemProps }: VirtualizedFlashcardGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Tính toán số cột và số hàng
  const columnCount = layoutMode === 'double' ? 2 : 1;
  const rowCount = Math.ceil(items.length / columnCount);

  // Hook ảo hóa hoạt động trên các HÀNG
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    // ƯỚC TÍNH chiều cao của một hàng. Rất quan trọng!
    // Con số này không cần chính xác 100%, nhưng càng gần càng tốt.
    // Dựa trên tỉ lệ ảnh 1024x1536, chiều cao sẽ lớn hơn chiều rộng.
    estimateSize: () => (layoutMode === 'double' ? 750 : 1000), 
    overscan: 3, // Render thêm 3 hàng ngoài màn hình để cuộn mượt
  });

  return (
    // Container cha phải có chiều cao và overflow. Nó sẽ nhận từ parent component.
    <div ref={parentRef} className="w-full h-full overflow-y-auto scrollbar-hide">
      {/* Container có tổng chiều cao ảo để tạo thanh cuộn */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Chỉ render các HÀNG ảo trong viewport */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          // Lấy các thẻ thuộc về hàng này
          const startIndex = virtualRow.index * columnCount;
          const itemsInRow = items.slice(startIndex, startIndex + columnCount);

          return (
            // Dùng transform để đặt hàng vào đúng vị trí
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={`grid gap-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {itemsInRow.map(({ card, isFavorite }) => (
                <FlashcardItem
                  key={card.id}
                  card={card}
                  isFavorite={isFavorite}
                  {...itemProps} // Truyền tất cả props còn lại cho FlashcardItem
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
