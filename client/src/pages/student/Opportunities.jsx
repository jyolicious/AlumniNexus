import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  JOB:        { color: 'emerald', icon: '◈', label: 'Job' },
  INTERNSHIP: { color: 'blue',    icon: '◇', label: 'Internship' },
  MENTORSHIP: { color: 'purple',  icon: '◎', label: 'Mentorship' },
  EVENT:      { color: 'amber',   icon: '▷', label: 'Event' },
}

export default function Opportunities() {
  const [type, setType] = useState('ALL')
  const [applyingTo, setApplyingTo] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const qc = useQueryClient()

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities', type],
    queryFn: () => api.get('/opportunities', { params: type !== 'ALL' ? { type } : {} }).then(r => r.data),
  })

  const applyMutation = useMutation({
    mutationFn: async (id) => {

  const formData = new FormData();

  formData.append('coverNote', coverNote);

  formData.append('resume', resumeFile);

  const res = await api.post(
    `/opportunities/${id}/apply`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data;
},
    onSuccess: () => {
      toast.success('Application submitted!')
      setApplyingTo(null)
      setCoverNote('')
      qc.invalidateQueries(['opportunities'])
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to apply'),
  })

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Opportunities</h1>
        <p className="text-white/40 text-sm mt-1">Jobs, internships, and events posted by alumni</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'JOB', 'INTERNSHIP', 'MENTORSHIP', 'EVENT'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              type === t ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/60'
            }`}>
            {t === 'ALL' ? 'All' : TYPE_CONFIG[t]?.label ?? 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">◈</p>
          <p className="text-white/40 text-sm">No opportunities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map(o => {
            const cfg = TYPE_CONFIG[o.type]
            return (
              <div key={o._id} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-${cfg.color}-500/15 flex items-center justify-center text-${cfg.color}-400 flex-shrink-0`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-medium text-sm">{o.title}</h3>
                        <p className="text-white/40 text-xs mt-0.5">
                          {o.company || o.postedBy?.name}
                          {o.location && ` · ${o.location}`}
                          {o.domain && ` · ${o.domain}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${cfg.color}-500/15 text-${cfg.color}-400`}>
                          {cfg.label}
                        </span>
                        {o.deadline && (
                          <span className="text-[10px] text-white/25">
                            Due {new Date(o.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/30 text-xs mt-2 line-clamp-2">{o.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-white/20 text-xs">Posted by {o.postedBy?.name}</p>
                      <button
                        onClick={() => setApplyingTo(o)}
                        className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 active:scale-[0.98] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Apply modal */}
      {applyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setApplyingTo(null)} />
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold">Apply</h2>
                <p className="text-white/40 text-xs mt-0.5">{applyingTo.title}</p>
              </div>
              <button onClick={() => setApplyingTo(null)} className="text-white/30 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Cover note</label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  placeholder="Why are you a good fit? What excites you about this?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
                />
              </div>
              <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">
                Resume (PDF Required)
              </label>

              <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setApplyingTo(null)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 text-sm hover:border-white/20 transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => applyMutation.mutate(applyingTo._id)}
                  disabled={applyMutation.isLoading || !resumeFile}
                  className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50">
                  {applyMutation.isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}