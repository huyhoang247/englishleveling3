// --- START OF FILE: pages/api/captions.ts ---

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSubtitles } from 'youtube-captions-scraper';

// Handler mặc định cho API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Lấy videoID từ query của URL (ví dụ: /api/captions?videoID=some_id)
  const { videoID } = req.query;

  // 2. Kiểm tra xem videoID có được cung cấp và là một chuỗi không
  if (typeof videoID !== 'string' || !videoID) {
    return res.status(400).json({ error: 'Tham số videoID là bắt buộc.' });
  }

  // 3. Bắt đầu quá trình lấy phụ đề
  try {
    // Ưu tiên lấy phụ đề tiếng Anh (en) do người dùng tải lên (chất lượng cao nhất)
    console.log(`Đang thử lấy phụ đề 'en' cho video: ${videoID}`);
    const subtitles = await getSubtitles({ videoID: videoID, lang: 'en' });
    
    // Nếu thành công, trả về dữ liệu với status 200 (OK)
    return res.status(200).json(subtitles);

  } catch (error) {
    // 4. Xử lý lỗi: Nếu không tìm thấy phụ đề 'en'
    console.warn(`Không tìm thấy phụ đề 'en'. Đang thử lấy phụ đề tự động 'a.en'...`);
    
    try {
      // Thử lấy phụ đề tiếng Anh được tạo tự động (a.en - auto-generated English)
      const autoGenSubtitles = await getSubtitles({ videoID: videoID, lang: 'a.en' });
      
      // Nếu thành công, trả về dữ liệu
      return res.status(200).json(autoGenSubtitles);

    } catch (finalError) {
      // 5. Lỗi cuối cùng: Nếu cả hai cách đều thất bại
      console.error(`Không thể lấy bất kỳ phụ đề nào cho video ${videoID}. Lỗi:`, finalError);
      
      // Trả về lỗi 404 (Not Found) hoặc 500 để báo cho client biết
      return res.status(404).json({ error: 'Không tìm thấy phụ đề cho video này.' });
    }
  }
}
// --- END OF FILE: pages/api/captions.ts ---
