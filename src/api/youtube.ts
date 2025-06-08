
export interface VideoQuality {
  quality: string;
  format: string;
  size: string;
  downloadUrl: string;
  id: number;
  type: 'video' | 'audio';
  bitrate: number;
  mime: string;
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
    const qualities: VideoQuality[] = data.map((format: any) => ({
      id: format.id,
      quality: format.quality || format.format_note || 'Unknown',
      format: format.mime?.includes('mp4') ? 'MP4' : format.mime?.includes('webm') ? 'WEBM' : format.mime?.includes('audio') ? 'AUDIO' : 'MP4',
      size: format.size ? `${Math.round(format.size / 1024 / 1024)} MB` : 'Unknown',
      downloadUrl: '', // Will be fetched when downloading
      type: format.type,
      bitrate: format.bitrate || 0,
      mime: format.mime || ''
    }));

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

export const downloadVideo = async (videoId: string, qualityId: number): Promise<string> => {
  try {
    const response = await fetch(`https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_video/${videoId}?quality=${qualityId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
        'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Download request failed: ${response.status}`);
    }

    const downloadUrl = await response.text();
    console.log('Download URL:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('Download Error:', error);
    throw error;
  }
};

export const downloadAudio = async (videoId: string, qualityId: number): Promise<string> => {
  try {
    const response = await fetch(`https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_audio/${videoId}?quality=${qualityId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
        'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Audio download request failed: ${response.status}`);
    }

    const downloadUrl = await response.text();
    console.log('Audio Download URL:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('Audio Download Error:', error);
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
