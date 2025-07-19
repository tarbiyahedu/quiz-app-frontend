# Quiz App Frontend

A modern, responsive quiz application built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features Implemented

### 🔐 Authentication & Authorization
- **Google OAuth Integration** - Sign in with Google accounts
- **Role-based Routing** - Admin and Student dashboards
- **Protected Routes** - Middleware-based route protection
- **JWT Token Management** - Secure authentication with localStorage

### 🏠 Homepage Design
- **Hero Section** - "Learn. Compete. Excel." with animated illustrations
- **Feature Cards** - Live Quiz, Assignment Quiz, Leaderboard
- **Statistics Section** - User engagement metrics
- **Responsive Design** - Mobile-first approach

### 🎯 Quiz Management
- **Join Quiz Page** - Enter quiz codes to join live/assignment quizzes
- **Quiz Taking Interface** - Real-time timer, progress tracking, question navigation
- **Multiple Question Types** - MCQ, True/False, Short Answer, Long Answer, Fill in Blanks
- **Auto-submission** - Automatic submission when time expires

### 📊 Dashboard & Analytics
- **Student Dashboard** - Sidebar navigation with quiz categories
- **Admin Dashboard** - User management, quiz creation, analytics
- **Leaderboard** - Performance tracking with charts and statistics
- **Progress Tracking** - Visual progress indicators and performance metrics

### 🎨 UI/UX Features
- **Framer Motion Animations** - Smooth page transitions and micro-interactions
- **Responsive Design** - Works on all device sizes
- **Loading States** - Spinners and skeleton loaders
- **Toast Notifications** - Success, error, and info messages
- **Dark/Light Theme Support** - Theme-aware components

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom components with Radix UI primitives
- **Real-time**: Socket.IO Client

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Backend API running on port 5000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-app-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_API_URL=https://quiz-app-backend-pi.vercel.app/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Quiz App Configarution

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # User dashboard
│   ├── join/             # Join quiz page
│   ├── leaderboard/      # Leaderboard page
│   ├── quiz/             # Quiz taking interface
│   │   └── [id]/
│   │       ├── take/
│   │       ├── live/
│   │       └── results/
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   └── ui/              # Base UI components
├── lib/                 # Utility functions and configurations
│   ├── api.ts          # API service layer
│   ├── auth-context.tsx # Authentication context
│   └── utils.ts        # Utility functions
├── types/              # TypeScript type definitions
└── middleware.ts       # Route protection middleware
```

## Key Components

### Authentication Context
- Manages user state and authentication
- Handles login, logout, and token management
- Provides role-based access control

### API Service Layer
- Centralized API communication
- Automatic token injection
- Error handling and response interceptors

### Quiz Interface
- Real-time timer with auto-submission
- Question navigation with progress tracking
- Support for multiple question types
- Responsive design for all devices

### Dashboard
- Role-based dashboard views
- Sidebar navigation
- Quiz management and analytics
- Performance tracking

## API Integration

The frontend integrates with the backend API through the following endpoints:

- **Authentication**: `/api/users/login`, `/api/users/register`, `/api/users/google-login`
- **Live Quizzes**: `/api/live-quizzes/*`
- **Assignment Quizzes**: `/api/assignments/*`
- **Leaderboards**: `/api/live-leaderboard/*`, `/api/assignment-leaderboard/*`
- **User Management**: `/api/users/*`

## Features in Development

- [ ] Real-time quiz rooms with Socket.IO
- [ ] Advanced analytics and reporting
- [ ] PDF result export
- [ ] Push notifications
- [ ] Offline quiz support
- [ ] Accessibility improvements
- [ ] Unit and integration tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
