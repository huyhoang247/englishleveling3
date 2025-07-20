// --- START OF FILE skills.data.ts ---

import React from 'react';

// --- ICONS CHO KỸ NĂNG ---
// Các icon này được định nghĩa ở đây để đi kèm với dữ liệu kỹ năng.
export const FireballIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.81 4.62C13.25 3.53 14.65 3.53 15.09 4.62L16.2 7.29C16.34 7.6 16.6 7.86 16.91 8L19.58 9.11C20.67 9.55 20.67 10.95 19.58 11.39L16.91 12.5C16.6 12.64 16.34 12.9 16.2 13.21L15.09 15.88C14.65 16.97 13.25 16.97 12.81 15.88L11.7 13.21C11.56 12.9 11.3 12.64 10.99 12.5L8.32 11.39C7.23 10.95 7.23 9.55 8.32 9.11L10.99 8C11.3 7.86 11.56 7.6 11.7 7.29L12.81 4.62Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.18994 18.3C9.62994 17.21 11.0299 17.21 11.4699 18.3L11.9999 19.52C12.1399 19.83 12.3999 20.09 12.7099 20.23L13.9299 20.76C15.0199 21.2 15.0199 22.6 13.9299 23.04L12.7099 23.57C12.3999 23.71 12.1399 23.97 11.9999 24.28L11.4699 25.5C11.0299 26.59 9.62994 26.59 9.18994 25.5L8.65994 24.28C8.51994 23.97 8.25994 23.71 7.94994 23.57L6.72994 23.04C5.63994 22.6 5.63994 21.2 6.72994 20.76L7.94994 20.23C8.25994 20.09 8.51994 19.83 8.65994 19.52L9.18994 18.3Z" transform="scale(0.7) translate(-2, -12)" fill="#fef08a" stroke="#facc15" /> <path d="M17.19 16.3C17.63 15.21 19.03 15.21 19.47 16.3L19.85 17.17C19.99 17.48 20.25 17.74 20.56 17.88L21.43 18.26C22.52 18.7 22.52 20.1 21.43 20.54L20.56 20.92C20.25 21.06 19.99 21.32 19.85 21.63L19.47 22.5C19.03 23.59 17.63 23.59 17.19 22.5L16.81 21.63C16.67 21.32 16.41 21.06 16.1 20.92L15.23 20.54C14.14 20.1 14.14 18.7 15.23 18.26L16.1 17.88C16.41 17.74 16.67 17.48 16.81 17.17L17.19 16.3Z" transform="scale(0.5) translate(18, -20)" fill="#fed7aa" stroke="#fb923c"/> </svg>);
export const IceShardIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2L9.13 8.37L2 10.5L7.87 15.63L6.25 22L12 18.5L17.75 22L16.13 15.63L22 10.5L14.87 8.37L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 2V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M2 10.5H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M6.25 22L12 11.5L17.75 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9.13 8.37L2.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M14.87 8.37L21.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
export const HealIcon = ({ className = '' }: { className?: string }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );


// --- DỮ LIỆU & CẤU HÌNH KỸ NĂNG ---
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
  rarity: 'E' | 'D' | 'B' | 'A' | 'S' | 'SR';
}

export const ALL_SKILLS: Skill[] = [
  { id: 'fireball',    name: 'Quả Cầu Lửa',      description: 'Tấn công kẻ địch bằng một quả cầu lửa rực cháy.', icon: FireballIcon, rarity: 'B' },
  { id: 'ice_shard',   name: 'Mảnh Băng',         description: 'Làm chậm và gây sát thương lên mục tiêu.',         icon: IceShardIcon, rarity: 'A' },
  { id: 'heal',        name: 'Hồi Máu',          description: 'Phục hồi một lượng máu cho bản thân.',               icon: HealIcon, rarity: 'D' },
];

// --- END OF FILE skills.data.ts ---
