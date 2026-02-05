import { useState } from 'react';
import { Quiz } from '../../backend';
import { useTakeQuiz } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import PostQuizDonationModal from '../donations/PostQuizDonationModal';
import { ArrowLeft } from 'lucide-react';

interface QuizTakingCardProps {
  quiz: Quiz;
  onClose: () => void;
}

export default function QuizTakingCard({ quiz, onClose }: QuizTakingCardProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const takeQuiz = useTakeQuiz();

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    // Convert answers to array in correct order
    const answersArray = quiz.questions.map((_, index) => BigInt(answers[index]));

    try {
      const result = await takeQuiz.mutateAsync({
        quizId: quiz.id,
        answers: answersArray,
      });
      setScore(Number(result));
      setShowDonationModal(true);
      toast.success(`Quiz completed! You scored ${result} out of ${quiz.questions.length}`);
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz. Please try again.');
    }
  };

  if (score !== null) {
    return (
      <>
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-primary mb-4">
                {score}/{quiz.questions.length}
              </div>
              <p className="text-lg text-muted-foreground">
                {score === quiz.questions.length && 'Perfect score! 🎉'}
                {score >= quiz.questions.length * 0.7 && score < quiz.questions.length && 'Great job! 👏'}
                {score < quiz.questions.length * 0.7 && 'Keep learning! 📚'}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </CardFooter>
        </Card>
        <PostQuizDonationModal
          open={showDonationModal}
          onOpenChange={setShowDonationModal}
          score={score}
          totalQuestions={quiz.questions.length}
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">Quiz Time!</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-3">
            <h4 className="font-semibold">
              {qIndex + 1}. {question.question}
            </h4>
            <RadioGroup
              value={answers[qIndex]?.toString()}
              onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
            >
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={aIndex.toString()} id={`q${qIndex}-a${aIndex}`} />
                  <Label htmlFor={`q${qIndex}-a${aIndex}`} className="cursor-pointer">
                    {answer}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={takeQuiz.isPending || Object.keys(answers).length !== quiz.questions.length}
          className="w-full"
        >
          {takeQuiz.isPending ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
}
