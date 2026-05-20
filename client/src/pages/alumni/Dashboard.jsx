import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function AlumniDashboard() {
  const { user } = useAuth()
  const profile = user?.alumniProfile
  const isVerified = profile?.verifyStatus === 'APPROVED'

  const { data: mentorships = [] } = useQuery({
    queryKey: ['mentorship-received'],
    queryFn: () => api.get('/mentorship/received').then(r => r.data),
    enabled: isVerified,
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => api.get('/sessions/my').then(r => r.data),
    enabled: isVerified,
  })

  const pendingMentorships = mentorships.filter(m => m.status === 'PENDING')
  const upcomingSessions = sessions.filter(s => s.status !== 'ENDED')

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {isVerified ? 'Your profile is verified and visible to students.' : 'Your profile is pending admin verification.'}
        </p>
      </div>

      {/* Verification banner */}
      {!isVerified && (
        <div className={`mb-6 rounded-xl p-4 border flex items-center gap-3 ${
          profile?.verifyStatus === 'REJECTED'
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <span className="text-2xl">{profile?.verifyStatus === 'REJECTED' ? '✕' : '◎'}</span>
          <div>
            <p className={`text-sm font-medium ${profile?.verifyStatus === 'REJECTED' ? 'text-red-400' : 'text-amber-400'}`}>
              {profile?.verifyStatus === 'REJECTED' ? 'Profile not approved' : 'Verification pending'}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {profile?.verifyStatus === 'REJECTED'
                ? profile?.verifyNote || 'Please contact admin for details.'
                : 'An admin will review your profile shortly. You can update your profile in the meantime.'}
            </p>
          </div>
          <Link to="/alumni/profile" className="ml-auto text-xs text-white/50 hover:text-white transition-colors whitespace-nowrap">
            Edit profile →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Requests', value: pendingMentorships.length, color: pendingMentorships.length > 0 ? 'text-amber-400' : 'text-white' },
          { label: 'Total Mentorships', value: mentorships.length, color: 'text-white' },
          { label: 'Sessions Hosted', value: sessions.length, color: 'text-white' },
          { label: 'Reputation Score', value: profile?.reputationScore || 0, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/3 border border-white/8 rounded-xl p-5">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{label}</p>
            <p className={`text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending mentorship requests */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium text-sm">Pending Requests</h2>
            <Link to="/alumni/mentorship" className="text-white/30 text-xs hover:text-white/60 transition-colors">View all →</Link>
          </div>
          {pendingMentorships.length === 0 ? (
            <p className="text-white/20 text-sm py-6 text-center">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingMentorships.slice(0, 3).map(m => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {m.sender?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{m.sender?.name}</p>
                    <p className="text-white/35 text-xs truncate">{m.topic}</p>
                  </div>
                  <span className="text-amber-400/70 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My sessions */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium text-sm">My Sessions</h2>
            <Link to="/alumni/sessions" className="text-white/30 text-xs hover:text-white/60 transition-colors">Manage →</Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/20 text-sm mb-3">No sessions yet</p>
              <Link to="/alumni/sessions"
                className="inline-block px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all">
                Host a session
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map(s => (
                <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                    s.status === 'LIVE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                  }`}>▷</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{s.title}</p>
                    <p className="text-white/35 text-xs">{new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {s.attendees?.length || 0} joined</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    s.status === 'LIVE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/alumni/profile',      icon: '◎', label: 'Update profile',   color: 'blue' },
          { to: '/alumni/opportunities', icon: '◈', label: 'Post opportunity', color: 'emerald' },
          { to: '/alumni/sessions',     icon: '▷', label: 'Host a session',   color: 'emerald' },
          { to: '/alumni/mentorship',   icon: '◇', label: 'View requests',    color: 'purple' },
          { to: '/blogs/new',           icon: '≡', label: 'Write experience', color: 'amber' },
        ].map(({ to, icon, label, color }) => (
          <Link key={to} to={to}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/8 hover:border-white/15 hover:bg-white/3 transition-all group">
            <span className={`text-xl text-${color}-400`}>{icon}</span>
            <span className="text-white/50 text-xs text-center group-hover:text-white/70 transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </Layout>
  )
}