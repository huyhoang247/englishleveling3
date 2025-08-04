// --- START OF FILE api/captions.ts (Vercel Serverless Version) ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubtitles } from 'youtube-captions-scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Lấy videoID từ query
  const { videoID } = req.query;

  if (!videoID || typeof videoID !== 'string') {
    return res.status(400).json({ error: 'Tham số videoID là bắt buộc.' });
  }

  // Set CORS headers để cho phép domain của bạn gọi API này
  res.setHeader('Access-Control-Allow-Origin', 'https://englishleveling3.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Xử lý yêu cầu OPTIONS của trình duyệt (preflight request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const subtitles = await getSubtitles({ videoID: videoID, lang: 'en' });
    return res.status(200).json(subtitles);
  } catch (error) {
    try {
      const autoGenSubtitles = await getSubtitles({ videoID: videoID, lang: 'a.en' });
      return res.status(200).json(autoGenSubtitles);
    } catch (finalError) {
      return res.status(404).json({ error: 'Không tìm thấy phụ đề cho video này.' });
    }
  }
}
// --- END OF FILE api/captions.ts (Vercel Serverless Version) ---
