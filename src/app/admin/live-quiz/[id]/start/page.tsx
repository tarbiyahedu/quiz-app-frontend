"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import io from "socket.io-client";
import { use } from "react";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

export default function AdminLiveQuizStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [live, setLive] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      socket.emit("join_live_quiz", { quizId: id, user: { id: user._id, name: user.name, avatar: user.avatar } });
    }
  }, [id, user, loading]);

  useEffect(() => {
    socket.on("participant_list", (participantList) => {
      console.log("Received participant list:", participantList);
      setParticipants(participantList || []);
    });
    socket.on("live_status", ({ live }) => {
      setLive(live);
      setEnded(!live);
    });
    return () => {
      socket.off("participant_list");
      socket.off("live_status");
    };
  }, []);

  const handleStart = () => socket.emit("start_live_quiz", { quizId: id });
  const handleEnd = () => socket.emit("end_live_quiz", { quizId: id });

  if (loading || !user) return <div>Loading...</div>;
  if (user.role !== 'admin') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Participant Waiting Page</h1>
      <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center min-w-[400px]">
        <div className="mb-4 text-lg font-semibold">
          {participants.length} participant{participants.length !== 1 && "s"} are waiting..
        </div>
        <div className="flex flex-col items-center mb-6">
          {participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-2 mb-2 bg-yellow-50 px-4 py-2 rounded-full">
              <img src={p.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full" />
              <span className="font-medium">{p.name}</span>
            </div>
          ))}
        </div>
        <Button onClick={handleStart} className="mb-2 w-32" disabled={live}>Start</Button>
        <Button onClick={handleEnd} variant="outline" className="w-32" disabled={!live}>End</Button>
        {ended && <div className="mt-4 text-red-500">Live Ended / Time Over</div>}
      </div>
    </div>
  );
} 