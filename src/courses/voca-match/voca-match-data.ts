import detailedMeaningsText from '../../voca-data/vocabulary-definitions.ts';

export interface WordPair {
  english: string;
  vietnamese: string;
}

// This function parses the text and returns an array of word pairs.
// OLD Pattern: Vietnamese (English) là ...
// NEW Pattern: English (Vietnamese) là ...
const parseDefinitions = (): WordPair[] => {
  const pairs: WordPair[] = [];
  const lines = detailedMeaningsText.trim().split('\n');
  
  // Regex giải thích:
  // ^(.+?)  : Group 1 - Lấy cụm từ đầu dòng (Bây giờ là Tiếng Anh)
  // \s*\(   : Khoảng trắng và dấu mở ngoặc
  // (.+?)   : Group 2 - Lấy cụm từ trong ngoặc (Bây giờ là Tiếng Việt)
  // \)      : Dấu đóng ngoặc
  // \s+là\s+: Từ khóa nối
  const regex = /^(.+?)\s*\((.+?)\)\s+là\s+/;

  lines.forEach(line => {
    const match = line.match(regex);
    if (match && match[1] && match[2]) {
      pairs.push({
        english: match[1].trim(),    // Group 1 là English
        vietnamese: match[2].trim(), // Group 2 là Vietnamese
      });
    }
  });

  return pairs;
};

export const allWordPairs = parseDefinitions();

// Helper function to shuffle an array
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};
