import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const examplePrompts = [
  'How can I tailor my internship application for software engineering roles?',
  'What skills should I highlight to transition into product management?',
  'How can I prepare for a technical interview in my department?',
]

const responseTypes = [
  {
    value: 'yesno',
    label: 'Yes / No',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Quick decisive answer',
  },
  {
    value: 'deep',
    label: 'Deep reasoning',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    description: 'Detailed analysis',
  },
  {
    value: 'flowchart',
    label: 'Flowchart',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    description: 'Visual step-by-step',
  },
  {
    value: 'mindmap',
    label: 'Mind map',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    description: 'Concept overview',
  },
]

// ─── Flowchart renderer ───────────────────────────────────────────────────────
function FlowchartRenderer({ text }) {
  const canvasRef = useRef(null)
  const [svgContent, setSvgContent] = useState('')

  useEffect(() => {
    const lines = text.split('\n').filter(Boolean)
    const nodes = []
    const edges = []
    const nodeMap = {}

    lines.forEach((line) => {
      const arrowMatch = line.match(/^(.+?)\s*[-=]+>\s*(.+)$/)
      if (arrowMatch) {
        const from = arrowMatch[1].trim()
        const to = arrowMatch[2].trim()
        if (!nodeMap[from]) { nodeMap[from] = { id: from, label: from }; nodes.push(nodeMap[from]) }
        if (!nodeMap[to])   { nodeMap[to]   = { id: to,   label: to   }; nodes.push(nodeMap[to])   }
        edges.push({ from, to })
      } else if (line.trim() && !line.includes(':')) {
        const label = line.replace(/^\d+\.\s*/, '').trim()
        if (label && !nodeMap[label]) {
          nodeMap[label] = { id: label, label }
          nodes.push(nodeMap[label])
          if (nodes.length > 1) {
            const prev = nodes[nodes.length - 2]
            edges.push({ from: prev.id, to: label })
          }
        }
      }
    })

    if (nodes.length === 0) {
      const numbered = text.match(/\d+\.\s+[^\n]+/g) || []
      numbered.forEach((line, i) => {
        const label = line.replace(/^\d+\.\s+/, '').trim()
        nodes.push({ id: i, label })
        nodeMap[i] = { id: i, label }
        if (i > 0) edges.push({ from: i - 1, to: i })
      })
    }

    if (nodes.length === 0) return

    const BOX_W = 200, BOX_H = 48, GAP_Y = 72, START_X = 100, START_Y = 40
    const W = 400, H = nodes.length * (BOX_H + GAP_Y) + 40

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    svg += `<defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </marker>
    </defs>`

    const positions = {}
    nodes.forEach((node, i) => {
      const x = START_X, y = START_Y + i * (BOX_H + GAP_Y)
      positions[node.id] = { x, y }

      const isFirst = i === 0
      const isLast  = i === nodes.length - 1
      const rx = isFirst || isLast ? 24 : 10
      const fill = isFirst ? '#4f46e5' : isLast ? '#059669' : '#1e1b4b'
      const stroke = isFirst ? '#6366f1' : isLast ? '#10b981' : '#3730a3'
      const textColor = '#fff'

      const label = node.label.length > 28 ? node.label.slice(0, 26) + '…' : node.label
      svg += `<rect x="${x}" y="${y}" width="${BOX_W}" height="${BOX_H}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
      svg += `<text x="${x + BOX_W / 2}" y="${y + BOX_H / 2}" text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-size="13" font-family="system-ui,sans-serif" font-weight="500">${label}</text>`
    })

    edges.forEach(({ from, to }) => {
      const a = positions[from], b = positions[to]
      if (!a || !b) return
      const x1 = a.x + BOX_W / 2, y1 = a.y + BOX_H
      const x2 = b.x + BOX_W / 2, y2 = b.y
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#arr)" opacity="0.7"/>`
    })

    svg += '</svg>'
    setSvgContent(svg)
  }, [text])

  if (!svgContent) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-7 text-white/70 font-mono text-xs">{text}</pre>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-[#080820] border border-white/10 p-4">
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  )
}

// ─── Mind map renderer ────────────────────────────────────────────────────────
function MindMapRenderer({ text }) {
  const [svgContent, setSvgContent] = useState('')

  useEffect(() => {
    const lines = text.split('\n').filter(Boolean)
    const topics = []
    let center = ''

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      if (line.match(/^[A-Z]/) && !line.startsWith(' ') && !line.startsWith('-') && !line.match(/^\d/)) {
        if (!center) { center = trimmed; return }
      }
      const bullet = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '')
      if (bullet && bullet !== center) topics.push(bullet)
    })

    if (!center && topics.length > 0) { center = topics.shift() }
    if (!center) return

    const W = 640, H = 420
    const cx = W / 2, cy = H / 2
    const R = 140
    const colors = ['#4f46e5','#0891b2','#059669','#d97706','#db2777','#7c3aed','#ea580c','#16a34a']

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    svg += `<rect width="${W}" height="${H}" fill="transparent"/>`
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="70" ry="36" fill="#4f46e5" stroke="#6366f1" stroke-width="1.5"/>`
    const cLabel = center.length > 16 ? center.slice(0, 14) + '…' : center
    svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="13" font-weight="600" font-family="system-ui,sans-serif">${cLabel}</text>`

    const displayed = topics.slice(0, 8)
    displayed.forEach((topic, i) => {
      const angle = (i / displayed.length) * 2 * Math.PI - Math.PI / 2
      const bx = cx + R * Math.cos(angle)
      const by = cy + R * Math.sin(angle)
      const color = colors[i % colors.length]

      svg += `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="1.5" opacity="0.5"/>`
      svg += `<ellipse cx="${bx}" cy="${by}" rx="52" ry="24" fill="${color}22" stroke="${color}" stroke-width="1"/>`

      const label = topic.length > 14 ? topic.slice(0, 12) + '…' : topic
      svg += `<text x="${bx}" y="${by}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="11" font-weight="500" font-family="system-ui,sans-serif">${label}</text>`
    })

    svg += '</svg>'
    setSvgContent(svg)
  }, [text])

  if (!svgContent) {
    return <pre className="whitespace-pre-wrap text-sm leading-7 text-white/70 font-mono text-xs">{text}</pre>
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-[#080820] border border-white/10 p-4 flex justify-center">
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  )
}

// ─── Response renderer ────────────────────────────────────────────────────────
function ResponseDisplay({ answer, responseType }) {
  if (responseType === 'flowchart') return <FlowchartRenderer text={answer} />
  if (responseType === 'mindmap')   return <MindMapRenderer   text={answer} />
  if (responseType === 'yesno') {
    const firstLine = answer.split('\n')[0] || ''
    const rest = answer.split('\n').slice(1).join('\n').trim()
    const isYes = /^yes/i.test(firstLine)
    return (
      <div className="space-y-4">
        <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm tracking-wide ${
          isYes
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
        }`}>
          <span className="text-xl">{isYes ? '✓' : '✕'}</span>
          {firstLine}
        </div>
        {rest && <p className="text-sm leading-7 text-white/70 whitespace-pre-line">{rest}</p>}
      </div>
    )
  }
  return <p className="whitespace-pre-line text-sm leading-7 text-white/75">{answer}</p>
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CareerAssistant() {
  const { user } = useAuth()
  const [question, setQuestion]           = useState('')
  const [response, setResponse]           = useState('')
  const [history, setHistory]             = useState([])
  const [lastPrompt, setLastPrompt]       = useState('')
  const [lastResponseType, setLastResponseType] = useState('deep')
  const [responseType, setResponseType]   = useState('deep')
  const [loading, setLoading]             = useState(false)
  const responseRef = useRef(null)

  const handleAsk = async (event) => {
    event.preventDefault()
    const prompt = question.trim()
    if (!prompt) return toast.error('Please enter a career question')

    setLoading(true)
    try {
      const { data } = await api.post('/career/query', { prompt, responseType })
      setResponse(data.answer)
      setHistory((prev) => [{ prompt, answer: data.answer, responseType, at: new Date() }, ...prev])
      setLastPrompt(prompt)
      setLastResponseType(responseType)
      setQuestion('')
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Unable to get an answer yet')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const filename = `career-response-${lastResponseType}-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`
    const label = responseTypes.find((t) => t.value === lastResponseType)?.label || lastResponseType
    const content = `Question: ${lastPrompt || question}\nResponse type: ${label}\n\n${response}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = filename
    document.body.appendChild(link); link.click()
    link.remove(); URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="space-y-5">

        {/* ── Header card ── */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {/* Brain icon */}
                <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/20">
                  <svg width="18" height="18" fill="none" stroke="#818cf8" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </span>
                <h1 className="text-lg font-semibold text-white">AI Career Assistant</h1>
              </div>
              <p className="text-white/40 text-sm">
                Ask anything about resumes, internships, interviews, or career planning.
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-400 tracking-wide font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Student tool
            </span>
          </div>

          {/* Career goal pill */}
          {user?.studentProfile?.careerGoal && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <svg width="14" height="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Your career goal</p>
                <p className="text-sm text-white/80">{user.studentProfile.careerGoal}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAsk} className="mt-6 space-y-4">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk(e) }}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-[#0c0c14] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                placeholder="e.g. What should I include on my resume for a software engineering internship?"
              />
              <span className="absolute bottom-3 right-3 text-white/20 text-xs">⌘↵</span>
            </div>

            {/* Response type selector */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-widest">Response format</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {responseTypes.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setResponseType(opt.value)}
                    className={`relative flex flex-col items-start gap-1.5 rounded-2xl border px-3.5 py-3 text-left transition-all ${
                      responseType === opt.value
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-white'
                        : 'border-white/8 bg-white/4 text-white/50 hover:border-white/15 hover:text-white/80'
                    }`}
                  >
                    <span className={responseType === opt.value ? 'text-indigo-400' : 'text-white/30'}>
                      {opt.icon}
                    </span>
                    <span className="text-xs font-medium leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-white/30 leading-tight">{opt.description}</span>
                    {responseType === opt.value && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-600"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Thinking…
                  </>
                ) : (
                  <>
                    Get advice
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
              <span className="text-xs text-white/25">{question.length} chars</span>
            </div>

            {/* Example prompts */}
            <div className="flex flex-wrap gap-2 pt-1">
              {examplePrompts.map((ex) => (
                <button
                  type="button"
                  key={ex}
                  onClick={() => setQuestion(ex)}
                  className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/15 hover:text-white/80 text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* ── Response card ── */}
        {response && (
          <div
            ref={responseRef}
            className="rounded-3xl border border-indigo-500/15 bg-white/5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-white">Latest answer</p>
                  <p className="text-xs text-white/35">
                    {responseTypes.find((t) => t.value === lastResponseType)?.label} · {lastPrompt.slice(0, 50)}{lastPrompt.length > 50 ? '…' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
            </div>

            <div className="px-6 py-5">
              <ResponseDisplay answer={response} responseType={lastResponseType} />
            </div>
          </div>
        )}

        {/* ── History ── */}
        {history.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">History</h2>
              <span className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">
                {history.length} question{history.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <details
                  key={`${item.at.toISOString()}-${idx}`}
                  className="group rounded-2xl border border-white/8 bg-[#0b0b14] overflow-hidden"
                >
                  <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none select-none hover:bg-white/4 transition">
                    <span className="flex-shrink-0">
                      {responseTypes.find((t) => t.value === item.responseType)?.icon || (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                      )}
                    </span>
                    <p className="text-sm text-white/70 flex-1 truncate">{item.prompt}</p>
                    <span className="flex-shrink-0 text-[10px] text-white/30 border border-white/8 rounded-full px-2 py-0.5">
                      {responseTypes.find((t) => t.value === item.responseType)?.label || item.responseType}
                    </span>
                    <svg
                      className="flex-shrink-0 text-white/30 transition-transform group-open:rotate-180"
                      width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <div className="rounded-xl bg-white/5 p-4">
                      <ResponseDisplay answer={item.answer} responseType={item.responseType} />
                    </div>
                    <p className="text-[10px] text-white/25 mt-2 text-right">
                      {item.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}