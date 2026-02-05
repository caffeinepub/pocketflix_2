import { useState, useEffect } from 'react';
import { useGetSettingsData, useUpdateHomePageTextExtended } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HomeContentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HomeContentEditor({ open, onOpenChange }: HomeContentEditorProps) {
  const { data: settingsData } = useGetSettingsData();
  const updateHomePageText = useUpdateHomePageTextExtended();
  
  const [homeHeroHeading, setHomeHeroHeading] = useState('');
  const [homePageSubText, setHomePageSubText] = useState('');
  const [homeHeroSupportingText, setHomeHeroSupportingText] = useState('');
  const [featuredVideosHeading, setFeaturedVideosHeading] = useState('');
  const [noCategoriesMessage, setNoCategoriesMessage] = useState('');
  const [noVideosMessage, setNoVideosMessage] = useState('');

  useEffect(() => {
    if (settingsData?.adminConfig) {
      const config = settingsData.adminConfig;
      setHomeHeroHeading(config.homeHeroHeading || 'Learn on Your Terms');
      setHomePageSubText(config.homePageSubText || 'Video-based learning for students and lifelong learners.');
      setHomeHeroSupportingText(config.homeHeroSupportingText || 'Short video lessons designed for busy people. No stress, just effective learning at your pace.');
      setFeaturedVideosHeading(config.homePageText || 'Featured Videos');
      setNoCategoriesMessage(config.emptyStateTitle || 'No categories available yet.');
      setNoVideosMessage(config.emptyStateMessage || 'No videos in this category yet.');
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateHomePageText.mutateAsync({
        homeHeroHeading,
        homePageSubText,
        homeHeroSupportingText,
        featuredVideosHeading,
        noCategoriesMessage,
        noVideosMessage,
      });
      toast.success('Home page content updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update home page content');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Home Page Content</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="homeHeroHeading">Hero Main Heading</Label>
              <Input
                id="homeHeroHeading"
                value={homeHeroHeading}
                onChange={(e) => setHomeHeroHeading(e.target.value)}
                placeholder="Learn on Your Terms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homePageSubText">Hero Middle Text</Label>
              <Textarea
                id="homePageSubText"
                value={homePageSubText}
                onChange={(e) => setHomePageSubText(e.target.value)}
                placeholder="Video-based learning for students and lifelong learners."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeHeroSupportingText">Hero Supporting Text</Label>
              <Textarea
                id="homeHeroSupportingText"
                value={homeHeroSupportingText}
                onChange={(e) => setHomeHeroSupportingText(e.target.value)}
                placeholder="Short video lessons designed for busy people..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredVideosHeading">Featured Videos Section Heading</Label>
              <Input
                id="featuredVideosHeading"
                value={featuredVideosHeading}
                onChange={(e) => setFeaturedVideosHeading(e.target.value)}
                placeholder="Featured Videos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noCategoriesMessage">No Categories Message</Label>
              <Input
                id="noCategoriesMessage"
                value={noCategoriesMessage}
                onChange={(e) => setNoCategoriesMessage(e.target.value)}
                placeholder="No categories available yet."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noVideosMessage">No Videos in Category Message</Label>
              <Input
                id="noVideosMessage"
                value={noVideosMessage}
                onChange={(e) => setNoVideosMessage(e.target.value)}
                placeholder="No videos in this category yet."
              />
            </div>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateHomePageText.isPending}>
            {updateHomePageText.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
