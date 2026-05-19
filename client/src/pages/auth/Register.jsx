import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Other'
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = role, 2 = details
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    role: '', name: '', email: '', password: '',
    department: '', graduationYear: '', currentYear: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,

        ...(form.role === 'ALUMNI' && {
          alumniProfile: {
            department: form.department,
            graduationYear: Number(form.graduationYear),
          },
        }),

        ...(form.role === 'STUDENT' && {
          studentProfile: {
            department: form.department,
            currentYear: Number(form.currentYear),
          },
        }),
      }
      const user = await register(payload)
      toast.success('Account created!')
      if (user.role === 'ALUMNI') navigate('/alumni')
      else navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">A</span>
          </div>
          <span className="text-white font-medium">AlumniNexus</span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Create account</h1>
        <p className="text-white/40 text-sm mb-8">Join the alumni network</p>

        {/* Step 1 — Role selection */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-white/50 uppercase tracking-widest font-medium mb-4">I am a</p>
            {[
              { role: 'STUDENT', label: 'Student', desc: 'Currently enrolled, looking for mentorship and opportunities' },
              { role: 'ALUMNI', label: 'Alumni', desc: 'Graduate, want to give back and support current students' },
            ].map(({ role, label, desc }) => (
              <button
                key={role}
                onClick={() => { set('role', role); setStep(2) }}
                className="w-full text-left border border-white/10 rounded-xl p-5 hover:border-white/25 hover:bg-white/3 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">{label}</p>
                  <span className="text-white/20 group-hover:text-white/50 transition-colors text-lg">→</span>
                </div>
                <p className="text-white/35 text-xs mt-1 leading-relaxed">{desc}</p>
              </button>
            ))}

            <p className="text-center text-white/30 text-sm pt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-white/80 transition-colors">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2 — Details form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">
                Registering as {form.role === 'ALUMNI' ? 'Alumni' : 'Student'}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← Change
              </button>
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { key: 'name', label: 'Full name', type: 'text', placeholder: 'Arjun Sharma' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'arjun@college.edu' },
                { key: 'password', label: 'Password', type: 'password', placeholder: '6+ characters' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Department</label>
              <select
                required
                value={form.department}
                onChange={e => set('department', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all appearance-none"
              >
                <option value="" className="bg-[#1a1a1a]">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
              </select>
            </div>

            {/* Role-specific field */}
            {form.role === 'ALUMNI' && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Graduation Year</label>
                <input
                  type="number"
                  required
                  placeholder="2022"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={form.graduationYear}
                  onChange={e => set('graduationYear', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
            )}

            {form.role === 'STUDENT' && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Current Year</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => set('currentYear', y)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        form.currentYear === y
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/50 border-white/10 hover:border-white/25'
                      }`}
                    >
                      Year {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium text-sm py-2.5 rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-white/30 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-white/60 hover:text-white transition-colors">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}