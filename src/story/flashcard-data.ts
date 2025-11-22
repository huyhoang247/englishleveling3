// --- START OF FILE: src/flashcard-data.ts ---

import { 
  defaultImageUrls as initialDefaultImageUrls,
  photographyImageUrls as initialPhotographyImageUrls,
  illustrationImageUrls as initialIllustrationImageUrls,
  realisticImageUrls as initialRealisticImageUrls // ADDED
} from '../voca-data/image-url.ts';
import detailedMeaningsText from '../voca-data/vocabulary-definitions.ts';
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';
import { exampleData } from '../voca-data/example-data.ts';

// --- Interfaces and Data ---
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
  photography?: string;
  illustration?: string;
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
        // CẬP NHẬT: Format mới là "Source (Nguồn) là..."
        // Regex này lấy phần chữ ở đầu dòng cho đến khi gặp dấu mở ngoặc đầu tiên '('
        const match = line.match(/^([^(]+)\s*\(/);
        
        if (match && match[1]) {
            // match[1] sẽ lấy được "Source " (có thể có khoảng trắng)
            // .trim() để xóa khoảng trắng thừa -> "Source"
            const englishWord = match[1].trim();
            
            // Key vẫn là chữ IN HOA để tra cứu
            meaningsMap.set(englishWord.toUpperCase(), line.trim());
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
const photographyImageUrls: string[] = [
  ...initialPhotographyImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialPhotographyImageUrls.length), 'Photo', '808080')
];
const illustrationImageUrls: string[] = [
  ...initialIllustrationImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialIllustrationImageUrls.length), 'Illustration', '90EE90')
];

// ADDED: Realistic Image URLs setup
const realisticImageUrls: string[] = [
  ...initialRealisticImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialRealisticImageUrls.length), 'Realistic', 'A0A0A0')
];

const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');

// --- EXPORT 1: Map tra cứu bằng ID (dùng cho Gallery) ---
export const ALL_CARDS_MAP: Map<number, Flashcard> = new Map(
    Array.from({ length: numberOfSampleFlashcards }, (_, i) => {
        const cardId = i + 1;
        const rawWord = defaultVocabulary[i];
        const capitalizedWord = capitalizeFirstLetter(rawWord);
        // THAY ĐỔI 2: Dùng từ đã được chuyển về IN HOA để tra cứu
        const detailedMeaning = detailedMeaningsMap.get(rawWord.toUpperCase());
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
            realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${cardId}`, // Included realistic
            photography: photographyImageUrls[i] || `https://placehold.co/1024x1536/808080/FFFFFF?text=Photo+${cardId}`,
            illustration: illustrationImageUrls[i] || `https://placehold.co/1024x1536/90EE90/FFFFFF?text=Illustration+${cardId}`,
        };
        const card: Flashcard = { id: cardId, imageUrl: imageUrls, vocabulary: vocab };
        return [cardId, card];
    })
);

// --- EXPORT 2: Map tra cứu bằng từ (dùng cho Word Chain Game) ---
export const WORD_TO_CARD_MAP: Map<string, Flashcard> = new Map();
ALL_CARDS_MAP.forEach(card => {
    // Key vẫn là từ vựng viết thường để dễ dàng tra cứu input của người dùng
    WORD_TO_CARD_MAP.set(card.vocabulary.word.toLowerCase(), card);
});


// --- EXPORT 3: Dữ liệu ví dụ (dùng cho Modal) ---
export { exampleData };
// --- END OF FILE: src/flashcard-data.ts ---
