"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Home,
  BookOpen,
  Trophy,
  Users,
  Settings,
  User,
  Play,
  Heart,
  BarChart3,
  FileText,
  Crown,
  Menu,
  X
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const adminSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="h-4 w-4" />,
    href: '/admin/dashboard'
  },
  {
    id: 'live-quiz',
    label: 'Live Quiz',
    icon: <Play className="h-4 w-4" />,
    href: '/admin/live-quiz'
  },
  {
    id: 'assignment-quiz',
    label: 'Assignment Quiz',
    icon: <FileText className="h-4 w-4" />,
    href: '/admin/assignment-quiz'
  },
  {
    id: 'results-overview',
    label: 'Results Overview',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/admin/results-overview'
  },
  {
    id: 'manage-users',
    label: 'Manage Users',
    icon: <Users className="h-4 w-4" />,
    href: '/admin/manageuser'
  },
  {
    id: 'manage-department',
    label: 'Manage Department',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/admin/managedepartment'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="h-4 w-4" />,
    href: '/admin/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    href: '/admin/settings'
  }
];

const studentSidebarItems: SidebarItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="h-4 w-4" />,
    href: '/profile'
  },
  {
    id: 'live-quiz',
    label: 'Live Quiz',
    icon: <Play className="h-4 w-4" />,
    href: '/live-quiz'
  },
  {
    id: 'assignment-quiz',
    label: 'Assignment Quiz',
    icon: <FileText className="h-4 w-4" />,
    href: '/assignment-quiz'
  },
  {
    id: 'complete-quiz',
    label: 'Complete Quiz',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/complete-quiz'
  },
  {
    id: 'favorite-quiz',
    label: 'Favorite Quiz',
    icon: <Heart className="h-4 w-4" />,
    href: '/favorite-quiz'
  },
  {
    id: 'result',
    label: 'Result',
    icon: <Trophy className="h-4 w-4" />,
    href: '/result'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    href: '/settings'
  }
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const sidebarItems = user.role === 'admin' ? adminSidebarItems : studentSidebarItems;
  const title = user.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg border"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-[#0E2647]" />
        ) : (
          <Menu className="h-6 w-6 text-[#0E2647]" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg lg:text-xl font-bold text-[#0E2647]">{title}</h2>
            {user.role === 'admin' && (
              <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-[#FAB364]" />
            )}
          </div>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">Welcome, {user.name}</p>
        </div>
        
        <nav className="mt-4 lg:mt-6">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center px-4 lg:px-6 py-3 text-sm lg:text-base text-gray-700 hover:bg-[#FAB364] hover:text-white transition-colors",
                  isActive && "bg-[#FAB364] text-white"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
} 