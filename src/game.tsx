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
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    // Only set URL if it's not empty after formatting
    if (formattedUrl) {
      setUrl(formattedUrl);
    } else {
      // Optionally, handle empty input case, e.g., reset to default or show an error
      // For now, if input is empty, we can just keep the current URL
      // Or set to a default if preferred.
      // setUrl('https://www.google.com'); // Or do nothing
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Browser Bar */}
      <div className="flex items-center p-3 sm:p-4 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 space-x-3">
        <input
          type="text"
          value={inputUrl}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Nhập URL hoặc tìm kiếm..."
          className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
        />
        <button
          onClick={handleGoClick}
          className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 mr-2 hidden sm:inline-block" // Hide icon on very small screens if text alone is better
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          Search
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
