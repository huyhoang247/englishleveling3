// --- START OF FILE game-assets.ts ---

// ========================================================
// TRUNG TÂM QUẢN LÝ TÀI NGUYÊN GAME
// Tất cả đường dẫn đến hình ảnh, icon, lottie...
// sẽ được định nghĩa tại đây.
// ========================================================

/**
 * Tài nguyên cho giao diện người dùng chung (UI)
 * Ví dụ: icon menu, shop, nút đóng...
 */
export const uiAssets = {
  keyIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/key.png",
  menuIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/right.png",
  shopIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png",
  inventoryIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png",
  missionIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/file_00000000842461f9822fc46798d5a372.png",
  blacksmithIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/ChatGPT%20Image%20Jun%2C%202025%2C%2003_52_48%20PM.png",
  closeIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/close.png",
  towerIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/ChatGPT%20Image%20Jun%2014%2C%202025%2C%2004_53_18%20PM.png",
  gemIcon: require("./assets/images/gems.webp"),
  statsIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/stats-icon.png", // Được chuyển từ đường dẫn local
  vocabularyChestIcon: require("./assets/images/vocabulary-chest.webp"),
  skillIcon: require("./assets/images/skill-icon.webp"),
  // -- Thêm mới từ lat-the.tsx --
  priceIcon: require("./assets/images/coin.webp"),
  cardCapacityIcon: require("./assets/images/card-capacity.webp"),
  // -- Thêm mới từ upgrade-stats.tsx --
  statCoinIcon: require("./assets/images/coin.webp"),
  statHpIcon: require("./assets/images/stats-hp.webp"),
  statAtkIcon: require("./assets/images/stats-atk.webp"),
  statDefIcon: require("./assets/images/stats-def.webp"),
  statHeroStoneIcon: require("./assets/images/character-stone.webp"),
  // -- Thêm mới từ skill.tsx & skill-data.tsx --
  bookIcon: require("./assets/images/ancient-book.webp"),
  goldIcon: require("./assets/images/coin.webp"),
};

/**
 * Tài nguyên cho các icon trong màn hình trang bị (Equipment)
 */
export const equipmentUiAssets = {
  goldIcon: require("./assets/images/coin.webp"),
  equipmentPieceIcon: require("./assets/images/equipment-piece.webp"),
};


/**
 * Tài nguyên cho các vật phẩm trong túi đồ
 */ 
export const itemAssets = {
    // Weapons
    nomadSword: require("./assets/equipment/nomad-sword‎.webp"),
    frostbiteSpear: require("./assets/equipment/frost-bite-spear.webp"),
    warriorsBlade: require("./assets/equipment/warriors-blade.webp"),
    giantsHammer: require("./assets/equipment/giants-hammer.webp"),
    forestStaff: require("./assets/equipment/forest-staff.webp"),
    nomadStaff: require("./assets/equipment/nomad-staff.webp"),
    mysticStaff: require("./assets/equipment/mystic-staff.webp),
    hawkeyeBow: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2006_00_39%20PM.png',
    nomadBow: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2006_10_10%20PM.png',
    warriorsSword: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2006_19_37%20PM.png',
    angelBow: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2006_49_43%20PM.png',
    demonKingsLongsword: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2007_06_43%20PM.png',
    shadowScythe: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2007_46_39%20PM.png',
    demonKnightsSpear: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2008_06_40%20PM.png',
    demonKingsDaggers: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2008_14_19%20PM.png',
    divineQuarterstaff: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2008_23_51%20PM.png',
    meteorStaff: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2010_44_50%20AM.png',
    assassinsDagger: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2012_29_58%20PM.png',
    sacrificialSword: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2009_26_47%20PM.png',
    leviathanAxe: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2013%2C%202025%2C%2008_56_07%20PM.png',
    chaosStaff: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2015%2C%202025%2C%2011_20_02%20AM.png',
    // Armor
    hardArmor: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2002_26_49%20PM.png',
    tunic: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_000000001ca461f5a50bac51456de65a.png',
    silverscalePlate: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2004_11_48%20PM.png',
    dragonsBreathArmor: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2006_42_28%20PM.png',
    
};

/**
 * Tài nguyên cho các kỹ năng (Skills)
 */
export const skillAssets = {
    lifeSteal: require("./assets/images/life-steal-skill.webp"),
    thorns: require("./assets/images/thorns-skill.webp"),
    damageBoost: require("./assets/images/damage-boost.webp"),
    armorPenetration: require("./assets/images/armor-penetration.webp"),
};

/**
 * Tài nguyên Lottie Animation
 */
export const lottieAssets = {
    characterRun: "https://lottie.host/128a87c3-c0c8-4b6f-a9da-096df89982ae/C2nyhBkBTN.lottie",
};

/**
 * Tài nguyên cho rương báu (Treasure Chest)
 */
export const treasureAssets = {
  chestClosed: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/treasure-chest%20(1).png",
  // -- Thêm mới từ lat-the.tsx: Hình ảnh các loại rương từ vựng --
  chestBasic: require("./assets/images/chest-basic.webp"),
  chestElementary: require("./assets/images/chest-elementary.webp"),
  chestIntermediate: require("./assets/images/chest-intermediate.webp"),
  chestAdvanced: require("./assets/images/chest-advanced.webp"),
  chestMaster: require("./assets/images/chest-master.webp"),
};


/**
 * Mảng tổng hợp TẤT CẢ CÁC URL HÌNH ẢNH cần được tải trước
 * khi game bắt đầu.
 */
export const allImageUrls = [
    ...Object.values(uiAssets).filter(url => typeof url === 'string'),
    ...Object.values(equipmentUiAssets),
    ...Object.values(itemAssets),
    ...Object.values(skillAssets).filter(url => typeof url === 'string'),
    ...Object.values(treasureAssets).filter(url => typeof url === 'string'),
];

// --- END OF FILE game-assets.ts ---
