"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import io from "socket.io-client";

// Quiz type for display
interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  schedule?: string;
  department: any; // Add this line to fix the type error
}

export default function LiveQuizStudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Helper to filter quizzes by department
  const filterByDepartment = (quizList: Quiz[]) => {
    if (!user) return [];
    const userDeptIds = user.departments?.map((d: any) => d._id) || [];
    return quizList.filter(q => userDeptIds.includes(q.department?._id || q.department));
  };

  useEffect(() => {
    console.log("[LiveQuiz] useEffect: user:", user);
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        // Fetch all live quizzes
        const res = await api.get("/live-quizzes?status=live");
        const filtered = filterByDepartment(res.data.data || []);
        setQuizzes(filtered);
        console.log("[LiveQuiz] Initial quizzes fetched and filtered:", filtered);
      } catch (e: any) {
        setError(e.message || "Failed to load quizzes");
        console.error("[LiveQuiz] Error fetching quizzes:", e);
      }
      setLoading(false);
    };
    if (user) fetchQuizzes();
  }, [user]);

  useEffect(() => {
    console.log("[LiveQuiz] Socket useEffect running. User:", user);
    if (!user) {
      console.log("[LiveQuiz] No user, skipping socket setup");
      return;
    }
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

    // Join all department rooms
    if (user.departments && Array.isArray(user.departments)) {
      user.departments.forEach(dept => {
        socket.emit('join-department', { departmentId: dept._id });
        console.log("[LiveQuiz] Joined department room:", dept._id);
      });
    }

    socket.on("connect", () => {
      console.log("[LiveQuiz] Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("[LiveQuiz] Socket disconnected");
    });

    // When a quiz goes live
    socket.on("quiz-live", (quiz: any) => {
      console.log("[LiveQuiz] Received quiz-live event:", quiz);
      setQuizzes(prev => {
        if (prev.some(q => q._id === quiz.quizId || q._id === quiz._id)) return prev;
        const updated = [...prev, { ...quiz, _id: quiz.quizId || quiz._id }];
        console.log("[LiveQuiz] Quiz added. Updated quiz list:", updated);
        return updated;
      });
    });

    // When a quiz ends
    socket.on("quiz-ended", (data: any) => {
      console.log("[LiveQuiz] Received quiz-ended event:", data);
      setQuizzes(prev => {
        const updated = prev.filter(q => q._id !== data.quizId);
        console.log("[LiveQuiz] Quiz removed. Updated quiz list:", updated);
        return updated;
      });
    });

    socket.on("error", (err) => {
      console.error("[LiveQuiz] Socket error:", err);
    });

    return () => {
      console.log("[LiveQuiz] Cleaning up socket connection");
      socket.disconnect();
    };
  }, [user]);


  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Live Quizzes</h1>
      {quizzes.length === 0 ? (
        <div className="text-gray-500">No live quizzes available for your departments.</div>
      ) : (
        <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <Card key={quiz._id} className="max-w-md w-full mx-auto shadow rounded-xl border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">{quiz.description}</div>
                <div className="mb-2 text-sm text-gray-600">Time Limit: {quiz.timeLimit} min</div>
                <Button onClick={() => router.push(`/quiz/${quiz._id}/live`)}>Join Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 

