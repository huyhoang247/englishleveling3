// src/data/books/index.ts
import { Book } from '../types.ts';

import { book1Data } from './book1.ts';
import { book2Data } from './book2.ts';
import { book3Data } from './book3.ts';
import { book4Data } from './book4.ts';
import { book5Data } from './book5.ts';





// Tổng hợp tất cả dữ liệu sách vào một mảng duy nhất
export const allBooks: Book[] = [
  book1Data,
  book2Data,
  book3Data,
  book4Data,
  book5Data,
  
];
