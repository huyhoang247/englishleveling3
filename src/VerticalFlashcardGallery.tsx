import { useRef, useState, useEffect, useMemo } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts';

// Import Firebase auth and db
import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Import defaultVocabulary
import { defaultVocabulary } from './list-vocabulary.ts';

// Import SidebarLayout
import { SidebarLayout } from './sidebar-story.tsx';

// --- NEW: Import AddToPlaylistModal ---
import AddToPlaylistModal from './AddToPlaylistModal.tsx'; // Đảm bảo đường dẫn này chính xác

// --- NEW: Định nghĩa interface Playlist để sử dụng trong component này ---
interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

// Define the props interface for VerticalFlashcardGallery
interface VerticalFlashcardGalleryProps {
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
}

// Define the structure for image URLs by style
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
}

// Define the structure for vocabulary data
interface VocabularyData {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: string;
  synonyms: string[];
  antonyms: string[];
}

// Define the structure for a flashcard
// --- CHANGED: Bỏ isFavorite ---
interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  vocabulary: VocabularyData;
}

// --- Dữ liệu ảnh theo từng phong cách (giữ nguyên) ---
const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};

const numberOfSampleFlashcards = 200;

const defaultImageUrls: string[] = [
  ...initialDefaultImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0')
];

const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');


// --- Dữ liệu từ vựng (giữ nguyên) ---
const generatePlaceholderVocabulary = (count: number): VocabularyData[] => {
  const data: VocabularyData[] = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      word: `Word ${i}`,
      meaning: `Meaning of Word ${i}`,
      example: `Example sentence for Word ${i}.`,
      phrases: [`Phrase A ${i}`, `Phrase B ${i}`],
      popularity: i % 3 === 0 ? "Cao" : i % 2 === 0 ? "Trung bình" : "Thấp",
      synonyms: [`Synonym 1.${i}`, `Synonym 2.${i}`],
      antonyms: [`Antonym 1.${i}`, `Antonym 2.${i}`]
    });
  }
  return data;
};

const initialVocabularyData: VocabularyData[] = [
  { word: "Source", meaning: "Nguồn, gốc", /* ... */ },
  { word: "Insurance", meaning: "Bảo hiểm", /* ... */ },
  { word: "Argument", meaning: "Cuộc tranh luận, lý lẽ", /* ... */ },
  { word: "Influence", meaning: "Ảnh hưởng", /* ... */ },
  { word: "Vocabulary 5", meaning: "Nghĩa của từ vựng 5", /* ... */ }
];

const vocabularyData: VocabularyData[] = [
  ...initialVocabularyData,
  ...generatePlaceholderVocabulary(Math.max(0, numberOfSampleFlashcards - initialVocabularyData.length))
];


// --- Tạo mảng ALL_POSSIBLE_FLASHCARDS (Bỏ isFavorite) ---
const ALL_POSSIBLE_FLASHCARDS: Flashcard[] = [];
const totalPossibleFlashcards = Math.max(
    defaultImageUrls.length,
    vocabularyData.length
);

for (let i = 0; i < totalPossibleFlashcards; i++) {
    const vocab = vocabularyData[i] || { /* ... */ };
    const imageUrls: StyledImageUrls = {
        default: defaultImageUrls[i] || `...`,
        anime: animeImageUrls[i] || `...`,
        comic: comicImageUrls[i] || `...`,
        realistic: realisticImageUrls[i] || `...`,
    };

    ALL_POSSIBLE_FLASHCARDS.push({
        id: i + 1,
        imageUrl: imageUrls,
        vocabulary: vocab,
    });
}

const exampleImages = [ /* ... */ ];
const animations = ` /* ... */ `;

// --- Bắt đầu component ---
export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  const scrollContainerRef = useRef(null);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('collection'); // 'collection' or 'playlists'
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('single');
  const [visualStyle, setVisualStyle] = useState('default');
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);
  const [loadingOpenedImages, setLoadingOpenedImages] = useState(true);

  // --- NEW: States cho Playlist ---
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedCardForPlaylist, setSelectedCardForPlaylist] = useState<Flashcard | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [activeScreen, setActiveScreen] = useState('home');
  const [toggleSidebar, setToggleSidebar] = useState<(() => void) | null>(null);

  const handleShowHome = () => setActiveScreen('home');
  const handleShowStats = () => setActiveScreen('stats');
  const handleShowRank = () => setActiveScreen('rank');
  const handleShowGoldMine = () => setActiveScreen('goldMine');
  const handleShowTasks = () => setActiveScreen('tasks');
  const handleShowPerformance = () => setActiveScreen('performance');
  const handleShowSettings = () => setActiveScreen('settings');
  const handleShowHelp = () => setActiveScreen('help');

  // --- CHANGED: Effect để lấy cả openedImageIds và playlists ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setOpenedImageIds([]);
        setPlaylists([]); // Reset playlist khi không có user
        setLoadingOpenedImages(false);
        return;
      }

      setLoadingOpenedImages(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Lấy openedImageIds
          const fetchedIds = Array.isArray(userData?.openedImageIds) ? userData.openedImageIds : [];
          setOpenedImageIds(fetchedIds);

          // Lấy playlists
          const fetchedPlaylists = Array.isArray(userData?.playlists) ? userData.playlists : [];
          setPlaylists(fetchedPlaylists);
          console.log("Fetched playlists:", fetchedPlaylists);

          // Xử lý listVocabulary
          const listVocabulary = fetchedIds.map(id =>
            (defaultVocabulary[id - 1]?.toLowerCase() ?? '').trim()
          );
          await updateDoc(userDocRef, { listVocabulary });

        } else {
          setOpenedImageIds([]);
          setPlaylists([]);
          console.log("User document not found for user:", currentUser.uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setOpenedImageIds([]);
        setPlaylists([]);
      } finally {
        setLoadingOpenedImages(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // --- NEW: Dùng useMemo để tạo một Set chứa tất cả cardId có trong playlist ---
  const cardIdsInPlaylists = useMemo(() => {
    return new Set(playlists.flatMap(playlist => playlist.cardIds));
  }, [playlists]);

  // --- CHANGED: Logic để lọc flashcards cho các tab ---
  const filteredFlashcardsByTab = useMemo(() => {
    if (activeTab === 'collection') {
      return [...openedImageIds].reverse()
        .map(id => ALL_POSSIBLE_FLASHCARDS.find(card => card.id === id))
        .filter((card): card is Flashcard => card !== undefined);
    }
    if (activeTab === 'playlists') {
      return ALL_POSSIBLE_FLASHCARDS.filter(card => cardIdsInPlaylists.has(card.id));
    }
    return [];
  }, [activeTab, openedImageIds, cardIdsInPlaylists]);

  const totalPages = Math.ceil(filteredFlashcardsByTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const flashcardsForCurrentPage = filteredFlashcardsByTab.slice(startIndex, endIndex);

  const totalFlashcardsInCollection = openedImageIds.length;
  const totalFlashcardsInPlaylists = cardIdsInPlaylists.size;

  // --- NEW: Hàm để mở modal playlist ---
  const handleOpenPlaylistModal = (card: Flashcard) => {
    setSelectedCardForPlaylist(card);
    setIsPlaylistModalOpen(true);
  };
  
  // --- NEW: Hàm để đóng modal và cập nhật lại dữ liệu playlists ---
  const handleClosePlaylistModal = async () => {
    setIsPlaylistModalOpen(false);
    setSelectedCardForPlaylist(null);

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const updatedPlaylists = Array.isArray(userData?.playlists) ? userData.playlists : [];
          setPlaylists(updatedPlaylists);
          console.log("Refetched and updated playlists state.", updatedPlaylists);
        }
      } catch (error) {
        console.error("Error refetching playlists after modal close:", error);
      }
    }
  };

  const openVocabDetail = (card: Flashcard) => {
    setSelectedCard(card);
    setShowVocabDetail(true);
    hideNavBar();
  };

  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedCard(null);
    showNavBar();
  };

  const getImageUrlForStyle = (card: Flashcard, style: string): string => {
    switch (style) {
        case 'anime': return card.imageUrl.anime || card.imageUrl.default;
        case 'comic': return card.imageUrl.comic || card.imageUrl.default;
        case 'realistic': return card.imageUrl.realistic || card.imageUrl.default;
        default: return card.imageUrl.default;
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (scrollContainerRef.current) {
      (scrollContainerRef.current as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loadingOpenedImages) {
      return (
          <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
              Đang tải bộ sưu tập...
          </div>
      );
  }

  return (
    <SidebarLayout
      setToggleSidebar={setToggleSidebar}
      onShowHome={handleShowHome}
      onShowStats={handleShowStats}
      onShowRank={handleShowRank}
      onShowGoldMine={handleShowGoldMine}
      onShowTasks={handleShowTasks}
      onShowPerformance={handleShowPerformance}
      onShowSettings={handleShowSettings}
      onShowHelp={handleShowHelp}
      activeScreen={activeScreen}
    >
      <div className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <style>{animations}</style>

        {activeScreen === 'home' && (
          <>
            <div className="w-full max-w-6xl py-6 mx-auto">
              <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flashcard Gallery</h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleSidebar?.()}
                    className="relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800"
                    aria-label="Toggle Sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>

                  <div
                    id="settings-button"
                    className={`relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 cursor-pointer ${isSettingsHovered || showSettings ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800' : 'border-gray-100 dark:border-gray-700'}`}
                    onMouseEnter={() => setIsSettingsHovered(true)} onMouseLeave={() => setIsSettingsHovered(false)} onClick={() => setShowSettings(!showSettings)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSettingsHovered || showSettings ? 'text-indigo-600 dark:text-indigo-400 rotate-45' : 'text-gray-600 dark:text-gray-400'} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 mx-4">
                <button
                  onClick={() => { setActiveTab('collection'); setCurrentPage(1); }}
                  className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'collection' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'collection' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10M7 13h6" />
                  </svg>
                  <span>Collection</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'collection' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInCollection}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('playlists'); setCurrentPage(1); }}
                  className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'playlists' ? 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'playlists' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill={activeTab === 'playlists' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>Playlists</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'playlists' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInPlaylists}</span>
                </button>
              </div>
            </div>

            <div className="min-h-0">
              <div className="w-full max-w-6xl mx-auto">
                {flashcardsForCurrentPage.length > 0 ? (
                  <div ref={scrollContainerRef} className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {flashcardsForCurrentPage.map((card) => {
                      const isInPlaylist = cardIdsInPlaylists.has(card.id);
                      return (
                        <div key={card.id}>
                          <div id={`flashcard-${card.id}`} className={`flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                            <button
                              className={`absolute top-3 right-3 transition-all duration-300 z-10 flex items-center justify-center ${isInPlaylist ? 'scale-110' : 'scale-100'}`}
                              onClick={() => handleOpenPlaylistModal(card)}
                              aria-label={isInPlaylist ? "Chỉnh sửa playlist" : "Thêm vào playlist"}
                            >
                              <img
                                src={isInPlaylist ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"}
                                alt={isInPlaylist ? "In a playlist icon" : "Add to playlist icon"}
                                className={`transition-all duration-300 ${layoutMode === 'double' ? 'h-4 w-4' : 'h-6 w-6'} ${isInPlaylist ? 'opacity-100' : 'opacity-75'}`}
                              />
                            </button>
                            <div className="w-full">
                              <div className={`relative w-full ${visualStyle === 'realistic' ? 'p-2 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800' : ''}`}>
                                {visualStyle === 'anime' && <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30 mix-blend-overlay pointer-events-none"></div>}
                                {visualStyle === 'comic' && <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>}
                                {visualStyle === 'realistic' && <div className="absolute inset-0 shadow-inner pointer-events-none"></div>}
                                <img
                                  src={getImageUrlForStyle(card, visualStyle)}
                                  alt={`Flashcard ${card.id}`}
                                  className={`w-full h-auto ${visualStyle === 'anime' ? 'saturate-150 contrast-105' : visualStyle === 'comic' ? 'contrast-125 brightness-105' : visualStyle === 'realistic' ? 'saturate-105 contrast-110 shadow-md' : ''} cursor-pointer`}
                                  style={{ aspectRatio: '1024/1536', filter: visualStyle === 'comic' ? 'grayscale(0.1)' : 'none' }}
                                  onClick={() => openVocabDetail(card)}
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = card.imageUrl.default; }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 dark:text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {activeTab === 'collection' ? 'Bộ sưu tập trống' : 'Chưa có playlist nào'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      {activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : 'Nhấn vào biểu tượng trái tim trên flashcard để thêm vào playlist của bạn.'}
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4">
                    <nav className="flex space-x-2" aria-label="Pagination">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Trước</button>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === index + 1 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{index + 1}</button>
                      ))}
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === totalPages ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Sau</button>
                    </nav>
                  </div>
                )}
              </div>
            </div>

            {showSettings && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300" style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }}></div>
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'scaleIn 0.3s ease-out forwards' }} id="settings-panel">
                    {/* Settings Panel Content (giữ nguyên) */}
                    {/* ... */}
                  </div>
                </div>
              </>
            )}

            <AddToPlaylistModal
              isOpen={isPlaylistModalOpen}
              onClose={handleClosePlaylistModal}
              cardId={selectedCardForPlaylist?.id ?? -1}
              currentUser={currentUser}
              existingPlaylists={playlists}
            />

            <FlashcardDetailModal
              selectedCard={selectedCard}
              showVocabDetail={showVocabDetail}
              exampleImages={exampleImages}
              onClose={closeVocabDetail}
              currentVisualStyle={visualStyle}
            />
          </>
        )}

        {activeScreen !== 'home' && (
           <div className="flex items-center justify-center h-full text-2xl text-gray-600 dark:text-gray-300">
             {/* Placeholder for other screens */}
             Màn hình {activeScreen}
           </div>
        )}
      </div>
    </SidebarLayout>
  );
}
