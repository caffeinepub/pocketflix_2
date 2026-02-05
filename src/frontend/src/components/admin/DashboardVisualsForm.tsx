import { useState, useEffect } from 'react';
import { useGetSettingsData, useUpdateDashboardVisuals } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DashboardVisualsForm() {
  const { data: settingsData } = useGetSettingsData();
  const updateDashboardVisuals = useUpdateDashboardVisuals();
  
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('linear-gradient(180deg, #242662 0%, #3C268E 100%)');
  const [accentColor, setAccentColor] = useState('#6d53ec');
  const [backgroundColorOverlay, setBackgroundColorOverlay] = useState('#1A2C45');
  const [overlayOpacity, setOverlayOpacity] = useState(80);

  useEffect(() => {
    if (settingsData?.adminConfig?.dashboardVisuals) {
      const visuals = settingsData.adminConfig.dashboardVisuals;
      setHeaderBackgroundColor(visuals.headerBackgroundColor || 'linear-gradient(180deg, #242662 0%, #3C268E 100%)');
      setAccentColor(visuals.accentColor || '#6d53ec');
      setBackgroundColorOverlay(visuals.backgroundColorOverlay || '#1A2C45');
      setOverlayOpacity(Number(visuals.overlayOpacity) || 80);
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateDashboardVisuals.mutateAsync({
        headerBackgroundColor,
        backgroundColorOverlay,
        overlayOpacity: BigInt(overlayOpacity),
        accentColor,
        headingColor: '#fff',
        secondaryHeadingColor: '#B5B0F8',
        cardBackgroundColor: '#fff',
        cardTextColor: '#333',
        cardAccentColor: accentColor,
        graphCardBackground: '#f1e6fc',
        gradientTransform: 'rotate(227deg)',
        gradientDefinition: 'linear-gradient(227deg, #3c37db 0%, #244fc6 100%)',
      });
      toast.success('Dashboard visuals updated successfully!');
    } catch (error) {
      console.error('Update dashboard visuals error:', error);
      toast.error('Failed to update dashboard visuals');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Visuals</CardTitle>
        <CardDescription>
          Customize the admin dashboard header and accent colors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headerBackgroundColor">Header Background Color/Gradient</Label>
            <Input
              id="headerBackgroundColor"
              type="text"
              value={headerBackgroundColor}
              onChange={(e) => setHeaderBackgroundColor(e.target.value)}
              placeholder="linear-gradient(180deg, #242662 0%, #3C268E 100%)"
            />
            <p className="text-xs text-muted-foreground">
              Use CSS gradient syntax or solid color
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#6d53ec"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboardOverlay">Background Overlay Color</Label>
            <div className="flex gap-2">
              <Input
                id="dashboardOverlay"
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
            <Label htmlFor="dashboardOpacity">Overlay Opacity: {overlayOpacity}%</Label>
            <Input
              id="dashboardOpacity"
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={updateDashboardVisuals.isPending}>
            {updateDashboardVisuals.isPending ? 'Saving...' : 'Save Dashboard Visuals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
