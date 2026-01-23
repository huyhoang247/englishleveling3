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
  homeIcon: require("./assets/images/home-icon.webp"),
  storyIcon: require("./assets/images/story-icon.webp"),
  keyIcon: require("./assets/images/key.webp"),
  menuIcon: require("./assets/images/menu.webp"),
  shopIcon: require("./assets/images/shop-icon.webp"),
  inventoryIcon: require("./assets/images/inventory-icon.webp"),
  missionIcon: require("./assets/images/equipment-icon.webp"),
  closeIcon: require("./assets/images/close-icon.webp"),
  towerIcon: require("./assets/images/tower-icon.webp"),
  pvpIcon: require("./assets/images/pvp-icon.webp"),
  gemIcon: require("./assets/images/gems.webp"),
  vocabularyChestIcon: require("./assets/images/vocabulary-chest.webp"),
  skillIcon: require("./assets/images/skill-icon.webp"),
  backIcon: require("./assets/images/back-icon.webp"),
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
  // -- Thêm mới từ sidebar.tsx --
  awardIcon: require("./assets/images/coin.webp"),
  rankFrameIcon: require("./assets/images/rank-icon.webp"),
  luckyGameIcon: require("./assets/images/lucky-treasure.webp"),
  upgradeIcon: require("./assets/images/upgrade-icon.webp"),
  gavelIcon: require("./assets/images/auction-icon.webp"),
  checkInIcon: require("./assets/images/check-in-icon.webp"),
  // -- Thêm mới từ achievement-ui.tsx --
  masteryCardIcon: require("./assets/images/mastery-icon.webp"),
  vocaAchievementIcon: require("./assets/images/voca-achievement.webp"),
  giftBoxIcon: require("./assets/images/gift-box.webp"),
  giftBoxDisabledIcon: require("./assets/images/gift-box-grey.webp"),
};

/**
 * Tài nguyên cho màn hình Nâng cấp (Upgrade Modal)
 * (Được chuyển từ upgrade-modal.tsx sang)
 */
export const upgradeAssets = {
  upgradeButton: require("./assets/images/upgrade-button.webp"),
  failed: require("./assets/images/failed.webp"),
  success: require("./assets/images/success.webp"),
  stoneBasic: require("./assets/images/basic-stone.webp"),
  stoneIntermediate: require("./assets/images/intermediate-stone.webp"),
  stoneAdvanced: require("./assets/images/advanced-stone.webp"),
};

/**
 * Tài nguyên cho màn hình phân tích (Dashboard)
 */
export const dashboardAssets = {
  masteryIcon: require("./assets/images/mastery-icon.webp"),
  vocaJourneyIcon: require("./assets/images/voca-journey.webp"),
  dailyMissionsIcon: require("./assets/images/daily-missions.webp"),
};

/**
 * Tài nguyên cho màn hình chính của tab Quiz
 */
export const quizHomeAssets = {
  logoLarge: require("./assets/images/logo-large.webp"),
  quizIcon: require("./assets/images/quiz.webp"),
  wordChainGameIcon: require("./assets/images/word-chain-game.webp"),
  examIcon: require("./assets/images/exam.webp"),
  grammarIcon: require("./assets/images/grammar.webp"),
  multipleChoiceIcon: require("./assets/images/multiple-choice.webp"),
  fillInTheBlankIcon: require("./assets/images/fill-in-the-blank.webp"),
  vocaMatchIcon: require("./assets/images/voca-match.webp"),
};

/**
 * Tài nguyên cho các icon trong màn hình trang bị (Equipment)
 */
export const equipmentUiAssets = {
  goldIcon: require("./assets/images/coin.webp"),
  equipmentPieceIcon: require("./assets/images/equipment-piece.webp"),
  // *** THÊM MỚI: Icon cho các ô trang bị ***
  weaponIcon: require("./assets/images/weapon.webp"),
  armorIcon: require("./assets/images/armor.webp"),
  helmetIcon: require("./assets/images/helmet.webp"),
};

/**
 * Tài nguyên Nguyên liệu (Resources)
 */
export const resourceAssets = {
  wood: require("./assets/images/wood.webp"),
  leather: require("./assets/images/leather.webp"),
  ore: require("./assets/images/ore.webp"),
  cloth: require("./assets/images/cloth.webp"),
  feather: require("./assets/images/feather.webp"),
  coal: require("./assets/images/coal.webp"),
};

/**
 * Tài nguyên cho Trade Association (Hội Buôn)
 */
export const tradeAssets = {
  background: require("./assets/images/background-trade-association.webp"),
  plusIcon: require("./assets/images/plus-exchange.webp"),
  arrowIcon: require("./assets/images/arrow-down-exchange.webp"),
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
    meteorStaff: require("./assets/equipment/meteor-staff.webp"),
    assassinsDagger: require("./assets/equipment/assassins-dagger.webp"),
    sacrificialSword: require("./assets/equipment/sacrificial-sword.webp"),
    leviathanAxe: require("./assets/equipment/leviathan-axe.webp"),
    chaosStaff: require("./assets/equipment/chaos-staff.webp"),
    // Armor
    tunic: require("./assets/equipment/tunic.webp"),
    silverscalePlate: require("./assets/equipment/silverscale-plate.webp"),
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
 * Tài nguyên cho màn hình chiến đấu Boss (BossBattle)
 */
export const bossBattleAssets = {
  floorIcon: require("./assets/images/floor-icon.webp"),
  historyIcon: require("./assets/images/history-battle.webp"),
  rewardsIcon: require("./assets/images/rewards-icon.webp"),
  coinIcon: require("./assets/images/coin.webp"),
  energyIcon: require("./assets/images/energy-icon.webp"),
  victoryIcon: require("./assets/images/victory-icon.webp"),
  defeatIcon: require("./assets/images/defeat-icon.webp"),
  // *** THÊM MỚI TỪ tower-ui.tsx ***
  skipBattleIcon: require("./assets/images/skip-battle.webp"),
  sweepBattleIcon: require("./assets/images/sweep-battle.webp"),
  fightButtonIcon: require("./assets/images/fight.webp"),
  bossRewardsIcon: require("./assets/images/boss-rewards.webp"),
  towerBackground: require("./assets/images/background-tower.webp"),
};

/**
 * Tài nguyên cho mini-game Đào Mỏ (Miner Challenge)
 */
export const minerAssets = {
  bombIcon: require("./assets/images/miner-bomb.webp"),
  coinIcon: require("./assets/images/coin.webp"),
  exitIcon: require("./assets/images/floor-hole.webp"),
  pickaxeIcon: require("./assets/images/pickaxe-icon.webp"),
};

/**
 * Tài nguyên cho Nhân vật (Character/Hero)
 */
export const characterAssets = {
    heroStatic: require("./assets/images/hero.webp"),
};


/**
 * Mảng tổng hợp TẤT CẢ CÁC URL HÌNH ẢNH cần được tải trước
 * khi game bắt đầu.
 */
export const allImageUrls = [
    ...Object.values(uiAssets).filter(url => typeof url === 'string'),
    ...Object.values(upgradeAssets).filter(url => typeof url === 'string'),
    ...Object.values(dashboardAssets),
    ...Object.values(quizHomeAssets),
    ...Object.values(equipmentUiAssets),
    ...Object.values(itemAssets),
    ...Object.values(resourceAssets), // Thêm tài nguyên nguyên liệu
    ...Object.values(tradeAssets),    // Thêm tài nguyên trade
    ...Object.values(skillAssets).filter(url => typeof url === 'string'),
    ...Object.values(treasureAssets).filter(url => typeof url === 'string'),
    ...Object.values(bossBattleAssets),
    ...Object.values(minerAssets),
    ...Object.values(characterAssets), // Thêm tài nguyên nhân vật
];
