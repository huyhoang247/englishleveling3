import React, { useState } from 'react';

// --- ĐỊNH NGHĨA CSS TRONG JAVASCRIPT (INLINE STYLES) ---
// Thay vì dùng file CSS riêng, chúng ta định nghĩa các style object ở đây
const styles = {
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
  // State để lưu trữ câu người dùng nhập vào
  const [text, setText] = useState('');
  
  // State để lưu trữ các lỗi ngữ pháp tìm thấy
  const [results, setResults] = useState([]);
  
  // State để biết khi nào đang gọi API (để hiển thị loading)
  const [isLoading, setIsLoading] = useState(false);
  
  // State để lưu lỗi nếu có sự cố khi gọi API
  const [apiError, setApiError] = useState(null);
  
  // Biến cờ để biết liệu đã có lần kiểm tra nào được thực hiện hay chưa
  const [hasChecked, setHasChecked] = useState(false);

  /**
   * Hàm gọi API của LanguageTool để kiểm tra ngữ pháp
   */
  const checkGrammar = async () => {
    if (!text.trim()) return; // Không kiểm tra nếu ô trống

    // Reset trạng thái trước khi bắt đầu
    setIsLoading(true);
    setApiError(null);
    setResults([]);
    setHasChecked(true);

    try {
      // API endpoint của LanguageTool
      const apiUrl = 'https://api.languagetoolplus.com/v2/check';

      // Dữ liệu gửi đi phải ở định dạng x-www-form-urlencoded
      const data = new URLSearchParams();
      data.append('text', text);
      data.append('language', 'en-US'); // Kiểm tra tiếng Anh (Mỹ)

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
      setResults(responseData.matches); // 'matches' là mảng chứa các lỗi

    } catch (err) {
      setApiError('Đã có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsLoading(false); // Dừng loading dù thành công hay thất bại
    }
  };
  
  /**
   * Hàm xử lý khi người dùng bấm Enter để check
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn không cho xuống dòng
      checkGrammar();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>Kiểm tra Ngữ pháp & Chính tả Tiếng Anh</h1>
      <p style={styles.p}>Nhập một câu tiếng Anh và bấm "Kiểm tra" (hoặc nhấn Enter) để xem gợi ý sửa lỗi.</p>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ví dụ: He dont know nothing..."
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
        {/* Hiển thị lỗi API nếu có */}
        {apiError && <div style={styles.errorMessage}>{apiError}</div>}

        {/* Hiển thị kết quả */}
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

        {/* Nếu không có lỗi và đã kiểm tra xong */}
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
