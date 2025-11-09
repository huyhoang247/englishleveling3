// --- START OF FILE: phrase-viewer.tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BackButton from '../../ui/back-button.tsx';
import { exampleData } from '../../voca-data/example-data.ts';
import { generateAudioUrlsForExamSentence } from '../../voca-data/audio-quiz-generator.ts';

// --- Icons used in this component ---
const PauseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> );
const VolumeUpIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg> );
const ChevronLeftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );
const ChevronRightIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg> );

const ITEMS_PER_PAGE = 50;

interface PhraseViewerProps {
  onGoBack: () => void;
}

const PhraseViewer: React.FC<PhraseViewerProps> = ({ onGoBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, setAudioState] = useState<{ index: number | null; isPlaying: boolean }>({
    index: null,
    isPlaying: false,
  });
  const listRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(exampleData.length / ITEMS_PER_PAGE);

  const currentSentences = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return exampleData.slice(startIndex, endIndex).map((sentence, index) => ({
      ...sentence,
      originalIndex: startIndex + index,
    }));
  }, [currentPage]);

  const handleToggleAudio = useCallback((sentenceIndex: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audioState.index === sentenceIndex) {
      if (audio.paused) {
        audio.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audio.pause();
      }
    } else {
      const urls = generateAudioUrlsForExamSentence(sentenceIndex);
      if (urls && urls['Matilda']) {
        audio.src = urls['Matilda'];
        audio.play().catch(e => console.error("Error playing audio:", e));
        setAudioState({ index: sentenceIndex, isPlaying: true });
      } else {
        console.warn(`No audio found for sentence index: ${sentenceIndex}`);
        setAudioState({ index: null, isPlaying: false });
      }
    }
  }, [audioState.index]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setAudioState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setAudioState(prev => ({ ...prev, isPlaying: false }));
    const handleEnded = () => setAudioState({ index: null, isPlaying: false });

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (audioRef.current) {
        audioRef.current.pause();
        setAudioState({ index: null, isPlaying: false });
    }
    if (listRef.current) {
        listRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col text-white">
      <audio ref={audioRef} preload="auto" className="hidden" />
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm shadow-md flex-shrink-0">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center">
            <div className="w-24 flex"><BackButton onClick={onGoBack} /></div>
            <div className="flex-1 flex justify-center px-4"><h1 className="text-lg font-bold text-slate-200 truncate">Example Phrases</h1></div>
            <div className="w-24" />
          </div>
        </div>
      </header>
      <main ref={listRef} className="flex-grow overflow-y-auto bg-black p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {currentSentences.map((sentence) => {
            const isCurrentAudio = audioState.index === sentence.originalIndex;
            const isThisPlaying = isCurrentAudio && audioState.isPlaying;
            return (
              <div key={sentence.originalIndex} className="relative bg-gray-900/70 p-4 rounded-xl border border-gray-800">
                <button 
                  onClick={() => handleToggleAudio(sentence.originalIndex)} 
                  className={`absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${isThisPlaying ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} 
                  aria-label={isThisPlaying ? 'Dừng phát' : 'Phát âm'}
                >
                  {isThisPlaying ? <PauseIcon className="w-4 h-4" /> : <VolumeUpIcon className="w-4 h-4" />}
                </button>
                <p className="text-gray-200 text-base leading-relaxed font-medium pr-10">{sentence.english}</p>
                <p className="mt-2 text-gray-400 text-sm italic">{sentence.vietnamese}</p>
              </div>
            );
          })}
        </div>
      </main>
      <footer className="sticky bottom-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto p-3 flex justify-between items-center">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <div className="text-sm font-medium text-slate-400">
            Page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span>
          </div>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PhraseViewer;
// --- END OF FILE: phrase-viewer.tsx ---
