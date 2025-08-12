// --- START OF FILE: phrase-data.ts ---

// Import trực tiếp nội dung file text bằng cú pháp đặc biệt của Vite
import rawPhraseStream from './phrases.txt?raw';

interface PhrasePart {
  english: string;
  vietnamese: string;
}

interface PhraseSentence {
  parts: PhrasePart[];
  fullEnglish: string;
  fullVietnamese: string;
}

// --- DỮ LIỆU GỐC ---
// Biến rawPhraseStream đã có sẵn nội dung từ file .txt nhờ vào câu lệnh import ở trên.

// --- LOGIC TỰ ĐỘNG XỬ LÝ --- (Không thay đổi)

const partRegex = /^(.*)\s\((.*)\)$/;

export const phraseData: PhraseSentence[] = rawPhraseStream
  .trim()
  .split('\n')
  .filter(line => line.trim() !== '' && !line.trim().startsWith('//'))
  .map(line => {
    const match = line.trim().match(partRegex);
    if (!match || match.length !== 3) {
      console.warn(`Dòng sau không khớp định dạng "English (Vietnamese)": ${line}`);
      return null;
    }

    const englishPart = match[1].trim().replace(/'/g, '').replace(/,/g, '');
    const vietnamesePart = match[2].trim();

    return {
      parts: [{ english: englishPart, vietnamese: vietnamesePart }],
      fullEnglish: englishPart,
      fullVietnamese: vietnamesePart,
    };
  })
  .filter((item): item is PhraseSentence => item !== null);

// --- END OF FILE: phrase-data.ts ---
