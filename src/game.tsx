import React, { useState } from 'react';

const GameBrowser: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com'); // Default URL
  const [inputUrl, setInputUrl] = useState('https://www.google.com'); // State for the input field

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleGoClick = () => {
    // Basic URL validation and prefixing with https:// if missing
    let formattedUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    setUrl(formattedUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Browser Bar */}
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

      {/* Iframe for browsing */}
      <div className="flex-grow relative">
        <iframe
          src={url}
          title="Web Browser"
          className="w-full h-full border-0"
          // Add sandbox attributes for security, restricting scripts and popups
          // 'allow-forms' and 'allow-modals' are included to enable basic interactions
          // 'allow-popups' is intentionally excluded to prevent new windows
          // 'allow-scripts' is necessary for most websites to function
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups-to-escape-sandbox"
        >
          Trình duyệt của bạn không hỗ trợ iframe.
        </iframe>
      </div>
    </div>
  );
};

export default GameBrowser;
