﻿"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { departmentAPI } from "@/lib/api"
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox"

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
    departments: [] as string[],
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
          .map((dept: any) => ({
            _id: dept._id,
            name: dept.name
          }));
        setDepartments(activeDepartments);
      } catch (err) {
        console.error("Error fetching departments:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load departments. Please refresh the page.",
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
      // Convert department names to department IDs
      const departmentIds = formData.departments
        .map(deptName => departments.find((dept: any) => dept.name === deptName)?._id)
        .filter(Boolean);

      await register({
        name: formData.name,
        email: formData.email,
        number: formData.number,
        password: formData.password,
        departments: departmentIds,
        role: 'student'
      })
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account",
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
              <Label htmlFor="departments">Departments</Label>
              <MultiSelectCombobox
                options={departments.map((dept: any) => ({ value: dept.name, label: dept.name }))}
                value={formData.departments}
                onChange={(vals) => setFormData({ ...formData, departments: vals })}
                placeholder="Select your departments"
              />
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
