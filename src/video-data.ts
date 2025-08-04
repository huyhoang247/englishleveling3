// --- START OF FILE src/video-data.ts (MODIFIED) ---

export interface Video {
  id: string; // YouTube Video ID
  title: string;
  author: string;
  thumbnailUrl: string;
  category: string;
  srtUrl: string; // <<-- THAY ĐỔI: Bỏ dấu '?' để trường này trở thành bắt buộc
}

export const sampleVideos: Video[] = [
  {
    id: 'L_Guz73e6fw',
    title: 'A Simple Way to Break a Bad Habit',
    author: 'TED',
    thumbnailUrl: 'https://i.ytimg.com/vi/L_Guz73e6fw/hqdefault.jpg',
    category: 'Khoa học & Tâm lý',
    srtUrl: '/subtitles/a-simple-way.srt' 
  },
  {
    id: '6af6b_wygQA',
    title: 'Steve Jobs\' 2005 Stanford Commencement Address',
    author: 'Stanford',
    thumbnailUrl: 'https://i.ytimg.com/vi/6af6b_wygQA/hqdefault.jpg',
    category: 'Truyền cảm hứng',
    srtUrl: '/subtitles/steve-jobs.srt' // <<-- THÊM
  },
  {
    id: 'k0GQSJrpVhM',
    title: 'The First 20 Hours - How to Learn Anything',
    author: 'Josh Kaufman',
    thumbnailUrl: 'https://i.ytimg.com/vi/k0GQSJrpVhM/hqdefault.jpg',
    category: 'Phát triển bản thân',
    srtUrl: '/subtitles/learn-anything.srt' // <<-- THÊM
  },
  {
    id: '8S0FDjFBj8o',
    title: 'What makes a good life? Lessons from the longest study',
    author: 'Robert Waldinger',
    thumbnailUrl: 'https://i.ytimg.com/vi/8S0FDjFBj8o/hqdefault.jpg',
    category: 'Khoa học & Tâm lý',
    srtUrl: '/subtitles/good-life.srt' // <<-- THÊM
  },
   {
    id: 'M62_IM_h4_g',
    title: 'History of the World: Every Year',
    author: 'Cottereau',
    thumbnailUrl: 'https://i.ytimg.com/vi/M62_IM_h4_g/hqdefault.jpg',
    category: 'Lịch sử & Văn hóa',
    srtUrl: '/subtitles/history-world.srt' // <<-- THÊM
  },
  {
    id: 'r6e3j0vgN9E',
    title: 'How a Car Engine Works',
    author: 'Animagraffs',
    thumbnailUrl: 'https://i.ytimg.com/vi/r6e3j0vgN9E/hqdefault.jpg',
    category: 'Kỹ thuật',
    srtUrl: '/subtitles/car-engine.srt' // <<-- THÊM
  }
];
