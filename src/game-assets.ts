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
  keyIcon: require("./assets/images/key.webp"),
  menuIcon: require("./assets/images/menu.webp"),
  shopIcon: require("./assets/images/shop-icon.webp"),
  inventoryIcon: require("./assets/images/inventory-icon.webp"),
  missionIcon: require("./assets/images/mission-icon.webp"),
  closeIcon: require("./assets/images/close-icon.webp"),
  towerIcon: require("./assets/images/tower-icon.webp"),
  gemIcon: require("./assets/images/gems.webp"),
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
    mysticStaff: require("./assets/equipment/mystic-staff.webp"),
    hawkeyeBow: require("./assets/equipment/hawkeye-bow.webp"),
    nomadBow: require("./assets/equipment/nomad-bow.webp"),
    warriorsSword: require("./assets/equipment/warriors-sword.webp"),
    angelBow: require("./assets/equipment/angel-bow.webp"),
    demonKingsLongsword: require("./assets/equipment/demon-kings-long-sword.webp"),
    shadowScythe: require("./assets/equipment/shadow-scythe.webp"),
    demonKnightsSpear: require("./assets/equipment/demon-knights-spear.webp"),
    demonKingsDaggers: require("./assets/equipment/demon-kings-daggers.webp"),
    divineQuarterstaff: require("./assets/equipment/divine-quarter-staff.webp"),
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
