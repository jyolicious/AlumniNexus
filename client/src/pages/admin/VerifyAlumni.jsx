// VerifyAlumni.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export function VerifyAlumni() {
  const [actionFor, setActionFor] = useState(null)
  const [note, setNote] = useState('')
  const qc = useQueryClient()

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-alumni'],
    queryFn: () => api.get('/admin/pending-alumni').then(r => r.data),
  })

  const verify = useMutation({
    mutationFn: ({ userId, status }) => api.patch(`/admin/alumni/${userId}/verify`, { status, note }),
    onSuccess: (_, { status }) => {
      toast.success(`Alumni ${status.toLowerCase()}`)
      setActionFor(null)
      setNote('')
      qc.invalidateQueries(['pending-alumni'])
    },
    onError: err => toast.error(err.response?.data?.error || 'Failed'),
  })

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Verify Alumni</h1>
        <p className="text-white/40 text-sm mt-1">{pending.length} profiles awaiting verification</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-36" />)}</div>
      ) : pending.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">✓</p>
          <p className="text-white/40 text-sm">All alumni verified</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(u => (
            <div key={u._id} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/12 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{u.name}</p>
                    <p className="text-white/40 text-xs">{u.email}</p>
                  </div>
                </div>
                <span className="text-amber-400 text-[10px] bg-amber-500/15 px-2.5 py-1 rounded-full">Pending</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
                {[
                  { l: 'Department', v: u.alumniProfile?.department },
                  { l: 'Batch', v: u.alumniProfile?.graduationYear },
                  { l: 'Degree', v: u.alumniProfile?.degree },
                  { l: 'Current Role', v: u.alumniProfile?.currentRole || '—' },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-white/3 rounded-lg px-3 py-2">
                    <p className="text-white/30 mb-0.5">{l}</p>
                    <p className="text-white/70">{v}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => { setActionFor({ ...u, action: 'REJECTED' }); setNote('') }}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-xs hover:border-red-500/30 hover:text-red-400 transition-all">
                  Reject
                </button>
                <button onClick={() => verify.mutate({ userId: u._id, status: 'APPROVED' })}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
                  ✓ Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {actionFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActionFor(null)} />
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-1">Reject Profile</h2>
            <p className="text-white/40 text-xs mb-4">{actionFor.name}</p>
            <div className="mb-4">
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-widest">Reason (sent to alumni)</label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Missing graduation proof, incomplete profile..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActionFor(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 text-sm hover:border-white/20 transition-all">Cancel</button>
              <button onClick={() => verify.mutate({ userId: actionFor._id, status: 'REJECTED' })} disabled={verify.isPending}
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50">
                {verify.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
export default VerifyAlumni