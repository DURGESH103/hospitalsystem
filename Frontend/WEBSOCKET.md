# WebSocket Integration Guide

## Overview
Real-time communication between frontend and backend using Socket.IO for instant updates without page refresh.

## Architecture

### WebSocket Service (Singleton)
Location: `src/core/websocket/index.js`

```javascript
class WebSocketService {
  - socket: Socket instance
  - listeners: Map of event handlers
  
  Methods:
  - connect(token): Establish connection
  - disconnect(): Close connection
  - on(event, callback): Subscribe to event
  - off(event): Unsubscribe from event
  - emit(event, data): Send event to server
}
```

## Connection Flow

### 1. Initial Connection
```
User Login → Get JWT Token → wsService.connect(token) → Socket Connected
```

### 2. Authentication
```javascript
io(config.wsUrl, {
  auth: { token },  // JWT token sent with connection
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})
```

### 3. Reconnection Strategy
- Automatic reconnection on disconnect
- Exponential backoff (1s, 2s, 4s, 8s, 16s)
- Maximum 5 attempts
- Re-subscribe to events on reconnect

## Event System

### Client → Server Events

#### 1. Appointment Management
```javascript
// Start consultation
wsService.emit('appointment:start', {
  appointmentId: '123',
  doctorId: 'doc-456'
});

// Complete consultation
wsService.emit('appointment:complete', {
  appointmentId: '123',
  notes: 'Patient treated successfully'
});

// Cancel appointment
wsService.emit('appointment:cancel', {
  appointmentId: '123',
  reason: 'Patient no-show'
});
```

#### 2. Queue Management
```javascript
// Update queue position
wsService.emit('queue:reorder', {
  queueId: '789',
  newPosition: 1
});

// Remove from queue
wsService.emit('queue:remove', {
  queueId: '789'
});
```

#### 3. Doctor Status
```javascript
// Update availability
wsService.emit('doctor:status', {
  doctorId: 'doc-456',
  status: 'active' | 'busy' | 'offline'
});
```

### Server → Client Events

#### 1. Queue Updates
```javascript
wsService.on('queue:update', (data) => {
  // data: { id, patientId, doctorId, position, severity, waitTime }
  updateQueueItem(data.id, data);
});
```

**Triggers**:
- New patient added to queue
- Queue position changed
- Patient removed from queue
- Severity level updated

#### 2. Appointment Updates
```javascript
wsService.on('appointment:update', (data) => {
  // data: { id, status, patientName, doctorName, scheduledTime }
  updateAppointment(data.id, data);
});
```

**Triggers**:
- Status changed (scheduled → in_queue → in_consultation → completed)
- Appointment rescheduled
- Appointment cancelled

#### 3. Doctor Updates
```javascript
wsService.on('doctor:update', (data) => {
  // data: { id, name, status, workload, currentPatient }
  updateDoctor(data.id, data);
});
```

**Triggers**:
- Doctor status changed
- Workload updated
- New patient assigned

#### 4. Analytics Updates
```javascript
wsService.on('analytics:update', (data) => {
  // data: { avgWaitTime, waitTimeHistory, severityDistribution }
  setAnalytics(data);
});
```

**Triggers**:
- Periodic updates (every 30 seconds)
- Significant metric changes

## Custom Hook: useRealtimeUpdates

Location: `src/shared/hooks/useRealtimeUpdates.js`

```javascript
export const useRealtimeUpdates = () => {
  useEffect(() => {
    // Subscribe to all events
    wsService.on('queue:update', handleQueueUpdate);
    wsService.on('appointment:update', handleAppointmentUpdate);
    wsService.on('doctor:update', handleDoctorUpdate);
    wsService.on('analytics:update', handleAnalyticsUpdate);

    // Cleanup on unmount
    return () => {
      wsService.off('queue:update');
      wsService.off('appointment:update');
      wsService.off('doctor:update');
      wsService.off('analytics:update');
    };
  }, []);
};
```

**Usage**:
```javascript
function DashboardRouter() {
  useRealtimeUpdates();  // Subscribe to all real-time events
  return <Routes>...</Routes>;
}
```

## State Integration

### Zustand Store Updates

```javascript
// Queue updates
updateQueueItem: (id, updates) => set((state) => ({
  queue: state.queue.map((item) => 
    item.id === id ? { ...item, ...updates } : item
  )
}))

// Appointment updates
updateAppointment: (id, updates) => set((state) => ({
  appointments: state.appointments.map((apt) => 
    apt.id === id ? { ...apt, ...updates } : apt
  )
}))
```

### Optimistic Updates

```javascript
// Immediate UI update
updateAppointment(id, { status: 'in_consultation' });

// Send to server
wsService.emit('appointment:start', { appointmentId: id });

// Server confirms or reverts
wsService.on('appointment:update', (data) => {
  if (data.error) {
    // Revert optimistic update
    updateAppointment(id, { status: 'in_queue' });
  }
});
```

## Error Handling

### Connection Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Show user notification
  // Attempt reconnection
});
```

### Event Errors
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Log to error tracking service
  // Show user-friendly message
});
```

### Timeout Handling
```javascript
socket.timeout(5000).emit('appointment:start', data, (err, response) => {
  if (err) {
    // Handle timeout
    console.error('Request timed out');
  }
});
```

## Performance Optimization

### 1. Event Throttling
```javascript
import { throttle } from 'lodash';

const handleQueueUpdate = throttle((data) => {
  updateQueueItem(data.id, data);
}, 1000);  // Max 1 update per second
```

### 2. Batch Updates
```javascript
let updateQueue = [];

wsService.on('queue:update', (data) => {
  updateQueue.push(data);
});

setInterval(() => {
  if (updateQueue.length > 0) {
    batchUpdateQueue(updateQueue);
    updateQueue = [];
  }
}, 500);  // Batch every 500ms
```

### 3. Selective Subscriptions
```javascript
// Only subscribe to relevant events per role
if (user.role === 'patient') {
  wsService.on('queue:update', handleQueueUpdate);
} else if (user.role === 'doctor') {
  wsService.on('queue:update', handleQueueUpdate);
  wsService.on('appointment:update', handleAppointmentUpdate);
}
```

## Security

### 1. Authentication
```javascript
// JWT token sent with connection
socket.auth = { token: jwtToken };

// Server validates token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Authentication failed'));
  }
});
```

### 2. Authorization
```javascript
// Server checks user role before emitting
socket.on('admin:action', (data) => {
  if (socket.user.role !== 'admin') {
    socket.emit('error', { message: 'Unauthorized' });
    return;
  }
  // Process admin action
});
```

### 3. Data Validation
```javascript
// Validate incoming data
socket.on('appointment:start', (data) => {
  if (!data.appointmentId || !data.doctorId) {
    socket.emit('error', { message: 'Invalid data' });
    return;
  }
  // Process valid data
});
```

## Testing

### Unit Tests
```javascript
describe('WebSocketService', () => {
  it('should connect with token', () => {
    wsService.connect('mock-token');
    expect(wsService.socket.connected).toBe(true);
  });

  it('should subscribe to events', () => {
    const callback = jest.fn();
    wsService.on('test:event', callback);
    wsService.socket.emit('test:event', { data: 'test' });
    expect(callback).toHaveBeenCalled();
  });
});
```

### Integration Tests
```javascript
describe('Real-time Updates', () => {
  it('should update queue on server event', async () => {
    const { result } = renderHook(() => useRealtimeUpdates());
    
    // Simulate server event
    act(() => {
      wsService.socket.emit('queue:update', {
        id: '123',
        position: 2
      });
    });

    await waitFor(() => {
      expect(store.getState().queue[0].position).toBe(2);
    });
  });
});
```

## Monitoring

### Connection Status
```javascript
socket.on('connect', () => {
  console.log('Connected:', socket.id);
  // Update UI indicator
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Show reconnection message
});
```

### Event Logging
```javascript
const logEvent = (event, data) => {
  console.log(`[WS] ${event}:`, data);
  // Send to analytics
};

wsService.on('*', (event, data) => {
  logEvent(event, data);
});
```

## Best Practices

1. **Always Clean Up**: Remove event listeners on component unmount
2. **Handle Reconnection**: Implement reconnection logic with exponential backoff
3. **Validate Data**: Always validate incoming data before updating state
4. **Optimize Performance**: Throttle/debounce high-frequency events
5. **Secure Communication**: Use WSS in production, validate tokens
6. **Error Handling**: Gracefully handle connection and event errors
7. **User Feedback**: Show connection status to users
8. **Logging**: Log all events for debugging and monitoring

## Troubleshooting

### Connection Issues
```javascript
// Check connection status
console.log('Connected:', wsService.socket?.connected);

// Check auth token
console.log('Token:', wsService.socket?.auth?.token);

// Check server URL
console.log('URL:', config.wsUrl);
```

### Event Not Firing
```javascript
// Verify event name matches server
wsService.on('queue:update', (data) => {
  console.log('Event received:', data);
});

// Check if listener is registered
console.log('Listeners:', wsService.listeners);
```

### Memory Leaks
```javascript
// Always remove listeners
useEffect(() => {
  wsService.on('event', handler);
  return () => wsService.off('event');  // Cleanup
}, []);
```

## Production Checklist

- [ ] Use WSS (secure WebSocket) in production
- [ ] Implement proper authentication
- [ ] Add error tracking (Sentry, etc.)
- [ ] Monitor connection health
- [ ] Implement rate limiting
- [ ] Add reconnection logic
- [ ] Validate all incoming data
- [ ] Log important events
- [ ] Handle edge cases (network loss, server restart)
- [ ] Test with multiple concurrent users
