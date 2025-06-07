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
  keyIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png",
  menuIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png",
  shopIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png",
  inventoryIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png",
  missionIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png",
  blacksmithIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png",
  closeIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png",
};

/**
 * Tài nguyên cho các vật phẩm trong túi đồ
 */
export const itemAssets = {
    kiemGo: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/kiem-go.png',
    kiemSat: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000a42c61f78b535b5ca4f2e8f2.png',
    songKiem: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000c5b061f8a19ee9d3e000e95b.png',
};

/**
 * Tài nguyên Lottie Animation
 */
export const lottieAssets = {
    characterRun: "https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie",
};

/**
 * Tài nguyên cho rương báu (Treasure Chest)
 */
export const treasureAssets = {
  chestClosed: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/treasure-chest%20(1).png",
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
// --- END OF FILE game-assets.ts ---
