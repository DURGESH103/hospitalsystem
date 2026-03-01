const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const createEvent = (type, data, version = 1) => ({
  type,
  data: { ...data, _version: version },
  timestamp: Date.now(),
  version
});

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, 'Role:', socket.userRole);

    // Join role-based rooms
    if (socket.userRole === 'doctor') {
      socket.join(`doctor:${socket.userId}`);
      socket.join('doctors'); // All doctors room
    } else if (socket.userRole === 'patient') {
      socket.join(`patient:${socket.userId}`);
      socket.join('patients'); // All patients room
    } else if (socket.userRole === 'admin') {
      socket.join('admin');
    }

    socket.on('appointment:start', async (data) => {
      const event = createEvent('update', { ...data, status: 'in_consultation' });
      io.to(`doctor:${data.doctorId}`).emit('appointment:update', event);
      io.to(`patient:${data.patientId}`).emit('appointment:update', event);
    });

    socket.on('appointment:complete', async (data) => {
      const event = createEvent('update', { ...data, status: 'completed' });
      io.to(`doctor:${data.doctorId}`).emit('appointment:update', event);
      io.to(`patient:${data.patientId}`).emit('appointment:update', event);
      io.emit('queue:recalculated');
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

const emitToDoctor = (doctorId, event, data) => {
  const payload = createEvent(event.split(':')[1], data);
  io.to(`doctor:${doctorId}`).emit(event, payload);
};

const emitToPatient = (patientId, event, data) => {
  const payload = createEvent(event.split(':')[1], data);
  io.to(`patient:${patientId}`).emit(event, payload);
};

const emitToAll = (event, data) => {
  const payload = createEvent(event.split(':')[1] || 'update', data);
  io.emit(event, payload);
};

module.exports = { initializeSocket, getIO, emitToDoctor, emitToPatient, emitToAll };
