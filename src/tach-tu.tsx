import React, { useState, useMemo } from 'react';
import { defaultVocabulary } from './list-vocavulary.ts';

// ====================================================================
// 1. VIẾT TOÀN BỘ CSS DƯỚI DẠNG MỘT CHUỖI (TEMPLATE LITERAL)
// ====================================================================
const componentStyles = `
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
  }
  .short-word-pill {
    background-color: #333;
    color: #ccc;
    padding: 0.3rem 0.7rem;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 1.2rem;
    color: #888;
    margin-top: 2rem;
  }
`;

// ====================================================================
// 2. TẠO HELPER FUNCTION VÀ COMPONENT
// ====================================================================

// Hàm xử lý từ vựng, đặt bên ngoài để component chính gọn hơn
const processVocabulary = (vocabulary) => {
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
    return results.sort((a, b) => a.longWord.localeCompare(b.longWord));
};

// Component nhỏ để chèn CSS vào trang
const StyleInjector = ({ css }) => <style>{css}</style>;


// ====================================================================
// 3. COMPONENT CHÍNH
// ====================================================================
const WordExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dùng useMemo để xử lý danh sách từ vựng chỉ một lần
  const processedWords = useMemo(() => processVocabulary(defaultVocabulary), []);

  const filteredWords = processedWords.filter(item =>
    item.longWord.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Sử dụng Fragment <>...</> để bọc Style và nội dung chính
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
          />
        </header>

        <div className="words-grid">
          {filteredWords.length > 0 ? (
            filteredWords.map(({ longWord, shortWords }) => (
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
            ))
          ) : (
            <p className="no-results">Không tìm thấy kết quả phù hợp.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default WordExplorer;
