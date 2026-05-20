import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function OpportunityApplicants({
  opportunity,
  onClose,
}) {
  const qc = useQueryClient()

  const {
    data: applications = [],
    isLoading,
  } = useQuery({
    queryKey: ['applications', opportunity._id],

    queryFn: () =>
      api
        .get(`/opportunities/${opportunity._id}/applications`)
        .then((r) => r.data),
  })

  const selectMutation = useMutation({
    mutationFn: (applicationId) =>
      api.patch(
        `/opportunities/applications/${applicationId}/select`
      ),

    onSuccess: () => {
      toast.success('Student selected successfully')

      qc.invalidateQueries(['applications'])
      qc.invalidateQueries(['my-opportunities'])
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.error ||
          'Failed to select student'
      )
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-[#141414] border border-white/10 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-semibold">
              Applicants
            </h2>

            <p className="text-white/40 text-sm mt-1">
              {opportunity.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/30 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : applications.length === 0 ? (
          /* EMPTY */
          <div className="text-center py-20">
            <p className="text-white/40">
              No applications yet
            </p>
          </div>
        ) : (
          /* APPLICATIONS */
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* LEFT */}
                  <div className="flex gap-4 flex-1">
                    <img
                      src={
                        app.applicant?.avatarUrl ||
                        'https://ui-avatars.com/api/?name=User'
                      }
                      alt="avatar"
                      className="w-14 h-14 rounded-2xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-white font-medium text-lg">
                          {app.applicant?.name}
                        </h3>

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            app.status === 'SELECTED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : app.status === 'REJECTED'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-yellow-500/15 text-yellow-400'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <p className="text-white/40 text-sm mt-1">
                        {app.applicant?.email}
                      </p>

                      {app.coverNote && (
                        <p className="text-white/30 text-sm mt-4 whitespace-pre-wrap">
                          {app.coverNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl border border-white/10 text-white/70 text-sm hover:border-white/20 transition-all text-center"
                    >
                      View Resume
                    </a>

                    {app.status !== 'SELECTED' && (
                      <button
                        onClick={() =>
                          selectMutation.mutate(app._id)
                        }
                        disabled={selectMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50"
                      >
                        Select Student
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}