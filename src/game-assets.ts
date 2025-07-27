// --- START OF FILE game-assets.ts (UPDATED & CENTRALIZED) ---

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
  skillIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/20250721_0918_K%E1%BB%B9%20N%C4%83ng%20R%E1%BB%B1c%20L%E1%BB%ADa_remix_01k0nc8f7je2mr0869c2fhg979.png",
  // -- Thêm mới từ lat-the.tsx --
  priceIcon: require("./assets/images/coin.webp"),
  cardCapacityIcon: require("./assets/images/card-capacity.webp"),
  // -- Thêm mới từ upgrade-stats.tsx --
  statCoinIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png",
  statHpIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000384c61f89f8572bc1cce6ca4.png",
  statAtkIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000002e7061f7aa3134f2cd28f2f5.png",
  statDefIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000255061f7915533f0d00520b8.png",
  statHeroStoneIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/Picsart_25-07-16_15-55-32-819.png",
};

/**
 * Tài nguyên cho các vật phẩm trong túi đồ
 */
export const itemAssets = {
    // Weapons
    kiemGo: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/kiem-go.png',
    kiemSat: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_00000000a42c61f78b535b5ca4f2e8f2.png',
    songKiem: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_00000000c5b061f8a19ee9d3e000e95b.png',
    nomadSword: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_000000004f0c62309cbdcc6fea779fc6.png',
    frostbiteSpear: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_0000000062ac62309ccc99e40040f892.png',
    warriorsBlade: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_0000000092d861f895a04893e27da729.png',
    giantsHammer: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2002_14_23%20PM.png',
    forestStaff: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2002_48_52%20PM.png',
    nomadStaff: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2002_37_31%20PM.png',
    mysticStaff: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2012%2C%202025%2C%2005_33_51%20PM.png',
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
    // Materials
    daCuongHoa: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_000000002bd461f7946aae1d61399a56.png',
    sat: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_00000000f5ac61f79336c38977abbfa5.png',
    go: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_000000004f0461f793d26e238db690f7.png',
    da: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_000000006f30623086e0c4e366dface0.png',
    vai: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/file_00000000863c6230a96cb9487701c9c8.png',
    thachAnh: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_51_03%20PM.png',
    ngocLucBao: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_53_08%20PM.png',
    // Pieces
    manhGhepVuKhi: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/ChatGPT%20Image%20Jun%207%2C%202025%2C%2001_37_49%20PM.png',
    manhGhepAoGiap: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2002_19_04%20PM.png',
    manhGhepHelmet: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_00_18%20PM.png',
    manhGhepGangTay: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_02_27%20PM.png',
    manhGhepGiay: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%207%2C%202025%2C%2003_08_08%20PM.png',
    manhGhepTrangSuc: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/icon/inventory/ChatGPT%20Image%20Jun%2C%202025%2C%2003_10_49%20PM.png',
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
    ...Object.values(uiAssets),
    ...Object.values(itemAssets),
    ...Object.values(treasureAssets),
];
