// --- START OF FILE: audio-quiz-generator.ts ---

import { defaultVocabulary } from './voca-data/list-vocabulary.ts';

// Định nghĩa cấu trúc cho một đối tượng câu hỏi audio.
export interface AudioQuizQuestion {
  question: string;
  audioUrl: string;
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
        // **LOGIC ĐƯỢC MỞ RỘNG TẠI ĐÂY**
        // Xác định thư mục audio dựa trên chỉ mục của từ bằng cấu trúc if-else if-else.
        // Cấu trúc này dễ dàng mở rộng trong tương lai (ví dụ: audio4, audio5,...).
        let audioDirectory: string;

        if (item.index < 1000) {
            // File 1-1000 (tương ứng index 0-999)
            audioDirectory = 'audio1';
        } else if (item.index < 2000) {
            // File 1001-2000 (tương ứng index 1000-1999)
            audioDirectory = 'audio2';
        } else {
            // File 2001 trở đi (tương ứng index 2000+)
            audioDirectory = 'audio3';
        }

        // Các tệp âm thanh được đặt tên theo số (ví dụ: 001.mp3, 1001.mp3).
        const audioNumber = (item.index + 1).toString().padStart(3, '0');
        
        // Tạo URL đầy đủ với thư mục audio đã xác định.
        const audioUrl = `https://raw.githubusercontent.com/englishleveling46/Flashcard/main/${audioDirectory}/${audioNumber}.mp3`;
        
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
            audioUrl: audioUrl,
            options: [correctWord, ...incorrectOptions],
            correctAnswer: correctWord,
            word: item.word,
            vietnamese: null // Câu hỏi audio không hiển thị nghĩa tiếng Việt.
        };
    });

    return allPossibleQuestions;
};
// --- END OF FILE: audio-quiz-generator.ts ---
