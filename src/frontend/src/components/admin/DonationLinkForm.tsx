import { useState, useEffect } from 'react';
import { useGetSettingsData, useUpdateDonationLink } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DonationLinkForm() {
  const { data: settingsData } = useGetSettingsData();
  const updateDonationLink = useUpdateDonationLink();
  const [link, setLink] = useState('');

  useEffect(() => {
    if (settingsData?.adminConfig?.donationLink) {
      setLink(settingsData.adminConfig.donationLink);
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateDonationLink.mutateAsync(link);
      toast.success('Donation link updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update donation link');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Link</CardTitle>
        <CardDescription>
          Configure the Selar donation link for the "Show Some Love" button
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donationLink">Selar Payment Link</Label>
            <Input
              id="donationLink"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://selar.co/your-link"
            />
          </div>
          <Button type="submit" disabled={updateDonationLink.isPending}>
            {updateDonationLink.isPending ? 'Saving...' : 'Save Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
