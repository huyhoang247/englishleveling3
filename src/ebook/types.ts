// src/data/types.ts

// Định nghĩa cấu trúc cho một cuốn sách
export interface Book {
  id: string;
  title: string;
  content: string;
  contentVi?: string;
  author?: string;
  category: string;
  coverImageUrl?: string;
  audioUrls?: Record<string, string>;
}
