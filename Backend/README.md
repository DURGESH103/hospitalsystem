# Smart Hospital Backend API

Enterprise-grade Node.js backend with MongoDB and WebSocket support.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
PORT=3001
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login/Register user

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment

### Health Check
- `GET /api/health` - Server health status

## WebSocket Events

### Client → Server
- `appointment:start` - Start consultation
- `appointment:complete` - Complete consultation

### Server → Client
- `appointment:update` - Appointment status changed
- `queue:update` - Queue position changed

## Tech Stack
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs
