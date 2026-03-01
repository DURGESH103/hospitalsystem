# WebSocket Synchronization Model

## Architecture Overview

```
Initial State Fetch → WebSocket Connect → Incremental Updates → Reconnection Resync
```

## Event Schema

### Standard Event Structure
```javascript
{
  type: 'create' | 'update' | 'delete',
  data: {
    ...entityData,
    _version: number  // Monotonically increasing version
  },
  timestamp: number,  // Unix timestamp
  version: number     // Event schema version
}
```

### Example Events

**Queue Update Event:**
```javascript
{
  type: 'update',
  data: {
    _id: '507f1f77bcf86cd799439011',
    patientId: '507f1f77bcf86cd799439012',
    doctorId: '507f1f77bcf86cd799439013',
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    symptoms: 'chest pain',
    severity: 'critical',
    status: 'in_queue',
    queuePosition: 1,
    waitTime: 15,
    _version: 5  // Version incremented on each update
  },
  timestamp: 1704067200000,
  version: 1
}
```

**Appointment Create Event:**
```javascript
{
  type: 'create',
  data: {
    _id: '507f1f77bcf86cd799439014',
    patientId: '507f1f77bcf86cd799439015',
    doctorId: '507f1f77bcf86cd799439016',
    severity: 'high',
    status: 'scheduled',
    _version: 1  // Initial version
  },
  timestamp: 1704067200000,
  version: 1
}
```

**Queue Delete Event:**
```javascript
{
  type: 'delete',
  data: {
    _id: '507f1f77bcf86cd799439011'
  },
  timestamp: 1704067200000,
  version: 1
}
```

## Socket Rooms Architecture

### Room Structure

**Per-User Rooms:**
```javascript
doctor:{doctorId}   // Individual doctor's updates
patient:{patientId} // Individual patient's updates
```

**Role-Based Rooms:**
```javascript
doctors   // All doctors (broadcast)
patients  // All patients (broadcast)
admin     // Admin users
```

### Auto-Join on Connection
```javascript
// Backend: socket.js
if (socket.userRole === 'doctor') {
  socket.join(`doctor:${socket.userId}`);
  socket.join('doctors');
} else if (socket.userRole === 'patient') {
  socket.join(`patient:${socket.userId}`);
  socket.join('patients');
} else if (socket.userRole === 'admin') {
  socket.join('admin');
}
```

### Targeted Broadcasting

**To Specific Doctor:**
```javascript
emitToDoctor(doctorId, 'queue:update', appointmentData);
// Emits to room: doctor:{doctorId}
```

**To Specific Patient:**
```javascript
emitToPatient(patientId, 'appointment:update', appointmentData);
// Emits to room: patient:{patientId}
```

**To All Clients:**
```javascript
emitToAll('queue:recalculated', {});
// Emits to all connected clients
```

## Synchronization Flow

### 1. Initial State Fetch (Bootstrap)

```javascript
// Frontend: useDataBootstrap.js
const fetchInitialData = async () => {
  // Parallel fetch all data
  const [appointments, queue, doctors] = await Promise.all([
    api.getAppointments(),  // GET /api/appointments
    api.getQueue(),         // GET /api/queue
    api.getDoctors()        // GET /api/users/doctors
  ]);

  // Populate store
  setAppointments(appointments);
  setQueue(queue);
  setDoctors(doctors);
  
  // Mark sync time
  setLastSyncTime(Date.now());
  
  // Connect WebSocket AFTER data loaded
  wsService.connect(token, handleReconnect);
};
```

### 2. Real-Time Incremental Updates

```javascript
// Frontend: useRealtimeUpdates.js
wsService.on('queue:update', (event) => {
  if (event.type === 'update' || event.type === 'create') {
    upsertQueueItem(event.data);  // Idempotent upsert
  } else if (event.type === 'delete') {
    removeFromQueue(event.data._id);
  }
});
```

### 3. Idempotent Upsert Logic

```javascript
// Frontend: store/index.js
upsertQueueItem: (item) => set((state) => {
  const existing = state.queue.find(q => 
    (q._id === item._id || q.id === item.id)
  );
  
  // Version check: only update if newer
  if (!existing || (item._version || 0) > (existing._version || 0)) {
    return {
      queue: existing 
        ? state.queue.map(q => 
            (q._id === item._id || q.id === item.id) ? item : q
          )
        : [...state.queue, item]
    };
  }
  
  // Ignore stale updates
  return state;
})
```

## Reconnection Resync Logic

### Reconnection Detection

```javascript
// Frontend: websocket/index.js
this.socket.on('connect', () => {
  if (this.isReconnecting && onReconnect) {
    onReconnect();  // Trigger resync
  }
  this.isReconnecting = false;
});

this.socket.on('reconnect_attempt', () => {
  this.isReconnecting = true;
});
```

### Resync Handler

```javascript
// Frontend: useDataBootstrap.js
const handleReconnect = async () => {
  console.log('Reconnected - resyncing data');
  
  try {
    // Fetch latest state
    const [appointments, queue] = await Promise.all([
      api.getAppointments(),
      api.getQueue()
    ]);
    
    // Replace entire state (full resync)
    setAppointments(appointments);
    setQueue(queue);
    setLastSyncTime(Date.now());
  } catch (error) {
    console.error('Resync failed:', error);
  }
};
```

## Race Condition Prevention

### 1. Event Versioning

**Problem:** Two updates arrive out of order
```
Update A (version 5) arrives
Update B (version 4) arrives later
```

**Solution:** Version check in upsert
```javascript
if ((item._version || 0) > (existing._version || 0)) {
  // Only apply if newer
}
```

### 2. Database Transactions

**Problem:** Concurrent queue modifications
```javascript
// Backend: queueService.js
const session = await Appointment.startSession();
session.startTransaction();

try {
  await Appointment.create([data], { session });
  await this.calculateQueuePositions();
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### 3. Optimistic Locking

**Backend increments version:**
```javascript
await Appointment.findByIdAndUpdate(
  appointmentId,
  { 
    status,
    $inc: { _version: 1 }  // Atomic increment
  }
);
```

## Idempotent Updates

### Characteristics

1. **Same input → Same result**
2. **Multiple applications → No side effects**
3. **Version-based conflict resolution**

### Implementation

```javascript
// Idempotent: Can be called multiple times safely
upsertAppointment(appointment) {
  const existing = find(appointment._id);
  
  if (!existing) {
    // Create
    return [...appointments, appointment];
  }
  
  if (appointment._version > existing._version) {
    // Update only if newer
    return appointments.map(a => 
      a._id === appointment._id ? appointment : a
    );
  }
  
  // Ignore stale update
  return appointments;
}
```

## Event Types

### queue:update
```javascript
{
  type: 'update' | 'create' | 'delete',
  data: QueueItem
}
```

**Triggers:**
- New appointment added to queue
- Queue position changed
- Patient removed from queue

**Rooms:** `doctor:{doctorId}`, `patient:{patientId}`

### appointment:update
```javascript
{
  type: 'update',
  data: Appointment
}
```

**Triggers:**
- Status changed (scheduled → in_consultation → completed)
- Appointment details updated

**Rooms:** `doctor:{doctorId}`, `patient:{patientId}`

### doctor:update
```javascript
{
  type: 'update',
  data: Doctor
}
```

**Triggers:**
- Doctor status changed (active → busy → offline)
- Doctor details updated

**Rooms:** `doctors`, `admin`

### analytics:update
```javascript
{
  type: 'update',
  data: Analytics
}
```

**Triggers:**
- Periodic analytics recalculation
- Significant metric changes

**Rooms:** `admin`, `doctors`

### queue:recalculated
```javascript
{
  type: 'recalculated',
  data: {}
}
```

**Triggers:**
- Appointment completed/cancelled
- Queue priorities changed
- Doctor reassignment

**Rooms:** All clients (broadcast)

**Action:** Full queue resync

## Zustand Integration Flow

### 1. Store Structure
```javascript
{
  // Data with versions
  queue: [{ _id, ...data, _version }],
  appointments: [{ _id, ...data, _version }],
  doctors: [{ _id, ...data, _version }],
  
  // Sync metadata
  lastSyncTime: timestamp,
  isInitialized: boolean,
  
  // Actions
  upsertQueueItem: (item) => {...},
  upsertAppointment: (item) => {...},
  setQueue: (queue) => {...}
}
```

### 2. Bootstrap Flow
```
Login → setAuth() → useDataBootstrap() 
  → fetchInitialData() 
  → setQueue/setAppointments/setDoctors 
  → setLastSyncTime() 
  → wsService.connect()
```

### 3. Real-Time Update Flow
```
WebSocket Event → useRealtimeUpdates() 
  → upsertQueueItem(event.data) 
  → Version Check 
  → Update Store (if newer)
```

### 4. Reconnection Flow
```
Disconnect → Reconnect Detected 
  → handleReconnect() 
  → fetchInitialData() 
  → setQueue/setAppointments (full replace) 
  → setLastSyncTime()
```

## Error Handling

### Connection Errors
```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Auto-reconnect handled by socket.io
});
```

### Resync Failures
```javascript
try {
  await resyncData();
} catch (error) {
  console.error('Resync failed:', error);
  // Keep existing data, retry on next reconnect
}
```

### Stale Data Detection
```javascript
const timeSinceSync = Date.now() - lastSyncTime;
if (timeSinceSync > 60000) {  // 1 minute
  // Trigger manual resync
  await fetchInitialData();
}
```

## Performance Optimizations

### 1. Batched Updates
```javascript
// Backend: Batch multiple updates into single event
const updates = [];
for (const item of queueItems) {
  updates.push(item);
}
emitToAll('queue:batch', { type: 'update', data: updates });
```

### 2. Debounced Resyncs
```javascript
const debouncedResync = debounce(async () => {
  await fetchInitialData();
}, 1000);

socket.on('queue:recalculated', debouncedResync);
```

### 3. Selective Subscriptions
```javascript
// Only subscribe to relevant events
if (user.role === 'doctor') {
  wsService.on('queue:update', handleQueueUpdate);
} else if (user.role === 'patient') {
  wsService.on('appointment:update', handleAppointmentUpdate);
}
```

## Testing Scenarios

### 1. Concurrent Updates
```
User A updates appointment → version 5
User B updates same appointment → version 6
Both events broadcast
Frontend applies version 6 (newer)
```

### 2. Out-of-Order Delivery
```
Event version 7 arrives first
Event version 6 arrives second
Version 6 ignored (stale)
```

### 3. Reconnection During Update
```
Client disconnects
Server updates queue (version 10)
Client reconnects
Full resync fetches version 10
```

### 4. Duplicate Events
```
Same event delivered twice (network retry)
Idempotent upsert handles gracefully
No duplicate entries
```

## Production Checklist

- [x] Event versioning implemented
- [x] Idempotent upsert logic
- [x] Reconnection resync handler
- [x] Room-based targeting
- [x] Transaction safety
- [x] Version conflict resolution
- [x] Stale update prevention
- [x] Full state resync on reconnect
- [x] Error handling
- [x] Connection monitoring

## Scalability Considerations

### Multi-Server WebSocket
```javascript
// Use Redis adapter for horizontal scaling
const { createAdapter } = require('@socket.io/redis-adapter');
io.adapter(createAdapter(redisClient, redisClient.duplicate()));
```

### Event Persistence
```javascript
// Store events in database for replay
await EventLog.create({
  type: 'queue:update',
  data: appointment,
  timestamp: Date.now()
});
```

### Selective Broadcasting
```javascript
// Only broadcast to affected rooms
if (appointment.status === 'in_queue') {
  emitToDoctor(appointment.doctorId, 'queue:update', appointment);
} else {
  // Don't broadcast completed appointments to queue
}
```
