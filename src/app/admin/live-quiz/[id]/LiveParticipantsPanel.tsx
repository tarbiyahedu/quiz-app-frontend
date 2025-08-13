import { useEffect, useState } from "react";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app");
// const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

export default function LiveParticipantsPanel({ quizId, showControls = false }: { quizId: string, showControls?: boolean }) {
  const { user, loading } = useAuth();
  const [participants, setParticipants] = useState<any[]>([]);
  const [live, setLive] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      socket.emit("join_live_quiz", { quizId, user: { id: user._id, name: user.name, avatar: user.avatar } });
      // Also join the quiz room for real-time participant updates
      socket.emit("join-quiz", { quizId, userId: user._id });
    }
  }, [quizId, user, loading]);

  useEffect(() => {
    socket.on("participant_list", (participantList) => {
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

  const handleStart = () => socket.emit("start_live_quiz", { quizId });
  const handleEnd = () => socket.emit("end_live_quiz", { quizId });

  if (loading || !user) return <div>Loading...</div>;
  if (user.role !== 'admin') return null;

  return (
    <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center min-w-[400px] mb-8">
      <div className="mb-4 text-lg font-semibold">
        👥 Live Participants ({participants.length} Currently)
      </div>
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {participants.map((p, idx) => (
          <div key={p.userId || p._id || p.id || idx} className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
            <img src={p.avatar || "/default-avatar.png"} className="w-8 h-8 rounded-full" />
            <span className="font-medium">{p.name}</span>
            {p.role === 'Guest' || p.isGuest ? (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Guest</span>
            ) : null}
          </div>
        ))}
        {participants.length === 0 && <span className="text-gray-400">No participants yet.</span>}
      </div>
      {showControls && (
        <>
          <Button onClick={handleStart} className="mb-2 w-32" disabled={live}>Start</Button>
          <Button onClick={handleEnd} variant="outline" className="w-32" disabled={!live}>End</Button>
          {ended && <div className="mt-4 text-red-500">Live Ended / Time Over</div>}
        </>
      )}
    </div>
  );
} 