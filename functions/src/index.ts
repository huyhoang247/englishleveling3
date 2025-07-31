// File: functions/src/index.ts (FINAL CORRECTED VERSION)

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { CallableContext } from "firebase-functions/v1/https";

// --- CORRECTED IMPORTS ---
// quizData is a default export
import quizData from "./quiz-data"; 
// exampleData is a named export
import { exampleData } from "./example-data"; 

admin.initializeApp();
const db = admin.firestore();

// --- INTERFACE DEFINITIONS ---
interface QuizItem {
  question: string;
}

interface ExampleItem {
  english: string;
}

interface Progress {
  completed: number;
  total: number;
}

interface ProgressData {
  [key: number]: Progress;
}

const MAX_PREVIEWS = 5;

// onCall function definition
export const calculatePracticeProgress = functions
  .region("asia-southeast1") 
  .https.onCall(async (data: any, context: CallableContext) => {
    // 1. Authenticate user
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "This function must be called while authenticated.",
      );
    }
    const { uid } = context.auth;
    const { selectedType } = data;

    // 2. Validate input
    if (!selectedType || !["tracNghiem", "dienTu"].includes(selectedType)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid 'selectedType' must be provided.",
      );
    }

    try {
      // 3. Fetch all necessary user data from Firestore in parallel
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
      
      // --- CORRECTED `exists` PROPERTY ACCESS ---
      // `exists` is a boolean property, not a function, in the Admin SDK
      const userData = userDocSnap.exists ? userDocSnap.data() : {};

      // This is now safe because userData is always an object
      const claimedRewards = userData?.claimedQuizRewards || {};

      const userVocabulary: string[] = openedVocabSnapshot.docs
        .map((doc) => doc.data().word)
        .filter(Boolean);

      // Process completed data into Sets for faster lookups
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

      // 4. Calculate progress based on the logic
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
            const totalQs = quizData.filter((q: QuizItem) => userVocabulary.some((v: string) => new RegExp(`\\b${v}\\b`, "i").test(q.question)));
            const completed = totalQs.filter((q: QuizItem) => {
              const word = userVocabulary.find((v: string) => new RegExp(`\\b${v}\\b`, "i").test(q.question));
              return word && completedSet.has(word.toLowerCase());
            }).length;
            newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
          } else if (practiceNum % 100 === 2 || practiceNum % 100 === 3) {
            const totalQs = userVocabulary.flatMap((word: string) => exampleData.some((ex: ExampleItem) => new RegExp(`\\b${word}\\b`, "i").test(ex.english)) ? [{ word }] : []);
            const completed = totalQs.filter((q: { word: string }) => completedSet.has(q.word.toLowerCase())).length;
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
            const totalQs = userVocabulary.filter((word: string) => exampleData.some((ex: ExampleItem) => new RegExp(`\\b${word}\\b`, "i").test(ex.english)));
            const completed = totalQs.filter((word: string) => completedSet.has(word.toLowerCase())).length;
            progress = { completed: completed, total: totalQs.length };
          } else { 
            let requiredWordCount = 0;
            if (practiceNum % 100 >= 3 && practiceNum % 100 <= 6) {
              requiredWordCount = (practiceNum % 100) - 1; 
            } else if (practiceNum % 100 === 7) {
              requiredWordCount = 1;
            }

            if (requiredWordCount > 0) {
              let total = 0;
              exampleData.forEach((sentence: ExampleItem) => {
                const wordsInSentence = userVocabulary.filter((vocabWord: string) => new RegExp(`\\b${vocabWord}\\b`, "i").test(sentence.english));
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

      // 5. Return the result to the client
      return {
        progress: newProgressData,
        claimedRewards: claimedRewards,
      };
    } catch (error) {
      console.error("Error calculating progress for user:", uid, error);
      throw new functions.https.HttpsError(
        "internal",
        "An error occurred while calculating progress.",
      );
    }
  });
