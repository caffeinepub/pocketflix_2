import { useGetSettingsData } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function ShowSomeLoveButton() {
  const { data: settingsData } = useGetSettingsData();
  
  const donationLink = settingsData?.adminConfig?.donationLink || '';
  const hasLink = donationLink.trim().length > 0;

  const handleClick = () => {
    if (hasLink) {
      window.open(donationLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!hasLink}
      className="gap-2 bg-gradient-to-r from-[var(--theme-primary,#fb8c00)] to-orange-600 hover:from-orange-600 hover:to-[var(--theme-primary,#fb8c00)] text-white font-semibold shadow-lg"
      size="sm"
    >
      <Heart className="h-4 w-4 fill-current" />
      Show Some Love
    </Button>
  );
}
