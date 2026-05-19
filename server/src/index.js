require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { setupSocketHandlers } = require('./socket/session.socket');
const { Schema } = mongoose;
const app = express();
const httpServer = http.createServer(app);

// Socket.IO
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});
setupSocketHandlers(io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/alumni',        require('./routes/alumni.routes'));
app.use('/api/opportunities', require('./routes/opportunity.routes'));
app.use('/api/mentorship',    require('./routes/mentorship.routes'));
app.use('/api/referrals',     require('./routes/referral.routes'));
app.use('/api/blogs',         require('./routes/blog.routes'));
app.use('/api/sessions',      require('./routes/session.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Connect DB then start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });