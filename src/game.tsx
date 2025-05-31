import React, { useState, useEffect, useRef } from 'react';
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

const EbookReader: React.FC = () => {
  // State to hold the book content (now in English)
  const [bookContent, setBookContent] = useState<string>(`
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
  `);

  // Vocabulary list converted to a Map for faster lookup
  const vocabMap = useRef(new Map<string, Vocabulary>());

  // State to manage selected vocabulary for the popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State to control vocabulary popup visibility
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    // Initialize vocabMap when component mounts
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      // Create dummy data for other Vocabulary fields with English descriptions
      // In a real application, you would fetch this detailed data from a backend
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Meaning of "${word}" (example).`,
        example: `This is an example sentence using "${word}".`,
        phrases: [`Phrase with ${word} A`, `Phrase with ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")), // Still using Vietnamese for popularity levels
        synonyms: [`Synonym for ${word} 1`, `Synonym for ${word} 2`],
        antonyms: [`Antonym for ${word} 1`, `Antonym for ${word} 2`],
      });
    });
    vocabMap.current = tempMap;
    console.log("Vocab Map initialized with", vocabMap.current.size, "words.");
  }, []);

  // Handle word click in the book content
  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.current.get(normalizedWord);

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      // Create a temporary Flashcard object to pass to the modal
      const tempFlashcard: Flashcard = {
        id: 0, // Dummy ID, not used for actual flashcard logic here
        imageUrl: {
          default: `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`,
        },
        isFavorite: false, // Default to false
        vocabulary: foundVocab,
      };
      setSelectedVocabCard(tempFlashcard);
      setShowVocabDetail(true);
    } else {
      console.log(`Word "${word}" not found in vocabulary list.`);
      // Optionally, show a "Word not found" message
    }
  };

  // Close vocabulary modal
  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // Function to render the book content with clickable words
  const renderBookContent = () => {
    // Split the text by word boundaries and also keep punctuation/spaces
    // This regex matches either a sequence of word characters (\b\w+\b) or any non-word character including spaces
    const parts = bookContent.split(/(\b\w+\b|[.,!?;:()"\s])/g);

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          // Trim the part to remove any leading/trailing whitespace that might interfere
          const trimmedPart = part.trim();
          // Check if the trimmed part is a word (contains only word characters)
          const isWord = /^\w+$/.test(trimmedPart);
          const normalizedPart = trimmedPart.toLowerCase();
          // Check if the word exists in our vocabulary map
          const isVocabWord = isWord && vocabMap.current.has(normalizedPart);

          // --- Debugging logs ---
          console.log(`Original Part: "${part}", Trimmed Part: "${trimmedPart}", Is Word: ${isWord}, Normalized: "${normalizedPart}", Is Vocab Word: ${isVocabWord}`);
          // --- End Debugging logs ---

          if (isVocabWord) {
            // If it's a vocabulary word, make it bold, blue, and clickable
            return (
              <span
                key={index}
                className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                onClick={() => handleWordClick(part)} // Use original 'part' for display
              >
                {part}
              </span>
            );
          } else {
            // Otherwise, render it as normal text
            return <span key={index}>{part}</span>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
      </div>

      {/* Book Content Area */}
      <div className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md my-4">
        {renderBookContent()}
      </div>

      {/* Render FlashcardDetailModal */}
      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]} // No example images needed for lookup context
        onClose={closeVocabDetail}
        currentVisualStyle="default" // Can be customized if desired
      />
    </div>
  );
};

export default EbookReader;
