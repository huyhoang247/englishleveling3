import React from 'react';
import { User } from 'firebase/auth'; // Import User nếu bạn cần truyền currentUser

interface GameProps {
  onWordClick: (word: string) => void;
  currentUser: User | null; // Prop này có thể cần hoặc không tùy theo logic game sau này
}

// Nội dung HTML mẫu cho "trình duyệt"
// Các từ tiếng Anh quan trọng được bọc trong <span class="english-word"></span>
const sampleHtmlContent = `
  <div class="p-4 text-gray-800 dark:text-gray-200">
    <h1 class="text-2xl font-bold mb-4">Welcome to the Learning Browser!</h1>
    <p class="mb-2">
      This is a simple simulation of a browser page. You can read the text below.
      If you click on an <strong class="english-word text-blue-500 hover:underline cursor-pointer">English</strong>
      word like <strong class="english-word text-blue-500 hover:underline cursor-pointer">example</strong>
      or <strong class="english-word text-blue-500 hover:underline cursor-pointer">vocabulary</strong>,
      its definition will pop up.
    </p>
    <p class="mb-2">
      We hope you <strong class="english-word text-blue-500 hover:underline cursor-pointer">enjoy</strong>
      this interactive <strong class="english-word text-blue-500 hover:underline cursor-pointer">feature</strong>.
      Try clicking on words such as
      <strong class="english-word text-blue-500 hover:underline cursor-pointer">learning</strong>,
      <strong class="english-word text-blue-500 hover:underline cursor-pointer">language</strong>,
      or <strong class="english-word text-blue-500 hover:underline cursor-pointer">source</strong>.
    </p>
    <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h2 class="text-lg font-semibold mb-1">A Short Story</h2>
      <p>
        Once upon a time, in a land full of <strong class="english-word text-blue-500 hover:underline cursor-pointer">adventure</strong>,
        a young <strong class="english-word text-blue-500 hover:underline cursor-pointer">explorer</strong> decided to
        <strong class="english-word text-blue-500 hover:underline cursor-pointer">discover</strong> new
        <strong class="english-word text-blue-500 hover:underline cursor-pointer">knowledge</strong>.
        Their <strong class="english-word text-blue-500 hover:underline cursor-pointer">journey</strong> was filled with
        many <strong class="english-word text-blue-500 hover:underline cursor-pointer">challenges</strong>.
      </p>
    </div>
    <p class="mt-3">
      Remember to check your <strong class="english-word text-blue-500 hover:underline cursor-pointer">insurance</strong>
      and have a solid <strong class="english-word text-blue-500 hover:underline cursor-pointer">argument</strong> for your
      <strong class="english-word text-blue-500 hover:underline cursor-pointer">influence</strong>.
    </p>
  </div>
`;

const Game: React.FC<GameProps> = ({ onWordClick, currentUser }) => {
  // Xử lý sự kiện click trên nội dung HTML
  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    // Kiểm tra xem phần tử được nhấp có class 'english-word' không
    if (target.classList.contains('english-word')) {
      const word = target.textContent;
      if (word) {
        onWordClick(word.trim());
      }
    }
  };

  return (
    <div className="game-browser-container h-full overflow-y-auto bg-white dark:bg-gray-900">
      {/* Sử dụng dangerouslySetInnerHTML để hiển thị HTML.
          Lưu ý: Chỉ sử dụng với nội dung HTML đáng tin cậy. */}
      <div
        dangerouslySetInnerHTML={{ __html: sampleHtmlContent }}
        onClick={handleContentClick}
        className="prose dark:prose-invert max-w-none" // TailwindCSS typography plugin cho styling
      />
    </div>
  );
};

export default Game;
