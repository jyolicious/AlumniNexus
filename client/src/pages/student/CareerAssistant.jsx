import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const examplePrompts = [
  'How can I tailor my internship application for software engineering roles?',
  'What skills should I highlight to transition into product management?',
  'How can I prepare for a technical interview in my department?',
]

export default function CareerAssistant() {
  const { user } = useAuth()
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async (event) => {
    event.preventDefault()
    const prompt = question.trim()
    if (!prompt) return toast.error('Please enter a career question')

    setLoading(true)
    try {
      const { data } = await api.post('/career/query', { prompt })
      setResponse(data.answer)
      setHistory((prev) => [{ prompt, answer: data.answer, at: new Date() }, ...prev])
      setQuestion('')
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Unable to get an answer yet')
    } finally {
      setLoading(false)
    }
  }

  const fillExample = (prompt) => setQuestion(prompt)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">AI Career Assistant</h1>
              <p className="text-white/40 text-sm mt-1">
                Ask questions about resumes, internships, interviews, and career planning.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
              Student tool
            </span>
          </div>

          {user?.studentProfile?.careerGoal && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Your career goal</p>
              <p className="text-sm text-white/80">{user.studentProfile.careerGoal}</p>
            </div>
          )}

          <form onSubmit={handleAsk} className="mt-6 space-y-4">
            <label className="block text-sm text-white/60">Ask a career question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              className="w-full rounded-3xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-sm text-white outline-none transition-shadow focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
              placeholder="e.g. What should I include on my resume for a software engineering internship?"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example) => (
                  <button
                    type="button"
                    key={example}
                    onClick={() => fillExample(example)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Thinking...' : 'Get advice'}
              </button>
            </div>
          </form>
        </div>

        {response && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-white mb-3">Latest answer</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-white/80">{response}</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Conversation history</h2>
              <span className="text-xs text-white/40">{history.length} question{history.length === 1 ? '' : 's'}</span>
            </div>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={`${item.at.toISOString()}-${index}`} className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Question</p>
                  <p className="text-white/80 text-sm">{item.prompt}</p>
                  <div className="mt-4 rounded-3xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Answer</p>
                    <p className="whitespace-pre-line text-sm leading-7 text-white/80">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
