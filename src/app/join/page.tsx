"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Dialog } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Play, ArrowRight, Loader2 } from "lucide-react";
import { liveQuizAPI } from "@/lib/api";
import { io } from "socket.io-client";

export default function Join() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [pendingQuizId, setPendingQuizId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleJoin = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a quiz code",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Try to find live quiz by ID first
      let quizData = null;
      try {
        const liveResponse = await liveQuizAPI.getQuizById(code);
        if (liveResponse.data.data) {
          quizData = liveResponse.data.data;
        }
      } catch (error) {
        // Not found by ID, try by code
        try {
          const codeResponse = await liveQuizAPI.getQuizByCode(code);
          if (codeResponse.data.data) {
            quizData = codeResponse.data.data;
          }
        } catch (error) {
          // Not found by code, try assignment
        }
      }

      if (!quizData) {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "The quiz code you entered is invalid or has expired."
        });
        return;
      }

      // If user is logged in, go directly to quiz
      if (user) {
        router.push(`/quiz/${quizData._id}/live`);
  const [quizId, setQuizId] = useState(''); // You may get this from URL or props
  // const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://quiz-app-backend-pi.vercel.app');
        return;
      }

      // If not logged in, show guest dialog
      setPendingQuizId(quizData._id);
      setShowGuestDialog(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join quiz. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGuestSubmit = async () => {
    if (!guestName.trim() || !guestContact.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Info",
        description: "Please enter your name and mobile/email.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Detect type
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^\+?\d{7,15}$/;
      let email = "";
      let phone = "";
      if (emailRegex.test(guestContact.trim())) {
        email = guestContact.trim();
      } else if (mobileRegex.test(guestContact.trim())) {
        phone = guestContact.trim();
      }
      const res = await liveQuizAPI.guestJoin({ quizId: pendingQuizId!, name: guestName, email, phone });
      if (res.data.success && pendingQuizId) {
        // Save guest info in localStorage for quiz page
        window.localStorage.setItem('guestInfo', JSON.stringify({
          guestName,
          guestContact,
          guestId: res.data.guestId || res.data.userId || null // backend should return guestId/userId
        }));
        // Emit socket event for guest join with role info
        try {
          const io = (await import('socket.io-client')).default;
          const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://quiz-app-backend-pi.vercel.app');
          // const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
          socket.emit('joinPublicQuiz', {
            quizId: pendingQuizId,
            guestName,
            role: 'Guest'
          });
        } catch (e) {}
        setShowGuestDialog(false);
        // Redirect directly to quiz page for answering
        router.push(`/quiz/${pendingQuizId}/live`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.data.message || "Failed to join as guest."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to join as guest."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E2647] to-[#1e3a8a]">
      <motion.div 
        className="flex flex-col items-center w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-white text-4xl md:text-6xl font-bold tracking-wide select-none mb-4">
            Join Quiz
          </div>
          <p className="text-blue-100 text-lg">
            Enter the quiz code to join a live or assignment quiz
          </p>
        </motion.div>

        <motion.div 
          className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex w-full mb-6">
            <Input
              type="text"
              placeholder="Enter quiz code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="flex-1 px-5 py-4 rounded-l-lg text-lg outline-none border-2 border-[#FAB364] border-white/30 bg-white/90 placeholder-gray-500  transition-all duration-300"
              maxLength={8}
            />
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="px-7 py-4 bg-[#FAB364] text-[#0E2647] font-semibold rounded-r-lg transition-all duration-300 text-lg border-2 border-[#FAB364] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Guest Join Dialog */}
        {showGuestDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4 text-[#0E2647]">Join as Guest</h2>
              <Input
                type="text"
                placeholder="Your Name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="mb-4 px-4 py-2 text-lg"
              />
              <Input
                type="text"
                placeholder="Mobile Number or Email"
                value={guestContact}
                onChange={e => setGuestContact(e.target.value)}
                className="mb-4 px-4 py-2 text-lg"
              />
              <Button
                onClick={handleGuestSubmit}
                disabled={isLoading}
                className="w-full py-2 text-lg bg-[#FAB364] text-[#0E2647] font-semibold rounded-lg hover:bg-white border-2 border-[#FAB364] hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start Quiz"}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}






