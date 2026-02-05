import { useGetSettingsData } from '../../hooks/useQueries';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import HomeContentEditor from '../admin/HomeContentEditor';

export default function HomeContent() {
  const { data: settingsData } = useGetSettingsData();
  const { isAdmin } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);

  const adminConfig = settingsData?.adminConfig;
  const homeHeroHeading = adminConfig?.homeHeroHeading || 'Learn on Your Terms';
  const homePageSubText = adminConfig?.homePageSubText || 'Video-based learning for students and lifelong learners.';
  const homeHeroSupportingText = adminConfig?.homeHeroSupportingText || 'Short video lessons designed for busy people. No stress, just effective learning at your pace.';

  return (
    <div className="relative">
      <div className="container px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
            {homeHeroHeading}
          </h1>
          <p className="text-xl text-white/95 max-w-2xl mx-auto font-medium">
            {homePageSubText}
          </p>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            {homeHeroSupportingText}
          </p>
          
          {isAdmin && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
              Edit Home Content
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <HomeContentEditor
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
    </div>
  );
}
