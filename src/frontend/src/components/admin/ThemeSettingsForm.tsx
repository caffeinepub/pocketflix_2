import { useState, useEffect } from 'react';
import { useGetSettingsData, useUpdateTheme } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ThemeSettingsForm() {
  const { data: settingsData } = useGetSettingsData();
  const updateTheme = useUpdateTheme();
  
  const [primaryColor, setPrimaryColor] = useState('#fb8c00');
  const [secondaryColor, setSecondaryColor] = useState('#04032e');

  useEffect(() => {
    if (settingsData?.adminConfig?.theme) {
      setPrimaryColor(settingsData.adminConfig.theme.primaryColor);
      setSecondaryColor(settingsData.adminConfig.theme.secondaryColor);
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateTheme.mutateAsync({
        primaryColor,
        secondaryColor,
      });
      toast.success('Theme updated successfully!');
    } catch (error) {
      console.error('Update theme error:', error);
      toast.error('Failed to update theme');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>
          Customize the app colors (default: orange and very dark navy blue)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color (Orange)</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#fb8c00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color (Navy Blue)</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#04032e"
              />
            </div>
          </div>

          <Button type="submit" disabled={updateTheme.isPending}>
            {updateTheme.isPending ? 'Saving...' : 'Save Theme'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
