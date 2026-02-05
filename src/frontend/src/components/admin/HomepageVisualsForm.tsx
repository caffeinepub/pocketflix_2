import { useState, useEffect } from 'react';
import { useGetSettingsData, useUpdateHomepageVisuals } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { Upload, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function HomepageVisualsForm() {
  const { data: settingsData } = useGetSettingsData();
  const updateHomepageVisuals = useUpdateHomepageVisuals();
  
  const [heroBackgroundColor, setHeroBackgroundColor] = useState('linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)');
  const [heroImage, setHeroImage] = useState<ExternalBlob | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [backgroundColorOverlay, setBackgroundColorOverlay] = useState('#1A2C45');
  const [overlayOpacity, setOverlayOpacity] = useState(80);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settingsData?.adminConfig?.homepageVisuals) {
      const visuals = settingsData.adminConfig.homepageVisuals;
      setHeroBackgroundColor(visuals.heroBackgroundColor || 'linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)');
      setBackgroundColorOverlay(visuals.backgroundColorOverlay || '#1A2C45');
      setOverlayOpacity(Number(visuals.overlayOpacity) || 80);
      
      // Clear state when no hero image exists in settings
      if (visuals.heroImage) {
        setHeroImage(visuals.heroImage);
        setHeroImagePreview(visuals.heroImage.getDirectURL());
      } else {
        setHeroImage(null);
        setHeroImagePreview(null);
      }
    }
  }, [settingsData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      
      setHeroImage(blob);
      setHeroImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setHeroImage(null);
    setHeroImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateHomepageVisuals.mutateAsync({
        heroBackgroundColor,
        heroImage: heroImage || undefined,
        backgroundColorOverlay,
        overlayOpacity: BigInt(overlayOpacity),
        headingColor: '#fff',
        supportingTextColor: '#ebecfe',
        headingShadowColor: '#1b3379',
        subtitleColor: '#eef2ff',
        cardBackgroundColor: '#fff',
        cardTextColor: '#333',
        buttonColor: '#fff',
        buttonTextColor: '#6d53ec',
        bannerBackgroundColor: '#f1e6fc',
      });
      toast.success('Homepage visuals updated successfully!');
    } catch (error) {
      console.error('Update homepage visuals error:', error);
      toast.error('Failed to update homepage visuals');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Visuals</CardTitle>
        <CardDescription>
          Customize the hero section background image and colors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="heroImage">Hero Background Image</Label>
            {heroImagePreview ? (
              <div className="relative">
                <img 
                  src={heroImagePreview} 
                  alt="Hero preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="heroImage" className="cursor-pointer text-sm text-muted-foreground">
                  Click to upload hero image
                </Label>
                <Input
                  id="heroImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
            {isUploading && (
              <Progress value={uploadProgress} className="w-full" />
            )}
            <p className="text-xs text-muted-foreground">
              If no image is uploaded, the default Ankara pattern will be used
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroBackgroundColor">Hero Background Color/Gradient</Label>
            <Input
              id="heroBackgroundColor"
              type="text"
              value={heroBackgroundColor}
              onChange={(e) => setHeroBackgroundColor(e.target.value)}
              placeholder="linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)"
            />
            <p className="text-xs text-muted-foreground">
              Use CSS gradient syntax or solid color (e.g., #ff9500)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColorOverlay">Overlay Color (for image)</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColorOverlay"
                type="color"
                value={backgroundColorOverlay}
                onChange={(e) => setBackgroundColorOverlay(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={backgroundColorOverlay}
                onChange={(e) => setBackgroundColorOverlay(e.target.value)}
                placeholder="#1A2C45"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overlayOpacity">Overlay Opacity: {overlayOpacity}%</Label>
            <Input
              id="overlayOpacity"
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={updateHomepageVisuals.isPending || isUploading}>
            {updateHomepageVisuals.isPending ? 'Saving...' : 'Save Homepage Visuals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
