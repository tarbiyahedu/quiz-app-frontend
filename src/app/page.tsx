'use client';

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { 
  Clock, 
  BookOpen, 
  Trophy, 
  Users, 
  Zap, 
  Target,
  ArrowRight,
  Play,
  FileText,
  BarChart3
} from "lucide-react"
import { FaCheck } from "react-icons/fa";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      title: "Live Quizzes",
      description: "Engage in real-time interactive quizzes with instant feedback and live leaderboards.",
      icon: <Zap className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />,
      href: "/dashboard",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Assignment Quizzes",
      description: "Complete homework assignments with flexible deadlines and comprehensive grading.",
      icon: <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />,
      href: "/dashboard",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Leaderboards",
      description: "Track your performance and compete with peers across departments and subjects.",
      icon: <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />,
      href: "/leaderboard",
      color: "bg-yellow-50 border-yellow-200"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+", icon: <Users className="h-4 w-4 lg:h-5 lg:w-5" /> },
    { label: "Quizzes Created", value: "500+", icon: <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" /> },
    { label: "Questions Answered", value: "1M+", icon: <Target className="h-4 w-4 lg:h-5 lg:w-5" /> },
    { label: "Departments", value: "50+", icon: <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" /> }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div 
              className="flex flex-col justify-center space-y-4 lg:space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl font-bold text-[#0E2647] tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
               Judge Yourself
                <span className="text-[#FAB364]"> in Minutes.</span>
              </h1>
              <p className="text-base lg:text-xl text-muted-foreground leading-relaxed">
                Unlock the joy of learning through engaging and effective quizzes. 
                Join live competitions or complete assignments at your own pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-[#0E2647] text-white hover:bg-[#FAB364] border border-[#0E2647] hover:text-[#0E2647] transition-all duration-300 text-sm lg:text-base">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="bg-[#0E2647] text-white hover:bg-[#FAB364] border border-[#0E2647] hover:text-[#0E2647] transition-all duration-300 text-sm lg:text-base">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/join">
                      <Button variant="outline" size="lg" className="border-[#0E2647] text-[#0E2647] hover:bg-[#0E2647] hover:text-white transition-all duration-300 text-sm lg:text-base">
                        <Play className="mr-2 h-4 w-4" />
                        Join Quiz
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full max-w-[600px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl border-2 border-blue-100 p-4 lg:p-8 shadow-xl">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-[#0E2647]" />
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-[#FAB364]" />
                        <span className="text-xs lg:text-sm font-medium">15:30</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 lg:space-y-4">
                      <div className="h-3 lg:h-4 w-3/4 rounded bg-[#0E2647]/20" />
                      <div className="space-y-2">
                        <div className="h-2 lg:h-3 w-full rounded bg-[#0E2647]/20" />
                        <div className="h-2 lg:h-3 w-5/6 rounded bg-[#0E2647]/20" />
                      </div>
                    </div>
                    
                    <div className="grid gap-2 lg:gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 lg:h-12 rounded-lg border-2 border-[#FAB364]/30 bg-white/50 flex items-center px-3 lg:px-4 hover:border-[#FAB364] transition-colors">
                          {i === 1 ? (
                            <span className="mr-2 lg:mr-3 flex items-center justify-center">
                              <FaCheck color="#FAB364" size={14} className="lg:w-[18px] lg:h-[18px]" />
                            </span>
                          ) : (
                            <span className="h-2 w-2 lg:h-3 lg:w-3 rounded-full border-2 border-[#0E2647] mr-2 lg:mr-3 inline-block" />
                          )}
                          <div className="h-2 lg:h-3 w-2/3 rounded bg-[#0E2647]/20" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 lg:pt-4">
                      <div className="flex space-x-1 lg:space-x-2">
                        <div className="h-1.5 lg:h-2 w-12 lg:w-16 rounded-full bg-[#FAB364]" />
                        <div className="h-1.5 lg:h-2 w-12 lg:w-16 rounded-full bg-[#0E2647]/20" />
                        <div className="h-1.5 lg:h-2 w-12 lg:w-16 rounded-full bg-[#0E2647]/20" />
                      </div>
                      <Button size="sm" className="bg-[#0E2647] text-white hover:bg-[#FAB364] hover:text-[#0E2647] text-xs lg:text-sm">
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2 text-[#FAB364]">
                    {stat.icon}
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-[#0E2647]">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-white">
          <div className="container mx-auto px-4 py-12 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0E2647] mb-3 lg:mb-4">Key Features</h2>
              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Everything you need to create engaging quizzes and track student progress
              </p>
            </motion.div>
            
            <div className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`rounded-xl border-2 p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${feature.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="mb-4 lg:mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 lg:mb-4 text-lg lg:text-xl font-semibold text-[#0E2647]">{feature.title}</h3>
                  <p className="text-sm lg:text-base text-muted-foreground mb-4 lg:mb-6 leading-relaxed">{feature.description}</p>
                  <Link href={feature.href}>
                    <Button variant="outline" className="w-full border-[#0E2647] text-[#0E2647] hover:bg-[#0E2647] hover:text-white transition-all duration-300 text-sm lg:text-base">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
