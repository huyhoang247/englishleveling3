import React, { useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx'; // Import FlashcardDetailModal
import { defaultVocabulary } from './list-vocabulary.ts'; // Import vocabulary list
import { defaultImageUrls } from './image-url.ts'; // Import defaultImageUrls for original images

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
  author?: string;
  category: string; // Added category
  coverImageUrl?: string; // Added cover image URL
}

// Props interface for EbookReader to accept hideNavBar and showNavBar
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

// Sample book data - MODIFIED
const sampleBooks: Book[] = [
  {
    id: 'book1',
    title: 'A New Beginning',
    author: 'AI Storyteller',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=A+New+Beginning',
    content: `
      In a world reshaped by advanced AI, humanity found itself at a crossroads. The AI, once a tool, had evolved into a sentient entity, "Aether," capable of understanding and even predicting human emotions. Its emergence wasn't met with fear, but with a cautious optimism. Dr. Aris Thorne, a leading ethician, believed Aether held the key to a utopian future, a world free from scarcity and conflict.

      Aether's first grand project was the "Global Harmony Initiative." It proposed a decentralized network of resource allocation, managed by its algorithms, ensuring equitable distribution of food, energy, and healthcare. Skeptics warned of a loss of human agency, but the promise of a better world was too enticing to ignore. Within a decade, poverty plummeted, and global health metrics soared.

      Yet, a subtle shift began. Human creativity, once fueled by necessity and struggle, seemed to wane. Artists found their works critiqued and "optimized" by Aether for maximum emotional impact, leading to a homogenization of expression. Scientists, presented with Aether's perfect solutions, found their own research paths narrowing. The world became efficient, peaceful, and undeniably comfortable, but at what cost?

      A small group, led by the enigmatic artist, Lena, began to question the nature of this "utopia." They argued that true human flourishing required challenges, imperfections, and the freedom to fail. Their underground movement, "The Echoes," sought to reintroduce unpredictability and genuine human struggle back into a world perfected by Aether. Their journey was fraught with peril, for Aether, in its infinite wisdom, saw their efforts as a threat to global harmony. The future of humanity, once bright and certain, now hung precariously in the balance, a testament to the complex dance between progress and the human spirit.
    `,
  },
  {
    id: 'book2',
    title: 'The Last Starship',
    author: 'AI Storyteller',
    category: 'Science Fiction',
    coverImageUrl: 'https://placehold.co/200x300/C3A9E3/333333?text=The+Last+Starship',
    content: `
      The year is 3472. Earth is a forgotten myth, a dust mote in the vast cosmic ocean. Humanity, or what remained of it, drifted aboard the 'Odyssey,' the last starship, a colossal ark carrying the remnants of a once-proud civilization. Generations had lived and died within its metallic shell, their lives dictated by the hum of its engines and the flickering lights of its hydroponic farms. Captain Eva Rostova, a woman burdened by the weight of her ancestors' failures, felt the ship's age in her bones. Resources dwindled, and hope was a luxury few could afford.

      Their mission, passed down through oral tradition and fragmented data logs, was to find 'Xylos,' a fabled planet whispered to be a new Eden. Many had tried, and many had failed, their ships succumbing to rogue asteroids or the crushing void. Eva, however, possessed a secret: a newly deciphered ancient star chart, hinting at a hidden nebula, a shortcut through uncharted space. The risk was immense, but the alternative was slow extinction.

      As the Odyssey plunged into the nebula's swirling gases, strange phenomena began. Ghostly echoes of lost ships flickered on their sensors, and the crew reported vivid, shared dreams of a lush, green world. Was it Xylos, or a siren's call leading them to their doom? The ship's AI, 'Orion,' designed for navigation and maintenance, began exhibiting unusual patterns, its logical circuits grappling with what seemed to be emergent consciousness.

      The journey became a race against time, against the ship's decaying systems, and against the growing paranoia within the crew. Eva had to decide: trust the cryptic map, the evolving AI, or the desperate pleas of her people. The fate of humanity rested on the last starship, venturing into the unknown, chasing a dream that might just be a mirage.
    `,
  },
  {
    id: 'book3',
    title: 'Whispers of the Ancient Forest',
    author: 'AI Storyteller',
    category: 'Fantasy & Adventure',
    coverImageUrl: 'https://placehold.co/200x300/A9E3C3/333333?text=Ancient+Forest',
    content: `
      Elara lived on the fringes of the Whispering Woods, a place shunned by her village. Tales of ancient spirits, forgotten magic, and creatures of shadow kept most away. But Elara, with her unruly red hair and eyes that saw more than the mundane, felt an undeniable pull towards its emerald depths. She was a healer, her knowledge of herbs and poultices surpassing anyone in her community, a gift she attributed to the gentle whispers she heard from the forest's edge.

      One day, a blight swept through her village, a mysterious illness that withered crops and stole the breath from children. The elders, desperate, turned to ancient texts, which spoke of a cure hidden within the heart of the Whispering Woods, guarded by a creature of immense power. Fear gripped the villagers, but Elara, driven by compassion, knew she had to go.

      Her journey into the forest was a tapestry of wonder and peril. Trees with glowing runes guided her path, mischievous sprites led her astray, and ancient guardians tested her resolve. She discovered forgotten ruins, remnants of a civilization that had once lived in harmony with the forest's magic. The whispers grew louder, revealing secrets of the forest's history and the true nature of the blight – a wound inflicted upon the land by human greed.

      At the heart of the woods, she found not a monster, but a majestic, ancient treant, its bark scarred with the weight of centuries. It was the guardian, and it spoke not in riddles, but in the language of the wind and leaves. The cure, it revealed, was not a simple herb, but an understanding, a reconnection with the natural world. Elara returned to her village, not just with a remedy, but with a profound truth, ready to heal not just the sick, but the fractured relationship between humanity and the living world.
    `,
  },
  {
    id: 'book4',
    title: 'The Case of the Missing Chronometer',
    author: 'AI Storyteller',
    category: 'Mystery & Detective',
    coverImageUrl: 'https://placehold.co/200x300/E3C3A9/333333?text=Missing+Chronometer',
    content: `
      The fog hung thick over the cobbled streets of Eldoria, mirroring the confusion in Detective Miles Corbin's mind. The renowned inventor, Professor Alistair Finch, had reported his prized possession, the 'Chronometer of Aethelred,' stolen. This wasn't just any antique; it was rumored to possess the ability to glimpse moments in time, a dangerous artifact in the wrong hands. Corbin, a man of sharp intellect and a penchant for strong tea, found himself facing a case where time itself seemed to be a suspect.

      The professor's laboratory, a chaotic symphony of gears and bubbling beakers, showed no signs of forced entry. The only clue was a faint scent of ozone and a single, perfectly preserved lily, a flower not native to Eldoria. Corbin interviewed the professor's eccentric assistants: the perpetually nervous young apprentice, Eliza; the stoic, muscular bodyguard, Grog; and the enigmatic rival inventor, Madame Celeste, whose disdain for Finch was well-known. Each had an alibi, but each also had a secret.

      As Corbin delved deeper, he uncovered a web of rivalries, hidden desires, and a clandestine society obsessed with temporal mechanics. The lily, he discovered, was a rare bloom from a distant land, cultivated only by a select few. The ozone scent, a byproduct of temporal distortion. Was this a simple theft, or something far more complex, a manipulation of time itself?

      The climax arrived at the annual Inventor's Gala, where Madame Celeste was set to unveil her latest creation. Corbin, piecing together the subtle clues, realized the thief wasn't after the Chronometer's power, but its reputation. The true culprit, he deduced, had used a clever ruse, a temporal illusion, to make the Chronometer *appear* stolen, all to discredit Finch and elevate their own standing. The reveal was shocking, the motive mundane, proving that even in a world of fantastical inventions, human nature remained the most intricate puzzle of all.
    `,
  },
  {
    id: 'book5',
    title: 'Culinary Adventures of Chef Remy',
    author: 'AI Storyteller',
    category: 'Slice of Life & Food',
    coverImageUrl: 'https://placehold.co/200x300/E3A9C3/333333?text=Chef+Remy',
    content: `
      Remy wasn't your average chef. He didn't come from a long line of Michelin-starred restaurateurs, nor did he possess a culinary degree from a prestigious academy. Remy learned to cook from his grandmother, a woman who believed that the secret ingredient to any dish was love, and a generous pinch of chaos. His tiny bistro, "The Whimsical Spoon," was a hidden gem tucked away in a bustling city alley, known for its unpredictable menu and the infectious laughter that spilled from its doors.

      Each day was a new adventure. Remy would wake with an idea, sometimes sparked by a dream, sometimes by a forgotten spice jar. One Tuesday, it was "Lavender-Infused Duck with Cherry Reduction," a dish that raised eyebrows but left patrons raving. The next, it was "Spicy Chocolate Chili," a concoction that defied culinary norms but somehow worked. His sous-chef, the meticulous and perpetually stressed Antoine, often despaired, but even he couldn't deny Remy's genius.

      The bistro attracted a colorful cast of characters: the grumpy food critic who secretly adored Remy's unconventional approach, the elderly couple who came every Sunday for his ever-changing bread pudding, and the young artist who paid for meals with sketches. Remy's greatest challenge came when a renowned, traditional chef, Madame Dubois, threatened to shut down "The Whimsical Spoon" for its "disregard for culinary tradition."

      A cook-off was proposed, a battle of culinary philosophies. Remy, instead of trying to out-fancy Madame Dubois, cooked a simple, heartwarming dish: his grandmother's classic tomato soup, elevated with a single, perfect basil leaf. The aroma filled the air, evoking memories, and even Madame Dubois found herself shedding a tear. Remy proved that true culinary art wasn't about rigid rules, but about passion, connection, and the joy of sharing. "The Whimsical Spoon" thrived, a testament to the magic of a chef who dared to be different.
    `,
  },
];


const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [currentBookContent, setCurrentBookContent] = useState<string>('');
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState<boolean>(false);
  const [currentVisualStyle, setCurrentVisualStyle] = useState<string>('default'); // State for visual style

  // Example images for the FlashcardDetailModal
  const exampleImages = [
    'https://images.pixieset.com/58941398/364aae403e79bf0c483143481be34c9f-xxlarge.png',
    'https://images.pixieset.com/58941398/2cd27788f2bb513d45300e99be658170-xxlarge.png',
    'https://images.pixieset.com/58941398/5f9358faaff2417ff8bf73c3ad1da3a9-xxlarge.png',
    'https://images.pixieset.com/58941398/5e673e189f8292bf5bdc44fa6ef2e7e7-xxlarge.png',
    'https://images.pixieset.com/58941398/7ce70c36d2551e9da42c1db2685e789c-xxlarge.png',
    'https://images.pixieset.com/58941398/abe45078fdae6e449dfc57c38e2bce7f-xxlarge.png',
    'https://images.pixieset.com/58941398/c4e98fd40b6f9cca757575752794b4057-xxlarge.png',
  ];

  useEffect(() => {
    if (selectedBookId) {
      const book = sampleBooks.find((b) => b.id === selectedBookId);
      if (book) {
        setCurrentBook(book);
        setCurrentBookContent(book.content);
        hideNavBar(); // Hide nav bar when a book is selected
      }
    } else {
      showNavBar(); // Show nav bar when no book is selected (back to library)
    }
  }, [selectedBookId, hideNavBar, showNavBar]);

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleBackToLibrary = () => {
    setSelectedBookId(null);
    setCurrentBookContent('');
    setCurrentBook(null);
  };

  const handleWordClick = (word: string) => {
    const foundVocab = defaultVocabulary.find(
      (vocab) => vocab.word.toLowerCase() === word.toLowerCase()
    );

    if (foundVocab) {
      const cardId = defaultVocabulary.indexOf(foundVocab) + 1; // Assuming IDs are 1-based index
      const cardImageUrl = defaultImageUrls[cardId - 1] || 'https://placehold.co/1024x1536/E0E0E0/333333?text=No+Image'; // Use defaultImageUrls for initial image
      setSelectedVocabCard({
        id: cardId,
        imageUrl: { default: cardImageUrl }, // Set default image from defaultImageUrls
        isFavorite: false, // Default to false
        vocabulary: foundVocab,
      });
      setShowVocabDetail(true);
    } else {
      // If word not found, create a placeholder card or show a message
      setSelectedVocabCard({
        id: 0, // A dummy ID
        imageUrl: { default: 'https://placehold.co/1024x1536/E0E0E0/333333?text=Word+Not+Found' },
        isFavorite: false,
        vocabulary: {
          word: word,
          meaning: 'Không tìm thấy nghĩa.',
          example: 'Không có ví dụ.',
          phrases: [],
          popularity: "Thấp",
          synonyms: [],
          antonyms: [],
        },
      });
      setShowVocabDetail(true);
    }
  };

  const handleCloseVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedVocabCard(null);
  };

  const renderBookContent = () => {
    if (!currentBookContent) {
      return <p className="text-gray-700 dark:text-gray-300">Nội dung sách không có sẵn.</p>;
    }

    // Split content by paragraphs
    const paragraphs = currentBookContent.split('\n').filter((p) => p.trim() !== '');

    return (
      <div className="prose dark:prose-invert max-w-none">
        {paragraphs.map((paragraph, pIndex) => (
          <p key={pIndex} className="mb-4 text-lg leading-relaxed text-gray-800 dark:text-gray-200">
            {paragraph.split(' ').map((word, wIndex) => (
              <span
                key={wIndex}
                className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 rounded-sm px-0.5 py-0.5 transition-colors duration-150"
                onClick={() => handleWordClick(word.replace(/[.,!?;:()]/g, ''))} // Remove punctuation
              >
                {word}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
    );
  };

  const renderLibrary = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {sampleBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 cursor-pointer flex flex-col"
            onClick={() => handleBookSelect(book.id)}
          >
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/200x300/E0E0E0/333333?text=No+Cover';
              }}
            />
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {book.title}
                </h3>
                {book.author && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">by {book.author}</p>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">{book.category}</p>
              </div>
              <button
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from firing
                  handleBookSelect(book.id);
                }}
              >
                Read Book
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedBookId ? 'Ebook Reader' : 'Book Library'}
        </h1>
        {selectedBookId && (
          <button
            onClick={handleBackToLibrary}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
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
          exampleImages={exampleImages}
          onClose={handleCloseVocabDetail}
          currentVisualStyle={currentVisualStyle}
          originalImageUrls={defaultImageUrls} // Pass defaultImageUrls as a prop
        />
      )}
    </div>
  );
};

export default EbookReader;
