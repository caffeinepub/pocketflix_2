import { useState } from 'react';
import { useGetQuizzesByVideo } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import QuizTakingCard from './QuizTakingCard';

interface VideoQuizSectionProps {
  videoId: string;
}

export default function VideoQuizSection({ videoId }: VideoQuizSectionProps) {
  const { data: quizzes, isLoading } = useGetQuizzesByVideo(videoId);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading quizzes...
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No quiz available for this video yet.
      </div>
    );
  }

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

  if (selectedQuiz) {
    return (
      <QuizTakingCard 
        quiz={selectedQuiz} 
        onClose={() => setSelectedQuizId(null)} 
      />
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Available Quizzes
      </h4>
      <div className="space-y-2">
        {quizzes.map((quiz) => (
          <Button
            key={quiz.id}
            onClick={() => setSelectedQuizId(quiz.id)}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            Take Quiz ({quiz.questions.length} questions)
          </Button>
        ))}
      </div>
    </div>
  );
}
