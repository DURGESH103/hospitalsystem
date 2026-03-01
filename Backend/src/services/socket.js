const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('appointment:start', async (data) => {
      io.emit('appointment:update', { ...data, status: 'in_consultation' });
    });

    socket.on('appointment:complete', async (data) => {
      io.emit('appointment:update', { ...data, status: 'completed' });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initializeSocket, getIO };
