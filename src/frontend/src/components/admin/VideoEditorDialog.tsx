import { useState, useEffect } from 'react';
import { useGetCategories, useAddVideo, useUpdateVideo } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Video } from '../../backend';
import { ExternalBlob } from '../../backend';

interface VideoEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: Video | null;
}

export default function VideoEditorDialog({ open, onOpenChange, video }: VideoEditorDialogProps) {
  const { data: categories } = useGetCategories();
  const addVideo = useAddVideo();
  const updateVideo = useUpdateVideo();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setCategory(video.category);
      setUrl(video.url);
    } else {
      setTitle('');
      setCategory('');
      setUrl('');
      setThumbnailFile(null);
    }
  }, [video, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category || !url.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!video && !thumbnailFile) {
      toast.error('Please select a thumbnail image');
      return;
    }

    try {
      let thumbnail: ExternalBlob;

      if (thumbnailFile) {
        const bytes = new Uint8Array(await thumbnailFile.arrayBuffer());
        thumbnail = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (video) {
        thumbnail = video.thumbnail;
      } else {
        throw new Error('No thumbnail available');
      }

      const videoId = video?.id || `video-${Date.now()}`;

      if (video) {
        await updateVideo.mutateAsync({
          id: videoId,
          title: title.trim(),
          category,
          url: url.trim(),
          thumbnail,
        });
        toast.success('Video updated successfully!');
      } else {
        await addVideo.mutateAsync({
          id: videoId,
          title: title.trim(),
          category,
          url: url.trim(),
          thumbnail,
        });
        toast.success('Video added successfully!');
      }

      onOpenChange(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Video save error:', error);
      toast.error('Failed to save video');
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{video ? 'Edit Video' : 'Add New Video'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL or Embed Code *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or video ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image {!video && '*'}</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              required={!video}
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <p className="text-sm text-muted-foreground">
                Uploading: {uploadProgress}%
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addVideo.isPending || updateVideo.isPending || (uploadProgress > 0 && uploadProgress < 100)}
            >
              {addVideo.isPending || updateVideo.isPending ? 'Saving...' : video ? 'Update Video' : 'Add Video'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
