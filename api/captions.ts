// --- START OF FILE api/captions.ts (dùng youtube-sr) ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import YouTube from 'youtube-sr';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoID } = req.query;

  if (!videoID || typeof videoID !== 'string') {
    return res.status(400).json({ error: 'Tham số videoID là bắt buộc.' });
  }

  // CORS Headers để cho phép frontend gọi API
  res.setHeader('Access-Control-Allow-Origin', '*'); // Cho phép mọi domain, có thể đổi thành domain của bạn sau
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Thử lấy phụ đề tiếng Anh trước
    let captions = await YouTube.getVideoCaptions(videoID, { language: 'en' });
    
    // Nếu không có, thử lấy phụ đề tự động
    if (!captions || captions.length === 0) {
      captions = await YouTube.getVideoCaptions(videoID, { language: 'a.en' });
    }

    if (!captions || captions.length === 0) {
      // Nếu vẫn không có, trả về lỗi 404
      return res.status(404).json({ error: 'Không tìm thấy phụ đề cho video này.' });
    }

    // Định dạng lại dữ liệu cho giống với thư viện cũ để frontend không bị ảnh hưởng
    const formattedCaptions = captions.map(cap => ({
        start: (cap.start / 1000).toFixed(3), // Chuyển từ mili-giây sang giây
        dur: (cap.duration / 1000).toFixed(3),
        text: cap.text
    }));

    // Trả về dữ liệu thành công
    return res.status(200).json(formattedCaptions);

  } catch (error) {
    console.error(`Lỗi nghiêm trọng khi lấy phụ đề cho ${videoID}:`, error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi phía server khi xử lý yêu cầu.' });
  }
}
// --- END OF FILE api/captions.ts (dùng youtube-sr) ---
