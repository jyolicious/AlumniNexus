import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics & Communication','Mechanical','Civil','Electrical','Chemical','Biotechnology','Other']
const INDUSTRIES = ['Technology','Finance','Healthcare','Education','Consulting','Manufacturing','Media','Startup','Other']

export default function AlumniProfile() {
  const { user } = useAuth()
  const p = user?.alumniProfile

  const [form, setForm] = useState({
    department: p?.department || '',
    graduationYear: p?.graduationYear || '',
    degree: p?.degree || 'B.Tech',
    currentRole: p?.currentRole || '',
    currentOrg: p?.currentOrg || '',
    industry: p?.industry || '',
    location: p?.location || '',
    isStartupFounder: p?.isStartupFounder || false,
    startupName: p?.startupName || '',
    bio: p?.bio || '',
    skills: p?.skills?.join(', ') || '',
    linkedinUrl: p?.linkedinUrl || '',
    isOpenToMentor: p?.isOpenToMentor !== false,
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/alumni/profile', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const verifyStatus = p?.verifyStatus || 'PENDING'

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">My Profile</h1>
          <p className="text-white/40 text-sm mt-1">Update your professional information</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
          verifyStatus === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' :
          verifyStatus === 'REJECTED' ? 'bg-red-500/15 text-red-400' :
          'bg-amber-500/15 text-amber-400'
        }`}>
          {verifyStatus === 'APPROVED' ? '✓ Verified' : verifyStatus === 'REJECTED' ? '✕ Rejected' : '◎ Pending'}
        </span>
      </div>

      <form onSubmit={submit} className="space-y-6 max-w-2xl">

        {/* Education */}
        <section className="bg-white/3 border border-white/8 rounded-xl p-5">
          <h2 className="text-white/60 text-xs uppercase tracking-widest font-medium mb-4">Education</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Department</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none appearance-none">
                <option value="" className="bg-[#1a1a1a]">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Graduation Year</label>
              <input type="number" min="1990" max={new Date().getFullYear()} value={form.graduationYear}
                onChange={e => set('graduationYear', e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Degree</label>
              <input value={form.degree} onChange={e => set('degree', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
            </div>
          </div>
        </section>

        {/* Current role */}
        <section className="bg-white/3 border border-white/8 rounded-xl p-5">
          <h2 className="text-white/60 text-xs uppercase tracking-widest font-medium mb-4">Current Role</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'currentRole', label: 'Role / Designation', placeholder: 'Senior Software Engineer' },
              { key: 'currentOrg',  label: 'Organization',       placeholder: 'Google' },
              { key: 'location',    label: 'Location',           placeholder: 'Bengaluru, India' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-white/40 mb-1.5">{label}</label>
                <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none placeholder:text-white/15" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Industry</label>
              <select value={form.industry} onChange={e => set('industry', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none appearance-none">
                <option value="" className="bg-[#1a1a1a]">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#1a1a1a]">{i}</option>)}
              </select>
            </div>
          </div>

          {/* Startup toggle */}
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={() => set('isStartupFounder', !form.isStartupFounder)}
              className={`w-10 h-5 rounded-full transition-all relative ${form.isStartupFounder ? 'bg-white' : 'bg-white/15'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${form.isStartupFounder ? 'left-5' : 'left-0.5'}`} />
            </button>
            <label className="text-white/50 text-sm cursor-pointer" onClick={() => set('isStartupFounder', !form.isStartupFounder)}>
              I'm a startup founder
            </label>
          </div>
          {form.isStartupFounder && (
            <div className="mt-3">
              <label className="block text-xs text-white/40 mb-1.5">Startup name</label>
              <input value={form.startupName} onChange={e => set('startupName', e.target.value)} placeholder="Acme Inc."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none placeholder:text-white/15" />
            </div>
          )}
        </section>

        {/* Bio & skills */}
        <section className="bg-white/3 border border-white/8 rounded-xl p-5">
          <h2 className="text-white/60 text-xs uppercase tracking-widest font-medium mb-4">About</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)}
                placeholder="Tell students about your journey..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none resize-none placeholder:text-white/15" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Skills <span className="text-white/20">(comma separated)</span></label>
              <input value={form.skills} onChange={e => set('skills', e.target.value)}
                placeholder="React, Node.js, System Design, Python..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none placeholder:text-white/15" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none placeholder:text-white/15" />
            </div>
          </div>
        </section>

        {/* Mentorship toggle */}
        <section className="bg-white/3 border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Open to mentorship</p>
              <p className="text-white/35 text-xs mt-0.5">Students will be able to send you mentorship requests</p>
            </div>
            <button type="button" onClick={() => set('isOpenToMentor', !form.isOpenToMentor)}
              className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${form.isOpenToMentor ? 'bg-emerald-500' : 'bg-white/15'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isOpenToMentor ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </section>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </Layout>
  )
}