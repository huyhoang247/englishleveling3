import detailedMeaningsText from '../../vocabulary-definitions.ts';

export interface WordPair {
  english: string;
  vietnamese: string;
}

// This function parses the text and returns an array of word pairs.
// We use a regular expression to find the pattern: Vietnamese (English) là ...
const parseDefinitions = (): WordPair[] => {
  const pairs: WordPair[] = [];
  const lines = detailedMeaningsText.trim().split('\n');
  const regex = /^(.+?)\s+\((.+?)\)\s+là\s+/;

  lines.forEach(line => {
    const match = line.match(regex);
    if (match && match[1] && match[2]) {
      pairs.push({
        vietnamese: match[1].trim(),
        english: match[2].trim(),
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
