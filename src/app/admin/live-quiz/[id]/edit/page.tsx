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
    const fetchQuiz = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/live-quizzes/${params.id}`);
        setQuiz(res.data.data);
      } catch (e: any) {
        setError("Failed to fetch quiz details");
      }
      setLoading(false);
    };
    if (params.id) fetchQuiz();
  }, [params.id]);

  if (loading) return <DashboardLayout><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">{error}</div></DashboardLayout>;
  if (!quiz) return <DashboardLayout><div className="p-8 text-center">Quiz not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Quiz</h1>
        <QuizForm mode="edit" initialQuiz={quiz} onSave={() => router.push('/admin/live-quiz')} />
      </div>
    </DashboardLayout>
  );
} 