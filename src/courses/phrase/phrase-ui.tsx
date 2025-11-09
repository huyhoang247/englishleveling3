import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BackButton from '../../ui/back-button.tsx';
import { exampleData } from '../../voca-data/example-data.ts';
import { generateAudioUrlsForExamSentence } from '../../voca-data/audio-quiz-generator.ts';

// --- Icons used in this component ---
const PauseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> );
const VolumeUpIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg> );
const ChevronLeftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );
const ChevronRightIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg> );
const FunnelIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> );
const XMarkIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );

const ITEMS_PER_PAGE = 50;
const PHRASES_PER_PAGE = 20; // <-- ĐÃ CẬP NHẬT: Số cụm từ mỗi trang trong popup filter

// --- Helper function to process and group sentences by 2-word phrases ---
const generatePhraseGroups = () => {
  const phraseMap = new Map<string, number[]>();

  exampleData.forEach((sentence, index) => {
    const words = sentence.english
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i+1]}`;
      if (!phraseMap.has(phrase)) {
        phraseMap.set(phrase, []);
      }
      phraseMap.get(phrase)!.push(index);
    }
  });

  const filteredPhraseMap = new Map<string, number[]>();
  for (const [phrase, indices] of phraseMap.entries()) {
    if (indices.length > 1) {
      filteredPhraseMap.set(phrase, indices);
    }
  }

  return filteredPhraseMap;
};

// --- Filter Popup Component ---
interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilter: (phrase: string) => void;
  onClearFilter: () => void;
  phraseGroups: Map<string, number[]>;
}

const FilterPopup: React.FC<FilterPopupProps> = ({ isOpen, onClose, onSelectFilter, onClearFilter, phraseGroups }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'freq'>('freq');
  const [currentPage, setCurrentPage] = useState(1);
  
  const sortedAndFilteredPhrases = useMemo(() => {
    let phrases = Array.from(phraseGroups.entries()).map(([phrase, indices]) => ({
      phrase,
      count: indices.length,
    }));

    if (searchTerm) {
      phrases = phrases.filter(p => p.phrase.includes(searchTerm.toLowerCase()));
    }

    if (sortBy === 'alpha') {
      phrases.sort((a, b) => a.phrase.localeCompare(b.phrase));
    } else { // 'freq'
      phrases.sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase));
    }
    return phrases;
  }, [phraseGroups, searchTerm, sortBy]);
  
  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // Pagination logic for the popup
  const totalPages = Math.ceil(sortedAndFilteredPhrases.length / PHRASES_PER_PAGE);
  const paginatedPhrases = useMemo(() => {
    const startIndex = (currentPage - 1) * PHRASES_PER_PAGE;
    return sortedAndFilteredPhrases.slice(startIndex, startIndex + PHRASES_PER_PAGE);
  }, [currentPage, sortedAndFilteredPhrases]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Filter by Phrase</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-4 flex-shrink-0 space-y-3">
          <input
            type="text"
            placeholder="Search for a phrase..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center">
             <div className="flex gap-2 text-sm">
                <button onClick={() => setSortBy('freq')} className={`px-3 py-1 rounded-md ${sortBy === 'freq' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Most Common</button>
                <button onClick={() => setSortBy('alpha')} className={`px-3 py-1 rounded-md ${sortBy === 'alpha' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>A-Z</button>
             </div>
             <button onClick={onClearFilter} className="px-3 py-1 text-sm text-blue-400 hover:bg-slate-700 rounded-md">Clear Filter</button>
          </div>
        </div>
        <div className="overflow-y-auto px-4 pb-4 flex-grow">
          <ul className="space-y-2">
            {paginatedPhrases.length > 0 ? paginatedPhrases.map(({ phrase, count }) => (
              <li key={phrase}>
                <button onClick={() => onSelectFilter(phrase)} className="w-full text-left p-3 rounded-lg bg-slate-900 hover:bg-slate-700/50 border border-slate-700 transition-colors flex justify-between items-center">
                  <span className="font-medium text-slate-200">"{phrase}"</span>
                  <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{count}</span>
                </button>
              </li>
            )) : (
              <div className="text-center text-slate-400 py-8">
                <p>No matching phrases found.</p>
              </div>
            )}
          </ul>
        </div>
        {totalPages > 1 && (
            <footer className="flex-shrink-0 border-t border-slate-700 p-3 flex justify-between items-center">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div className="text-sm font-medium text-slate-400">
                    Page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span>
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};


// --- Main Viewer Component ---
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
  
  // --- Filter State ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Pre-calculate phrase groups once
  const phraseGroups = useMemo(() => generatePhraseGroups(), []);

  // Determine the list of sentences to display based on the active filter
  const filteredData = useMemo(() => {
    if (!activeFilter) {
      return exampleData;
    }
    const indices = phraseGroups.get(activeFilter);
    return indices ? indices.map(i => exampleData[i]) : [];
  }, [activeFilter, phraseGroups]);


  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentSentences = useMemo(() => {
    // We need to map back to original index for audio playback and keys
    const dataWithOriginalIndex = filteredData.map((sentence) => {
        const originalIndex = exampleData.findIndex(s => s.english === sentence.english && s.vietnamese === sentence.vietnamese);
        return { ...sentence, originalIndex };
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return dataWithOriginalIndex.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);
  
  // --- Filter Handlers ---
  const handleSelectFilter = (phrase: string) => {
    setActiveFilter(phrase);
    setCurrentPage(1); // Reset to first page
    setIsFilterOpen(false);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };
  
  // --- Audio Handlers ---
  const handleToggleAudio = useCallback((sentenceIndex: number) => {
    // ... (rest of audio logic is unchanged)
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audioState.index === sentenceIndex && audioState.isPlaying) {
        audio.pause();
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
  }, [audioState.index, audioState.isPlaying]);

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
    <>
      <FilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelectFilter={handleSelectFilter}
        onClearFilter={handleClearFilter}
        phraseGroups={phraseGroups}
      />
      <div className="h-full w-full bg-slate-900 flex flex-col text-white">
        <audio ref={audioRef} preload="auto" className="hidden" />
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm shadow-md flex-shrink-0">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center">
              <div className="w-24 flex"><BackButton onClick={onGoBack} /></div>
              <div className="flex-1 flex justify-center items-center gap-2 px-2">
                <h1 className="text-lg font-bold text-slate-200 truncate">Example Phrases</h1>
                {activeFilter && (
                   <span className="flex items-center gap-2 bg-blue-900/50 text-blue-300 text-xs font-medium px-2 py-1 rounded-full border border-blue-800">
                     {activeFilter}
                     <button onClick={handleClearFilter} className="text-blue-400 hover:text-white">
                       <XMarkIcon className="w-3 h-3" />
                     </button>
                   </span>
                )}
              </div>
              <div className="w-24 flex justify-end">
                <button onClick={() => setIsFilterOpen(true)} className={`p-2 rounded-full transition-colors ${activeFilter ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                    <FunnelIcon className="w-5 h-5" />
                </button>
              </div>
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
             {filteredData.length === 0 && (
                <div className="text-center text-slate-400 p-8 bg-slate-900/50 rounded-lg">
                    <h3 className="text-lg font-semibold">No results found</h3>
                    <p className="mt-1 text-sm">Try clearing the filter or choosing a different phrase.</p>
                </div>
             )}
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
              Page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages || 1}</span>
            </div>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PhraseViewer;
