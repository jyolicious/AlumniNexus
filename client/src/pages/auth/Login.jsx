import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'ALUMNI') navigate('/alumni')
      else navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">A</span>
          </div>
          <span className="text-white font-medium tracking-tight">AlumniNexus</span>
        </div>

        <div>
          <blockquote className="text-3xl font-light text-white leading-snug tracking-tight mb-6">
            "The network you build in college is the foundation you build your career on."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">P</div>
            <div>
              <p className="text-white text-sm font-medium">Prof. Kavita Mehta</p>
              <p className="text-white/40 text-xs">Dean, Engineering — Batch of 2008</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['2,400+', 'Alumni'], ['340+', 'Mentors'], ['1,200+', 'Placements']].map(([n, l]) => (
            <div key={l} className="border border-white/10 rounded-xl p-4">
              <p className="text-white text-xl font-semibold">{n}</p>
              <p className="text-white/40 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <span className="text-white font-medium">AlumniNexus</span>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Sign in</h1>
          <p className="text-white/40 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                placeholder="you@college.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-widest">Password</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium text-sm py-2.5 rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:text-white/80 transition-colors">
              Register
            </Link>
          </p>

          {/* Demo accounts hint */}
          <div className="mt-8 border border-white/5 rounded-xl p-4 space-y-2">
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-3">Demo accounts</p>
            {[
              { role: 'Admin', email: 'admin@college.edu', pw: 'admin123' },
              { role: 'Alumni', email: 'alumni@example.com', pw: 'alumni123' },
              { role: 'Student', email: 'student@college.edu', pw: 'student123' },
            ].map(a => (
              <button
                key={a.role}
                onClick={() => setForm({ email: a.email, password: a.pw })}
                className="w-full text-left flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span className="text-white/40 text-xs group-hover:text-white/60 transition-colors">{a.role}</span>
                <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors">{a.email}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}