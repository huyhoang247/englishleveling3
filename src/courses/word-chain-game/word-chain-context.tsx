// --- START OF FILE: src/word-chain-context.tsx ---

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    ReactNode
} from 'react';
import { User } from 'firebase/auth';
import { WORD_TO_CARD_MAP, Flashcard } from '../../story/flashcard-data.ts';
import { fetchOrCreateUser, updateUserCoins } from '../course-data-service.ts';
import { useAnimateValue } from '../../useAnimateValue.ts';

// --- Type Definitions ---
type GameState = 'loading' | 'playerTurn' | 'aiTurn' | 'gameOver';
type Message = { text: string; type: 'error' | 'info' | 'success' | 'warning' };
type ChainEntry = { word: string; author: 'player' | 'ai' };

// --- Context Type Definition ---
interface WordChainContextType {
    gameState: GameState;
    wordChain: ChainEntry[];
    playerInput: string;
    message: Message | null;
    selectedCard: Flashcard | null;
    coins: number;
    masteryCount: number;
    displayedCoins: number;
    chatContainerRef: React.RefObject<HTMLDivElement>;
    lastWord: string;
    nextChar: string;
    allWordsLoaded: boolean;
    setPlayerInput: (input: string) => void;
    handlePlayerSubmit: (e: React.FormEvent) => Promise<void>;
    startGame: () => void;
    handleWordClick: (word: string) => void;
    handleCloseModal: () => void;
}

// --- Create Context ---
const WordChainContext = createContext<WordChainContextType | null>(null);

// --- Custom Hook for easy consumption ---
export const useWordChain = () => {
    const context = useContext(WordChainContext);
    if (!context) {
        throw new Error('useWordChain must be used within a WordChainProvider');
    }
    return context;
};

// --- Provider Component ---
interface WordChainProviderProps {
    user: User | null;
    children: ReactNode;
}

export const WordChainProvider: React.FC<WordChainProviderProps> = ({ user, children }) => {
    // --- States ---
    const [gameState, setGameState] = useState<GameState>('loading');
    const [wordChain, setWordChain] = useState<ChainEntry[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [allLearnedWords, setAllLearnedWords] = useState<Set<string>>(new Set());
    const [playerInput, setPlayerInput] = useState('');
    const [message, setMessage] = useState<Message | null>(null);
    const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
    const [coins, setCoins] = useState(0);
    const [masteryCount, setMasteryCount] = useState(0);
    const displayedCoins = useAnimateValue(coins, 500);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // --- Logic Handlers (memoized with useCallback) ---
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

    const findNextWord = useCallback((startChar: string): string | null => {
        const possibleWords = Array.from(allLearnedWords).filter(
            word => word.startsWith(startChar) && !usedWords.has(word)
        );
        if (possibleWords.length === 0) return null;
        return possibleWords[Math.floor(Math.random() * possibleWords.length)];
    }, [allLearnedWords, usedWords]);

    const handleAiMove = useCallback(() => {
        const lastEntry = wordChain[wordChain.length - 1];
        if (!lastEntry) return;

        const lastChar = lastEntry.word.slice(-1);
        const nextWord = findNextWord(lastChar);

        if (nextWord) {
            const newChain = [...wordChain, { word: nextWord, author: 'ai' as const }];
            const newUsedWords = new Set(usedWords).add(nextWord);
            setWordChain(newChain);
            setUsedWords(newUsedWords);
            setGameState('playerTurn');
        } else {
            setMessage({ text: 'Chúc mừng! Bạn đã thắng!', type: 'success' });
            setGameState('gameOver');
        }
    }, [wordChain, usedWords, findNextWord]);

    const handlePlayerSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (gameState !== 'playerTurn' || !playerInput.trim() || !user) return;

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
        if (!allLearnedWords.has(submittedWord)) {
            setMessage({ text: 'Từ này không có trong từ điển hoặc không hợp lệ!', type: 'error' });
            return;
        }

        if (masteryCount > 0) {
            try {
                await updateUserCoins(user.uid, masteryCount);
                setCoins(prevCoins => prevCoins + masteryCount);
            } catch (error) {
                console.error("Failed to update coins:", error);
            }
        }

        const newChain = [...wordChain, { word: submittedWord, author: 'player' as const }];
        setWordChain(newChain);
        setUsedWords(prev => new Set(prev).add(submittedWord));
        setPlayerInput('');
        setMessage(null);
        setGameState('aiTurn');
    }, [gameState, playerInput, user, wordChain, usedWords, allLearnedWords, masteryCount]);

    const handleWordClick = useCallback((word: string) => {
        const card = WORD_TO_CARD_MAP.get(word.toLowerCase());
        if (card) {
            setSelectedCard(card);
        } else {
            console.warn(`Flashcard for word "${word}" not found.`);
            setMessage({ text: `Không tìm thấy thông tin chi tiết cho từ "${word}".`, type: 'warning' });
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedCard(null);
    }, []);

    // --- Effects ---
    useEffect(() => {
        const prepareGame = async () => {
            setGameState('loading');
            try {
                if (user) {
                    const userData = await fetchOrCreateUser(user.uid);
                    setCoins(userData.coins || 0);
                    setMasteryCount(userData.masteryCards || 0);
                } else {
                    setCoins(0);
                    setMasteryCount(0);
                }

                const words = Array.from(WORD_TO_CARD_MAP.keys());
                if (words.length < 10) {
                    setMessage({ text: `Từ điển không đủ từ (cần >10).`, type: 'warning' });
                    setGameState('gameOver');
                } else {
                    setAllLearnedWords(new Set(words));
                }
            } catch (error) {
                console.error("Error preparing game data:", error);
                setMessage({ text: 'Lỗi khi tải dữ liệu của bạn.', type: 'error' });
                setGameState('gameOver');
            }
        };
        prepareGame();
    }, [user]);

    useEffect(() => {
        if (allLearnedWords.size > 0 && gameState === 'loading') {
            startGame();
        }
    }, [allLearnedWords, gameState, startGame]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [wordChain]);

    useEffect(() => {
        if (gameState === 'aiTurn') {
            const aiThinkTime = Math.random() * 1000 + 800;
            const timeoutId = setTimeout(handleAiMove, aiThinkTime);
            return () => clearTimeout(timeoutId);
        }
    }, [gameState, handleAiMove]);

    // --- Derived State ---
    const lastWord = wordChain.length > 0 ? wordChain[wordChain.length - 1].word : '';
    const nextChar = lastWord.slice(-1);
    const allWordsLoaded = allLearnedWords.size > 0;

    // --- Context Value ---
    const value = {
        gameState,
        wordChain,
        playerInput,
        message,
        selectedCard,
        coins,
        masteryCount,
        displayedCoins,
        chatContainerRef,
        lastWord,
        nextChar,
        allWordsLoaded,
        setPlayerInput,
        handlePlayerSubmit,
        startGame,
        handleWordClick,
        handleCloseModal,
    };

    return <WordChainContext.Provider value={value}>{children}</WordChainContext.Provider>;
};
