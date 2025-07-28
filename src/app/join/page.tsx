"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Play, ArrowRight, Loader2 } from "lucide-react";
import { liveQuizAPI } from "@/lib/api";

export default function Join() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
      try {
        const liveResponse = await liveQuizAPI.getQuizById(code);
        if (liveResponse.data.data) {
          router.push(`/quiz/${liveResponse.data.data._id}/live`);
          return;
        }
      } catch (error) {
        // Not found by ID, try by code
        try {
          const codeResponse = await liveQuizAPI.getQuizByCode(code);
          if (codeResponse.data.data) {
            router.push(`/quiz/${codeResponse.data.data._id}/live`);
            return;
          }
        } catch (error) {
          // Not found by code, try assignment
        }
      }

      // If we get here, no quiz was found
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "The quiz code you entered is invalid or has expired.",
      });
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
              className="flex-1 px-5 py-4 rounded-l-lg text-lg outline-none border-2 border-white/30 bg-white/90 placeholder-gray-500 focus:border-[#FAB364] focus:ring-[#FAB364] transition-all duration-300"
              maxLength={8}
            />
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="px-7 py-4 bg-[#FAB364] text-[#0E2647] font-semibold rounded-r-lg hover:bg-white transition-all duration-300 text-lg border-2 border-[#FAB364] hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="text-center text-blue-100 text-sm">
            <p className="mb-2">Quiz codes are case-insensitive</p>
            <p>Live quizzes and assignments are supported</p>
          </div>
        </motion.div>

        
      </motion.div>
    </div>
  );
}


