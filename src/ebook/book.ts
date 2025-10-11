// src/types/book.ts

/**
 * Định nghĩa cấu trúc dữ liệu cho một cuốn sách.
 */
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
