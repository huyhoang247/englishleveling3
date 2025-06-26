// src/components/FlashcardItem.tsx (Đầy đủ)

import { memo } from 'react';

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
interface FlashcardItemProps {
  card: Flashcard;
  isFavorite: boolean;
  visualStyle: string;
  onImageClick: (card: Flashcard) => void;
  onFavoriteClick: (id: number) => void;
  getImageUrlForStyle: (card: Flashcard, style: string) => string;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = memo(({ card, isFavorite, visualStyle, onImageClick, onFavoriteClick, getImageUrlForStyle }) => {
  return (
    <div 
      id={`flashcard-${card.id}`} 
      className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <button className={`transition-all duration-300 flex items-center justify-center p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 ${isFavorite ? 'scale-110' : 'scale-100'}`}
                onClick={() => onFavoriteClick(card.id)}
                aria-label={isFavorite ? "Quản lý trong Playlist" : "Thêm vào Playlist"}>
            <img src={isFavorite ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"} alt={isFavorite ? "Favorite icon" : "Unfavorite icon"} className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'opacity-100' : 'opacity-75'}`} />
        </button>
      </div>
      <div className="w-full">
        <div className={`relative w-full ${visualStyle === 'realistic' ? 'p-2 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800' : ''}`}>
          {visualStyle === 'anime' && <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30 mix-blend-overlay pointer-events-none"></div>}
          {visualStyle === 'comic' && <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>}
          {visualStyle === 'realistic' && <div className="absolute inset-0 shadow-inner pointer-events-none"></div>}
          <img
            src={getImageUrlForStyle(card, visualStyle)}
            alt={`Flashcard ${card.id}`}
            className={`w-full h-auto ${visualStyle === 'anime' ? 'saturate-150 contrast-105' : visualStyle === 'comic' ? 'contrast-125 brightness-105' : visualStyle === 'realistic' ? 'saturate-105 contrast-110 shadow-md' : ''} cursor-pointer`}
            style={{aspectRatio: '1024/1536', filter: visualStyle === 'comic' ? 'grayscale(0.1)' : 'none'}}
            onClick={() => onImageClick(card)}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = card.imageUrl.default; }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
});
