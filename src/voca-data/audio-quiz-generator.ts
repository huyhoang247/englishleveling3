// --- START OF FILE: audio-quiz-generator.ts ---

import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';

// Định nghĩa các giọng đọc có sẵn ở một nơi để dễ quản lý
// Key là tên hiển thị, value là tiền tố thư mục trên server
const AVAILABLE_VOICES = {
    'Matilda': '', // Giọng mặc định không có tiền tố thư mục
    'Arabella': 'voice1/',
    'Hope': 'voice2/', // Thêm giọng Hope. Sử dụng 'voice2/' để đảm bảo mỗi giọng có một đường dẫn file riêng biệt, tuân thủ yêu cầu "thiết kế logic".
    // Thêm các giọng đọc khác ở đây trong tương lai, ví dụ:
    // 'James': 'voice3/',
    // 'Sophia': 'voice4/',
};

// Định nghĩa cấu trúc cho một đối tượng câu hỏi audio.
export interface AudioQuizQuestion {
  question: string;
  audioUrls: { [voiceName: string]: string }; // Kiểu [key: string]: string
  options: string[];
  correctAnswer: string;
  word: string;
  vietnamese: string | null;
}

/**
 * Tái cấu trúc: Tạo một hàm helper để tạo URLs audio cho một từ duy nhất.
 * Hàm này có thể được tái sử dụng ở nhiều nơi (Quiz, Flashcard Detail, ...).
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

    // --- START: LOGIC ÁNH XẠ INDEX MỚI ---
    // Tạo một biến 'audioIndex' để ánh xạ lại index của từ vựng sang index của file audio.
    // Mặc định, audioIndex sẽ bằng index gốc.
    let audioIndex = index;

    // Áp dụng logic ánh xạ lại để lấp đầy các "khoảng trống" trong cấu trúc file audio.
    if (index >= 2400 && index < 3000) {
        audioIndex = index + 600; // Ánh xạ 2400-2999 -> 3000-3599
    } 
    else if (index >= 4700 && index < 5000) {
        audioIndex = index + 300; // Ánh xạ 4700-4999 -> 5000-5299
    }
    else if (index >= 7400 && index < 8000) {
        audioIndex = index + 600; // Ánh xạ 7400-7999 -> 8000-8599
    }
    // Thêm các quy tắc ánh xạ khác ở đây nếu cần trong tương lai.

    // Tất cả logic bên dưới bây giờ sẽ sử dụng 'audioIndex' thay vì 'index' gốc.
    // --- END: LOGIC ÁNH XẠ INDEX MỚI ---

    let audioDirectory: string;
    // Sử dụng audioIndex để quyết định thư mục audio
    if (audioIndex < 1000) { audioDirectory = 'audio1'; }
    else if (audioIndex < 2000) { audioDirectory = 'audio2'; }
    else if (audioIndex >= 2000 && audioIndex < 2400) { audioDirectory = 'audio3'; }
    else if (audioIndex >= 3000 && audioIndex < 4000) { audioDirectory = 'audio4'; }
    else if (audioIndex >= 4000 && audioIndex < 4700) { audioDirectory = 'audio5'; }
    else if (audioIndex >= 5000 && audioIndex < 6000) { audioDirectory = 'audio6'; }
    else if (audioIndex >= 6000 && audioIndex < 7000) { audioDirectory = 'audio7'; }
    else if (audioIndex >= 7000 && audioIndex < 7400) { audioDirectory = 'audio8'; }
    else if (audioIndex >= 8000 && audioIndex < 9000) { audioDirectory = 'audio9'; }
    else if (audioIndex >= 9000 && audioIndex < 10000) { audioDirectory = 'audio10'; }
    else if (audioIndex >= 10000) { audioDirectory = 'audio11'; }
    else {
        audioDirectory = 'audio_default';
        // Cảnh báo này bây giờ sẽ chỉ kích hoạt cho các khoảng không được xử lý ngay cả sau khi ánh xạ
        console.warn(`Word at original index ${index} (mapped to audio index ${audioIndex}) is in an unhandled audio directory range.`);
    }
    
    // Sử dụng audioIndex để tạo số thứ tự file audio
    const audioNumber = (audioIndex + 1).toString().padStart(3, '0');
    
    const generatedAudioUrls: { [voiceName: string]: string } = {};
    for (const [name, path] of Object.entries(AVAILABLE_VOICES)) {
        generatedAudioUrls[name] = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${path}${audioDirectory}/${audioNumber}.mp3`;
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
        // Xử lý các trường hợp ngoài phạm vi nếu cần
        audioDirectory = 'audio_default_exam';
        console.warn(`Sentence at index ${sentenceIndex} is in an unhandled audio directory range for exam.`);
    }

    // Tiền tố thư mục cho exam audio
    const pathPrefix = 'exam/voice1/';
    const audioNumber = (sentenceIndex + 1).toString().padStart(3, '0');

    // Chỉ có một giọng 'Matilda' cho exam audio theo yêu cầu
    const generatedAudioUrls: { [voiceName: string]: string } = {
        'Matilda': `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${pathPrefix}${audioDirectory}/${audioNumber}.mp3`
    };

    return generatedAudioUrls;
};


/**
 * Tạo các câu hỏi trắc nghiệm dạng nghe dựa trên từ vựng đã học của người dùng.
 * Hàm này lọc danh sách từ vựng mặc định để tìm các từ người dùng đã biết,
 * sau đó xây dựng các đối tượng câu hỏi với URL audio, đáp án đúng và các đáp án gây nhiễu.
 *
 * @param userVocabulary - Một mảng các từ mà người dùng đã học.
 * @returns Một mảng tất cả các câu hỏi audio có thể có dựa trên từ vựng của người dùng.
 */
export const generateAudioQuizQuestions = (userVocabulary: string[]): AudioQuizQuestion[] => {
    // Tạo một Set để tra cứu từ vựng của người dùng hiệu quả hơn.
    const userVocabSet = new Set(userVocabulary.map(w => w.toLowerCase()));

    // Lọc từ vựng mặc định để chỉ lấy những từ người dùng đã học.
    const potentialQuestions = defaultVocabulary
        .map((word) => ({ word }))
        .filter(item => userVocabSet.has(item.word.toLowerCase()));

    // Ánh xạ mỗi từ đã học thành một đối tượng câu hỏi.
    const allPossibleQuestions = potentialQuestions.map(item => {
        // Sử dụng hàm helper mới để lấy URL audio.
        const generatedAudioUrls = generateAudioUrlsForWord(item.word);
        
        // Nếu không tạo được URL (từ không tồn tại), bỏ qua câu hỏi này.
        if (!generatedAudioUrls) {
            return null;
        }
        
        const correctWord = item.word.toLowerCase();
        
        // Tạo ba lựa chọn không chính xác (đáp án gây nhiễu).
        const incorrectOptions: string[] = [];
        while (incorrectOptions.length < 3) {
            const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)].toLowerCase();
            // Đảm bảo đáp án gây nhiễu không phải là đáp án đúng và chưa có trong danh sách.
            if (randomWord !== correctWord && !incorrectOptions.includes(randomWord)) {
                incorrectOptions.push(randomWord);
            }
        }
        
        // Trả về đối tượng câu hỏi hoàn chỉnh.
        return {
            question: "Nghe và chọn từ đúng:", 
            audioUrls: generatedAudioUrls,
            options: [correctWord, ...incorrectOptions],
            correctAnswer: correctWord,
            word: item.word,
            vietnamese: null // Câu hỏi audio không hiển thị nghĩa tiếng Việt.
        };
    }).filter((q): q is AudioQuizQuestion => q !== null); // Lọc bỏ các giá trị null

    return allPossibleQuestions;
};
