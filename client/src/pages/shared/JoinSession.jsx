import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useSocket } from '../../hooks/useSocket'

export default function JoinSession() {
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(null) // { session, meetUrl }

  const { attendees, announcement, sessionStatus } = useSocket(joined?.session?._id, user)

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/sessions/join', { joinCode, joinPassword: password })
      setJoined(data)
      toast.success('Joined session!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join')
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    const s = joined.session
    return (
      <Layout>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-emerald-400 text-[10px] font-medium px-2.5 py-1 bg-emerald-500/15 rounded-full animate-pulse">● JOINED</span>
            <h1 className="text-white font-semibold">{s.title}</h1>
          </div>

          {/* Session info */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-4">
            <p className="text-white/40 text-xs mb-1">Topic</p>
            <p className="text-white text-sm font-medium mb-3">{s.topic}</p>
            <p className="text-white/40 text-xs mb-1">Host</p>
            <p className="text-white text-sm mb-4">{s.host?.name}</p>
            <a href={joined.meetUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all">
              ▷ Open Meet Link
            </a>
          </div>

          {/* Announcement banner */}
          {announcement && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
              <p className="text-amber-400 text-xs font-medium mb-1">📢 Announcement from {announcement.senderName}</p>
              <p className="text-white/70 text-sm">{announcement.message}</p>
            </div>
          )}

          {sessionStatus === 'ENDED' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-center">
              <p className="text-white/50 text-sm">This session has ended. Thank you for joining!</p>
            </div>
          )}

          {/* Live attendees */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-medium text-sm">Live Attendees</h2>
              <span className="text-white/30 text-xs">{attendees.length} online</span>
            </div>
            {attendees.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-4">Connecting...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {attendees.map(a => (
                  <div key={a.userId} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {a.userName?.charAt(0)}
                    </div>
                    <span className="text-white/60 text-xs truncate">{a.userName}</span>
                    {a.userId === user?._id && <span className="text-emerald-400 text-[10px] ml-auto">you</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-sm">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white tracking-tight">Join a Session</h1>
          <p className="text-white/40 text-sm mt-1">Enter the code and password shared by the host</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Session Code</label>
            <input
              required
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="AX9K2M"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xl font-mono tracking-widest text-center placeholder:text-white/15 focus:outline-none focus:border-white/30 transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
            />
          </div>

          <button type="submit" disabled={loading || joinCode.length < 4}
            className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40">
            {loading ? 'Joining...' : '▷ Join Session'}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-6">Ask the session host for the code and password</p>
      </div>
    </Layout>
  )
}