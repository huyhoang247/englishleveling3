// --- START OF FILE api/captions.ts (Vercel Serverless Version with LOGGING) ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubtitles } from 'youtube-captions-scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoID } = req.query;

  if (!videoID || typeof videoID !== 'string') {
    return res.status(400).json({ error: 'Tham số videoID là bắt buộc.' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*'); // Tạm thời cho phép tất cả để test
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`Đang thử lấy phụ đề 'en' cho video: ${videoID}`);
    const subtitles = await getSubtitles({ videoID: videoID, lang: 'en' });
    console.log(`Thành công lấy phụ đề 'en'`);
    return res.status(200).json(subtitles);
  } catch (error) {
    // THÊM LOG Ở ĐÂY
    console.error("Lỗi khi lấy phụ đề 'en':", error); 

    try {
      console.log(`Đang thử lấy phụ đề 'a.en' cho video: ${videoID}`);
      const autoGenSubtitles = await getSubtitles({ videoID: videoID, lang: 'a.en' });
      console.log(`Thành công lấy phụ đề 'a.en'`);
      return res.status(200).json(autoGenSubtitles);
    } catch (finalError) {
      // THÊM LOG Ở ĐÂY
      console.error("Lỗi khi lấy phụ đề 'a.en':", finalError); 
      return res.status(404).json({ error: 'Không tìm thấy phụ đề cho video này.' });
    }
  }
}
// --- END OF FILE api/captions.ts (Vercel Serverless Version with LOGGING) ---
