// --- START OF FILE: src/word-chain/word-chain-game.tsx ---

import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// --- Icons ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const BackIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);


type GameState = 'loading' | 'playerTurn' | 'aiTurn' | 'gameOver';
type Message = { text: string; type: 'error' | 'info' | 'success' | 'warning' };
type ChainEntry = { word: string; author: 'player' | 'ai' };

export default function WordChainGame({ onGoBack }) {
    const [user, setUser] = useState(auth.currentUser);
    const [gameState, setGameState] = useState<GameState>('loading');
    const [wordChain, setWordChain] = useState<ChainEntry[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [allLearnedWords, setAllLearnedWords] = useState<Set<string>>(new Set());
    const [playerInput, setPlayerInput] = useState('');
    const [message, setMessage] = useState<Message | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        if (!user) return;
        
        const fetchLearnedWords = async () => {
            setGameState('loading');
            try {
                const vocabSnapshot = await getDocs(collection(db, 'users', user.uid, 'openedVocab'));
                const words = vocabSnapshot.docs
                    .map(doc => doc.data().word?.toLowerCase())
                    .filter(Boolean); // Lọc bỏ các giá trị null/undefined, không còn giới hạn độ dài
                
                if (words.length < 10) {
                    setMessage({ text: `Bạn cần học ít nhất 10 từ (hiện có ${words.length}) để chơi.`, type: 'warning' });
                    setGameState('gameOver');
                } else {
                    setAllLearnedWords(new Set(words));
                }
            } catch (error) {
                console.error("Error fetching words:", error);
                setMessage({ text: 'Lỗi khi tải từ vựng của bạn.', type: 'error' });
                setGameState('gameOver');
            }
        };

        fetchLearnedWords();
    }, [user]);
    
    // --- Start Game when words are loaded ---
    useEffect(() => {
        if (allLearnedWords.size > 0 && gameState === 'loading') {
            startGame();
        }
    }, [allLearnedWords, gameState]);

    // --- Scroll to bottom of chat ---
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [wordChain]);

    // --- AI's Turn Logic ---
    useEffect(() => {
        if (gameState === 'aiTurn') {
            const aiThinkTime = Math.random() * 1000 + 800; // 800ms to 1800ms
            const timeoutId = setTimeout(() => {
                handleAiMove();
            }, aiThinkTime);
            return () => clearTimeout(timeoutId);
        }
    }, [gameState]);

    const startGame = useCallback(() => {
        const availableWords = Array.from(allLearnedWords);
        if (availableWords.length === 0) return;

        const firstWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        
        setWordChain([{ word: firstWord, author: 'ai' }]);
        setUsedWords(new Set([firstWord]));
        setMessage(null);
        setPlayerInput('');
        setGameState('playerTurn');
    }, [allLearnedWords]);

    const findNextWord = (startChar: string): string | null => {
        const possibleWords = Array.from(allLearnedWords).filter(
            word => word.startsWith(startChar) && !usedWords.has(word)
        );
        if (possibleWords.length === 0) return null;
        return possibleWords[Math.floor(Math.random() * possibleWords.length)];
    };
    
    const handlePlayerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameState !== 'playerTurn' || !playerInput.trim()) return;

        const lastEntry = wordChain[wordChain.length - 1];
        const lastChar = lastEntry.word.slice(-1);
        const submittedWord = playerInput.trim().toLowerCase();

        // --- Validation ---
        if (!submittedWord.startsWith(lastChar)) {
            setMessage({ text: `Từ phải bắt đầu bằng chữ '${lastChar.toUpperCase()}'`, type: 'error' });
            return;
        }
        if (usedWords.has(submittedWord)) {
            setMessage({ text: 'Từ này đã được sử dụng!', type: 'error' });
            return;
        }
        if (!allLearnedWords.has(submittedWord)) {
            setMessage({ text: 'Bạn chưa học từ này hoặc từ không hợp lệ!', type: 'error' });
            return;
        }

        // --- Success ---
        const newChain = [...wordChain, { word: submittedWord, author: 'player' as const }];
        const newUsedWords = new Set(usedWords).add(submittedWord);
        
        setWordChain(newChain);
        setUsedWords(newUsedWords);
        setPlayerInput('');
        setMessage(null);
        setGameState('aiTurn');
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
            setGameState('playerTurn');
        } else {
            // AI cannot find a word, player wins
            setMessage({ text: 'Chúc mừng! Bạn đã thắng!', type: 'success' });
            setGameState('gameOver');
        }
    };

    const renderChain = () => {
        return wordChain.map((entry, index) => {
            const isPlayer = entry.author === 'player';
            const lastChar = index > 0 ? wordChain[index-1].word.slice(-1) : '';
            const firstChar = entry.word.charAt(0);

            return (
                <div key={index} className={`flex items-end gap-2 w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                    {!isPlayer && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><BotIcon/></div>}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-lg relative shadow-md transition-transform duration-300 transform animate-pop-in ${
                        isPlayer 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-lg'
                        : 'bg-white text-gray-800 rounded-bl-lg'
                    }`}>
                         {index > 0 && (
                            <div className="absolute top-1/2 -translate-y-1/2 font-bold text-2xl opacity-20"
                                style={isPlayer ? { left: '-1rem' } : { right: '-1rem' }}>
                                {lastChar.toUpperCase()}
                            </div>
                        )}
                        <span className="font-bold text-yellow-300">{firstChar}</span>
                        <span>{entry.word.slice(1)}</span>
                    </div>
                     {isPlayer && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><UserIcon/></div>}
                </div>
            )
        });
    }
    
    const lastWord = wordChain.length > 0 ? wordChain[wordChain.length - 1].word : '';
    const nextChar = lastWord.slice(-1);
    
    return (
        <div className="fixed inset-0 z-[51] bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col">
            <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-md">
                <div className="flex h-14 items-center justify-between px-4">
                    <div className="w-28 flex justify-start">
                        <button onClick={onGoBack} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors" aria-label="Quay lại">
                            <BackIcon />
                            <span>Quay lại</span>
                        </button>
                    </div>
                    
                    <h1 className="text-lg font-bold text-slate-200 truncate">Nối Từ</h1>

                    <div className="w-28 flex justify-end">
                        <button 
                            onClick={startGame} 
                            disabled={gameState === 'loading' || allLearnedWords.size < 10} 
                            className="px-4 py-1.5 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                        >
                            Ván mới
                        </button>
                    </div>
                </div>
            </header>
            
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                {renderChain()}
                {gameState === 'aiTurn' && (
                     <div className="flex items-end gap-2 justify-start animate-pop-in">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><BotIcon/></div>
                        <div className="max-w-[70%] rounded-2xl px-4 py-2 text-lg bg-white rounded-bl-lg shadow-md flex items-center gap-1">
                            <span className="animate-pulse-dot bg-gray-400"></span>
                            <span className="animate-pulse-dot bg-gray-400 delay-150"></span>
                            <span className="animate-pulse-dot bg-gray-400 delay-300"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t">
                 {message && (
                    <div className={`mb-3 p-3 rounded-lg text-center text-sm font-medium animate-pop-in
                        ${message.type === 'error' && 'bg-red-100 text-red-700'}
                        ${message.type === 'success' && 'bg-green-100 text-green-700'}
                        ${message.type === 'warning' && 'bg-yellow-100 text-yellow-700'}
                        ${message.type === 'info' && 'bg-blue-100 text-blue-700'}
                    `}>
                        {message.text}
                    </div>
                )}

                {gameState === 'gameOver' ? (
                    <button onClick={startGame} disabled={allLearnedWords.size < 10} className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed">
                       Chơi lại
                    </button>
                ) : (
                    <form onSubmit={handlePlayerSubmit} className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-indigo-500">{nextChar.toUpperCase()}</span>
                        </div>
                        <input
                            type="text"
                            value={playerInput}
                            onChange={(e) => setPlayerInput(e.target.value)}
                            placeholder={gameState === 'playerTurn' ? 'Nhập từ của bạn...' : "Đợi máy..."}
                            disabled={gameState !== 'playerTurn'}
                            className="w-full text-lg p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                            autoComplete="off"
                            autoCapitalize="none"
                        />
                         <button type="submit" disabled={gameState !== 'playerTurn' || !playerInput.trim()} className="flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
                            <SendIcon />
                        </button>
                    </form>
                )}
            </div>
             <style jsx>{`
                @keyframes pop-in {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                @keyframes pulse-dot-keyframe {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 9999px;
                    animation: pulse-dot-keyframe 1.4s infinite ease-in-out both;
                }
                .delay-150 { animation-delay: 0.15s; }
                .delay-300 { animation-delay: 0.3s; }
            `}</style>
        </div>
    );
}
