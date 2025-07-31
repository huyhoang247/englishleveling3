// --- START OF FILE: functions/src/index.ts ---

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Khởi tạo Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Import các file dữ liệu từ local.
// Đảm bảo các file này đã được copy vào thư mục functions/src/
import { quizData } from "./quiz-data";
import { exampleData } from "./example-data";
import { defaultVocabulary } from "./list-vocabulary";
import { detailedMeaningsText } from './vocabulary-definitions';

// --- HELPER FUNCTIONS ---

const shuffleArray = <T extends any[]>(array: T): T => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray as T;
};

const createWordRegex = (word: string) => new RegExp(`\\b${word}\\b`, 'i');

// --- INTERFACES ---

interface Progress {
  completed: number;
  total: number;
}
interface ProgressData {
  [key: number]: Progress;
}

// --- CLOUD FUNCTION 1: Lấy tiến độ học tập ---

export const getPracticeProgress = functions
  .region("asia-southeast1") // Chọn region gần bạn để có độ trễ thấp
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Yêu cầu xác thực người dùng.");
    }
    const uid = context.auth.uid;
    const { selectedType } = data;

    if (selectedType !== "tracNghiem" && selectedType !== "dienTu") {
      throw new functions.https.HttpsError("invalid-argument", "selectedType không hợp lệ.");
    }

    try {
      // Fetch dữ liệu từ Firestore
      const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
        db.doc(`users/${uid}`).get(),
        db.collection(`users/${uid}/openedVocab`).get(),
        db.collection(`users/${uid}/completedWords`).get(),
        db.collection(`users/${uid}/completedMultiWord`).get(),
      ]);

      const userData = userDocSnap.exists ? userDocSnap.data()! : {};
      const claimedRewards = userData.claimedQuizRewards || {};
      const userVocabulary: string[] = openedVocabSnapshot.docs.map(doc => doc.data().word).filter(Boolean);

      const completedWordsByGameMode: { [key: string]: Set<string> } = {};
      completedWordsSnapshot.forEach(doc => {
        const gameModes = doc.data().gameModes;
        if (gameModes) {
          for (const mode in gameModes) {
            if (!completedWordsByGameMode[mode]) completedWordsByGameMode[mode] = new Set();
            completedWordsByGameMode[mode].add(doc.id.toLowerCase());
          }
        }
      });

      const completedMultiWordByGameMode: { [key: string]: Set<string> } = {};
      completedMultiWordSnapshot.forEach(docSnap => {
        const completedIn = docSnap.data().completedIn || {};
        for (const mode in completedIn) {
          if (!completedMultiWordByGameMode[mode]) completedMultiWordByGameMode[mode] = new Set();
          completedMultiWordByGameMode[mode].add(docSnap.id.toLowerCase());
        }
      });

      // Xử lý logic tính toán
      const newProgressData: ProgressData = {};
      const MAX_PREVIEWS = 5;

      // Pre-calculate which example sentences contain which user words for efficiency
      const sentenceWordMap = new Map<string, string[]>();
      exampleData.forEach((sentence) => {
          const wordsInSentence = userVocabulary.filter(vocabWord => createWordRegex(vocabWord).test(sentence.english));
          if (wordsInSentence.length > 0) {
               sentenceWordMap.set(sentence.english, wordsInSentence);
          }
      });
      const userWordsInExample = new Set(Array.from(sentenceWordMap.values()).flat());

      if (selectedType === "tracNghiem") {
        const allQuizModes: string[] = [];
        ["quiz-1", "quiz-2", "quiz-3"].forEach(m => allQuizModes.push(m));
        for (let i = 1; i <= MAX_PREVIEWS; i++) {
          allQuizModes.push(`quiz-${i * 100 + 1}`, `quiz-${i * 100 + 2}`, `quiz-${i * 100 + 3}`);
        }

        allQuizModes.forEach(mode => {
          const practiceNum = parseInt(mode.split("-")[1]);
          if (!practiceNum) return;

          const completedSet = completedWordsByGameMode[mode] || new Set();

          if (practiceNum % 100 === 1) {
            const totalQs = quizData.filter(q => userVocabulary.some(v => createWordRegex(v).test(q.question)));
            const completed = totalQs.filter(q => {
              const word = userVocabulary.find(v => createWordRegex(v).test(q.question));
              return word && completedSet.has(word.toLowerCase());
            }).length;
            newProgressData[practiceNum] = { completed, total: totalQs.length };
          } else if (practiceNum % 100 === 2 || practiceNum % 100 === 3) {
            const totalQs = userVocabulary.filter(word => userWordsInExample.has(word));
            const completed = totalQs.filter(q_word => completedSet.has(q_word.toLowerCase())).length;
            newProgressData[practiceNum] = { completed, total: totalQs.length };
          }
        });
      } else if (selectedType === "dienTu") {
        const allFillModes: string[] = [];
        for (let i = 1; i <= 7; i++) allFillModes.push(`fill-word-${i}`);
        for (let i = 1; i <= MAX_PREVIEWS; i++) {
          for (let j = 1; j <= 7; j++) allFillModes.push(`fill-word-${i * 100 + j}`);
        }

        allFillModes.forEach(mode => {
          const practiceNum = parseInt(mode.split("-")[2]);
          if (!practiceNum) return;

          const practiceType = practiceNum % 100;
          let progress: Progress = { completed: 0, total: 0 };
          
          if (practiceType === 1 || practiceType === 2) {
            const completedSet = completedWordsByGameMode[mode] || new Set();
            if (practiceType === 1) {
              progress = { completed: completedSet.size, total: userVocabulary.length };
            } else { // practiceType === 2
              const totalP2 = userVocabulary.filter(word => userWordsInExample.has(word));
              const completedP2 = totalP2.filter(word => completedSet.has(word.toLowerCase())).length;
              progress = { completed: completedP2, total: totalP2.length };
            }
          } else { // practiceType 3, 4, 5, 6, 7
            const completedSet = completedMultiWordByGameMode[mode] || new Set();
            const requiredWords = practiceType >= 3 && practiceType <= 6 ? practiceType - 1 : 1;
            let total = 0;
            sentenceWordMap.forEach(wordsInSentence => {
              if (wordsInSentence.length >= requiredWords) total++;
            });
            progress = { completed: completedSet.size, total };
          }
          newProgressData[practiceNum] = progress;
        });
      }

      return { progressData: newProgressData, claimedRewards };
    } catch (error) {
      console.error("Lỗi trong getPracticeProgress function: ", error);
      throw new functions.https.HttpsError("internal", "Lỗi server khi lấy tiến trình.", error);
    }
  });

// --- CLOUD FUNCTION 2: Lấy dữ liệu phiên chơi game ---

export const getGameSessionData = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Yêu cầu xác thực người dùng.");
    }
    const uid = context.auth.uid;
    const { selectedPractice, gameType } = data; // gameType: 'quiz' or 'fill-word'

    if (!selectedPractice || !gameType) {
        throw new functions.https.HttpsError("invalid-argument", "selectedPractice và gameType là bắt buộc.");
    }
    
    try {
        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
            db.doc(`users/${uid}`).get(),
            db.collection(`users/${uid}/openedVocab`).get(),
            db.collection(`users/${uid}/completedWords`).get(),
            db.collection(`users/${uid}/completedMultiWord`).get(),
        ]);

        const userData = userDocSnap.exists ? userDocSnap.data()! : {};
        const userVocabulary: string[] = openedVocabSnapshot.docs.map(doc => doc.data().word).filter(Boolean);
        
        let questions: any[] = [];
        let completedItems = new Set<string>();
        const gameModeId = `${gameType}-${selectedPractice}`;

        if (gameType === 'quiz') {
            completedWordsSnapshot.forEach(doc => {
                if(doc.data().gameModes?.[gameModeId]) completedItems.add(doc.id.toLowerCase());
            });
            
            const practiceBaseId = selectedPractice % 100;
            if (practiceBaseId === 1) {
                const allMatching = quizData.filter(q => userVocabulary.some(v => createWordRegex(v).test(q.question)));
                const remaining = allMatching.filter(q => {
                    const word = userVocabulary.find(v => createWordRegex(v).test(q.question));
                    return word ? !completedItems.has(word.toLowerCase()) : true;
                });
                questions = shuffleArray(remaining);
            } else { // Practice 2 & 3
                const allPossible = userVocabulary.flatMap(word => {
                    const wordRegex = createWordRegex(word);
                    const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                    if (matchingSentences.length > 0) {
                        const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                        const questionText = randomSentence.english.replace(wordRegex, '___');
                        const incorrectOptions: string[] = [];
                        const lowerCaseCorrectWord = word.toLowerCase();
                        while (incorrectOptions.length < 3) {
                            const randomWord = defaultVocabulary[Math.floor(Math.random() * defaultVocabulary.length)];
                            if (randomWord.toLowerCase() !== lowerCaseCorrectWord && !incorrectOptions.some(opt => opt.toLowerCase() === randomWord.toLowerCase())) {
                                incorrectOptions.push(randomWord);
                            }
                        }
                        return [{ question: questionText, vietnamese: randomSentence.vietnamese, options: [word.toLowerCase(), ...incorrectOptions.map(opt => opt.toLowerCase())], correctAnswer: word.toLowerCase(), word: word, }];
                    }
                    return [];
                });
                const remaining = allPossible.filter(q => !completedItems.has(q.word.toLowerCase()));
                questions = shuffleArray(remaining);
            }

        } else if (gameType === 'fill-word') {
             const practiceBaseId = selectedPractice % 100;
             const isMultiWordGame = [3, 4, 5, 6, 7].includes(practiceBaseId);

            if (isMultiWordGame) {
                 completedMultiWordSnapshot.forEach(doc => {
                    if(doc.data().completedIn?.[gameModeId]) completedItems.add(doc.id.toLowerCase());
                 });
            } else {
                 completedWordsSnapshot.forEach(doc => {
                    if(doc.data().gameModes?.[gameModeId]) completedItems.add(doc.id.toLowerCase());
                 });
            }
            
            let gameVocabulary: any[] = [];
            // This logic is directly from your fill-word-home.tsx, now running on the server
            if (practiceBaseId === 1) {
                openedVocabSnapshot.forEach((vocabDoc) => {
                    const data = vocabDoc.data(); const imageIndex = Number(vocabDoc.id);
                    if (data.word && !isNaN(imageIndex)) { gameVocabulary.push({ word: data.word, hint: `Nghĩa của từ "${data.word}"`, imageIndex: imageIndex }); }
                });
            } else if (practiceBaseId === 2) {
                userVocabulary.forEach(word => {
                    const wordRegex = createWordRegex(word);
                    const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                    if (matchingSentences.length > 0) {
                        const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                        gameVocabulary.push({ word: word, question: randomSentence.english.replace(wordRegex, '___'), vietnameseHint: randomSentence.vietnamese, hint: `Điền từ còn thiếu. Gợi ý: ${randomSentence.vietnamese}` });
                    }
                });
            } else if (practiceBaseId >= 3 && practiceBaseId <= 7) {
                 const requiredWords = practiceBaseId >= 3 && practiceBaseId <= 6 ? practiceBaseId - 1 : 1;
                 exampleData.forEach(sentence => {
                    const wordsInSentence = userVocabulary.filter(vocabWord => createWordRegex(vocabWord).test(sentence.english));
                    
                    if (practiceBaseId < 7 && wordsInSentence.length >= requiredWords) {
                        const wordsToHideShuffled = shuffleArray(wordsInSentence).slice(0, requiredWords);
                        const correctlyOrderedWords = wordsToHideShuffled.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()) );
                        let questionText = sentence.english;
                        correctlyOrderedWords.forEach(word => {
                            questionText = questionText.replace(createWordRegex(word), '___');
                        });
                        gameVocabulary.push({ word: correctlyOrderedWords.join(' '), question: questionText, vietnameseHint: sentence.vietnamese, hint: `Điền ${requiredWords} từ còn thiếu. Gợi ý: ${sentence.vietnamese}` });
                    } else if (practiceBaseId === 7 && wordsInSentence.length >= 1) {
                        const correctlyOrderedWords = wordsInSentence.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()));
                        const wordsToHideRegex = new RegExp(`\\b(${correctlyOrderedWords.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
                        const questionText = sentence.english.replace(wordsToHideRegex, '___');
                        const answerKey = correctlyOrderedWords.join(' ');
                        gameVocabulary.push({ word: answerKey, question: questionText, vietnameseHint: sentence.vietnamese, hint: `Điền ${correctlyOrderedWords.length} từ còn thiếu. Gợi ý: ${sentence.vietnamese}` });
                    }
                });
            }
            const unusedWords = gameVocabulary.filter(item => !completedItems.has(item.word.toLowerCase()));
            questions = shuffleArray(unusedWords);
        }

        return {
            questions, // The shuffled, filtered list of questions for the game
            coins: userData.coins || 0,
            masteryCount: userData.masteryCards || 0,
            definitionsMap: gameType === 'quiz' ? (() => {
                const definitions: { [key: string]: any } = {};
                const lines = detailedMeaningsText.trim().split('\n');
                lines.forEach(line => {
                    if (line.trim() === '') return;
                    const match = line.match(/^(.+?)\s+\((.+?)\)\s+là\s+(.*)/);
                    if (match) {
                        const vietnameseWord = match[1].trim(); const englishWord = match[2].trim(); const explanation = match[3].trim();
                        definitions[englishWord.toLowerCase()] = { vietnamese: vietnameseWord, english: englishWord, explanation: explanation, };
                    }
                });
                return definitions;
            })() : null,
        };

    } catch(error) {
        console.error("Lỗi trong getGameSessionData function: ", error);
        throw new functions.https.HttpsError("internal", "Lỗi server khi lấy dữ liệu game.", error);
    }
});
// --- END OF FILE: functions/src/index.ts ---
