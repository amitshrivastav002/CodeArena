import { createBrowserRouter, Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import ProtectedRoute from '../features/auth/components/ProtectedRoute'
import LandingPage from '../features/landing/pages/LandingPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ProblemsPage from '../features/problems/pages/ProblemsPage'
import WorkspacePage from '../features/workspace/pages/WorkspacePage'
import SubmissionsPage from '../features/submissions/pages/SubmissionsPage'
import SubmissionDetailPage from '../features/submissions/pages/SubmissionDetailPage'
import ProfilePage from '../features/profile/pages/ProfilePage'
import LeaderboardPage from '../features/leaderboard/pages/LeaderboardPage'
import AdminProblemsPage from '../features/admin/pages/AdminProblemsPage'

const NotFound = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">404 — Page not found</h1>
    <Link to="/" className="text-sky-600 underline">Go home</Link>
  </div>
)

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/problems', element: <ProblemsPage /> },
      { path: '/profile/:username', element: <ProfilePage /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/problems/:slug', element: <WorkspacePage /> },
          { path: '/submissions', element: <SubmissionsPage /> },
          { path: '/submissions/:id', element: <SubmissionDetailPage /> },
        ],
      },
      {
        element: <ProtectedRoute adminOnly />,
        children: [{ path: '/admin/problems', element: <AdminProblemsPage /> }],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
