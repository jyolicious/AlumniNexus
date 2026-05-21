import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// ── Auth pages ──────────────────────────────────────────
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// ── Student pages ───────────────────────────────────────
import StudentDashboard from './pages/student/Dashboard'
import AlumniList       from './pages/student/AlumniList'
import Opportunities    from './pages/student/Opportunities'
import MentorshipSent   from './pages/student/MentorshipSent'

// ── Alumni pages ────────────────────────────────────────
import AlumniDashboard    from './pages/alumni/Dashboard'
import AlumniProfile      from './pages/alumni/Profile'
import AlumniSessions     from './pages/alumni/Sessions'
import AlumniOpportunities from './pages/alumni/Opportunities'
import BrowseOpportunities from './pages/alumni/BrowseOpportunities'
import MentorshipReceived from './pages/alumni/MentorshipReceived'

// ── Admin pages ─────────────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard'
import VerifyAlumni   from './pages/admin/VerifyAlumni'
import ModerateBlog   from './pages/admin/ModerateBlog'
import AdminUsers     from './pages/admin/Users'

// ── Shared pages ────────────────────────────────────────
import SessionList from './pages/shared/SessionList'
import JoinSession from './pages/shared/JoinSession'
import BlogList    from './pages/shared/BlogList'
import BlogCreate  from './pages/shared/BlogCreate'

// ────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
})

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-5 h-5 border border-white/20 border-t-white/70 rounded-full animate-spin" />
    </div>
  )
}

// Redirects logged-in user to their role's dashboard
function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN')  return <Navigate to="/admin"   replace />
  if (user.role === 'ALUMNI') return <Navigate to="/alumni"  replace />
  return <Navigate to="/student" replace />
}

// Blocks unauthenticated users; optionally restricts to specific roles
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '0.5px solid rgba(255,255,255,0.1)',
                fontSize: '13px',
              },
            }}
          />
          <Routes>

            {/* Root → role redirect */}
            <Route path="/" element={<RoleRedirect />} />

            {/* Public */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student */}
            <Route path="/student" element={
              <ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/student/alumni" element={
              <ProtectedRoute roles={['STUDENT']}><AlumniList /></ProtectedRoute>
            } />
            <Route path="/student/opportunities" element={
              <ProtectedRoute roles={['STUDENT']}><Opportunities /></ProtectedRoute>
            } />
            <Route path="/student/mentorship" element={
              <ProtectedRoute roles={['STUDENT']}><MentorshipSent /></ProtectedRoute>
            } />

            {/* Alumni */}
            <Route path="/alumni" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniDashboard /></ProtectedRoute>
            } />
            <Route path="/alumni/profile" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniProfile /></ProtectedRoute>
            } />
            <Route path="/alumni/sessions" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniSessions /></ProtectedRoute>
            } />
            <Route path="/alumni/mentorship" element={
              <ProtectedRoute roles={['ALUMNI']}><MentorshipReceived /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/verify" element={
              <ProtectedRoute roles={['ADMIN']}><VerifyAlumni /></ProtectedRoute>
            } />
            <Route path="/admin/moderate" element={
              <ProtectedRoute roles={['ADMIN']}><ModerateBlog /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>
            } />

            {/* Shared — any logged-in role */}
            <Route path="/sessions" element={
              <ProtectedRoute><SessionList /></ProtectedRoute>
            } />
            <Route path="/sessions/join" element={
              <ProtectedRoute><JoinSession /></ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute><BlogList /></ProtectedRoute>
            } />
            <Route path="/blogs/new" element={
              <ProtectedRoute roles={['ALUMNI']}><BlogCreate /></ProtectedRoute>
            } />
            <Route path="/alumni/opportunities" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniOpportunities /></ProtectedRoute>
            } />
            <Route path="/alumni/browse-opportunities" element={
              <ProtectedRoute roles={['ALUMNI']}><BrowseOpportunities /></ProtectedRoute>
            } />
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}