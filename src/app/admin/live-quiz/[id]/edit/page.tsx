"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { useToast } from '@/components/ui/use-toast';
import api from "@/lib/api";
import QuizForm from '@/components/QuizForm';

export default function EditLiveQuizPage() {
  const router = useRouter();
  const params = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/live-quizzes/${params.id}`);
        const quizData = res.data.data;
        const qRes = await api.get(`/live-quiz-questions/${params.id}`);
        const questionsData = (qRes.data.data || []).map((q: any) => {
          let options = (q.options || []).filter((opt: string) => !!opt && opt.trim() !== "");
          let answer = q.correctAnswer || "";
          // For MCQ, convert answer text to letter if needed
          if (q.type === "MCQ" && options.length > 0) {
            const idx = options.findIndex((opt: string) => opt.trim() === answer.trim());
            if (idx !== -1) {
              answer = String.fromCharCode(65 + idx); // A, B, C, D, ...
            }
          }
          return {
            _id: q._id,
            type: mapBackendTypeToFrontend(q.type),
            text: q.questionText || "",
            answer,
            options,
            correctAnswers: q.correctAnswers || [],
            matchingPairs: q.matchingPairs || [],
            correctSequence: q.correctSequence || [],
            marks: q.marks || 1,
            mediaUrl: q.imageUrl || "",
            videoUrl: q.videoUrl || "",
            mediaQuestionType: q.mediaQuestionType || "mcq"
          };
        });
        setQuiz({ ...quizData, questions: questionsData });
      } catch (e: any) {
        setError("Failed to fetch quiz details");
      }
      setLoading(false);
    };
    if (params.id) fetchQuizAndQuestions();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!quiz) return <div className="p-8 text-center">Quiz not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Quiz</h1>
      <QuizForm mode="edit" initialQuiz={quiz} onSave={() => router.push('/admin/live-quiz')} />
    </div>
  );
}

function mapBackendTypeToFrontend(type: string) {
  switch (type) {
    case "Short": return "short";
    case "Long": return "long";
    case "TF": return "truefalse";
    case "MCQ": return "mcq";
    case "Fill": return "fill";
    case "Match": return "matching";
    case "Ordering": return "ordering";
    case "Media": return "media";
    default: return "short";
  }
} 