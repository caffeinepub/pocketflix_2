import { useGetLeaderboard } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { anonymizeUser } from '../../utils/privacy';

export default function LeaderboardSection() {
  const { data: results, isLoading } = useGetLeaderboard();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No quiz results yet. Be the first to take a quiz!</p>
        </CardContent>
      </Card>
    );
  }

  // Take top 5 results
  const topResults = results.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top 5 Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topResults.map((result, index) => (
            <div
              key={`${result.user}-${result.timestamp}`}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index === 0 && <Medal className="h-5 w-5 text-yellow-500" />}
                  {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                  {index > 2 && <span>{index + 1}</span>}
                </div>
                <div>
                  <p className="font-medium">{anonymizeUser(result.user)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(result.timestamp) / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{Number(result.score)}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
