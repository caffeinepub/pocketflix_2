import { useGetSettingsData } from '../hooks/useQueries';
import VideoCard from '../components/videos/VideoCard';
import LeaderboardSection from '../components/leaderboard/LeaderboardSection';
import HomeContent from '../components/home/HomeContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: settingsData, isLoading } = useGetSettingsData();

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

  const videos = settingsData?.videos || [];
  const categories = settingsData?.categories || [];
  const adminConfig = settingsData?.adminConfig;

  // Group videos by category
  const videosByCategory = categories.reduce((acc, category) => {
    acc[category] = videos.filter(v => v.category === category);
    return acc;
  }, {} as Record<string, typeof videos>);

  // Get hero visuals from admin config
  const heroVisuals = adminConfig?.homepageVisuals;
  const heroImageUrl = heroVisuals?.heroImage?.getDirectURL();
  const overlayColor = heroVisuals?.backgroundColorOverlay || '#1A2C45';
  const overlayOpacity = heroVisuals?.overlayOpacity ? Number(heroVisuals.overlayOpacity) / 100 : 0.8;

  // Determine background style
  // If admin uploaded a hero image, use it; otherwise fall back to the Ankara pattern
  const backgroundStyle = heroImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(${parseInt(overlayColor.slice(1, 3), 16)}, ${parseInt(overlayColor.slice(3, 5), 16)}, ${parseInt(overlayColor.slice(5, 7), 16)}, ${overlayOpacity}), rgba(${parseInt(overlayColor.slice(1, 3), 16)}, ${parseInt(overlayColor.slice(3, 5), 16)}, ${parseInt(overlayColor.slice(5, 7), 16)}, ${overlayOpacity})), url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(rgba(${parseInt(overlayColor.slice(1, 3), 16)}, ${parseInt(overlayColor.slice(3, 5), 16)}, ${parseInt(overlayColor.slice(5, 7), 16)}, ${overlayOpacity}), rgba(${parseInt(overlayColor.slice(1, 3), 16)}, ${parseInt(overlayColor.slice(3, 5), 16)}, ${parseInt(overlayColor.slice(5, 7), 16)}, ${overlayOpacity})), url(/assets/generated/hero-bg-ankara-orange-navy-print.dim_2400x1350.png)`,
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
        <HomeContent />
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
