"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface StudentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function StudentLayout({ children, className }: StudentLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === 'admin') {
        // Redirect admins to admin dashboard if they try to access student routes
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className={cn("flex-1 p-4 lg:p-8 pt-16 lg:pt-8", className)}>
        {children}
      </main>
    </div>
  );
} 