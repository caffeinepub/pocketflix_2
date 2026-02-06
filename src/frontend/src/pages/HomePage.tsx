import { useGetSettingsData } from '../hooks/useQueries';
import VideoCard from '../components/videos/VideoCard';
import LeaderboardSection from '../components/leaderboard/LeaderboardSection';
import HomeContent from '../components/home/HomeContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { hexToRgb, clamp } from '../utils/color';

export default function HomePage() {
  const { data: settingsData, isLoading, isError, error, refetch } = useGetSettingsData();

  if (isLoading) {
    return (
      <div className="container px-4 py-12">
        <div className="space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-destructive">Unable to Load Page</h2>
            <p className="text-muted-foreground">
              We encountered an issue loading the homepage content. Please try again.
            </p>
            {error && (
              <p className="text-sm text-muted-foreground/80">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            )}
          </div>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const videos = settingsData?.videos || [];
  const categories = settingsData?.categories || [];
  const adminConfig = settingsData?.adminConfig;

  // Group videos by category
  const videosByCategory = categories.reduce((acc, category) => {
    acc[category] = videos.filter(v => v.category === category);
    return acc;
  }, {} as Record<string, typeof videos>);

  // Get hero visuals from admin config with safe defaults
  const heroVisuals = adminConfig?.homepageVisuals;
  
  // Safely check if heroImage has getDirectURL method
  const heroImageUrl = 
    heroVisuals?.heroImage && 
    typeof heroVisuals.heroImage === 'object' && 
    'getDirectURL' in heroVisuals.heroImage &&
    typeof heroVisuals.heroImage.getDirectURL === 'function'
      ? heroVisuals.heroImage.getDirectURL()
      : null;
  
  // Use safe color parsing with fallback
  const overlayColorHex = heroVisuals?.backgroundColorOverlay || '#1A2C45';
  const { r, g, b } = hexToRgb(overlayColorHex);
  
  // Clamp opacity to safe 0-1 range
  const overlayOpacity = heroVisuals?.overlayOpacity 
    ? clamp(Number(heroVisuals.overlayOpacity) / 100, 0, 1)
    : 0.8;

  // Determine background style
  // If admin uploaded a hero image, use it; otherwise fall back to the African pattern
  const backgroundStyle = heroImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(${r}, ${g}, ${b}, ${overlayOpacity}), rgba(${r}, ${g}, ${b}, ${overlayOpacity})), url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(rgba(${r}, ${g}, ${b}, ${overlayOpacity}), rgba(${r}, ${g}, ${b}, ${overlayOpacity})), url(/assets/generated/hero-bg-african-pattern.dim_2400x1350.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };

  // Get text content from admin config
  const featuredVideosHeading = adminConfig?.homePageText || 'Featured Videos';
  const noCategoriesMessage = adminConfig?.emptyStateTitle || 'No categories available yet.';
  const noVideosMessage = adminConfig?.emptyStateMessage || 'No videos in this category yet.';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative"
        style={{ 
          ...backgroundStyle,
          minHeight: '400px'
        }}
      >
        <HomeContent 
          homeHeroHeading={adminConfig?.homeHeroHeading}
          homePageSubText={adminConfig?.homePageSubText}
          homeHeroSupportingText={adminConfig?.homeHeroSupportingText}
        />
      </div>

      {/* Main Content */}
      <div className="container px-4 py-12">
        <div className="space-y-8">
          {/* Leaderboard Section - Now at the top */}
          <div className="max-w-4xl mx-auto">
            <LeaderboardSection />
          </div>

          {/* Videos Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">{featuredVideosHeading}</h2>
              
              {categories.length === 0 ? (
                <p className="text-muted-foreground">{noCategoriesMessage}</p>
              ) : (
                <Tabs defaultValue={categories[0]} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                    {categories.map((category) => (
                      <TabsTrigger key={category} value={category}>
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {categories.map((category) => (
                    <TabsContent key={category} value={category} className="space-y-6 mt-6">
                      {videosByCategory[category]?.length === 0 ? (
                        <p className="text-muted-foreground">{noVideosMessage}</p>
                      ) : (
                        <div className="grid gap-6">
                          {videosByCategory[category]?.map((video) => (
                            <VideoCard key={video.id} video={video} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
