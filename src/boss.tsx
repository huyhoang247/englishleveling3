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

// --- Cấu trúc dữ liệu cho 50 Tầng Boss ---
// Công thức:
// - Tầng 1: HP 100, ATK 10, DEF 6
// - Mỗi tầng sau: chỉ số tăng 30%
// - Vàng thưởng: 90% HP của boss
const BOSS_DATA = [
  {
    id: 1,
    floor: "FLOOR 1",
    name: "Slime",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 100, hp: 100, atk: 10, def: 6 },
    rewards: { coins: 90, energy: 5 }
  },
  {
    id: 2,
    floor: "FLOOR 2",
    name: "Goblin Rogue",
    imageSrc: "https://cdn.pixabay.com/photo/2023/02/02/16/21/goblin-7763261_1280.png",
    stats: { maxHp: 130, hp: 130, atk: 13, def: 8 },
    rewards: { coins: 117, energy: 5 }
  },
  {
    id: 3,
    floor: "FLOOR 3",
    name: "Orc Brute",
    imageSrc: "https://cdn.pixabay.com/photo/2023/07/04/19/22/orc-8106975_1280.png",
    stats: { maxHp: 169, hp: 169, atk: 17, def: 10 },
    rewards: { coins: 152, energy: 6 }
  },
  {
    id: 4,
    floor: "FLOOR 4",
    name: "Skeleton Warrior",
    imageSrc: "https://cdn.pixabay.com/photo/2022/03/17/04/24/knight-7073289_1280.png",
    stats: { maxHp: 220, hp: 220, atk: 22, def: 13 },
    rewards: { coins: 198, energy: 6 }
  },
  {
    id: 5,
    floor: "FLOOR 5",
    name: "Grave Bat",
    imageSrc: "https://cdn.pixabay.com/photo/2019/08/25/16/51/bat-4429538_1280.png",
    stats: { maxHp: 286, hp: 286, atk: 29, def: 17 },
    rewards: { coins: 257, energy: 7 }
  },
  {
    id: 6,
    floor: "FLOOR 6",
    name: "Shadow Imp",
    imageSrc: "https://cdn.pixabay.com/photo/2024/02/19/14/23/ai-generated-8583648_1280.png",
    stats: { maxHp: 371, hp: 371, atk: 37, def: 22 },
    rewards: { coins: 334, energy: 7 }
  },
  {
    id: 7,
    floor: "FLOOR 7",
    name: "Stone Golem",
    imageSrc: "https://cdn.pixabay.com/photo/2022/10/24/16/52/golem-7543787_1280.png",
    stats: { maxHp: 483, hp: 483, atk: 48, def: 29 },
    rewards: { coins: 435, energy: 8 }
  },
  {
    id: 8,
    floor: "FLOOR 8",
    name: "Fire Elemental",
    imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png",
    stats: { maxHp: 628, hp: 628, atk: 63, def: 38 },
    rewards: { coins: 565, energy: 8 }
  },
  {
    id: 9,
    floor: "FLOOR 9",
    name: "Ice Serpent",
    imageSrc: "https://cdn.pixabay.com/photo/2023/11/24/16/23/ai-generated-8410526_1280.png",
    stats: { maxHp: 816, hp: 816, atk: 82, def: 49 },
    rewards: { coins: 734, energy: 9 }
  },
  {
    id: 10,
    floor: "FLOOR 10",
    name: "Slime",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 1061, hp: 1061, atk: 106, def: 64 },
    rewards: { coins: 955, energy: 9 }
  },
  {
    id: 11,
    floor: "FLOOR 11",
    name: "Goblin Rogue",
    imageSrc: "https://cdn.pixabay.com/photo/2023/02/02/16/21/goblin-7763261_1280.png",
    stats: { maxHp: 1379, hp: 1379, atk: 138, def: 83 },
    rewards: { coins: 1241, energy: 10 }
  },
  {
    id: 12,
    floor: "FLOOR 12",
    name: "Orc Brute",
    imageSrc: "https://cdn.pixabay.com/photo/2023/07/04/19/22/orc-8106975_1280.png",
    stats: { maxHp: 1793, hp: 1793, atk: 179, def: 108 },
    rewards: { coins: 1614, energy: 10 }
  },
  {
    id: 13,
    floor: "FLOOR 13",
    name: "Skeleton Warrior",
    imageSrc: "https://cdn.pixabay.com/photo/2022/03/17/04/24/knight-7073289_1280.png",
    stats: { maxHp: 2331, hp: 2331, atk: 233, def: 140 },
    rewards: { coins: 2098, energy: 11 }
  },
  {
    id: 14,
    floor: "FLOOR 14",
    name: "Grave Bat",
    imageSrc: "https://cdn.pixabay.com/photo/2019/08/25/16/51/bat-4429538_1280.png",
    stats: { maxHp: 3030, hp: 3030, atk: 303, def: 182 },
    rewards: { coins: 2727, energy: 11 }
  },
  {
    id: 15,
    floor: "FLOOR 15",
    name: "Shadow Imp",
    imageSrc: "https://cdn.pixabay.com/photo/2024/02/19/14/23/ai-generated-8583648_1280.png",
    stats: { maxHp: 3939, hp: 3939, atk: 394, def: 237 },
    rewards: { coins: 3545, energy: 12 }
  },
  {
    id: 16,
    floor: "FLOOR 16",
    name: "Stone Golem",
    imageSrc: "https://cdn.pixabay.com/photo/2022/10/24/16/52/golem-7543787_1280.png",
    stats: { maxHp: 5121, hp: 5121, atk: 512, def: 308 },
    rewards: { coins: 4609, energy: 12 }
  },
  {
    id: 17,
    floor: "FLOOR 17",
    name: "Fire Elemental",
    imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png",
    stats: { maxHp: 6657, hp: 6657, atk: 666, def: 401 },
    rewards: { coins: 5991, energy: 13 }
  },
  {
    id: 18,
    floor: "FLOOR 18",
    name: "Ice Serpent",
    imageSrc: "https://cdn.pixabay.com/photo/2023/11/24/16/23/ai-generated-8410526_1280.png",
    stats: { maxHp: 8654, hp: 8654, atk: 865, def: 521 },
    rewards: { coins: 7789, energy: 13 }
  },
  {
    id: 19,
    floor: "FLOOR 19",
    name: "Lich Adept",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 11251, hp: 11251, atk: 1125, def: 677 },
    rewards: { coins: 10126, energy: 14 }
  },
  {
    id: 20,
    floor: "FLOOR 20",
    name: "Beholder Spawn",
    imageSrc: "https://cdn.pixabay.com/photo/2023/02/02/16/21/goblin-7763261_1280.png",
    stats: { maxHp: 14626, hp: 14626, atk: 1463, def: 880 },
    rewards: { coins: 13163, energy: 14 }
  },
  {
    id: 21,
    floor: "FLOOR 21",
    name: "Young Chimera",
    imageSrc: "https://cdn.pixabay.com/photo/2023/07/04/19/22/orc-8106975_1280.png",
    stats: { maxHp: 19014, hp: 19014, atk: 1901, def: 1144 },
    rewards: { coins: 17113, energy: 15 }
  },
  {
    id: 22,
    floor: "FLOOR 22",
    name: "Cave Hydra",
    imageSrc: "https://cdn.pixabay.com/photo/2022/03/17/04/24/knight-7073289_1280.png",
    stats: { maxHp: 24718, hp: 24718, atk: 2472, def: 1488 },
    rewards: { coins: 22246, energy: 15 }
  },
  {
    id: 23,
    floor: "FLOOR 23",
    name: "Abyssal Fiend",
    imageSrc: "https://cdn.pixabay.com/photo/2019/08/25/16/51/bat-4429538_1280.png",
    stats: { maxHp: 32133, hp: 32133, atk: 3213, def: 1934 },
    rewards: { coins: 28920, energy: 16 }
  },
  {
    id: 24,
    floor: "FLOOR 24",
    name: "Earth Titan",
    imageSrc: "https://cdn.pixabay.com/photo/2024/02/19/14/23/ai-generated-8583648_1280.png",
    stats: { maxHp: 41773, hp: 41773, atk: 4177, def: 2514 },
    rewards: { coins: 37596, energy: 16 }
  },
  {
    id: 25,
    floor: "FLOOR 25",
    name: "Slime",
    imageSrc: "https://cdn.pixabay.com/photo/2022/10/24/16/52/golem-7543787_1280.png",
    stats: { maxHp: 54305, hp: 54305, atk: 5431, def: 3268 },
    rewards: { coins: 48875, energy: 17 }
  },
  {
    id: 26,
    floor: "FLOOR 26",
    name: "Goblin Rogue",
    imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png",
    stats: { maxHp: 70597, hp: 70597, atk: 7060, def: 4249 },
    rewards: { coins: 63537, energy: 17 }
  },
  {
    id: 27,
    floor: "FLOOR 27",
    name: "Orc Brute",
    imageSrc: "https://cdn.pixabay.com/photo/2023/11/24/16/23/ai-generated-8410526_1280.png",
    stats: { maxHp: 91776, hp: 91776, atk: 9178, def: 5524 },
    rewards: { coins: 82598, energy: 18 }
  },
  {
    id: 28,
    floor: "FLOOR 28",
    name: "Skeleton Warrior",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 119308, hp: 119308, atk: 11931, def: 7181 },
    rewards: { coins: 107377, energy: 18 }
  },
  {
    id: 29,
    floor: "FLOOR 29",
    name: "Grave Bat",
    imageSrc: "https://cdn.pixabay.com/photo/2023/02/02/16/21/goblin-7763261_1280.png",
    stats: { maxHp: 155101, hp: 155101, atk: 15510, def: 9335 },
    rewards: { coins: 139591, energy: 19 }
  },
  {
    id: 30,
    floor: "FLOOR 30",
    name: "Shadow Imp",
    imageSrc: "https://cdn.pixabay.com/photo/2023/07/04/19/22/orc-8106975_1280.png",
    stats: { maxHp: 201631, hp: 201631, atk: 20163, def: 12136 },
    rewards: { coins: 181468, energy: 19 }
  },
  {
    id: 31,
    floor: "FLOOR 31",
    name: "Stone Golem",
    imageSrc: "https://cdn.pixabay.com/photo/2022/03/17/04/24/knight-7073289_1280.png",
    stats: { maxHp: 262120, hp: 262120, atk: 26212, def: 15777 },
    rewards: { coins: 235908, energy: 20 }
  },
  {
    id: 32,
    floor: "FLOOR 32",
    name: "Fire Elemental",
    imageSrc: "https://cdn.pixabay.com/photo/2019/08/25/16/51/bat-4429538_1280.png",
    stats: { maxHp: 340756, hp: 340756, atk: 34076, def: 20510 },
    rewards: { coins: 306680, energy: 20 }
  },
  {
    id: 33,
    floor: "FLOOR 33",
    name: "Ice Serpent",
    imageSrc: "https://cdn.pixabay.com/photo/2024/02/19/14/23/ai-generated-8583648_1280.png",
    stats: { maxHp: 442983, hp: 442983, atk: 44298, def: 26663 },
    rewards: { coins: 398685, energy: 21 }
  },
  {
    id: 34,
    floor: "FLOOR 34",
    name: "Lich Adept",
    imageSrc: "https://cdn.pixabay.com/photo/2022/10/24/16/52/golem-7543787_1280.png",
    stats: { maxHp: 575878, hp: 575878, atk: 57588, def: 34662 },
    rewards: { coins: 518290, energy: 21 }
  },
  {
    id: 35,
    floor: "FLOOR 35",
    name: "Beholder Spawn",
    imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png",
    stats: { maxHp: 748642, hp: 748642, atk: 74864, def: 45060 },
    rewards: { coins: 673778, energy: 22 }
  },
  {
    id: 36,
    floor: "FLOOR 36",
    name: "Young Chimera",
    imageSrc: "https://cdn.pixabay.com/photo/2023/11/24/16/23/ai-generated-8410526_1280.png",
    stats: { maxHp: 973234, hp: 973234, atk: 97323, def: 58578 },
    rewards: { coins: 875911, energy: 22 }
  },
  {
    id: 37,
    floor: "FLOOR 37",
    name: "Cave Hydra",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 1265204, hp: 1265204, atk: 126520, def: 76152 },
    rewards: { coins: 1138684, energy: 23 }
  },
  {
    id: 38,
    floor: "FLOOR 38",
    name: "Abyssal Fiend",
    imageSrc: "https://cdn.pixabay.com/photo/2023/02/02/16/21/goblin-7763261_1280.png",
    stats: { maxHp: 1644766, hp: 1644766, atk: 164477, def: 98997 },
    rewards: { coins: 1480289, energy: 23 }
  },
  {
    id: 39,
    floor: "FLOOR 39",
    name: "Earth Titan",
    imageSrc: "https://cdn.pixabay.com/photo/2023/07/04/19/22/orc-8106975_1280.png",
    stats: { maxHp: 2138195, hp: 2138195, atk: 213820, def: 128697 },
    rewards: { coins: 1924376, energy: 24 }
  },
  {
    id: 40,
    floor: "FLOOR 40",
    name: "Slime",
    imageSrc: "https://cdn.pixabay.com/photo/2022/03/17/04/24/knight-7073289_1280.png",
    stats: { maxHp: 2779654, hp: 2779654, atk: 277965, def: 167306 },
    rewards: { coins: 2501689, energy: 24 }
  },
  {
    id: 41,
    floor: "FLOOR 41",
    name: "Goblin Rogue",
    imageSrc: "https://cdn.pixabay.com/photo/2019/08/25/16/51/bat-4429538_1280.png",
    stats: { maxHp: 3613550, hp: 3613550, atk: 361355, def: 217497 },
    rewards: { coins: 3252195, energy: 25 }
  },
  {
    id: 42,
    floor: "FLOOR 42",
    name: "Orc Brute",
    imageSrc: "https://cdn.pixabay.com/photo/2024/02/19/14/23/ai-generated-8583648_1280.png",
    stats: { maxHp: 4697615, hp: 4697615, atk: 469762, def: 282747 },
    rewards: { coins: 4227854, energy: 25 }
  },
  {
    id: 43,
    floor: "FLOOR 43",
    name: "Skeleton Warrior",
    imageSrc: "https://cdn.pixabay.com/photo/2022/10/24/16/52/golem-7543787_1280.png",
    stats: { maxHp: 6106900, hp: 6106900, atk: 610690, def: 367571 },
    rewards: { coins: 5496210, energy: 26 }
  },
  {
    id: 44,
    floor: "FLOOR 44",
    name: "Grave Bat",
    imageSrc: "https://cdn.pixabay.com/photo/2023/05/16/09/56/dragon-7997195_1280.png",
    stats: { maxHp: 7938969, hp: 7938969, atk: 793897, def: 477842 },
    rewards: { coins: 7145072, energy: 26 }
  },
  {
    id: 45,
    floor: "FLOOR 45",
    name: "Shadow Imp",
    imageSrc: "https://cdn.pixabay.com/photo/2023/11/24/16/23/ai-generated-8410526_1280.png",
    stats: { maxHp: 10320660, hp: 10320660, atk: 1032066, def: 621195 },
    rewards: { coins: 9288594, energy: 27 }
  },
  {
    id: 46,
    floor: "FLOOR 46",
    name: "Stone Golem",
    imageSrc: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000be3061f99239c401bb72f9fd.png",
    stats: { maxHp: 13416858, hp: 13416858, atk: 1341686, def: 807553 },
    rewards: { coins: 12075172, energy: 27 }
  },
  {
    id: 47,
    floor: "FLOOR 47",
    name: "Fire Elemental",
    imageSrc: "https://cdn.pixabay.com/photo/2023/02/02/16/21/goblin-7763261_1280.png",
    stats: { maxHp: 17441916, hp: 17441916, atk: 1744192, def: 1049819 },
    rewards: { coins: 15697724, energy: 28 }
  },
  {
    id: 48,
    floor: "FLOOR 48",
    name: "Ice Serpent",
    imageSrc: "https://cdn.pixabay.com/photo/2023/07/04/19/22/orc-8106975_1280.png",
    stats: { maxHp: 22674491, hp: 22674491, atk: 2267449, def: 1364765 },
    rewards: { coins: 20407042, energy: 28 }
  },
  {
    id: 49,
    floor: "FLOOR 49",
    name: "Lich Adept",
    imageSrc: "https://cdn.pixabay.com/photo/2022/03/17/04/24/knight-7073289_1280.png",
    stats: { maxHp: 29476838, hp: 29476838, atk: 2947684, def: 1774195 },
    rewards: { coins: 26529154, energy: 29 }
  },
  {
    id: 50,
    floor: "FLOOR 50",
    name: "Beholder Spawn",
    imageSrc: "https://cdn.pixabay.com/photo/2019/08/25/16/51/bat-4429538_1280.png",
    stats: { maxHp: 38319889, hp: 38319889, atk: 3831989, def: 2306453 },
    rewards: { coins: 34487900, energy: 29 }
  },
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
    if (num >= 1000000) return `${parseFloat((num / 1000000).toFixed(1))}m`;
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
              <h3 className="text-xl font-bold text-red-400 text-shadow-sm tracking-wide">{bossName.toUpperCase()}</h3>
              <p className="text-lg">ATK: <span className="font-bold text-red-400">{boss.atk}</span></p>
              <p className="text-lg">DEF: <span className="font-bold text-sky-400">{boss.def}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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


// --- Component Modal Chiến Thắng (SỬA ĐỂ NHẬN PHẦN THƯỞNG) ---
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

// --- Component Chính Của Game (SỬA ĐỂ NHẬN PROPS) ---
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
                  <h2 className="text-2xl font-bold text-red-400 text-shadow">{currentBossData.name.toUpperCase()}</h2>
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
