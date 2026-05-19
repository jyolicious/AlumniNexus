import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// nav items per role
const NAV = {
  STUDENT: [
    { path: '/student',               icon: '⊞', label: 'Dashboard' },
    { path: '/student/alumni',        icon: '◎', label: 'Find Alumni' },
    { path: '/student/opportunities', icon: '◈', label: 'Opportunities' },
    { path: '/student/mentorship',    icon: '◇', label: 'Mentorship' },
    { path: '/sessions',              icon: '▷', label: 'Live Sessions' },
    { path: '/blogs',                 icon: '≡', label: 'Interview Blogs' },
  ],
  ALUMNI: [
    { path: '/alumni',             icon: '⊞', label: 'Dashboard' },
    { path: '/alumni/profile',     icon: '◎', label: 'My Profile' },
    { path: '/alumni/mentorship',  icon: '◇', label: 'Mentorship' },
    { path: '/alumni/sessions',    icon: '▷', label: 'My Sessions' },
    { path: '/sessions',           icon: '◈', label: 'All Sessions' },
    { path: '/blogs/new',          icon: '＋', label: 'Write Blog' },
    { path: '/blogs',              icon: '≡', label: 'Interview Blogs' },
  ],
  ADMIN: [
    { path: '/admin',          icon: '⊞', label: 'Dashboard' },
    { path: '/admin/verify',   icon: '✓', label: 'Verify Alumni' },
    { path: '/admin/moderate', icon: '◈', label: 'Moderate Blogs' },
    { path: '/admin/users',    icon: '◎', label: 'All Users' },
  ],
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = NAV[user?.role] || []

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-xs">A</span>
        </div>
        <span className="text-white font-medium text-sm">AlumniNexus</span>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
          user?.role === 'ADMIN' ? 'bg-amber-500/15 text-amber-400' :
          user?.role === 'ALUMNI' ? 'bg-blue-500/15 text-blue-400' :
          'bg-emerald-500/15 text-emerald-400'
        }`}>
          {user?.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon, label }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-white/30 text-[10px] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/25 hover:text-white/60 transition-colors text-lg leading-none"
            title="Sign out"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col bg-[#111] border-r border-white/5 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[#111] border-r border-white/5 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/50 hover:text-white text-xl"
          >
            ☰
          </button>
          <span className="text-white text-sm font-medium">AlumniNexus</span>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
            {user?.name?.charAt(0)}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}