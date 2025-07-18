// File: src/components/BossBattle.tsx

import React, { useState, useEffect, useRef } from 'react';

// --- Props Interface for the Component ---
interface BossBattleProps {
  onClose: () => void;
  playerInitialStats: {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    maxEnergy: number;
    energy: number;
  };
  onBattleEnd: (result: 'win' | 'lose', rewards: { coins: number; energy: number }) => void;
}

// --- Cấu trúc dữ liệu cho các Boss theo tầng (50 Tầng) ---
const BOSS_DATA = [
    { id: 1, floor: "FLOOR 1", name: "Whispering Wisp", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 100, hp: 100, atk: 10, def: 6 }, rewards: { coins: 90, energy: 5 } },
    { id: 2, floor: "FLOOR 2", name: "Moldy Gnawer", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 120, hp: 120, atk: 12, def: 7 }, rewards: { coins: 108, energy: 5 } },
    { id: 3, floor: "FLOOR 3", name: "Flickering Ember", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 144, hp: 144, atk: 14, def: 9 }, rewards: { coins: 130, energy: 5 } },
    { id: 4, floor: "FLOOR 4", name: "Bone Scuttler", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 173, hp: 173, atk: 17, def: 10 }, rewards: { coins: 156, energy: 5 } },
    { id: 5, floor: "FLOOR 5", name: "Creaking Door", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 207, hp: 207, atk: 21, def: 12 }, rewards: { coins: 186, energy: 6 } },
    { id: 6, floor: "FLOOR 6", name: "Putrid Rat", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 249, hp: 249, atk: 25, def: 15 }, rewards: { coins: 224, energy: 6 } },
    { id: 7, floor: "FLOOR 7", name: "Dusty Specter", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 299, hp: 299, atk: 30, def: 18 }, rewards: { coins: 269, energy: 6 } },
    { id: 8, floor: "FLOOR 8", name: "Shivering Spider", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 358, hp: 358, atk: 36, def: 21 }, rewards: { coins: 322, energy: 6 } },
    { id: 9, floor: "FLOOR 9", name: "Gnarled Goblet", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 430, hp: 430, atk: 43, def: 26 }, rewards: { coins: 387, energy: 6 } },
    { id: 10, floor: "FLOOR 10", name: "Oozing Leech", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 516, hp: 516, atk: 52, def: 31 }, rewards: { coins: 464, energy: 7 } },
    { id: 11, floor: "FLOOR 11", name: "Murmuring Echo", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 619, hp: 619, atk: 62, def: 37 }, rewards: { coins: 557, energy: 7 } },
    { id: 12, floor: "FLOOR 12", name: "Rusted Golem", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 743, hp: 743, atk: 74, def: 45 }, rewards: { coins: 669, energy: 7 } },
    { id: 13, floor: "FLOOR 13", name: "Sunken Gazer", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 892, hp: 892, atk: 89, def: 53 }, rewards: { coins: 803, energy: 7 } },
    { id: 14, floor: "FLOOR 14", name: "Rancid Slime", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 1070, hp: 1070, atk: 107, def: 64 }, rewards: { coins: 963, energy: 7 } },
    { id: 15, floor: "FLOOR 15", name: "Lurking Shade", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 1284, hp: 1284, atk: 128, def: 77 }, rewards: { coins: 1156, energy: 8 } },
    { id: 16, floor: "FLOOR 16", name: "Cursed Lantern", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 1541, hp: 1541, atk: 154, def: 92 }, rewards: { coins: 1387, energy: 8 } },
    { id: 17, floor: "FLOOR 17", name: "Twitching Fungus", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 1849, hp: 1849, atk: 185, def: 111 }, rewards: { coins: 1664, energy: 8 } },
    { id: 18, floor: "FLOOR 18", name: "Hollow Tooth", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 2219, hp: 2219, atk: 222, def: 133 }, rewards: { coins: 1997, energy: 8 } },
    { id: 19, floor: "FLOOR 19", name: "Burrowing Vermin", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 2663, hp: 2663, atk: 266, def: 160 }, rewards: { coins: 2397, energy: 8 } },
    { id: 20, floor: "FLOOR 20", name: "Groaning Crone", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 3195, hp: 3195, atk: 320, def: 192 }, rewards: { coins: 2876, energy: 9 } },
    { id: 21, floor: "FLOOR 21", name: "Corrupted Peasant", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 3834, hp: 3834, atk: 383, def: 230 }, rewards: { coins: 3451, energy: 9 } },
    { id: 22, floor: "FLOOR 22", name: "Pallid Clerk", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 4601, hp: 4601, atk: 460, def: 276 }, rewards: { coins: 4141, energy: 9 } },
    { id: 23, floor: "FLOOR 23", name: "Shambling Skeleton", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 5521, hp: 5521, atk: 552, def: 331 }, rewards: { coins: 4969, energy: 9 } },
    { id: 24, floor: "FLOOR 24", name: "Buzzing Swarm", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 6626, hp: 6626, atk: 663, def: 398 }, rewards: { coins: 5963, energy: 9 } },
    { id: 25, floor: "FLOOR 25", name: "Flickered Marionette", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 7951, hp: 7951, atk: 795, def: 477 }, rewards: { coins: 7156, energy: 10 } },
    { id: 26, floor: "FLOOR 26", name: "Fetid Bat", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 9541, hp: 9541, atk: 954, def: 572 }, rewards: { coins: 8587, energy: 10 } },
    { id: 27, floor: "FLOOR 27", name: "Echoing Howl", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 11449, hp: 11449, atk: 1145, def: 687 }, rewards: { coins: 10304, energy: 10 } },
    { id: 28, floor: "FLOOR 28", name: "Sputtering Torch", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 13739, hp: 13739, atk: 1374, def: 824 }, rewards: { coins: 12365, energy: 10 } },
    { id: 29, floor: "FLOOR 29", name: "Eroded Statue", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 16487, hp: 16487, atk: 1649, def: 989 }, rewards: { coins: 14838, energy: 10 } },
    { id: 30, floor: "FLOOR 30", name: "Scarlet Eyeball", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 19784, hp: 19784, atk: 1978, def: 1187 }, rewards: { coins: 17806, energy: 11 } },
    { id: 31, floor: "FLOOR 31", name: "Pestilent Rat King", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 23741, hp: 23741, atk: 2374, def: 1424 }, rewards: { coins: 21367, energy: 11 } },
    { id: 32, floor: "FLOOR 32", name: "Ragged Puppet", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 28489, hp: 28489, atk: 2849, def: 1709 }, rewards: { coins: 25640, energy: 11 } },
    { id: 33, floor: "FLOOR 33", name: "Wailing Child", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 34187, hp: 34187, atk: 3419, def: 2051 }, rewards: { coins: 30768, energy: 11 } },
    { id: 34, floor: "FLOOR 34", name: "Dimly Lit Ghoul", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 41025, hp: 41025, atk: 4102, def: 2461 }, rewards: { coins: 36923, energy: 11 } },
    { id: 35, floor: "FLOOR 35", name: "Thorned Creeper", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 49230, hp: 49230, atk: 4923, def: 2954 }, rewards: { coins: 44307, energy: 12 } },
    { id: 36, floor: "FLOOR 36", name: "Fiendish Bat", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 59075, hp: 59075, atk: 5908, def: 3545 }, rewards: { coins: 53168, energy: 12 } },
    { id: 37, floor: "FLOOR 37", name: "Gnashing Maw", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 70890, hp: 70890, atk: 7089, def: 4253 }, rewards: { coins: 63801, energy: 12 } },
    { id: 38, floor: "FLOOR 38", name: "Moldering Husk", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 85068, hp: 85068, atk: 8507, def: 5104 }, rewards: { coins: 76561, energy: 12 } },
    { id: 39, floor: "FLOOR 39", name: "Tongueless Monk", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 102082, hp: 102082, atk: 10208, def: 6125 }, rewards: { coins: 91874, energy: 12 } },
    { id: 40, floor: "FLOOR 40", name: "Creeping Vine", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 122499, hp: 122499, atk: 12250, def: 7350 }, rewards: { coins: 110249, energy: 13 } },
    { id: 41, floor: "FLOOR 41", name: "Deafening Screech", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 146998, hp: 146998, atk: 14700, def: 8820 }, rewards: { coins: 132298, energy: 13 } },
    { id: 42, floor: "FLOOR 42", name: "Dripping Corpse", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 176398, hp: 176398, atk: 17640, def: 10584 }, rewards: { coins: 158758, energy: 13 } },
    { id: 43, floor: "FLOOR 43", name: "Veiled Mourner", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 211678, hp: 211678, atk: 21168, def: 12701 }, rewards: { coins: 190510, energy: 13 } },
    { id: 44, floor: "FLOOR 44", name: "Rotted Knight", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 254013, hp: 254013, atk: 25401, def: 15241 }, rewards: { coins: 228612, energy: 13 } },
    { id: 45, floor: "FLOOR 45", name: "Sinister Jester", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 304816, hp: 304816, atk: 30482, def: 18289 }, rewards: { coins: 274334, energy: 14 } },
    { id: 46, floor: "FLOOR 46", name: "Clanking Armor", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 365779, hp: 365779, atk: 36578, def: 21947 }, rewards: { coins: 329201, energy: 14 } },
    { id: 47, floor: "FLOOR 47", name: "Fanged Crow", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 438935, hp: 438935, atk: 43893, def: 26336 }, rewards: { coins: 395042, energy: 14 } },
    { id: 48, floor: "FLOOR 48", name: "Whispered Prayer", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 526722, hp: 526722, atk: 52672, def: 31603 }, rewards: { coins: 474050, energy: 14 } },
    { id: 49, floor: "FLOOR 49", name: "Hollow Mourner", imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png", stats: { maxHp: 632066, hp: 632066, atk: 63207, def: 37924 }, rewards: { coins: 568859, energy: 14 } },
    { id: 50, floor: "FLOOR 50", name: "Unquiet Tormentor", imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png", stats: { maxHp: 758479, hp: 758479, atk: 75848, def: 45509 }, rewards: { coins: 682631, energy: 15 } }
];


// --- Component Thanh Máu ---
const HealthBar = ({ current, max, colorGradient, shadowColor }: { current: number, max: number, colorGradient: string, shadowColor:string }) => {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="relative w-full h-7 bg-black/40 rounded-full border-2 border-slate-700/80 p-1 shadow-inner backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorGradient}`}
          style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${shadowColor}, 0 0 12px ${shadowColor}` }}
        ></div>
        <div className="absolute inset-0 flex justify-center items-center text-sm text-white text-shadow font-bold">
          <span>{Math.ceil(current)} / {max}</span>
        </div>
      </div>
    </div>
  );
};

// --- Component Hiển thị Năng Lượng ---
const EnergyDisplay = ({ current, max }: { current: number, max: number }) => {
    return (
      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-cyan-500/30">
          <img
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png"
            alt="Energy"
            className="w-5 h-5"
          />
          <span className="font-bold text-base text-cyan-300 text-shadow-sm tracking-wider">
              {current}/{max}
          </span>
      </div>
    );
};

// --- Component Số Sát Thương ---
const FloatingDamage = ({ damage, id, isPlayerHit }: { damage: number, id: number, isPlayerHit: boolean }) => {
  const formatDamageText = (num: number): string => {
    if (num >= 1000) return `${parseFloat((num / 1000).toFixed(1))}k`;
    return String(num);
  };
  return (
    <div
      key={id}
      className={`absolute top-1/3 font-lilita text-2xl animate-float-up text-red-500 pointer-events-none ${isPlayerHit ? 'left-[5%]' : 'right-[5%]'}`}
      style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 3px 3px 5px rgba(0,0,0,0.7)' }}
    >
      -{formatDamageText(damage)}
    </div>
  );
};

// --- Component Modal Chỉ Số ---
const StatsModal = ({ player, boss, bossName, onClose }: { player: any, boss: any, bossName: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-xl font-bold text-blue-300 text-shadow-sm tracking-wide">YOU</h3>
              <p className="text-lg">ATK: <span className="font-bold text-red-400">{player.atk}</span></p>
              <p className="text-lg">DEF: <span className="font-bold text-sky-400">{player.def}</span></p>
            </div>
            <div className="h-16 w-px bg-slate-600/70"></div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative group flex justify-center">
                {/* THÊM `select-none` VÀO ĐÂY */}
                <h3 className="text-xl font-bold text-red-400 text-shadow-sm tracking-wide select-none">
                  BOSS
                </h3>
                <div className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-slate-800 text-xs font-sans font-medium text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {bossName.toUpperCase()}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
                </div>
              </div>
              <p className="text-lg">ATK: <span className="font-bold text-red-400">{boss.atk}</span></p>
              <p className="text-lg">DEF: <span className="font-bold text-sky-400">{boss.def}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ... các component modal khác giữ nguyên, không cần thay đổi ...
// --- Component Modal Lịch Sử Chiến Đấu ---
const LogModal = ({ log, onClose }: { log: string[], onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="relative w-96 max-w-md bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita flex flex-col" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
          <div className="p-4 border-b border-slate-700"><h3 className="text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide">BATTLE HISTORY</h3></div>
          <div className="h-80 overflow-y-auto p-4 flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
            {log.length > 0 ? log.map((entry, index) => (<p key={index} className="text-slate-300 mb-2 border-b border-slate-800/50 pb-2">{entry}</p>)) : (<p className="text-slate-400 text-center italic">Chưa có lịch sử trận đấu.</p>)}
          </div>
        </div>
      </div>
    )
}

// --- Component Modal Phần Thưởng ---
const RewardsModal = ({ onClose, rewards }: { onClose: () => void, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-80 bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-lilita" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>
        <div className="p-5 pt-8">
          <h3 className="text-xl font-bold text-center text-yellow-300 text-shadow-sm tracking-wide mb-5 uppercase">Potential Rewards</h3>
          <div className="flex flex-row flex-wrap justify-center gap-3">
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1.287 15.584c-1.42.368-2.92.516-4.287.395V16.6c1.077.105 2.13.045 3.129-.169a1 1 0 0 0 .87-1.119l-.547-3.284a1 1 0 0 0-1.119-.87c-.394.065-.806.11-1.229.136V9.4c.319-.016.634-.042.946-.078a1 1 0 0 0 .973-1.018l-.138-1.65a1 1 0 0 0-1.017-.973c-.886.074-1.78.11-2.664.11S9.334 5.863 8.448 5.79a1 1 0 0 0-1.017.973l-.138 1.65a1 1 0 0 0 .973 1.018c.312.036.627.062.946.078v1.896c-.423-.026-.835-.071-1.229-.136a1 1 0 0 0-1.119.87l-.547 3.284a1 1 0 0 0 .87 1.119c1.131.238 2.306.31 3.522.188v1.376c-1.385.01-2.858-.171-4.22-.656a1 1 0 1 0-.604 1.9c1.73.613 3.598.819 5.324.793 1.726.026 3.594-.18 5.324-.793a1 1 0 1 0-.604-1.9z"></path></svg>
              <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/50 w-32 py-1.5 rounded-lg border border-slate-700">
              <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
              <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Component Modal Chiến Thắng ---
const VictoryModal = ({ onRestart, onNextFloor, isLastBoss, rewards }: { onRestart: () => void, onNextFloor: () => void, isLastBoss: boolean, rewards: { coins: number, energy: number } }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2H8C4.691 2 2 4.691 2 8v8c0 3.309 2.691 6 6 6h8c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm-4 16c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"></path><path d="M12 10c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"></path><path d="M15 2.05A8.956 8.956 0 0 0 12 1a9 9 0 0 0-9 9c0 1.948.624 3.738 1.666 5.176l1.321-1.321A6.96 6.96 0 0 1 5 9a7 7 0 0 1 14 0c0 1.294-.361 2.49-1.025 3.518l1.321 1.321C20.376 12.738 21 10.948 21 9a8.956 8.956 0 0 0-2.05-5.95z"></path></svg>
          <h2 className="text-4xl font-bold text-yellow-300 tracking-widest uppercase mb-4 text-shadow" style={{ textShadow: `0 0 10px rgba(252, 211, 77, 0.7)` }}>VICTORY</h2>
          <div className="w-full flex flex-col items-center gap-3">
              <p className="font-sans text-yellow-100/80 text-sm tracking-wide uppercase">Rewards Earned</p>
              <div className="flex flex-row flex-wrap justify-center gap-3">
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400 drop-shadow-[0_1px_2px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1.287 15.584c-1.42.368-2.92.516-4.287.395V16.6c1.077.105 2.13.045 3.129-.169a1 1 0 0 0 .87-1.119l-.547-3.284a1 1 0 0 0-1.119-.87c-.394.065-.806.11-1.229.136V9.4c.319-.016.634-.042.946-.078a1 1 0 0 0 .973-1.018l-.138-1.65a1 1 0 0 0-1.017-.973c-.886.074-1.78.11-2.664.11S9.334 5.863 8.448 5.79a1 1 0 0 0-1.017.973l-.138 1.65a1 1 0 0 0 .973 1.018c.312.036.627.062.946.078v1.896c-.423-.026-.835-.071-1.229-.136a1 1 0 0 0-1.119.87l-.547 3.284a1 1 0 0 0 .87 1.119c1.131.238 2.306.31 3.522.188v1.376c-1.385.01-2.858-.171-4.22-.656a1 1 0 1 0-.604 1.9c1.73.613 3.598.819 5.324.793 1.726.026 3.594-.18 5.324-.793a1 1 0 1 0-.604-1.9z"></path></svg>
                      <span className="text-xl font-bold text-yellow-300 text-shadow-sm">{rewards.coins}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2 bg-slate-800/60 w-32 py-1.5 rounded-lg border border-slate-700">
                      <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="Energy" className="w-6 h-6 drop-shadow-[0_1px_2px_rgba(34,211,238,0.5)]" />
                      <span className="text-xl font-bold text-cyan-300 text-shadow-sm">{rewards.energy}</span>
                  </div>
              </div>
          </div>
          <hr className="w-full border-t border-yellow-500/20 my-5" />
          {!isLastBoss ? (
            <button onClick={onNextFloor} className="w-full px-8 py-3 bg-blue-600/50 hover:bg-blue-600 rounded-lg font-bold text-base text-blue-50 tracking-wider uppercase border border-blue-500 hover:border-blue-400 transition-all duration-200 active:scale-95">Next Floor</button>
          ) : (
            <button onClick={onRestart} className="w-full px-8 py-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg font-bold text-base text-yellow-50 tracking-wider uppercase border border-yellow-500 hover:border-yellow-400 transition-all duration-200 active:scale-95">Play Again</button>
          )}
      </div>
    </div>
  );
}

// --- Component Modal Thất Bại ---
const DefeatModal = ({ onRestart }: { onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in">
      <div className="relative w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl shadow-black/30 animate-fade-in-scale-fast text-white font-lilita flex flex-col items-center p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-500 mb-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M13.293 14.707a.999.999 0 0 1-1.414 0L9.464 12.293a.999.999 0 0 1 0-1.414l2.414-2.414a.999.999 0 1 1 1.414 1.414L11.586 12l2.293 2.293a.999.999 0 0 1 0 1.414zM8.5 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></svg>
          <h2 className="text-4xl font-bold text-slate-300 tracking-widest uppercase mb-3">DEFEAT</h2>
          <p className="font-sans text-slate-400 text-sm leading-relaxed max-w-xs">The darkness has consumed you. Rise again and reclaim your honor.</p>
          <hr className="w-full border-t border-slate-700/50 my-5" />
          <button onClick={onRestart} className="w-full px-8 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-bold text-base text-slate-200 tracking-wider uppercase border border-slate-600 hover:border-slate-500 transition-all duration-200 active:scale-95">Try Again</button>
      </div>
    </div>
  );
}


// --- Component Chính Của Game ---
export default function BossBattle({ onClose, playerInitialStats, onBattleEnd }: BossBattleProps) {
  const [currentBossIndex, setCurrentBossIndex] = useState(0);
  const currentBossData = BOSS_DATA[currentBossIndex];

  const [playerStats, setPlayerStats] = useState(playerInitialStats);
  const [bossStats, setBossStats] = useState(currentBossData.stats);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [previousCombatLog, setPreviousCombatLog] = useState<string[]>([]);
  const [turnCounter, setTurnCounter] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'finished'>('idle');
  const [showStats, setShowStats] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [damages, setDamages] = useState<{ id: number, damage: number, isPlayerHit: boolean }[]>([]);

  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBossStats(BOSS_DATA[currentBossIndex].stats);
    addLog(`${BOSS_DATA[currentBossIndex].name} đã xuất hiện. Hãy chuẩn bị!`, 0);
  }, [currentBossIndex]);

  useEffect(() => {
    if (battleState === 'fighting') {
      battleIntervalRef.current = setInterval(runBattleTurn, 800);
    }
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    };
  }, [battleState, bossStats, playerStats]);

  const addLog = (message: string, turn: number) => {
    const logEntry = turn > 0 ? `[Lượt ${turn}] ${message}` : message;
    setCombatLog(prevLog => [logEntry, ...prevLog]);
  };

  const showFloatingDamage = (damage: number, isPlayerHit: boolean) => {
    const id = Date.now() + Math.random();
    setDamages(prev => [...prev, { id, damage, isPlayerHit }]);
    setTimeout(() => {
      setDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  const calculateDamage = (attackerAtk: number, defenderDef: number) => {
    const baseDamage = attackerAtk * (0.8 + Math.random() * 0.4);
    return Math.max(1, Math.floor(baseDamage - defenderDef));
  };

  const runBattleTurn = () => {
    if (gameOver) return;

    setTurnCounter(currentTurn => {
        const nextTurn = currentTurn + 1;
        const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
        setBossStats(prevBoss => {
            const newHp = prevBoss.hp - playerDmg;
            addLog(`Bạn tấn công, gây ${playerDmg} sát thương.`, nextTurn);
            showFloatingDamage(playerDmg, false);
            if (newHp <= 0) {
                endGame('win', nextTurn);
                return { ...prevBoss, hp: 0 };
            }
            return { ...prevBoss, hp: newHp };
        });

        setTimeout(() => {
            if (battleIntervalRef.current) {
                const bossDmg = calculateDamage(bossStats.atk, playerStats.def);
                setPlayerStats(prevPlayer => {
                    const newHp = prevPlayer.hp - bossDmg;
                    addLog(`${currentBossData.name} phản công, gây ${bossDmg} sát thương.`, nextTurn);
                    showFloatingDamage(bossDmg, true);
                    if (newHp <= 0) {
                        endGame('lose', nextTurn);
                        return { ...prevPlayer, hp: 0 };
                    }
                    return { ...prevPlayer, hp: newHp };
                });
            }
        }, 400);

        return nextTurn;
    });
  };

  const endGame = (result: 'win' | 'lose', finalTurn: number) => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    battleIntervalRef.current = null;
    setBattleState('finished');
    setGameOver(result);
    const rewards = currentBossData.rewards || { coins: 0, energy: 0 };

    if (result === 'win') {
      addLog(`${currentBossData.name} đã bị đánh bại!`, finalTurn);
      onBattleEnd('win', rewards);
      const newEnergy = Math.min(playerInitialStats.maxEnergy, playerStats.energy + rewards.energy);
      setPlayerStats(prev => ({...prev, energy: newEnergy}));
    } else {
      addLog("Bạn đã gục ngã... THẤT BẠI!", finalTurn);
      onBattleEnd('lose', { coins: 0, energy: 0 });
    }
  };

  const startGame = () => {
    if (battleState === 'idle' && playerStats.energy >= 10) {
      setPlayerStats(prev => ({ ...prev, energy: prev.energy - 10 }));
      setBattleState('fighting');
    } else if (battleState === 'idle') {
      addLog("Không đủ năng lượng.", 0);
    }
  };

  const resetAllStateForNewBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    setPreviousCombatLog(combatLog);
    setCombatLog([]);
    setTurnCounter(0);
    setGameOver(null);
    setBattleState('idle');
    setDamages([]);
    setShowStats(false);
    setShowLogModal(false);
    setShowRewardsModal(false);
  }

  const resetGame = () => {
    resetAllStateForNewBattle();
    setCurrentBossIndex(0); // Quay về boss đầu
    setPlayerStats(prev => ({...playerInitialStats, energy: prev.energy}));
    setBossStats(BOSS_DATA[0].stats);
    setTimeout(() => addLog(`${BOSS_DATA[0].name} đã xuất hiện. Hãy chuẩn bị!`, 0), 100);
  };

  const handleNextFloor = () => {
    const nextIndex = currentBossIndex + 1;
    if(nextIndex < BOSS_DATA.length) {
      resetAllStateForNewBattle();
      setCurrentBossIndex(nextIndex);
      setPlayerStats(prev => ({...playerInitialStats, energy: prev.energy}));
    }
  }

  const skipBattle = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    let tempPlayerHp = playerStats.hp;
    let tempBossHp = bossStats.hp;
    let tempTurn = turnCounter;
    let tempCombatLog: string[] = [...combatLog].reverse();
    let winner: 'win' | 'lose' | null = null;

    while (winner === null) {
        tempTurn++;
        const playerDmg = calculateDamage(playerStats.atk, bossStats.def);
        tempBossHp -= playerDmg;
        tempCombatLog.push(`[Lượt ${tempTurn}] Bạn tấn công, gây ${playerDmg} sát thương.`);
        if (tempBossHp <= 0) { winner = 'win'; break; }

        const bossDmg = calculateDamage(bossStats.atk, playerStats.def);
        tempCombatLog.push(`[Lượt ${tempTurn}] ${currentBossData.name} phản công, gây ${bossDmg} sát thương.`);
        tempPlayerHp -= bossDmg;
        if (tempPlayerHp <= 0) { winner = 'lose'; break; }
    }
    setCombatLog(tempCombatLog.reverse());
    setPlayerStats(prev => ({ ...prev, hp: Math.max(0, tempPlayerHp) }));
    setBossStats(prev => ({ ...prev, hp: Math.max(0, tempBossHp) }));
    setTurnCounter(tempTurn);
    endGame(winner, tempTurn);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-80px); opacity: 0; } } .animate-float-up { animation: float-up 1.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
      `}</style>

      {showStats && <StatsModal player={playerStats} boss={bossStats} bossName={currentBossData.name} onClose={() => setShowStats(false)} />}
      {showLogModal && <LogModal log={previousCombatLog} onClose={() => setShowLogModal(false)} />}
      {showRewardsModal && <RewardsModal onClose={() => setShowRewardsModal(false)} rewards={currentBossData.rewards}/>}

      <div className="main-bg relative w-full min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden">
        <header className="fixed top-0 left-0 w-full z-20 p-3 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-20">
            <div className="w-full max-w-6xl mx-auto flex justify-between items-center gap-2">
                <div className="w-1/2"><h3 className="text-xl font-bold text-blue-300 text-shadow mb-1">{currentBossData.floor}</h3><HealthBar current={playerStats.hp} max={playerStats.maxHp} colorGradient="bg-gradient-to-r from-green-500 to-lime-400" shadowColor="rgba(132, 204, 22, 0.5)" /></div>
                <div className="flex items-center justify-end gap-4 w-1/2">
                    <EnergyDisplay current={playerStats.energy} max={playerStats.maxEnergy} />
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-slate-800/70 hover:bg-red-500/80 rounded-full text-slate-300 hover:text-white transition-colors text-xl font-sans flex-shrink-0" aria-label="Thoát">
                        ✕
                    </button>
                </div>
            </div>
        </header>

        <main className="w-full h-full flex flex-col justify-center items-center pt-24 p-4">
            <div className="w-full flex justify-center items-center gap-4 mb-4 h-10">
                <button onClick={() => setShowStats(true)} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md">View Stats</button>

                {battleState === 'idle' && (
                  <>
                    <button onClick={() => setShowLogModal(true)} disabled={!previousCombatLog.length} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">View Log</button>
                    <button onClick={() => setShowRewardsModal(true)} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-cyan-400 active:scale-95 shadow-md">Rewards</button>
                  </>
                )}

                {battleState === 'fighting' && (<button onClick={skipBattle} className="px-6 py-2 bg-slate-800/70 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg font-semibold text-sm transition-all duration-200 border border-slate-600 hover:border-orange-400 active:scale-95 shadow-md text-orange-300">Skip Battle</button>)}
            </div>

            {damages.map(d => (<FloatingDamage key={d.id} damage={d.damage} isPlayerHit={d.isPlayerHit} />))}

            <div className="w-full max-w-4xl flex justify-center items-center my-8">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="relative group flex justify-center">
                    {/* THÊM `select-none` VÀO ĐÂY */}
                    <h2 className="text-2xl font-bold text-red-400 text-shadow select-none">
                      BOSS
                    </h2>
                    <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-900 text-sm text-center text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {currentBossData.name.toUpperCase()}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900"></div>
                    </div>
                  </div>
                  
                  <div className="w-40 h-40 md:w-56 md:h-56"><img src={currentBossData.imageSrc} alt={currentBossData.name} className="w-full h-full object-contain" /></div>
                  <HealthBar current={bossStats.hp} max={bossStats.maxHp} colorGradient="bg-gradient-to-r from-red-600 to-orange-500" shadowColor="rgba(220, 38, 38, 0.5)" />
                </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
                {battleState === 'idle' && (
                <button onClick={startGame} disabled={playerStats.energy < 10} className="btn-shine relative overflow-hidden px-10 py-2 bg-slate-900/80 rounded-lg text-teal-300 border border-teal-500/40 transition-all duration-300 hover:text-white hover:border-teal-400 hover:shadow-[0_0_20px_theme(colors.teal.500/0.6)] active:scale-95 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-none">
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-lg tracking-widest uppercase">Fight</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400/80">
                            <span>10</span><img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-17_09-36-49-746.png" alt="" className="w-3 h-3"/>
                        </div>
                    </div>
                </button>
                )}
                {battleState !== 'idle' && (
                  <div className="mt-2 h-40 w-full bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 overflow-y-auto flex flex-col-reverse text-sm leading-relaxed scrollbar-thin font-sans">
                      {combatLog.map((entry, index) => (<p key={index} className={`mb-1 transition-colors duration-300 ${index === 0 ? 'text-yellow-300 font-bold text-shadow-sm animate-pulse' : 'text-slate-300'}`}>{entry}</p>))}
                  </div>
                )}
            </div>

            {gameOver === 'win' && (<VictoryModal onRestart={resetGame} onNextFloor={handleNextFloor} isLastBoss={currentBossIndex === BOSS_DATA.length - 1} rewards={currentBossData.rewards} />)}
            {gameOver === 'lose' && (<DefeatModal onRestart={resetGame} />)}
        </main>
      </div>
    </>
  );
}
