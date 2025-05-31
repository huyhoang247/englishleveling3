import React, { useState } from 'react';

const GameBrowser: React.FC = () => {
  // Danh sách các URL gợi ý
  const suggestedUrls = [
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Facebook', url: 'https://www.facebook.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'Twitch', url: 'https://www.twitch.tv' },
    { name: 'Reddit', url: 'https://www.reddit.com' },
  ];

  // State cho URL hiện tại của iframe
  const [url, setUrl] = useState(''); // Ban đầu không có URL để hiển thị gợi ý
  // State cho trường nhập liệu
  const [inputUrl, setInputUrl] = useState('');
  // State để kiểm soát việc hiển thị các gợi ý
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Xử lý thay đổi trong trường nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    // Ẩn gợi ý khi người dùng bắt đầu nhập
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Xử lý khi nhấp vào nút "Đi" hoặc nhấn Enter
  const handleGoClick = () => {
    let formattedUrl = inputUrl.trim();
    // Thêm https:// nếu thiếu
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    setUrl(formattedUrl);
    setShowSuggestions(false); // Ẩn gợi ý sau khi điều hướng
  };

  // Xử lý khi nhấn phím Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  // Xử lý khi nhấp vào một gợi ý
  const handleSuggestionClick = (suggestedUrl: string) => {
    setInputUrl(suggestedUrl);
    setUrl(suggestedUrl);
    setShowSuggestions(false); // Ẩn gợi ý sau khi chọn
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Thanh trình duyệt */}
      <div className="flex items-center p-3 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
        <input
          type="text"
          value={inputUrl}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Nhập URL hoặc tìm kiếm..."
          className="flex-grow p-2 mr-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGoClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Đi
        </button>
      </div>

      {/* Hiển thị gợi ý hoặc iframe */}
      <div className="flex-grow relative">
        {showSuggestions && url === '' ? ( // Chỉ hiển thị gợi ý khi chưa có URL và showSuggestions là true
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {suggestedUrls.map((site, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(site.url)}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-4xl mb-2">
                  {/* Có thể thay thế bằng icon hoặc hình ảnh nhỏ cho mỗi trang */}
                  {site.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{site.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <iframe
            src={url}
            title="Web Browser"
            className="w-full h-full border-0"
            // Thêm thuộc tính sandbox để bảo mật, hạn chế script và popup
            // 'allow-forms' và 'allow-modals' được bao gồm để bật các tương tác cơ bản
            // 'allow-popups' bị loại trừ có chủ đích để ngăn các cửa sổ mới
            // 'allow-scripts' là cần thiết để hầu hết các trang web hoạt động
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups-to-escape-sandbox"
          >
            Trình duyệt của bạn không hỗ trợ iframe.
          </iframe>
        )}
      </div>
    </div>
  );
};

export default GameBrowser;
