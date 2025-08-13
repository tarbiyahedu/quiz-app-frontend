"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Check, X, ArrowLeft } from "lucide-react";
import { liveQuizAnswerAPI } from "@/lib/api";

export default function ResultDetailsPage() {
  // Excel export logic with font family per cell
  const downloadExcel = async () => {
    if (!detailedResult) return;
    try {
      const XLSX = (await import('xlsx')).default;
      // Helper: Get font family for script
      function getFontFamily(text: string) {
        const script = detectScript(text);
        if (script === 'bangla') return 'Hind Siliguri';
        if (script === 'arabic') return 'Amiri';
        return 'Arial';
      }

      // Prepare worksheet data
      const wsData = [
        ['Quiz Result Report'],
        [`Quiz: ${detailedResult.title}`],
        [`Score: ${detailedResult.score}%`],
        [`Correct Answers: ${detailedResult.correctAnswers}/${detailedResult.totalQuestions}`],
        [`Time Taken: ${detailedResult.timeTaken} minutes`],
        [`Completion Date: ${new Date(detailedResult.completionDate).toLocaleDateString()}`],
        [],
        ['Questions and Answers:'],
      ];
      detailedResult.answers.forEach((answer: any, index: number) => {
        wsData.push([
          `Question ${index + 1}:`,
          answer.questionText,
          `Type: ${answer.questionType}`,
          `Your Answer: ${formatUserAnswer(answer)}`,
          `Correct Answer: ${formatCorrectAnswer(answer)}`,
          `Score: ${answer.score}/${answer.marks}`,
          answer.isCorrect ? '✓ Correct' : '✗ Incorrect'
        ]);
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set font family per cell
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const fontFamily = getFontFamily(cell.v.toString());
            cell.s = cell.s || {};
            cell.s.font = cell.s.font || {};
            cell.s.font.name = fontFamily;
            cell.s.font.sz = 12;
          }
        }
      }

      ws['!cols'] = [
        { wch: 20 }, { wch: 60 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Quiz Result');
      XLSX.writeFile(wb, `quiz-result-${detailedResult.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert('Failed to generate Excel file. Please try again.');
    }
  };
  // Helper: Detect script for font selection
  function detectScript(text: string) {
    if (/[ঀ-৾]/.test(text)) return 'bangla';
    if (/[ء-ي]/.test(text)) return 'arabic';
    return 'english';
  }

  // Helper: Load font base64 from local file
  async function loadFontBase64(fontName: 'HindSiliguri' | 'Amiri') {
    try {
      const res = await fetch(`/font/${fontName}-Regular.base64.txt`);
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      // Ignore, fallback below
    }
    return '';
  }
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedResult, setDetailedResult] = useState<any>(null);

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    setError(null);
    setDetailedResult(null);
    liveQuizAnswerAPI.getCompletedQuizDetails(quizId)
      .then(res => {
        setDetailedResult(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load detailed results");
        setLoading(false);
      });
  }, [quizId]);

  // Helper function to format user answer for display
  const formatUserAnswer = (answer: any) => {
    if (!answer.userAnswer) return 'Not answered';
    if (Array.isArray(answer.userAnswer)) {
      return answer.userAnswer.join(', ');
    }
    return answer.userAnswer;
  };

  // Helper function to format correct answer for display
  const formatCorrectAnswer = (answer: any) => {
    if (!answer.correctAnswers || answer.correctAnswers.length === 0) {
      return answer.correctAnswer || 'N/A';
    }
    if (Array.isArray(answer.correctAnswers)) {
      return answer.correctAnswers.join(', ');
    }
    return answer.correctAnswers;
  };

  // Helper function to get correct answer options for MCQ
  const getCorrectAnswerOptions = (answer: any) => {
    if (answer.questionType !== 'MCQ' || !answer.questionOptions) {
      return 'N/A';
    }
    // Check if correctAnswers exists and has content
    if (!answer.correctAnswers || (Array.isArray(answer.correctAnswers) && answer.correctAnswers.length === 0)) {
      return 'N/A';
    }
    // Since correctAnswers now contains the actual option text, map them to option letters
    const correctOptionLetters = answer.questionOptions
      .map((option: string, idx: number) => {
        const isCorrect = Array.isArray(answer.correctAnswers) 
          ? answer.correctAnswers.includes(option)
          : answer.correctAnswers === option;
        return isCorrect ? `${String.fromCharCode(65 + idx)}. ${option}` : null;
      })
      .filter(Boolean);
    return correctOptionLetters.length > 0 ? correctOptionLetters.join(', ') : 'N/A';
  };

  // Helper function to format user answer with option letters for MCQ
  const formatUserAnswerWithOptions = (answer: any) => {
    if (!answer.userAnswer || answer.questionType !== 'MCQ') {
      return formatUserAnswer(answer);
    }
    if (!answer.questionOptions) {
      return formatUserAnswer(answer);
    }
    // For MCQ, show the selected options with letters
    const userAnswers = Array.isArray(answer.userAnswer) ? answer.userAnswer : [answer.userAnswer];
    const selectedOptions = answer.questionOptions
      .map((option: string, idx: number) => {
        const isSelected = userAnswers.includes(option);
        return isSelected ? `${String.fromCharCode(65 + idx)}. ${option}` : null;
      })
      .filter(Boolean);
    return selectedOptions.length > 0 ? selectedOptions.join(', ') : 'Not answered';
  };

  // --- Font detection and auto-class assignment ---
  function fontClass(text: string): string {
    const script = detectScript(text);
    if (script === 'bangla') return 'bangla';
    if (script === 'arabic') return 'arabic';
    return 'english';
  }

  const downloadPDF = async () => {
    if (!detailedResult) return;
    try {
      const jsPDF = (await import('jspdf')).default;
      // Load fonts (base64)
      const hindSiliguriBase64 = await loadFontBase64('HindSiliguri');
      const amiriBase64 = await loadFontBase64('Amiri');

      const pdf = new jsPDF('p', 'mm', 'a4');
      // Register fonts with jsPDF (after instance creation)
      if (hindSiliguriBase64) {
        pdf.addFileToVFS('HindSiliguri-Regular.ttf', hindSiliguriBase64);
        pdf.addFont('HindSiliguri-Regular.ttf', 'HindSiliguri', 'normal');
      }
      if (amiriBase64) {
        pdf.addFileToVFS('Amiri-Regular.ttf', amiriBase64);
        pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      }
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper: Set font for text block
      function setFontForText(text: string, style: 'normal' | 'bold' = 'normal') {
        const script = detectScript(text);
        if (script === 'bangla' && hindSiliguriBase64) {
          pdf.setFont('HindSiliguri', style);
        } else if (script === 'arabic' && amiriBase64) {
          pdf.setFont('Amiri', style);
        } else {
          pdf.setFont('helvetica', style);
        }
      }

      pdf.setFontSize(20);
      setFontForText('Quiz Result Report', 'bold');
      pdf.text('Quiz Result Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      pdf.setFontSize(12);
      setFontForText(`Quiz: ${detailedResult.title}`, 'bold');
      pdf.text(`Quiz: ${detailedResult.title}`, margin, yPosition);
      yPosition += 8;
      setFontForText(`Score: ${detailedResult.score}%`);
      pdf.text(`Score: ${detailedResult.score}%`, margin, yPosition);
      yPosition += 8;
      setFontForText(`Correct Answers: ${detailedResult.correctAnswers}/${detailedResult.totalQuestions}`);
      pdf.text(`Correct Answers: ${detailedResult.correctAnswers}/${detailedResult.totalQuestions}`, margin, yPosition);
      yPosition += 8;
      setFontForText(`Time Taken: ${detailedResult.timeTaken} minutes`);
      pdf.text(`Time Taken: ${detailedResult.timeTaken} minutes`, margin, yPosition);
      yPosition += 8;
      setFontForText(`Completion Date: ${new Date(detailedResult.completionDate).toLocaleDateString()}`);
      pdf.text(`Completion Date: ${new Date(detailedResult.completionDate).toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;
      setFontForText('Questions and Answers:', 'bold');
      pdf.text('Questions and Answers:', margin, yPosition);
      yPosition += 10;
      detailedResult.answers.forEach((answer: any, index: number) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        setFontForText(`Question ${index + 1}:`, 'bold');
        pdf.setFontSize(11);
        pdf.text(`Question ${index + 1}:`, margin, yPosition);
        yPosition += 6;
        setFontForText(answer.questionText);
        pdf.setFontSize(10);
        const questionLines = pdf.splitTextToSize(answer.questionText, contentWidth);
        questionLines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
        pdf.setFontSize(9);
        setFontForText(`Type: ${answer.questionType}`);
        pdf.text(`Type: ${answer.questionType}`, margin, yPosition);
        yPosition += 5;
        if (answer.questionOptions && answer.questionOptions.length > 0) {
          setFontForText('Options:');
          pdf.text('Options:', margin, yPosition);
          yPosition += 5;
          answer.questionOptions.forEach((option: string, optIndex: number) => {
            setFontForText(`${String.fromCharCode(65 + optIndex)}. ${option}`);
            pdf.text(`${String.fromCharCode(65 + optIndex)}. ${option}`, margin + 5, yPosition);
            yPosition += 4;
          });
        }
        setFontForText('Your Answer:', 'bold');
        pdf.text('Your Answer:', margin, yPosition);
        yPosition += 5;
        setFontForText(formatUserAnswer(answer));
        const userAnswerLines = pdf.splitTextToSize(formatUserAnswer(answer), contentWidth);
        userAnswerLines.forEach((line: string) => {
          pdf.text(line, margin + 5, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
        setFontForText('Correct Answer:', 'bold');
        pdf.text('Correct Answer:', margin, yPosition);
        yPosition += 5;
        setFontForText(formatCorrectAnswer(answer));
        const correctAnswerLines = pdf.splitTextToSize(formatCorrectAnswer(answer), contentWidth);
        correctAnswerLines.forEach((line: string) => {
          pdf.text(line, margin + 5, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
        setFontForText(`Score: ${answer.score}/${answer.marks}`, 'bold');
        pdf.text(`Score: ${answer.score}/${answer.marks}`, margin, yPosition);
        yPosition += 5;
        pdf.setFontSize(10);
        if (answer.isCorrect) {
          pdf.setTextColor(0, 128, 0);
          setFontForText('✓ Correct');
          pdf.text('✓ Correct', margin, yPosition);
        } else {
          pdf.setTextColor(255, 0, 0);
          setFontForText('✗ Incorrect');
          pdf.text('✗ Incorrect', margin, yPosition);
        }
        pdf.setTextColor(0, 0, 0);
        yPosition += 8;
      });
      const fileName = `quiz-result-${detailedResult.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (err: any) {
      if (err.message && err.message.includes('Cannot find module')) {
        alert('PDF libraries not installed. Please run: npm install jspdf html2canvas');
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

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