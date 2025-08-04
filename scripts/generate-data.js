// --- START OF FILE scripts/generate-data.js (FINAL, FIXED PATH FOR SCRIPTS FOLDER) ---

// === DÒNG CODE MỚI ĐỂ SỬA LỖI FETCH ===
global.fetch = require('node-fetch');
// ======================================

const YouTube = require('youtube-sr').default;
const { getSubtitles } = require('youtube-captions-scraper');
const fs = require('fs');

// *** DÒNG NÀY ĐÃ ĐƯỢC SỬA ***
// Đi ra khỏi thư mục 'scripts' rồi mới vào 'src'
const { sampleChannels } = require('../src/channel-data.js'); 

// ======================= CÀI ĐẶT =======================
const MAX_VIDEOS_PER_CHANNEL = 15;
// Sửa lại đường dẫn output để nó cũng bắt đầu từ thư mục gốc
const OUTPUT_VIDEO_DATA_FILE = './public/video-data.json';
const OUTPUT_CAPTIONS_DIR = './public/captions';
// =======================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getChannelIdFromUrl(url) {
    if (url.includes('@')) return url;
    const match = url.match(/(channel\/|c\/|user\/)([^/]+)/);
    return match ? match[2] : url;
}

async function generateAllData() {
  console.log('Bắt đầu quá trình tạo dữ liệu...');
  const allVideos = [];
  let successCount = 0;
  let skippedCount = 0;

  if (!fs.existsSync(OUTPUT_CAPTIONS_DIR)) {
    fs.mkdirSync(OUTPUT_CAPTIONS_DIR, { recursive: true });
  }

  for (const channelInfo of sampleChannels) {
    console.log(`\n===== Đang xử lý kênh: ${channelInfo.id} =====`);
    try {
      const searchResult = await YouTube.search(getChannelIdFromUrl(channelInfo.id), { limit: 1, type: 'channel' });
      const channel = searchResult[0];

      if (!channel) {
        throw new Error(`Không tìm thấy kênh với ID/URL: ${channelInfo.id}`);
      }
      
      const playlist = await channel.videos.fetch(MAX_VIDEOS_PER_CHANNEL, { fetchAll: MAX_VIDEOS_PER_CHANNEL === 0 });
      console.log(`=> Tìm thấy ${playlist.length} video cho kênh "${channel.name}".`);

      for (const [index, video] of playlist.entries()) {
        if (!video || !video.id) {
            console.log(`  [${index + 1}/${playlist.length}] Video không hợp lệ, bỏ qua.`);
            skippedCount++;
            continue;
        }
        console.log(`  [${index + 1}/${playlist.length}] Đang xử lý video: ${video.title}`);
        
        try {
          const captions = await getSubtitles({ videoID: video.id, lang: 'en' });
          console.log(`    -> OK: Tìm thấy phụ đề tiếng Anh chuẩn.`);

          fs.writeFileSync(`${OUTPUT_CAPTIONS_DIR}/${video.id}.json`, JSON.stringify(captions));
          
          allVideos.push({
            id: video.id,
            title: video.title || 'Không có tiêu đề',
            author: video.channel ? video.channel.name : 'Không rõ tác giả',
            thumbnailUrl: video.thumbnail ? video.thumbnail.url : '',
            category: channelInfo.category,
          });
          successCount++;

        } catch (error) {
          console.log(`    -> BỎ QUA: Không có phụ đề tiếng Anh chuẩn.`);
          skippedCount++;
        }
        
        await sleep(500);
      }
    } catch (channelError) {
      console.error(`!!! Lỗi nghiêm trọng với kênh ${channelInfo.id}, bỏ qua kênh này.`, channelError.message);
    }
  }

  try {
      if (fs.existsSync(OUTPUT_CAPTIONS_DIR)) {
        const existingCaptionFiles = fs.readdirSync(OUTPUT_CAPTIONS_DIR);
        const newVideoIds = new Set(allVideos.map(v => `${v.id}.json`));
        for (const file of existingCaptionFiles) {
            if (!newVideoIds.has(file)) {
                fs.unlinkSync(`${OUTPUT_CAPTIONS_DIR}/${file}`);
                console.log(`Đã xóa file phụ đề cũ: ${file}`);
            }
        }
      }
  } catch (cleanupError) {
      console.error("Lỗi khi dọn dẹp file cũ:", cleanupError);
  }

  fs.writeFileSync(OUTPUT_VIDEO_DATA_FILE, JSON.stringify(allVideos, null, 2));
  console.log(`\n=====================================`);
  console.log(`Hoàn tất!`);
  console.log(`- Đã thêm vào danh sách: ${successCount} video.`);
  console.log(`- Đã bỏ qua: ${skippedCount} video.`);
  console.log(`=> Đã tạo file ${OUTPUT_VIDEO_DATA_FILE}`);
  console.log('=====================================');
}

generateAllData();
// --- END OF FILE scripts/generate-data.js (FINAL, FIXED PATH FOR SCRIPTS FOLDER) ---
