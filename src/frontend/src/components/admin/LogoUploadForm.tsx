import { useState, useEffect } from 'react';
import { useGetSettingsData, useUpdateLogo } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { Upload, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function LogoUploadForm() {
  const { data: settingsData } = useGetSettingsData();
  const updateLogo = useUpdateLogo();
  
  const [logo, setLogo] = useState<ExternalBlob | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settingsData?.adminConfig?.logo) {
      setLogo(settingsData.adminConfig.logo);
      setLogoPreview(settingsData.adminConfig.logo.getDirectURL());
    }
  }, [settingsData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setLogo(blob);
      setLogoPreview(URL.createObjectURL(file));
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateLogo.mutateAsync(null);
      setLogo(null);
      setLogoPreview(null);
      toast.success('Logo removed successfully!');
    } catch (error) {
      console.error('Remove logo error:', error);
      toast.error('Failed to remove logo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logo) {
      toast.error('Please upload a logo first');
      return;
    }

    try {
      await updateLogo.mutateAsync(logo);
      toast.success('Logo updated successfully!');
    } catch (error) {
      console.error('Update logo error:', error);
      toast.error('Failed to update logo');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Logo</CardTitle>
        <CardDescription>
          Upload a custom logo for your site header
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo Image</Label>
            {logoPreview ? (
              <div className="relative inline-block">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="h-32 w-auto object-contain rounded-lg border p-4 bg-white"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={handleRemoveLogo}
                  disabled={updateLogo.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center max-w-md">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="logo" className="cursor-pointer text-sm text-muted-foreground">
                  Click to upload logo
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, transparent background
                </p>
              </div>
            )}
            {isUploading && (
              <Progress value={uploadProgress} className="w-full max-w-md" />
            )}
          </div>

          {logo && !logoPreview?.startsWith('blob:') && (
            <Button type="submit" disabled={updateLogo.isPending || isUploading}>
              {updateLogo.isPending ? 'Saving...' : 'Save Logo'}
            </Button>
          )}
          
          {logoPreview?.startsWith('blob:') && (
            <Button type="submit" disabled={updateLogo.isPending || isUploading}>
              {updateLogo.isPending ? 'Saving...' : 'Save Logo'}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
