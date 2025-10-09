// --- START OF FILE: audio-quiz-generator.ts ---

import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';

// Định nghĩa các giọng đọc có sẵn ở một nơi để dễ quản lý
// Key là tên hiển thị, value là tiền tố thư mục trên server
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

/**
 * Tạo URLs audio cho một từ duy nhất, xử lý khoảng trống trong danh sách từ vựng.
 *
 * @param word - Từ tiếng Anh cần tạo URL audio.
 * @returns Một object chứa các URL audio, hoặc null nếu từ không có file audio tương ứng.
 */
export const generateAudioUrlsForWord = (word: string): { [voiceName: string]: string } | null => {
    const wordLowerCase = word.toLowerCase();
    const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === wordLowerCase);

    if (vocabIndex === -1) {
        console.warn(`Word "${word}" not found in defaultVocabulary. Cannot generate audio URL.`);
        return null;
    }

    // --- BẮT ĐẦU SỬA LOGIC ÁNH XẠ CHỈ SỐ ---

    // 1. Xác định và bỏ qua các từ nằm trong khoảng trống không có audio (2400-2999)
    if (vocabIndex >= 2400 && vocabIndex < 3000) {
        console.warn(`Word "${word}" at index ${vocabIndex} is in a known gap with no audio file. Skipping.`);
        return null;
    }

    // 2. Tính toán 'chỉ số audio' (audioIndex) thực tế
    //    - Nếu từ đứng trước khoảng trống, audioIndex = vocabIndex
    //    - Nếu từ đứng sau khoảng trống, audioIndex = vocabIndex - (kích thước khoảng trống)
    const gapSize = 3000 - 2400; // = 600
    const audioIndex = vocabIndex < 2400 ? vocabIndex : vocabIndex - gapSize;

    // 3. TOÀN BỘ LOGIC BÊN DƯỚI GIỜ SẼ DÙNG `audioIndex` ĐỂ XÁC ĐỊNH THƯ MỤC VÀ SỐ FILE
    //    Điều này đảm bảo file được ánh xạ tới cấu trúc thư mục liên tục trên server.
    let audioDirectory: string;
    if (audioIndex < 1000) { audioDirectory = 'audio1'; }
    else if (audioIndex < 2000) { audioDirectory = 'audio2'; }
    else if (audioIndex < 2400) { audioDirectory = 'audio3'; } // File 2001-2400
    // Từ vocabIndex 3000 (audioIndex 2400) sẽ bắt đầu vào thư mục audio4
    else if (audioIndex < 3400) { audioDirectory = 'audio4'; } // File 2401-3400
    else if (audioIndex < 4100) { audioDirectory = 'audio5'; } // File 3401-4100 (tương ứng vocab 4000-4700)
    else if (audioIndex < 5400) { audioDirectory = 'audio6'; } // File 4101-5400 (tương ứng vocab 5000-6000)
    else if (audioIndex < 6400) { audioDirectory = 'audio7'; } // ...
    else if (audioIndex < 6800) { audioDirectory = 'audio8'; }
    else if (audioIndex < 8400) { audioDirectory = 'audio9'; }
    else if (audioIndex < 9400) { audioDirectory = 'audio10'; }
    else { audioDirectory = 'audio11'; } // Từ audioIndex 9400 trở đi

    const audioNumber = (audioIndex + 1).toString().padStart(3, '0');
    
    // --- KẾT THÚC SỬA LOGIC ---

    const generatedAudioUrls: { [voiceName: string]: string } = {};
    for (const [name, path] of Object.entries(AVAILABLE_VOICES)) {
        generatedAudioUrls[name] = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${path}${audioDirectory}/${audioNumber}.mp3`;
    }

    return generatedAudioUrls;
};

/**
 * TẠO MỚI: Tạo URL audio cho một câu exam dựa trên chỉ số của nó.
 * Hàm này có logic thư mục và đường dẫn riêng biệt cho audio của exam.
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
