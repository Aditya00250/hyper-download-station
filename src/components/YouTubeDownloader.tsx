
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Play, Video, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QualityOption {
  quality: string;
  format: string;
  size: string;
  downloadUrl: string;
}

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchQualities = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      toast({
        title: "Error", 
        description: "Invalid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // This would be your actual API call
      const response = await fetch('/api/get-qualities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId })
      });

      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setQualities(data.qualities || []);
      setVideoInfo(data.videoInfo || {});
      
      toast({
        title: "Success",
        description: "Video qualities loaded successfully"
      });
    } catch (error) {
      // Mock data for demo
      setQualities([
        { quality: '1080p', format: 'MP4', size: '156 MB', downloadUrl: '#' },
        { quality: '720p', format: 'MP4', size: '89 MB', downloadUrl: '#' },
        { quality: '480p', format: 'MP4', size: '45 MB', downloadUrl: '#' },
        { quality: 'Audio Only', format: 'MP3', size: '12 MB', downloadUrl: '#' }
      ]);
      setVideoInfo({
        title: 'Sample Video Title',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '3:45',
        views: '1.2M views'
      });
      
      toast({
        title: "Demo Mode",
        description: "Showing sample data - API integration needed"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality: QualityOption) => {
    setDownloadProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Download Complete",
            description: `${quality.quality} ${quality.format} downloaded successfully`
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-2xl animate-glow">
              <Youtube className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
            HyperDownload
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The most advanced YouTube video downloader. Lightning fast, premium quality, unlimited downloads.
          </p>
        </div>

        {/* URL Input Section */}
        <Card className="glass-morphism border-white/20 shadow-2xl backdrop-blur-xl mb-8 max-w-4xl mx-auto">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your YouTube URL here..."
                  className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={fetchQualities}
                disabled={loading}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Get Video
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Video Info */}
        {videoInfo && (
          <Card className="glass-morphism border-white/20 shadow-2xl backdrop-blur-xl mb-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={videoInfo.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-white mb-3">{videoInfo.title}</h3>
                  <div className="flex gap-4 text-gray-300">
                    <span>{videoInfo.duration}</span>
                    <span>•</span>
                    <span>{videoInfo.views}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Download Progress */}
        {downloadProgress > 0 && downloadProgress < 100 && (
          <Card className="glass-morphism border-white/20 shadow-2xl backdrop-blur-xl mb-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Download className="w-6 h-6 text-blue-400" />
                <span className="text-white font-semibold">Downloading...</span>
              </div>
              <Progress value={downloadProgress} className="h-3" />
              <p className="text-gray-300 mt-2">{downloadProgress}% complete</p>
            </div>
          </Card>
        )}

        {/* Quality Options */}
        {qualities.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Choose Quality</h2>
            <div className="grid gap-4">
              {qualities.map((quality, index) => (
                <Card key={index} className="glass-morphism border-white/20 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                          {quality.format === 'MP3' ? (
                            <Play className="w-6 h-6 text-white" />
                          ) : (
                            <Video className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl font-bold text-white">{quality.quality}</span>
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              {quality.format}
                            </Badge>
                          </div>
                          <p className="text-gray-300">File size: {quality.size}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(quality)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group-hover:animate-pulse"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Why Choose HyperDownload?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Lightning Fast",
                description: "Download videos in seconds with our optimized servers",
                icon: "⚡"
              },
              {
                title: "High Quality",
                description: "Support for up to 4K resolution and crystal clear audio",
                icon: "🎥"
              },
              {
                title: "No Limits",
                description: "Unlimited downloads with no restrictions or watermarks",
                icon: "🚀"
              }
            ].map((feature, index) => (
              <Card key={index} className="glass-morphism border-white/20 shadow-xl backdrop-blur-xl text-center p-8 hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeDownloader;
