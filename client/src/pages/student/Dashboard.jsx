import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const StatCard = ({ label, value, sub, color = 'white' }) => (
  <div className="bg-white/3 border border-white/8 rounded-xl p-5">
    <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{label}</p>
    <p className={`text-3xl font-semibold text-${color} mb-1`}>{value}</p>
    {sub && <p className="text-white/30 text-xs">{sub}</p>}
  </div>
)

export default function StudentDashboard() {
  const { user } = useAuth()

  const { data: alumni = [] } = useQuery({
    queryKey: ['alumni'],
    queryFn: () => api.get('/alumni').then(r => r.data),
  })

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => api.get('/opportunities').then(r => r.data),
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data),
  })

  const selectedOpportunities = opportunities.filter(
    (o) => o.applicationStatus === 'SELECTED'
  )

  const upcomingSessions = sessions.filter(s => s.status === 'UPCOMING').slice(0, 3)
  const recentOpportunities = opportunities.slice(0, 4)

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-white/40 text-sm mt-1">Here's what's happening on the network today.</p>
      </div>

      {selectedOpportunities.length > 0 && (
        <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl text-emerald-200">✓</div>
            <div>
              <p className="text-white font-semibold">
                {selectedOpportunities.length === 1
                  ? 'You have been selected!'
                  : `You have ${selectedOpportunities.length} selected opportunities!`}
              </p>
              <p className="text-emerald-100 text-sm mt-1">
                {selectedOpportunities.map((opp) => opp.title).join(', ')} {' '}
                {selectedOpportunities.length === 1
                  ? 'will contact you by email.'
                  : 'will contact you by email.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Alumni" value={alumni.length} sub="Verified mentors" />
        <StatCard label="Opportunities" value={opportunities.length} sub="Open right now" />
        <StatCard label="Live Sessions" value={sessions.filter(s => s.status === 'LIVE').length} sub="Happening now" color="emerald-400" />
        <StatCard label="Upcoming" value={upcomingSessions.length} sub="Sessions this week" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming sessions */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium text-sm">Upcoming sessions</h2>
            <Link to="/sessions" className="text-white/30 text-xs hover:text-white/60 transition-colors">View all →</Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className="text-white/20 text-sm py-4 text-center">No upcoming sessions</p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map(s => (
                <div key={s._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 text-sm flex-shrink-0">▷</div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.title}</p>
                    <p className="text-white/35 text-xs mt-0.5">{s.topic} · {s.host?.name}</p>
                    <p className="text-white/25 text-xs mt-0.5">{new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/sessions/join" className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/70 transition-all">
            <span>▷</span> Join with code
          </Link>
        </div>

        {/* Recent opportunities */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium text-sm">Recent opportunities</h2>
            <Link to="/student/opportunities" className="text-white/30 text-xs hover:text-white/60 transition-colors">View all →</Link>
          </div>
          {recentOpportunities.length === 0 ? (
            <p className="text-white/20 text-sm py-4 text-center">No opportunities yet</p>
          ) : (
            <div className="space-y-2">
              {recentOpportunities.map(o => (
                <div key={o._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/3 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                    o.type === 'JOB' ? 'bg-emerald-500/15 text-emerald-400' :
                    o.type === 'INTERNSHIP' ? 'bg-blue-500/15 text-blue-400' :
                    o.type === 'MENTORSHIP' ? 'bg-purple-500/15 text-purple-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    {o.type === 'JOB' ? '◈' : o.type === 'INTERNSHIP' ? '◇' : o.type === 'MENTORSHIP' ? '◎' : '▷'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{o.title}</p>
                    <p className="text-white/35 text-xs">{o.company || o.postedBy?.name} · {o.type}</p>
                  </div>
                  <span className="text-white/20 group-hover:text-white/50 transition-colors text-sm">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/student/alumni', icon: '◎', label: 'Find a mentor', color: 'blue' },
          { to: '/student/opportunities', icon: '◈', label: 'Browse jobs', color: 'emerald' },
          { to: '/student/mentorship', icon: '◇', label: 'My requests', color: 'purple' },
          { to: '/blogs', icon: '≡', label: 'Interview tips', color: 'amber' },
        ].map(({ to, icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/8 hover:border-white/15 hover:bg-white/3 transition-all group"
          >
            <span className={`text-xl text-${color}-400`}>{icon}</span>
            <span className="text-white/50 text-xs text-center group-hover:text-white/70 transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </Layout>
  )
}