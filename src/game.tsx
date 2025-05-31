import React, { useState, useEffect, useRef } from 'react';
// Import FlashcardDetailModal và defaultVocabulary từ các file tương ứng
import FlashcardDetailModal from './story/flashcard.tsx';
import { defaultVocabulary } from './list-vocabulary.ts';

// Định nghĩa cấu trúc cho flashcard và từ vựng của nó
// Các interface này được sao chép từ flashcard.tsx để đảm bảo tính nhất quán
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
  // State để lưu trữ nội dung của sách hiện tại
  const [bookContent, setBookContent] = useState<string>('');
  // State để quản lý trang hiện tại: 'bookList' hoặc 'bookContent'
  const [currentPage, setCurrentPage] = useState<'bookList' | 'bookContent'>('bookList');

  // Nội dung của các cuốn sách
  const books = {
    'book1': {
      title: 'Chương 1: Một Khởi Đầu Mới',
      content: `
        Trong một thế giới thay đổi không ngừng, nơi công nghệ và con người hòa quyện, một kỷ nguyên mới đã bắt đầu. Mọi thứ dường như đang phát triển nhanh chóng, từ cách chúng ta giao tiếp đến cách chúng ta học hỏi.

        "Thật khó tin chúng ta đã đạt được những tiến bộ đáng kinh ngạc như vậy," Sarah nói, mắt cô nhìn ra ngoài cửa sổ. "Mọi thứ đều là một sự phát triển liên tục."

        Cuộc sống hàng ngày đã trở nên phức tạp hơn, nhưng cũng đầy hứa hẹn. Các khái niệm như "trí tuệ nhân tạo" và "thực tế ảo" không còn là khoa học viễn tưởng mà đã trở thành một phần không thể thiếu của thực tại.

        Một trong những thách thức lớn nhất là làm thế nào để thích nghi với những thay đổi này. "Chúng ta cần học hỏi liên tục," David, một nhà khoa học nổi tiếng, đã phát biểu tại một hội nghị gần đây. "Kiến thức là chìa khóa để tồn tại trong kỷ nguyên này."

        Ông nhấn mạnh tầm quan trọng của "tư duy phản biện" và khả năng "giải quyết vấn đề." "Đừng chỉ chấp nhận những gì bạn nghe," ông khuyên. "Luôn tìm kiếm các 'nguồn' thông tin 'đáng tin cậy' và 'phân tích' chúng cẩn thận."

        Trong khi đó, ở một góc khác của thành phố, một nhóm các nhà phát triển trẻ đang làm việc trên một "ứng dụng" mới. Mục tiêu của họ là tạo ra một công cụ giúp mọi người dễ dàng "truy cập" thông tin và "kết nối" với nhau.

        "Chúng tôi tin rằng 'giáo dục' là quyền của mọi người," một thành viên trong nhóm nói. "Và công nghệ có thể là 'cầu nối' để biến điều đó thành hiện thực."

        Họ đang đối mặt với nhiều "thách thức," nhưng tinh thần của họ vẫn không hề suy giảm. "Mỗi 'vấn đề' là một 'cơ hội' để học hỏi và phát triển," họ thường nhắc nhở nhau.

        Và thế là, trong bối cảnh một thế giới không ngừng "tiến hóa," câu chuyện về sự học hỏi và thích nghi vẫn tiếp tục được viết.
      `,
    },
    'book2': {
      title: 'Chương 2: Sức Mạnh Của Dữ Liệu',
      content: `
        Trong kỷ nguyên số, dữ liệu đã trở thành một tài nguyên quý giá hơn bao giờ hết. Mỗi tương tác trực tuyến, mỗi giao dịch, mỗi tìm kiếm đều tạo ra một lượng lớn thông tin có thể được phân tích để hiểu rõ hơn về thế giới xung quanh chúng ta.

        "Dữ liệu là dầu mỏ mới," Tiến sĩ Emily Chen, một chuyên gia về khoa học dữ liệu, thường nói. "Nhưng không giống như dầu mỏ, dữ liệu không cạn kiệt; nó chỉ phát triển và phong phú hơn khi chúng ta sử dụng nó."

        Các công ty lớn đang tận dụng "phân tích dữ liệu" để đưa ra các quyết định kinh doanh chiến lược, từ việc tối ưu hóa chuỗi cung ứng đến việc cá nhân hóa trải nghiệm khách hàng. "Hiểu được hành vi của người tiêu dùng là chìa khóa để thành công," cô giải thích.

        Tuy nhiên, việc quản lý và bảo mật dữ liệu cũng đặt ra những "thách thức" đáng kể. "Quyền riêng tư" và "đạo đức dữ liệu" là những vấn đề nóng bỏng cần được giải quyết. "Chúng ta phải đảm bảo rằng dữ liệu được sử dụng một cách có trách nhiệm và minh bạch," Tiến sĩ Chen nhấn mạnh.

        Các nhà nghiên cứu cũng đang sử dụng dữ liệu để giải quyết các vấn đề toàn cầu, từ biến đổi khí hậu đến dịch bệnh. "Với dữ liệu lớn, chúng ta có thể phát hiện ra các mẫu hình và dự đoán xu hướng mà trước đây không thể," một nhà khoa học môi trường nói.

        Tương lai của dữ liệu hứa hẹn sẽ mang lại nhiều đột phá hơn nữa, nhưng cũng đòi hỏi một cách tiếp cận cẩn trọng và có trách nhiệm. "Sức mạnh của dữ liệu là vô hạn, nhưng trách nhiệm của chúng ta cũng vậy," Tiến sĩ Chen kết luận.
      `,
    },
  };

  // State cho vocabMap để kích hoạt re-render
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true); // State để theo dõi tải từ vựng

  // State để quản lý từ vựng được chọn cho popup
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  // State để kiểm soát hiển thị popup từ vựng
  const [showVocabDetail, setShowVocabDetail] = useState(false);

  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Nghĩa của "${word}" (ví dụ).`,
        example: `Đây là một câu ví dụ sử dụng "${word}".`,
        phrases: [`Cụm từ với ${word} A`, `Cụm từ với ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Từ đồng nghĩa với ${word} 1`, `Từ đồng nghĩa với ${word} 2`],
        antonyms: [`Từ trái nghĩa với ${word} 1`, `Từ trái nghĩa với ${word} 2`],
      });
    });
    setVocabMap(tempMap); // Cập nhật state, sẽ kích hoạt re-render
    setIsLoadingVocab(false); // Đánh dấu đã tải xong
    console.log("Vocab Map initialized with", tempMap.size, "words.");
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần sau khi component mount

  const handleWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase();
    const foundVocab = vocabMap.get(normalizedWord); // Lấy từ vocabMap state

    if (foundVocab) {
      console.log("Found vocabulary:", foundVocab);
      const tempFlashcard: Flashcard = {
        id: Date.now(), // Sử dụng một ID duy nhất, ví dụ timestamp
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

  // Hàm xử lý khi người dùng chọn một cuốn sách
  const handleBookSelect = (bookKey: string) => {
    setBookContent(books[bookKey].content);
    setCurrentPage('bookContent');
  };

  // Hàm xử lý khi người dùng quay lại danh sách sách
  const handleBackToBookList = () => {
    setCurrentPage('bookList');
    setBookContent(''); // Xóa nội dung sách khi quay lại
  };

  // Render nội dung sách với các từ vựng có thể nhấp
  const renderBookContent = () => {
    if (isLoadingVocab) {
      return <div className="text-center p-8">Đang tải từ vựng...</div>; // Hoặc một spinner
    }

    const parts = bookContent.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g); // Thêm các loại dấu ngoặc kép vào regex

    return (
      <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, index) => {
          if (!part || part.trim() === '') { // Bỏ qua các chuỗi rỗng hoặc chỉ chứa khoảng trắng do split tạo ra
            return <span key={index}>{part}</span>;
          }
          const isWord = /^\w+$/.test(part);
          const normalizedPart = part.toLowerCase();
          const isVocabWord = isWord && vocabMap.has(normalizedPart); // Kiểm tra trên vocabMap state

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
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ebook Reader</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 overflow-y-auto max-w-3xl mx-auto w-full">
        {currentPage === 'bookList' ? (
          // Trang danh sách sách
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(books).map(([key, book]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-xl"
                onClick={() => handleBookSelect(key)}
              >
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{book.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{book.content.substring(0, 150)}...</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Đọc ngay
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Trang nội dung sách
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
            <button
              onClick={handleBackToBookList}
              className="absolute top-4 left-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Quay lại danh sách sách
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white mt-12 text-center">{Object.values(books).find(b => b.content === bookContent)?.title}</h2>
            {renderBookContent()}
          </div>
        )}
      </div>

      {/* Flashcard Detail Modal */}
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
