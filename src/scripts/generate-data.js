// --- START OF FILE scripts/generate-data.js ---
const YouTube = require('youtube-sr').default;
const { getSubtitles } = require('youtube-captions-scraper');
const fs = require('fs');
const { sampleChannels } = require('../src/channel-data.js');

// ======================= CÀI ĐẶT =======================
const MAX_VIDEOS_PER_CHANNEL = 15; // Giới hạn số video mới nhất lấy từ mỗi kênh
const OUTPUT_VIDEO_DATA_FILE = './public/video-data.json';
const OUTPUT_CAPTIONS_DIR = './public/captions';
// =======================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateAllData() {
  console.log('Bắt đầu quá trình tạo dữ liệu...');
  const allVideos = [];

  if (!fs.existsSync(OUTPUT_CAPTIONS_DIR)) {
    fs.mkdirSync(OUTPUT_CAPTIONS_DIR, { recursive: true });
  }

  for (const channelInfo of sampleChannels) {
    console.log(`\n===== Đang xử lý kênh: ${channelInfo.id} =====`);
    try {
      const channel = await YouTube.getChannel(channelInfo.id);
      const playlist = await channel.videos.fetch(MAX_VIDEOS_PER_CHANNEL, { fetchAll: MAX_VIDEOS_PER_CHANNEL === 0 });
      console.log(`=> Tìm thấy ${playlist.length} video.`);

      for (const [index, video] of playlist.entries()) {
        if (!video || !video.id) {
            console.log(`  [${index + 1}/${playlist.length}] Video không hợp lệ, bỏ qua.`);
            continue;
        }
        console.log(`  [${index + 1}/${playlist.length}] Đang xử lý video: ${video.title}`);
        
        try {
          let captions;
          try {
            captions = await getSubtitles({ videoID: video.id, lang: 'en' });
          } catch (e) {
            captions = await getSubtitles({ videoID: video.id, lang: 'a.en' });
          }
          fs.writeFileSync(`${OUTPUT_CAPTIONS_DIR}/${video.id}.json`, JSON.stringify(captions));
          console.log(`    -> Đã lưu phụ đề cho ${video.id}.json`);

          allVideos.push({
            id: video.id,
            title: video.title || 'Không có tiêu đề',
            author: video.channel ? video.channel.name : 'Không rõ tác giả',
            thumbnailUrl: video.thumbnail ? video.thumbnail.url : '',
            category: channelInfo.category,
          });

        } catch (captionError) {
          console.error(`    !!! Không thể tải phụ đề cho video "${video.title}". Bỏ qua video này.`);
        }
        await sleep(500);
      }
    } catch (channelError) {
      console.error(`!!! Lỗi nghiêm trọng với kênh ${channelInfo.id}, bỏ qua kênh này.`, channelError.message);
    }
  }

  fs.writeFileSync(OUTPUT_VIDEO_DATA_FILE, JSON.stringify(allVideos, null, 2));
  console.log(`\n=====================================`);
  console.log(`Hoàn tất! Đã tạo file ${OUTPUT_VIDEO_DATA_FILE} với ${allVideos.length} video.`);
  console.log('=====================================');
}

generateAllData();
// --- END OF FILE scripts/generate-data.js ---
