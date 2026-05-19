// ModerateBlog.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export function ModerateBlog() {
  const qc = useQueryClient()

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['pending-blogs'],
    queryFn: () => api.get('/admin/pending-blogs').then(r => r.data),
  })

  const moderate = useMutation({
    mutationFn: ({ id, publish }) => api.patch(`/admin/blogs/${id}/publish`, { publish }),
    onSuccess: (_, { publish }) => {
      toast.success(publish ? 'Blog published!' : 'Blog rejected')
      qc.invalidateQueries(['pending-blogs'])
    },
    onError: err => toast.error(err.response?.data?.error || 'Failed'),
  })

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Moderate Blogs</h1>
        <p className="text-white/40 text-sm mt-1">{blogs.length} posts awaiting review</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-40" />)}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">✓</p>
          <p className="text-white/40 text-sm">No blogs pending review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map(b => (
            <div key={b._id} className="bg-white/3 border border-white/8 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-white font-medium text-sm mb-1">{b.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/35">
                    <span>{b.company}</span>
                    <span>·</span>
                    <span>{b.role}</span>
                    <span>·</span>
                    <span className={`${b.difficulty === 'EASY' ? 'text-emerald-400' : b.difficulty === 'HARD' ? 'text-red-400' : 'text-amber-400'}`}>{b.difficulty}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white/50 text-xs">{b.author?.name}</p>
                  <p className="text-white/25 text-[10px]">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <p className="text-white/35 text-xs leading-relaxed line-clamp-3 mb-4">{b.content}</p>
              <div className="flex gap-2">
                <button onClick={() => moderate.mutate({ id: b._id, publish: false })} disabled={moderate.isPending}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-xs hover:border-red-500/30 hover:text-red-400 transition-all">
                  Reject
                </button>
                <button onClick={() => moderate.mutate({ id: b._id, publish: true })} disabled={moderate.isPending}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
                  ✓ Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
export default ModerateBlog