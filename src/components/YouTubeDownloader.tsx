
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Play, Video, Youtube, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchVideoQualities, VideoQuality, VideoInfo } from '@/api/youtube';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [qualities, setQualities] = useState<VideoQuality[]>([]);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
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
    setQualities([]);
    setVideoInfo(null);
    
    try {
      console.log('Fetching video qualities for:', videoId);
      const data = await fetchVideoQualities(videoId);
      setQualities(data.qualities);
      setVideoInfo(data.videoInfo);
      
      toast({
        title: "Success",
        description: "Video loaded successfully!"
      });
    } catch (error) {
      console.error('Error fetching video qualities:', error);
      toast({
        title: "Error",
        description: "Failed to load video. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality: VideoQuality) => {
    if (quality.downloadUrl === '#') {
      toast({
        title: "Error",
        description: "Download URL not available",
        variant: "destructive"
      });
      return;
    }

    setDownloadingQuality(quality.quality);
    setDownloadProgress(0);
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = quality.downloadUrl;
    link.download = `${videoInfo?.title || 'video'}.${quality.format.toLowerCase()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingQuality(null);
          toast({
            title: "Download Started",
            description: `${quality.quality} ${quality.format} download initiated`
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="p-4 gradient-primary rounded-2xl shadow-2xl animate-glow">
              <Youtube className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gradient mb-4 animate-fade-in">
            HyperDownload Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional YouTube video downloader with lightning-fast speeds and premium quality
          </p>
        </div>

        {/* Enhanced URL Input Section */}
        <Card className="glass-card mb-8 max-w-4xl mx-auto animate-scale-in">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your YouTube URL here..."
                  className="h-14 text-lg bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                />
              </div>
              <Button
                onClick={fetchQualities}
                disabled={loading}
                className="h-14 px-8 gradient-button text-white font-semibold text-lg shadow-xl"
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

        {/* Enhanced Video Info */}
        {videoInfo && (
          <Card className="glass-card mb-8 max-w-4xl mx-auto animate-fade-in">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={videoInfo.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-48 object-cover rounded-lg shadow-xl border border-border/50"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{videoInfo.title}</h3>
                  <div className="flex gap-4 text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {videoInfo.duration}
                    </span>
                    <span>•</span>
                    <span>{videoInfo.views}</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    Video ID: {videoInfo.videoId}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Download Progress */}
        {downloadProgress > 0 && downloadProgress < 100 && downloadingQuality && (
          <Card className="glass-card mb-8 max-w-4xl mx-auto animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Download className="w-6 h-6 text-primary" />
                <span className="text-foreground font-semibold">Downloading {downloadingQuality}...</span>
              </div>
              <Progress value={downloadProgress} className="h-3 mb-2" />
              <p className="text-muted-foreground">{downloadProgress}% complete</p>
            </div>
          </Card>
        )}

        {/* Enhanced Quality Options */}
        {qualities.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8 animate-fade-in">
              Choose Quality & Format
            </h2>
            <div className="grid gap-4">
              {qualities.map((quality, index) => (
                <Card key={index} className="glass-card hover:shadow-2xl transition-all duration-300 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 gradient-primary rounded-lg shadow-lg">
                          {quality.format === 'MP3' ? (
                            <Play className="w-6 h-6 text-white" />
                          ) : (
                            <Video className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl font-bold text-foreground">{quality.quality}</span>
                            <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground border-border/50">
                              {quality.format}
                            </Badge>
                            {quality.size !== 'Unknown' && (
                              <Badge variant="outline" className="border-primary/30 text-primary">
                                {quality.size}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">Ready for download</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(quality)}
                        disabled={quality.downloadUrl === '#'}
                        className="gradient-button text-white font-semibold px-6 py-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quality.downloadUrl === '#' ? (
                          <>
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Unavailable
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Features Section */}
        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12 animate-fade-in">
            Why Choose HyperDownload Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Lightning Fast",
                description: "Download videos in seconds with our optimized API integration",
                icon: "⚡",
                color: "from-yellow-400 to-orange-500"
              },
              {
                title: "Premium Quality",
                description: "Support for multiple formats and resolutions up to 4K",
                icon: "🎥",
                color: "from-blue-400 to-purple-500"
              },
              {
                title: "Real-time Processing",
                description: "Live API integration with instant video analysis",
                icon: "🚀",
                color: "from-green-400 to-blue-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="glass-card text-center p-8 hover:transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className={`text-4xl mb-4 p-4 rounded-full bg-gradient-to-r ${feature.color} w-20 h-20 flex items-center justify-center mx-auto shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeDownloader;
