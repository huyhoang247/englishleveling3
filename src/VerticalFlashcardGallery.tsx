// --- START OF FILE VerticalFlashcardGallery.tsx ---

import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import AddToPlaylistModal from './AddToPlaylistModal.tsx';
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts';
import { auth, db } from './firebase.js';
import { doc, updateDoc, onSnapshot, collection, query, orderBy, limit, getDocs, startAfter, DocumentData } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { SidebarLayout } from './sidebar-story.tsx';
import detailedMeaningsText from './vocabulary-definitions.ts';
import { defaultVocabulary } from './list-vocabulary.ts';
import { exampleData } from './example-data.ts';

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
  vocabulary: VocabularyData;
}
interface DisplayCard {
    card: Flashcard;
    isFavorite: boolean;
}
interface OpenedCardData {
  id: number;
  collectedAt: Date;
}


/**
 * Helper function to capitalize the first letter of a string.
 * @param str The string to capitalize.
 * @returns The string with its first letter capitalized.
 */
const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};


const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};

// --- LOGIC MỚI: XỬ LÝ ĐỊNH NGHĨA CHI TIẾT ---
const parseDetailedMeanings = (text: string): Map<string, string> => {
    const meaningsMap = new Map<string, string>();
    const lines = text.trim().split('\n');

    for (const line of lines) {
        const match = line.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            const englishWord = match[1];
            meaningsMap.set(englishWord, line.trim());
        }
    }
    return meaningsMap;
};

const detailedMeaningsMap = parseDetailedMeanings(detailedMeaningsText);

// --- START: LOGIC MỚI ĐỂ TẠO DỮ LIỆU TỪ VỰNG ---
const numberOfSampleFlashcards = defaultVocabulary.length;

const defaultImageUrls: string[] = [
  ...initialDefaultImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0')
];
const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');

const ALL_CARDS_MAP: Map<number, Flashcard> = new Map(
    Array.from({ length: numberOfSampleFlashcards }, (_, i) => {
        const cardId = i + 1;
        const rawWord = defaultVocabulary[i];
        const capitalizedWord = capitalizeFirstLetter(rawWord);
        const detailedMeaning = detailedMeaningsMap.get(capitalizedWord);
        const vocab: VocabularyData = {
            word: capitalizedWord,
            meaning: detailedMeaning || `Meaning of ${capitalizedWord}`,
            example: `Example sentence for ${capitalizedWord}.`,
            phrases: [`Phrase A ${cardId}`, `Phrase B ${cardId}`],
            popularity: cardId % 3 === 0 ? "Cao" : (cardId % 2 === 0 ? "Trung bình" : "Thấp"),
            synonyms: [`Synonym 1.${cardId}`, `Synonym 2.${cardId}`],
            antonyms: [`Antonym 1.${cardId}`, `Antonym 2.${cardId}`]
        };
        const imageUrls: StyledImageUrls = {
            default: defaultImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Default+${cardId}`,
            anime: animeImageUrls[i] || `https://placehold.co/1024x1536/FF99CC/FFFFFF?text=Anime+${cardId}`,
            comic: comicImageUrls[i] || `https://placehold.co/1024x1536/66B2FF/FFFFFF?text=Comic+${cardId}`,
            realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${cardId}`,
        };
        
        const card: Flashcard = { id: cardId, imageUrl: imageUrls, vocabulary: vocab };
        return [cardId, card];
    })
);

// --- END: LOGIC MỚI ĐỂ TẠO DỮ LIỆU TỪ VỰNG ---

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
  isFavorite: boolean;
  visualStyle: string;
  onImageClick: (card: Flashcard) => void;
  onFavoriteClick: (id: number) => void;
  getImageUrlForStyle: (card: Flashcard, style: string) => string;
}

const FlashcardItem = memo(({ card, isFavorite, visualStyle, onImageClick, onFavoriteClick, getImageUrlForStyle }: FlashcardItemProps) => {
  const comicDotPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='0.5' fill='rgba(0,0,0,0.2)'/%3E%3C/svg%3E")`,
  };

  return (
    <div id={`flashcard-${card.id}`} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <button className={`transition-all duration-300 flex items-center justify-center p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 ${isFavorite ? 'scale-110' : 'scale-100'}`}
                onClick={() => onFavoriteClick(card.id)}
                aria-label={isFavorite ? "Quản lý trong Playlist" : "Thêm vào Playlist"}>
            <img src={isFavorite ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"} alt={isFavorite ? "Favorite icon" : "Unfavorite icon"} className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'opacity-100' : 'opacity-75'}`} />
        </button>
      </div>
      <div className="w-full">
        <div className={`relative w-full ${visualStyle === 'realistic' ? 'p-2 bg-amber-50/70 dark:bg-gray-800' : ''}`}>
          {visualStyle === 'anime' && <div className="absolute inset-0 bg-pink-300/20 dark:bg-purple-400/10 pointer-events-none"></div>}
          {visualStyle === 'comic' && <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" style={comicDotPattern}></div>}
          {visualStyle === 'realistic' && <div className="absolute inset-2 shadow-inner rounded-md pointer-events-none"></div>}
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
  const [activeTab, setActiveTab] = useState('collection');
  const [loading, setLoading] = useState(true);
  
  // States cho Modals và UI
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('single');
  const [visualStyle, setVisualStyle] = useState('default');
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedCardForPlaylist, setSelectedCardForPlaylist] = useState<number[] | null>(null);
  const [activeScreen, setActiveScreen] = useState('home');
  const [toggleSidebar, setToggleSidebar] = useState<(() => void) | null>(null);
  const [showAllPlaylistsModal, setShowAllPlaylistsModal] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [isUpdatingPlaylists, setIsUpdatingPlaylists] = useState(false);

  // Data states
  const [openedCardsData, setOpenedCardsData] = useState<OpenedCardData[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [totalFlashcardsInCollection, setTotalFlashcardsInCollection] = useState(0);

  // State mới cho pagination bằng nút bấm
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  // Lưu "con trỏ" cho trang trước đó. Key là số trang.
  const [pageStartCursors, setPageStartCursors] = useState<Map<number, DocumentData | null>>(new Map([[1, null]]));

  // Trang hiện tại cho mỗi tab
  const [currentPageCollection, setCurrentPageCollection] = useState(1);
  const [currentPageFavorites, setCurrentPageFavorites] = useState(1);
  const itemsPerPage = 50; // Dùng chung cho cả 2 tab

  // --- Derived State ---
  const allFavoriteCardIds = useMemo(() => new Set(playlists.flatMap(p => p.cardIds)), [playlists]);
  const favoriteCount = allFavoriteCardIds.size;
  const totalPagesCollection = Math.ceil(totalFlashcardsInCollection / itemsPerPage);

  
  // --- Effects ---
  const fetchCollectionPage = useCallback(async (pageNumber: number) => {
    if (!currentUser || isFetchingPage) return;

    const startAfterDoc = pageStartCursors.get(pageNumber);
    if (pageNumber > 1 && startAfterDoc === undefined) {
      console.error(`Cannot fetch page ${pageNumber}, cursor not found.`);
      return;
    }
    
    setIsFetchingPage(true);
    setLoading(pageNumber === 1 && openedCardsData.length === 0);

    try {
        const openedVocabColRef = collection(db, 'users', currentUser.uid, 'openedVocab');
        const q = startAfterDoc
            ? query(openedVocabColRef, orderBy("collectedAt", "desc"), startAfter(startAfterDoc), limit(itemsPerPage))
            : query(openedVocabColRef, orderBy("collectedAt", "desc"), limit(itemsPerPage));
        
        const documentSnapshots = await getDocs(q);

        const newCards = documentSnapshots.docs.map(doc => {
            const data = doc.data();
            return {
                id: Number(doc.id),
                collectedAt: data.collectedAt?.toDate() || new Date(0)
            };
        });

        setOpenedCardsData(newCards);

        if (documentSnapshots.docs.length > 0) {
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setPageStartCursors(prev => new Map(prev).set(pageNumber + 1, lastDoc));
        }
        
        setCurrentPageCollection(pageNumber);

    } catch (error) {
        console.error(`Error fetching page ${pageNumber}:`, error);
    } finally {
        setIsFetchingPage(false);
        setLoading(false);
    }
  }, [currentUser, isFetchingPage, pageStartCursors, itemsPerPage, openedCardsData.length]);

  // Lắng nghe thay đổi tổng thể và fetch trang đầu tiên
  useEffect(() => {
    let unsubscribeUserDoc: () => void;
    if (!currentUser) {
        setLoading(false);
        setOpenedCardsData([]);
        setPlaylists([]);
        setTotalFlashcardsInCollection(0);
        setCurrentPageCollection(1);
        setPageStartCursors(new Map([[1, null]]));
        return;
    }
    
    let currentTotal = totalFlashcardsInCollection;
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setPlaylists(Array.isArray(userData.playlists) ? userData.playlists : []);
        const newTotal = userData.totalVocabCollected || 0;
        if (newTotal !== currentTotal) {
            currentTotal = newTotal;
            setTotalFlashcardsInCollection(newTotal);
            setCurrentPageCollection(1);
            setPageStartCursors(new Map([[1, null]]));
            fetchCollectionPage(1); 
        }
      } else {
        setPlaylists([]);
        setTotalFlashcardsInCollection(0);
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
    });
    
    fetchCollectionPage(1);

    return () => {
      if(unsubscribeUserDoc) unsubscribeUserDoc();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);


  const handlePageChangeCollection = (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > totalPagesCollection || pageNumber === currentPageCollection) return;
      fetchCollectionPage(pageNumber);
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
  };


  // --- Logic hiển thị thẻ ---
  const favoriteCards = useMemo(() => {
    const getDisplayCard = (id: number): DisplayCard | undefined => {
        const card = ALL_CARDS_MAP.get(id);
        if (!card) return undefined;
        return { card, isFavorite: true };
    };

    let cardIdsToShow: number[] = [];
    if (selectedPlaylistId === 'all') {
        cardIdsToShow = Array.from(allFavoriteCardIds).sort((a,b) => b-a);
    } else {
        const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
        cardIdsToShow = selectedPlaylist ? [...selectedPlaylist.cardIds].sort((a,b) => b-a) : [];
    }
    return cardIdsToShow
        .map(id => getDisplayCard(id))
        .filter((item): item is DisplayCard => item !== undefined);
  }, [allFavoriteCardIds, playlists, selectedPlaylistId]);

  const totalPagesFavorites = Math.ceil(favoriteCards.length / itemsPerPage);
  const startIndexFavorites = (currentPageFavorites - 1) * itemsPerPage;
  const endIndexFavorites = startIndexFavorites + itemsPerPage;
  const favoritesForCurrentPage = favoriteCards.slice(startIndexFavorites, endIndexFavorites);

  const displayCards = useMemo((): DisplayCard[] => {
    if (activeTab === 'collection') {
       return openedCardsData.map(item => ({
        card: ALL_CARDS_MAP.get(item.id)!,
        isFavorite: allFavoriteCardIds.has(item.id)
      })).filter(dc => dc.card);
    }
    return favoritesForCurrentPage;
  }, [activeTab, openedCardsData, allFavoriteCardIds, favoritesForCurrentPage]);
  
  const handlePageChangeFavorites = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPagesFavorites) return;
    setCurrentPageFavorites(pageNumber);
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [totalPagesFavorites]);
  
  const paginationItems = useMemo(() => {
    const siblingCount = 1;
    const totalPages = activeTab === 'collection' ? totalPagesCollection : totalPagesFavorites;
    const currentPage = activeTab === 'collection' ? currentPageCollection : currentPageFavorites;

    const totalPageNumbers = siblingCount + 5;
    if (totalPages <= 1) return [];
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
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
  }, [activeTab, totalPagesCollection, totalPagesFavorites, currentPageCollection, currentPageFavorites]);
  

  // --- Handlers ---
  const handleShowHome = useCallback(() => setActiveScreen('home'), []);
  const handleShowStats = useCallback(() => setActiveScreen('stats'), []);
  const handleShowRank = useCallback(() => setActiveScreen('rank'), []);
  const handleShowGoldMine = useCallback(() => setActiveScreen('goldMine'), []);
  const handleShowTasks = useCallback(() => setActiveScreen('tasks'), []);
  const handleShowPerformance = useCallback(() => setActiveScreen('performance'), []);
  const handleShowSettings = useCallback(() => setActiveScreen('settings'), []);
  const handleShowHelp = useCallback(() => setActiveScreen('help'), []);
  
  const handleTabChange = (tab: 'collection' | 'favorite') => {
      setActiveTab(tab);
      setCurrentPageFavorites(1);
  };
  
  const closePlaylistModal = useCallback(() => { setIsPlaylistModalOpen(false); setSelectedCardForPlaylist(null); }, []);
  const closeVocabDetail = useCallback(() => { setShowVocabDetail(false); setSelectedCard(null); showNavBar(); }, [showNavBar]);

  const openPlaylistModal = useCallback((cardId: number) => {
    setSelectedCardForPlaylist([cardId]);
    setIsPlaylistModalOpen(true);
  }, []);

  const handleFavoriteClick = useCallback((id: number) => {
    if (!currentUser) return;
    openPlaylistModal(id);
  }, [currentUser, openPlaylistModal]);

  const openVocabDetail = useCallback((card: Flashcard) => {
    setSelectedCard(card);
    setShowVocabDetail(true);
    hideNavBar();
  }, [hideNavBar]);

  const getImageUrlForStyle = useCallback((card: Flashcard, style: string): string => {
    switch (style) {
        case 'anime': return card.imageUrl.anime || card.imageUrl.default;
        case 'comic': return card.imageUrl.comic || card.imageUrl.default;
        case 'realistic': return card.imageUrl.realistic || card.imageUrl.default;
        default: return card.imageUrl.default;
    }
  }, []);

  const scrollbarHide = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  const pinnedCount = useMemo(() => playlists.filter(p => p.isPinned).length, [playlists]);

  const handleTogglePin = useCallback(async (playlistId: string) => {
    if (!currentUser) return;

    const originalPlaylists = [...playlists];
    const newPlaylists = originalPlaylists.map(p => {
        if (p.id === playlistId) {
            if (!p.isPinned && pinnedCount >= 2) {
                alert("Bạn chỉ có thể ghim tối đa 2 playlist.");
                return p;
            }
            return { ...p, isPinned: !p.isPinned };
        }
        return p;
    });

    if (JSON.stringify(newPlaylists) === JSON.stringify(originalPlaylists)) {
        return;
    }

    setIsUpdatingPlaylists(true);
    setPlaylists(newPlaylists);

    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { playlists: newPlaylists });
    } catch (error) {
        console.error("Lỗi khi ghim/bỏ ghim playlist:", error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        setPlaylists(originalPlaylists);
    } finally {
        setIsUpdatingPlaylists(false);
    }
  }, [playlists, pinnedCount, currentUser]);

  const pillsToDisplay = useMemo(() => {
    const pinned = playlists.filter(p => p.isPinned);
    const selected = playlists.find(p => p.id === selectedPlaylistId);

    const displaySet = new Set<Playlist>();
    pinned.forEach(p => displaySet.add(p));
    if (selected && !displaySet.has(selected) && selectedPlaylistId !== 'all') {
        displaySet.add(selected);
    }
    return Array.from(displaySet).sort((a,b) => a.name.localeCompare(b.name));
  }, [playlists, selectedPlaylistId]);

  const handleConfirmDelete = useCallback(async () => {
    if (!playlistToDelete || !currentUser) return;

    const originalPlaylists = [...playlists];
    const newPlaylists = originalPlaylists.filter(p => p.id !== playlistToDelete.id);

    setIsUpdatingPlaylists(true);

    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { playlists: newPlaylists });
        
        setPlaylists(newPlaylists);
        if (selectedPlaylistId === playlistToDelete.id) {
            setSelectedPlaylistId('all');
        }
        setPlaylistToDelete(null);
    } catch (error) {
        console.error("Lỗi khi xoá playlist:", error);
        alert("Đã xảy ra lỗi khi xoá playlist. Vui lòng thử lại.");
    } finally {
        setIsUpdatingPlaylists(false);
    }
  }, [playlistToDelete, currentUser, playlists, selectedPlaylistId]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">Đang tải bộ sưu tập...</div>;
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
      <div ref={mainContainerRef} className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <style>{animations}</style>
        <style>{scrollbarHide}</style>

        {activeScreen === 'home' && (
          <>
            <div className="w-full max-w-6xl py-6 mx-auto">
              <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flashcard Gallery</h1>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleSidebar?.()} className="relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800" aria-label="Toggle Sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                  <div id="settings-button" className={`relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 cursor-pointer ${isSettingsHovered || showSettings ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800' : 'border-gray-100 dark:border-gray-700'}`} onMouseEnter={() => setIsSettingsHovered(true)} onMouseLeave={() => setIsSettingsHovered(false)} onClick={() => setShowSettings(!showSettings)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSettingsHovered || showSettings ? 'text-indigo-600 dark:text-indigo-400 rotate-45' : 'text-gray-600 dark:text-gray-400'} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 mx-4">
                <button onClick={() => handleTabChange('collection')} className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'collection' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'collection' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10M7 13h6" /></svg>
                  <span>Collection</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'collection' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInCollection}</span>
                </button>
                <button onClick={() => handleTabChange('favorite')} className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'favorite' ? 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'favorite' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill={activeTab === 'favorite' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  <span>Favorite</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'favorite' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{favoriteCount}</span>
                </button>
              </div>

              {activeTab === 'favorite' && (
                <div className="px-4 mb-6">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                      Đang xem trong Playlist
                    </label>

                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      <button
                        onClick={() => { setSelectedPlaylistId('all'); setCurrentPageFavorites(1); }}
                        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                          ${selectedPlaylistId === 'all'
                            ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700 font-bold shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600'}`
                          }
                      >
                        <span>Tất cả</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full
                          ${selectedPlaylistId === 'all' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`
                        }>
                          {favoriteCount}
                        </span>
                      </button>

                      {pillsToDisplay.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPlaylistId(p.id); setCurrentPageFavorites(1); }}
                          className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border truncate max-w-[250px]
                            ${selectedPlaylistId === p.id
                              ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700 font-bold shadow-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600'}`
                            }
                        >
                          {p.isPinned && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                          <span className="truncate">{p.name}</span>
                          <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full
                            ${selectedPlaylistId === p.id ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`
                          }>
                            {p.cardIds.length}
                          </span>
                        </button>
                      ))}

                       <button
                          onClick={() => setShowAllPlaylistsModal(true)}
                          className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                          aria-label="Xem tất cả playlist"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-0 relative">
                {isFetchingPage && activeTab === 'collection' && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10" style={{animation: 'fadeIn 0.3s'}}>
                       <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                    </div>
                )}
              <div className="w-full max-w-6xl mx-auto">
                {displayCards.length > 0 ? (
                  <div className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {displayCards.map(({ card, isFavorite }) => (
                      <FlashcardItem
                        key={card.id}
                        card={card}
                        isFavorite={isFavorite}
                        visualStyle={visualStyle}
                        onImageClick={openVocabDetail}
                        onFavoriteClick={handleFavoriteClick}
                        getImageUrlForStyle={getImageUrlForStyle}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 dark:text-pink-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{activeTab === 'collection' ? 'Bộ sưu tập trống' : selectedPlaylistId === 'all' ? 'Chưa có từ yêu thích' : 'Playlist này trống'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">{activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : selectedPlaylistId === 'all' ? 'Nhấn vào biểu tượng trái tim để thêm từ vào mục yêu thích.' : 'Hãy thêm các từ yêu thích vào playlist này.'}</p>
                  </div>
                )}

                {paginationItems.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4">
                    <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Pagination">
                      {paginationItems.map((item, index) =>
                        typeof item === 'string' ? (
                          <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => activeTab === 'collection' ? handlePageChangeCollection(item) : handlePageChangeFavorites(item)}
                            disabled={isFetchingPage && activeTab === 'collection'}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 
                              ${(activeTab === 'collection' ? currentPageCollection : currentPageFavorites) === item 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}
                              ${isFetchingPage && activeTab === 'collection' ? 'cursor-wait opacity-50' : ''}`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </nav>
                  </div>
                )}

              </div>
            </div>

            {showSettings && (
              <>
                {/* Modal Settings... */}
              </>
            )}

            <FlashcardDetailModal selectedCard={selectedCard} showVocabDetail={showVocabDetail} exampleSentencesData={exampleData} onClose={closeVocabDetail} currentVisualStyle={visualStyle} />

            {isPlaylistModalOpen && selectedCardForPlaylist && (
              <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={closePlaylistModal}
                cardIds={selectedCardForPlaylist}
                currentUser={currentUser}
                existingPlaylists={playlists}
              />
            )}

            {showAllPlaylistsModal && (
              <>
                {/* Modal All Playlists... */}
              </>
            )}
          </>
        )}

        {activeScreen !== 'home' && (
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
// --- END OF FILE VerticalFlashcardGallery.tsx ---
