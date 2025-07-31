// functions/src/index.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Import dữ liệu tĩnh từ local
import {quizData} from "./quiz-data.ts";
import {exampleData} from "./example-data.ts";

admin.initializeApp();
const db = admin.firestore();

// ========================================================================
// ==                          CORE LOGIC                                ==
// ========================================================================

async function getProgressCalculationData(userId: string) {
  const [
    openedVocabSnapshot,
    completedWordsSnapshot,
    completedMultiWordSnapshot,
  ] = await Promise.all([
    db.collection("users").doc(userId).collection("openedVocab").get(),
    db.collection("users").doc(userId).collection("completedWords").get(),
    db.collection("users").doc(userId).collection("completedMultiWord").get(),
  ]);

  const userVocabularySet = new Set<string>(
    openedVocabSnapshot.docs.map((doc) => doc.data().word?.toLowerCase()).filter(Boolean)
  );
  
  const userVocabularyArray = Array.from(userVocabularySet);

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

  return {
    userVocabularySet,
    userVocabularyArray,
    completedWordsByGameMode,
    completedMultiWordByGameMode,
  };
}

async function performRecalculation(userId: string) {
  const {
    userVocabularyArray,
    completedWordsByGameMode,
    completedMultiWordByGameMode,
  } = await getProgressCalculationData(userId);

  const summary = {
    tracNghiem: {} as any,
    dienTu: {} as any,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  };

  const MAX_PREVIEWS = 5;

  // --- Tính toán cho Trắc Nghiệm ---
  const allQuizModes = ["quiz-1", "quiz-2", "quiz-3"];
  for (let i = 1; i <= MAX_PREVIEWS; i++) {
    allQuizModes.push(`quiz-${i * 100 + 1}`, `quiz-${i * 100 + 2}`, `quiz-${i * 100 + 3}`);
  }
  
  allQuizModes.forEach((mode) => {
    const practiceNum = parseInt(mode.split("-")[1], 10);
    if (!practiceNum) return;

    const completedSet = completedWordsByGameMode[mode] || new Set();
    let progress = {completed: 0, total: 0};

    if (practiceNum % 100 === 1) {
      const totalQs = quizData.filter((q) =>
        userVocabularyArray.some((v) => new RegExp(`\\b${v}\\b`, "i").test(q.question))
      );
      const completed = totalQs.filter((q) => {
        const word = userVocabularyArray.find((v) => new RegExp(`\\b${v}\\b`, "i").test(q.question));
        return word && completedSet.has(word.toLowerCase());
      }).length;
      progress = {completed, total: totalQs.length};
    } else if (practiceNum % 100 === 2 || practiceNum % 100 === 3) {
      const totalQs = userVocabularyArray.filter((word) =>
        exampleData.some((ex) => new RegExp(`\\b${word}\\b`, "i").test(ex.english))
      );
      const completed = totalQs.filter((qWord) => completedSet.has(qWord.toLowerCase())).length;
      progress = {completed, total: totalQs.length};
    }
    summary.tracNghiem[practiceNum] = progress;
  });

  // --- Tính toán cho Điền Từ ---
  const allFillModes = ["fill-word-1", "fill-word-2", "fill-word-3", "fill-word-4", "fill-word-5", "fill-word-6", "fill-word-7"];
   for (let i = 1; i <= MAX_PREVIEWS; i++) {
    allFillModes.push(...[1, 2, 3, 4, 5, 6, 7].map((p) => `fill-word-${i * 100 + p}`));
   }
  
  allFillModes.forEach((mode) => {
    const practiceNum = parseInt(mode.split("-")[2], 10);
    if (!practiceNum) return;
    
    const singleWordCompletedSet = completedWordsByGameMode[mode] || new Set();
    const multiWordCompletedSet = completedMultiWordByGameMode[mode] || new Set();
    let progress = {completed: 0, total: 0};

    switch (practiceNum % 100) {
      case 1:
        progress = {completed: singleWordCompletedSet.size, total: userVocabularyArray.length};
        break;
      case 2: {
        const total = userVocabularyArray.filter((word) =>
          exampleData.some((ex) => new RegExp(`\\b${word}\\b`, "i").test(ex.english))
        ).length;
        const completed = userVocabularyArray.filter((word) =>
          singleWordCompletedSet.has(word.toLowerCase())
        ).length;
        progress = {completed, total};
        break;
      }
      case 3:
      case 4:
      case 5:
      case 6: {
        const requiredWords = (practiceNum % 100) - 1; // 3->2, 4->3, etc.
        let total = 0;
        exampleData.forEach((sentence) => {
          const wordsInSentence = userVocabularyArray.filter((vocabWord) =>
            new RegExp(`\\b${vocabWord}\\b`, "i").test(sentence.english)
          );
          if (wordsInSentence.length >= requiredWords) total++;
        });
        progress = {completed: multiWordCompletedSet.size, total};
        break;
      }
      case 7: {
        let total = 0;
        exampleData.forEach((sentence) => {
          const wordsInSentence = userVocabularyArray.filter((vocabWord) =>
            new RegExp(`\\b${vocabWord}\\b`, "i").test(sentence.english)
          );
          if (wordsInSentence.length >= 1) total++;
        });
        progress = {completed: multiWordCompletedSet.size, total};
        break;
      }
    }
     summary.dienTu[practiceNum] = progress;
  });

  // Ghi kết quả vào Firestore
  const summaryRef = db.doc(`users/${userId}/progress/summary`);
  await summaryRef.set(summary, {merge: true});
  // Ghi log vào Cloud Functions logs, không phải console của trình duyệt
  functions.logger.info(`Progress summary updated for user ${userId}`);
}


// ========================================================================
// ==                          TRIGGERS                                  ==
// ========================================================================

const triggerOptions = {
    region: "asia-southeast1", // Chọn region gần bạn nhất
    memory: "256MB" as const,
    timeoutSeconds: 60,
};

// Trigger khi người dùng học từ mới (ảnh hưởng đến 'total')
export const onVocabOpened = functions
  .region(triggerOptions.region)
  .runWith({memory: triggerOptions.memory, timeoutSeconds: triggerOptions.timeoutSeconds})
  .firestore.document("users/{userId}/openedVocab/{docId}")
  .onWrite(async (change, context) => {
    const {userId} = context.params;
    await performRecalculation(userId);
  });

// Trigger khi người dùng hoàn thành từ (ảnh hưởng đến 'completed')
export const onWordCompleted = functions
  .region(triggerOptions.region)
  .runWith({memory: triggerOptions.memory, timeoutSeconds: triggerOptions.timeoutSeconds})
  .firestore.document("users/{userId}/completedWords/{docId}")
  .onWrite(async (change, context) => {
    const {userId} = context.params;
    await performRecalculation(userId);
  });

// Trigger khi người dùng hoàn thành câu nhiều từ (ảnh hưởng đến 'completed')
export const onMultiWordCompleted = functions
  .region(triggerOptions.region)
  .runWith({memory: triggerOptions.memory, timeoutSeconds: triggerOptions.timeoutSeconds})
  .firestore.document("users/{userId}/completedMultiWord/{docId}")
  .onWrite(async (change, context) => {
    const {userId} = context.params;
    await performRecalculation(userId);
  });

// ========================================================================
// ==                    CALLABLE FUNCTION (Thủ công)                    ==
// ========================================================================

export const generateInitialSummary = functions
  .region(triggerOptions.region)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Bạn phải đăng nhập để thực hiện.");
    }
    const userId = context.auth.uid;
    try {
      await performRecalculation(userId);
      return {success: true, message: "Đã tạo/cập nhật bản tóm tắt tiến độ."};
    } catch (error) {
      functions.logger.error(`Error generating summary for user ${userId}`, error);
      throw new functions.https.HttpsError("internal", "Đã có lỗi xảy ra khi tính toán tiến độ.");
    }
  });
