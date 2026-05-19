import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(sessionId, user) {
  const socketRef = useRef(null);
  const [attendees, setAttendees] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);

  useEffect(() => {
    if (!sessionId || !user) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('session:join', {
        sessionId,
        userId: user._id,
        userName: user.name,
        avatarUrl: user.avatarUrl,
      });
    });

    socket.on('session:attendees', setAttendees);
    socket.on('session:status_update', ({ status }) => setSessionStatus(status));
    socket.on('session:announcement', setAnnouncement);

    return () => socket.disconnect();
  }, [sessionId, user]);

  const announce = (message) => {
    socketRef.current?.emit('session:announce', {
      sessionId, message, senderName: user?.name,
    });
  };

  const updateStatus = (status) => {
    socketRef.current?.emit('session:status', { sessionId, status });
  };

  return { attendees, announcement, sessionStatus, announce, updateStatus };
}