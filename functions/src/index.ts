// functions/src/index.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Khởi tạo Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Import dữ liệu tĩnh của bạn
// Hãy chắc chắn rằng bạn đã copy các file này vào thư mục functions/src
import { quizData } from "./quiz-data";
import { exampleData } from "./example-data";

// Định nghĩa một Callable Function
export const calculateUserProgress = functions.https.onCall(async (data, context) => {
    // 1. Xác thực người dùng. Nếu không có auth, báo lỗi.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    const userId = context.auth.uid;
    const { selectedType } = data; // Nhận 'tracNghiem' hoặc 'dienTu' từ client

    if (!selectedType) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with a 'selectedType' argument."
        );
    }
    
    // Đặt hằng số MAX_PREVIEWS ở đây
    const MAX_PREVIEWS = 5;

    try {
        // 2. Lấy tất cả dữ liệu cần thiết từ Firestore trong một lượt
        const [
            userDocSnap,
            openedVocabSnapshot,
            completedWordsSnapshot,
            completedMultiWordSnapshot,
        ] = await Promise.all([
            db.collection("users").doc(userId).get(),
            db.collection("users").doc(userId).collection("openedVocab").get(),
            db.collection("users").doc(userId).collection("completedWords").get(),
            db.collection("users").doc(userId).collection("completedMultiWord").get(),
        ]);

        // 3. Xử lý dữ liệu thô (giống hệt logic ở client)
        const userData = userDocSnap.exists ? userDocSnap.data()! : {};
        const claimedQuizRewards = userData.claimedQuizRewards || {};
        const userVocabulary = openedVocabSnapshot.docs.map(doc => doc.data().word).filter(Boolean);

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
                if (!completedMultiWordByGameMode[mode]) {
                    completedMultiWordByGameMode[mode] = new Set();
                }
                completedMultiWordByGameMode[mode].add(docSnap.id.toLowerCase());
            }
        });

        // 4. Tính toán progressData (giống hệt logic ở client)
        const newProgressData: { [key: number]: { completed: number; total: number } } = {};

        if (selectedType === 'tracNghiem') {
            const allQuizModes = ['quiz-1', 'quiz-2', 'quiz-3'];
            for(let i = 1; i <= MAX_PREVIEWS; i++) {
                allQuizModes.push(`quiz-${i*100 + 1}`, `quiz-${i*100 + 2}`, `quiz-${i*100 + 3}`);
            }

            allQuizModes.forEach(mode => {
                const practiceNum = parseInt(mode.split('-')[1]);
                if (!practiceNum) return;

                const completedSet = completedWordsByGameMode[mode] || new Set();

                if (practiceNum % 100 === 1) {
                    const totalQs = quizData.filter(q => userVocabulary.some(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question)));
                    const completed = totalQs.filter(q => {
                        const word = userVocabulary.find(v => new RegExp(`\\b${v}\\b`, 'i').test(q.question));
                        return word && completedSet.has(word.toLowerCase());
                    }).length;
                    newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
                } else if (practiceNum % 100 === 2 || practiceNum % 100 === 3) {
                    const totalQs = userVocabulary.flatMap(word => exampleData.some(ex => new RegExp(`\\b${word}\\b`, 'i').test(ex.english)) ? [{ word }] : []);
                    const completed = totalQs.filter(q => completedSet.has(q.word.toLowerCase())).length;
                    newProgressData[practiceNum] = { completed: completed, total: totalQs.length };
                }
            });

        } else if (selectedType === 'dienTu') {
            const allFillModes = ['fill-word-1', 'fill-word-2', 'fill-word-3', 'fill-word-4', 'fill-word-5', 'fill-word-6', 'fill-word-7'];
            for(let i = 1; i <= MAX_PREVIEWS; i++) {
                 allFillModes.push(`fill-word-${i*100 + 1}`, `fill-word-${i*100 + 2}`, `fill-word-${i*100 + 3}`, `fill-word-${i*100 + 4}`, `fill-word-${i*100 + 5}`, `fill-word-${i*100 + 6}`, `fill-word-${i*100 + 7}`);
            }

            allFillModes.forEach(mode => {
                const practiceNum = parseInt(mode.split('-')[2]);
                if(!practiceNum) return;

                const completedSet = completedWordsByGameMode[mode] || new Set();
                let progress: { completed: number; total: number } = { completed: 0, total: 0 };

                if (practiceNum % 100 === 1) {
                    progress = { completed: completedSet.size, total: userVocabulary.length };
                } else if (practiceNum % 100 === 2) {
                    const totalQs = userVocabulary.filter(word => exampleData.some(ex => new RegExp(`\\b${word}\\b`, 'i').test(ex.english)));
                    const completed = totalQs.filter(word => completedSet.has(word.toLowerCase())).length;
                    progress = { completed: completed, total: totalQs.length };
                } else if ([3, 4, 5, 6, 7].includes(practiceNum % 100)) {
                    const minWordsInSentence = (practiceNum % 100) - 2; // P3 -> 1, P4 -> 2... Wait, logic is different
                    let requiredWords = 0;
                    if(practiceNum % 100 === 7) requiredWords = 1; // Special case for P7
                    else requiredWords = (practiceNum % 100) - 1; // P3->2, P4->3, P5->4, P6->5

                    let total = 0;
                    exampleData.forEach(sentence => {
                        const wordsInSentence = userVocabulary.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                        if (wordsInSentence.length >= requiredWords) total++;
                    });

                    const gameModeId = `fill-word-${practiceNum}`;
                    const completedSetForMode = completedMultiWordByGameMode[gameModeId] || new Set();
                    progress = { completed: completedSetForMode.size, total: total };
                }
                newProgressData[practiceNum] = progress;
            });
        }

        // 5. Trả về kết quả cho client
        return {
            progressData: newProgressData,
            claimedQuizRewards: claimedQuizRewards,
        };

    } catch (error) {
        console.error("Error calculating progress:", error);
        throw new functions.https.HttpsError(
            "internal",
            "An error occurred while calculating progress.",
            error
        );
    }
});
