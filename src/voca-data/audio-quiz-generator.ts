// --- START OF FILE audio-quiz-generator.ts ---

import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';
import { exampleData } from '../voca-data/example-data.ts';

// Tách riêng voice cho từng loại để dễ quản lý và tuân thủ yêu cầu path khác nhau
const AVAILABLE_VOCAB_VOICES = {
    'Matilda': '', // Giọng mặc định không có tiền tố thư mục
    'Arabella': 'voice1/',
    'Hope': 'voice2/',
};

const AVAILABLE_EXAM_VOICES = {
    'Matilda': '', // Giọng mặc định
    'Arabella': 'exam/voice1/', // Tiền tố thư mục theo yêu cầu
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
 * TÁI CẤU TRÚC: Tạo hàm helper chung để tạo URL audio, có thể xử lý nhiều loại khác nhau.
 * Điều này giúp code logic hơn và dễ bảo trì.
 *
 * @param word - Từ tiếng Anh cần tạo URL audio.
 * @param type - Loại audio cần tạo ('vocab' cho từ vựng, 'exam' cho bài kiểm tra).
 * @returns Một object chứa các URL audio cho mỗi giọng đọc, hoặc null nếu không tìm thấy từ.
 */
export const generateAudioUrls = (word: string, type: 'vocab' | 'exam'): { [voiceName: string]: string } | null => {
    const wordLowerCase = word.toLowerCase();
    const index = defaultVocabulary.findIndex(v => v.toLowerCase() === wordLowerCase);

    if (index === -1) {
        console.warn(`Word "${word}" not found in defaultVocabulary. Cannot generate audio URL.`);
        return null;
    }

    let audioDirectory: string;
    // Logic phân chia thư mục audio dựa trên type
    if (type === 'vocab') {
        if (index < 1000) { audioDirectory = 'audio1'; }
        else if (index < 2000) { audioDirectory = 'audio2'; }
        else if (index >= 2000 && index < 2400) { audioDirectory = 'audio3'; }
        else if (index >= 3000 && index < 4000) { audioDirectory = 'audio4'; }
        else if (index >= 4000 && index < 4700) { audioDirectory = 'audio5'; }
        else if (index >= 5000 && index < 6000) { audioDirectory = 'audio6'; }
        else if (index >= 6000 && index < 7000) { audioDirectory = 'audio7'; }
        else if (index >= 7000 && index < 7500) { audioDirectory = 'audio8'; }
        else if (index >= 8000 && index < 9000) { audioDirectory = 'audio9'; }
        else if (index >= 9000 && index < 10000) { audioDirectory = 'audio10'; }
        else if (index >= 10000) { audioDirectory = 'audio11'; }
        else { audioDirectory = 'audio_default'; }
    } else if (type === 'exam') {
        // Logic thư mục audio mới cho exam
        if (index < 1000) { audioDirectory = 'audio1'; }
        else if (index < 2000) { audioDirectory = 'audio2'; }
        else if (index < 3000) { audioDirectory = 'audio3'; }
        else { audioDirectory = 'audio_default'; }
    } else {
        audioDirectory = 'audio_default';
    }
    
    const audioNumber = (index + 1).toString().padStart(3, '0');
    
    const generatedAudioUrls: { [voiceName: string]: string } = {};
    const voiceMap = type === 'vocab' ? AVAILABLE_VOCAB_VOICES : AVAILABLE_EXAM_VOICES;

    for (const [name, path] of Object.entries(voiceMap)) {
        generatedAudioUrls[name] = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${path}${audioDirectory}/${audioNumber}.mp3`;
    }

    return generatedAudioUrls;
};

// <<< THÊM VÀO ĐÂY: Hàm tương thích ngược để sửa lỗi import >>>
/**
 * @deprecated Sử dụng generateAudioUrls(word, 'vocab') thay thế.
 * Hàm này được giữ lại để đảm bảo các component khác không bị lỗi import khi refactor.
 */
export const generateAudioUrlsForWord = (word: string): { [voiceName: string]: string } | null => {
    // Luôn gọi hàm mới với type là 'vocab' để đảm bảo hoạt động như cũ
    return generateAudioUrls(word, 'vocab');
};


/**
 * Tạo các câu hỏi trắc nghiệm dạng nghe dựa trên từ vựng đã học của người dùng.
 * Dùng cho Practice 4.
 *
 * @param userVocabulary - Một mảng các từ mà người dùng đã học.
 * @returns Một mảng tất cả các câu hỏi audio có thể có dựa trên từ vựng của người dùng.
 */
export const generateAudioQuizQuestions = (userVocabulary: string[]): AudioQuizQuestion[] => {
    const userVocabSet = new Set(userVocabulary.map(w => w.toLowerCase()));

    const potentialQuestions = defaultVocabulary
        .map((word) => ({ word }))
        .filter(item => userVocabSet.has(item.word.toLowerCase()));

    const allPossibleQuestions = potentialQuestions.map(item => {
        // Sử dụng hàm mới để linh hoạt hơn
        const generatedAudioUrls = generateAudioUrls(item.word, 'vocab');
        
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

/**
 * TẠO MỚI: Tạo câu hỏi audio dạng điền vào chỗ trống, tương tự Practice 2 nhưng có âm thanh.
 * Dùng cho Practice 5.
 *
 * @param userVocabulary - Một mảng các từ mà người dùng đã học.
 * @returns Một mảng các câu hỏi audio dạng điền vào chỗ trống.
 */
export const generateAudioExamQuestions = (userVocabulary: string[]): AudioQuizQuestion[] => {
    const userVocabSet = new Set(userVocabulary.map(w => w.toLowerCase()));

    const allPossibleQuestions = userVocabulary.flatMap(word => {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
        const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));

        if (matchingSentences.length > 0) {
            const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
            
            const generatedAudioUrls = generateAudioUrls(word, 'exam');
            if (!generatedAudioUrls) return [];

            const questionText = randomSentence.english.replace(wordRegex, '___');
            const lowerCaseCorrectWord = word.toLowerCase();

            const incorrectOptions: string[] = [];
            while (incorrectOptions.length < 3) {
                const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)];
                if (randomWord.toLowerCase() !== lowerCaseCorrectWord && !incorrectOptions.some(opt => opt.toLowerCase() === randomWord.toLowerCase())) {
                    incorrectOptions.push(randomWord);
                }
            }

            return [{
                question: questionText,
                audioUrls: generatedAudioUrls,
                options: [lowerCaseCorrectWord, ...incorrectOptions.map(opt => opt.toLowerCase())],
                correctAnswer: lowerCaseCorrectWord,
                word: word,
                vietnamese: randomSentence.vietnamese,
            }];
        }
        return [];
    });

    return allPossibleQuestions;
};

// --- END OF FILE audio-quiz-generator.ts ---
