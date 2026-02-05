import { useGetMyQuizResults } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function AccountPage() {
  const { data: myResults, isLoading } = useGetMyQuizResults();

  return (
    <div className="container px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">View your quiz history and achievements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              My Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading results...</p>
            ) : !myResults || myResults.length === 0 ? (
              <p className="text-muted-foreground">You haven't taken any quizzes yet. Start learning!</p>
            ) : (
              <div className="space-y-3">
                {myResults.map((result, index) => (
                  <div
                    key={`${result.quizId}-${result.timestamp}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Quiz #{index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Number(result.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl text-primary">{Number(result.score)}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
