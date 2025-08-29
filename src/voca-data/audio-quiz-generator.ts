
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';

// Định nghĩa cấu trúc cho một đối tượng câu hỏi audio.
// THAY ĐỔI: Chuyển từ audioUrl: string sang audioUrls: object
export interface AudioQuizQuestion {
  question: string;
  audioUrls: {
    matilda: string;
    arabella: string;
  };
  options: string[];
  correctAnswer: string;
  word: string;
  vietnamese: string | null;
}

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
    // Chúng ta cũng cần chỉ mục ban đầu để tạo URL tệp âm thanh chính xác.
    const potentialQuestions = defaultVocabulary
        .map((word, index) => ({ word, index }))
        .filter(item => userVocabSet.has(item.word.toLowerCase()));

    // Ánh xạ mỗi từ đã học thành một đối tượng câu hỏi.
    const allPossibleQuestions = potentialQuestions.map(item => {
        // Xác định thư mục audio dựa trên chỉ mục của từ theo yêu cầu mới.
        // Lưu ý: Tên file (2001, 3001,...) bằng item.index + 1.
        // Do đó, điều kiện sẽ dựa trên item.index.
        let audioDirectory: string;

        if (item.index < 1000) { // File 1-1000 (index 0-999)
            audioDirectory = 'audio1';
        } else if (item.index < 2000) { // File 1001-2000 (index 1000-1999)
            audioDirectory = 'audio2';
        } else if (item.index >= 2000 && item.index < 2400) { // File 2001-2400 (index 2000-2399)
            audioDirectory = 'audio3';
        } else if (item.index >= 3000 && item.index < 4000) { // File 3001-4000 (index 3000-3999)
            audioDirectory = 'audio4';
        } else if (item.index >= 4000 && item.index < 4700) { // File 4001-4700 (index 4000-4699)
            audioDirectory = 'audio5';
        } else if (item.index >= 5000 && item.index < 6000) { // File 5001-6000 (index 5000-5999)
            audioDirectory = 'audio6';
        } else if (item.index >= 6000 && item.index < 7000) { // File 6001-7000 (index 6000-6999)
            audioDirectory = 'audio7';
        } else if (item.index >= 7000 && item.index < 7500) { // File 7001-7500 (index 7000-7499)
            audioDirectory = 'audio8';
        } else if (item.index >= 8000 && item.index < 9000) { // File 8001-9000 (index 8000-8999)
            audioDirectory = 'audio9';
        } else if (item.index >= 9000 && item.index < 10000) { // File 9001-10000 (index 9000-9999)
            audioDirectory = 'audio10';
        } else if (item.index >= 10000) { // File 10001 trở đi (index 10000+)
            audioDirectory = 'audio11';
        } else {
            // Trường hợp dự phòng cho các từ nằm trong "khoảng trống"
            // (ví dụ: 2401-3000, 4701-5000,...)
            // Bạn có thể đặt một thư mục mặc định hoặc báo lỗi tại đây.
            // Ở đây mình tạm đặt là 'audio_default' và in ra cảnh báo.
            audioDirectory = 'audio_default'; 
            console.warn(`Word at index ${item.index} is in an unhandled audio directory range.`);
        }

        // Các tệp âm thanh được đặt tên theo số (ví dụ: 001.mp3, 1001.mp3).
        const audioNumber = (item.index + 1).toString().padStart(3, '0');
        
        // THAY ĐỔI: Tạo URL cho cả hai giọng đọc
        const matildaUrl = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${audioDirectory}/${audioNumber}.mp3`;
        const arabellaUrl = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/voice1/${audioDirectory}/${audioNumber}.mp3`;
        
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
            // THAY ĐỔI: Lưu object audioUrls thay vì một URL duy nhất
            audioUrls: {
                matilda: matildaUrl,
                arabella: arabellaUrl,
            },
            options: [correctWord, ...incorrectOptions],
            correctAnswer: correctWord,
            word: item.word,
            vietnamese: null // Câu hỏi audio không hiển thị nghĩa tiếng Việt.
        };
    });

    return allPossibleQuestions;
};
// --- END OF FILE: audio-quiz-generator.ts ---
