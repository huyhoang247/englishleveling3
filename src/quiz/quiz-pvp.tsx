// --- START OF FILE: quiz-pvp.tsx ---

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from '../firebase.js';
import { collection, query, where, limit, getDocs, doc, setDoc, onSnapshot, updateDoc, deleteDoc, serverTimestamp, writeBatch, increment } from 'firebase/firestore';
import quizData from './quiz-data.ts';
import Confetti from '../fill-word/chuc-mung.tsx';

// --- Helper Functions & Components ---
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const BackIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );
const TrophyIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V22h4v-7.34"/><path d="M12 14.66L15.45 8.3A3 3 0 0 0 12.95 4h-1.9a3 3 0 0 0-2.5 4.3Z"/></svg> );
const CheckIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"></path></svg> );
const XIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const TimerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>);

const PVP_QUESTIONS_COUNT = 5;
const PVP_TIME_PER_QUESTION = 15;
const PVP_REWARD_COINS = 500;

// --- Main Component ---
export default function QuizPvp({ onGoBack }) {
  const [user, setUser] = useState(auth.currentUser);
  const [gameState, setGameState] = useState('searching'); // searching, playing, results
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(PVP_TIME_PER_QUESTION);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Matchmaking logic
  useEffect(() => {
    if (!user || gameState !== 'searching') return;

    let unsubscribeQueueListener;
    const matchmaking = async () => {
      // Look for a waiting player
      const q = query(
        collection(db, 'pvpQueue'),
        where('status', '==', 'waiting'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No one is waiting, create a new queue entry
        const myQueueRef = doc(collection(db, 'pvpQueue'));
        await setDoc(myQueueRef, {
          playerId: user.uid,
          playerName: user.displayName || 'Anonymous',
          status: 'waiting',
          createdAt: serverTimestamp(),
        });

        // Listen for this queue entry to be matched
        unsubscribeQueueListener = onSnapshot(myQueueRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().gameId) {
            setGameId(docSnap.data().gameId);
            setGameState('playing');
            deleteDoc(myQueueRef); // Clean up queue
          }
        });
      } else {
        // Found a waiting player, create a game
        const opponentQueueDoc = querySnapshot.docs[0];
        const opponent = opponentQueueDoc.data();

        if (opponent.playerId === user.uid) return; // Don't match with self

        const newGameId = doc(collection(db, 'pvpGames')).id;
        const questions = shuffleArray(quizData).slice(0, PVP_QUESTIONS_COUNT).map(q => ({
            ...q,
            options: shuffleArray(q.options)
        }));

        const newGameData = {
          players: {
            [user.uid]: { name: user.displayName || 'Anonymous', score: 0, answers: {} },
            [opponent.playerId]: { name: opponent.playerName, score: 0, answers: {} },
          },
          questions,
          currentQuestion: 0,
          status: 'playing',
          createdAt: serverTimestamp(),
        };

        const batch = writeBatch(db);
        // Create the game
        batch.set(doc(db, 'pvpGames', newGameId), newGameData);
        // Update opponent's queue entry with the gameId
        batch.update(opponentQueueDoc.ref, { status: 'matched', gameId: newGameId });
        
        await batch.commit();

        setGameId(newGameId);
        setGameState('playing');
      }
    };

    matchmaking();

    return () => { 
        if(unsubscribeQueueListener) unsubscribeQueueListener();
    };
  }, [user, gameState]);

  // Game state listener
  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = onSnapshot(doc(db, 'pvpGames', gameId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGameData(data);
        if (data.status === 'finished') {
          setGameState('results');
        }
      } else {
        // Game deleted or error
        onGoBack(); // Go back if game is gone
      }
    });
    return () => unsubscribe();
  }, [gameId, onGoBack]);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing' || !gameData) return;
    
    const currentQIndex = gameData.currentQuestion;
    const myAnswer = gameData.players[user.uid].answers[currentQIndex];

    if (myAnswer !== undefined) { // If I have answered
        return; // Stop the timer for me
    }

    setTimeLeft(PVP_TIME_PER_QUESTION);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswer(null); // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, gameData?.currentQuestion]);

  const handleAnswer = async (selectedAnswer) => {
    if (!gameData || !user) return;
    
    const currentQIndex = gameData.currentQuestion;
    const myAnswers = gameData.players[user.uid].answers;

    // Prevent re-answering
    if (myAnswers[currentQIndex] !== undefined) return;

    const question = gameData.questions[currentQIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const scoreGained = isCorrect ? (100 + timeLeft * 5) : 0; // Score based on speed

    const playerUpdatePath = `players.${user.uid}`;
    await updateDoc(doc(db, 'pvpGames', gameId), {
      [`${playerUpdatePath}.answers.${currentQIndex}`]: { answer: selectedAnswer, isCorrect },
      [`${playerUpdatePath}.score`]: increment(scoreGained),
    });
  };

  const opponentId = useMemo(() => {
    if (!gameData || !user) return null;
    return Object.keys(gameData.players).find(id => id !== user.uid);
  }, [gameData, user]);

  // Logic to move to next question or end game
  useEffect(() => {
    if (!gameData || !user || !opponentId) return;

    const currentQIndex = gameData.currentQuestion;
    const myAnswer = gameData.players[user.uid]?.answers[currentQIndex];
    const opponentAnswer = gameData.players[opponentId]?.answers[currentQIndex];

    if (myAnswer !== undefined && opponentAnswer !== undefined) {
      // Both players answered, move to next
      setTimeout(async () => {
        if (currentQIndex < PVP_QUESTIONS_COUNT - 1) {
          await updateDoc(doc(db, 'pvpGames', gameId), {
            currentQuestion: increment(1)
          });
        } else {
          // End of game
          // Re-fetch final data to avoid race condition
          const finalGameDoc = await getDoc(doc(db, 'pvpGames', gameId));
          if (!finalGameDoc.exists()) return;
          const finalGameData = finalGameDoc.data();

          const myScore = finalGameData.players[user.uid].score;
          const opponentScore = finalGameData.players[opponentId].score;
          const winnerId = myScore > opponentScore ? user.uid : (opponentScore > myScore ? opponentId : 'draw');
          
          await updateDoc(doc(db, 'pvpGames', gameId), {
            status: 'finished',
            winner: winnerId,
          });

          // Award coins to winner
          if(winnerId === user.uid) {
            await updateDoc(doc(db, 'users', user.uid), {
              coins: increment(PVP_REWARD_COINS)
            });
          }
        }
      }, 2000); // 2-second delay to see results
    }
  }, [gameData, user, opponentId]);


  const renderSearching = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-2 border-4 border-blue-500/50 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <img src={user?.photoURL || 'https://i.pravatar.cc/150'} alt="player" className="w-24 h-24 rounded-full shadow-lg border-4 border-white"/>
        </div>
      </div>
      <h2 className="text-3xl font-bold mt-12 animate-pulse">Đang tìm đối thủ...</h2>
      <p className="text-blue-300 mt-2">Hãy sẵn sàng cho trận chiến!</p>
      <button onClick={onGoBack} className="mt-16 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition">
        Hủy
      </button>
    </div>
  );

  const renderPlaying = () => {
    if (!gameData || !user || !opponentId) return renderSearching(); // Show loading/searching until data is ready
    
    const question = gameData.questions[gameData.currentQuestion];
    const myData = gameData.players[user.uid];
    const opponentData = gameData.players[opponentId];
    const myAnswerData = myData.answers[gameData.currentQuestion];
    const opponentAnswerData = opponentData.answers[gameData.currentQuestion];
    const haveBothAnswered = myAnswerData !== undefined && opponentAnswerData !== undefined;


    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 sm:p-6">
        {/* Players Info */}
        <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
                <img src={user?.photoURL || 'https://i.pravatar.cc/80?u=' + user.uid} alt="You" className="w-16 h-16 mx-auto rounded-full border-4 border-blue-400 shadow-lg"/>
                <p className="font-bold mt-1 truncate">{myData.name}</p>
                <p className="text-xl font-black text-blue-300">{myData.score}</p>
            </div>
            <div className="text-4xl font-bold text-red-500 px-4">VS</div>
            <div className="text-center flex-1">
                <img src={'https://i.pravatar.cc/80?u=' + opponentId} alt="Opponent" className="w-16 h-16 mx-auto rounded-full border-4 border-gray-500 shadow-lg"/>
                <p className="font-bold mt-1 truncate">{opponentData.name}</p>
                <p className="text-xl font-black text-gray-400">{opponentData.score}</p>
            </div>
        </div>

        {/* Progress and Timer */}
        <div className="flex justify-between items-center bg-black/30 rounded-lg p-2 mb-6">
            <div className="font-bold text-sm">Câu {gameData.currentQuestion + 1} / {PVP_QUESTIONS_COUNT}</div>
            <div className="flex items-center font-bold text-lg bg-black/50 rounded-full px-3 py-1">
                <TimerIcon />
                <span>{timeLeft}</span>
            </div>
        </div>
        
        {/* Question */}
        <div className="bg-white/10 p-5 rounded-lg text-center mb-6 shadow-inner">
            <h2 className="text-xl sm:text-2xl font-semibold leading-tight">{question.question}</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
          {question.options.map((option, index) => {
            const isMyAnswer = myAnswerData?.answer === option;
            const isCorrect = option === question.correctAnswer;
            let buttonClass = 'bg-white/10 hover:bg-white/20';
            let icon = null;

            if(haveBothAnswered) { 
                if (isCorrect) {
                  buttonClass = 'bg-green-500/80 ring-2 ring-white';
                  icon = <CheckIcon className="w-6 h-6 ml-auto" />;
                } else if (isMyAnswer) {
                  buttonClass = 'bg-red-500/80';
                  icon = <XIcon className="w-6 h-6 ml-auto" />;
                } else {
                  buttonClass = 'bg-white/5 opacity-60';
                }
            } else if (myAnswerData !== undefined) {
                if(isMyAnswer) buttonClass = 'bg-yellow-500/80 animate-pulse';
                else buttonClass = 'bg-white/5 opacity-60';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={myAnswerData !== undefined}
                className={`p-4 rounded-lg text-lg font-medium transition-all duration-300 flex items-center ${buttonClass}`}
              >
                <span>{option}</span>
                {icon}
              </button>
            )
          })}
        </div>
      </div>
    );
  };
  
  const renderResults = () => {
    if (!gameData || !user || !opponentId) return <div className="text-white">Đang tải kết quả...</div>;

    const winnerId = gameData.winner;
    const isWinner = winnerId === user.uid;
    const isDraw = winnerId === 'draw';
    const myData = gameData.players[user.uid];
    const opponentData = gameData.players[opponentId];
    
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 text-white text-center transition-all duration-500 ${isDraw ? 'bg-gradient-to-br from-gray-700 to-gray-900' : (isWinner ? 'bg-gradient-to-br from-green-800 to-gray-900' : 'bg-gradient-to-br from-red-800 to-gray-900')}`}>
        {isWinner && <Confetti />}
        <TrophyIcon className={`w-24 h-24 mb-4 ${isDraw ? 'text-gray-400' : (isWinner ? 'text-yellow-400' : 'text-gray-500')}`} />
        <h1 className="text-5xl font-extrabold mb-2">
            {isDraw ? "HÒA!" : (isWinner ? "CHIẾN THẮNG!" : "THẤT BẠI!")}
        </h1>
        <p className="text-xl text-white/80 mb-8">
            {isDraw ? 'Một trận đấu ngang tài ngang sức!' : (isWinner ? `Bạn nhận được ${PVP_REWARD_COINS} vàng!` : 'Cố gắng hơn ở lần sau nhé!')}
        </p>

        <div className="bg-black/40 rounded-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center text-2xl font-bold border-b border-white/20 pb-4">
                <span className={`${isWinner || isDraw ? 'text-green-400' : 'text-red-400'}`}>{myData.score}</span>
                <span className="text-gray-400 text-lg">Điểm</span>
                <span className={`${!isWinner || isDraw ? 'text-green-400' : 'text-red-400'}`}>{opponentData.score}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold pt-4 text-white/70">
                <span className="truncate">{myData.name} (Bạn)</span>
                <span className="truncate">{opponentData.name}</span>
            </div>
        </div>

        <button onClick={() => setGameState('searching')} className="mt-12 px-8 py-3 bg-white text-gray-900 font-bold rounded-full text-lg hover:scale-105 transition-transform">
          Chơi Lại
        </button>
        <button onClick={onGoBack} className="mt-4 text-white/60 hover:text-white transition">
          Thoát
        </button>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-gray-900">
      <header className="absolute top-0 left-0 p-4 z-10">
        {(gameState === 'playing' || gameState === 'searching') && (
          <button onClick={onGoBack} className="group w-9 h-9 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/25 transition-all">
            <BackIcon className="w-4 h-4 text-white/80 group-hover:text-white" />
          </button>
        )}
      </header>
      {
        {
          'searching': renderSearching(),
          'playing': renderPlaying(),
          'results': renderResults(),
        }[gameState]
      }
    </div>
  );
}
// --- END OF FILE: quiz-pvp.tsx ---
