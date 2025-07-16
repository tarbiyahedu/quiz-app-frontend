import Link from "next/link"
import { Button } from "@/components/ui/button"
import { demoQuizzes } from "@/lib/utils"

export default async function QuizResultsPage({ params }: any) {
  // In a real app, we would fetch the quiz and results data from the backend
  const quiz = demoQuizzes.find((q) => q.id === params.id)

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // Demo results data
  const results = {
    score: 85,
    totalPoints: 100,
    correctAnswers: 8,
    totalQuestions: 10,
    timeTaken: "12:45",
    averageScore: 75,
    rank: 3,
    totalParticipants: 25,
    questionStats: [
      { correct: 20, incorrect: 5 },
      { correct: 18, incorrect: 7 },
      { correct: 22, incorrect: 3 },
      { correct: 15, incorrect: 10 },
      { correct: 19, incorrect: 6 },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-2xl font-bold">
              QuizMaster
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Download Results</Button>
            <Button variant="ghost">Share Results</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Quiz Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>

          {/* Results Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Your Score
              </h3>
              <div className="text-3xl font-bold">{results.score}%</div>
              <div className="text-sm text-muted-foreground">
                {results.correctAnswers} of {results.totalQuestions} correct
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Time Taken
              </h3>
              <div className="text-3xl font-bold">{results.timeTaken}</div>
              <div className="text-sm text-muted-foreground">
                Out of {quiz.timeLimit / 60} minutes
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Rank
              </h3>
              <div className="text-3xl font-bold">
                #{results.rank} of {results.totalParticipants}
              </div>
              <div className="text-sm text-muted-foreground">
                Top {Math.round((results.rank / results.totalParticipants) * 100)}%
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Class Average
              </h3>
              <div className="text-3xl font-bold">{results.averageScore}%</div>
              <div className="text-sm text-muted-foreground">
                {results.totalParticipants} participants
              </div>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Question Analysis</h2>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <span
                      className={`text-sm font-medium ${
                        question.correctAnswer === 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {question.correctAnswer === 0 ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{question.text}</p>
                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-3 rounded-lg border p-3 ${
                          optionIndex === question.correctAnswer
                            ? "border-green-500 bg-green-50"
                            : optionIndex === 0
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      >
                        <span className="flex-1">{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <span className="text-sm text-green-600">Correct Answer</span>
                        )}
                        {optionIndex === 0 && optionIndex !== question.correctAnswer && (
                          <span className="text-sm text-red-600">Your Answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {results.questionStats[index].correct} correct,{" "}
                      {results.questionStats[index].incorrect} incorrect
                    </span>
                    <span>{question.points} points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button>Review Answers</Button>
          </div>
        </div>
      </main>
    </div>
  )
} 