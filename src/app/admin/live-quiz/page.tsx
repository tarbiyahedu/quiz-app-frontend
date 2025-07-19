"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { useRouter } from "next/navigation";
import { FaTrash, FaEdit, FaPlay, FaStop, FaEye } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import api from "@/lib/api";

type Quiz = {
  _id: string;
  title: string;
  description: string;
  mode: string;
  status: string;
  startTime?: string;
  totalQuestions?: number;
  currentParticipants?: number;
  department?: { name: string };
  createdBy?: { name: string };
  timeLimit?: number;
  // add other fields as needed
};

const API_BASE = "/api/live-quiz";

const defaultQuiz = {
  title: "",
  description: "",
  totalQuestions: 0,
  timeLimit: 30,
  mode: "live",
  startTime: "",
  accessControl: { type: "public", studentGroups: [] },
  isPublic: false,
  maxParticipants: 100,
};

export default function AdminLiveQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [form, setForm] = useState(defaultQuiz);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/live-quizzes");
      setQuizzes(res.data.data || []);
    } catch (e) {
      setError("Failed to fetch quizzes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Handlers
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      setShowCreate(false);
      setForm(defaultQuiz);
      fetchQuizzes();
      toast({ title: 'Quiz created', description: 'The quiz was created successfully.' });
    } catch (e) {
      setError((e as any).message);
      toast({ title: 'Error creating quiz', description: (e as any).message, variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    setError("");
    if (!selectedQuiz) return;
    try {
      await api.put(`/live-quizzes/${selectedQuiz._id}`, form);
      setShowEdit(false);
      setForm(defaultQuiz);
      setSelectedQuiz(null);
      fetchQuizzes();
      toast({ title: 'Quiz updated', description: 'The quiz was updated successfully.' });
    } catch (e: any) {
      setError(e.message);
      toast({ title: 'Error updating quiz', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    setError("");
    if (!selectedQuiz) return;
    try {
      await api.delete(`/live-quizzes/${selectedQuiz._id}`);
      setShowDelete(false);
      setConfirmDelete(false);
      setSelectedQuiz(null);
      fetchQuizzes();
      toast({ title: 'Quiz deleted', description: 'The quiz was deleted successfully.' });
    } catch (e: any) {
      setError(e.message);
      toast({ title: 'Error deleting quiz', description: e.message, variant: 'destructive' });
    }
  };

  const handleStart = async (quiz: Quiz) => {
    setError("");
    if (!quiz) return;
    try {
      const res = await fetch(`${API_BASE}/${quiz._id}/start`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start quiz");
      fetchQuizzes();
      toast({ title: 'Quiz started', description: 'The quiz was started successfully.' });
    } catch (e: any) {
      setError(e.message);
      toast({ title: 'Error starting quiz', description: e.message, variant: 'destructive' });
    }
  };

  // UI
  return (
    <div className="flex flex-col h-full bg-[#f9fafb] min-h-screen pb-12">
      <div className="flex items-center justify-between mb-10 mt-8 px-2 md:px-0">
        <h1 className="text-4xl font-extrabold text-[#0e2647] tracking-tight relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#FAB364] after:rounded-full after:mt-2">Manage Live Quizzes</h1>
        <Button onClick={() => router.push("/admin/live-quiz/create")} className="bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647] px-6 py-3 text-lg font-semibold rounded-xl shadow-none">Create Quiz</Button>
      </div>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {loading && <Spinner className="mx-auto my-8" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-0">
        {quizzes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-lg text-gray-500">No quizzes found.</div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[240px] transition hover:shadow-md">
              {/* Status badge top-right */}
              <span className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-semibold ${
                quiz.status === 'live' ? 'bg-green-100 text-green-700' :
                quiz.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                quiz.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {quiz.status === 'live' ? 'Live Now' : quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
              </span>
              {/* Title and creator */}
              <div className="mb-2">
                <div className="text-xl font-bold text-[#0e2647] mb-1">{quiz.title}</div>
                {quiz.createdBy && <div className="text-sm text-gray-500">by {quiz.createdBy.name}</div>}
              </div>
              {/* Info row */}
              <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mb-4">
                <span className="flex items-center gap-1"><span className="text-base">👥</span> {quiz.currentParticipants ?? 0} participants</span>
                <span className="flex items-center gap-1"><span className="text-base">⏰</span> {quiz.timeLimit ?? 0} min</span>
                <span className="flex items-center gap-1"><span className="text-base">🏫</span> {quiz.department?.name || '-'}</span>
                <span className="flex items-center gap-1"><span className="text-base">❓</span> {quiz.totalQuestions ?? 0} questions</span>
              </div>
              {/* Description */}
              <div className="text-gray-600 text-base mb-6 line-clamp-2 flex-1">{quiz.description}</div>
              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={() => router.push(`/admin/live-quiz/${quiz._id}`)}
                  aria-label="View Quiz"
                  className="rounded-lg font-semibold text-base px-6 py-2 bg-white border border-[#0E75C4] text-[#0E75C4] hover:bg-[#e6f1fa] transition min-w-[140px]"
                >
                  View Details
                </Button>
                <Button size="icon" variant="outline" onClick={() => router.push(`/admin/live-quiz/${quiz._id}/edit`)} aria-label="Edit Quiz" className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"><FaEdit /></Button>
                <Button size="icon" variant="outline" onClick={() => { setSelectedQuiz(quiz); setConfirmDelete(true); }} aria-label="Delete Quiz" className="rounded-lg bg-white text-red-600 border border-gray-300 hover:bg-red-50"><FaTrash /></Button>
                {quiz.status === 'live' && <Button size="icon" onClick={() => router.push(`/admin/live-quiz/${quiz._id}/start`)} aria-label="End Quiz" className="rounded-lg border-gray-300 text-red-600 hover:bg-red-50"><FaStop /></Button>}
                {quiz.status === 'scheduled' && <Button size="icon" onClick={() => router.push(`/admin/live-quiz/${quiz._id}`)} aria-label="View Schedule" className="rounded-lg border-gray-300 text-blue-700 hover:bg-blue-50"><FaEye /></Button>}
              </div>
            </div>
          ))
        )}
      </div>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Quiz</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete this quiz?</p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 