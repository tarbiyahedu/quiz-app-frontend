"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import io from "socket.io-client";
import { use } from "react";
import LiveParticipantsPanel from "../LiveParticipantsPanel";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
// const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app");

export default function AdminLiveQuizStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <LiveParticipantsPanel quizId={id} showControls={true} />;
} 