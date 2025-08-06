// --- START OF FILE: fill-word-home.tsx ---

import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { db, auth } from '../firebase.js';
import { doc, getDoc, getDocs, updateDoc, collection, writeBatch, setDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { defaultImageUrls } from '../image-url.ts';
import { exampleData } from '../example-data.ts';
import { phraseData } from '../phrase-data.ts';

import WordSquaresInput from './vocabulary-input.tsx';
import Confetti from './chuc-mung.tsx';
import CoinDisplay from '../coin-display.tsx';
import ImageCarousel3D from './image-carousel-3d.tsx';
import VirtualKeyboard from './keyboard.tsx';

// --- INTERFACES ---
interface VocabularyItem {
  word: string;
  hint: string;
  imageIndex?: number;
  question?: string;
  vietnameseHint?: string;
}
interface PhrasePart {
  english: string;
  vietnamese: string;
}
interface VocabularyGameProps {
  onGoBack: () => void;
  selectedPractice: number;
}

// --- ICONS & STATIC COMPONENTS ---
const streakIconUrls = { default: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire.png', streak1: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(2).png', streak5: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(1).png', streak10: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(3).png', streak20: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/fire%20(4).png',};
const getStreakIconUrl = (streak: number) => { if (streak >= 20) return streakIconUrls.streak20; if (streak >= 10) return streakIconUrls.streak10; if (streak >= 5) return streakIconUrls.streak5; if (streak >= 1) return streakIconUrls.streak1; return streakIconUrls.default; };
const StreakDisplay: React.FC<{ displayedStreak: number; isAnimating: boolean; }> = memo(({ displayedStreak, isAnimating }) => ( <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-orange-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer ${isAnimating ? 'scale-110' : 'scale-100'}`}> <style jsx>{`@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .animate-pulse-fast { animation: pulse-fast 1s infinite; }`}</style> <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> <div className="relative flex items-center justify-center"><img src={getStreakIconUrl(displayedStreak)} alt="Streak Icon" className="w-4 h-4" /></div> <div className="font-bold text-gray-800 text-xs tracking-wide streak-counter ml-1">{displayedStreak}</div> <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div> <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse-fast"></div> </div> ));
const masteryIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000519861fbacd28634e7b5372b%20(1).png';
const MasteryDisplay: React.FC<{ masteryCount: number; }> = memo(({ masteryCount }) => ( <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg px-3 py-0.5 flex items-center justify-center shadow-md border border-purple-400 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"> <style jsx>{`@keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .animate-pulse-fast { animation: pulse-fast 1s infinite; }`}</style> <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000"></div> <div className="relative flex items-center justify-center"><img src={masteryIconUrl} alt="Mastery Icon" className="w-4 h-4" /></div> <div className="font-bold text-gray-800 text-xs tracking-wide ml-1">{masteryCount}</div> <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full animate-pulse-fast"></div> <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse-fast"></div> </div> ));
const CountdownTimer: React.FC<{ timeLeft: number; totalTime: number }> = memo(({ timeLeft, totalTime }) => { const radius = 20; const circumference = 2 * Math.PI * radius; const progress = Math.max(0, timeLeft / totalTime); const strokeDashoffset = circumference * (1 - progress); const getTimeColor = () => { if (timeLeft <= 0) return 'text-gray-400'; if (timeLeft <= 10) return 'text-red-500'; if (timeLeft <= 20) return 'text-yellow-500'; return 'text-indigo-400'; }; const ringColorClass = getTimeColor(); return ( <div className="relative flex items-center justify-center w-8 h-8"> <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 44 44"> <circle className="text-gray-200" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="22" cy="22" /> <circle className={`${ringColorClass} transition-all duration-500`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="transparent" r={radius} cx="22" cy="22" style={{ strokeDasharray: circumference, strokeDashoffset }} /> </svg> <span className={`font-bold text-xs ${ringColorClass}`}>{Math.max(0, timeLeft)}</span> </div> ); });
const BackIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /> </svg> );
const RefreshIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-2.646 0-5.13-.999-7.03-2.768m0 0L3 16m-1.97 2.232L5 21"></path><path d="M3 12a9 9 0 0 1 9-9c-2.646 0 5.13.999 7.03 2.768m0 0L21 8m1.97-2.232L19 3"></path></svg>);
const PhraseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg> );
const ExamIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> </svg> );

// --- HELPER FUNCTIONS ---
const shuffleArray = <T extends any[]>(array: T): T => { const shuffledArray = [...array]; for (let i = shuffledArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; } return shuffledArray as T; };
const generateImageUrl = (imageIndex?: number) => { if (imageIndex !== undefined && typeof imageIndex === 'number') { const adjustedIndex = imageIndex - 1; if (adjustedIndex >= 0 && adjustedIndex < defaultImageUrls.length) { return defaultImageUrls[adjustedIndex]; } } return `https://placehold.co/400x320/E0E7FF/4338CA?text=No+Image`; };
const capitalizeFirstLetter = (str: string) => { if (!str) return ''; return str.charAt(0).toUpperCase() + str.slice(1); };
const highlightText = (text: string, regex: RegExp) => {
  if (!text) return <span>{text}</span>;
  const parts = text.split(regex);
  return (<span>{parts.map((part, i) => regex.test(part) ? (<strong key={i} className="text-blue-500 font-semibold">{part}</strong>) : (part))}</span>);
};

// --- REUSABLE POPUP COMPONENTS ---
const HeaderTag: React.FC<{ word: string }> = ({ word }) => (
  <div className="flex items-center gap-2 mb-6">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    <span className="font-sans text-base font-bold uppercase tracking-widest text-blue-600">{word}</span>
  </div>
);

const BasePopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentWord: string;
  titlePrefix: string;
  dataSource: { english: string; vietnamese: string }[];
  noResultsMessage: string;
  isPhrase?: boolean;
}> = ({ isOpen, onClose, currentWord, titlePrefix, dataSource, noResultsMessage, isPhrase = false }) => {
  const wordsToSearch = useMemo(() => currentWord.split(' '), [currentWord]);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => { setActiveTab(0); }, [currentWord]);
  const searchWord = wordsToSearch[activeTab];

  const searchRegexForHighlight = useMemo(() => {
    if (!searchWord || !searchWord.trim()) return null;
    const escapedWord = searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(`(\\b${escapedWord}\\b)`, 'ig');
  }, [searchWord]);
  
  const searchResults = useMemo(() => {
    if (!searchWord) return [];
    const searchRegex = new RegExp(`\\b${searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return dataSource.filter(item => searchRegex.test(item.english));
  }, [searchWord, dataSource]);

  if (!isOpen) return null;
  return (
    // --- FIX: Tăng độ tối của overlay từ 60 -> 75 để làm nổi bật popup ---
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 transition-colors z-10"><span className="font-bold text-xl leading-none">×</span></button>
                <h3 className="text-xl font-bold text-gray-800">{`${titlePrefix} chứa "${capitalizeFirstLetter(searchWord)}"`}</h3>
                {wordsToSearch.length > 1 && (
                    <nav className="mt-4 -mb-6 -mx-6 px-6 border-t border-gray-200">
                        <div className="flex space-x-4">
                            {wordsToSearch.map((word, index) => (<button key={index} onClick={() => setActiveTab(index)} className={`${activeTab === index ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all`}>{capitalizeFirstLetter(word)}</button>))}
                        </div>
                    </nav>
                )}
            </div>
            <div className="flex-grow overflow-y-auto bg-white p-6">
                <div className="max-w-4xl mx-auto">
                    <HeaderTag word={searchWord.toUpperCase()} />
                    {searchResults.length > 0 && searchRegexForHighlight ? (
                        <div className="space-y-4">
                            {searchResults.map((result, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className={`text-gray-800 text-base leading-relaxed ${isPhrase ? 'font-semibold' : 'font-medium'}`}>
                                        {highlightText(result.english, searchRegexForHighlight)}
                                    </p>
                                    <p className="mt-2 text-gray-500 text-sm italic">{result.vietnamese}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-6 bg-gray-50 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            <h4 className="mt-4 text-lg font-semibold text-gray-700">{noResultsMessage}</h4>
                            <p className="mt-1 text-sm text-gray-500">Chưa có dữ liệu cho từ này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

const allPhraseParts = Array.from(
    new Map(
        phraseData.flatMap(sentence => sentence.parts).map(p => {
            const english = capitalizeFirstLetter(p.english);
            const vietnamese = capitalizeFirstLetter(p.vietnamese);
            return [english.toLowerCase(), { english, vietnamese }];
        })
    ).values()
);

const PhrasePopup: React.FC<{ isOpen: boolean; onClose: () => void; currentWord: string; }> = ({ isOpen, onClose, currentWord }) => (
  <BasePopup isOpen={isOpen} onClose={onClose} currentWord={currentWord} titlePrefix="Các cụm từ" dataSource={allPhraseParts} noResultsMessage="Không tìm thấy cụm từ" isPhrase={true} />
);

const ExamPopup: React.FC<{ isOpen: boolean; onClose: () => void; currentWord: string; }> = ({ isOpen, onClose, currentWord }) => (
  <BasePopup isOpen={isOpen} onClose={onClose} currentWord={currentWord} titlePrefix="Câu ví dụ" dataSource={exampleData} noResultsMessage="Không tìm thấy ví dụ" />
);


export default function VocabularyGame({ onGoBack, selectedPractice }: VocabularyGameProps) {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [shuffledUnusedWords, setShuffledUnusedWords] = useState<VocabularyItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showPhrasePopup, setShowPhrasePopup] = useState(false);
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [coins, setCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteryCount, setMasteryCount] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const TOTAL_TIME = 60;
  const isInitialLoadComplete = useRef(false);

  const [filledWords, setFilledWords] = useState<string[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  const isMultiWordGame = useMemo(() => [3, 4, 5, 6, 7].includes(selectedPractice % 100), [selectedPractice]);

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser)); return () => unsubscribe(); }, []);
  
  const resetMultiWordState = (wordItem: VocabularyItem | null) => {
    if (isMultiWordGame && wordItem) {
      const wordCount = wordItem.word.split(' ').length;
      setFilledWords(Array(wordCount).fill(''));
      setActiveBlankIndex(0);
    } else {
      setFilledWords([]);
      setActiveBlankIndex(null);
    }
    setUserInput('');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false); setVocabularyList([]); setCoins(0); setUsedWords(new Set()); setCurrentWord(null); setMasteryCount(0); setError("Vui lòng đăng nhập để chơi.");
        return;
      }
      try {
        setLoading(true); setError(null);

        const [userDocSnap, openedVocabSnapshot, completedWordsSnapshot, completedMultiWordSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'openedVocab')),
          getDocs(collection(db, 'users', user.uid, 'completedWords')),
          getDocs(collection(db, 'users', user.uid, 'completedMultiWord'))
        ]);

        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const fetchedCoins = userData.coins || 0;
        const fetchedMasteryCount = userData.masteryCards || 0;
        
        const gameModeId = `fill-word-${selectedPractice}`;
        const fetchedCompletedWords = new Set<string>();

        if (isMultiWordGame) {
            completedMultiWordSnapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.completedIn && data.completedIn[gameModeId]) {
                    fetchedCompletedWords.add(docSnap.id.toLowerCase());
                }
            });
        } else {
            completedWordsSnapshot.forEach((completedDoc) => {
                if (completedDoc.data()?.gameModes?.[gameModeId]) {
                  fetchedCompletedWords.add(completedDoc.id.toLowerCase());
                }
            });
        }

        let gameVocabulary: VocabularyItem[] = [];
        const userVocabularyWords: string[] = [];
        openedVocabSnapshot.forEach((vocabDoc) => {
            const data = vocabDoc.data();
            if (data.word) userVocabularyWords.push(data.word);
        });

        if (selectedPractice === 1 || selectedPractice === 101) {
            openedVocabSnapshot.forEach((vocabDoc) => {
                const data = vocabDoc.data(); const imageIndex = Number(vocabDoc.id);
                if (data.word && !isNaN(imageIndex)) { gameVocabulary.push({ word: data.word, hint: `Nghĩa của từ "${data.word}"`, imageIndex: imageIndex }); }
            });
        } else if (selectedPractice === 2 || selectedPractice === 102) {
            userVocabularyWords.forEach(word => {
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                const matchingSentences = exampleData.filter(ex => wordRegex.test(ex.english));
                if (matchingSentences.length > 0) {
                    const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
                    gameVocabulary.push({ word: word, question: randomSentence.english.replace(wordRegex, '___'), vietnameseHint: randomSentence.vietnamese, hint: `Điền từ còn thiếu. Gợi ý: ${randomSentence.vietnamese}` });
                }
            });
        } else if (selectedPractice === 3 || selectedPractice === 103) {
            exampleData.forEach(sentence => {
                const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                if (wordsInSentence.length >= 2) {
                    const wordsToHideShuffled = shuffleArray(wordsInSentence).slice(0, 2);
                    const correctlyOrderedWords = wordsToHideShuffled.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()) );
                    const [word1, word2] = correctlyOrderedWords;
                    let questionText = sentence.english;
                    questionText = questionText.replace(new RegExp(`\\b${word1}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word2}\\b`, 'i'), '___');
                    gameVocabulary.push({ word: `${word1} ${word2}`, question: questionText, vietnameseHint: sentence.vietnamese, hint: `Điền 2 từ còn thiếu. Gợi ý: ${sentence.vietnamese}` });
                }
            });
        } else if (selectedPractice === 4 || selectedPractice === 104) {
             exampleData.forEach(sentence => {
                const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                if (wordsInSentence.length >= 3) {
                    const wordsToHideShuffled = shuffleArray(wordsInSentence).slice(0, 3);
                    const correctlyOrderedWords = wordsToHideShuffled.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()) );
                    const [word1, word2, word3] = correctlyOrderedWords;
                    let questionText = sentence.english;
                    questionText = questionText.replace(new RegExp(`\\b${word1}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word2}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word3}\\b`, 'i'), '___');
                    gameVocabulary.push({ word: `${word1} ${word2} ${word3}`, question: questionText, vietnameseHint: sentence.vietnamese, hint: `Điền 3 từ còn thiếu. Gợi ý: ${sentence.vietnamese}` });
                }
            });
        } else if (selectedPractice === 5 || selectedPractice === 105) {
             exampleData.forEach(sentence => {
                const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                if (wordsInSentence.length >= 4) {
                    const wordsToHideShuffled = shuffleArray(wordsInSentence).slice(0, 4);
                    const correctlyOrderedWords = wordsToHideShuffled.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()) );
                    const [word1, word2, word3, word4] = correctlyOrderedWords;
                    let questionText = sentence.english;
                    questionText = questionText.replace(new RegExp(`\\b${word1}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word2}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word3}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word4}\\b`, 'i'), '___');
                    gameVocabulary.push({ word: `${word1} ${word2} ${word3} ${word4}`, question: questionText, vietnameseHint: sentence.vietnamese, hint: `Điền 4 từ còn thiếu. Gợi ý: ${sentence.vietnamese}` });
                }
            });
        } else if (selectedPractice === 6 || selectedPractice === 106) {
             exampleData.forEach(sentence => {
                const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                if (wordsInSentence.length >= 5) {
                    const wordsToHideShuffled = shuffleArray(wordsInSentence).slice(0, 5);
                    const correctlyOrderedWords = wordsToHideShuffled.sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()) );
                    const [word1, word2, word3, word4, word5] = correctlyOrderedWords;
                    let questionText = sentence.english;
                    questionText = questionText.replace(new RegExp(`\\b${word1}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word2}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word3}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word4}\\b`, 'i'), '___');
                    questionText = questionText.replace(new RegExp(`\\b${word5}\\b`, 'i'), '___');
                    gameVocabulary.push({ word: `${word1} ${word2} ${word3} ${word4} ${word5}`, question: questionText, vietnameseHint: sentence.vietnamese, hint: `Điền 5 từ còn thiếu. Gợi ý: ${sentence.vietnamese}` });
                }
            });
        } else if (selectedPractice % 100 === 7) {
             exampleData.forEach(sentence => {
                const wordsInSentence = userVocabularyWords.filter(vocabWord => new RegExp(`\\b${vocabWord}\\b`, 'i').test(sentence.english));
                
                if (wordsInSentence.length >= 1) {
                    const correctlyOrderedWords = wordsInSentence
                        .sort((a, b) => sentence.english.toLowerCase().indexOf(a.toLowerCase()) - sentence.english.toLowerCase().indexOf(b.toLowerCase()));
                    const wordsToHideRegex = new RegExp(`\\b(${correctlyOrderedWords.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
                    const questionText = sentence.english.replace(wordsToHideRegex, '___');
                    const answerKey = correctlyOrderedWords.join(' ');
                    
                    gameVocabulary.push({ 
                        word: answerKey, 
                        question: questionText, 
                        vietnameseHint: sentence.vietnamese, 
                        hint: `Điền ${correctlyOrderedWords.length} từ còn thiếu. Gợi ý: ${sentence.vietnamese}` 
                    });
                }
            });
        }

        setVocabularyList(gameVocabulary);
        setCoins(fetchedCoins);
        setMasteryCount(fetchedMasteryCount);
        setDisplayedCoins(fetchedCoins);
        setUsedWords(fetchedCompletedWords);

      } catch (err: any) {
        setError(`Không thể tải dữ liệu người dùng: ${err.message}`);
        setVocabularyList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, selectedPractice, isMultiWordGame]);

  useEffect(() => {
    if (!loading && !error && vocabularyList.length > 0 && !isInitialLoadComplete.current) {
      const unusedWords = vocabularyList.filter(item => !usedWords.has(item.word.toLowerCase()));
      if (unusedWords.length === 0) { setGameOver(true); setCurrentWord(null); } else {
        const shuffled = shuffleArray(unusedWords); 
        const firstWord = shuffled[0];
        setShuffledUnusedWords(shuffled); 
        setCurrentWord(firstWord); 
        setCurrentWordIndex(0); 
        setGameOver(false);
        resetMultiWordState(firstWord);
      }
      isInitialLoadComplete.current = true;
    }
  }, [vocabularyList, loading, error, usedWords]);
  
  useEffect(() => {
    if (!currentWord || gameOver || isCorrect) return;
    setTimeLeft(TOTAL_TIME);
    const timerId = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { setStreak(0); clearInterval(timerId); return 0; } return prev - 1; }), 1000);
    return () => clearInterval(timerId);
  }, [currentWord, gameOver, isCorrect]);

  const selectNextWord = useCallback(() => {
    if (currentWordIndex < shuffledUnusedWords.length - 1) { 
        const nextIndex = currentWordIndex + 1; 
        const nextWord = shuffledUnusedWords[nextIndex];
        setCurrentWordIndex(nextIndex); 
        setCurrentWord(nextWord); 
        setFeedback(''); 
        setIsCorrect(null);
        resetMultiWordState(nextWord);
    } else { 
        setGameOver(true); 
        setCurrentWord(null); 
    }
  }, [currentWordIndex, shuffledUnusedWords]);
  
  const startCoinCountAnimation = useCallback((startValue: number, endValue: number) => { if (startValue === endValue) return; let step = Math.ceil((endValue - startValue) / 30) || 1; let current = startValue; const interval = setInterval(() => { current += step; if (current >= endValue) { setDisplayedCoins(endValue); clearInterval(interval); } else { setDisplayedCoins(current); } }, 30); }, []);
  
  const triggerSuccessSequence = useCallback(async () => {
    if (!currentWord || !user) return;
    
    setIsCorrect(true);
    const newStreak = streak + 1;
    setStreak(newStreak);
    setStreakAnimation(true);
    setTimeout(() => setStreakAnimation(false), 1500);
    setShowConfetti(true);

    setUsedWords(prev => new Set(prev).add(currentWord.word.toLowerCase()));

    const coinReward = (masteryCount * newStreak) * (isMultiWordGame ? 2 : 1);
    const updatedCoins = coins + coinReward;
    setCoins(updatedCoins);
    startCoinCountAnimation(coins, updatedCoins);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const batch = writeBatch(db);
      const gameModeId = `fill-word-${selectedPractice}`;
      
      if (isMultiWordGame) {
        const individualWords = currentWord.word.split(' ');
        individualWords.forEach(word => {
          const individualWordRef = doc(db, 'users', user.uid, 'completedWords', word.toLowerCase());
          batch.set(individualWordRef, { lastCompletedAt: new Date(), gameModes: { [gameModeId]: { correctCount: increment(1) } } }, { merge: true });
        });

        const questionId = currentWord.word.toLowerCase();
        const completedMultiWordRef = doc(db, 'users', user.uid, 'completedMultiWord', questionId);
        
        batch.set(completedMultiWordRef, {
            completedIn: { [gameModeId]: true },
            lastCompletedAt: new Date()
        }, { merge: true });

      } else {
        const wordId = currentWord.word.toLowerCase();
        const completedWordRef = doc(db, 'users', user.uid, 'completedWords', wordId);
        batch.set(completedWordRef, { lastCompletedAt: new Date(), gameModes: { [gameModeId]: { correctCount: increment(1) } } }, { merge: true });
      }

      if (coinReward > 0) {
        batch.update(userDocRef, { 'coins': increment(coinReward) });
      }
      
      await batch.commit();

    } catch (e) { 
      console.error("Lỗi khi cập nhật dữ liệu với batch:", e); 
    }
    
    setTimeout(() => setShowConfetti(false), 2000);
    setTimeout(selectNextWord, 1500);
  }, [currentWord, user, streak, masteryCount, selectedPractice, coins, startCoinCountAnimation, selectNextWord, isMultiWordGame]);

  const checkAnswer = useCallback(async () => {
    if (!currentWord || !userInput.trim() || isCorrect) return;
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      await triggerSuccessSequence();
    } else { 
      setFeedback(''); setIsCorrect(false); setStreak(0); 
    }
  }, [currentWord, userInput, isCorrect, triggerSuccessSequence]);
  
  const handleMultiWordCheck = useCallback(() => {
    if (!currentWord || activeBlankIndex === null || !userInput.trim() || isCorrect) return;

    const correctWords = currentWord.word.split(' ');
    const expectedWord = correctWords[activeBlankIndex];

    if (userInput.trim().toLowerCase() === expectedWord.toLowerCase()) {
      const newFilledWords = [...filledWords];
      newFilledWords[activeBlankIndex] = expectedWord;
      setFilledWords(newFilledWords);
      setUserInput('');

      const nextBlankIndex = filledWords.findIndex((word, index) => index > activeBlankIndex && word === '');

      if (nextBlankIndex !== -1) {
        setActiveBlankIndex(nextBlankIndex);
      } else {
        const allFilled = newFilledWords.every(word => word !== '');
        if (allFilled) {
          triggerSuccessSequence();
        } else {
          setActiveBlankIndex(newFilledWords.findIndex(w => w === ''));
        }
      }
    } else {
      setShake(true);
      setStreak(0);
      setTimeout(() => setShake(false), 500);
    }
  }, [currentWord, activeBlankIndex, userInput, isCorrect, filledWords, triggerSuccessSequence]);

  const resetGame = useCallback(() => {
    setGameOver(false); setStreak(0); setFeedback(''); setIsCorrect(null);
    const unused = vocabularyList.filter(item => !usedWords.has(item.word.toLowerCase()));
    if (unused.length > 0) { 
        const shuffled = shuffleArray(unused); 
        const firstWord = shuffled[0];
        setShuffledUnusedWords(shuffled); 
        setCurrentWord(shuffled[0]); 
        setCurrentWordIndex(0); 
        resetMultiWordState(firstWord);
    } else { 
        setGameOver(true); 
        setCurrentWord(null); 
    }
  }, [vocabularyList, usedWords]);

  const carouselImageUrls = useMemo(() => {
    if (!currentWord) return [`https://placehold.co/400x320/E0E7FF/4338CA?text=Loading...`];
    if (currentWord.imageIndex !== undefined) { const imageUrl = generateImageUrl(currentWord.imageIndex); return [imageUrl, imageUrl, imageUrl]; }
    return [`https://placehold.co/400x320/93c5fd/1e3a8a?text=?`, `https://placehold.co/400x320/a5b4fc/1e3a8a?text=Guess`, `https://placehold.co/400x320/c4b5fd/1e3a8a?text=The+Word`];
  }, [currentWord]);
  
  const handleImageClick = useCallback(() => setShowImagePopup(true), []);
  
  const multiWordCurrentBlankLength = useMemo(() => {
    if (!isMultiWordGame || !currentWord || activeBlankIndex === null) {
      return Infinity;
    }
    const correctWords = currentWord.word.split(' ');
    return correctWords[activeBlankIndex]?.length ?? Infinity;
  }, [currentWord, activeBlankIndex, selectedPractice, isMultiWordGame]);

  if (loading) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-indigo-700">Đang tải dữ liệu...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-600 text-center p-4">{error}</div>;
  if (vocabularyList.length === 0 && !loading && !error) return (
    <div className="flex flex-col items-center justify-center h-screen text-xl font-semibold text-gray-600 text-center p-4">
        Bạn không có đủ từ vựng cho bài tập này.
        <br/> 
        {(selectedPractice % 100 === 7) ? "Cần có câu chứa ít nhất 1 từ bạn đã học." : (selectedPractice % 100 === 6) ? "Cần có câu chứa ít nhất 5 từ bạn đã học." : (selectedPractice % 100 === 5) ? "Cần có câu chứa ít nhất 4 từ bạn đã học." : (selectedPractice % 100 === 4) ? "Cần có câu chứa ít nhất 3 từ bạn đã học." : (selectedPractice % 100 === 3) ? "Cần có câu chứa ít nhất 2 từ bạn đã học." : "Hãy vào màn hình 'Lật thẻ' để học thêm!"}
    </div>
  );
  
  const completedCount = usedWords.size;
  const totalCount = vocabularyList.length;
  const displayCount = gameOver || !currentWord ? completedCount : Math.min(completedCount + 1, totalCount);
  const progressPercentage = totalCount > 0 ? (displayCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl font-sans">
      <style jsx global>{` @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } } .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; } `}</style>

      <header className="w-full h-10 flex items-center justify-between px-4 bg-black/90 border-b border-white/20 flex-shrink-0">
        <button onClick={onGoBack} className="group w-7 h-7 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 active:bg-white/30 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Quay lại"><BackIcon className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" /></button>
        <div className="flex items-center gap-2 sm:gap-3"><CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} /><StreakDisplay displayedStreak={streak} isAnimating={streakAnimation} /><MasteryDisplay masteryCount={masteryCount} /></div>
      </header>
      
      <main className="flex-grow px-4 sm:px-8 pt-8 pb-8 w-full flex flex-col items-center">
        {showConfetti && <Confetti />}
        <div className="w-full flex flex-col items-center">
          {gameOver ? (
            <div className="text-center py-8 w-full">
              <div className="bg-white p-8 rounded-2xl shadow-lg mb-6"><h2 className="text-2xl font-bold mb-4 text-indigo-800">Trò chơi kết thúc!</h2><p className="text-xl mb-4">Bạn đã hoàn thành tất cả các từ trong bài tập này.</p><div className="w-full bg-gray-200 rounded-full h-4 mb-6"><div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `100%` }}></div></div></div>
              <button onClick={resetGame} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"><RefreshIcon className="mr-2 h-5 w-5" /> Chơi lại</button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative w-full rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 shadow-inner border border-white/30"><div className="flex items-center"><span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">{displayCount}</span><span className="mx-0.5 text-white/70 text-xs">/</span><span className="text-xs text-white/50">{totalCount}</span></div></div>
                  <div className="flex items-center gap-2">
                    {currentWord && (
                      <>
                        <button onClick={() => setShowPhrasePopup(true)} className="group w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner border border-white/30 hover:bg-white/35 active:bg-white/40 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Xem cụm từ"><PhraseIcon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" /></button>
                        <button onClick={() => setShowExamPopup(true)} className="group w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner border border-white/30 hover:bg-white/35 active:bg-white/40 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-100" aria-label="Xem ví dụ"><ExamIcon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" /></button>
                      </>
                    )}
                    <CountdownTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} />
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative"><div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}><div className="absolute top-0 h-1 w-full bg-white opacity-30"></div></div></div>
                { (selectedPractice % 100 !== 1) && currentWord && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/25 relative overflow-hidden mt-4">
                    <p className="text-lg sm:text-xl font-semibold text-white leading-tight">{currentWord.question?.split('___').map((part, i, arr) => ( <React.Fragment key={i}> {part} {i < arr.length - 1 && <span className="font-bold text-indigo-300">___</span>} </React.Fragment> ))}</p>
                    {currentWord.vietnameseHint && (<p className="text-white/80 text-sm mt-2 italic">{currentWord.vietnameseHint}</p>)}
                  </div>
                )}
              </div>
              
              {currentWord ? (
                <div className="w-full mt-6 space-y-6">
                  {(selectedPractice % 100 === 1) && <ImageCarousel3D imageUrls={carouselImageUrls} onImageClick={handleImageClick} word={currentWord.word} />}
                  
                  {isMultiWordGame ? (
                    <div className="w-full flex flex-col items-center gap-4">
                      <div className={`p-4 bg-white rounded-lg shadow-md w-full transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
                        <div className="text-lg sm:text-xl font-medium text-gray-700 leading-relaxed">
                           {currentWord.question?.split('___').map((part, index, arr) => (
                            <React.Fragment key={index}>
                              <span>{part}</span>
                              {index < arr.length - 1 && (
                                <button
                                  onClick={() => !isCorrect && setActiveBlankIndex(index)}
                                  disabled={!!isCorrect}
                                  className={`inline-block align-middle mx-1 my-0.5 px-3 py-0.5 rounded-md font-medium transition-all duration-200 ${filledWords[index] ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gray-200 text-gray-500'} ${activeBlankIndex === index && !isCorrect ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50 text-indigo-700' : ''} ${isCorrect ? 'cursor-not-allowed' : 'hover:bg-indigo-100'}`}
                                >
                                  {filledWords[index] ? filledWords[index].toLowerCase() : (activeBlankIndex === index && !isCorrect) ? (userInput.toLowerCase() || '...') : '...'}
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {activeBlankIndex !== null && !isCorrect && (
                        <div className="w-full flex flex-col items-center gap-4 transition-all duration-300">
                          <div className="w-full">
                            <VirtualKeyboard userInput={userInput} setUserInput={setUserInput} wordLength={multiWordCurrentBlankLength} disabled={!!isCorrect}/>
                            <div className="flex justify-center mt-2">
                              <button onClick={handleMultiWordCheck} disabled={!userInput.trim()} className="px-8 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Kiểm tra
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <WordSquaresInput word={currentWord.word} userInput={userInput} setUserInput={setUserInput} checkAnswer={checkAnswer} feedback={feedback} isCorrect={isCorrect} disabled={!!isCorrect} />
                  )}
                </div>
              ) : <div className='pt-10 font-bold text-gray-500'>Đang tải từ...</div>}
            </>
          )}
        </div>
        {showImagePopup && currentWord && (selectedPractice % 100 === 1) && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-2xl p-6 max-w-3xl max-h-full overflow-auto shadow-xl">
              <button onClick={() => setShowImagePopup(false)} className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"><span className="text-xl font-bold">✕</span></button>
              <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">{currentWord.word}</h3>
              <img src={generateImageUrl(currentWord.imageIndex)} alt={currentWord.word} className="rounded-lg shadow-md max-w-full max-h-full object-contain" />
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100"><p className="font-medium text-gray-700 mb-1">Định nghĩa:</p><p className="text-gray-800">{currentWord.hint}</p></div>
            </div>
          </div>
        )}
        {showPhrasePopup && currentWord && ( <PhrasePopup isOpen={showPhrasePopup} onClose={() => setShowPhrasePopup(false)} currentWord={currentWord.word} /> )}
        {showExamPopup && currentWord && ( <ExamPopup isOpen={showExamPopup} onClose={() => setShowExamPopup(false)} currentWord={currentWord.word} /> )}
      </main>
    </div>
  );
}
