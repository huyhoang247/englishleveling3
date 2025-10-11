// src/data/books/index.ts
import { Book } from '../types.ts';

import { book1Data } from './book1.ts';
import { book2Data } from './book2.ts';



// Tổng hợp tất cả dữ liệu sách vào một mảng duy nhất
export const allBooks: Book[] = [
  book1Data,
  book2Data,
  
];
