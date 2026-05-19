import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import MentorshipModal from '../../components/MentorshipModal'

const DEPARTMENTS = ['All', 'Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
const INDUSTRIES = ['All', 'Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'Startup']

export default function AlumniList() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [industry, setIndustry] = useState('All')
  const [mentorOnly, setMentorOnly] = useState(false)
  const [selected, setSelected] = useState(null)

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ['alumni', dept, industry, mentorOnly],
    queryFn: () => api.get('/alumni', {
      params: {
        ...(dept !== 'All' && { department: dept }),
        ...(industry !== 'All' && { industry }),
        ...(mentorOnly && { isOpenToMentor: true }),
      }
    }).then(r => r.data),
  })

  const filtered = alumni.filter(a =>
    !search ||
    a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.currentRole?.toLowerCase().includes(search.toLowerCase()) ||
    a.currentOrg?.toLowerCase().includes(search.toLowerCase()) ||
    a.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Find Alumni</h1>
        <p className="text-white/40 text-sm mt-1">Connect with {alumni.length} verified alumni</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, role, company, skill..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
          />
        </div>

        <select value={dept} onChange={e => setDept(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none appearance-none min-w-[160px]">
          {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
        </select>

        <select value={industry} onChange={e => setIndustry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none appearance-none min-w-[140px]">
          {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#1a1a1a]">{i}</option>)}
        </select>

        <button
          onClick={() => setMentorOnly(!mentorOnly)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
            mentorOnly ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/25'
          }`}
        >
          Open to mentor
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/10 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/10 rounded" />
                <div className="h-2 bg-white/10 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">◎</p>
          <p className="text-white/40 text-sm">No alumni found</p>
          <p className="text-white/20 text-xs mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <AlumniCard key={a._id} alumni={a} onConnect={() => setSelected(a)} />
          ))}
        </div>
      )}

      {selected && (
        <MentorshipModal alumni={selected} onClose={() => setSelected(null)} />
      )}
    </Layout>
  )
}

function AlumniCard({ alumni: a, onConnect }) {
  const initials = a.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all group flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {a.user?.avatarUrl ? <img src={a.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium text-sm truncate">{a.user?.name}</p>
            {a.isOpenToMentor && (
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">Mentor</span>
            )}
          </div>
          <p className="text-white/40 text-xs truncate mt-0.5">
            {a.currentRole ? `${a.currentRole}${a.currentOrg ? ` @ ${a.currentOrg}` : ''}` : 'Role not set'}
          </p>
        </div>
        {a.reputationScore > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-white/60 text-xs font-semibold">{a.reputationScore}</p>
            <p className="text-white/20 text-[9px]">rep</p>
          </div>
        )}
      </div>

      <div className="space-y-1.5 mb-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-white/35">
          <span>◎</span>
          <span>{a.department} · {a.graduationYear}</span>
        </div>
        {a.industry && (
          <div className="flex items-center gap-2 text-xs text-white/35">
            <span>◈</span>
            <span>{a.industry}</span>
          </div>
        )}
        {a.isStartupFounder && (
          <div className="flex items-center gap-2 text-xs text-amber-400/70">
            <span>◇</span>
            <span>Founder — {a.startupName || 'Startup'}</span>
          </div>
        )}
      </div>

      {a.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {a.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] bg-white/6 text-white/40 px-2 py-0.5 rounded-md">{s}</span>
          ))}
          {a.skills.length > 4 && <span className="text-[10px] text-white/20">+{a.skills.length - 4}</span>}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onConnect}
          className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 active:scale-[0.98] transition-all"
        >
          Request Mentorship
        </button>
        {a.linkedinUrl && (
          <a
            href={a.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/25 transition-all text-sm"
          >
            in
          </a>
        )}
      </div>
    </div>
  )
}