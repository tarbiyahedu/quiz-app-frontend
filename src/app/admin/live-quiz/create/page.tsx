"use client";

import { useRouter } from "next/navigation";
import QuizForm from '@/components/QuizForm';

export default function CreateLiveQuizPage() {
  const router = useRouter();
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz Add</h1>
      <QuizForm mode="create" onSave={(quizId) => router.push(`/admin/live-quiz/${quizId}`)} />
    </div>
  );
} 