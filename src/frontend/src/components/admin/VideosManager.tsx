import { useState } from 'react';
import { useGetVideos, useDeleteVideo } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import VideoEditorDialog from './VideoEditorDialog';
import type { Video } from '../../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function VideosManager() {
  const { data: videos, isLoading } = useGetVideos();
  const deleteVideo = useDeleteVideo();
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!videoToDelete) return;

    try {
      await deleteVideo.mutateAsync(videoToDelete);
      toast.success('Video deleted successfully!');
      setVideoToDelete(null);
    } catch (error) {
      console.error('Delete video error:', error);
      toast.error('Failed to delete video');
    }
  };

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Videos</CardTitle>
              <CardDescription>Manage your video library</CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!videos || videos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No videos yet</p>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={video.thumbnail.getDirectURL()}
                      alt={video.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-semibold">{video.title}</h4>
                      <p className="text-sm text-muted-foreground">{video.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingVideo(video)}
                      variant="outline"
                      size="icon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setVideoToDelete(video.id)}
                      variant="outline"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <VideoEditorDialog
        open={isCreating || !!editingVideo}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingVideo(null);
          }
        }}
        video={editingVideo}
      />

      <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
