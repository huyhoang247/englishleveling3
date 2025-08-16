import React, { useState, useEffect, useMemo } from 'react';
import { defaultVocabulary } from './voca-data/list-vocabulary.ts';

// ====================================================================
// 1. CSS (KHÔNG THAY ĐỔI)
// ====================================================================
const componentStyles = `
  /* ... Giữ nguyên toàn bộ CSS của bạn ... */
  .word-explorer-container {
    width: 90%;
    max-width: 1200px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: 'Poppins', sans-serif;
  }
  .explorer-header {
    text-align: center;
    margin-bottom: 2.5rem;
    color: #e0e0e0;
  }
  .explorer-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #ffffff;
    font-weight: 600;
  }
  .explorer-header p {
    font-size: 1.1rem;
    color: #b0b0b0;
  }
  .search-input {
    width: 100%;
    max-width: 500px;
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
    border-radius: 50px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: #fff;
    margin-top: 1.5rem;
    transition: all 0.3s ease;
    outline: none;
  }
  .search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
  .words-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  .word-card {
    background-color: #1e1e1e;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #333;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: default;
    display: flex;
    flex-direction: column;
  }
  .word-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  .long-word {
    font-size: 1.5rem;
    font-weight: 500;
    color: #00aaff;
    margin-top: 0;
    margin-bottom: 1rem;
    text-transform: capitalize;
  }
  .short-words-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto; /* Đẩy các pill xuống dưới */
  }
  .short-word-pill {
    background-color: #333;
    color: #ccc;
    padding: 0.3rem 0.7rem;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .status-message { /* Dùng cho loading và no-results */
    grid-column: 1 / -1;
    text-align: center;
    font-size: 1.2rem;
    color: #888;
    margin-top: 3rem;
  }
  .pagination-controls {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    color: #ccc;
  }
  .pagination-controls button {
    background-color: #333;
    color: #fff;
    border: 1px solid #555;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .pagination-controls button:hover:not(:disabled) {
    background-color: #007bff;
    border-color: #007bff;
  }
  .pagination-controls button:disabled {
    background-color: #2a2a2a;
    color: #666;
    cursor: not-allowed;
  }
`;

// ====================================================================
// 2. HELPER FUNCTIONS VÀ COMPONENTS
// ====================================================================

// Hàm xử lý từ vựng, không thay đổi logic nhưng cần lưu ý hiệu năng
// Với 3000 từ, đây là điểm nghẽn.
// Trong thực tế, có thể tối ưu bằng cấu trúc dữ liệu Trie hoặc xử lý ở Web Worker.
const processVocabulary = (vocabulary) => {
    console.time('processVocabulary');
    const uniqueWords = [...new Set(vocabulary.map(w => w.toLowerCase().trim()))];
    const results = [];
    for (const longWord of uniqueWords) {
        const foundShortWords = new Set();
        for (const shortWord of uniqueWords) {
            if (shortWord.length >= 3 && longWord.length > shortWord.length && longWord.includes(shortWord)) {
                foundShortWords.add(shortWord);
            }
        }
        if (foundShortWords.size > 0) {
            results.push({
                longWord: longWord,
                shortWords: [...foundShortWords].sort(),
            });
        }
    }
    const sortedResults = results.sort((a, b) => a.longWord.localeCompare(b.longWord));
    console.timeEnd('processVocabulary');
    return sortedResults;
};

const StyleInjector = ({ css }) => <style>{css}</style>;

// Component điều khiển phân trang
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trang trước
      </button>
      <span>Trang {currentPage} / {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Trang sau
      </button>
    </div>
  );
};


// ====================================================================
// 3. COMPONENT CHÍNH ĐÃ ĐƯỢC REFACTOR
// ====================================================================
const ITEMS_PER_PAGE = 24; // Số lượng card hiển thị mỗi trang

const WordExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allProcessedWords, setAllProcessedWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // BƯỚC 1: Xử lý dữ liệu nặng trong useEffect để không block UI
  useEffect(() => {
    // Để mô phỏng dữ liệu lớn, bạn có thể nhân bản defaultVocabulary
    // const largeVocabulary = Array(100).fill(...defaultVocabulary).flat();
    const results = processVocabulary(defaultVocabulary);
    setAllProcessedWords(results);
    setIsLoading(false);
  }, []); // Chỉ chạy 1 lần khi component mount

  // BƯỚC 2: Lọc dữ liệu dựa trên searchTerm. Dùng useMemo để tối ưu hóa
  const filteredWords = useMemo(() => {
    if (!searchTerm) {
      return allProcessedWords;
    }
    return allProcessedWords.filter(item =>
      item.longWord.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allProcessedWords]);

  // BƯỚC 3: Tính toán các mục cho trang hiện tại
  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredWords.slice(startIndex, endIndex);

  // Xử lý khi tìm kiếm làm thay đổi số trang
  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 mỗi khi tìm kiếm
  }, [searchTerm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="status-message">Đang xử lý dữ liệu từ vựng...</p>;
    }
    if (filteredWords.length === 0) {
      return <p className="status-message">Không tìm thấy kết quả phù hợp.</p>;
    }
    return (
      <>
        {currentItems.map(({ longWord, shortWords }) => (
          <div className="word-card" key={longWord}>
            <h3 className="long-word">{longWord}</h3>
            <div className="short-words-container">
              {shortWords.map(short => (
                <span className="short-word-pill" key={`${longWord}-${short}`}>
                  {short}
                </span>
              ))}
            </div>
          </div>
        ))}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <>
      <StyleInjector css={componentStyles} />
      <div className="word-explorer-container">
        <header className="explorer-header">
          <h1>Word Explorer</h1>
          <p>Khám phá các từ được cấu thành từ những từ khác trong danh sách.</p>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm từ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading} // Vô hiệu hóa input khi đang tải
          />
        </header>

        <div className="words-grid">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default WordExplorer;
