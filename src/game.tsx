import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  GlobeAltIcon, // Generic icon for suggestions
} from '@heroicons/react/24/outline'; // Using outline icons

// Simple SVG icons for specific sites (you can replace these with better ones or library icons)
const YouTubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-600">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.411 0 5.846 0 12s.488 8.589 4.385 8.816c3.6.245 11.626.246 15.23 0C23.512 20.589 24 18.154 24 12s-.488-8.589-4.385-8.816zM9.75 15.6V8.4l6.5 3.6-6.5 3.6z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
  </svg>
);

const WikipediaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-700 dark:text-gray-300">
    <path d="M12.13.112a.89.89 0 00-.892.892V2.88c-2.331.16-4.388 1.11-5.985 2.708S2.388 9.174 2.23 11.505H.358a.89.89 0 00-.892.892v1.786c0 .493.399.892.892.892H2.23c.16 2.331 1.11 4.388 2.708 5.985s3.654 2.548 5.985 2.708v1.876a.89.89 0 00.892.892h1.786a.89.89 0 00.892-.892V21.77c2.331-.16 4.388-1.11 5.985-2.708s2.548-3.654 2.708-5.985h1.876a.89.89 0 00.892-.892v-1.786a.89.89 0 00-.892-.892H21.77c-.16-2.331-1.11-4.388-2.708-5.985s-3.654-2.548-5.985-2.708V1.004a.89.89 0 00-.892-.892h-1.786zm.407 3.553h.972l.195.624.805 2.575h.06l.806-2.575.195-.624h.972l-1.46 4.662v3.199h-.893V8.325l-1.46-4.66zm-3.056.605h.893v7.256h2.608v.695H9.481v-.695h2.607V5.778h.893V4.27H9.481zm5.405 0h.893v7.951h-.893zM7.42 6.568l.68-.21c.294.99.71 1.855 1.22 2.555.06.08.1.14.13.18-.63.39-1.28.64-1.96.73l-.27-.65zm7.373.21l.68.21-.27.65c-.68-.09-1.33-.34-1.96-.73.03-.04.07-.1.13-.18.51-.7.926-1.565 1.22-2.555z"/>
  </svg>
);


const GameBrowser: React.FC = () => {
  const suggestedUrls = [
    { name: 'YouTube', url: 'https://www.youtube.com', icon: <YouTubeIcon /> },
    { name: 'Facebook', url: 'https://www.facebook.com', icon: <FacebookIcon /> },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: <WikipediaIcon /> },
    { name: 'Twitch', url: 'https://www.twitch.tv', icon: <GlobeAltIcon className="w-8 h-8 text-purple-500" /> },
    { name: 'Reddit', url: 'https://www.reddit.com', icon: <GlobeAltIcon className="w-8 h-8 text-orange-500" /> },
  ];

  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // When a new URL is set, and it's not empty, start loading.
    if (url) {
      setIsLoading(true);
    }
  }, [url]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
    setShowSuggestions(value.length === 0);
  };

  const handleGoClick = () => {
    if (!inputUrl.trim()) return;

    let formattedUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    // Setting the URL here will trigger the useEffect to set isLoading
    setUrl(formattedUrl);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  const handleSuggestionClick = (suggestedUrl: string) => {
    setInputUrl(suggestedUrl);
    // Setting the URL here will trigger the useEffect to set isLoading
    setUrl(suggestedUrl);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    setInputUrl('');
    setShowSuggestions(true);
    // Optionally, you might want to clear the iframe too
    // setUrl('');
    // setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Address Bar */}
      <div className="flex items-center p-3 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 z-10">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập URL hoặc tìm kiếm..."
            className="w-full p-2 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow duration-200"
          />
          {inputUrl && (
            <button
              onClick={clearInput}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear input"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          onClick={handleGoClick}
          disabled={!inputUrl.trim()}
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          <PaperAirplaneIcon className="h-5 w-5 hidden sm:inline-block mr-0 sm:mr-2" />
          <span className="sm:inline hidden">Đi</span>
          <span className="sm:hidden inline">Go</span>
        </button>
      </div>

      {/* Content Area: Suggestions or Iframe */}
      <div className="flex-grow relative overflow-hidden">
        {showSuggestions && !url ? (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Gợi ý cho bạn
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {suggestedUrls.map((site) => (
                <button
                  key={site.name}
                  onClick={() => handleSuggestionClick(site.url)}
                  className="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                >
                  <div className="mb-3 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                    {site.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {site.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-400">Đang tải trang...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{url}</p>
            </div>
          </div>
        ) : url ? ( // Only render iframe if URL is set and not loading
          <iframe
            src={url}
            title="Web Browser"
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={() => { // Basic error handling
                setIsLoading(false);
                // Could set an error message here
                console.error("Error loading iframe content for: ", url);
            }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-presentation"
            // Added 'allow-popups' and 'allow-top-navigation' for better compatibility, but be mindful of security.
            // 'allow-presentation' can be useful for sites with presentation modes.
          >
            Trình duyệt của bạn không hỗ trợ iframe.
          </iframe>
        ) : null /* Initial state before any interaction or if URL is cleared */ }
      </div>
    </div>
  );
};

export default GameBrowser;
