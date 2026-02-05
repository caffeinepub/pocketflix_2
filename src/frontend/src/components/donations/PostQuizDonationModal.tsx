import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useGetSettingsData } from '../../hooks/useQueries';

interface PostQuizDonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  totalQuestions: number;
}

export default function PostQuizDonationModal({ open, onOpenChange, score, totalQuestions }: PostQuizDonationModalProps) {
  const { data: settingsData } = useGetSettingsData();
  const donationLink = settingsData?.adminConfig?.donationLink || '';

  const handleDonate = () => {
    if (donationLink) {
      window.open(donationLink, '_blank', 'noopener,noreferrer');
    }
    onOpenChange(false);
  };

  const handleMaybeLater = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Great Job! 🎉</DialogTitle>
          <DialogDescription className="text-base">
            You scored {score} out of {totalQuestions}! 
            {score === totalQuestions && ' Perfect score!'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            Enjoying the content? Consider supporting us to help create more amazing educational videos celebrating African Heroes!
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleDonate}
            className="w-full gap-2 bg-gradient-to-r from-[var(--theme-primary,#fb8c00)] to-orange-600 hover:from-orange-600 hover:to-[var(--theme-primary,#fb8c00)] text-white font-semibold"
            disabled={!donationLink}
          >
            <Heart className="h-4 w-4 fill-current" />
            Show Some Love
          </Button>
          <Button
            onClick={handleMaybeLater}
            variant="outline"
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
