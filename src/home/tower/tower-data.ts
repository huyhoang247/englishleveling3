// File: src/data/bossData.ts

// --- Interface for the Boss Data Structure ---
export interface Boss {
  id: number;
  floor: string;
  name: string;
  stats: {
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
  };
}

// --- Cấu trúc dữ liệu cho các Boss theo tầng (50 Tầng) ---
const BOSS_DATA: Boss[] = [
    { id: 1, floor: "FLOOR 1", name: "Whispering Wisp", stats: { maxHp: 100, hp: 100, atk: 10, def: 6 } },
    { id: 2, floor: "FLOOR 2", name: "Emberbolt", stats: { maxHp: 120, hp: 120, atk: 12, def: 7 } },
    { id: 3, floor: "FLOOR 3", name: "Bone Scuttler", stats: { maxHp: 144, hp: 144, atk: 14, def: 9 } },
    { id: 4, floor: "FLOOR 4", name: "Shivering Spider", stats: { maxHp: 173, hp: 173, atk: 17, def: 10 } },
    { id: 5, floor: "FLOOR 5", name: "Oozing Leech", stats: { maxHp: 207, hp: 207, atk: 21, def: 12 } },
    { id: 6, floor: "FLOOR 6", name: "Murmuring Echo", stats: { maxHp: 249, hp: 249, atk: 25, def: 15 } },
    { id: 7, floor: "FLOOR 7", name: "Skyreaver", stats: { maxHp: 299, hp: 299, atk: 30, def: 18 } },
    { id: 8, floor: "FLOOR 8", name: "Sunken Gazer", stats: { maxHp: 358, hp: 358, atk: 36, def: 21 } },
    { id: 9, floor: "FLOOR 9", name: "Lurking Shade", stats: { maxHp: 430, hp: 430, atk: 43, def: 26 } },
    { id: 10, floor: "FLOOR 10", name: "Verdant Wyrm", stats: { maxHp: 516, hp: 516, atk: 52, def: 31 } },
    { id: 11, floor: "FLOOR 11", name: "Hollow Tooth", stats: { maxHp: 619, hp: 619, atk: 62, def: 37 } },
    { id: 12, floor: "FLOOR 12", name: "Zephyrling", stats: { maxHp: 743, hp: 743, atk: 74, def: 45 } },
    { id: 13, floor: "FLOOR 13", name: "Nocturnix", stats: { maxHp: 892, hp: 892, atk: 89, def: 53 } },
    { id: 14, floor: "FLOOR 14", name: "Pallid Clerk", stats: { maxHp: 1070, hp: 1070, atk: 107, def: 64 } },
    { id: 15, floor: "FLOOR 15", name: "Shambling Skeleton", stats: { maxHp: 1284, hp: 1284, atk: 128, def: 77 } },
    { id: 16, floor: "FLOOR 16", name: "Bonegleam", stats: { maxHp: 1541, hp: 1541, atk: 154, def: 92 } },
    { id: 17, floor: "FLOOR 17", name: "Flickered Marionette", stats: { maxHp: 1849, hp: 1849, atk: 185, def: 111 } },
    { id: 18, floor: "FLOOR 18", name: "Duskhound", stats: { maxHp: 2219, hp: 2219, atk: 222, def: 133 } },
    { id: 19, floor: "FLOOR 19", name: "Jade Tiger", stats: { maxHp: 2663, hp: 2663, atk: 266, def: 160 } },
    { id: 20, floor: "FLOOR 20", name: "Silverwillow", stats: { maxHp: 3195, hp: 3195, atk: 320, def: 192 } },
    { id: 21, floor: "FLOOR 21", name: "Scarlet Eyeball", stats: { maxHp: 3834, hp: 3834, atk: 383, def: 230 } },
    { id: 22, floor: "FLOOR 22", name: "Ninefathom", stats: { maxHp: 4601, hp: 4601, atk: 460, def: 276 } },
    { id: 23, floor: "FLOOR 23", name: "Wailing Child", stats: { maxHp: 5521, hp: 5521, atk: 552, def: 331 } },
    { id: 24, floor: "FLOOR 24", name: "Shardwisp", stats: { maxHp: 6626, hp: 6626, atk: 663, def: 398 } },
    { id: 25, floor: "FLOOR 25", name: "Fiendish Bat", stats: { maxHp: 7951, hp: 7951, atk: 795, def: 477 } },
    { id: 26, floor: "FLOOR 26", name: "Aquaorb", stats: { maxHp: 9541, hp: 9541, atk: 954, def: 572 } },
    { id: 27, floor: "FLOOR 27", name: "Moldering Husk", stats: { maxHp: 11449, hp: 11449, atk: 1145, def: 687 } },
    { id: 28, floor: "FLOOR 28", name: "Creeping Vine", stats: { maxHp: 13739, hp: 13739, atk: 1374, def: 824 } },
    { id: 29, floor: "FLOOR 29", name: "Venomclasp", stats: { maxHp: 16487, hp: 16487, atk: 1649, def: 989 } },
    { id: 30, floor: "FLOOR 30", name: "Veiled Mourner", stats: { maxHp: 19784, hp: 19784, atk: 1978, def: 1187 } },
    { id: 31, floor: "FLOOR 31", name: "Voidbrute", stats: { maxHp: 23741, hp: 23741, atk: 2374, def: 1424 } },
    { id: 32, floor: "FLOOR 32", name: "Sinister Jester", stats: { maxHp: 28489, hp: 28489, atk: 2849, def: 1709 } },
    { id: 33, floor: "FLOOR 33", name: "Clanking Armor", stats: { maxHp: 34187, hp: 34187, atk: 3419, def: 2051 } },
    { id: 34, floor: "FLOOR 34", name: "Fanged Crow", stats: { maxHp: 41025, hp: 41025, atk: 4102, def: 2461 } },
    { id: 35, floor: "FLOOR 35", name: "Whispered Prayer", stats: { maxHp: 49230, hp: 49230, atk: 4923, def: 2954 } },
    { id: 36, floor: "FLOOR 36", name: "Hollow Mourner", stats: { maxHp: 59075, hp: 59075, atk: 5908, def: 3545 } },
    { id: 37, floor: "FLOOR 37", name: "Unquiet Tormentor", stats: { maxHp: 70890, hp: 70890, atk: 7089, def: 4253 } },
    { id: 38, floor: "FLOOR 38", name: "Shackled Wraith", stats: { maxHp: 85068, hp: 85068, atk: 8507, def: 5104 } },
    { id: 39, floor: "FLOOR 39", name: "Frost Dragon", stats: { maxHp: 102082, hp: 102082, atk: 10208, def: 6125 } },
    { id: 40, floor: "FLOOR 40", name: "Whisperblade Assassin", stats: { maxHp: 122499, hp: 122499, atk: 12250, def: 7350 } },
    { id: 41, floor: "FLOOR 41", name: "Sandworm", stats: { maxHp: 146998, hp: 146998, atk: 14700, def: 8820 } },
    { id: 42, floor: "FLOOR 42", name: "Goblin", stats: { maxHp: 176398, hp: 176398, atk: 17640, def: 10584 } },
    { id: 43, floor: "FLOOR 43", name: "Orc", stats: { maxHp: 211678, hp: 211678, atk: 21168, def: 12701 } },
    { id: 44, floor: "FLOOR 44", name: "Sanguine Harbinger", stats: { maxHp: 254013, hp: 254013, atk: 25401, def: 15241 } },
    { id: 45, floor: "FLOOR 45", name: "Echoing Banshee", stats: { maxHp: 304816, hp: 304816, atk: 30482, def: 18289 } },
    { id: 46, floor: "FLOOR 46", name: "Cyclops", stats: { maxHp: 365779, hp: 365779, atk: 36578, def: 21947 } },
    { id: 47, floor: "FLOOR 47", name: "Plaguecaller Cultist", stats: { maxHp: 438935, hp: 438935, atk: 43893, def: 26336 } },
    { id: 48, floor: "FLOOR 48", name: "Webbed Matriarch", stats: { maxHp: 526722, hp: 526722, atk: 52672, def: 31603 } },
    { id: 49, floor: "FLOOR 49", name: "Iron Golem", stats: { maxHp: 632066, hp: 632066, atk: 63207, def: 37924 } },
    { id: 50, floor: "FLOOR 50", name: "Demonic Hoy", stats: { maxHp: 758479, hp: 758479, atk: 75848, def: 45509 } }
];

export default BOSS_DATA;
