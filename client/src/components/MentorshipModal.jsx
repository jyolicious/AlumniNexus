import { useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function MentorshipModal({ alumni, onClose }) {
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/mentorship', { receiverId: alumni.user?._id || alumni._id, topic, message })
      toast.success('Mentorship request sent!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Request Mentorship</h2>
            <p className="text-white/40 text-xs mt-0.5">to {alumni.user?.name}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Topic</label>
            <input
              required
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Career switch to product management"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain what you're looking for..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
            />
          </div>
          <p className="text-white/25 text-xs">You can send up to 3 mentorship requests per week.</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 text-sm hover:border-white/20 hover:text-white/60 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}