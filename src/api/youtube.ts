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
  isShort: boolean;
}

export interface ApiResponse {
  qualities: VideoQuality[];
  videoInfo: VideoInfo;
}

export const fetchVideoInfo = async (videoId: string): Promise<VideoInfo> => {
  try {
    const response = await fetch(`https://youtube-video-fast-downloader-24-7.p.rapidapi.com/get-video-info/${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
        'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Video info request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Video Info Response:', data);

    // Use the highest quality thumbnail available
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    if (data.thumbnail && Array.isArray(data.thumbnail) && data.thumbnail.length > 0) {
      // Sort thumbnails by resolution and pick the highest quality
      const sortedThumbnails = data.thumbnail.sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height));
      thumbnailUrl = sortedThumbnails[0].url;
    } else if (data.thumbnail && typeof data.thumbnail === 'string') {
      thumbnailUrl = data.thumbnail;
    }

    return {
      title: data.title || 'Unknown Title',
      thumbnail: thumbnailUrl,
      duration: data.lengthSeconds ? formatDuration(parseInt(data.lengthSeconds)) : '0:00',
      views: data.viewCount ? `${formatViews(parseInt(data.viewCount))} views` : '0 views',
      videoId: videoId,
      isShort: data.isShortsEligible || false
    };
  } catch (error) {
    console.error('Video Info Error:', error);
    throw error;
  }
};

export const fetchVideoQualities = async (videoId: string): Promise<ApiResponse> => {
  try {
    // Fetch both video info and available qualities
    const [videoInfoResponse, qualitiesResponse] = await Promise.all([
      fetchVideoInfo(videoId),
      fetch(`https://youtube-video-fast-downloader-24-7.p.rapidapi.com/get_available_quality/${videoId}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
          'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
        }
      })
    ]);

    if (!qualitiesResponse.ok) {
      throw new Error(`Qualities request failed: ${qualitiesResponse.status}`);
    }

    const qualitiesData = await qualitiesResponse.json();
    console.log('Available Qualities Response:', qualitiesData);

    // Better duplicate removal - group by type and quality, keep highest bitrate
    const qualityGroups = new Map<string, any>();
    
    qualitiesData.forEach((format: any) => {
      const key = `${format.type}-${format.quality}`;
      
      if (!qualityGroups.has(key) || format.bitrate > qualityGroups.get(key).bitrate) {
        qualityGroups.set(key, format);
      }
    });

    // Transform the unique qualities to match our interface
    const qualities: VideoQuality[] = Array.from(qualityGroups.values()).map((format: any) => ({
      id: format.id,
      quality: format.quality || 'Unknown',
      format: getFormatFromMime(format.mime),
      size: format.size ? `${Math.round(format.size / 1024 / 1024)} MB` : 'Unknown',
      downloadUrl: '', // Will be fetched when downloading
      type: format.type,
      bitrate: format.bitrate || 0,
      mime: format.mime || ''
    }));

    // Add MP3 option for audio (we'll convert from highest quality audio)
    const highestAudioQuality = qualities
      .filter(q => q.type === 'audio')
      .sort((a, b) => b.bitrate - a.bitrate)[0];

    if (highestAudioQuality) {
      qualities.push({
        id: highestAudioQuality.id,
        quality: 'High Quality',
        format: 'MP3',
        size: `${Math.round(parseInt(highestAudioQuality.size) * 0.8)} MB`, // Estimate MP3 size
        downloadUrl: '',
        type: 'audio',
        bitrate: Math.min(320, highestAudioQuality.bitrate), // Cap at 320kbps for MP3
        mime: 'audio/mp3'
      });
    }

    // Enhanced sorting: Videos by resolution (highest first), Audio by bitrate (highest first)
    qualities.sort((a, b) => {
      if (a.type === b.type) {
        if (a.type === 'video') {
          // For videos, sort by resolution quality
          const orderA = getQualityOrder(a.quality);
          const orderB = getQualityOrder(b.quality);
          if (orderA !== orderB) {
            return orderB - orderA; // Higher resolution first
          }
          // If same resolution, prefer higher bitrate
          return b.bitrate - a.bitrate;
        } else {
          // For audio, sort by bitrate (highest first)
          return b.bitrate - a.bitrate;
        }
      }
      // Videos before audio
      return a.type === 'video' ? -1 : 1;
    });

    return { qualities, videoInfo: videoInfoResponse };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const downloadVideo = async (videoId: string, qualityId: number, isShort: boolean = false): Promise<string> => {
  try {
    const endpoint = isShort ? 'download_short' : 'download_video';
    const response = await fetch(`https://youtube-video-fast-downloader-24-7.p.rapidapi.com/${endpoint}/${videoId}?quality=${qualityId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3a7e9844ffmsh5d0520e908fa6e7p1da7d9jsn9d8f1e787e46',
        'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Download request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Download Response:', data);
    
    return data.file || data.downloadUrl || '';
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

    const data = await response.json();
    console.log('Audio Download Response:', data);
    
    return data.file || data.downloadUrl || '';
  } catch (error) {
    console.error('Audio Download Error:', error);
    throw error;
  }
};

const getFormatFromMime = (mime: string): string => {
  if (!mime) return 'MP4';
  
  if (mime.includes('mp4')) return 'MP4';
  if (mime.includes('webm')) return 'WEBM';
  if (mime.includes('audio/mp4') || mime.includes('mp4a')) return 'M4A';
  if (mime.includes('opus')) return 'OPUS';
  if (mime.includes('mp3')) return 'MP3';
  
  return 'MP4';
};

const getQualityOrder = (quality: string): number => {
  const qualityMap: { [key: string]: number } = {
    '4320p': 4320, '2160p': 2160, '1440p': 1440, '1080p': 1080,
    '720p': 720, '480p': 480, '360p': 360, '240p': 240, '144p': 144,
    'High Quality': 1000 // For MP3 audio
  };
  return qualityMap[quality] || 0;
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
