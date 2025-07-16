"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User, Home, Trophy, Menu, X, BookOpen, Crown, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link href="/">
          <div className="flex items-center space-x-2 lg:space-x-4 text-[#0E2647]">
            <Image src="/logo.svg" width={40} height={40} className="lg:w-[50px] lg:h-[50px]" alt="Tarbiyah Quiz Logo" />
            <h1 className="text-lg lg:text-2xl font-bold">Tarbiyah Quiz</h1>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link href="/join" className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>Join Quiz</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors">
            <Trophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-[#0E2647]" />
          ) : (
            <Menu className="h-6 w-6 text-[#0E2647]" />
          )}
        </button>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
          ) : user ? (
            <UserAvatarDropdown />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-[#0E2647] hover:text-[#FAB364] text-sm lg:text-base">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#0E2647] text-white hover:bg-[#FAB364] border border-[#0E2647] hover:text-[#0E2647] transition-all duration-300 text-sm lg:text-base">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors py-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                href="/join"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors py-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Join Quiz</span>
              </Link>
              <Link
                href="/leaderboard"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors py-2"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t">
              {loading ? (
                <div className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2">
                    <Avatar className="h-8 w-8 border-2 border-[#FAB364]">
                      <AvatarImage src={user.profilePicture || ""} alt={user.name} />
                      <AvatarFallback className="bg-[#0E2647] text-white text-xs">
                        {user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors py-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 text-[#0E2647] hover:text-[#FAB364] transition-colors py-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        // Handle logout
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors py-2 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full text-[#0E2647] hover:text-[#FAB364]">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <Button className="w-full bg-[#0E2647] text-white hover:bg-[#FAB364] border border-[#0E2647] hover:text-[#0E2647] transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export function UserAvatarDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const goToProfile = useCallback(() => router.push("/profile"), [router]);
  const goToDashboard = useCallback(() => {
    if (user.role === 'admin') {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  }, [router, user.role]);
  
  const handleLogout = useCallback(() => {
    logout();
    router.push("/");
  }, [logout, router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer border-2 border-[#FAB364] hover:border-[#0E2647] transition-colors">
          <AvatarImage src={user.profilePicture || ""} alt={user.name} />
          <AvatarFallback className="bg-[#0E2647] text-white">
            {user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {user.role === 'admin' && (
            <Crown className="h-4 w-4 text-[#FAB364]" />
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={goToDashboard}>
          <Settings className="mr-2 h-4 w-4" />
          {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={goToProfile}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/users")}>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/create-quiz")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Create Quiz
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
