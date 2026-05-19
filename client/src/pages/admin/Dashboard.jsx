import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const COLORS = ['#ffffff', '#aaaaaa', '#666666', '#444444', '#222222']

const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-white/3 border border-white/8 rounded-xl p-5">
    <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{label}</p>
    <p className={`text-3xl font-semibold ${accent || 'text-white'}`}>{value ?? '—'}</p>
    {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-white text-sm font-semibold">{payload[0].value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
  })

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Platform analytics and overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 animate-pulse h-24" />)}
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users"     value={stats?.users?.total}    sub="Across all roles" />
            <StatCard label="Alumni"          value={stats?.users?.alumni}   sub={`${stats?.alumni?.verified} verified`} />
            <StatCard label="Students"        value={stats?.users?.students} sub="Active" />
            <StatCard label="Pending Verify"  value={stats?.alumni?.pending} accent={stats?.alumni?.pending > 0 ? 'text-amber-400' : 'text-white'} sub="Need review" />
            <StatCard label="Mentorships"     value={stats?.mentorships?.total}    sub={`${stats?.mentorships?.accepted} accepted`} />
            <StatCard label="Referrals"       value={stats?.referrals}       sub="Total requests" />
            <StatCard label="Opportunities"   value={stats?.opportunities}   sub="Posted by alumni" />
            <StatCard label="Published Blogs" value={stats?.blogs}           sub="Interview experiences" />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">

            {/* Alumni by department bar chart */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <h2 className="text-white font-medium text-sm mb-4">Alumni by Department</h2>
              {stats?.charts?.alumniByDept?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.charts.alumniByDept} margin={{ left: -20 }}>
                    <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => v.length > 8 ? v.slice(0, 8) + '…' : v} />
                    <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-white/20 text-sm text-center py-12">No data yet</p>}
            </div>

            {/* Mentorship by status pie */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <h2 className="text-white font-medium text-sm mb-4">Mentorship Status</h2>
              {stats?.charts?.mentorshipByStatus?.length > 0 ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={stats.charts.mentorshipByStatus} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                        {stats.charts.mentorshipByStatus.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-shrink-0">
                    {stats.charts.mentorshipByStatus.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-white/50 text-xs">{d.name}</span>
                        <span className="text-white/80 text-xs font-medium ml-1">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-white/20 text-sm text-center py-12">No data yet</p>}
            </div>
          </div>

          {/* Alumni by batch */}
          {stats?.charts?.alumniByYear?.length > 0 && (
            <div className="bg-white/3 border border-white/8 rounded-xl p-5">
              <h2 className="text-white font-medium text-sm mb-4">Alumni by Graduation Year</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[...stats.charts.alumniByYear].reverse()} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#ffffff" radius={[3, 3, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}