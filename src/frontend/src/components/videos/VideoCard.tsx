import { Video } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoQuizSection from '../quizzes/VideoQuizSection';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const { isAuthenticated, userProfile } = useCurrentUser();
  const isBlocked = userProfile?.status === 'blocked';
  
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Handle various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
        /^([a-zA-Z0-9_-]{11})$/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }
      
      // If already an embed URL, return as is
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getYouTubeEmbedUrl(video.url);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {embedUrl ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
            <iframe
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Invalid video URL</p>
          </div>
        )}
        
        {isAuthenticated && !isBlocked && (
          <VideoQuizSection videoId={video.id} />
        )}
      </CardContent>
    </Card>
  );
}
