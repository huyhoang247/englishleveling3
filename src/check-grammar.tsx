import React, { useState } from 'react';

// === COMPONENT CHÍNH ===
function GrammarChecker() {
  // State để lưu trữ văn bản người dùng nhập vào
  const [text, setText] = useState('Helo world. I is a student. This are a example.');
  
  // State để lưu kết quả trả về từ API
  const [result, setResult] = useState(null);
  
  // State để hiển thị trạng thái đang tải
  const [loading, setLoading] = useState(false);
  
  // State để lưu lỗi nếu có
  const [error, setError] = useState(null);

  // --- Hàm xử lý việc gọi API để kiểm tra ngữ pháp ---
  const handleCheckGrammar = async () => {
    if (!text.trim()) {
      alert('Vui lòng nhập câu cần kiểm tra.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // API endpoint của LanguageTool
    const apiUrl = 'https://api.languagetool.org/v2/check';

    // Dữ liệu gửi đi phải ở định dạng x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', 'en-US'); // Kiểm tra tiếng Anh (Mỹ)
    params.append('enabledOnly', 'false'); // Kích hoạt tất cả các quy tắc

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Lỗi từ API: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError('Không thể kết nối đến máy chủ kiểm tra. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Hàm này tạo ra text được highlight lỗi ---
  const renderHighlightedText = () => {
    if (!result || !result.matches || result.matches.length === 0) {
      return <p className="no-errors">✅ Tuyệt vời! Không tìm thấy lỗi nào.</p>;
    }

    let lastIndex = 0;
    const parts = [];
    // Sắp xếp các lỗi theo vị trí để xử lý tuần tự
    const sortedMatches = [...result.matches].sort((a, b) => a.offset - b.offset);

    sortedMatches.forEach((match, index) => {
      // Thêm phần văn bản đúng đứng trước lỗi
      if (match.offset > lastIndex) {
        parts.push(text.substring(lastIndex, match.offset));
      }
      
      // Lấy phần văn bản bị lỗi
      const errorText = text.substring(match.offset, match.offset + match.length);
      
      // Tạo tooltip hiển thị gợi ý và thông báo lỗi
      const tooltipText = `${match.message}\nGợi ý: ${match.replacements.map(r => r.value).join(', ')}`;

      // Thêm phần văn bản lỗi được highlight
      parts.push(
        <span
          key={`error-${index}`}
          className="error-highlight"
          title={tooltipText} // title sẽ hiện tooltip khi hover
        >
          {errorText}
        </span>
      );
      
      lastIndex = match.offset + match.length;
    });

    // Thêm phần văn bản còn lại sau lỗi cuối cùng
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <div className="result-text">{parts}</div>;
  };

  // --- JSX (HTML) để hiển thị component ---
  return (
    <div className="container">
      {/* CSS được nhúng trực tiếp vào component để tạo thành 1 file duy nhất */}
      <style>{`
        body {
          background-color: #f0f2f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding-top: 40px;
        }
        .container {
          max-width: 800px;
          width: 90%;
          margin: 0 auto;
          padding: 30px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }
        h1 {
          text-align: center;
          color: #1c1e21;
          font-size: 2.2em;
          margin-bottom: 10px;
        }
        .subtitle {
          text-align: center;
          font-size: 1em;
          color: #606770;
          margin-bottom: 30px;
        }
        .subtitle a {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }
        .subtitle a:hover {
          text-decoration: underline;
        }
        textarea {
          width: 100%;
          padding: 15px;
          font-size: 1.1em;
          border-radius: 8px;
          border: 1px solid #ccd0d5;
          margin-bottom: 20px;
          box-sizing: border-box;
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
        }
        textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        button {
          display: block;
          width: 100%;
          padding: 15px;
          font-size: 1.2em;
          font-weight: bold;
          color: white;
          background-image: linear-gradient(to right, #007bff, #0056b3);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
        }
        button:disabled {
          background-image: linear-gradient(to right, #aaa, #888);
          cursor: not-allowed;
          box-shadow: none;
        }
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
        }
        .result-container {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .result-text {
          font-size: 1.2em;
          line-height: 1.7;
          padding: 15px;
          border-radius: 8px;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          margin-bottom: 20px;
        }
        .no-errors {
          color: #28a745;
          font-weight: 500;
          font-size: 1.2em;
          text-align: center;
          padding: 15px;
          background-color: #e9f7ef;
          border-radius: 8px;
        }
        .error-highlight {
          background-color: rgba(255, 221, 221, 0.8);
          padding: 2px 0;
          border-radius: 3px;
          cursor: help;
          text-decoration: underline wavy red 1.5px;
        }
        .suggestions ul {
          list-style-type: none;
          padding: 0;
        }
        .suggestions li {
          background-color: #fff;
          border: 1px solid #dee2e6;
          padding: 15px;
          margin-bottom: 12px;
          border-radius: 8px;
          transition: box-shadow 0.2s;
        }
        .suggestions li:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .suggestions p {
          margin: 5px 0;
          font-size: 1em;
          color: #333;
        }
        .suggestions .error-word {
          color: #d8000c;
          background-color: #ffdddd;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 500;
        }
        .suggestions .suggestion-word {
          color: #28a745;
          background-color: #e9f7ef;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 500;
        }
        .error-message {
          color: #d8000c;
          background-color: #ffdddd;
          border: 1px solid #d8000c;
          padding: 15px;
          margin-top: 20px;
          border-radius: 8px;
          text-align: center;
        }
      `}</style>

      <h1>Công cụ Kiểm tra Ngữ pháp</h1>
      <p className="subtitle">
        Sử dụng API miễn phí từ <a href="https://languagetool.org/" target="_blank" rel="noopener noreferrer">LanguageTool</a>
      </p>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập câu tiếng Anh của bạn vào đây..."
      />
      
      <button onClick={handleCheckGrammar} disabled={loading}>
        {loading ? 'Đang kiểm tra...' : 'Kiểm tra Ngay'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-container">
          <h2>Kết quả phân tích:</h2>
          {renderHighlightedText()}
          
          {result.matches.length > 0 && (
            <div className="suggestions">
              <h3>Chi tiết lỗi và gợi ý:</h3>
              <ul>
                {result.matches.map((match, index) => (
                  <li key={`suggestion-${index}`}>
                    <p><em>{match.message}</em></p>
                    <p>
                      Lỗi: <span className="error-word">"{text.substring(match.offset, match.offset + match.length)}"</span>
                    </p>
                    <p>
                      Gợi ý sửa thành: {match.replacements.map(r => 
                        <span key={r.value} className="suggestion-word">"{r.value}"</span>
                      ).reduce((prev, curr) => [prev, ', ', curr])}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GrammarChecker;
