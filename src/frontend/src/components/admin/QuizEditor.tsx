import { useState, useEffect } from 'react';
import { useGetVideos, useCreateQuiz, useUpdateQuiz } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Quiz, QuizQuestion } from '../../backend';

interface QuizEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz | null;
}

interface QuestionForm {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

export default function QuizEditor({ open, onOpenChange, quiz }: QuizEditorProps) {
  const { data: videos } = useGetVideos();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  
  const [videoId, setVideoId] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: '', answers: ['', ''], correctAnswerIndex: 0 }
  ]);

  useEffect(() => {
    if (quiz) {
      setVideoId(quiz.videoId);
      setQuestions(quiz.questions.map(q => ({
        question: q.question,
        answers: [...q.answers],
        correctAnswerIndex: Number(q.correctAnswerIndex),
      })));
    } else {
      setVideoId('');
      setQuestions([{ question: '', answers: ['', ''], correctAnswerIndex: 0 }]);
    }
  }, [quiz, open]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', answers: ['', ''], correctAnswerIndex: 0 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers.push('');
    setQuestions(updated);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].answers.length > 2) {
      updated[questionIndex].answers = updated[questionIndex].answers.filter((_, i) => i !== answerIndex);
      if (updated[questionIndex].correctAnswerIndex >= updated[questionIndex].answers.length) {
        updated[questionIndex].correctAnswerIndex = updated[questionIndex].answers.length - 1;
      }
      setQuestions(updated);
    }
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoId) {
      toast.error('Please select a video');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (q.answers.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 answers`);
        return;
      }
      if (q.answers.some(a => !a.trim())) {
        toast.error(`Question ${i + 1} has empty answers`);
        return;
      }
      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.answers.length) {
        toast.error(`Question ${i + 1} has invalid correct answer index`);
        return;
      }
    }

    try {
      const quizQuestions: QuizQuestion[] = questions.map(q => ({
        question: q.question.trim(),
        answers: q.answers.map(a => a.trim()),
        correctAnswerIndex: BigInt(q.correctAnswerIndex),
      }));

      const quizId = quiz?.id || `quiz-${Date.now()}`;

      if (quiz) {
        await updateQuiz.mutateAsync({
          id: quizId,
          videoId,
          questions: quizQuestions,
        });
        toast.success('Quiz updated successfully!');
      } else {
        await createQuiz.mutateAsync({
          id: quizId,
          videoId,
          questions: quizQuestions,
        });
        toast.success('Quiz created successfully!');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Quiz save error:', error);
      toast.error('Failed to save quiz');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video">Video *</Label>
            <Select value={videoId} onValueChange={setVideoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a video" />
              </SelectTrigger>
              <SelectContent>
                {videos?.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Questions</h3>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Question {qIndex + 1} *</Label>
                      <Input
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter question"
                        required
                      />
                    </div>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        variant="outline"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Answers (at least 2) *</Label>
                      <Button
                        type="button"
                        onClick={() => addAnswer(qIndex)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Answer
                      </Button>
                    </div>
                    {question.answers.map((answer, aIndex) => (
                      <div key={aIndex} className="flex items-center gap-2">
                        <Input
                          value={answer}
                          onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                          placeholder={`Answer ${aIndex + 1}`}
                          required
                        />
                        <Button
                          type="button"
                          onClick={() => updateQuestion(qIndex, 'correctAnswerIndex', aIndex)}
                          variant={question.correctAnswerIndex === aIndex ? 'default' : 'outline'}
                          size="sm"
                        >
                          {question.correctAnswerIndex === aIndex ? 'Correct' : 'Mark Correct'}
                        </Button>
                        {question.answers.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeAnswer(qIndex, aIndex)}
                            variant="outline"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createQuiz.isPending || updateQuiz.isPending}
            >
              {createQuiz.isPending || updateQuiz.isPending ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
