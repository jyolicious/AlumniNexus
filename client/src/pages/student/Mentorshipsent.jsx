import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const STATUS = {
  PENDING:   { color: 'amber',  label: 'Pending' },
  ACCEPTED:  { color: 'emerald',label: 'Accepted' },
  DECLINED:  { color: 'red',    label: 'Declined' },
  COMPLETED: { color: 'blue',   label: 'Completed' },
}

export default function MentorshipSent() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['mentorship-sent'],
    queryFn: () => api.get('/mentorship/sent').then(r => r.data),
  })

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Mentorship Requests</h1>
        <p className="text-white/40 text-sm mt-1">Track your sent requests · max 3 per week</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-28" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-4xl mb-3">◇</p>
          <p className="text-white/40 text-sm">No mentorship requests sent yet</p>
          <p className="text-white/20 text-xs mt-1">Go to Find Alumni to request mentorship</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const st = STATUS[r.status]
            return (
              <div key={r._id} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/12 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {r.receiver?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{r.receiver?.name}</p>
                      <p className="text-white/35 text-xs">
                        {r.receiver?.alumniProfile?.currentRole} {r.receiver?.alumniProfile?.currentOrg && `@ ${r.receiver.alumniProfile.currentOrg}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full bg-${st.color}-500/15 text-${st.color}-400 flex-shrink-0`}>
                    {st.label}
                  </span>
                </div>

                <div className="mt-4 pl-13 ml-13">
                  <div className="bg-white/3 rounded-lg p-3 ml-0">
                    <p className="text-white/60 text-xs font-medium mb-1">Topic: {r.topic}</p>
                    <p className="text-white/35 text-xs leading-relaxed">{r.message}</p>
                  </div>

                  {r.responseNote && (
                    <div className="mt-2 bg-white/5 rounded-lg p-3 border-l-2 border-white/20">
                      <p className="text-white/50 text-xs font-medium mb-1">Response from {r.receiver?.name}</p>
                      <p className="text-white/35 text-xs leading-relaxed">{r.responseNote}</p>
                    </div>
                  )}

                  <p className="text-white/20 text-xs mt-2">
                    Sent {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}