import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { LiveKitRoom, VideoConference, ParticipantTile, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'

export default function JoinSession() {
  const location = useLocation()
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(null)
  const [roomError, setRoomError] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [permissionError, setPermissionError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    if (code) setJoinCode(code.toUpperCase())
  }, [location.search])

  const checkMediaPermissions = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (err) {
      const message = err?.name === 'NotAllowedError' || err?.name === 'PermissionDismissedError'
        ? 'Camera and microphone permissions were denied. Please allow access and retry.'
        : err?.name === 'NotFoundError'
          ? 'No camera or microphone found. Please connect a device and retry.'
          : 'Unable to access camera or microphone. Please allow access and retry.'
      setRoomError(message)
      setPermissionError(true)
      throw err
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setRoomError(null)
    setPermissionError(false)
    try {
      await checkMediaPermissions()
      const { data } = await api.post('/sessions/join', { joinCode, joinPassword: password })
      setJoined(data)
      setConnecting(true)
      toast.success('Joining...')
    } catch (err) {
      const apiError = err?.response?.data?.error
      if (apiError) {
        setRoomError(apiError)
        toast.error(apiError)
      } else if (!permissionError) {
        setRoomError('Failed to join session')
        toast.error('Failed to join')
      }
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    return (
      <div className="w-screen h-screen bg-black overflow-hidden">
        <LiveKitRoom
          serverUrl={joined.serverUrl}
          token={joined.token}
          connect={true}
          audio={true}
          video={true}
          options={{
            adaptiveStream: true,
            dynacast: true,
          }}
          className="w-full h-full"
          data-lk-theme="default"
          onError={(error) => {
            console.error('LiveKit error:', error)
            const permissionDenied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDismissedError'
            if (permissionDenied) {
              setRoomError('Camera and microphone permissions were denied. Please allow access and retry.')
              setPermissionError(true)
            } else {
              setRoomError(error.message || 'Connection error')
            }
            toast.error('Connection error: ' + (error.message || 'Unknown error'))
          }}
          onConnected={() => {
            setConnecting(false)
            console.log('Connected to LiveKit room')
          }}
          onDisconnected={() => {
            console.log('Disconnected from LiveKit room')
          }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Session</h1>
          <p className="text-white/40">Enter code and password from host</p>
        </div>

        {roomError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{roomError}</p>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Session Code</label>
            <input
              required
              autoFocus
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-2xl font-mono tracking-widest text-center placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all uppercase disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || joinCode.length < 3}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Joining...' : connecting ? 'Connecting...' : '▶ Join Session'}
          </button>
        </form>

        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs mb-2 font-semibold">BEFORE JOINING:</p>
          <ul className="text-white/40 text-xs space-y-1">
            <li>✓ Allow camera & microphone when browser asks</li>
            <li>✓ Test speakers/headphones volume</li>
            <li>✓ Check internet connection is stable</li>
          </ul>
          {permissionError && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
              <p className="font-semibold">Permission error detected.</p>
              <p>Please allow camera and microphone access in your browser, then retry joining.</p>
              <p className="mt-2 text-xs text-red-200/80">If you previously dismissed the prompt, open Site Settings and enable camera/microphone access for this page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}