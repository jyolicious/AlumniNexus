import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AlumniSessions() {
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', topic: '', joinPassword: '', slots: 50, scheduledAt: '', duration: 60 })
  const qc = useQueryClient()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => api.get('/sessions/my').then(r => r.data),
  })

  const sessionsSorted = sessions.slice().sort((a, b) => {
    if (a.status === b.status) return new Date(a.scheduledAt) - new Date(b.scheduledAt)
    if (a.status === 'LIVE') return -1
    if (b.status === 'LIVE') return 1
    return 0
  })

  // download attendance CSV for a session
  const downloadAttendance = async (id, joinCode) => {
    try {
      const res = await api.get(`/sessions/${id}/attendance`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-${joinCode || id}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to download attendance')
    }
  }

  const copySessionDetails = async (session) => {
    const details = `Join Code: ${session.joinCode}\nPassword: ${session.joinPassword}`
    try {
      await navigator.clipboard.writeText(details)
      toast.success('Session details copied to clipboard')
    } catch (err) {
      toast.error('Unable to copy session details')
    }
  }

  const createMutation = useMutation({
    mutationFn: () => api.post('/sessions', form),
    onSuccess: () => {
      toast.success('Session created!')
      setShowCreate(false)
      setForm({ title: '', description: '', topic: '', joinPassword: '', slots: 50, scheduledAt: '', duration: 60 })
      qc.invalidateQueries(['my-sessions'])
    },
    onError: err => toast.error(err.response?.data?.error || 'Failed to create session'),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/sessions/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated!'); qc.invalidateQueries(['my-sessions']) },
    onError: err => toast.error(err.response?.data?.error || 'Failed'),
  })

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">My Sessions</h1>
          <p className="text-white/40 text-sm mt-1">Host live sessions for students</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-all">
          + New session
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-36" />)}</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">▷</p>
          <p className="text-white/40 text-sm mb-4">No sessions yet</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all">
            Host your first session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessionsSorted.map(s => (
            <div key={s._id} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/12 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{s.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      s.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                      s.status === 'ENDED' ? 'bg-white/10 text-white/30' :
                      'bg-blue-500/15 text-blue-400'
                    }`}>{s.status}</span>
                  </div>
                  <p className="text-white/40 text-xs">{s.topic}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-semibold">{s.attendees?.length || 0} / {s.slots}</p>
                  <p className="text-white/30 text-xs">joined</p>
                </div>
              </div>

              {/* Session code + password */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Join Code</p>
                  <p className="text-white font-mono font-semibold text-lg tracking-widest">{s.joinCode}</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Password</p>
                  <p className="text-white font-mono text-sm">{s.joinPassword}</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Scheduled</p>
                  <p className="text-white text-xs">{new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-[auto_auto_1fr] items-center">
                <div className="flex flex-wrap gap-2">
                  {s.status === 'UPCOMING' && (
                    <button onClick={() => updateStatus.mutate({ id: s._id, status: 'LIVE' })}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-all">
                      Mark as Live
                    </button>
                  )}
                  {s.status === 'LIVE' && (
                    <button onClick={() => updateStatus.mutate({ id: s._id, status: 'ENDED' })}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white/50 text-xs hover:bg-white/15 transition-all">
                      End Session
                    </button>
                  )}
                  <button onClick={() => downloadAttendance(s._id, s.joinCode)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/40 hover:bg-white/3">
                    Download Attendance
                  </button>
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 justify-end">
                  <a href={`/sessions/join?code=${s.joinCode}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
                    Join Session
                  </a>
                  <button onClick={() => copySessionDetails(s)}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/40 hover:bg-white/3 transition-all">
                    Copy Code & Password
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create session modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Create Live Session</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              {[
                { k: 'title', label: 'Session Title', placeholder: 'Cracking FAANG Interviews' },
                { k: 'topic', label: 'Topic / Domain', placeholder: 'DSA, System Design...' },
                { k: 'joinPassword', label: 'Join Password', placeholder: 'Students enter this to join' },
              ].map(({ k, label, placeholder }) => (
                <div key={k}>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">{label}</label>
                  <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Description (optional)</label>
                <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="What will you cover in this session?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Scheduled At</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Slots</label>
                  <input type="number" value={form.slots} onChange={e => set('slots', Number(e.target.value))} min={1} max={500}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 text-sm hover:border-white/20 transition-all">
                  Cancel
                </button>
                <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}