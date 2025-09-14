// --- START OF FILE: src/flashcard-data.ts ---

import { 
  defaultImageUrls as initialDefaultImageUrls,
  photographyImageUrls as initialPhotographyImageUrls // Thêm import mới
} from '../voca-data/image-url.ts';
import detailedMeaningsText from '../voca-data/vocabulary-definitions.ts';
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';
import { exampleData } from '../voca-data/example-data.ts';

// --- Interfaces and Data ---
// Các interface này được dùng chung bởi nhiều component
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
  photography?: string; // Thêm style mới
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
export interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  vocabulary: VocabularyData;
}
export interface ExampleSentence {
  english: string;
  vietnamese: string;
}

// --- Helper Functions ---
const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};

const parseDetailedMeanings = (text: string): Map<string, string> => {
    const meaningsMap = new Map<string, string>();
    const lines = text.trim().split('\n');
    for (const line of lines) {
        const match = line.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            const englishWord = match[1];
            meaningsMap.set(englishWord, line.trim());
        }
    }
    return meaningsMap;
};

// --- Data Generation Logic ---
const detailedMeaningsMap = parseDetailedMeanings(detailedMeaningsText);
const numberOfSampleFlashcards = defaultVocabulary.length;

// Tạo mảng URL hoàn chỉnh, bổ sung placeholder nếu thiếu
const defaultImageUrls: string[] = [
  ...initialDefaultImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0')
];
const photographyImageUrls: string[] = [ // Tạo mảng tương tự cho photography
  ...initialPhotographyImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialPhotographyImageUrls.length), 'Photo', '808080')
];
const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');

// --- EXPORT 1: Map tra cứu bằng ID (dùng cho Gallery) ---
export const ALL_CARDS_MAP: Map<number, Flashcard> = new Map(
    Array.from({ length: numberOfSampleFlashcards }, (_, i) => {
        const cardId = i + 1;
        const rawWord = defaultVocabulary[i];
        const capitalizedWord = capitalizeFirstLetter(rawWord);
        const detailedMeaning = detailedMeaningsMap.get(capitalizedWord);
        const vocab: VocabularyData = {
            word: capitalizedWord,
            meaning: detailedMeaning || `Meaning of ${capitalizedWord}`,
            example: `Example sentence for ${capitalizedWord}.`,
            phrases: [`Phrase A ${cardId}`, `Phrase B ${cardId}`],
            popularity: cardId % 3 === 0 ? "Cao" : (cardId % 2 === 0 ? "Trung bình" : "Thấp"),
            synonyms: [`Synonym 1.${cardId}`, `Synonym 2.${cardId}`],
            antonyms: [`Antonym 1.${cardId}`, `Antonym 2.${cardId}`]
        };
        const imageUrls: StyledImageUrls = {
            default: defaultImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Default+${cardId}`,
            anime: animeImageUrls[i] || `https://placehold.co/1024x1536/FF99CC/FFFFFF?text=Anime+${cardId}`,
            comic: comicImageUrls[i] || `https://placehold.co/1024x1536/66B2FF/FFFFFF?text=Comic+${cardId}`,
            realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${cardId}`,
            photography: photographyImageUrls[i] || `https://placehold.co/1024x1536/808080/FFFFFF?text=Photo+${cardId}`, // Thêm URL photography
        };
        const card: Flashcard = { id: cardId, imageUrl: imageUrls, vocabulary: vocab };
        return [cardId, card];
    })
);

// --- EXPORT 2: Map tra cứu bằng từ (dùng cho Word Chain Game) ---
export const WORD_TO_CARD_MAP: Map<string, Flashcard> = new Map();
ALL_CARDS_MAP.forEach(card => {
    // Key là từ vựng viết thường để dễ dàng tra cứu
    WORD_TO_CARD_MAP.set(card.vocabulary.word.toLowerCase(), card);
});


// --- EXPORT 3: Dữ liệu ví dụ (dùng cho Modal) ---
export { exampleData };
