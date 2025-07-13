"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { departmentAPI } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "student"
  })
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await departmentAPI.getActiveDepartments();
        // Map to the expected format
        const activeDepartments = (res.data.data || [])
          .map((dept: unknown) => ({
            _id: (dept as { _id: string })._id,
            name: (dept as { name: string }).name
          }));
        setDepartments(activeDepartments);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load departments. Please refresh the page.";
        console.error("Error fetching departments:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    }
    fetchDepartments();
  }, [toast]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      })
      setIsLoading(false)
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        number: formData.number,
        password: formData.password,
        department: formData.department,
        role: 'student'
      })
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
      router.push("/dashboard")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-[#0E2647] to-[#1e3a8a] p-10 text-white lg:flex">
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center space-x-2">
            <span>Tarbiyah Quiz</span>
          </Link>
        </div>
        <div className="relative z-20 flex flex-col justify-center flex-1">
          <h2 className="text-4xl font-bold mb-4">Join Our Community!</h2>
          <p className="text-lg text-blue-100">
            Create your account and start your learning journey with interactive quizzes and real-time competitions.
          </p>
        </div>
      </div>
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0E2647]">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your account
          </p>
        </div>
        
        <div className="grid gap-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input
                id="number"
                name="number"
                type="text"
                placeholder="Enter your phone number"
                value={formData.number}
                onChange={handleInputChange}
                required
                className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleSelectChange}
                required
                className="w-full p-3 border border-[#0E2647] rounded-lg focus:ring-2 focus:ring-[#FAB364] focus:border-[#FAB364]"
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="border-[#0E2647] focus:border-[#FAB364] focus:ring-[#FAB364]"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647] transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="hover:text-[#FAB364] underline underline-offset-4 font-medium"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
