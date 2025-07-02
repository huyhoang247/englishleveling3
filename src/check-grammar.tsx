import React, { useState, useEffect } from 'react';

// --- ĐỊNH NGHĨA CSS (INLINE STYLES) ---
const styles = {
  // ... (giữ nguyên các style như file trước)
  container: {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
  },
  h1: {
    textAlign: 'center',
    color: '#333',
  },
  p: {
    color: '#555',
    lineHeight: 1.6,
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    marginBottom: '1rem',
    resize: 'vertical',
    minHeight: '100px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  languageSelector: {
    marginBottom: '1rem',
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  resultsContainer: {
    marginTop: '2rem',
  },
  errorMessage: {
    color: '#d9534f',
    backgroundColor: '#f2dede',
    border: '1px solid #ebccd1',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  noErrors: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  resultsListH3: {
    borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  resultItem: {
    border: '1px solid #e0e0e0',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '1rem',
    backgroundColor: 'white',
  },
  resultMessage: {
    fontWeight: 500,
    color: '#c0392b',
    margin: '0 0 10px 0',
  },
  contextText: {
    margin: '0 0 10px 0',
  },
  errorText: {
    backgroundColor: '#fbeaa6',
    textDecoration: 'underline',
    textDecorationColor: '#d9534f',
    textDecorationStyle: 'wavy',
    padding: '2px 0',
  },
  suggestion: {
    color: '#27ae60',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  rule: {
    fontSize: '0.8em',
    color: '#777',
    textAlign: 'right',
    marginTop: '1rem',
    fontStyle: 'italic',
  },
};


// --- COMPONENT CHÍNH ---
function App() {
  const [text, setText] = useState('I need go school'); // Đặt sẵn ví dụ sai để test
  const [language, setLanguage] = useState('en-US'); // Thêm state cho ngôn ngữ
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  /**
   * Hàm gọi API của LanguageTool để kiểm tra ngữ pháp
   */
  const checkGrammar = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setApiError(null);
    setResults([]);
    setHasChecked(true);

    try {
      const apiUrl = 'https://api.languagetoolplus.com/v2/check';
      const data = new URLSearchParams();
      data.append('text', text);
      data.append('language', language); // Sử dụng state language
      data.append('level', 'picky');     // <<< SỬA ĐỔI QUAN TRỌNG NHẤT LÀ ĐÂY!

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error(`Lỗi từ API: ${response.statusText}`);
      }

      const responseData = await response.json();
      setResults(responseData.matches);

    } catch (err) {
      setApiError('Đã có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Tự động check khi component được tải lần đầu (để thấy ví dụ)
  useEffect(() => {
    checkGrammar();
  }, []); // Chỉ chạy 1 lần

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      checkGrammar();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>Kiểm tra Ngữ pháp & Chính tả Tiếng Anh</h1>
      <p style={styles.p}>Công cụ đã được nâng cấp để phát hiện lỗi tốt hơn. Hãy thử lại câu của bạn!</p>
      
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)} 
        style={styles.languageSelector}
      >
        <option value="en-US">Tiếng Anh (Mỹ)</option>
        <option value="en-GB">Tiếng Anh (Anh)</option>
        <option value="en-CA">Tiếng Anh (Canada)</option>
        <option value="en-AU">Tiếng Anh (Úc)</option>
      </select>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ví dụ: She love apples..."
        style={styles.textarea}
        disabled={isLoading}
      />
      
      <button 
        onClick={checkGrammar} 
        style={isLoading || !text.trim() ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra'}
      </button>

      <div style={styles.resultsContainer}>
        {apiError && <div style={styles.errorMessage}>{apiError}</div>}

        {results.length > 0 && (
          <div>
            <h3 style={styles.resultsListH3}>Gợi ý:</h3>
            {results.map((match, index) => (
              <div key={index} style={styles.resultItem}>
                <p style={styles.resultMessage}><strong>Lỗi:</strong> {match.message}</p>
                <p style={styles.contextText}>
                  Trong câu: "...
                  {match.context.text.slice(0, match.context.offset)}
                  <span style={styles.errorText}>
                    {match.context.text.slice(match.context.offset, match.context.offset + match.context.length)}
                  </span>
                  {match.context.text.slice(match.context.offset + match.context.length)}
                  ..."
                </p>
                {match.replacements.length > 0 && (
                  <p style={styles.suggestion}>
                    <strong>Sửa thành:</strong> {match.replacements.map(rep => `"${rep.value}"`).join(' hoặc ')}
                  </p>
                )}
                <p style={styles.rule}>(Luật: {match.rule.id})</p>
              </div>
            ))}
          </div>
        )}

        {hasChecked && !isLoading && results.length === 0 && !apiError && (
            <div style={styles.noErrors}>
                ✅ Tuyệt vời! Không tìm thấy lỗi ngữ pháp rõ ràng.
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
