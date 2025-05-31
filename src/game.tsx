import React, { useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import vocabulary list

// Define the structure for a flashcard and its vocabulary
// These interfaces are copied from flashcard.tsx to ensure consistency
interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

interface Flashcard {
  id: number;
  imageUrl: {
    default: string;
    anime?: string;
    comic?: string;
    realistic?: string;
  };
  isFavorite: boolean;
  vocabulary: Vocabulary;
}

// Define book content
const bookContents = {
  'Book 1': `
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
  'Book 2': `
    Chapter 2: The Digital Frontier

    As the new era unfolds, the digital frontier expands, offering both immense opportunities and unforeseen challenges. The lines between the physical and virtual worlds blur, creating a hybrid reality where innovation thrives.

    "The possibilities are endless," remarked Alex, a visionary entrepreneur, during a recent podcast. "We are only just beginning to scratch the surface of what's achievable with advanced computing."

    The concept of "digital citizenship" has emerged, highlighting the responsibilities individuals have in this interconnected landscape. Protecting "personal data" and understanding "online ethics" are paramount.

    Education systems are rapidly transforming to prepare future generations for a world dominated by technology. "Coding" and "data science" are becoming as fundamental as reading and writing.

    "It's not just about learning new tools," a leading educator explained. "It's about fostering a mindset of continuous learning and adaptability."

    New forms of "collaboration" are also emerging, transcending geographical boundaries. Teams from different continents can work together seamlessly on complex projects, thanks to "cloud computing" and "virtual meeting" platforms.

    However, this rapid advancement also brings concerns about "digital divide" and "information overload." Ensuring equitable access to technology and developing strategies to manage vast amounts of information are crucial.

    "We must ensure that no one is left behind," urged a policy maker. "Technology should be an enabler for all, not just a select few."

    The journey into the digital frontier is ongoing, filled with both excitement and introspection, as humanity navigates its path through this brave new world.
  `,
};

const App: React.FC = () => {
  // State to hold the content of the currently selected book
  const [selectedBookContent, setSelectedBookContent] = useState<string | null>(null);
  // State for vocabMap to trigger re-render
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true); // State to track vocabulary loading

  // State to manage selected vocabulary for the popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State to control vocabulary popup visibility
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    // Initialize vocabMap from defaultVocabulary
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Meaning of "${word}" (example).`,
        example: `This is an example sentence using "${word}".`,
        phrases: [`Phrase with ${word} A`, `Phrase with ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Synonym for ${word} 1`, `Synonym for ${word} 2`],
        antonyms: [`Antonym for ${word} 1`, `Antonym for ${word} 2`],
      });
    });
    setVocabMap(tempMap); // Update state, which will trigger re-render
    setIsLoadingVocab(false); // Mark as loaded
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []); // Empty array ensures useEffect runs only once after component mounts

  // Handler for clicking a word in the book content
  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord); // Get from vocabMap state

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      const tempFlashcard: Flashcard = {
        id: Date.now(), // Use a unique ID, e.g., timestamp
        imageUrl: {
          default: `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`,
        },
        isFavorite: false,
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      console.log(`Word "${word}" not found in vocabulary list.`);
    }
  };

  // Handler to close the vocabulary detail modal
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // Renders the book content with clickable vocabulary words
  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-8">Loading vocabulary...</div>; // Or a spinner
    }

    if (!selectedBookContent) {
      return <div className="text-center p-8 text-gray-600 dark:text-gray-400">Select a book to read.</div>;
    }

    const parts = selectedBookContent.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g); // Add various quotation marks to regex

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          if (!part || part.trim() === '') { // Skip empty strings or strings with only whitespace generated by split
            return <span key={index}>{part}</span>;
          }
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart); // Check on vocabMap state

          if (isVocabWord) {
            return (
              <span
                key={index}
                className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                onClick={() => handleWordClick(part)}
              >
                {part}
              </span>
            );
          } else {
            return <span key={index}>{part}</span>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
      </div>

      <div className="flex flex-col md:flex-row flex-grow">
        {/* Book List Sidebar */}
        <div className="w-full md:w-1/4 p-4 bg-gray-200 dark:bg-gray-700 shadow-md md:shadow-none flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Books</h2>
          <ul className="space-y-2">
            {Object.keys(bookContents).map((bookTitle) => (
              <li key={bookTitle}>
                <button
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200
                    ${selectedBookContent === bookContents[bookTitle as keyof typeof bookContents]
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  onClick={() => setSelectedBookContent(bookContents[bookTitle as keyof typeof bookContents])}
                >
                  {bookTitle}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Book Content Area */}
        <div className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md my-4 md:my-0 md:ml-4">
          {renderBookContent()}
        </div>
      </div>

      {/* Flashcard Detail Modal */}
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]} // You might want to pass actual example images here
        onClose={closeVocabDetail}
        currentVisualStyle="default"
      />
    </div>
  );
};

export default App;
