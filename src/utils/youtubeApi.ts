
// YouTube API utility functions for server-side integration

export interface VideoQuality {
  quality: string;
  format: string;
  size: string;
  downloadUrl: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
}

export interface ApiResponse {
  qualities: VideoQuality[];
  videoInfo: VideoInfo;
}

// This function would handle the Node.js HTTP request on the server side
export const fetchVideoQualities = async (videoId: string): Promise<ApiResponse> => {
  // This is the Node.js code you provided, adapted for server-side use
  const https = require('https');
  
  const options = {
    method: 'GET',
    hostname: 'youtube-video-fast-downloader-24-7.p.rapidapi.com',
    port: null,
    path: `/get_available_quality/${videoId}`,
    headers: {
      'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
      'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res: any) {
      const chunks: Buffer[] = [];

      res.on('data', function (chunk: Buffer) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        try {
          const body = Buffer.concat(chunks);
          const data = JSON.parse(body.toString());
          
          // Transform the API response to match our interface
          const qualities: VideoQuality[] = data.qualities?.map((q: any) => ({
            quality: q.quality || 'Unknown',
            format: q.format || 'MP4',
            size: q.size || 'Unknown',
            downloadUrl: q.url || '#'
          })) || [];

          const videoInfo: VideoInfo = {
            title: data.title || 'Unknown Title',
            thumbnail: data.thumbnail || '',
            duration: data.duration || '0:00',
            views: data.views || '0 views'
          };

          resolve({ qualities, videoInfo });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Client-side function to call the API
export const getVideoQualities = async (videoId: string): Promise<ApiResponse> => {
  const response = await fetch('/api/get-qualities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch video qualities');
  }

  return response.json();
};
