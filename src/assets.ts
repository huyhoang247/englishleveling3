// src/assets.ts

// ==================================================================
// TÀI SẢN CHO GAME CHÍNH & UI CHUNG
// ==================================================================
export const gameImageAssets = {
  keyIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/key.png",
  menuIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/right.png",
  shopIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000007f8461f98fd8bdaccb0b0f6b%20(3).png",
  inventoryIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2002_56_36%20PM.png",
  missionIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000842461f9822fc46798d5a372.png",
  blacksmithIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/ChatGPT%20Image%20Jun%202%2C%202025%2C%2003_52_48%20PM.png",
  closeIcon: "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png",
};

export const lottieAssets = {
    characterRun: "https://lottie.host/119868ca-d4f6-40e9-84e2-bf5543ce3264/5JvuqAAA0A.lottie",
};

// ==================================================================
// TÀI SẢN CHO TÚI ĐỒ (từ inventory.tsx)
// ==================================================================
export const inventoryImageAssets = {
    kiemGo: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/kiem-go.png',
    kiemSat: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000a42c61f78b535b5ca4f2e8f2.png',
    songKiem: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/inventory/file_00000000c5b061f8a19ee9d3e000e95b.png',
};

// ==================================================================
// DANH SÁCH TOÀN BỘ HÌNH ẢNH ĐỂ TẢI TRƯỚC
// ==================================================================
// Gom tất cả URL hình ảnh từ các đối tượng trên vào một mảng duy nhất
export const allImageUrls = [
    ...Object.values(gameImageAssets),
    ...Object.values(inventoryImageAssets),
];
