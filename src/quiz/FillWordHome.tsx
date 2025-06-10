import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase.js'; // Đảm bảo đường dẫn đúng
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { defaultImageUrls } from '../image-url.ts'; // Đảm bảo bạn có file này

// --- UTILITY FUNCTIONS ---
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; }
  return shuffledArray;
};

// --- HELPER COMPONENTS & LOGIC ---
const CoinDisplay: React.FC<{ displayedCoins: number }> = ({ displayedCoins }) => (
  <div className="bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg p-0.5 flex items-center shadow-lg"><div className="relative mr-0.5"><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="C" className="w-4 h-4"/></div><div className="font-bold text-amber-100 text-xs">{displayedCoins.toLocaleString()}</div></div>
);
const StreakDisplay: React.FC<{ displayedStreak: number, isAnimating: boolean }> = ({ displayedStreak, isAnimating }) => {
  const getIcon = (s: number) => { if (s >= 20) return 'fire%20(4).png'; if (s >= 10) return 'fire%20(3).png'; if (s >= 5) return 'fire%20(1).png'; if (s >= 1) return 'fire%20(2).png'; return 'fire.png'; };
  const iconUrl = `https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/${getIcon(displayedStreak)}`;
  return (<div className={`bg-gray-100 rounded-lg px-3 py-0.5 flex items-center shadow-md border border-orange-400 transition-transform ${isAnimating ? 'scale-110' : ''}`}><img src={iconUrl} alt="S" className="w-4 h-4"/><div className="font-bold text-gray-800 text-xs ml-1">{displayedStreak}</div></div>);
};
const Confetti: React.FC = () => {
    const [particles, setParticles] = useState<any[]>([]);
    useEffect(() => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * -50, size: Math.random() * 8 + 4, color: ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0'][Math.floor(Math.random()*5)], speed: Math.random() * 2 + 1 }));
      setParticles(newParticles);
      const interval = setInterval(() => { setParticles(prev => prev.map(p => ({ ...p, y: p.y + p.speed })).filter(p => p.y < 110)); }, 50);
      return () => clearInterval(interval);
    }, []);
    return <div className="fixed inset-0 pointer-events-none z-50">{particles.map(p => <div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, backgroundColor: p.color }} />)}</div>;
};
const VirtualKeyboard: React.FC<{ userInput: string, setUserInput: (v: string) => void, wordLength: number, disabled: boolean }> = ({ userInput, setUserInput, wordLength, disabled }) => {
    const letters = [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['z','x','c','v','b','n','m']];
    return (<div className="w-full max-w-md mx-auto p-2 rounded-xl shadow-inner bg-gray-50/50">{letters.map((row, rIndex) => (<div key={rIndex} className="flex justify-center gap-1 mb-1">{row.map(key => (<button key={key} className="w-8 h-10 bg-white rounded-lg shadow active:bg-gray-200 disabled:opacity-50" onClick={() => !disabled && userInput.length < wordLength && setUserInput(userInput + key)} disabled={disabled}>{key.toUpperCase()}</button>))}{(rIndex === 2) && <button className="w-10 h-10 bg-white rounded-lg shadow active:bg-gray-200 disabled:opacity-50" onClick={() => !disabled && userInput.length > 0 && setUserInput(userInput.slice(0, -1))} disabled={disabled}>⌫</button>}</div>))}</div>);
};
const WordSquaresInput: React.FC<{ word: string, userInput: string, setUserInput: (v: string) => void, checkAnswer: () => void, feedback: string, isCorrect: boolean | null, disabled: boolean }> = (props) => {
    const { word, userInput, setUserInput, checkAnswer, feedback, isCorrect, disabled } = props;
    const squares = Array(word.length).fill('').map((_, i) => userInput[i] || '');
    const getStyle = (i: number) => { if (isCorrect) return 'bg-green-100 border-green-400'; if (isCorrect === false) return 'bg-red-100 border-red-400 animate-shake'; if (squares[i]) return 'bg-blue-100 border-blue-300'; return 'bg-white border-gray-300'; };
    return (<div className="w-full space-y-4 text-center"><div className="flex justify-center gap-2 mb-3">{squares.map((char, i) => (<div key={i} className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg text-xl font-bold transition-all ${getStyle(i)}`}>{char.toUpperCase()}</div>))}</div>{feedback && <div className={`p-2 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{feedback}</div>}<button onClick={checkAnswer} disabled={userInput.length !== word.length || disabled} className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white disabled:bg-gray-300">Kiểm tra</button><VirtualKeyboard {...props} wordLength={word.length} /></div>)
};


// --- MAIN FILL WORD COMPONENT ---
interface VocabularyItem { word: string; hint: string; imageIndex?: number; }
export default function FillWordHome() {
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState(0);
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffledUnusedWords, setShuffledUnusedWords] = useState<VocabularyItem[]>([]);
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => { const unsub = onAuthStateChanged(auth, u => setUser(u)); return () => unsub(); }, []);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!user) { setLoading(false); setError("Vui lòng đăng nhập."); return; }
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCoins(data.coins || 0);
          const vocab = (data.listVocabulary || []).map((w: string) => ({ word: w, hint: `Nghĩa của từ "${w}"` }));
          const imageIds = data.openedImageIds || [];
          setVocabularyList(vocab.map((item: VocabularyItem, index: number) => ({ ...item, imageIndex: imageIds[index] })));
          setUsedWords(new Set(data['fill-word-1'] || []));
        }
      } catch (err) { setError("Lỗi tải dữ liệu."); console.error(err); } 
      finally { setLoading(false); }
    };
    fetchGameData();
  }, [user]);
  
  useEffect(() => {
    if (!loading && vocabularyList.length > 0) {
      const unused = vocabularyList.filter(item => !usedWords.has(item.word));
      if (unused.length === 0) setGameOver(true);
      else { const shuffled = shuffleArray(unused); setShuffledUnusedWords(shuffled); setCurrentWord(shuffled[0]); }
    }
  }, [loading, vocabularyList, usedWords]);

  const selectNextWord = () => {
      const currentIndex = shuffledUnusedWords.findIndex(w => w.word === currentWord?.word);
      const nextIndex = currentIndex + 1;
      if (nextIndex < shuffledUnusedWords.length) {
          setCurrentWord(shuffledUnusedWords[nextIndex]);
          setUserInput(''); setFeedback(''); setIsCorrect(null);
      } else {
          setGameOver(true);
      }
  };

  const checkAnswer = async () => {
    if (!currentWord) return;
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setIsCorrect(true); setFeedback('Chính xác!'); setShowConfetti(true); setStreak(s => s + 1);
      const newUsedWords = new Set(usedWords).add(currentWord.word);
      setUsedWords(newUsedWords);
      if (user) await updateDoc(doc(db, 'users', user.uid), { 'fill-word-1': arrayUnion(currentWord.word) });
      setTimeout(() => { setShowConfetti(false); selectNextWord(); }, 1500);
    } else {
      setIsCorrect(false); setFeedback('Không đúng!'); setStreak(0);
    }
  };
  
  const resetGame = () => {
    const unused = vocabularyList.filter(item => !usedWords.has(item.word));
    const shuffled = shuffleArray(unused);
    setShuffledUnusedWords(shuffled);
    setCurrentWord(shuffled[0] || null);
    setGameOver(unused.length === 0);
    setStreak(0); setUserInput(''); setFeedback(''); setIsCorrect(null);
  };
  
  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (vocabularyList.length === 0) return <div className="p-10 text-center">Bạn chưa có từ vựng.</div>;

  return (
    <div className="w-full max-w-xl mx-auto bg-blue-50 p-4 sm:p-8">
      {showConfetti && <Confetti />}
      <div className="w-full">
        {gameOver ? (
           <div className="text-center p-8"><h2 className="text-2xl font-bold mb-4">Hoàn thành!</h2><p>Bạn đã đoán hết các từ.</p><button onClick={resetGame} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded">Chơi lại</button></div>
        ) : currentWord ? (
          <>
            <div className="flex justify-between items-center mb-4 p-4 bg-indigo-600 text-white rounded-lg"><div>Tiến độ: {usedWords.size}/{vocabularyList.length}</div><div className="flex gap-4"><CoinDisplay displayedCoins={coins} /><StreakDisplay displayedStreak={streak} isAnimating={isCorrect === true} /></div></div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center"><img src={defaultImageUrls[currentWord.imageIndex ? currentWord.imageIndex - 1 : 0]} alt={currentWord.word} className="max-h-full max-w-full"/></div>
                <WordSquaresInput word={currentWord.word} userInput={userInput} setUserInput={setUserInput} checkAnswer={checkAnswer} feedback={feedback} isCorrect={isCorrect} disabled={isCorrect === true} />
            </div>
          </>
        ) : (
            <div className="p-10 text-center">Đang chuẩn bị từ...</div>
        )}
      </div>
    </div>
  );
}
