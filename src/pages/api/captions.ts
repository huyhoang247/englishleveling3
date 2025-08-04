// --- START OF FILE: src/pages/api/captions.ts (Edge Runtime Version) ---
import type { NextRequest } from 'next/server';
import { getSubtitles } from 'youtube-captions-scraper';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoID = searchParams.get('videoID');
  if (!videoID) {
    return new Response(JSON.stringify({ error: 'Tham số videoID là bắt buộc.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const subtitles = await getSubtitles({ videoID: videoID, lang: 'en' });
    return new Response(JSON.stringify(subtitles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    try {
      const autoGenSubtitles = await getSubtitles({ videoID: videoID, lang: 'a.en' });
      return new Response(JSON.stringify(autoGenSubtitles), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (finalError) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy phụ đề cho video này.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
// --- END OF FILE: src/pages/api/captions.ts (Edge Runtime Version) ---
