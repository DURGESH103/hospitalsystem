# Hospital-Grade Queue Management Engine

## Architecture Overview

```
Patient Books → Auto-Assign Doctor → Calculate Priority → Update Queue → Broadcast WebSocket
```

## Core Components

### 1. Queue Service (`services/queueService.js`)

**Responsibilities:**
- Priority-based queue sorting
- Dynamic position calculation
- Doctor workload balancing
- Automatic reassignment
- Transaction-safe updates
- Real-time event broadcasting

### 2. Priority Algorithm

```javascript
SEVERITY_PRIORITY = {
  critical: 1,  // Highest priority
  high: 2,
  medium: 3,
  low: 4       // Lowest priority
}

Sort Order:
1. Severity (ascending)
2. Created time (FIFO within same severity)
```

### 3. Queue Position Calculation

```
Position = Index in sorted queue + 1
Wait Time = Position × AVG_CONSULTATION_TIME (15 min)
```

## API Endpoints

### Queue Management

```
GET    /api/queue
       - Doctor: Returns their queue only
       - Patient: Returns their position info
       - Admin: Returns entire queue

PATCH  /api/queue/:id
       - Update queue position manually
       - Triggers recalculation
       - Auth: doctor, admin

POST   /api/queue/:id/reassign
       - Reassign to different doctor
       - Recalculates both queues
       - Auth: admin only
```

### Appointment Lifecycle

```
POST   /api/appointments
       - Creates appointment
       - Auto-assigns doctor by workload
       - Adds to queue
       - Broadcasts to doctor & patient

PATCH  /api/appointments/:id
       - Update status (in_consultation, completed, cancelled)
       - Triggers queue recalculation
       - Broadcasts updates

DELETE /api/appointments/:id
       - Marks as cancelled
       - Removes from queue
       - Recalculates positions
```

## Service Layer Methods

### `calculateQueuePositions()`
```javascript
Algorithm:
1. Fetch all appointments with status: scheduled | in_queue
2. Sort by severity priority, then creation time
3. Assign positions (1, 2, 3...)
4. Calculate wait times (position × 15 min)
5. Bulk update database
6. Return sorted queue

Complexity: O(n log n)
Database: Single bulkWrite operation
```

### `assignDoctorByWorkload(appointmentId, specialty?)`
```javascript
Algorithm:
1. Fetch all active doctors (filtered by specialty if provided)
2. Count current workload for each doctor
   - Workload = appointments in [scheduled, in_queue, in_consultation]
3. Sort doctors by workload (ascending)
4. Assign to doctor with lowest workload
5. Update appointment with doctorId and doctorName

Complexity: O(d × log d) where d = number of doctors
Load Balancing: Ensures even distribution
```

### `addToQueue(appointmentData)`
```javascript
Transaction Flow:
1. Start MongoDB session
2. Create appointment
3. If no doctorId → auto-assign by workload
4. Recalculate all queue positions
5. Commit transaction
6. Broadcast to doctor's room
7. Broadcast to patient's room

Rollback: On any error, entire operation reverts
Concurrency: Session ensures atomic operation
```

### `updateAppointmentStatus(appointmentId, status)`
```javascript
Transaction Flow:
1. Start session
2. Update appointment status
3. If status = completed | cancelled:
   - Recalculate queue (removes from queue)
4. Commit transaction
5. Broadcast to doctor & patient
6. Broadcast queue:recalculated to all

Use Cases:
- Doctor starts consultation → in_consultation
- Doctor completes → completed (triggers recalc)
- Patient cancels → cancelled (triggers recalc)
```

### `reassignDoctor(appointmentId, newDoctorId)`
```javascript
Transaction Flow:
1. Start session
2. Validate new doctor exists and is active
3. Update appointment with new doctor
4. Recalculate queue positions
5. Commit transaction
6. Broadcast to new doctor's room
7. Broadcast to patient

Use Cases:
- Doctor goes offline
- Manual admin reassignment
- Specialty mismatch correction
```

### `handleDoctorUnavailable(doctorId)`
```javascript
Transaction Flow:
1. Start session
2. Find all appointments assigned to doctor
3. For each appointment:
   - Reassign to available doctor with lowest workload
4. Recalculate entire queue
5. Commit transaction
6. Broadcast queue:recalculated

Triggers:
- Doctor marks status as offline
- Doctor emergency leave
- System detects doctor disconnect
```

### `getQueueByDoctor(doctorId)`
```javascript
Query:
- Filter: doctorId = X, status IN [scheduled, in_queue]
- Sort: queuePosition ASC
- Returns: Array of appointments

Used by: Doctor dashboard
```

### `getPatientPosition(patientId)`
```javascript
Query:
1. Find patient's active appointment
2. Count appointments ahead in same doctor's queue
3. Return: { position, ahead, estimatedWait }

Used by: Patient dashboard
```

## WebSocket Room Architecture

### Room Structure
```javascript
doctor:{doctorId}  → All updates for specific doctor
patient:{patientId} → All updates for specific patient
admin              → System-wide updates
```

### Authentication
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, JWT_SECRET);
  socket.userId = decoded.id;
  socket.userRole = decoded.role;
  next();
});
```

### Auto-Join on Connect
```javascript
if (role === 'doctor') socket.join(`doctor:${userId}`);
if (role === 'patient') socket.join(`patient:${userId}`);
if (role === 'admin') socket.join('admin');
```

### Event Broadcasting

```javascript
// Targeted to specific doctor
io.to(`doctor:${doctorId}`).emit('queue:update', appointment);

// Targeted to specific patient
io.to(`patient:${patientId}`).emit('appointment:update', appointment);

// Broadcast to all (queue recalculated)
io.emit('queue:recalculated');
```

## Database Transaction Safety

### Why Transactions?
- Prevent race conditions during concurrent bookings
- Ensure queue consistency
- Atomic operations (all or nothing)

### Transaction Pattern
```javascript
const session = await Appointment.startSession();
session.startTransaction();

try {
  // Multiple database operations
  await operation1({ session });
  await operation2({ session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Concurrency Scenarios

**Scenario 1: Two patients book simultaneously**
```
Patient A → Transaction 1 → Assigns Doctor X → Recalc → Commit
Patient B → Transaction 2 → Waits for T1 → Assigns Doctor Y → Recalc → Commit
Result: Both succeed, queue consistent
```

**Scenario 2: Doctor completes while patient books**
```
Doctor → Transaction 1 → Mark completed → Recalc → Commit
Patient → Transaction 2 → Waits → Add to queue → Recalc → Commit
Result: Queue positions accurate
```

## Scalability Considerations

### Database Indexes
```javascript
// Appointment collection
{
  doctorId: 1,
  status: 1,
  queuePosition: 1
}

{
  patientId: 1,
  status: 1
}

{
  severity: 1,
  createdAt: 1
}
```

### Query Optimization
- Use `$in` for status filtering (indexed)
- Limit queue queries to active statuses only
- Use `countDocuments` instead of `find().length`

### Bulk Operations
- `bulkWrite` for position updates (single DB call)
- Reduces network overhead
- Atomic batch updates

### Caching Strategy (Future)
```javascript
// Redis cache for queue state
SET queue:doctor:{id} JSON.stringify(queue)
EXPIRE queue:doctor:{id} 60

// Invalidate on any queue change
DEL queue:doctor:{id}
```

## Real-World Edge Cases

### 1. All Doctors Busy
```javascript
if (doctors.length === 0) {
  throw new Error('No available doctors');
}
// Frontend shows "All doctors busy, you're in waiting list"
```

### 2. Critical Patient Arrives
```javascript
// Automatic priority bump
severity: 'critical' → position = 1
// All other patients shift down
```

### 3. Doctor Disconnects Mid-Consultation
```javascript
// WebSocket disconnect event
socket.on('disconnect', async () => {
  await User.findByIdAndUpdate(userId, { status: 'offline' });
  await queueService.handleDoctorUnavailable(userId);
});
```

### 4. Patient Cancels Last Minute
```javascript
// Status → cancelled
// Queue recalculates
// Next patient moves up
// Doctor notified via WebSocket
```

## Performance Metrics

### Expected Load
- 100 concurrent appointments
- 20 doctors
- 500 patients/day

### Query Performance
- Queue fetch: < 50ms
- Position calculation: < 100ms
- Reassignment: < 200ms

### WebSocket Latency
- Room broadcast: < 10ms
- Event delivery: < 50ms

## Testing Checklist

- [ ] Book appointment → auto-assigns doctor
- [ ] Critical patient → jumps to position 1
- [ ] Doctor completes → queue recalculates
- [ ] Doctor goes offline → patients reassigned
- [ ] Concurrent bookings → no race conditions
- [ ] WebSocket rooms → targeted updates
- [ ] Transaction rollback → on error
- [ ] Load balancing → even distribution

## Production Deployment

### Environment Variables
```
MONGO_URI=mongodb://...
JWT_SECRET=...
AVG_CONSULTATION_TIME=15
```

### Monitoring
- Track queue length per doctor
- Alert if queue > 10 patients
- Monitor transaction failures
- WebSocket connection health

### Scaling
- Horizontal: Multiple Node.js instances
- WebSocket: Redis adapter for multi-server
- Database: MongoDB replica set
