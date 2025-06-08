import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import AddToPlaylistModal from './AddToPlaylistModal.tsx'; // SỬ DỤNG MODAL ĐÃ THIẾT KẾ LẠI
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts';
import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'; 
import { User } from 'firebase/auth';
import { defaultVocabulary } from './list-vocabulary.ts';
import { SidebarLayout } from './sidebar-story.tsx';

// --- Interfaces and Data ---
interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
  isPinned?: boolean;
}
interface VerticalFlashcardGalleryProps {
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
}
interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
}
interface VocabularyData {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: string;
  synonyms: string[];
  antonyms: string[];
}
interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  isFavorite: boolean;
  vocabulary: VocabularyData;
}
const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};
const numberOfSampleFlashcards = 3200;
const defaultImageUrls: string[] = [
  ...initialDefaultImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0')
];
const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');
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
  { word: "Source", meaning: "Nguồn, gốc", example: "What is the source of this information?", phrases: ["Information source", "Primary source"], popularity: "Cao", synonyms: ["Origin", "Root", "Beginning"], antonyms: ["Result", "Outcome", "End"] },
  { word: "Insurance", meaning: "Bảo hiểm", example: "You should buy travel insurance before your trip.", phrases: ["Health insurance", "Car insurance"], popularity: "Cao", synonyms: ["Assurance", "Coverage", "Protection"], antonyms: ["Risk", "Danger", "Exposure"] },
  { word: "Argument", meaning: "Cuộc tranh luận, lý lẽ", example: "They had a heated argument about politics.", phrases: ["Strong argument", "Logical argument"], popularity: "Trung bình", synonyms: ["Dispute", "Debate", "Reasoning"], antonyms: ["Agreement", "Harmony", "Peace"] },
  { word: "Influence", meaning: "Ảnh hưởng", example: "His parents had a strong influence on his career choice.", phrases: ["Direct influence", "Negative influence"], popularity: "Cao", synonyms: ["Impact", "Effect", "Control"], antonyms: ["Lack of effect", "Insignificance"] },
  { word: "Vocabulary 5", meaning: "Nghĩa của từ vựng 5", example: "Ví dụ cho từ vựng 5.", phrases: ["Cụm từ 1", "Cụm từ 2"], popularity: "Thấp", synonyms: ["Từ đồng nghĩa 1", "Từ trái nghĩa 2"], antonyms: ["Từ trái nghĩa 1", "Từ trái nghĩa 2"] }
];
const vocabularyData: VocabularyData[] = [
  ...initialVocabularyData,
  ...generatePlaceholderVocabulary(Math.max(0, numberOfSampleFlashcards - initialVocabularyData.length))
];
const ALL_POSSIBLE_FLASHCARDS: Flashcard[] = Array.from({ length: numberOfSampleFlashcards }, (_, i) => {
    const vocab = vocabularyData[i] || { word: `Word ${i + 1}`, meaning: `Meaning ${i + 1}`, example: `Example ${i + 1}`, phrases:[], popularity: 'Thấp', synonyms:[], antonyms:[] };
    const imageUrls: StyledImageUrls = {
        default: defaultImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Default+${i + 1}`,
        anime: animeImageUrls[i] || `https://placehold.co/1024x1536/FF99CC/FFFFFF?text=Anime+${i + 1}`,
        comic: comicImageUrls[i] || `https://placehold.co/1024x1536/66B2FF/FFFFFF?text=Comic+${i + 1}`,
        realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${i + 1}`,
    };
    return { id: i + 1, imageUrl: imageUrls, isFavorite: false, vocabulary: vocab };
});
const exampleImages = [
  "https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1",
  "https://placehold.co/1024x1536/33FF57/FFFFFF?text=Example+2",
  "https://placehold.co/1024x1536/3357FF/FFFFFF?text=Example+3",
  "https://placehold.co/1024x1536/FF33A1/FFFFFF?text=Example+4",
  "https://placehold.co/1024x1536/A133FF/FFFFFF?text=Example+5",
];
const animations = `
  @keyframes fadeInOut { 0% { opacity: 0; transform: translateY(-10px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
  @keyframes slideIn { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes modalBackdropIn { 0% { opacity: 0; } 100% { opacity: 0.5; } }
  @keyframes modalIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes animeSparkle { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
  @keyframes comicPop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes realisticShine { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }
`;


interface FlashcardItemProps {
  card: Flashcard;
  visualStyle: string;
  onImageClick: (card: Flashcard) => void;
  onFavoriteClick: (id: number) => void;
  getImageUrlForStyle: (card: Flashcard, style: string) => string;
}

const FlashcardItem = memo(({ card, visualStyle, onImageClick, onFavoriteClick, getImageUrlForStyle }: FlashcardItemProps) => {
  return (
    <div id={`flashcard-${card.id}`} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <button className={`transition-all duration-300 flex items-center justify-center p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 ${card.isFavorite ? 'scale-110' : 'scale-100'}`} 
                onClick={() => onFavoriteClick(card.id)} 
                aria-label={card.isFavorite ? "Quản lý trong Playlist" : "Thêm vào Playlist"}>
            <img src={card.isFavorite ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"} alt={card.isFavorite ? "Favorite icon" : "Unfavorite icon"} className={`h-4 w-4 transition-all duration-300 ${card.isFavorite ? 'opacity-100' : 'opacity-75'}`} />
        </button>
      </div>
      <div className="w-full">
        <div className={`relative w-full ${visualStyle === 'realistic' ? 'p-2 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800' : ''}`}>
          {visualStyle === 'anime' && <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30 mix-blend-overlay pointer-events-none"></div>}
          {visualStyle === 'comic' && <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>}
          {visualStyle === 'realistic' && <div className="absolute inset-0 shadow-inner pointer-events-none"></div>}
          <img 
            src={getImageUrlForStyle(card, visualStyle)} 
            alt={`Flashcard ${card.id}`} 
            className={`w-full h-auto ${visualStyle === 'anime' ? 'saturate-150 contrast-105' : visualStyle === 'comic' ? 'contrast-125 brightness-105' : visualStyle === 'realistic' ? 'saturate-105 contrast-110 shadow-md' : ''} cursor-pointer`} 
            style={{aspectRatio: '1024/1536', filter: visualStyle === 'comic' ? 'grayscale(0.1)' : 'none'}} 
            onClick={() => onImageClick(card)} 
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = card.imageUrl.default; }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
});

export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  // --- States ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('collection');
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('single');
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
  const [showAllPlaylistsModal, setShowAllPlaylistsModal] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState('');
  
  // States for new features (pin, delete)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  
  // --- Derived State ---
  const allFavoriteCardIds = useMemo(() => {
    return new Set(playlists.flatMap(p => p.cardIds));
  }, [playlists]);

  // --- Effects ---
  useEffect(() => {
    if (!currentUser) { setLoading(false); setOpenedImageIds([]); setPlaylists([]); return; }
    setLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setOpenedImageIds(Array.isArray(userData.openedImageIds) ? userData.openedImageIds : []);
        const fetchedPlaylists = (Array.isArray(userData.playlists) ? userData.playlists : []).map((p: Playlist) => ({...p, isPinned: p.isPinned || false}));
        const examplePlaylists: Playlist[] = [
          {id: 'pl1', name: 'Voca 1', cardIds: [1,2,3,4], isPinned: true},
          {id: 'pl2', name: 'Voca 2', cardIds: [5], isPinned: false},
          {id: 'pl3', name: 'Test 3', cardIds: Array.from({length: 362}, (_, i) => i + 6), isPinned: false},
          {id: 'pl4', name: 'IELTS Vocabulary for Reading Section - Unit 1', cardIds: [368, 369], isPinned: false},
          {id: 'pl5', name: 'Từ vựng chuyên ngành Công nghệ thông tin siêu dài', cardIds: [370, 371, 372], isPinned: false},
        ];
        setPlaylists([...examplePlaylists, ...fetchedPlaylists]);
      } else {
        setOpenedImageIds([]); setPlaylists([]);
      }
      setLoading(false);
    }, (error) => { setLoading(false); });
    return () => unsubscribe();
  }, [currentUser]);
  
  // Effect to close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId && !(event.target as HTMLElement).closest(`#playlist-menu-${activeMenuId}`)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);


  // --- Logic lọc và phân trang ---
  const filteredFlashcardsByTab = useMemo(() => {
    const getCardWithFavoriteStatus = (id: number): Flashcard | undefined => {
      const card = ALL_POSSIBLE_FLASHCARDS.find(c => c.id === id);
      if (!card) return undefined;
      return { ...card, isFavorite: allFavoriteCardIds.has(id) };
    };

    if (activeTab === 'collection') {
      return [...openedImageIds].reverse().map(id => getCardWithFavoriteStatus(id)).filter((card): card is Flashcard => card !== undefined);
    }

    if (activeTab === 'favorite') {
      const allFavorites = [...allFavoriteCardIds].map(id => getCardWithFavoriteStatus(id)).filter((card): card is Flashcard => card !== undefined);
      if (selectedPlaylistId === 'all') return allFavorites;
      const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
      if (selectedPlaylist) {
        const playlistCardIds = new Set(selectedPlaylist.cardIds);
        return allFavorites.filter(card => playlistCardIds.has(card.id));
      }
      return [];
    }
    return [];
  }, [activeTab, openedImageIds, allFavoriteCardIds, playlists, selectedPlaylistId]);

  const totalPages = Math.ceil(filteredFlashcardsByTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const flashcardsForCurrentPage = filteredFlashcardsByTab.slice(startIndex, endIndex);
  const totalFlashcardsInCollection = openedImageIds.length;
  const favoriteCount = allFavoriteCardIds.size;

  // --- Handlers ---
  const handleShowHome = () => setActiveScreen('home');
  const handleShowStats = () => setActiveScreen('stats');
  const handleShowRank = () => setActiveScreen('rank');
  const handleShowGoldMine = () => setActiveScreen('goldMine');
  const handleShowTasks = () => setActiveScreen('tasks');
  const handleShowPerformance = () => setActiveScreen('performance');
  const handleShowSettings = () => setActiveScreen('settings');
  const handleShowHelp = () => setActiveScreen('help');

  const closePlaylistModal = () => { setIsPlaylistModalOpen(false); setSelectedCardForPlaylist(null); };
  const closeVocabDetail = () => { setShowVocabDetail(false); setSelectedCard(null); showNavBar(); };

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

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    if (mainContainerRef.current) mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
  };

  const paginationItems = useMemo(() => {
    const siblingCount = 1; 
    const totalPageNumbers = siblingCount + 5; 
    if (totalPageNumbers >= totalPages) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
    const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, '...', ...rightRange];
    }
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', totalPages];
    }
    return [];
  }, [currentPage, totalPages]);
  
  const scrollbarHide = `.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`;

  // --- LOGIC MỚI CHO VIỆC GHIM/XOÁ PLAYLIST ---
  const pinnedCount = useMemo(() => playlists.filter(p => p.isPinned).length, [playlists]);

  const handleTogglePin = useCallback(async (playlistId: string) => {
    const playlistToToggle = playlists.find(p => p.id === playlistId);
    if (!playlistToToggle) return;

    if (!playlistToToggle.isPinned && pinnedCount >= 2) {
        alert("Bạn chỉ có thể ghim tối đa 2 playlist.");
        return;
    }
    
    const newPlaylists = playlists.map(p => p.id === playlistId ? { ...p, isPinned: !p.isPinned } : p);
    setPlaylists(newPlaylists);
    // TODO: Update to Firestore
  }, [playlists, pinnedCount]);

  const handleOpenDeleteConfirm = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setIsDeleteConfirmOpen(true);
    setActiveMenuId(null); // Close the kebab popover
  };
  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setPlaylistToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!playlistToDelete || !currentUser) return;
    const newPlaylists = playlists.filter(p => p.id !== playlistToDelete.id);
    setPlaylists(newPlaylists);
    if (selectedPlaylistId === playlistToDelete.id) {
        setSelectedPlaylistId('all');
    }
    handleCloseDeleteConfirm();
    // TODO: Update to Firestore
    // const userDocRef = doc(db, 'users', currentUser.uid);
    // await updateDoc(userDocRef, { playlists: newPlaylists });
  };


  const pillsToDisplay = useMemo(() => {
    const pinned = playlists.filter(p => p.isPinned);
    const selected = playlists.find(p => p.id === selectedPlaylistId);
    const displaySet = new Set<Playlist>();
    pinned.forEach(p => displaySet.add(p));
    if (selected && !displaySet.has(selected)) displaySet.add(selected);
    return Array.from(displaySet).sort((a,b) => a.name.localeCompare(b.name));
  }, [playlists, selectedPlaylistId]);


  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">Đang tải bộ sưu tập...</div>;
  }

  return (
    <SidebarLayout setToggleSidebar={setToggleSidebar} onShowHome={handleShowHome} onShowStats={handleShowStats} onShowRank={handleShowRank} onShowGoldMine={handleShowGoldMine} onShowTasks={handleShowTasks} onShowPerformance={handleShowPerformance} onShowSettings={handleShowSettings} onShowHelp={handleShowHelp} activeScreen={activeScreen}>
      <div ref={mainContainerRef} className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <style>{animations}{scrollbarHide}</style>
        {activeScreen === 'home' && (
          <>
            <div className="w-full max-w-6xl py-6 mx-auto">
              {/* Header section... */}
              <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flashcard Gallery</h1>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleSidebar?.()} className="relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800" aria-label="Toggle Sidebar"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
                  <div id="settings-button" className={`relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 cursor-pointer ${isSettingsHovered || showSettings ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800' : 'border-gray-100 dark:border-gray-700'}`} onMouseEnter={() => setIsSettingsHovered(true)} onMouseLeave={() => setIsSettingsHovered(false)} onClick={() => setShowSettings(!showSettings)}><svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSettingsHovered || showSettings ? 'text-indigo-600 dark:text-indigo-400 rotate-45' : 'text-gray-600 dark:text-gray-400'} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
                </div>
              </div>
              {/* Tabs section... */}
              <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 mx-4">
                <button onClick={() => { setActiveTab('collection'); handlePageChange(1); }} className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'collection' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'collection' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10M7 13h6" /></svg><span>Collection</span><span className={`inline-flex items-center justify-center ${activeTab === 'collection' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInCollection}</span></button>
                <button onClick={() => { setActiveTab('favorite'); handlePageChange(1); setSelectedPlaylistId('all'); }} className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'favorite' ? 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'favorite' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill={activeTab === 'favorite' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg><span>Favorite</span><span className={`inline-flex items-center justify-center ${activeTab === 'favorite' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{favoriteCount}</span></button>
              </div>

              {activeTab === 'favorite' && (
                <div className="px-4 mb-6"><div className="w-full">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Đang xem trong Playlist</label>
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      <button onClick={() => { setSelectedPlaylistId('all'); handlePageChange(1); }} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${selectedPlaylistId === 'all' ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700 font-bold shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600'}`}>
                        <span>Tất cả</span><span className={`px-2 py-0.5 text-xs rounded-full ${selectedPlaylistId === 'all' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`}>{favoriteCount}</span>
                      </button>
                      {pillsToDisplay.map(p => (
                        <button key={p.id} onClick={() => { setSelectedPlaylistId(p.id); handlePageChange(1); }} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border truncate max-w-[250px] ${selectedPlaylistId === p.id ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700 font-bold shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600'}`}>
                          {p.isPinned && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                          <span className="truncate">{p.name}</span><span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full ${selectedPlaylistId === p.id ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`}>{p.cardIds.length}</span>
                        </button>
                      ))}
                      <button onClick={() => setShowAllPlaylistsModal(true)} className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Xem tất cả playlist">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      </button>
                    </div>
                </div></div>
              )}
            </div>
            
            <div className="min-h-0"><div className="w-full max-w-6xl mx-auto">
                {flashcardsForCurrentPage.length > 0 ? (
                  <div className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {flashcardsForCurrentPage.map((card) => ( <FlashcardItem key={card.id} card={card} visualStyle={visualStyle} onImageClick={openVocabDetail} onFavoriteClick={handleFavoriteClick} getImageUrlForStyle={getImageUrlForStyle} /> ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4"><div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 dark:text-pink-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div><h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{activeTab === 'collection' ? 'Bộ sưu tập trống' : selectedPlaylistId === 'all' ? 'Chưa có từ yêu thích' : 'Playlist này trống'}</h3><p className="text-gray-500 dark:text-gray-400 max-w-md">{activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : selectedPlaylistId === 'all' ? 'Nhấn vào biểu tượng trái tim để thêm từ vào mục yêu thích.' : 'Hãy thêm các từ yêu thích vào playlist này.'}</p></div>
                )}
                {totalPages > 1 && (
                  <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4"><nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Pagination">
                      {paginationItems.map((item, index) => typeof item === 'string' ? ( <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">...</span> ) : ( <button key={item} onClick={() => handlePageChange(item)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === item ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{item}</button> )) }
                  </nav></div>
                )}
            </div></div>

            {/* Modals and other UI... (Settings, Details, AddToPlaylist) */}
            {showSettings && ( <> {/* Settings Modal JSX */} </> )}
            <FlashcardDetailModal selectedCard={selectedCard} showVocabDetail={showVocabDetail} exampleImages={exampleImages} onClose={closeVocabDetail} currentVisualStyle={visualStyle} />
            {isPlaylistModalOpen && selectedCardForPlaylist && ( <AddToPlaylistModal isOpen={isPlaylistModalOpen} onClose={closePlaylistModal} cardIds={selectedCardForPlaylist} currentUser={currentUser} existingPlaylists={playlists} /> )}

            {/* MODAL: All Playlists (with pin/delete) */}
            {showAllPlaylistsModal && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowAllPlaylistsModal(false)} style={{ animation: 'modalBackdropIn 0.3s' }}></div>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAllPlaylistsModal(false) }}>
                  <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[80vh]" style={{ animation: 'modalIn 0.3s' }}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"><h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quản lý Playlist</h3><p className="text-sm text-gray-500 dark:text-gray-400">Chọn, tìm kiếm, ghim hoặc xoá playlist.</p></div>
                    <div className="p-4 flex-shrink-0"><div className="relative"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg><input type="text" placeholder="Tìm tên playlist..." value={playlistSearch} onChange={(e) => setPlaylistSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div></div>
                    <div className="overflow-y-auto px-4 pb-4 flex-grow"><ul className="space-y-1">
                        {playlists.filter(p => p.name.toLowerCase().includes(playlistSearch.toLowerCase())).map(p => (
                          <li key={p.id} className="relative">
                            <div className={`w-full flex items-center text-left p-3 rounded-lg transition-colors duration-200 group ${selectedPlaylistId === p.id ? 'bg-pink-100 dark:bg-pink-900/60' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                              <div onClick={() => { setSelectedPlaylistId(p.id); handlePageChange(1); setShowAllPlaylistsModal(false); setPlaylistSearch(''); }} className="flex-grow pr-4 cursor-pointer">
                                <p className={`font-medium ${selectedPlaylistId === p.id ? 'text-pink-800 dark:text-pink-200' : 'text-gray-800 dark:text-gray-200'}`}>{p.name}</p><span className={`text-xs ${selectedPlaylistId === p.id ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`}>{p.cardIds.length} từ vựng</span>
                              </div>
                              <div className="flex-shrink-0 flex items-center" id={`playlist-menu-${p.id}`}>
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === p.id ? null : p.id); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Thêm tùy chọn">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                                {activeMenuId === p.id && (
                                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-100 dark:border-gray-600 z-10 p-1" style={{ animation: 'scaleIn 0.1s ease-out' }}>
                                    <button onClick={() => { handleTogglePin(p.id); setActiveMenuId(null); }} disabled={!p.isPinned && pinnedCount >= 2} className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${p.isPinned ? 'text-yellow-500' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                      <span>{p.isPinned ? "Bỏ ghim" : "Ghim Playlist"}</span>
                                    </button>
                                    <button onClick={() => handleOpenDeleteConfirm(p)} className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                      <span>Xoá Playlist</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul></div>
                  </div>
                </div>
              </>
            )}

            {/* MODAL: Delete Confirmation */}
            {isDeleteConfirmOpen && playlistToDelete && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50" onClick={handleCloseDeleteConfirm} style={{ animation: 'modalBackdropIn 0.2s' }}></div>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6" style={{ animation: 'modalIn 0.3s' }}>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Xoá Playlist</h3>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <p>Bạn có chắc muốn xoá playlist <strong className="font-bold text-gray-700 dark:text-gray-200">"{playlistToDelete.name}"</strong> không? Hành động này không thể được hoàn tác.</p>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button onClick={handleCloseDeleteConfirm} type="button" className="py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-lg transition-colors">Huỷ</button>
                      <button onClick={handleConfirmDelete} type="button" className="py-2.5 bg-red-600 text-white hover:bg-red-700 text-sm font-medium rounded-lg transition-colors">Xoá Playlist</button>
                    </div>
                  </div>
                </div>
              </>
            )}

          </>
        )}
        {activeScreen !== 'home' && ( <div className="flex items-center justify-center h-full text-2xl text-gray-600 dark:text-gray-300">{/* Other screens... */}</div> )}
      </div>
    </SidebarLayout>
  );
}
