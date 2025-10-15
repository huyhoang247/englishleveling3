// --- START OF CORRECTED FILE: audio-quiz-generator.ts ---

import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';

// Định nghĩa các giọng đọc có sẵn ở một nơi để dễ quản lý
// <<< SỬA LỖI TẠI ĐÂY: Thêm "export" >>>
export const AVAILABLE_VOICES = {
    'Matilda': '', 
    'Arabella': 'voice1/',
    'Hope': 'voice2/', 
};

// Định nghĩa cấu trúc cho một đối tượng câu hỏi audio.
export interface AudioQuizQuestion {
  question: string;
  audioUrls: { [voiceName: string]: string };
  options: string[];
  correctAnswer: string;
  word: string;
  vietnamese: string | null;
}

/**
 * TÁI CẤU TRÚC THEO PHONG CÁCH CỦA image-url.ts
 * 
 * Định nghĩa các khối (blocks) URL audio cần tạo.
 * Cấu trúc này cho phép ánh xạ linh hoạt từ một khoảng index của từ vựng
 * sang một khoảng số thứ tự của file audio.
 */
const audioBlocks = [
  // Basic Voca
  { startIndex: 0,    endIndex: 999,  audioFolder: 'audio1',  audioStartNumber: 1 },
  { startIndex: 1000, endIndex: 1999, audioFolder: 'audio2',  audioStartNumber: 1001 },
  { startIndex: 2000, endIndex: 2399, audioFolder: 'audio3',  audioStartNumber: 2001 },
  
  // Elementary Voca (Ánh xạ từ vựng 2401-3400 sang audio 3001-4000)
  { startIndex: 2400, endIndex: 3399, audioFolder: 'audio4',  audioStartNumber: 3001 },
  { startIndex: 3400, endIndex: 4099, audioFolder: 'audio5',  audioStartNumber: 4001 }, // Voca 3401-4100 -> Audio 4001-4700

  // Intermediate Voca
  { startIndex: 4100, endIndex: 5099, audioFolder: 'audio6',  audioStartNumber: 5001 },
  { startIndex: 5100, endIndex: 6099, audioFolder: 'audio7',  audioStartNumber: 6001 },
  { startIndex: 6100, endIndex: 6499, audioFolder: 'audio8',  audioStartNumber: 7001 },

  // Advanced Voca
  { startIndex: 6500, endIndex: 7499, audioFolder: 'audio9',  audioStartNumber: 8001 },
  { startIndex: 7500, endIndex: 8499, audioFolder: 'audio10', audioStartNumber: 9001 },
  { startIndex: 8500, endIndex: 8799, audioFolder: 'audio11', audioStartNumber: 10001 },
];


/**
 * Tái cấu trúc: Tạo một hàm helper để tạo URLs audio cho một từ duy nhất.
 * Hàm này sử dụng cấu trúc `audioBlocks` để tăng tính linh hoạt và dễ bảo trì.
 *
 * @param word - Từ tiếng Anh cần tạo URL audio.
 * @returns Một object chứa các URL audio cho mỗi giọng đọc, hoặc null nếu không tìm thấy từ.
 */
export const generateAudioUrlsForWord = (word: string): { [voiceName: string]: string } | null => {
    const wordLowerCase = word.toLowerCase();
    const index = defaultVocabulary.findIndex(v => v.toLowerCase() === wordLowerCase);

    if (index === -1) {
        console.warn(`Word "${word}" not found in defaultVocabulary. Cannot generate audio URL.`);
        return null;
    }

    // Tìm khối cấu hình audio tương ứng với index của từ
    const block = audioBlocks.find(b => index >= b.startIndex && index <= b.endIndex);

    if (!block) {
        // Nếu index của từ nằm ngoài các khoảng đã định nghĩa
        console.warn(`No audio mapping found for word "${word}" at index ${index}.`);
        return null;
    }

    // Tính toán số thứ tự file audio
    const audioNumber = block.audioStartNumber + (index - block.startIndex);
    
    // Số dưới 1000 sẽ được đệm 3 số. Các số lớn hơn giữ nguyên.
    const fileName = audioNumber < 1000 ? String(audioNumber).padStart(3, '0') : String(audioNumber);

    const generatedAudioUrls: { [voiceName: string]: string } = {};
    for (const [name, path] of Object.entries(AVAILABLE_VOICES)) {
        generatedAudioUrls[name] = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${path}${block.audioFolder}/${fileName}.mp3`;
    }

    return generatedAudioUrls;
};

/**
 * TẠO MỚI: Tạo URL audio cho một câu exam dựa trên chỉ số của nó.
 * @param sentenceIndex - Chỉ số (index) của câu trong danh sách `exampleData`.
 * @returns Một object chứa URL audio cho giọng đọc exam, hoặc null nếu index không hợp lệ.
 */
export const generateAudioUrlsForExamSentence = (sentenceIndex: number): { [voiceName: string]: string } | null => {
    if (sentenceIndex < 0) {
        console.warn(`Invalid sentenceIndex "${sentenceIndex}". Cannot generate audio URL.`);
        return null;
    }

    let audioDirectory: string;
    if (sentenceIndex < 1000) { audioDirectory = 'audio1'; }
    else if (sentenceIndex < 2000) { audioDirectory = 'audio2'; }
    else if (sentenceIndex < 3000) { audioDirectory = 'audio3'; }
    else if (sentenceIndex < 4000) { audioDirectory = 'audio4'; }
    else if (sentenceIndex < 5000) { audioDirectory = 'audio5'; }
    else if (sentenceIndex < 6000) { audioDirectory = 'audio6'; }
    else if (sentenceIndex < 7000) { audioDirectory = 'audio7'; }
    else if (sentenceIndex < 8000) { audioDirectory = 'audio8'; }
    else if (sentenceIndex < 9000) { audioDirectory = 'audio9'; }
    else {
        audioDirectory = 'audio_default_exam';
        console.warn(`Sentence at index ${sentenceIndex} is in an unhandled audio directory range for exam.`);
    }

    const pathPrefix = 'exam/voice1/';
    const audioNumber = (sentenceIndex + 1).toString().padStart(3, '0');

    const generatedAudioUrls: { [voiceName: string]: string } = {
        'Matilda': `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${pathPrefix}${audioDirectory}/${audioNumber}.mp3`
    };

    return generatedAudioUrls;
};


/**
 * Tạo các câu hỏi trắc nghiệm dạng nghe dựa trên từ vựng đã học của người dùng.
 * @param userVocabulary - Một mảng các từ mà người dùng đã học.
 * @returns Một mảng tất cả các câu hỏi audio có thể có dựa trên từ vựng của người dùng.
 */
export const generateAudioQuizQuestions = (userVocabulary: string[]): AudioQuizQuestion[] => {
    const userVocabSet = new Set(userVocabulary.map(w => w.toLowerCase()));

    const potentialQuestions = defaultVocabulary
        .map((word) => ({ word }))
        .filter(item => userVocabSet.has(item.word.toLowerCase()));

    const allPossibleQuestions = potentialQuestions.map(item => {
        const generatedAudioUrls = generateAudioUrlsForWord(item.word);
        
        if (!generatedAudioUrls) {
            return null;
        }
        
        const correctWord = item.word.toLowerCase();
        
        const incorrectOptions: string[] = [];
        while (incorrectOptions.length < 3) {
            const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)].toLowerCase();
            if (randomWord !== correctWord && !incorrectOptions.includes(randomWord)) {
                incorrectOptions.push(randomWord);
            }
        }
        
        return {
            question: "Nghe và chọn từ đúng:", 
            audioUrls: generatedAudioUrls,
            options: [correctWord, ...incorrectOptions],
            correctAnswer: correctWord,
            word: item.word,
            vietnamese: null
        };
    }).filter((q): q is AudioQuizQuestion => q !== null); 

    return allPossibleQuestions;
};

// --- END OF CORRECTED FILE ---
