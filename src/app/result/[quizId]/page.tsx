  // PDF download using backend Playwright endpoint
  import React, { useState, useEffect } from 'react';
  import { useRouter, useParams } from 'next/navigation';

  function ResultPage() {
    // ...existing hooks and state...
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailedResult, setDetailedResult] = useState<any>(null);

    // ...existing useEffect and helpers...

    const downloadPDF = async () => {
      if (!detailedResult) return;
      try {
        const res = await fetch(`/api/live-leaderboard/${detailedResult.id}/export-pdf`, {
          method: 'GET',
        });
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_${detailedResult.id}_result.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('PDF Download Error:', err);
      }
    };

    // ...existing return JSX...
  }

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[#0E2647]">Quiz Result Details</h1>
            {detailedResult && (
              <>
                <Button onClick={downloadPDF} variant="outline" size="sm" className="ml-auto flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download PDF Result</span>
                </Button>
              </>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : detailedResult ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">{detailedResult.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Score:</span> {detailedResult.score}%
                  </div>
                  <div>
                    <span className="font-medium">Correct:</span> {detailedResult.correctAnswers}/{detailedResult.totalQuestions}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {detailedResult.timeTaken} min
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(detailedResult.completionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {detailedResult.answers.map((answer: any, index: number) => (
                  <div key={answer.questionId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-lg">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {answer.score}/{answer.marks} marks
                        </span>
                        {answer.isCorrect ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className={`text-gray-800 mb-2 ${fontClass(answer.questionText)}`}>{answer.questionText}</p>
                      <Badge variant="outline" className={`text-xs ${fontClass(answer.questionType)}`}>
                        {answer.questionType}
                      </Badge>
                    </div>
                    {answer.questionOptions && answer.questionOptions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Options:</p>
                        <div className="space-y-1">
                          {answer.questionOptions.map((option: string, optIndex: number) => (
                            <div key={optIndex} className={`text-sm text-gray-600 ${fontClass(option)}`}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Your Answer:</p>
                      <div className={`p-2 rounded border ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${fontClass(answer.questionType === 'MCQ' ? formatUserAnswerWithOptions(answer) : formatUserAnswer(answer))}`}>
                            {answer.questionType === 'MCQ' ? formatUserAnswerWithOptions(answer) : formatUserAnswer(answer)}
                          </span>
                          <span className={`text-sm font-semibold flex items-center ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {answer.isCorrect ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Correct
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Incorrect
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Correct Answer:</p>
                      <div className="p-2 rounded border bg-green-50 border-green-200">
                        <div className={`text-sm text-gray-700 ${fontClass(answer.questionType === 'MCQ' ? getCorrectAnswerOptions(answer) : formatCorrectAnswer(answer))}`}>
                          {answer.questionType === 'MCQ' ? (
                            getCorrectAnswerOptions(answer)
                          ) : (
                            formatCorrectAnswer(answer)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">No detailed results available</div>
          )}
        </div>
      </DashboardLayout>
    );
}

export default ResultPage;