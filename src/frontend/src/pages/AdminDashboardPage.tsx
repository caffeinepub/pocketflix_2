import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DonationLinkForm from '../components/admin/DonationLinkForm';
import CategoriesManager from '../components/admin/CategoriesManager';
import VideosManager from '../components/admin/VideosManager';
import QuizzesManager from '../components/admin/QuizzesManager';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import ThemeSettingsForm from '../components/admin/ThemeSettingsForm';
import HomeContentEditor from '../components/admin/HomeContentEditor';
import HomepageVisualsForm from '../components/admin/HomepageVisualsForm';
import DashboardVisualsForm from '../components/admin/DashboardVisualsForm';
import LogoUploadForm from '../components/admin/LogoUploadForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useGetSettingsData } from '../hooks/useQueries';

export default function AdminDashboardPage() {
  const [isEditingHome, setIsEditingHome] = useState(false);
  const { data: settingsData } = useGetSettingsData();

  // Get dashboard visuals from admin config
  const dashboardVisuals = settingsData?.adminConfig?.dashboardVisuals;
  const headerBackgroundColor = dashboardVisuals?.headerBackgroundColor || 'linear-gradient(180deg, #242662 0%, #3C268E 100%)';

  return (
    <div className="min-h-screen">
      {/* Dashboard Header with configurable background */}
      <div 
        className="relative py-12"
        style={{ 
          background: headerBackgroundColor,
        }}
      >
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
            <p className="text-white/80">Manage your Pocketflix platform</p>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="donation">Donation</TabsTrigger>
              <TabsTrigger value="home">Home Page</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-6 mt-6">
              <VideosManager />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6 mt-6">
              <CategoriesManager />
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-6 mt-6">
              <QuizzesManager />
            </TabsContent>

            <TabsContent value="users" className="space-y-6 mt-6">
              <UserManagementPanel />
            </TabsContent>

            <TabsContent value="donation" className="space-y-6 mt-6">
              <DonationLinkForm />
            </TabsContent>

            <TabsContent value="home" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Home Page Content</h2>
                  <p className="text-muted-foreground">Edit the text and images on your landing page</p>
                </div>
                <Button onClick={() => setIsEditingHome(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>
              </div>
              <HomeContentEditor open={isEditingHome} onOpenChange={setIsEditingHome} />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <LogoUploadForm />
              <ThemeSettingsForm />
              <HomepageVisualsForm />
              <DashboardVisualsForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
