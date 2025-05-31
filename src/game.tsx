import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react'; // Import icon Search từ lucide-react

const GameBrowser: React.FC = () => {
  // Danh sách các URL gợi ý
  const suggestedUrls = [
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Facebook', url: 'https://www.facebook.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'Twitch', url: 'https://www.twitch.tv' },
    { name: 'Reddit', url: 'https://www.reddit.com' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Amazon', url: 'https://www.amazon.com' },
    { name: 'Netflix', url: 'https://www.netflix.com' },
    { name: 'X (Twitter)', url: 'https://twitter.com' },
    { name: 'Instagram', url: 'https://www.instagram.com' },
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
    // Hiển thị lại gợi ý nếu trường nhập liệu trống
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Xử lý khi nhấp vào nút "Đi" hoặc nhấn Enter
  const handleGoClick = () => {
    // Chỉ thực hiện hành động nếu inputUrl không trống
    if (inputUrl.trim() === '') {
      return; // Vô hiệu hóa hành động nếu input trống
    }

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

  // Cập nhật tiêu đề trình duyệt động
  useEffect(() => {
    if (url) {
      // Lưu ý: Việc lấy tiêu đề chính xác từ iframe có thể phức tạp do hạn chế bảo mật cùng nguồn gốc.
      // Đối với các trang web bên ngoài, có thể cần một dịch vụ proxy hoặc API để lấy tiêu đề trang web.
      // Hiện tại, chúng ta sẽ sử dụng URL làm tiêu đề tạm thời.
      document.title = `GameBrowser - ${new URL(url).hostname}`;
    } else {
      document.title = "GameBrowser - Trang chủ";
    }
  }, [url]);

  // Kiểm tra xem nút có nên bị vô hiệu hóa hay không
  const isSearchButtonDisabled = inputUrl.trim() === '';

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Thanh trình duyệt */}
      <div className="flex items-center p-3 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <input
          type="text"
          value={inputUrl}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Nhập URL hoặc tìm kiếm..."
          className="flex-grow p-2 mr-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all duration-200 ease-in-out" // Thêm chuyển đổi
        />
        <button
          onClick={handleGoClick}
          disabled={isSearchButtonDisabled} // Vô hiệu hóa nút nếu input trống
          className={`px-4 py-2 rounded-lg shadow-md flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                     transition-all duration-200 ease-in-out transform
                     ${isSearchButtonDisabled
                       ? 'bg-gray-400 text-gray-600 cursor-not-allowed' // Màu và con trỏ khi vô hiệu hóa
                       : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95' // Màu và hiệu ứng khi hoạt động
                     }`}
        >
          <Search size={20} /> {/* Thay thế chữ "Đi" bằng icon Search */}
        </button>
      </div>

      {/* Hiển thị gợi ý hoặc iframe */}
      <div className="flex-grow relative">
        {showSuggestions && url === '' ? ( // Chỉ hiển thị gợi ý khi chưa có URL và showSuggestions là true
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto h-full">
            {suggestedUrls.map((site, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(site.url)}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md
                           hover:shadow-xl hover:scale-[1.02] transform
                           transition-all duration-200 ease-in-out cursor-pointer" // Thêm chuyển đổi và scale
              >
                <div className="mb-2">
                  {/* Thay thế bằng favicon thực từ Google Favicon API */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}
                    alt={`${site.name} favicon`}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      // Fallback nếu favicon không tải được, hiển thị chữ cái đầu tiên
                      e.currentTarget.onerror = null; // Ngăn chặn vòng lặp lỗi
                      e.currentTarget.style.display = 'none'; // Ẩn ảnh lỗi
                      const parentDiv = e.currentTarget.parentElement;
                      if (parentDiv) {
                        const fallbackSpan = document.createElement('span');
                        fallbackSpan.className = 'text-4xl text-gray-500 dark:text-gray-400'; // Thêm màu sắc cho fallback
                        fallbackSpan.textContent = site.name.charAt(0);
                        parentDiv.appendChild(fallbackSpan);
                      }
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-center">{site.name}</span>
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
