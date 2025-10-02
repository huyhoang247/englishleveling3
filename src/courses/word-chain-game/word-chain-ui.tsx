// --- START OF FILE: src/word-chain.tsx (Updated for UI blending, keyboard.tsx unchanged) ---

import { useState, useEffect, Fragment } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// --- Centralized Data Imports ---
import { exampleData } from '../../story/flashcard-data.ts';

// --- Context and Hook Imports ---
import { WordChainProvider, useWordChain } from './word-chain-context.tsx';

// --- Component Imports ---
import FlashcardDetailModal from '../../story/flashcard.tsx';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import HomeButton from '../../ui/home-button.tsx';
import MasteryDisplay from '../../ui/display/mastery-display.tsx';
import VirtualKeyboard from '../../ui/keyboard.tsx'; // Import bàn phím ảo

// --- Icons (Giữ nguyên) ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

// --- The new "View" Component ---
const WordChainGameView = ({ onGoBack }: { onGoBack: () => void }) => {
    // Consume all state and logic from the context
    const {
        gameState, wordChain, playerInput, message, selectedCard, masteryCount,
        displayedCoins, chatContainerRef, nextChar, allWordsLoaded, setPlayerInput,
        handlePlayerSubmit, startGame, handleWordClick, handleCloseModal,
    } = useWordChain();

    // Render function for the chain remains here as it's pure UI
    const renderChain = () => {
        return wordChain.map((entry, index) => {
            const isPlayer = entry.author === 'player';
            return (
                <div key={index} className={`flex items-center gap-2 w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                    {!isPlayer && <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/bot-icon.webp" alt="Bot" className="flex-shrink-0 w-8 h-8 rounded-full object-cover" />}
                    <button
                        onClick={() => handleWordClick(entry.word)}
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-lg text-left relative shadow-md transition-all duration-300 transform animate-pop-in hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${isPlayer
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-lg'
                                : 'bg-white text-gray-800 rounded-bl-lg'
                            }`}>
                        <span className="font-bold text-yellow-300">{entry.word.charAt(0).toUpperCase()}</span>
                        <span>{entry.word.slice(1).toLowerCase()}</span>
                    </button>
                    {isPlayer && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><UserIcon /></div>}
                </div>
            );
        });
    };

    return (
        <Fragment>
            <div className="fixed inset-0 z-[51] bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col">
                <header className="flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-md">
                    <div className="flex h-14 items-center justify-between px-4">
                        <div className="flex justify-start">
                           <HomeButton onClick={onGoBack} label="Home" />
                        </div>
                        <div className="flex items-center gap-2">
                            <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                            <MasteryDisplay masteryCount={masteryCount} />
                        </div>
                    </div>
                </header>

                <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                    {renderChain()}
                    {gameState === 'aiTurn' && (
                        <div className="flex items-center gap-2 justify-start animate-pop-in">
                            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/bot-icon.webp" alt="Bot typing" className="flex-shrink-0 w-8 h-8 rounded-full object-cover" />
                            <div className="max-w-[70%] rounded-2xl px-4 py-2 text-lg bg-white rounded-bl-lg shadow-md flex items-center gap-1">
                                <span className="animate-pulse-dot bg-gray-400"></span>
                                <span className="animate-pulse-dot bg-gray-400 delay-150"></span>
                                <span className="animate-pulse-dot bg-gray-400 delay-300"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* UPDATED: Input area container is now transparent */}
                <div className="p-4 border-t border-gray-200/60">
                    {message && !selectedCard && (
                        <div className={`mb-3 p-3 rounded-lg text-center text-sm font-medium animate-pop-in
                        ${message.type === 'error' && 'bg-red-100/80 text-red-800'}
                        ${message.type === 'success' && 'bg-green-100/80 text-green-800'}
                        ${message.type === 'warning' && 'bg-yellow-100/80 text-yellow-800'}
                        ${message.type === 'info' && 'bg-blue-100/80 text-blue-800'}
                    `}>
                            {message.text}
                        </div>
                    )}

                    {gameState === 'gameOver' ? (
                        <button onClick={startGame} disabled={!allWordsLoaded} className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed">
                            Chơi lại
                        </button>
                    ) : (
                        <Fragment>
                            <form onSubmit={handlePlayerSubmit} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-200/80 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl font-bold text-indigo-500">{nextChar.toUpperCase()}</span>
                                </div>
                                {/* UPDATED: Input field is now transparent */}
                                <input
                                    type="text"
                                    value={playerInput}
                                    readOnly
                                    placeholder={gameState === 'playerTurn' ? 'Sử dụng bàn phím bên dưới...' : "Đợi máy..."}
                                    disabled={gameState !== 'playerTurn'}
                                    className="w-full text-lg p-3 bg-transparent border border-gray-400/50 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition cursor-default placeholder:text-gray-500 text-gray-800"
                                    autoComplete="off"
                                    autoCapitalize="none"
                                />
                                <button type="submit" disabled={gameState !== 'playerTurn' || !playerInput.trim()} className="flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
                                    <SendIcon />
                                </button>
                            </form>
                            <div className="mt-4">
                                <VirtualKeyboard
                                    userInput={playerInput}
                                    setUserInput={setPlayerInput}
                                    wordLength={99}
                                    disabled={gameState !== 'playerTurn'}
                                />
                            </div>
                        </Fragment>
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

            <FlashcardDetailModal
                selectedCard={selectedCard}
                showVocabDetail={!!selectedCard}
                onClose={handleCloseModal}
                exampleSentencesData={exampleData}
                currentVisualStyle="default"
                zIndex={100}
            />
        </Fragment>
    );
};

// --- The main export now wraps the View with the Provider ---
export default function WordChainGame({ onGoBack }: { onGoBack: () => void }) {
    const [user, setUser] = useState(auth.currentUser);

    // Handles authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Provide the user object to the game's logic context
    return (
        <WordChainProvider user={user}>
            <WordChainGameView onGoBack={onGoBack} />
        </WordChainProvider>
    );
}
