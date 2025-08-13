"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
// Removed unused imports
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Quiz type for display
interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  schedule?: string;
  departments?: any[];
}

export default function LiveQuizStudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  // Memoize department IDs for stable comparison
  const userDeptIds = useMemo(() => (user?.departments?.map((d: any) => String(d._id)) || []), [user]);
  // Helper to filter quizzes by departments array
  const filterByDepartment = (quizList: Quiz[]) => {
    if (!user) return [];
    return quizList.filter(q => {
      const deptIds = Array.isArray(q.departments)
        ? q.departments.map((d: any) => (typeof d === 'string' ? d : d._id))
        : [];
      return deptIds.some((id: string) => userDeptIds.includes(String(id)));
    });
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        // Fetch all live quizzes
        const res = await api.get("/live-quizzes?status=live");
        const filtered = filterByDepartment(res.data.data || []);
        setQuizzes(filtered);
      } catch (e: any) {
        setError(e.message || "Failed to load quizzes");
      }
      setLoading(false);
    };
    if (userDeptIds.length > 0) fetchQuizzes();
  }, [userDeptIds.join(",")]);

  useEffect(() => {
    if (!userDeptIds.length) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app");
    // const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

    // Join all department rooms
    userDeptIds.forEach(deptId => {
      socket.emit('join-department', { departmentId: deptId });
    });

    socket.on("quiz-live", (quiz: any) => {
      // Only add if for user's department (compare as string)
      const deptIds = Array.isArray(quiz.departments)
        ? quiz.departments.map((d: any) => (typeof d === 'string' ? d : d._id))
        : [];
      if (!deptIds.some((id: string) => userDeptIds.includes(String(id)))) return;
      setQuizzes(prev => {
        const quizId = quiz.quizId || quiz._id;
        if (prev.some(q => String(q._id) === String(quizId))) return prev;
        return [...prev, { ...quiz, _id: quizId }];
      });
    });

    socket.on("quiz-ended", (data: any) => {
      setQuizzes(prev => prev.filter(q => String(q._id) !== String(data.quizId)));
    });

    socket.on("error", (err) => {
      // Optionally handle socket errors
    });

    return () => {
      socket.disconnect();
    };
  }, [userDeptIds.join(",")]);


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

