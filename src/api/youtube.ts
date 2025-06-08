
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
  videoId: string;
}

export interface ApiResponse {
  qualities: VideoQuality[];
  videoInfo: VideoInfo;
}

export const fetchVideoQualities = async (videoId: string): Promise<ApiResponse> => {
  try {
    // Since we can't use Node.js https module in the browser, we'll use fetch
    const response = await fetch(`https://youtube-video-fast-downloader-24-7.p.rapidapi.com/get_available_quality/${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
        'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    // Transform the API response to match our interface
    const qualities: VideoQuality[] = data.formats?.map((format: any) => ({
      quality: format.quality || format.format_note || 'Unknown',
      format: format.ext?.toUpperCase() || 'MP4',
      size: format.filesize ? `${Math.round(format.filesize / 1024 / 1024)} MB` : 'Unknown',
      downloadUrl: format.url || '#'
    })) || [];

    const videoInfo: VideoInfo = {
      title: data.title || 'Unknown Title',
      thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: data.duration ? formatDuration(data.duration) : '0:00',
      views: data.view_count ? `${formatViews(data.view_count)} views` : '0 views',
      videoId: videoId
    };

    return { qualities, videoInfo };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};
