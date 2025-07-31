// File: functions/src/index.ts (ĐÃ SỬA LỖI CUỐI CÙNG)

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Import dữ liệu tĩnh của bạn từ thư mục src của functions
import { quizData } from "./quiz-data";
import { exampleData } from "./example-data";

admin.initializeApp();
const db = admin.firestore();

// Định nghĩa kiểu dữ liệu để code rõ ràng hơn
interface Progress {
  completed: number;
  total: number;
}

interface ProgressData {
  [key: number]: Progress;
}

const MAX_PREVIEWS = 5;

// Hàm onCall, được gọi từ client
export const calculatePracticeProgress = functions
  .region("asia-southeast1") // Thay đổi region nếu cần
  .https.onCall(async (data, context) => {
    // 1. Xác thực người dùng
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Chức năng này yêu cầu xác thực người dùng.",
      );
    }
    const { uid } = context.auth;
    const { selectedType } = data;

    // 2. Kiểm tra dữ liệu đầu vào
    if (!selectedType || !["tracNghiem", "dienTu"].includes(selectedType)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Cần cung cấp 'selectedType' hợp lệ.",
      );
    }

    try {
      // 3. Lấy tất cả dữ liệu người dùng cần thiết từ Firestore (thực hiện song song)
      const [
        userDocSnap,
        openedVocabSnapshot,
        completedWordsSnapshot,
        completedMultiWordSnapshot,
      ] = await Promise.all([
        db.doc(`users/${uid}`).get(),
        db.collection(`users/${uid}/openedVocab`).get(),
        db.collection(`users/${uid}/completedWords`).get(),
        db.collection(`users/${uid}/completedMultiWord`).get(),
      ]);

      // --- DÒNG ĐÃ SỬA ---
      const userData = userDocSnap.exists ? userDocSnap.data() : {};
      // --------------------

      const claimedRewards = userData.claimedQuizRewards || {};
      const userVocabulary = openedVocabSnapshot.docs
        .map((doc) => doc.data().word)
        .filter(Boolean);

      // Xử lý dữ liệu đã hoàn thành để truy vấn nhanh hơn bằng Set
      const completedWordsByGameMode: { [key: string]: Set<string> } = {};
      completedWordsSnapshot.forEach((doc) => {
        const gameModes = doc.data().gameModes;
        if (gameModes) {
          for (const mode in gameModes) {
            if (!completedWordsByGameMode[mode]) {
              completedWordsByGameMode[mode] = new Set();
            }
            completedWordsByGameMode[mode].add(doc.id.toLowerCase());
          }
        }
      });

      const completedMultiWordByGameMode: { [key: string]: Set<string> } = {};
      completedMultiWordSnapshot.forEach((docSnap) => {
        const completedIn = docSnap.data().completedIn || {};
        for (const mode in completedIn) {
          if (!completedMultiWordByGameMode[mode]) {
            completedMultiWordByGameMode[mode] = new Set();
          }
          completedMultiWordByGameMode[mode].add(docSnap.id.toLowerCase());
        }
      });

      // 4. Bắt đầu tính toán tiến trình (Logic được chuyển từ client lên đây)
      const newProgressData: ProgressData = {};

      if (selectedType === "tracNghiem") {
        const allQuizModes = ["quiz-1", "quiz-2", "quiz-3"];
        for (let i = 1; i <= MAX_PREVIEWS; i++) {
          allQuizModes.push(`quiz-${i * 100 + 1}`, `quiz-${i * 100 + 2}`, `quiz-${i * 100 + 3}`);
        }

        allQuizModes.forEach((mode) => {
          const practiceNum = parseInt(mode.split("-")[1], 10);
          if (!practiceNum) return;

          const completedSet = completedWordsByGameMode[mode] || new Set();

          if (practiceNum % 100 === 1) {
            const totalQs = quizData.filter((q) => userVocabulary.some((v) => new RegExp(`\\b${v}\\b`, "i").test(q.question)));
            const completed = totalQs.filter((q) => {
              const word = userVocabulary.find((v) => new RegExp(`\\b${v}\\b`, "i").test(q.question));
              return word && completedSet.has(word.toLowerCase());
            }).length;
            newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
          } else if (practiceNum % 100 === 2 || practiceNum % 100 === 3) {
            const totalQs = userVocabulary.flatMap((word) => exampleData.some((ex) => new RegExp(`\\b${word}\\b`, "i").test(ex.english)) ? [{ word }] : []);
            const completed = totalQs.filter((q) => completedSet.has(q.word.toLowerCase())).length;
            newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
          }
        });
      } else if (selectedType === "dienTu") {
        const allFillModes = ["fill-word-1", "fill-word-2", "fill-word-3", "fill-word-4", "fill-word-5", "fill-word-6", "fill-word-7"];
        for (let i = 1; i <= MAX_PREVIEWS; i++) {
          allFillModes.push(`fill-word-${i * 100 + 1}`, `fill-word-${i * 100 + 2}`, `fill-word-${i * 100 + 3}`, `fill-word-${i * 100 + 4}`, `fill-word-${i * 100 + 5}`, `fill-word-${i * 100 + 6}`, `fill-word-${i * 100 + 7}`);
        }

        allFillModes.forEach((mode) => {
          const practiceNum = parseInt(mode.split("-")[2], 10);
          if (!practiceNum) return;

          const completedSet = completedWordsByGameMode[mode] || new Set();
          let progress: Progress = { completed: 0, total: 0 };

          if (practiceNum % 100 === 1) {
            progress = { completed: completedSet.size, total: userVocabulary.length };
          } else if (practiceNum % 100 === 2) {
            const totalQs = userVocabulary.filter((word) => exampleData.some((ex) => new RegExp(`\\b${word}\\b`, "i").test(ex.english)));
            const completed = totalQs.filter((word) => completedSet.has(word.toLowerCase())).length;
            progress = { completed: completed, total: totalQs.length };
          } else { // Handles 3, 4, 5, 6, 7
            let requiredWordCount = 0;
            if (practiceNum % 100 >= 3 && practiceNum % 100 <= 6) {
              requiredWordCount = (practiceNum % 100) - 1; // P3 -> 2 words, P4 -> 3 words...
            } else if (practiceNum % 100 === 7) {
              requiredWordCount = 1; // At least 1 word
            }

            if (requiredWordCount > 0) {
              let total = 0;
              exampleData.forEach((sentence) => {
                const wordsInSentence = userVocabulary.filter((vocabWord) => new RegExp(`\\b${vocabWord}\\b`, "i").test(sentence.english));
                if (wordsInSentence.length >= requiredWordCount) {
                  total++;
                }
              });
              const gameModeId = `fill-word-${practiceNum}`;
              const completedSetMulti = completedMultiWordByGameMode[gameModeId] || new Set();
              progress = { completed: completedSetMulti.size, total: total };
            }
          }
          newProgressData[practiceNum] = progress;
        });
      }

      // 5. Trả kết quả về cho client
      return {
        progress: newProgressData,
        claimedRewards: claimedRewards,
      };
    } catch (error) {
      console.error("Lỗi khi tính toán tiến trình cho user:", uid, error);
      throw new functions.https.HttpsError(
        "internal",
        "Đã có lỗi xảy ra khi tính toán tiến trình.",
      );
    }
  });
