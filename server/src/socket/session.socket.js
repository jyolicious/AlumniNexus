const mongoose = require('mongoose');
const { LiveSession } = require('../models/index');

// Real-time presence for live sessions
// Rooms named by sessionId — no video, just presence + signaling

function setupSocketHandlers(io) {
  // sessionId -> Map<userId, { userId, userName, avatarUrl, socketId }>
  const rooms = new Map();

  io.on('connection', (socket) => {

    // User joins a session room
    // Emit from client: socket.emit('session:join', { sessionId, userId, userName, avatarUrl })
    socket.on('session:join', ({ sessionId, userId, userName, avatarUrl }) => {
      socket.join(sessionId);
      if (!rooms.has(sessionId)) rooms.set(sessionId, new Map());
      rooms.get(sessionId).set(userId, { userId, userName, avatarUrl, socketId: socket.id });

      const attendees = Array.from(rooms.get(sessionId).values());
      io.to(sessionId).emit('session:attendees', attendees);
      socket.emit('session:joined', { sessionId, attendees });
    });

    // Host marks session LIVE or ENDED
    socket.on('session:status', ({ sessionId, status }) => {
      io.to(sessionId).emit('session:status_update', { status });
    });

    // Host sends an announcement to all attendees
    socket.on('session:announce', ({ sessionId, message, senderName }) => {
      io.to(sessionId).emit('session:announcement', {
        message, senderName, timestamp: new Date(),
      });
    });

    socket.on('disconnect', async () => {
      rooms.forEach((map, sessionId) => {
        for (const [userId, info] of map) {
          if (info.socketId === socket.id) {
            map.delete(userId);
            io.to(sessionId).emit('session:attendees', Array.from(map.values()));

            LiveSession.findByIdAndUpdate(
              sessionId,
              {
                $set: {
                  'attendance.$[entry].leftAt': new Date(),
                },
              },
              {
                arrayFilters: [{ 'entry.user': new mongoose.Types.ObjectId(userId), 'entry.leftAt': null }],
              }
            ).catch(() => {});

            break;
          }
        }
        if (map.size === 0) rooms.delete(sessionId);
      });
    });
  });
}

module.exports = { setupSocketHandlers };