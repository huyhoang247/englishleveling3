// src/components/VirtualizedFlashcardGrid.tsx (Đầy đủ)

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FlashcardItem } from './FlashcardItem.tsx';

// --- Interfaces ---
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
}
interface VocabularyData {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: string;
  synonyms: string[];
  antonyms: string[];
}
interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  vocabulary: VocabularyData;
}
interface DisplayCard {
    card: Flashcard;
    isFavorite: boolean;
}
interface VirtualizedFlashcardGridProps {
  items: DisplayCard[];
  layoutMode: 'single' | 'double';
  visualStyle: string;
  onImageClick: (card: Flashcard) => void;
  onFavoriteClick: (id: number) => void;
  getImageUrlForStyle: (card: Flashcard, style: string) => string;
}

export const VirtualizedFlashcardGrid = ({ items, layoutMode, ...itemProps }: VirtualizedFlashcardGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const columnCount = layoutMode === 'double' ? 2 : 1;
  const rowCount = Math.ceil(items.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (layoutMode === 'double' ? 750 : 1000),
    overscan: 3,
  });

  return (
    <div ref={parentRef} className="w-full h-full overflow-y-auto scrollbar-hide">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const itemsInRow = items.slice(startIndex, startIndex + columnCount);
          return (
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
                  {...itemProps}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
