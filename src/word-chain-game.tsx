// --- START OF FILE: src/word-chain/word-chain-game.tsx ---

import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { defaultVocabulary } from './list-vocabulary.ts'; // Import danh sách từ điển

// --- Icons ---
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const BotIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
const LearnedIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.968 7.968 0 005.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.968 7.968 0 0014.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" /></svg>);
const DictionaryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v1.5a1.5 1.5 0 01-3 0V12a2 2 0 00-2-2 2 2 0 01-2-2V8c0-.421.213-.802.557-1.027z" clipRule="evenodd" /></svg>);

type GamePhase = 'modeSelection' | 'loading' | 'playing' | 'gameOver';
type VocabularyMode = 'learned' | 'dictionary';
type Message = { text: string; type: 'error' | 'info' | 'success' | 'warning' };
type ChainEntry = { word: string; author: 'player' | 'ai' };

export default function WordChainGame({ onGoBack }) {
    const [user, setUser] = useState(auth.currentUser);
    const [gamePhase, setGamePhase] = useState<GamePhase>('modeSelection');
    const [vocabularyMode, setVocabularyMode] = useState<VocabularyMode | null>(null);
    const [wordChain, setWordChain] = useState<ChainEntry[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [allWords, setAllWords] = useState<Set<string>>(new Set());
    const [playerInput, setPlayerInput] = useState('');
    const [message, setMessage] = useState<Message | null>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
        return () => unsubscribe();
    }, []);

    const handleModeSelect = (mode: VocabularyMode) => {
        setVocabularyMode(mode);
        setGamePhase('loading');
    };

    // --- Data Loading Logic ---
    useEffect(() => {
        if (gamePhase !== 'loading' || !vocabularyMode) return;

        const loadWords = async () => {
            try {
                let words: string[] = [];
                if (vocabularyMode === 'learned') {
                    if (!user) throw new Error("Bạn cần đăng nhập để dùng chế độ này.");
                    const vocabSnapshot = await getDocs(collection(db, 'users', user.uid, 'openedVocab'));
                    words = vocabSnapshot.docs.map(doc => doc.data().word?.toLowerCase()).filter(Boolean);
                    if (words.length < 10) {
                        throw new Error(`Bạn cần học ít nhất 10 từ (hiện có ${words.length}) để chơi ở chế độ này.`);
                    }
                } else { // vocabularyMode === 'dictionary'
                    words = fullVocabularyList.map(w => w.toLowerCase());
                }

                setAllWords(new Set(words));
                startGame(new Set(words));
            } catch (error) {
                setMessage({ text: error.message || 'Lỗi khi tải từ vựng.', type: 'error' });
                setGamePhase('modeSelection'); // Quay lại màn hình chọn chế độ nếu lỗi
            }
        };

        loadWords();
    }, [gamePhase, vocabularyMode, user]);

    // --- Scroll to bottom of chat & AI Turn ---
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        if (gamePhase === 'playing' && !isPlayerTurn) {
            const aiThinkTime = Math.random() * 1000 + 800;
            const timeoutId = setTimeout(handleAiMove, aiThinkTime);
            return () => clearTimeout(timeoutId);
        }
    }, [wordChain, isPlayerTurn, gamePhase]);

    const startGame = useCallback((wordSet: Set<string>) => {
        const availableWords = Array.from(wordSet);
        if (availableWords.length === 0) return;
        const firstWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        
        setWordChain([{ word: firstWord, author: 'ai' }]);
        setUsedWords(new Set([firstWord]));
        setMessage(null);
        setPlayerInput('');
        setIsPlayerTurn(true);
        setGamePhase('playing');
    }, []);
    
    const restartGame = () => {
      setMessage(null);
      startGame(allWords);
    }
    
    const changeMode = () => {
        setGamePhase('modeSelection');
        setMessage(null);
    }

    const findNextWord = (startChar: string): string | null => {
        const possibleWords = Array.from(allWords).filter(word => word.startsWith(startChar) && !usedWords.has(word));
        if (possibleWords.length === 0) return null;
        return possibleWords[Math.floor(Math.random() * possibleWords.length)];
    };
    
    const handlePlayerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gamePhase !== 'playing' || !isPlayerTurn || !playerInput.trim()) return;

        const lastEntry = wordChain[wordChain.length - 1];
        const lastChar = lastEntry.word.slice(-1);
        const submittedWord = playerInput.trim().toLowerCase();

        if (!submittedWord.startsWith(lastChar)) {
            setMessage({ text: `Từ phải bắt đầu bằng chữ '${lastChar.toUpperCase()}'`, type: 'error' });
            return;
        }
        if (usedWords.has(submittedWord)) {
            setMessage({ text: 'Từ này đã được sử dụng!', type: 'error' });
            return;
        }
        if (!allWords.has(submittedWord)) {
            setMessage({ text: 'Từ không hợp lệ hoặc không có trong bộ từ vựng đã chọn!', type: 'error' });
            return;
        }

        const newChain = [...wordChain, { word: submittedWord, author: 'player' as const }];
        const newUsedWords = new Set(usedWords).add(submittedWord);
        setWordChain(newChain);
        setUsedWords(newUsedWords);
        setPlayerInput('');
        setMessage(null);
        setIsPlayerTurn(false);
    };

    const handleAiMove = () => {
        const lastEntry = wordChain[wordChain.length - 1];
        const lastChar = lastEntry.word.slice(-1);
        const nextWord = findNextWord(lastChar);

        if (nextWord) {
            const newChain = [...wordChain, { word: nextWord, author: 'ai' as const }];
            const newUsedWords = new Set(usedWords).add(nextWord);
            setWordChain(newChain);
            setUsedWords(newUsedWords);
            setIsPlayerTurn(true);
        } else {
            setMessage({ text: 'Chúc mừng! Bạn đã thắng!', type: 'success' });
            setGamePhase('gameOver');
        }
    };
    
    const renderHeader = () => (
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b flex justify-between items-center">
            <button onClick={onGoBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Quay lại
            </button>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Nối Từ</h1>
            <div className="flex items-center gap-2">
                 <button onClick={changeMode} className="px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200">
                    Đổi chế độ
                </button>
                <button onClick={restartGame} className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">
                    Ván mới
                </button>
            </div>
        </div>
    );
    
    if (gamePhase === 'modeSelection' || gamePhase === 'loading') {
      return (
        <div className="fixed inset-0 z-[51] bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 left-4">
                 <button onClick={onGoBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white/50 px-3 py-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Quay lại
                </button>
            </div>
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    Nối Từ
                </h1>
                <p className="text-gray-500 text-lg mb-8">Chọn một bộ từ vựng để bắt đầu thử thách</p>
                {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700`}>{message.text}</div>}
            </div>
            <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => handleModeSelect('learned')} disabled={gamePhase==='loading'} className="text-left p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-teal-400 group disabled:opacity-50 disabled:cursor-wait">
                   <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg mb-4">
                        <LearnedIcon />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Từ Đã Học</h3>
                   <p className="text-gray-500 mt-1">Chơi với những từ bạn đã mở khóa. Cần đăng nhập.</p>
                </button>
                 <button onClick={() => handleModeSelect('dictionary')} disabled={gamePhase==='loading'} className="text-left p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-purple-400 group disabled:opacity-50 disabled:cursor-wait">
                   <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg mb-4">
                        <DictionaryIcon />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Từ Điển</h3>
                   <p className="text-gray-500 mt-1">Thử thách với bộ từ vựng đầy đủ của ứng dụng.</p>
                </button>
            </div>
             {gamePhase === 'loading' && <div className="mt-8 text-indigo-600 font-semibold animate-pulse">Đang tải bộ từ vựng...</div>}
        </div>
      );
    }
    
    // --- Render Game UI ---
    const lastWord = wordChain.length > 0 ? wordChain[wordChain.length - 1].word : '';
    const nextChar = lastWord.slice(-1);

    return (
        <div className="fixed inset-0 z-[51] bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col">
            {renderHeader()}
            
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                {wordChain.map((entry, index) => {
                    const isPlayer = entry.author === 'player';
                    const firstChar = entry.word.charAt(0);
                    return (
                        <div key={index} className={`flex items-end gap-2 w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                            {!isPlayer && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><BotIcon/></div>}
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-lg shadow-md animate-pop-in ${
                                isPlayer ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg'}`}>
                                <span className="font-bold text-yellow-300">{firstChar}</span>
                                <span>{entry.word.slice(1)}</span>
                            </div>
                            {isPlayer && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><UserIcon/></div>}
                        </div>
                    )
                })}
                {gamePhase === 'playing' && !isPlayerTurn && (
                     <div className="flex items-end gap-2 justify-start animate-pop-in">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><BotIcon/></div>
                        <div className="max-w-[70%] rounded-2xl px-4 py-2 text-lg bg-white rounded-bl-lg shadow-md flex items-center gap-1">
                            <span className="animate-pulse-dot bg-gray-400"></span><span className="animate-pulse-dot bg-gray-400 delay-150"></span><span className="animate-pulse-dot bg-gray-400 delay-300"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t">
                 {message && (
                    <div className={`mb-3 p-3 rounded-lg text-center text-sm font-medium animate-pop-in ${message.type === 'error' && 'bg-red-100 text-red-700'} ${message.type === 'success' && 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}
                {gamePhase === 'gameOver' ? (
                    <button onClick={restartGame} className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                       Chơi lại
                    </button>
                ) : (
                    <form onSubmit={handlePlayerSubmit} className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><span className="text-2xl font-bold text-indigo-500">{nextChar.toUpperCase()}</span></div>
                        <input type="text" value={playerInput} onChange={(e) => setPlayerInput(e.target.value)}
                            placeholder={isPlayerTurn ? 'Nhập từ của bạn...' : "Đợi máy..."}
                            disabled={!isPlayerTurn}
                            className="w-full text-lg p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                            autoComplete="off" autoCapitalize="none" />
                         <button type="submit" disabled={!isPlayerTurn || !playerInput.trim()} className="flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"><SendIcon /></button>
                    </form>
                )}
            </div>
             <style jsx>{`
                @keyframes pop-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes pulse-dot-keyframe { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .animate-pulse-dot { display: inline-block; width: 8px; height: 8px; border-radius: 9999px; animation: pulse-dot-keyframe 1.4s infinite ease-in-out both; }
                .delay-150 { animation-delay: 0.15s; }
                .delay-300 { animation-delay: 0.3s; }
            `}</style>
        </div>
    );
}
