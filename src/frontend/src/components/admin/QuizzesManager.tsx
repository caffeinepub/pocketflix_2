import { useState } from 'react';
import { useGetAllQuizzes, useGetVideos, useDeleteQuiz } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import QuizEditor from './QuizEditor';
import type { Quiz } from '../../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function QuizzesManager() {
  const { data: quizzes, isLoading: quizzesLoading } = useGetAllQuizzes();
  const { data: videos } = useGetVideos();
  const deleteQuiz = useDeleteQuiz();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuiz.mutateAsync(quizToDelete);
      toast.success('Quiz deleted successfully!');
      setQuizToDelete(null);
    } catch (error) {
      console.error('Delete quiz error:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const getVideoTitle = (videoId: string) => {
    const video = videos?.find(v => v.id === videoId);
    return video?.title || videoId;
  };

  if (quizzesLoading) {
    return <div>Loading quizzes...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quizzes</CardTitle>
              <CardDescription>Manage quizzes for your videos</CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!quizzes || quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quizzes yet</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <h4 className="font-semibold">{getVideoTitle(quiz.videoId)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingQuiz(quiz)}
                      variant="outline"
                      size="icon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setQuizToDelete(quiz.id)}
                      variant="outline"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuizEditor
        open={isCreating || !!editingQuiz}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingQuiz(null);
          }
        }}
        quiz={editingQuiz}
      />

      <AlertDialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
