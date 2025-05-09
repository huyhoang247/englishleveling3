import { useRef, useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import the new component
// Import defaultImageUrls from the new file
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts'; // Adjust the path if necessary and rename import

// Import Firebase auth and db
import { auth, db } from './firebase.js';
// Import Firestore functions and User type
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { User } from 'firebase/auth';


// Define the props interface for VerticalFlashcardGallery
interface VerticalFlashcardGalleryProps {
  hideNavBar: () => void; // Function to hide the nav bar
  showNavBar: () => void; // Function to show the nav bar
  currentUser: User | null; // Add currentUser prop
}

// Define the structure for image URLs by style
interface StyledImageUrls {
  default: string;
  anime?: string; // Optional URL for anime style
  comic?: string; // Optional URL for comic style
  realistic?: string; // Optional URL for realistic style
  // Add more styles as needed
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

// Define the structure for a flashcard, including styled image URLs
interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls; // Now an object containing URLs for different styles
  isFavorite: boolean;
  vocabulary: VocabularyData; // Use the VocabularyData interface
}

// --- Dữ liệu ảnh theo từng phong cách (Thêm dữ liệu mẫu để có hơn 50 ảnh) ---
// Tạo mảng dữ liệu mẫu lớn hơn
const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};

// Số lượng flashcard mẫu mong muốn (đảm bảo đủ lớn để chứa tất cả các ID có thể mở)
// Dựa trên ảnh Firestore, có ID lên tới 197, nên đặt là 200 hoặc hơn.
const numberOfSampleFlashcards = 200; // Tăng số lượng để có nhiều ảnh hơn


// Danh sách URL ảnh mặc định (Sử dụng dữ liệu ban đầu và thêm placeholder nếu cần)
// Đảm bảo mảng này có ít nhất numberOfSampleFlashcards phần tử
const defaultImageUrls: string[] = [
  ...initialDefaultImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0')
];


// Danh sách URL ảnh cho phong cách Anime (Thêm dữ liệu mẫu)
// Đảm bảo mảng này có ít nhất numberOfSampleFlashcards phần tử
const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');

// Danh sách URL ảnh cho phong cách Comic (Thêm dữ liệu mẫu)
// Đảm bảo mảng này có ít nhất numberOfSampleFlashcards phần tử
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');

// Danh sách URL ảnh cho phong cách Realistic (Thêm dữ liệu mẫu)
// Đảm bảo mảng này có ít nhất numberOfSampleFlashcards phần tử
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');


// --- Dữ liệu từ vựng (Thêm dữ liệu mẫu để có hơn 50 mục) ---
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

// Dữ liệu từ vựng ban đầu (từ file cũ)
const initialVocabularyData: VocabularyData[] = [
  {
    word: "Source",
    meaning: "Nguồn, gốc",
    example: "What is the source of this information?",
    phrases: ["Information source", "Primary source"],
    popularity: "Cao",
    synonyms: ["Origin", "Root", "Beginning"],
    antonyms: ["Result", "Outcome", "End"]
  },
  {
    word: "Insurance",
    meaning: "Bảo hiểm",
    example: "You should buy travel insurance before your trip.",
    phrases: ["Health insurance", "Car insurance"],
    popularity: "Cao",
    synonyms: ["Assurance", "Coverage", "Protection"],
    antonyms: ["Risk", "Danger", "Exposure"]
  },
  {
    word: "Argument",
    meaning: "Cuộc tranh luận, lý lẽ",
    example: "They had a heated argument about politics.",
    phrases: ["Strong argument", "Logical argument"],
    popularity: "Trung bình",
    synonyms: ["Dispute", "Debate", "Reasoning"],
    antonyms: ["Agreement", "Harmony", "Peace"]
  },
  {
    word: "Influence",
    meaning: "Ảnh hưởng",
    example: "His parents had a strong influence on his career choice.",
    phrases: ["Direct influence", "Negative influence"],
    popularity: "Cao",
    synonyms: ["Impact", "Effect", "Control"],
    antonyms: ["Lack of effect", "Insignificance"]
  },
  {
    word: "Vocabulary 5", // Thay thế bằng từ vựng thứ năm nếu có
    meaning: "Nghĩa của từ vựng 5",
    example: "Ví dụ cho từ vựng 5.",
    phrases: ["Cụm từ 1", "Cụm từ 2"],
    popularity: "Thấp",
    synonyms: ["Từ đồng nghĩa 1", "Từ đồng nghĩa 2"],
    antonyms: ["Từ trái nghĩa 1", "Từ trái nghĩa 2"]
  }
];

// Kết hợp dữ liệu ban đầu và dữ liệu mẫu
// Đảm bảo mảng này có ít nhất numberOfSampleFlashcards phần tử
const vocabularyData: VocabularyData[] = [
  ...initialVocabularyData,
  ...generatePlaceholderVocabulary(Math.max(0, numberOfSampleFlashcards - initialVocabularyData.length))
];


// --- Tạo mảng ALL_POSSIBLE_FLASHCARDS từ dữ liệu trên ---
// Tạo một mảng chứa TẤT CẢ các flashcard tiềm năng, không phụ thuộc vào việc đã mở hay chưa.
const ALL_POSSIBLE_FLASHCARDS: Flashcard[] = [];
// Sử dụng số lượng lớn nhất giữa các mảng dữ liệu để đảm bảo tạo đủ flashcard
const totalPossibleFlashcards = Math.max(
    defaultImageUrls.length,
    animeImageUrls.length,
    comicImageUrls.length,
    realisticImageUrls.length,
    vocabularyData.length
);

for (let i = 0; i < totalPossibleFlashcards; i++) {
    // Lấy dữ liệu theo index, sử dụng dữ liệu mặc định hoặc placeholder nếu index vượt quá độ dài mảng ban đầu
    const vocab = vocabularyData[i] || {
        word: `Word ${i + 1}`,
        meaning: `Meaning of Word ${i + 1}`,
        example: `Example sentence for Word ${i + 1}.`,
        phrases: [`Phrase A ${i + 1}`, `Phrase B ${i + 1}`],
        popularity: (i + 1) % 3 === 0 ? "Cao" : (i + 1) % 2 === 0 ? "Trung bình" : "Thấp",
        synonyms: [`Synonym 1.${i + 1}`, `Synonym 2.${i + 1}`],
        antonyms: [`Antonym 1.${i + 1}`, `Antonym 2.${i + 1}`]
    };

     const imageUrls: StyledImageUrls = {
        default: defaultImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Default+${i + 1}`,
        anime: animeImageUrls[i] || `https://placehold.co/1024x1536/FF99CC/FFFFFF?text=Anime+${i + 1}`,
        comic: comicImageUrls[i] || `https://placehold.co/1024x1536/66B2FF/FFFFFF?text=Comic+${i + 1}`,
        realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${i + 1}`,
     };


    ALL_POSSIBLE_FLASHCARDS.push({
        id: i + 1, // ID dựa trên vị trí (bắt đầu từ 1)
        imageUrl: imageUrls,
        isFavorite: false, // Đặt trạng thái yêu thích mặc định
        vocabulary: vocab, // Gán dữ liệu từ vựng theo index
    });
}


// Array containing URLs of example images (1024x1536px) - Can still be used for the detail modal if needed
const exampleImages = [
  "https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1", // Placeholder example images
  "https://placehold.co/1024x1536/33FF57/FFFFFF?text=Example+2",
  "https://placehold.co/1024x1536/3357FF/FFFFFF?text=Example+3",
  "https://placehold.co/1024x1536/FF33A1/FFFFFF?text=Example+4",
  "https://placehold.co/1024x1536/A133FF/FFFFFF?text=Example+5",
  // Add more images if needed
];


// Animation styles for toast and settings modal
const animations = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  @keyframes slideIn {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes scaleIn {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* Animation for backdrop */
  @keyframes modalBackdropIn {
    0% { opacity: 0; }
    100% { opacity: 0.4; } /* Use 0.4 opacity as requested */
  }

  /* Animation for modal (added but not used in the new settings code) */
  @keyframes modalIn {
    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Adding style-specific animations */
  @keyframes animeSparkle {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  @keyframes comicPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes realisticShine {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
`;

// Accept hideNavBar and showNavBar as props
export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  const scrollContainerRef = useRef(null);
  // Initialize flashcards state with the full list of possible flashcards
  const [flashcards, setFlashcards] = useState(ALL_POSSIBLE_FLASHCARDS);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [activeTab, setActiveTab] = useState('collection'); // 'collection' or 'favorite'
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('single'); // 'single' or 'double'

  // Add a new state variable for visual style
  const [visualStyle, setVisualStyle] = useState('default'); // 'default', 'anime', 'comic', or 'realistic'

  // Add this after the visualStyle state
  const [imageDetail, setImageDetail] = useState('basic'); // 'basic', 'phrase', or 'example'

  // State to manage the selected card for detail view
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null); // Use Flashcard type
  // State to manage vocabulary modal visibility - Now used by FlashcardDetailModal
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  // --- NEW: State for opened image IDs from Firestore ---
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);
  const [loadingOpenedImages, setLoadingOpenedImages] = useState(true); // State to track loading

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Set items per page to 50


  // --- NEW: Effect to fetch openedImageIds from Firestore ---
  useEffect(() => {
    const fetchOpenedImageIds = async () => {
      if (!currentUser) {
        console.log("No current user, resetting openedImageIds.");
        setOpenedImageIds([]); // Reset if no user
        setLoadingOpenedImages(false);
        return;
      }

      setLoadingOpenedImages(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Ensure openedImageIds is an array, default to empty if missing or not array
          const fetchedIds = Array.isArray(userData?.openedImageIds) ? userData.openedImageIds : [];
          // --- REVERSE THE ARRAY HERE ---
          setOpenedImageIds(fetchedIds.reverse()); // Reverse the fetched IDs
          console.log("Fetched and reversed openedImageIds:", fetchedIds.reverse()); // Log fetched IDs
        } else {
          setOpenedImageIds([]); // User document doesn't exist or no openedImageIds field
          console.log("User document not found or no openedImageIds field for user:", currentUser.uid);
        }
      } catch (error) {
        console.error("Error fetching openedImageIds:", error);
        setOpenedImageIds([]); // Reset on error
      } finally {
        setLoadingOpenedImages(false);
      }
    };

    fetchOpenedImageIds();
  }, [currentUser]); // Re-run when currentUser changes


  // Filter and order flashcards based on active tab and openedImageIds
  const filteredFlashcardsByTab = activeTab === 'collection'
    ? // For collection, filter and order based on the sequence in openedImageIds (now reversed)
      openedImageIds
        .map(id => ALL_POSSIBLE_FLASHCARDS.find(card => card.id === id)) // Find the flashcard for each ID
        .filter(card => card !== undefined) as Flashcard[] // Filter out any undefined results (shouldn't happen if ALL_POSSIBLE_FLASHCARDS is complete)
    : // For favorite, filter by isFavorite (original logic)
      ALL_POSSIBLE_FLASHCARDS.filter(card => card.isFavorite);

  // Log the filtered flashcards to see if the filtering and ordering works as expected
  useEffect(() => {
      console.log(`Filtered and ordered flashcards for ${activeTab} tab:`, filteredFlashcardsByTab);
  }, [filteredFlashcardsByTab, activeTab]);


  // Calculate total pages based on filtered flashcards
  const totalPages = Math.ceil(filteredFlashcardsByTab.length / itemsPerPage);

  // Get flashcards for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const flashcardsForCurrentPage = filteredFlashcardsByTab.slice(startIndex, endIndex);

  // Log the flashcards for the current page
  useEffect(() => {
      console.log("Flashcards for current page:", flashcardsForCurrentPage);
  }, [flashcardsForCurrentPage]);


  const favoriteCount = ALL_POSSIBLE_FLASHCARDS.filter(card => card.isFavorite).length; // Count favorites from the full list
  // Total flashcards in collection is now the count of opened images
  const totalFlashcardsInCollection = openedImageIds.length;

  // Toggle favorite status for a flashcard
  const toggleFavorite = (id: number) => { // Added type for id
    // Update the favorite status in the main ALL_POSSIBLE_FLASHCARDS array
    // Note: This change is local to the component's state and not persisted to Firestore yet.
    // If you need favorite status to persist, you'll need to save it to Firestore as well.
    setFlashcards(prevCards =>
      prevCards.map(card =>
        card.id === id
          ? { ...card, isFavorite: !card.isFavorite }
          : card
      )
    );

    // Show favorite status toast
    setShowFavoriteToast(true);
    setTimeout(() => setShowFavoriteToast(false), 2000);
  };

  // Function to open vocabulary detail modal
  const openVocabDetail = (card: Flashcard) => { // Added type for card
    setSelectedCard(card); // Set the selected card
    setShowVocabDetail(true); // Show the modal
    hideNavBar(); // Hide the nav bar when modal opens
  };

  // Function to close vocabulary detail modal - Passed to FlashcardDetailModal
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedCard(null); // Clear selected card when closing
    showNavBar(); // Show the nav bar when modal closes
  };

  // Function to get the correct image URL based on visual style
  const getImageUrlForStyle = (card: Flashcard, style: string): string => {
    // Check if the requested style exists in the imageUrl object, otherwise default
    const url = (() => {
        switch (style) {
            case 'anime':
                return card.imageUrl.anime || card.imageUrl.default;
            case 'comic':
                return card.imageUrl.comic || card.imageUrl.default;
            case 'realistic':
                return card.imageUrl.realistic || card.imageUrl.default;
            default:
                return card.imageUrl.default;
        }
    })();
    console.log(`Getting image URL for card ID ${card.id}, style ${style}:`, url); // Log the URL being used
    return url;
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Optional: Scroll to top of the flashcard list when changing page
    if (scrollContainerRef.current) {
      (scrollContainerRef.current as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Show loading state if openedImageIds are being fetched
  if (loadingOpenedImages) {
      return (
          <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
              Đang tải bộ sưu tập...
          </div>
      );
  }


  return (
    // Main container now handles scrolling
    // Removed px-4 from this div to remove horizontal padding
    <div className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
      {/* Inject CSS animations */}
      <style>{animations}</style>

      {/* Header with Tabs and Settings */}
      {/* This div will now scroll with the content */}
      {/* Removed px-4 from this div as well */}
      <div className="w-full max-w-6xl py-6 mx-auto"> {/* Added mx-auto for centering */}
        <div className="flex justify-between items-center mb-4 px-4"> {/* Added px-4 back here to keep padding around header content */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flashcard Gallery</h1> {/* Added dark mode text color */}

          {/* Setting Button with hover effect */}
          <div
            id="settings-button"
            className={`relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 cursor-pointer ${isSettingsHovered || showSettings ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800' : 'border-gray-100 dark:border-gray-700'}`} // Added dark mode styles
            onMouseEnter={() => setIsSettingsHovered(true)}
            onMouseLeave={() => setIsSettingsHovered(false)}
            onClick={() => setShowSettings(!showSettings)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isSettingsHovered || showSettings ? 'text-indigo-600 dark:text-indigo-400 rotate-45' : 'text-gray-600 dark:text-gray-400'} transition-all duration-300`} // Added dark mode styles
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </div>

        {/* Redesigned Tab Navigation - With improved background color */}
        {/* Removed px-4 from this div as well */}
        <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 mx-4"> {/* Added dark mode styles, added mx-4 to keep padding around tabs */}
          <button
            onClick={() => { setActiveTab('collection'); setCurrentPage(1); }} // Reset page on tab change
            className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
              activeTab === 'collection'
                ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' // Added dark mode styles
                : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700' // Added dark mode styles
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${activeTab === 'collection' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} // Added dark mode styles
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 10h10M7 13h6" />
            </svg>
            <span>Collection</span>
            {/* Display the count of opened images for the collection tab */}
            <span className={`inline-flex items-center justify-center ${activeTab === 'collection' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInCollection}</span> {/* Added dark mode styles */}
          </button>

          <button
            onClick={() => { setActiveTab('favorite'); setCurrentPage(1); }} // Reset page on tab change
            className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
              activeTab === 'favorite'
                ? 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium shadow-sm' // Added dark mode styles
                : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700' // Added dark mode styles
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${activeTab === 'favorite' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} // Added dark mode styles
              viewBox="0 0 24 24"
              fill={activeTab === 'favorite' ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Favorite</span>
            <span className={`inline-flex items-center justify-center ${activeTab === 'favorite' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{favoriteCount}</span> {/* Added dark mode styles */}
          </button>
        </div>
      </div>

      {/* Main Content - Removed flex-1 from this container to fix the layout issue */}
      {/* This div now allows the grid layout inside to function correctly */}
      {/* Removed pb-16 class to allow pagination to sit at the bottom of the content */}
      {/* Removed p-4 from this div */}
      <div className="min-h-0">
        {/* Removed px-4 from this div */}
        <div className="w-full max-w-6xl mx-auto"> {/* Added mx-auto for centering */}
          {flashcardsForCurrentPage.length > 0 ? (
            // Wrapped flashcard mapping in a grid div based on layoutMode
            // Removed pb-12 from here as we are adding it to the pagination container
            // Added px-4 to the grid container to add padding back only around the grid items
            <div
              ref={scrollContainerRef}
              className={`grid gap-4 px-4 ${ // Added px-4 here
                layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {flashcardsForCurrentPage.map((card) => ( // Use flashcardsForCurrentPage
                // Removed w-[48%] and w-full as grid handles width
                <div key={card.id}>
                  {/* Flashcard component rendering */}
                  <div
                    id={`flashcard-${card.id}`}
                    // Removed border classes from here
                    className={`flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden relative group`} // Added dark mode styles, removed mb-8/mb-0 as gap handles spacing
                  >
                    {/* Hover effect for flashcard */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>

                    {/* Heart Icon - Favorite/Unfavorite - Removed background and padding classes */}
                    <button
                      className={`absolute top-3 right-3 transition-all duration-300 z-10 flex items-center justify-center ${card.isFavorite ? 'scale-110' : 'scale-100'}`} // Removed rounded-full, bg-*, p-* classes
                      onClick={() => toggleFavorite(card.id)}
                      aria-label={card.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {/* Replaced SVG with img tag and added opacity class */}
                      <img
                        src={card.isFavorite
                          ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png"
                          : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"
                        }
                        alt={card.isFavorite ? "Favorite icon" : "Unfavorite icon"}
                        className={`transition-all duration-300 ${
                          layoutMode === 'double'
                            ? 'h-4 w-4'
                            : 'h-6 w-6'
                        } ${card.isFavorite ? 'opacity-100' : 'opacity-75'}`} // Added conditional opacity class
                      />
                    </button>

                    {/* Image aspect ratio container with style effects */}
                    <div className="w-full">
                      {/* Removed conditional border classes from this div */}
                      <div className={`relative w-full ${
                        visualStyle === 'realistic' ? 'p-2 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800' : // Added dark mode styles
                        ''
                      }`}>
                        {/* Apply style-specific overlays */}
                        {visualStyle === 'anime' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30 mix-blend-overlay pointer-events-none"></div>
                        )}
                        {visualStyle === 'comic' && (
                          <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" // Added dark mode styles
                            style={{
                              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)',
                              backgroundSize: '4px 4px'
                            }}>
                          </div>
                        )}
                        {visualStyle === 'realistic' && (
                          <div className="absolute inset-0 shadow-inner pointer-events-none"></div>
                        )}

                        {/* Flashcard image updated to include click event and dynamic URL */}
                        <img
                          src={getImageUrlForStyle(card, visualStyle)} // Use the helper function to get the correct URL
                          alt={`Flashcard ${card.id}`}
                          className={`w-full h-auto ${
                            visualStyle === 'anime' ? 'saturate-150 contrast-105' :
                            visualStyle === 'comic' ? 'contrast-125 brightness-105' :
                            visualStyle === 'realistic' ? 'saturate-105 contrast-110 shadow-md' :
                            ''
                          } cursor-pointer`} // Added cursor-pointer
                          style={{
                            aspectRatio: '1024/1536',
                            filter: visualStyle === 'comic' ? 'grayscale(0.1)' : 'none'
                          }}
                          onClick={() => openVocabDetail(card)} // Added click event
                          onError={(e) => {
                            console.error(`Error loading image for card ID ${card.id}, URL: ${e.currentTarget.src}`); // Log image load error
                            e.currentTarget.onerror = null;
                            // Fallback to default image if the styled image fails to load
                            e.currentTarget.src = card.imageUrl.default;
                            console.log(`Falling back to default image for card ID ${card.id}:`, card.imageUrl.default); // Log fallback URL
                          }}
                        />

                        {/* Image Detail Overlay based on setting - Removed the overlay */}
                        {/* The overlay for image detail is now completely removed */}

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Display empty state for Favorite tab if no items
            <div className="flex flex-col items-center justify-center py-16 text-center px-4"> {/* Added px-4 here */}
              <div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4"> {/* Added dark mode styles */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-pink-300 dark:text-pink-600" // Added dark mode styles
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {activeTab === 'collection' ? 'Bộ sưu tập trống' : 'Không có flashcard yêu thích'}
              </h3> {/* Added dark mode styles */}
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {activeTab === 'collection'
                    ? 'Hãy mở rương để nhận thêm flashcard mới!'
                    : 'Nhấn vào biểu tượng trái tim trên flashcard để thêm vào danh sách yêu thích của bạn'}
              </p> {/* Added dark mode styles */}
            </div>
          )}

          {/* --- Pagination Controls --- */}
          {/* Moved pagination controls inside the main content div */}
          {totalPages > 1 && ( // Only show pagination if there's more than one page
            // Removed border-t and border-gray classes from this container
            // Added px-4 to the pagination container
            <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4"> {/* Removed fixed, bottom-0, left-0, right-0, z-30 classes, added mt-4 for spacing, CHANGED pb-12 to pb-24, Added px-4 */}
              <nav className="flex space-x-2" aria-label="Pagination">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  // Removed border classes from here
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    currentPage === 1
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' // Added dark mode styles
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' // Added dark mode styles
                  }`}
                >
                  Trước
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    // Removed border classes from here
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentPage === index + 1
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' // Added dark mode styles
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  // Removed border classes from here
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    currentPage === totalPages
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' // Added dark mode styles
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' // Added dark mode styles
                  }`}
                >
                  Sau
                </button>
              </nav>
            </div>
          )}

        </div>
      </div>


      {/* Settings Panel Popup */}
      {showSettings && (
        <>
          {/* Overlay */}
          {/* Removed onClick event to prevent closing popup when clicking overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
            style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }}
            // onClick={() => setShowSettings(false)} // Removed this line
          ></div>

          {/* Modal Popup */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" // Added max-h and flex-col, dark mode styles
              style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
              id="settings-panel"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex-shrink-0"> {/* Added flex-shrink-0 */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Cài đặt hiển thị
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[70vh] flex-grow"> {/* Added overflow-y-auto, max-h and flex-grow */}
                {/* Layout Mode */}
                <div className="mb-4"> {/* Changed mb-6 to mb-4 */}
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center"> {/* Changed mb-3 to mb-2, Added dark mode styles */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode styles */}
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Bố cục hiển thị
                  </h4>
                  <div className="flex space-x-2"> {/* Changed space-x-3 to space-x-2 */}
                    <div
                      className={`flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        layoutMode === 'single'
                          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setLayoutMode('single')}
                    >
                      <div className="w-8 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm mb-1"></div> {/* Changed w-10 h-16 to w-8 h-12, mb-2 to mb-1, Added dark mode styles */}
                      <span className={`text-xs ${layoutMode === 'single' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>1 Cột</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>

                    <div
                      className={`flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        layoutMode === 'double'
                          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setLayoutMode('double')}
                    >
                      <div className="flex space-x-1 mb-1"> {/* Changed space-x-1 mb-2 to space-x-1 mb-1 */}
                        <div className="w-4 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm"></div> {/* Changed w-5 h-16 to w-4 h-12, Added dark mode styles */}
                        <div className="w-4 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm"></div> {/* Changed w-5 h-16 to w-4 h-12, Added dark mode styles */}
                      </div>
                      <span className={`text-xs ${layoutMode === 'double' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>2 Cột</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>
                  </div>
                </div>

                {/* Visual Style */}
                <div className="mb-4"> {/* Changed mb-6 to mb-4 */}
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center"> {/* Changed mb-3 to mb-2, Added dark mode styles */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode styles */}
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                    Phong cách hiển thị
                  </h4>

                  {/* Style Buttons */}
                  <div className="grid grid-cols-2 gap-2"> {/* Changed grid-cols-2 gap-3 to grid-cols-2 gap-2 */}
                    {/* Default Style */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        visualStyle === 'default'
                          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setVisualStyle('default')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${ // Changed w-8 h-8 mr-3 to w-6 h-6 mr-2
                        visualStyle === 'default' ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'default' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                        </svg>
                      </div>
                      <span className={`text-xs ${visualStyle === 'default' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Mặc định</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>

                    {/* Anime Style */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        visualStyle === 'anime'
                          ? 'border-pink-500 bg-pink-50 dark:border-pink-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-600 hover:bg-pink-50/30 dark:hover:bg-pink-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setVisualStyle('anime')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${ // Changed w-8 h-8 mr-3 to w-6 h-6 mr-2
                        visualStyle === 'anime' ? 'bg-pink-100 dark:bg-pink-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'anime' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-xs ${visualStyle === 'anime' ? 'text-pink-700 dark:text-pink-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Anime</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>

                    {/* Comic Style */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        visualStyle === 'comic'
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setVisualStyle('comic')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${ // Changed w-8 h-8 mr-3 to w-6 h-6 mr-2
                        visualStyle === 'comic' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'comic' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        </svg>
                      </div>
                      <span className={`text-xs ${visualStyle === 'comic' ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Comic</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>

                    {/* Realistic Style */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        visualStyle === 'realistic'
                          ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setVisualStyle('realistic')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${ // Changed w-8 h-8 mr-3 to w-6 h-6 mr-2
                        visualStyle === 'realistic' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'realistic' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-xs ${visualStyle === 'realistic' ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Realistic</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>
                  </div>
                </div>

                {/* Image Detail */}
                <div className="mb-4"> {/* Changed mb-6 to mb-4 */}
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center"> {/* Changed mb-3 to mb-2, Added dark mode styles */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode styles */}
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Chi tiết hiển thị khi click ảnh
                  </h4>

                  {/* Detail Level Buttons */}
                  <div className="grid grid-cols-3 gap-2"> {/* Changed grid-cols-3 gap-3 to grid-cols-3 gap-2 */}
                    {/* Basic Detail */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        imageDetail === 'basic'
                          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setImageDetail('basic')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${ // Changed w-8 h-8 mb-2 to w-6 h-6 mb-1
                        imageDetail === 'basic' ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${imageDetail === 'basic' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                        </svg>
                      </div>
                      <span className={`text-xs text-center ${imageDetail === 'basic' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Ảnh gốc</span> {/* Changed text-sm to text-xs, and text to "Cơ Bản", Added dark mode styles */}
                    </div>

                    {/* Phrase Detail */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        imageDetail === 'phrase'
                          ? 'border-purple-500 bg-purple-50 dark:border-purple-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600 hover:bg-purple-50/30 dark:hover:bg-purple-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setImageDetail('phrase')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${ // Changed w-8 h-8 mb-2 to w-6 h-6 mb-1
                        imageDetail === 'phrase' ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${imageDetail === 'phrase' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
                          <path d="M11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                        </svg>
                      </div>
                      <span className={`text-xs text-center ${imageDetail === 'phrase' ? 'text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Cơ Bản</span> {/* Changed text-sm to text-xs, and text to "Cơ Bản", Added dark mode styles */}
                    </div>

                    {/* Example Detail */}
                    <div
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${ // Changed p-3 to p-2, rounded-xl to rounded-lg
                        imageDetail === 'example'
                          ? 'border-teal-500 bg-teal-50 dark:border-teal-900' // Added dark mode styles
                          : 'border-gray-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-900/30' // Added dark mode styles
                      }`}
                      onClick={() => setImageDetail('example')}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${ // Changed w-8 h-8 mb-2 to w-6 h-6 mb-1
                        imageDetail === 'example' ? 'bg-teal-100 dark:bg-teal-800' : 'bg-gray-100 dark:bg-gray-700' // Added dark mode styles
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${imageDetail === 'example' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"> {/* Changed h-4 w-4 to h-3 w-3, Added dark mode styles */}
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-xs text-center ${imageDetail === 'example' ? 'text-teal-700 dark:text-teal-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Ví dụ</span> {/* Changed text-sm to text-xs, Added dark mode styles */}
                    </div>
                  </div>
                </div>


                {/* Buttons */}
              </div> {/* Closed the body div here */}

              {/* Buttons - Fixed Footer */}
              <div className="sticky bottom-0 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex space-x-3 flex-shrink-0"> {/* Added sticky, bottom-0, left-0, right-0, mt-2, flex-shrink-0, dark mode styles */}
                <button
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-lg transition-all duration-300" // Changed py-2 to py-2.5, Added dark mode styles
                  onClick={() => setShowSettings(false)}
                >
                  Hủy
                </button>
                <button
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center" // Changed py-2 to py-2.5
                  onClick={() => setShowSettings(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast thông báo khi thay đổi trạng thái yêu thích */}
      {showFavoriteToast && (
        <div
          className="fixed top-24 right-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-pink-200 dark:border-pink-700 z-50 flex items-center" // Added dark mode styles
          style={{ animation: 'fadeInOut 2s forwards' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-pink-600 dark:text-pink-400" // Added dark mode styles
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Đã cập nhật danh sách yêu thích!</span> {/* Added dark mode styles */}
        </div>
      )}

      {/* Render the FlashcardDetailModal component */}
      <FlashcardDetailModal
        selectedCard={selectedCard}
        showVocabDetail={showVocabDetail}
        imageDetail={imageDetail}
        exampleImages={exampleImages} // Keep this if you still use it in the modal
        onClose={closeVocabDetail} // Pass the close function
      />

    </div>
  );
}
