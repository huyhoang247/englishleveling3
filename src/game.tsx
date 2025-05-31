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

// Define the structure for a Book
interface Book {
  id: string;
  title: string;
  content: string;
  author?: string; // Optional author
}

// Sample book data
const sampleBooks: Book[] = [
  {
    id: 'book1',
    title: 'A New Beginning',
    author: 'AI Storyteller',
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
    content: `
      Prologue: The Whispers

      The 'network' hummed with a quiet 'energy', a constant flow of 'information' painting a picture of a world on the brink of another 'transformation'. Old 'paradigms' were shattering, making way for new 'ideas'.

      "The future is not a fixed 'destination'," a historian 'AI' once lectured. "It's a 'spectrum' of possibilities, shaped by our 'choices' today."

      Young Elara, a 'student' of 'cybernetics', felt this more keenly than most. She believed that 'technology' held the 'key' to solving many of the world's pressing 'issues', from 'climate change' to 'social inequality'.

      "We need 'innovative' solutions," she often told her peers. "And that requires us to 'think' differently, to challenge the 'status quo'."

      Her current 'research' focused on 'decentralized' systems, aiming to create more 'resilient' and 'equitable' infrastructures. It was a daunting 'task', filled with 'technical' hurdles and 'ethical' dilemmas.

      "Every 'line of code' we write, every 'system' we design, has an 'impact'," her mentor, Dr. Aris, reminded her. "We must be 'responsible' for our 'creations'."

      Elara knew the path ahead was long and arduous, but the 'potential' for positive 'change' fueled her 'determination'. The echoes of the future were calling, and she was ready to answer.
    `,
  }
];

const EbookReader: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(
    sampleBooks.length > 0 ? sampleBooks[0].id : null
  );

  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);

  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
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
    setVocabMap(tempMap);
    setIsLoadingVocab(false);
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []);

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord);

    if (foundVocab) {
      const tempFlashcard: Flashcard = {
        id: Date.now(),
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

  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  // No longer needed:
  // const handleBookChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedBookId(event.target.value);
  // };

  const currentBook = books.find(book => book.id === selectedBookId);

  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-8">Loading vocabulary...</div>;
    }
    if (!currentBook) {
      return <div className="text-center p-8 text-gray-500">Select a book to start reading.</div>;
    }

    const parts = currentBook.content.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g);

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          if (!part || part.trim() === '') {
            // Keep whitespace and empty strings for accurate rendering
            return <span key={index}>{part}</span>;
          }
          // Regex to check if part is a word (alphanumeric)
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart);

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
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-0">Ebook Reader</h1>
        {books.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              Books:
            </span>
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                            ${selectedBookId === book.id
                              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400'
                            }`}
              >
                {book.title}
              </button>
            ))}
          </div>
        )}
      </header>

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

      <FlashcardDetailModal
        selectedCard={selectedVocabCard}
        showVocabDetail={showVocabDetail}
        exampleImages={[]}
        onClose={closeVocabDetail}
        currentVisualStyle="default"
      />
    </div>
  );
};

export default EbookReader;
