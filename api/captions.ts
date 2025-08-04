// --- START OF FILE api/captions.ts (FINAL, CORRECTED VERSION) ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubtitles } from 'youtube-captions-scraper';

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

  // Đọc cookie từ biến môi trường của Vercel (nếu có)
  const cookie = process.env.YOUTUBE_COOKIE;

  try {
    // Thử lấy phụ đề 'en' (do người dùng tạo)
    const subtitles = await getSubtitles({ videoID, lang: 'en', cookie });
    return res.status(200).json(subtitles);

  } catch (error) {
    // Nếu thất bại, thử lấy phụ đề 'a.en' (tự động)
    try {
      const autoGenSubtitles = await getSubtitles({ videoID, lang: 'a.en', cookie });
      return res.status(200).json(autoGenSubtitles);
    } catch (finalError) {
      // Nếu cả hai đều thất bại, trả về lỗi
      console.error(`Không thể lấy bất kỳ phụ đề nào cho video ${videoID}:`, finalError);
      return res.status(404).json({ error: 'Không tìm thấy phụ đề cho video này.' });
    }
  }
}
// --- END OF FILE api/captions.ts (FINAL, CORRECTED VERSION) ---
