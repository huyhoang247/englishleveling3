// --- START OF REFACTORED FILE: audio-quiz-generator.ts ---

import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';

// Định nghĩa các giọng đọc có sẵn ở một nơi để dễ quản lý
const AVAILABLE_VOICES = {
    'Matilda': '', // Giọng mặc định không có tiền tố thư mục
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

// ==============================================================================
// === LOGIC MỚI: Định nghĩa các khoảng index và thư mục audio tương ứng  ===
// ==============================================================================
// Cấu trúc này đồng bộ hoàn toàn với `urlBlocks` trong `image-url.ts`.
// Lưu ý: index là 0-based, trong khi số thứ tự file là 1-based.
// Ví dụ: file 1-1000 tương ứng với index 0-999.
const audioDirectoryRanges = [
    // Basic Voca (1-2400)
    { start: 0, end: 999, directory: 'audio1' },       // Tương ứng file 1-1000
    { start: 1000, end: 1999, directory: 'audio2' },    // Tương ứng file 1001-2000
    { start: 2000, end: 2399, directory: 'audio3' },    // Tương ứng file 2001-2400
    
    // Elementary Voca (3001-4700)
    { start: 3000, end: 3999, directory: 'audio4' },    // Tương ứng file 3001-4000
    { start: 4000, end: 4699, directory: 'audio5' },    // Tương ứng file 4001-4700

    // Intermediate Voca (5001-7400)
    { start: 5000, end: 5999, directory: 'audio6' },    // Tương ứng file 5001-6000
    { start: 6000, end: 6999, directory: 'audio7' },    // Tương ứng file 6001-7000
    { start: 7000, end: 7399, directory: 'audio8' },    // Tương ứng file 7001-7400

    // Advanced Voca (8001-10300)
    { start: 8000, end: 8999, directory: 'audio9' },     // Tương ứng file 8001-9000
    { start: 9000, end: 9999, directory: 'audio10' },   // Tương ứng file 9001-10000
    { start: 10000, end: 10299, directory: 'audio11' }, // Tương ứng file 10001-10300
];

/**
 * Tái cấu trúc: Tạo một hàm helper để tạo URLs audio cho một từ duy nhất.
 * Hàm này có thể được tái sử dụng ở nhiều nơi (Quiz, Flashcard Detail, ...).
 *
 * @param word - Từ tiếng Anh cần tạo URL audio.
 * @returns Một object chứa các URL audio cho mỗi giọng đọc, hoặc null nếu không tìm thấy từ hoặc từ nằm trong khoảng không có audio.
 */
export const generateAudioUrlsForWord = (word: string): { [voiceName: string]: string } | null => {
    const wordLowerCase = word.toLowerCase();
    const index = defaultVocabulary.findIndex(v => v.toLowerCase() === wordLowerCase);

    if (index === -1) {
        console.warn(`Word "${word}" not found in defaultVocabulary. Cannot generate audio URL.`);
        return null;
    }
    
    // Tìm thư mục audio dựa trên index của từ trong cấu trúc `audioDirectoryRanges`
    const range = audioDirectoryRanges.find(r => index >= r.start && index <= r.end);

    // **ĐIỂM MẤU CHỐT**: Nếu không tìm thấy range, có nghĩa là từ này nằm trong "khoảng trống"
    // (ví dụ: index 2500). Trong trường hợp này, ta trả về null.
    if (!range) {
        // console.log(`Word "${word}" at index ${index} falls into a gap with no associated audio directory.`);
        return null;
    }

    const audioDirectory = range.directory;
    const fileNumber = index + 1;

    // **CẢI TIẾN**: Logic tạo tên file giờ đây xử lý chính xác các số >= 1000,
    // đồng bộ hoàn toàn với logic của `image-url.ts`.
    const fileName = fileNumber < 1000 ? String(fileNumber).padStart(3, '0') : String(fileNumber);
    
    const generatedAudioUrls: { [voiceName: string]: string } = {};
    for (const [name, path] of Object.entries(AVAILABLE_VOICES)) {
        generatedAudioUrls[name] = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${path}${audioDirectory}/${fileName}.mp3`;
    }

    return generatedAudioUrls;
};

/**
 * TẠO MỚI: Tạo URL audio cho một câu exam dựa trên chỉ số của nó.
 * Hàm này có logic thư mục và đường dẫn riêng biệt cho audio của exam.
 *
 * @param sentenceIndex - Chỉ số (index) của câu trong danh sách `exampleData`.
 * @returns Một object chứa URL audio cho giọng đọc exam, hoặc null nếu index không hợp lệ.
 */
export const generateAudioUrlsForExamSentence = (sentenceIndex: number): { [voiceName: string]: string } | null => {
    if (sentenceIndex < 0) {
        console.warn(`Invalid sentenceIndex "${sentenceIndex}". Cannot generate audio URL.`);
        return null;
    }

    let audioDirectory: string;
    // Điều kiện audio cho exam như yêu cầu
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
    const fileNumber = sentenceIndex + 1;
    const fileName = fileNumber < 1000 ? String(fileNumber).padStart(3, '0') : String(fileNumber);

    const generatedAudioUrls: { [voiceName: string]: string } = {
        'Matilda': `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${pathPrefix}${audioDirectory}/${fileName}.mp3`
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
        
        // Nếu không tạo được URL (từ không tồn tại hoặc nằm trong khoảng trống), bỏ qua câu hỏi này.
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

// --- END OF REFACTORED FILE ---
