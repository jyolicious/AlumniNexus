import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function BlogCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company: '', role: '', domain: '', difficulty: 'MEDIUM',
    year: new Date().getFullYear(), title: '', content: '', tips: '', outcome: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/blogs', form)
      toast.success('Blog submitted for review!')
      navigate('/blogs')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Write Interview Experience</h1>
        <p className="text-white/40 text-sm mt-1">Help students prepare · your post will be reviewed before publishing</p>
      </div>

      <form onSubmit={submit} className="max-w-2xl space-y-5">
        {/* Meta */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <h2 className="text-white/60 text-xs uppercase tracking-widest font-medium mb-4">Interview Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { k: 'company', label: 'Company', placeholder: 'Google' },
              { k: 'role',    label: 'Role',    placeholder: 'Software Engineer' },
              { k: 'domain',  label: 'Domain',  placeholder: 'Backend, ML, Product...' },
            ].map(({ k, label, placeholder }) => (
              <div key={k}>
                <label className="block text-xs text-white/40 mb-1.5">{label}</label>
                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
                  required={k !== 'domain'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Year</label>
              <input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} min={2010} max={new Date().getFullYear()}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-2">Difficulty</label>
              <div className="flex gap-2">
                {['EASY','MEDIUM','HARD'].map(d => (
                  <button key={d} type="button" onClick={() => set('difficulty', d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.difficulty === d ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">Outcome</label>
              <div className="flex gap-2">
                {['OFFER','REJECTED','PENDING'].map(o => (
                  <button key={o} type="button" onClick={() => set('outcome', o)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.outcome === o ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}>{o === 'OFFER' ? '✓' : o === 'REJECTED' ? '✕' : '?'}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <h2 className="text-white/60 text-xs uppercase tracking-widest font-medium mb-4">Your Experience</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} required
                placeholder="My Google SWE interview experience — 3 rounds, got the offer"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Full Experience</label>
              <textarea rows={8} value={form.content} onChange={e => set('content', e.target.value)} required
                placeholder="Walk through the rounds, questions asked, what you were evaluated on, what surprised you..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/25 resize-none transition-all" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Tips for future candidates</label>
              <textarea rows={3} value={form.tips} onChange={e => set('tips', e.target.value)}
                placeholder="What would you do differently? What resources helped you most?"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/25 resize-none transition-all" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/blogs')}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm hover:border-white/20 hover:text-white/60 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </Layout>
  )
}