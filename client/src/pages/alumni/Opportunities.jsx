import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import CreateOpportunityModal from './CreateOpportunityModal'
import OpportunityApplicants from './OpportunityApplicants'

const TYPE_CONFIG = {
  JOB: { color: 'emerald', icon: '◈', label: 'Job' },
  INTERNSHIP: { color: 'blue', icon: '◇', label: 'Internship' },
  MENTORSHIP: { color: 'purple', icon: '◎', label: 'Mentorship' },
  EVENT: { color: 'amber', icon: '▷', label: 'Event' },
}

export default function Opportunities() {
  const qc = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)

  const {
    data: opportunities = [],
    isLoading,
  } = useQuery({
    queryKey: ['my-opportunities'],
    queryFn: () => api.get('/opportunities/my').then((r) => r.data),
  })

  const closeMutation = useMutation({
    mutationFn: (id) =>
      api.patch(`/opportunities/${id}`, {
        isActive: false,
      }),
    onSuccess: () => {
      toast.success('Opportunity closed')
      qc.invalidateQueries(['my-opportunities'])
    },
    onError: () => {
      toast.error('Failed to close opportunity')
    },
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            My Opportunities
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage jobs, internships, mentorships and events
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
        >
          + Post Opportunity
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <p className="text-5xl text-white/20 mb-4">◈</p>
          <h2 className="text-white font-medium text-lg">No opportunities yet</h2>
          <p className="text-white/40 text-sm mt-2">
            Start helping students by posting opportunities
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const cfg = TYPE_CONFIG[opp.type] ?? TYPE_CONFIG.JOB
            const remainingSlots = opp.slots - (opp.selectedCount || 0)

            return (
              <div
                key={opp._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-${cfg.color}-500/15 text-${cfg.color}-400 flex items-center justify-center text-lg flex-shrink-0`}
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-white font-semibold text-lg">
                          {opp.title}
                        </h2>
                        <span className={`text-xs px-3 py-1 rounded-full bg-${cfg.color}-500/15 text-${cfg.color}-400`}>
                          {cfg.label}
                        </span>
                        {!opp.isActive && (
                          <span className="text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-400">
                            Closed
                          </span>
                        )}
                      </div>

                      <p className="text-white/40 text-sm mt-1">
                        {opp.company}
                        {opp.location && ` · ${opp.location}`}
                        {opp.domain && ` · ${opp.domain}`}
                      </p>
                      <p className="text-white/30 text-sm mt-4 line-clamp-2">
                        {opp.description}
                      </p>
                      <div className="flex items-center gap-5 mt-5 text-xs text-white/40 flex-wrap">
                        <span>
                          Slots: {remainingSlots}/{opp.slots}
                        </span>
                        <span>Selected: {opp.selectedCount || 0}</span>
                        {opp.deadline && (
                          <span>
                            Deadline:{' '}
                            {new Date(opp.deadline).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
                    >
                      View Applicants
                    </button>
                    {opp.isActive && (
                      <button
                        onClick={() => closeMutation.mutate(opp._id)}
                        className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateOpportunityModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedOpportunity && (
        <OpportunityApplicants
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </Layout>
  )
}
