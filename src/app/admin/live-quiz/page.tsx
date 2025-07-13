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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0E2647]">Manage Live Quizzes</h1>
        <Button onClick={() => router.push("/admin/live-quiz/create")} className="bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647]">Create Quiz</Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <Spinner className="mx-auto my-8" />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full text-center py-8">No quizzes found.</div>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                      <Badge>{quiz.mode}</Badge>
                      <Badge variant={quiz.status === 'live' ? 'default' : 'secondary'} className={
                        quiz.status === 'live' ? 'bg-green-100 text-green-800' : 
                        quiz.status === 'completed' ? 'bg-gray-200 text-gray-600' : 
                        quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        quiz.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''
                      }>{quiz.status}</Badge>
                      <span>Start: {quiz.startTime ? new Date(quiz.startTime).toLocaleString() : "-"}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="text-sm text-gray-700">{quiz.description}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">Participants: {quiz.currentParticipants ?? 0}</Badge>
                  <Badge variant="outline">Questions: {quiz.totalQuestions ?? 0}</Badge>
                  <Badge variant="outline">Department: {quiz.department?.name || "-"}</Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  {/* Actions: View/Edit/Delete/Start/End (to be implemented) */}
                  <Button size="sm" variant="outline" onClick={() => router.push(`/admin/live-quiz/${quiz._id}`)} aria-label="View Quiz"><FaEye /></Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/admin/live-quiz/${quiz._id}/edit`)} aria-label="Edit Quiz"><FaEdit /></Button>
                  <Button size="sm" variant="destructive" onClick={() => { setSelectedQuiz(quiz); setConfirmDelete(true); }} aria-label="Delete Quiz"><FaTrash /></Button>
                  {quiz.status === 'live' && <Button size="sm" onClick={() => router.push(`/admin/live-quiz/${quiz._id}/start`)} aria-label="End Quiz"><FaStop /></Button>}
                  {(quiz.status === 'completed' || quiz.status === 'draft') && <Button size="sm" onClick={() => router.push(`/admin/live-quiz/${quiz._id}/start`)} aria-label="Start Quiz"><FaPlay /></Button>}
                  {quiz.status === 'scheduled' && <Button size="sm" onClick={() => router.push(`/admin/live-quiz/${quiz._id}`)} aria-label="View Schedule"><FaEye /></Button>}
                </div>
              </CardContent>
            </Card>
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