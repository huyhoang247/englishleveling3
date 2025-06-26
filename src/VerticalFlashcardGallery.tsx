// src/VerticalFlashcardGallery.tsx (Đầy đủ, phiên bản cuối cùng)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import FlashcardDetailModal from './story/flashcard.tsx';
import AddToPlaylistModal from './AddToPlaylistModal.tsx';
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts';
import { auth, db } from './firebase.js';
import { defaultVocabulary } from './list-vocabulary.ts';
import { SidebarLayout } from './sidebar-story.tsx';
import { VirtualizedFlashcardGrid } from './story/VirtualizedFlashcardGrid.tsx';
import GalleryHeader from './story/GalleryHeader.tsx';

// --- Interfaces and Data ---
interface Playlist { id: string; name: string; cardIds: number[]; isPinned?: boolean; }
interface VerticalFlashcardGalleryProps { hideNavBar: () => void; showNavBar: () => void; currentUser: User | null; }
interface StyledImageUrls { default: string; anime?: string; comic?: string; realistic?: string; }
interface VocabularyData { word: string; meaning: string; example: string; phrases: string[]; popularity: string; synonyms: string[]; antonyms: string[]; }
interface Flashcard { id: number; imageUrl: StyledImageUrls; vocabulary: VocabularyData; }
interface DisplayCard { card: Flashcard; isFavorite: boolean; }

const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) { urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`); }
  return urls;
};

const numberOfSampleFlashcards = 3200;
const defaultImageUrls: string[] = [ ...initialDefaultImageUrls, ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0') ];
const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');

const generatePlaceholderVocabulary = (count: number): VocabularyData[] => {
  const data: VocabularyData[] = [];
  for (let i = 1; i <= count; i++) { data.push({ word: `Word ${i}`, meaning: `Meaning of Word ${i}`, example: `Example sentence for Word ${i}.`, phrases: [`Phrase A ${i}`, `Phrase B ${i}`], popularity: i % 3 === 0 ? "Cao" : i % 2 === 0 ? "Trung bình" : "Thấp", synonyms: [`Synonym 1.${i}`, `Synonym 2.${i}`], antonyms: [`Antonym 1.${i}`, `Antonym 2.${i}`] }); }
  return data;
};

const initialVocabularyData: VocabularyData[] = [
  { word: "Source", meaning: "Nguồn, gốc", example: "What is the source of this information?", phrases: ["Information source", "Primary source"], popularity: "Cao", synonyms: ["Origin", "Root", "Beginning"], antonyms: ["Result", "Outcome", "End"] },
  { word: "Insurance", meaning: "Bảo hiểm", example: "You should buy travel insurance before your trip.", phrases: ["Health insurance", "Car insurance"], popularity: "Cao", synonyms: ["Assurance", "Coverage", "Protection"], antonyms: ["Risk", "Danger", "Exposure"] },
  { word: "Argument", meaning: "Cuộc tranh luận, lý lẽ", example: "They had a heated argument about politics.", phrases: ["Strong argument", "Logical argument"], popularity: "Trung bình", synonyms: ["Dispute", "Debate", "Reasoning"], antonyms: ["Agreement", "Harmony", "Peace"] },
  { word: "Influence", meaning: "Ảnh hưởng", example: "His parents had a strong influence on his career choice.", phrases: ["Direct influence", "Negative influence"], popularity: "Cao", synonyms: ["Impact", "Effect", "Control"], antonyms: ["Lack of effect", "Insignificance"] },
  { word: "Vocabulary 5", meaning: "Nghĩa của từ vựng 5", example: "Ví dụ cho từ vựng 5.", phrases: ["Cụm từ 1", "Cụm từ 2"], popularity: "Thấp", synonyms: ["Từ đồng nghĩa 1", "Từ trái nghĩa 2"], antonyms: ["Từ trái nghĩa 1", "Từ trái nghĩa 2"] }
];
const vocabularyData: VocabularyData[] = [ ...initialVocabularyData, ...generatePlaceholderVocabulary(Math.max(0, numberOfSampleFlashcards - initialVocabularyData.length)) ];

const ALL_CARDS_MAP: Map<number, Flashcard> = new Map(
    Array.from({ length: numberOfSampleFlashcards }, (_, i) => {
        const vocab = vocabularyData[i] || { word: `Word ${i + 1}`, meaning: `Meaning ${i + 1}`, example: `Example ${i + 1}`, phrases:[], popularity: 'Thấp', synonyms:[], antonyms:[] };
        const imageUrls: StyledImageUrls = {
            default: defaultImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Default+${i + 1}`,
            anime: animeImageUrls[i] || `https://placehold.co/1024x1536/FF99CC/FFFFFF?text=Anime+${i + 1}`,
            comic: comicImageUrls[i] || `https://placehold.co/1024x1536/66B2FF/FFFFFF?text=Comic+${i + 1}`,
            realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${i + 1}`,
        };
        const card: Flashcard = { id: i + 1, imageUrl: imageUrls, vocabulary: vocab };
        return [i + 1, card];
    })
);

const exampleImages = [ "https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1", "https://placehold.co/1024x1536/33FF57/FFFFFF?text=Example+2", "https://placehold.co/1024x1536/3357FF/FFFFFF?text=Example+3", "https://placehold.co/1024x1536/FF33A1/FFFFFF?text=Example+4", "https://placehold.co/1024x1536/A133FF/FFFFFF?text=Example+5" ];
const animations = `@keyframes fadeInOut { 0% { opacity: 0; transform: translateY(-10px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } } @keyframes slideIn { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } } @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } } @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } @keyframes modalBackdropIn { 0% { opacity: 0; } 100% { opacity: 0.5; } } @keyframes modalIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } } @keyframes animeSparkle { 0%, 100% { opacity: 0; } 50% { opacity: 1; } } @keyframes comicPop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } } @keyframes realisticShine { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }`;
const scrollbarHide = `.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`;

export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  const [activeTab, setActiveTab] = useState<'collection' | 'favorite'>('collection');
  const [layoutMode, setLayoutMode] = useState<'single' | 'double'>('single');
  const [visualStyle, setVisualStyle] = useState('default');
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedCardForPlaylist, setSelectedCardForPlaylist] = useState<number[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [activeScreen, setActiveScreen] = useState('home');
  const [toggleSidebar, setToggleSidebar] = useState<(() => void) | null>(null);

  const allFavoriteCardIds = useMemo(() => new Set(playlists.flatMap(p => p.cardIds)), [playlists]);

  useEffect(() => {
    if (!currentUser) { setLoading(false); setOpenedImageIds([]); setPlaylists([]); return; }
    setLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setOpenedImageIds(Array.isArray(userData.openedImageIds) ? userData.openedImageIds : []);
        setPlaylists(Array.isArray(userData.playlists) ? userData.playlists : []);
      } else {
        const examplePlaylists: Playlist[] = [{id: 'pl1', name: 'Voca 1', cardIds: [1,2,3,4], isPinned: true}, {id: 'pl2', name: 'Voca 2', cardIds: [5], isPinned: false}, {id: 'pl3', name: 'Test 3', cardIds: Array.from({length: 362}, (_, i) => i + 6), isPinned: false}, {id: 'pl4', name: 'IELTS Vocabulary for Reading Section - Unit 1', cardIds: [368, 369], isPinned: false}, {id: 'pl5', name: 'Từ vựng chuyên ngành CNTT', cardIds: [370, 371, 372], isPinned: false}];
        setPlaylists(examplePlaylists);
        setOpenedImageIds([]);
      }
      setLoading(false);
    }, (error) => { setLoading(false); console.error("Error fetching user data:", error) });
    return () => unsubscribe();
  }, [currentUser]);

  const filteredFlashcardsByTab = useMemo((): DisplayCard[] => {
    const getDisplayCard = (id: number): DisplayCard | undefined => {
        const card = ALL_CARDS_MAP.get(id);
        if (!card) return undefined;
        return { card, isFavorite: allFavoriteCardIds.has(id) };
    };
    let cardIdsToShow: number[] = [];
    if (activeTab === 'collection') {
        cardIdsToShow = [...openedImageIds].reverse();
    } else if (activeTab === 'favorite') {
        if (selectedPlaylistId === 'all') {
            cardIdsToShow = Array.from(allFavoriteCardIds).sort((a,b) => b-a);
        } else {
            const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
            cardIdsToShow = selectedPlaylist ? [...selectedPlaylist.cardIds].sort((a,b) => b-a) : [];
        }
    }
    return cardIdsToShow.map(id => getDisplayCard(id)).filter((item): item is DisplayCard => item !== undefined);
  }, [activeTab, openedImageIds, allFavoriteCardIds, playlists, selectedPlaylistId]);

  const totalPages = Math.ceil(filteredFlashcardsByTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const flashcardsForCurrentPage = filteredFlashcardsByTab.slice(startIndex, endIndex);
  const totalFlashcardsInCollection = openedImageIds.length;
  const favoriteCount = allFavoriteCardIds.size;

  const handlePageChange = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || (totalPages > 0 && pageNumber > totalPages)) return;
    setCurrentPage(pageNumber);
  }, [totalPages]);

  const handleTabChange = useCallback((tab: 'collection' | 'favorite') => {
      setActiveTab(tab);
      setSelectedPlaylistId('all');
      handlePageChange(1);
  }, [handlePageChange]);

  const handleSelectPlaylist = useCallback((id: string) => {
    setSelectedPlaylistId(id);
    handlePageChange(1);
  }, [handlePageChange]);

  const closePlaylistModal = useCallback(() => { setIsPlaylistModalOpen(false); setSelectedCardForPlaylist(null); }, []);
  const closeVocabDetail = useCallback(() => { setShowVocabDetail(false); setSelectedCard(null); showNavBar(); }, [showNavBar]);
  const openPlaylistModal = useCallback((cardId: number) => { setSelectedCardForPlaylist([cardId]); setIsPlaylistModalOpen(true); }, []);
  const handleFavoriteClick = useCallback((id: number) => { if (!currentUser) return; openPlaylistModal(id); }, [currentUser, openPlaylistModal]);
  const openVocabDetail = useCallback((card: Flashcard) => { setSelectedCard(card); setShowVocabDetail(true); hideNavBar(); }, [hideNavBar]);
  
  const getImageUrlForStyle = useCallback((card: Flashcard, style: string): string => {
    switch (style) {
        case 'anime': return card.imageUrl.anime || card.imageUrl.default;
        case 'comic': return card.imageUrl.comic || card.imageUrl.default;
        case 'realistic': return card.imageUrl.realistic || card.imageUrl.default;
        default: return card.imageUrl.default;
    }
  }, []);
  
  const handleTogglePin = useCallback(async (playlistId: string) => {
    if (!currentUser) return;
    const originalPlaylists = [...playlists];
    const newPlaylists = originalPlaylists.map(p => p.id === playlistId ? { ...p, isPinned: !p.isPinned } : p);
    setPlaylists(newPlaylists); // Optimistic update
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { playlists: newPlaylists });
    } catch (error) { console.error("Lỗi khi ghim/bỏ ghim playlist:", error); setPlaylists(originalPlaylists); }
  }, [playlists, currentUser]);

  const handleDeletePlaylist = useCallback(async (playlistToDelete: Playlist) => {
    if (!currentUser) return;
    const originalPlaylists = [...playlists];
    const newPlaylists = originalPlaylists.filter(p => p.id !== playlistToDelete.id);
    setPlaylists(newPlaylists); // Optimistic update
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { playlists: newPlaylists });
      if (selectedPlaylistId === playlistToDelete.id) {
          setSelectedPlaylistId('all');
      }
    } catch (error) { console.error("Lỗi khi xoá playlist:", error); setPlaylists(originalPlaylists); }
  }, [playlists, currentUser, selectedPlaylistId]);

  const paginationItems = useMemo(() => {
    const siblingCount = 1, totalPageNumbers = siblingCount + 5;
    if (totalPageNumbers >= totalPages) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1), rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const shouldShowLeftDots = leftSiblingIndex > 2, shouldShowRightDots = rightSiblingIndex < totalPages - 2;
    const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
    if (!shouldShowLeftDots && shouldShowRightDots) return [...range(1, 3 + 2 * siblingCount), '...', totalPages];
    if (shouldShowLeftDots && !shouldShowRightDots) return [1, '...', ...range(totalPages - (3 + 2 * siblingCount) + 1, totalPages)];
    if (shouldShowLeftDots && shouldShowRightDots) return [1, '...', ...range(leftSiblingIndex, rightSiblingIndex), '...', totalPages];
    return [];
  }, [currentPage, totalPages]);

  const handleShowHome = useCallback(() => setActiveScreen('home'), []);
  const handleShowStats = useCallback(() => setActiveScreen('stats'), []);
  const handleShowRank = useCallback(() => setActiveScreen('rank'), []);
  const handleShowGoldMine = useCallback(() => setActiveScreen('goldMine'), []);
  const handleShowTasks = useCallback(() => setActiveScreen('tasks'), []);
  const handleShowPerformance = useCallback(() => setActiveScreen('performance'), []);
  const handleShowSettings = useCallback(() => setActiveScreen('settings'), []);
  const handleShowHelp = useCallback(() => setActiveScreen('help'), []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">Đang tải bộ sưu tập...</div>;
  }

  return (
    <SidebarLayout setToggleSidebar={setToggleSidebar} onShowHome={handleShowHome} onShowStats={handleShowStats} onShowRank={handleShowRank} onShowGoldMine={handleShowGoldMine} onShowTasks={handleShowTasks} onShowPerformance={handleShowPerformance} onShowSettings={handleShowSettings} onShowHelp={handleShowHelp} activeScreen={activeScreen}>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
        <style>{animations}</style>
        <style>{scrollbarHide}</style>

        {activeScreen === 'home' ? (
          <>
            <GalleryHeader
              activeTab={activeTab} onTabChange={handleTabChange} totalCollection={totalFlashcardsInCollection} favoriteCount={favoriteCount}
              onToggleSidebar={() => toggleSidebar?.()} layoutMode={layoutMode} onLayoutModeChange={setLayoutMode}
              visualStyle={visualStyle} onVisualStyleChange={setVisualStyle} playlists={playlists}
              selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={handleSelectPlaylist}
              onTogglePin={handleTogglePin} onDeletePlaylist={handleDeletePlaylist}
            />

            <div className="flex-grow min-h-0">
              <div className="w-full max-w-6xl mx-auto h-full px-4">
                {flashcardsForCurrentPage.length > 0 ? (
                  <VirtualizedFlashcardGrid
                    items={flashcardsForCurrentPage} layoutMode={layoutMode} visualStyle={visualStyle}
                    onImageClick={openVocabDetail} onFavoriteClick={handleFavoriteClick} getImageUrlForStyle={getImageUrlForStyle}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 dark:text-pink-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{activeTab === 'collection' ? 'Bộ sưu tập trống' : selectedPlaylistId === 'all' ? 'Chưa có từ yêu thích' : 'Playlist này trống'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">{activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : selectedPlaylistId === 'all' ? 'Nhấn vào biểu tượng trái tim để thêm từ vào mục yêu thích.' : 'Hãy thêm các từ yêu thích vào playlist này.'}</p>
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-auto pb-6 px-4 flex-shrink-0">
                <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Pagination">
                  {paginationItems.map((item, index) =>
                    typeof item === 'string' ? ( <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">...</span> ) :
                    ( <button key={item} onClick={() => handlePageChange(item)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === item ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{item}</button> )
                  )}
                </nav>
              </div>
            )}

            <FlashcardDetailModal selectedCard={selectedCard} showVocabDetail={showVocabDetail} exampleImages={exampleImages} onClose={closeVocabDetail} currentVisualStyle={visualStyle} />
            {isPlaylistModalOpen && selectedCardForPlaylist && (
              <AddToPlaylistModal isOpen={isPlaylistModalOpen} onClose={closePlaylistModal} cardIds={selectedCardForPlaylist} currentUser={currentUser} existingPlaylists={playlists} />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-2xl text-gray-600 dark:text-gray-300">
            {activeScreen === 'stats' && 'Màn hình Stats'}
            {activeScreen === 'rank' && 'Màn hình Rank'}
            {activeScreen === 'goldMine' && 'Màn hình Mỏ vàng'}
            {activeScreen === 'tasks' && 'Màn hình Công việc'}
            {activeScreen === 'performance' && 'Màn hình Hiệu suất'}
            {activeScreen === 'settings' && 'Màn hình Cài đặt'}
            {activeScreen === 'help' && 'Màn hình Trợ giúp'}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
