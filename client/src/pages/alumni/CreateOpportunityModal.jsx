import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function CreateOpportunityModal({ onClose }) {
  const qc = useQueryClient()

  const [form, setForm] = useState({
    type: 'JOB',
    title: '',
    description: '',
    company: '',
    location: '',
    domain: '',
    deadline: '',
    slots: 1,
    openToAlumni: false,
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/opportunities', form),

    onSuccess: () => {
      toast.success('Opportunity posted successfully')
      qc.invalidateQueries(['my-opportunities'])
      onClose()
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.error || 'Failed to post opportunity'
      )
    },
  })

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.value

    setForm({
      ...form,
      [e.target.name]: value,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#141414] border border-white/10 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-semibold">
              Post Opportunity
            </h2>

            <p className="text-white/40 text-sm mt-1">
              Create opportunities for students and alumni applicants
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/30 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TYPE */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="JOB" className="text-black">
                Job
              </option>

              <option value="INTERNSHIP" className="text-black">
                Internship
              </option>

              <option value="MENTORSHIP" className="text-black">
                Mentorship
              </option>

              <option value="EVENT" className="text-black">
                Event
              </option>
            </select>
          </div>

          {/* SLOTS */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Slots
            </label>

            <input
              type="number"
              min="1"
              name="slots"
              value={form.slots}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {/* TITLE */}
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Frontend Developer Intern"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {/* COMPANY */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Company
            </label>

            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {/* DOMAIN */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Domain
            </label>

            <input
              type="text"
              name="domain"
              value={form.domain}
              onChange={handleChange}
              placeholder="Web Development"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {/* DEADLINE */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Deadline
            </label>

            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Description
            </label>

            <textarea
              rows={6}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, skills required, responsibilities and expectations"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
              Applicant type
            </label>

            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                name="openToAlumni"
                checked={form.openToAlumni}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 text-emerald-500 bg-black"
              />
              <span className="text-white text-sm">
                Open to alumni applicants as well as students
              </span>
            </label>
            <p className="text-white/40 text-xs mt-1">
              Leave unchecked for student-only opportunities.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:border-white/20 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="flex-1 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {createMutation.isPending
              ? 'Posting...'
              : 'Post Opportunity'}
          </button>
        </div>
      </div>
    </div>
  )
}