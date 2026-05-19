import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUS = {
  PENDING:   { color: 'amber',   label: 'Pending' },
  ACCEPTED:  { color: 'emerald', label: 'Accepted' },
  DECLINED:  { color: 'red',     label: 'Declined' },
  COMPLETED: { color: 'blue',    label: 'Completed' },
}

export default function MentorshipReceived() {
  const [responding, setResponding] = useState(null)
  const [responseNote, setResponseNote] = useState('')
  const [filter, setFilter] = useState('PENDING')
  const qc = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['mentorship-received'],
    queryFn: () => api.get('/mentorship/received').then(r => r.data),
  })

  const respond = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/mentorship/${id}`, { status, responseNote }),
    onSuccess: () => {
      toast.success('Response sent!')
      setResponding(null)
      setResponseNote('')
      qc.invalidateQueries(['mentorship-received'])
    },
    onError: err => toast.error(err.response?.data?.error || 'Failed'),
  })

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Mentorship Requests</h1>
        <p className="text-white/40 text-sm mt-1">{requests.filter(r => r.status === 'PENDING').length} pending · {requests.length} total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'ALL'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === s ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/25'
            }`}>
            {s === 'ALL' ? 'All' : STATUS[s]?.label || s}
            {s !== 'ALL' && <span className="ml-1.5 text-white/30">{requests.filter(r => r.status === s).length}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-32" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">◇</p>
          <p className="text-white/40 text-sm">No {filter.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const st = STATUS[r.status]
            return (
              <div key={r._id} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/12 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
                      {r.sender?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{r.sender?.name}</p>
                      <p className="text-white/35 text-xs">
                        {r.sender?.studentProfile?.department} · Year {r.sender?.studentProfile?.currentYear}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full bg-${st.color}-500/15 text-${st.color}-400 flex-shrink-0`}>
                    {st.label}
                  </span>
                </div>

                <div className="bg-white/3 rounded-lg p-3 mb-3">
                  <p className="text-white/60 text-xs font-medium mb-1">Topic: {r.topic}</p>
                  <p className="text-white/35 text-xs leading-relaxed">{r.message}</p>
                </div>

                {r.responseNote && (
                  <p className="text-white/30 text-xs italic mb-3">Your response: "{r.responseNote}"</p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-white/20 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => { setResponding({ ...r, action: 'DECLINED' }); setResponseNote('') }}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:border-red-500/30 hover:text-red-400 transition-all">
                        Decline
                      </button>
                      <button onClick={() => { setResponding({ ...r, action: 'ACCEPTED' }); setResponseNote('') }}
                        className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
                        Accept
                      </button>
                    </div>
                  )}
                  {r.status === 'ACCEPTED' && (
                    <button onClick={() => respond.mutate({ id: r._id, status: 'COMPLETED' })}
                      className="px-3 py-1.5 rounded-lg border border-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/10 transition-all">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Respond modal */}
      {responding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setResponding(null)} />
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-1">
              {responding.action === 'ACCEPTED' ? 'Accept request' : 'Decline request'}
            </h2>
            <p className="text-white/40 text-xs mb-4">from {responding.sender?.name}</p>
            <div className="mb-4">
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Add a note (optional)</label>
              <textarea rows={3} value={responseNote} onChange={e => setResponseNote(e.target.value)}
                placeholder={responding.action === 'ACCEPTED' ? "Let's schedule a call next week..." : "I'm unavailable right now but try reaching out in a month..."}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setResponding(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 text-sm hover:border-white/20 transition-all">
                Cancel
              </button>
              <button
                onClick={() => respond.mutate({ id: responding._id, status: responding.action })}
                disabled={respond.isPending}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                  responding.action === 'ACCEPTED' ? 'bg-white text-black hover:bg-white/90' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}>
                {respond.isPending ? 'Sending...' : responding.action === 'ACCEPTED' ? 'Accept' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}