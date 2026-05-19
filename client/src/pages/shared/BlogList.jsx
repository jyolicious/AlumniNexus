// BlogList.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const DIFFICULTY = { EASY: 'emerald', MEDIUM: 'amber', HARD: 'red' }

export function BlogList() {
  const { user } = useAuth()
  const [company, setCompany] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [expanded, setExpanded] = useState(null)

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs', company, difficulty],
    queryFn: () => api.get('/blogs', { params: { ...(company && { company }), ...(difficulty && { difficulty }) } }).then(r => r.data),
  })

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Interview Experiences</h1>
          <p className="text-white/40 text-sm mt-1">{blogs.length} curated experiences from alumni</p>
        </div>
        {user?.role === 'ALUMNI' && (
          <Link to="/blogs/new" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all">
            + Write yours
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={company} onChange={e => setCompany(e.target.value)}
          placeholder="Filter by company..."
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" />

        {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
              difficulty === d ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/25'
            }`}>
            {d || 'All difficulty'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-28" />)}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">≡</p>
          <p className="text-white/40 text-sm">No blogs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(b => {
            const isOpen = expanded === b._id
            const dc = DIFFICULTY[b.difficulty]
            return (
              <div key={b._id} className="bg-white/3 border border-white/8 rounded-xl overflow-hidden hover:border-white/12 transition-all">
                <button onClick={() => setExpanded(isOpen ? null : b._id)} className="w-full text-left p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-medium text-sm">{b.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${dc}-500/15 text-${dc}-400`}>{b.difficulty}</span>
                        {b.outcome === 'OFFER' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Got Offer ✓</span>}
                      </div>
                      <p className="text-white/40 text-xs">
                        {b.company} · {b.role}
                        {b.domain && ` · ${b.domain}`}
                        {' · '}{b.year}
                      </p>
                    </div>
                    <span className="text-white/25 text-lg flex-shrink-0">{isOpen ? '−' : '+'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap mb-4">{b.content}</p>
                    {b.tips && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-2">Tips from the author</p>
                        <p className="text-white/50 text-sm leading-relaxed">{b.tips}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">
                        {b.author?.name?.charAt(0)}
                      </div>
                      <span className="text-white/25 text-xs">{b.author?.name}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
export default BlogList