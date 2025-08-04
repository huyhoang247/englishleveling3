// --- START OF FILE api/captions.ts (FIXED - dùng youtube-sr đúng cách) ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import YouTube from 'youtube-sr';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoID } = req.query;

  if (!videoID || typeof videoID !== 'string') {
    return res.status(400).json({ error: 'Tham số videoID là bắt buộc.' });
  }

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // BƯỚC 1: Lấy đối tượng video từ ID
    const video = await YouTube.getVideo(`https://www.youtube.com/watch?v=${videoID}`);
    
    if (!video) {
        return res.status(404).json({ error: 'Không tìm thấy thông tin video.' });
    }

    // BƯỚC 2: Từ đối tượng video, thử lấy phụ đề 'en'
    let captions = await video.fetchCaptions({ language: 'en' });
    
    // Nếu không có 'en', thử lấy phụ đề tự động 'a.en'
    if (!captions || captions.length === 0) {
      captions = await video.fetchCaptions({ language: 'a.en' });
    }

    // Nếu vẫn không có, trả về lỗi
    if (!captions || captions.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy phụ đề cho video này.' });
    }

    // Định dạng lại dữ liệu cho giống với code frontend đang mong đợi
    const formattedCaptions = captions.map(cap => ({
        start: (cap.start / 1000).toFixed(3),
        dur: (cap.duration / 1000).toFixed(3),
        text: cap.text
    }));

    // Trả về dữ liệu thành công
    return res.status(200).json(formattedCaptions);

  } catch (error) {
    console.error(`Lỗi nghiêm trọng khi lấy phụ đề cho ${videoID}:`, error);
    // Trả về thông báo lỗi chi tiết hơn khi debug
    return res.status(500).json({ error: 'Đã xảy ra lỗi phía server.', details: error.message });
  }
}
// --- END OF FILE api/captions.ts (FIXED - dùng youtube-sr đúng cách) ---
