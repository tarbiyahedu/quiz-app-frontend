import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function generateQuizCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Demo data types
export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit: number
  createdBy: string
  createdAt: Date
  isLive: boolean
  code?: string
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  points: number
  timeLimit: number
}

export interface User {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student'
}

// Demo data
export const demoQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'JavaScript Basics',
    description: 'Test your knowledge of JavaScript fundamentals',
    questions: [
      {
        id: 'q1',
        text: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'x = 5;', 'let x = 5;'],
        correctAnswer: 3,
        points: 10,
        timeLimit: 30
      },
      {
        id: 'q2',
        text: 'Which of the following is not a JavaScript data type?',
        options: ['String', 'Boolean', 'Float', 'Number'],
        correctAnswer: 2,
        points: 10,
        timeLimit: 30
      }
    ],
    timeLimit: 300,
    createdBy: 'teacher1',
    createdAt: new Date(),
    isLive: false
  }
]

export const demoUsers: User[] = [
  {
    id: 'teacher1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'teacher'
  },
  {
    id: 'student1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student'
  }
]
