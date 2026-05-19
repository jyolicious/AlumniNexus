// SessionList.jsx — shared page for all roles
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export function SessionList() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data),
  })

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Live Sessions</h1>
          <p className="text-white/40 text-sm mt-1">Upcoming and live alumni sessions</p>
        </div>
        <Link to="/sessions/join"
          className="px-4 py-2 rounded-lg border border-white/10 text-white/50 text-sm hover:border-white/25 hover:text-white/70 transition-all">
          Join with code
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-44" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">▷</p>
          <p className="text-white/40 text-sm">No upcoming sessions</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sessions.map(s => (
            <div key={s._id} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  s.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-blue-500/15 text-blue-400'
                }`}>
                  {s.status === 'LIVE' ? '● LIVE' : 'UPCOMING'}
                </span>
                <span className="text-white/25 text-xs">{s.attendees?.length || 0}/{s.slots} joined</span>
              </div>

              <h3 className="text-white font-medium mb-1">{s.title}</h3>
              <p className="text-white/40 text-xs mb-1">{s.topic}</p>
              {s.description && <p className="text-white/25 text-xs line-clamp-2 mb-3">{s.description}</p>}

              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">
                    {s.host?.name?.charAt(0)}
                  </div>
                  <span className="text-white/35 text-xs">{s.host?.name}</span>
                  <span className="text-white/20 text-xs ml-auto">
                    {new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Link to="/sessions/join"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
                  ▷ Join Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
export default SessionList