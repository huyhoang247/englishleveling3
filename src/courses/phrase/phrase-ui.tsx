// --- START OF FILE phrase-ui.tsx (REFACTORED - WITH COPY BUTTON) ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BackButton from '../../ui/back-button.tsx';
import { exampleData } from '../../voca-data/example-data.ts';
import { generateAudioUrlsForExamSentence } from '../../voca-data/audio-quiz-generator.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';

// --- START: Imports for Flashcard functionality ---
import FlashcardDetailModal from '../../story/flashcard.tsx';
import { WORD_TO_CARD_MAP, Flashcard as FlashcardData, exampleData as allExampleSentences } from '../../story/flashcard-data.ts';
// --- END: Imports for Flashcard functionality ---

// --- START: Imports for Game Mode functionality ---
import { GameSetupPopup, GameMode, GameSentenceData } from './phrase-game.tsx'; // Adjust path if needed
// --- END: Imports for Game Mode functionality ---

// --- Icons used in this component ---
const PauseIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> );
const VolumeUpIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg> );
const ChevronLeftIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> );
const ChevronRightIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg> );
const FunnelIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> );
const XMarkIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );
const CheckBadgeIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const SparklesIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.455-2.455L12.75 18l1.197-.398a3.375 3.375 0 002.455-2.455l.398-1.197.398 1.197a3.375 3.375 0 002.455 2.455l1.197.398-1.197.398a3.375 3.375 0 00-2.455 2.455z" /></svg>);
const GameControllerIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM16.5 12a.75.75 0 0 0-.75-.75h-3.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75Zm-6 0a.75.75 0 0 0-.75-.75H6a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" /></svg>);
const ClipboardIcon = ({ className }: { className: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg> );

const ITEMS_PER_PAGE = 50;
const PHRASES_PER_PAGE = 20;

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

interface PhraseData {
  indices: number[];
  uniqueCount: number;
}
const generateAllPhraseGroups = (): Map<number, Map<string, PhraseData>> => {
  const allPhraseGroups = new Map<number, Map<string, PhraseData>>();

  for (let phraseLength = 1; phraseLength <= 6; phraseLength++) {
    const tempPhraseMap = new Map<string, { indices: number[], uniqueSentences: Set<string> }>();

    exampleData.forEach((sentence, index) => {
      const words = sentence.english.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      if (words.length >= phraseLength) {
        for (let i = 0; i <= words.length - phraseLength; i++) {
          const phrase = words.slice(i, i + phraseLength).join(' ');
          
          if (!tempPhraseMap.has(phrase)) {
            tempPhraseMap.set(phrase, { indices: [], uniqueSentences: new Set() });
          }
          const entry = tempPhraseMap.get(phrase)!;
          entry.indices.push(index);
          entry.uniqueSentences.add(sentence.english.trim().toLowerCase());
        }
      }
    });
    
    const finalPhraseMap = new Map<string, PhraseData>();
    for (const [phrase, data] of tempPhraseMap.entries()) {
      if (data.indices.length > 1) {
        finalPhraseMap.set(phrase, {
          indices: data.indices,
          uniqueCount: data.uniqueSentences.size,
        });
      }
    }
    allPhraseGroups.set(phraseLength, finalPhraseMap);
  }
  return allPhraseGroups;
};
const allPhraseGroups = generateAllPhraseGroups();


// --- Filter Popup Component ---
interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilter: (phrase: string) => void;
  onClearFilter: () => void;
}
const FilterPopup: React.FC<FilterPopupProps> = ({ isOpen, onClose, onSelectFilter, onClearFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'freq'>('freq');
  const [currentPage, setCurrentPage] = useState(1);
  const [phraseLength, setPhraseLength] = useState(2);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortedAndFilteredPhrases = useMemo(() => {
    const currentPhraseMap = allPhraseGroups.get(phraseLength) || new Map();
    let phrases = Array.from(currentPhraseMap.entries()).map(([phrase, data]) => ({
      phrase,
      count: data.uniqueCount,
    }));

    if (debouncedSearchTerm) {
      phrases = phrases.filter(p => p.phrase.includes(debouncedSearchTerm.toLowerCase()));
    }
    if (sortBy === 'alpha') {
      phrases.sort((a, b) => a.phrase.localeCompare(b.phrase));
    } else { 
      phrases.sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase));
    }
    return phrases;
  }, [debouncedSearchTerm, sortBy, phraseLength]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortBy, phraseLength]);
  
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
        <div className="p-4 flex-shrink-0 space-y-4">
          <input
            type="text"
            placeholder="Search for a phrase..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Phrase Length (words)</label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map(len => (
                <button 
                  key={len} 
                  onClick={() => setPhraseLength(len)} 
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${phraseLength === len ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
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
                <p className="text-xs mt-1">Try changing phrase length or search term.</p>
              </div>
            )}
          </ul>
        </div>
        {totalPages > 1 && (
            <footer className="flex-shrink-0 border-t border-slate-700 p-3 flex justify-between items-center">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon className="w-5 h-5" /></button>
                <div className="text-sm font-medium text-slate-400">Page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span></div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRightIcon className="w-5 h-5" /></button>
            </footer>
        )}
      </div>
    </div>
  );
};
const MemoizedFilterPopup = React.memo(FilterPopup);

// --- Vocabulary Check Popup Component ---
interface VocabularyCheckPopupProps {
  isOpen: boolean;
  onClose: () => void;
}
const VocabularyCheckPopup: React.FC<VocabularyCheckPopupProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'matched' | 'unmatched'>('matched');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'freq' | 'alpha'>('freq');
  const [isCopied, setIsCopied] = useState(false); // New state for copy feedback
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const wordCheckResults = useMemo(() => {
    const wordSentenceMap = new Map<string, Set<string>>();
    exampleData.forEach(sentence => {
      const uniqueWordsInSentence = new Set(
        sentence.english.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean)
      );
      uniqueWordsInSentence.forEach(word => {
        if (!wordSentenceMap.has(word)) {
          wordSentenceMap.set(word, new Set());
        }
        wordSentenceMap.get(word)!.add(sentence.english.trim().toLowerCase());
      });
    });

    const uniqueVocabulary = [...new Set(defaultVocabulary.map(v => v.toLowerCase().trim()))];
    const matchedWords: { word: string; count: number }[] = [];
    const unmatchedWords: string[] = [];

    uniqueVocabulary.forEach(word => {
      if (wordSentenceMap.has(word)) {
        matchedWords.push({
          word,
          count: wordSentenceMap.get(word)!.size,
        });
      } else {
        unmatchedWords.push(word);
      }
    });

    return { 
      matchedWords, 
      unmatchedWords: unmatchedWords.sort(),
      total: uniqueVocabulary.length,
    };
  }, []);

  const sortedAndFilteredItems = useMemo(() => {
    if (activeTab === 'matched') {
      let items = [...wordCheckResults.matchedWords];
      if (sortBy === 'alpha') {
        items.sort((a, b) => a.word.localeCompare(b.word));
      } else { 
        items.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
      }
      if (debouncedSearchTerm) {
        return items.filter(item => item.word.includes(debouncedSearchTerm.toLowerCase()));
      }
      return items;
    } else {
      const items = wordCheckResults.unmatchedWords;
      if (debouncedSearchTerm) {
        return items.filter(word => word.includes(debouncedSearchTerm.toLowerCase()));
      }
      return items;
    }
  }, [activeTab, debouncedSearchTerm, wordCheckResults, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeTab, sortBy]);

  const itemsPerPage = activeTab === 'matched' ? PHRASES_PER_PAGE : ITEMS_PER_PAGE;
  const totalPages = Math.ceil(sortedAndFilteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, sortedAndFilteredItems, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCopyUnmatched = () => {
    if (wordCheckResults.unmatchedWords.length === 0) return;
    
    // Join all unmatched words with a newline character
    const textToCopy = wordCheckResults.unmatchedWords.join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Vocabulary Check</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 flex-shrink-0 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-xs text-slate-400">TOTAL</div>
                    <div className="text-2xl font-bold text-white">{wordCheckResults.total}</div>
                </div>
                <div>
                    <div className="text-xs text-green-400">MATCHED</div>
                    <div className="text-2xl font-bold text-green-400">{wordCheckResults.matchedWords.length}</div>
                </div>
                <div>
                    <div className="text-xs text-amber-400">UNMATCHED</div>
                    <div className="text-2xl font-bold text-amber-400">{wordCheckResults.unmatchedWords.length}</div>
                </div>
            </div>
             <input
                type="text"
                placeholder="Search for a word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div className="px-4 pb-4 flex-shrink-0">
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex gap-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('matched')} className={`shrink-0 border-b-2 px-1 pb-2 text-sm font-medium ${activeTab === 'matched' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}>
                        Matched
                    </button>
                    <button onClick={() => setActiveTab('unmatched')} className={`shrink-0 border-b-2 px-1 pb-2 text-sm font-medium ${activeTab === 'unmatched' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}>
                        Not Matched
                    </button>
                </nav>
            </div>
            {activeTab === 'matched' ? (
                <div className="flex justify-end gap-2 text-sm pt-3">
                    <button onClick={() => setSortBy('freq')} className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'freq' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Most Common</button>
                    <button onClick={() => setSortBy('alpha')} className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'alpha' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>A-Z</button>
                </div>
            ) : (
                <div className="flex justify-end gap-2 text-sm pt-3">
                    <button 
                        onClick={handleCopyUnmatched} 
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${isCopied ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                    >
                        {isCopied ? (
                            <span className="font-medium">Copied!</span>
                        ) : (
                            <>
                                <ClipboardIcon className="w-4 h-4" />
                                <span>Copy All</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>

        <div className="overflow-y-auto px-4 pb-4 flex-grow">
          {paginatedItems.length > 0 ? (
            activeTab === 'matched' ? (
              <ul className="space-y-2">
                {(paginatedItems as { word: string; count: number }[]).map(({ word, count }) => (
                  <li key={word} className="w-full text-left p-3 rounded-lg bg-slate-900 border border-slate-700 flex justify-between items-center">
                    <span className="font-medium text-slate-200">{word}</span>
                    <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(paginatedItems as string[]).map((word) => (
                  <li key={word} className="p-2 bg-slate-900 rounded-md text-slate-300 text-sm text-center font-mono border border-slate-700/50 truncate">
                    {word}
                  </li>
                ))}
              </ul>
            )
          ) : (
             <div className="text-center text-slate-400 py-8">
                <p>No matching words found.</p>
             </div>
          )}
        </div>
        {totalPages > 1 && (
            <footer className="flex-shrink-0 border-t border-slate-700 p-3 flex justify-between items-center">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon className="w-5 h-5" /></button>
                <div className="text-sm font-medium text-slate-400">Page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span></div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRightIcon className="w-5 h-5" /></button>
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
  const [audioState, setAudioState] = useState<{ index: number | null; isPlaying: boolean }>({ index: null, isPlaying: false });
  const listRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isVocaCheckOpen, setIsVocaCheckOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [showFlashcardWords, setShowFlashcardWords] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FlashcardData | null>(null);
  
  // --- START: State for Game Mode ---
  const [isGameSetupOpen, setIsGameSetupOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState<{ sentences: GameSentenceData[], difficulty: number | 'all' } | null>(null);
  // --- END: State for Game Mode ---

  const flashcardVocabularySet = useMemo(() => new Set(Array.from(WORD_TO_CARD_MAP.keys())), []);

  const indexedExampleData = useMemo(() => 
    exampleData.map((sentence, index) => ({ ...sentence, originalIndex: index })),
    []
  );

  const filteredData = useMemo(() => {
    let phraseFilteredData;
    if (!activeFilter) {
      phraseFilteredData = indexedExampleData;
    } else {
      let indices: number[] | undefined;
      for (const phraseMap of allPhraseGroups.values()) {
        if (phraseMap.has(activeFilter)) {
          indices = phraseMap.get(activeFilter)?.indices;
          break; 
        }
      }
      phraseFilteredData = indices ? indices.map(i => indexedExampleData[i]) : [];
    }
    
    const seen = new Set<string>();
    return phraseFilteredData.filter(item => {
      const normalizedEnglish = item.english.trim().toLowerCase();
      if (seen.has(normalizedEnglish)) {
        return false;
      } else {
        seen.add(normalizedEnglish);
        return true;
      }
    });
  }, [activeFilter, indexedExampleData]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentSentences = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredData]);
  
  const handleSelectFilter = useCallback((phrase: string) => {
    setActiveFilter(phrase);
    setCurrentPage(1);
    setIsFilterOpen(false);
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveFilter(null);
    setCurrentPage(1);
    setIsFilterOpen(false);
  }, []);

  const handleWordClick = useCallback((word: string) => {
    const card = WORD_TO_CARD_MAP.get(word.toLowerCase());
    if (card) {
      setSelectedCard(card);
    }
  }, []);

  const renderSentenceWithFlashcards = useCallback((sentence: string) => {
    if (!showFlashcardWords) {
      return sentence;
    }

    const parts = sentence.split(/(\s+|[.,?!])/g);

    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      if (flashcardVocabularySet.has(lowerPart)) {
        return (
          <button
            key={index}
            onClick={() => handleWordClick(part)}
            className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-150"
          >
            {part}
          </button>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  }, [showFlashcardWords, flashcardVocabularySet, handleWordClick]);
  
  const handleToggleAudio = useCallback((sentenceIndex: number) => {
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

  // --- START: Game Mode Handler ---
  const handleStartGame = useCallback((difficulty: number | 'all') => {
      const shuffled = [...filteredData].sort(() => 0.5 - Math.random());
      const selectedSentences = shuffled.slice(0, 10);
      
      setGameSettings({ sentences: selectedSentences, difficulty });
      setIsGameSetupOpen(false);
  }, [filteredData]);
  
  const handleExitGame = useCallback(() => setGameSettings(null), []);
  // --- END: Game Mode Handler ---

  if (gameSettings) {
    return (
        <GameMode 
            sentences={gameSettings.sentences} 
            difficulty={gameSettings.difficulty} 
            onExit={handleExitGame} 
        />
    );
  }

  return (
    <>
      <MemoizedFilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelectFilter={handleSelectFilter}
        onClearFilter={handleClearFilter}
      />
      <VocabularyCheckPopup
        isOpen={isVocaCheckOpen}
        onClose={() => setIsVocaCheckOpen(false)}
      />
      <GameSetupPopup
          isOpen={isGameSetupOpen}
          onClose={() => setIsGameSetupOpen(false)}
          onStartGame={handleStartGame}
          sentenceCount={filteredData.length}
      />
      <FlashcardDetailModal
        selectedCard={selectedCard}
        showVocabDetail={!!selectedCard}
        exampleSentencesData={allExampleSentences}
        onClose={() => setSelectedCard(null)}
        currentVisualStyle="default"
        zIndex={110}
      />

      <div className="h-full w-full bg-slate-900 flex flex-col text-white">
        <audio ref={audioRef} preload="auto" className="hidden" />
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm shadow-md flex-shrink-0">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center">
              <div className="w-24 flex"><BackButton onClick={onGoBack} /></div>
              <div className="flex-1 flex justify-center items-center">
              </div>
              <div className="w-auto flex justify-end items-center gap-1">
                 <button 
                  onClick={() => setIsGameSetupOpen(true)} 
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Game Mode"
                >
                    <GameControllerIcon className="w-6 h-6" />
                </button>
                 <button 
                  onClick={() => setIsVocaCheckOpen(true)} 
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Check Vocabulary"
                >
                    <CheckBadgeIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setShowFlashcardWords(prev => !prev)}
                  className={`p-2 rounded-full transition-colors ${showFlashcardWords ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                  title="Highlight Flashcard Words"
                >
                    <SparklesIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsFilterOpen(true)} 
                  className={`p-2 rounded-full transition-colors ${activeFilter ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                  title="Filter by phrase"
                >
                    <FunnelIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {activeFilter && (
          <div className="flex-shrink-0 bg-slate-800/50 border-b border-slate-700">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-12">
                 <div className="flex items-center gap-3">
                   <span className="text-sm font-semibold text-slate-400">Đang lọc theo:</span>
                   <span className="flex items-center gap-2 bg-blue-900/50 text-blue-300 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-800">
                     "{activeFilter}"
                   </span>
                 </div>
                 <button onClick={handleClearFilter} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700">
                   <XMarkIcon className="w-4 h-4" />
                   <span>Xóa bộ lọc</span>
                 </button>
              </div>
            </div>
          </div>
        )}

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
                  <p className="text-gray-200 text-base leading-relaxed font-medium pr-10">
                    {renderSentenceWithFlashcards(sentence.english)}
                  </p>
                  <p className="mt-2 text-gray-400 text-sm italic">{sentence.vietnamese}</p>
                </div>
              );
            })}
             {filteredData.length === 0 && (
                <div className="text-center text-slate-400 p-8 bg-slate-900/50 rounded-lg">
                    <h3 className="text-lg font-semibold">No results found</h3>
                    <p className="mt-1 text-sm">Try clearing the filters or choosing a different phrase.</p>
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

// --- END OF FILE phrase-ui.tsx (REFACTORED - WITH COPY BUTTON) ---
