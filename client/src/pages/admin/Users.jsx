import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const ROLE_STYLE = {
  ADMIN:   'bg-amber-500/15 text-amber-400',
  ALUMNI:  'bg-blue-500/15 text-blue-400',
  STUDENT: 'bg-emerald-500/15 text-emerald-400',
}

export default function AdminUsers() {
  const [role, setRole] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => api.get('/admin/users', { params: role ? { role } : {} }).then(r => r.data),
  })

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">All Users</h1>
          <p className="text-white/40 text-sm mt-1">{users.length} users</p>
        </div>
        <div className="flex gap-2">
          {['', 'ADMIN', 'ALUMNI', 'STUDENT'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                role === r ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/25'
              }`}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 animate-pulse h-16" />)}</div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2.5 border-b border-white/5">
            {['Name', 'Email', 'Role', 'Status', 'Joined'].map(h => (
              <p key={h} className="text-white/30 text-xs uppercase tracking-widest">{h}</p>
            ))}
          </div>
          {users.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-12">No users found</p>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map(u => (
                <div key={u._id} className="grid grid-cols-5 px-4 py-3.5 items-center hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                    <span className="text-white text-xs font-medium truncate">{u.name}</span>
                  </div>
                  <span className="text-white/40 text-xs truncate">{u.email}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                  <span>
                    {u.role === 'ALUMNI' ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        u.alumniProfile?.verifyStatus === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' :
                        u.alumniProfile?.verifyStatus === 'REJECTED' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {u.alumniProfile?.verifyStatus || 'NO PROFILE'}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </span>
                  <span className="text-white/30 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}