"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login, googleLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<{ login?: string; password?: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validate = () => {
    const errors: { login?: string; password?: string } = {};
    if (!formData.login) {
      errors.login = 'Email or number is required.';
    } else {
      // Basic validation: check if it's a valid email or a valid number (8-15 digits)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const numberRegex = /^\d{8,15}$/;
      if (!emailRegex.test(formData.login) && !numberRegex.test(formData.login)) {
        errors.login = 'Enter a valid email or number (8-15 digits).';
      }
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return;
    setIsLoading(true)

    try {
      await login(formData.login, formData.password)
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to login",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <motion.div 
        className="relative hidden h-full flex-col bg-gradient-to-br from-[#0E2647] to-[#1e3a8a] p-10 text-white lg:flex"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span>Tarbiyah Quiz</span>
          </Link>
        </div>
        <div className="relative z-20 flex flex-col justify-center flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-lg text-blue-100">
              Sign in to continue your learning journey with interactive quizzes and real-time competitions.
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0E2647]">
            Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        
        <div className="grid gap-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Email or Number</Label>
              <Input
                id="login"
                name="login"
                type="text"
                placeholder="Enter your email or number"
                value={formData.login}
                onChange={handleInputChange}
                required
                className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364]"
                aria-invalid={!!formErrors.login}
                aria-describedby="login-error"
              />
              {formErrors.login && (
                <p id="login-error" className="text-red-500 text-xs mt-1">{formErrors.login}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364] pr-10"
                  aria-invalid={!!formErrors.password}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p id="password-error" className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647] transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google';
            }}
            disabled={isLoading}
            className="w-full border-[#0E2647] text-[#0E2647] hover:bg-[#0E2647] hover:text-white transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-[#FAB364] underline underline-offset-4 font-medium"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  )
} 