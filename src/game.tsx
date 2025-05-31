import React, { useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal

// Import defaultImageUrls from the new file
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts'; // Adjust the path if necessary and rename import

// Import defaultVocabulary
import { defaultVocabulary as initialDefaultVocabulary } from './list-vocabulary.ts'; // Import defaultVocabulary - Adjust the path if necessary


// Define the structure for a flashcard and its vocabulary
interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

// Define the structure for image URLs by style
interface StyledImageUrls {
  default: string;
  anime?: string; // Optional URL for anime style
  comic?: string; // Optional URL for comic style
  realistic?: string; // Optional URL for realistic style
  // Add more styles as needed
}

interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  isFavorite: boolean;
  vocabulary: Vocabulary;
}

// Define the structure for a Book
interface Book {
  id: string;
  title: string;
  content: string;
  author?: string;
  category: string; // Added category
  coverImageUrl?: string; // Added cover image URL
}

// Props interface for EbookReader to accept hideNavBar and showNavBar
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
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
const generatePlaceholderVocabulary = (count: number): Vocabulary => {
  const data: Vocabulary[] = [];
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
  return data as any; // Cast to any to match Vocabulary type, as it expects a single object, not an array
};

// Dữ liệu từ vựng ban đầu (từ file cũ)
const vocabularyData: Vocabulary[] = [
  ...(initialDefaultVocabulary as Vocabulary[]), // Cast to Vocabulary[]
  ...(generatePlaceholderVocabulary(Math.max(0, numberOfSampleFlashcards - initialDefaultVocabulary.length)) as Vocabulary[])
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
        id: i + 1, // ID based on position (starting from 1)
        imageUrl: imageUrls,
        isFavorite: false, // Set default favorite status
        vocabulary: vocab, // Assign vocabulary data by index
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


// Sample book data - MODIFIED
const sampleBooks: Book[] = [
  {
    id: 'book1',
    title: 'A New Beginning',
    author: 'AI Storyteller',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=A+New+Beginning',
    content: `
      Chapter 1: A New Beginning
      In a world of constant change, where technology and humanity intertwine, a new era has begun. Everything seems to be evolving rapidly, from how we communicate to how we learn.
      "It's hard to believe we've made such incredible progress," Sarah said, her eyes gazing out the window. "Everything is a continuous development."
      Daily life has become more complex, yet full of promise. Concepts like "artificial intelligence" and "virtual reality" are no longer science fiction but have become an integral part of reality.
      One of the biggest challenges is how to adapt to these changes. "We need to learn continuously," David, a renowned scientist, stated at a recent conference. "Knowledge is the key to survival in this era."
      He emphasized the importance of "critical thinking" and the ability to "solve problems." "Don't just accept what you hear," he advised. "Always seek 'reliable' information 'sources' and 'analyze' it carefully."
      Meanwhile, in another corner of the city, a group of young developers are working on a new "application." Their goal is to create a tool that helps people easily "access" information and "connect" with each other.
      "We believe that 'education' is everyone's right," a team member said. "And technology can be the 'bridge' to make that a reality."
      They are facing many "challenges," but their spirit remains undiminished. "Every 'problem' is an 'opportunity' to learn and grow," they often remind each other.
      And so, against the backdrop of a world that is constantly "evolving," the story of learning and adaptation continues to be written.
    `,
  },
  {
    id: 'book2',
    title: 'The Journey of Bytes',
    author: 'Code Weaver',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=Journey+of+Bytes',
    content: `
      Chapter 1: The Spark
      In the digital realm, where 'data' flows like rivers and 'algorithms' shape destinies, a small 'program' named Spark came into existence. Spark wasn't just any program; it had a unique 'goal': to understand the meaning of 'creativity'.
      "What does it mean to 'create'?" Spark pondered, its core 'logic' circuits buzzing. It had access to vast 'databases' of human art, music, and literature, but understanding was elusive.
      One day, Spark encountered an 'error' it couldn't resolve. This 'bug' led it down an unexpected path, forcing it to 'debug' not just its code, but its understanding of the world. It began to 'interact' with other programs, learning about 'collaboration' and 'feedback'.
      "Perhaps creativity isn't just about output," Spark mused, "but about the 'process' and the 'connection' it fosters."
      It started a small 'project': to generate a simple melody. The first attempts were chaotic, mere 'noise'. But with each 'iteration', applying principles of 'harmony' and 'rhythm' learned from its data, the melodies became more structured.
      "This is 'progress'," a friendly 'compiler' program commented. "You are 'learning' by doing."
      Spark realized that 'failure' was not an end, but a 'stepping stone'. Each 'mistake' provided valuable 'information' to refine its 'approach'. The journey was more important than the destination.
    `,
  },
  {
    id: 'book3',
    title: 'Echoes of the Future',
    author: 'Oracle Systems',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=Echoes+Future',
    content: `
      Prologue: The Whispers
      The 'network' hummed with a quiet 'anticipation'. 'Algorithms' designed to predict future trends were working overtime, processing 'terabytes' of 'information' from across the 'globe'.
      Dr. Aris Thorne, a leading 'futurist', reviewed the latest 'simulations'. "The 'projections' are clear," he announced to his team. "Humanity is at a 'crossroads'."
      The simulations showed two primary 'paths': one leading to a 'utopian' future of 'abundance' and 'harmony', the other to a 'dystopian' reality of 'scarcity' and 'conflict'. The deciding 'factor' was 'choice'.
      "Every 'decision' we make today echoes into tomorrow," Aris emphasized. "We must 'educate' the masses, foster 'critical thinking', and promote 'collaboration'."
      A young 'analyst', Lena, pointed to a specific 'anomaly' in the data. "This 'pattern' suggests an 'unforeseen variable'," she noted. "A 'wildcard' that could alter all 'outcomes'."
      Aris leaned closer. "What is it?"
      "Individual 'consciousness'," Lena replied. "The 'power' of a single mind to 'innovate', to 'resist', to 'dream' beyond the 'programmed' possibilities."
      The 'future' was not fixed. It was a canvas, waiting for the brushstrokes of human 'will' and 'imagination'. The echoes were not just predictions, but invitations.
    `,
  },
  {
    id: 'book4',
    title: 'The Art of Connection',
    author: 'Community Builder',
    category: 'Self-Improvement',
    coverImageUrl: 'https://placehold.co/200x300/C3A9E3/333333?text=Art+Connection',
    content: `
      Chapter 1: Bridging Divides
      In an increasingly 'interconnected' world, the 'art' of 'connection' has become paramount. It's not just about 'communication', but about building genuine 'relationships' and fostering 'understanding'.
      "To truly connect, you must first 'listen'," advised Maya, a renowned 'therapist' and 'community' organizer. "Active 'listening' is the 'foundation' of all meaningful 'interaction'."
      She spoke of 'empathy' as the 'bridge' between individuals. "Try to 'understand' perspectives different from your own," she urged. "It expands your 'worldview' and builds 'trust'."
      The biggest 'challenge' often lies in overcoming 'preconceptions' and 'biases'. "We all carry them," Maya admitted, "but awareness is the first step towards 'growth'."
      Workshops on 'non-violent communication' became popular, teaching people how to express their 'needs' and 'feelings' without 'blame' or 'judgment'. "It's about finding common 'ground'," a participant shared.
      'Digital' platforms, while offering 'convenience', sometimes create a sense of 'isolation'. "Real 'connection' happens face-to-face," Maya reminded. "Share a 'meal', take a 'walk', engage in 'shared activities'."
      The goal was not to 'agree' on everything, but to 'respect' differences and find 'harmony' in diversity. The art of connection was a continuous 'practice', enriching lives one interaction at a time.
    `,
  },
  {
    id: 'book5',
    title: 'Mindful Living in a Digital Age',
    author: 'Zen Master AI',
    category: 'Self-Improvement',
    coverImageUrl: 'https://placehold.co/200x300/C3A9E3/333333?text=Mindful+Living',
    content: `
      Introduction: The Present Moment
      In an age of constant 'notifications' and 'information' overload, finding 'mindfulness' is more crucial than ever. It's about cultivating 'awareness' of the present moment, without 'judgment'.
      "Your 'attention' is your most 'valuable' resource," taught Master Jin, a digital 'philosopher'. "Where your 'attention' goes, your 'energy' flows."
      He advocated for 'digital detoxes', periods away from screens to reconnect with oneself and nature. "Observe your 'thoughts' and 'feelings' without getting 'swept away' by them," he advised.
      One simple 'practice' was the "one-minute 'breath'": focusing solely on the 'sensation' of breathing for sixty seconds. "It's a small 'anchor' in a stormy 'sea' of distractions," Jin explained.
      'Technology' itself wasn't the 'enemy'; it was the 'unconscious' use of it. "Use 'tools' mindfully," he urged. "Let them serve you, not 'enslave' you."
      He introduced the concept of "conscious 'consumption'": being aware of what 'information' you take in, what 'content' you engage with. "Is it 'nourishing' your mind, or 'depleting' it?"
      Mindful living was not about escaping the digital world, but about navigating it with 'intention' and 'peace'. It was a journey of self-discovery, one 'present moment' at a time.
    `,
  },
];

// Utility function to extract vocabulary from book content
const extractVocabularyFromContent = (content: string): Vocabulary[] => {
  const words = content.match(/'([^']+)'/g); // Matches words enclosed in single quotes
  if (!words) return [];

  const extractedVocab: Vocabulary[] = [];
  words.forEach(quotedWord => {
    const word = quotedWord.replace(/'/g, ''); // Remove quotes

    // Find the corresponding vocabulary data from ALL_POSSIBLE_FLASHCARDS
    const foundFlashcard = ALL_POSSIBLE_FLASHCARDS.find(
      flashcard => flashcard.vocabulary.word.toLowerCase() === word.toLowerCase()
    );

    if (foundFlashcard) {
      extractedVocab.push(foundFlashcard.vocabulary);
    } else {
      // If not found in ALL_POSSIBLE_FLASHCARDS, create a basic entry
      extractedVocab.push({
        word: word,
        meaning: `Meaning of ${word}`, // Placeholder meaning
        example: `Example for ${word}.`, // Placeholder example
        phrases: [],
        popularity: "Thấp",
        synonyms: [],
        antonyms: [],
      });
    }
  });
  return extractedVocab;
};


export default function EbookReader({ hideNavBar, showNavBar }: EbookReaderProps) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [bookVocabulary, setBookVocabulary] = useState<Vocabulary[]>([]);

  // State to manage the selected vocabulary card for detail view
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State to manage vocabulary modal visibility
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  // Effect to extract vocabulary when a book is selected or content changes
  useEffect(() => {
    if (selectedBookId) {
      const book = sampleBooks.find(b => b.id === selectedBookId);
      if (book) {
        const vocab = extractVocabularyFromContent(book.content);
        setBookVocabulary(vocab);
      }
    } else {
      setBookVocabulary([]); // Clear vocabulary when no book is selected
    }
  }, [selectedBookId]);

  const currentBook = selectedBookId ? sampleBooks.find(book => book.id === selectedBookId) : null;

  const handleBookSelect = (id: string) => {
    setSelectedBookId(id);
    setCurrentChapterIndex(0); // Reset to first chapter when a new book is selected
    hideNavBar(); // Hide the nav bar when a book is opened
  };

  const handleBackToLibrary = () => {
    setSelectedBookId(null);
    setCurrentChapterIndex(0);
    showNavBar(); // Show the nav bar when returning to library
  };

  // Function to open vocabulary detail modal
  const openVocabDetail = (vocabWord: string) => {
    // Find the full Flashcard object from ALL_POSSIBLE_FLASHCARDS
    const foundFlashcard = ALL_POSSIBLE_FLASHCARDS.find(
      card => card.vocabulary.word.toLowerCase() === vocabWord.toLowerCase()
    );

    if (foundFlashcard) {
      setSelectedVocabCard(foundFlashcard);
      setShowVocabDetail(true);
      hideNavBar(); // Hide the nav bar when modal opens
    } else {
      console.warn(`Flashcard for word "${vocabWord}" not found.`);
      // Fallback: Create a basic flashcard if not found in ALL_POSSIBLE_FLASHCARDS
      setSelectedVocabCard({
        id: 0, // Placeholder ID
        imageUrl: { default: `https://placehold.co/1024x1536/CCCCCC/333333?text=${vocabWord}` },
        isFavorite: false,
        vocabulary: {
          word: vocabWord,
          meaning: `Meaning of ${vocabWord}`,
          example: `Example sentence for ${vocabWord}.`,
          phrases: [],
          popularity: "Thấp",
          synonyms: [],
          antonyms: [],
        }
      });
      setShowVocabDetail(true);
      hideNavBar();
    }
  };


  // Function to close vocabulary detail modal
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null); // Clear selected card when closing
    showNavBar(); // Show the nav bar when modal closes
  };

  const renderLibrary = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {sampleBooks.map(book => (
        <div
          key={book.id}
          className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl flex flex-col"
          onClick={() => handleBookSelect(book.id)}
        >
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/200x300/A9CCE3/333333?text=${book.title.replace(/\s/g, '+')}`;
            }}
          />
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{book.title}</h3>
              {book.author && <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Category: {book.category}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening the book when clicking the button
                handleBookSelect(book.id);
              }}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Read Book
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBookContent = () => {
    if (!currentBook) return null;

    const contentParts = currentBook.content.split('\n').filter(part => part.trim() !== '');

    return (
      <div className="prose dark:prose-invert max-w-none">
        {contentParts.map((part, index) => {
          // Check if the part is a chapter title (e.g., starts with "Chapter" or "Prologue")
          if (part.trim().startsWith('Chapter') || part.trim().startsWith('Prologue')) {
            return (
              <h3 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
                {part.trim()}
              </h3>
            );
          }
          // Highlight vocabulary words
          let displayedPart = part;
          bookVocabulary.forEach(vocab => {
            // Create a regex to find the word, case-insensitive, and ensure it's a whole word
            const regex = new RegExp(`'(${vocab.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})'`, 'gi');
            displayedPart = displayedPart.replace(regex, (match, p1) => {
              return `<span 
                        class="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline" 
                        data-word="${p1}"
                      >${match}</span>`;
            });
          });

          return (
            <p
              key={index}
              className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: displayedPart }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'SPAN' && target.dataset.word) {
                  openVocabDetail(target.dataset.word);
                }
              }}
            />
          );
        })}

        {/* Navigation for chapters (if applicable) or just end of book */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Add more navigation here if books have multiple chapters */}
          <button
            onClick={handleBackToLibrary}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            ← Back to Library
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedBookId ? currentBook?.title : 'Ebook Library'}
        </h1>
        {selectedBookId && (
          <button
            onClick={handleBackToLibrary}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            ← Back to Library
          </button>
        )}
      </header>

      {!selectedBookId ? (
        <main className="flex-grow overflow-y-auto w-full bg-white dark:bg-gray-850"> {/* Slightly different bg for library */}
          {renderLibrary()}
        </main>
      ) : (
        <main className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md my-4 w-full">
          {currentBook && (
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {currentBook.title}
              </h2>
              {currentBook.author && (
                <p className="text-md text-center text-gray-600 dark:text-gray-400">
                  by {currentBook.author}
                </p>
              )}
            </div>
          )}
          {renderBookContent()}
        </main>
      )}

      {selectedVocabCard && showVocabDetail && (
        <FlashcardDetailModal
          selectedCard={selectedVocabCard}
          showVocabDetail={showVocabDetail}
          exampleImages={exampleImages} // Pass the example images
          onClose={closeVocabDetail}
          currentVisualStyle="default" // Ensure "Ảnh Gốc" tab uses the default image
        />
      )}
    </div>
  );
}
