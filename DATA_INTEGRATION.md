# Data Integration Architecture

## Overview
Complete data bootstrap mechanism with centralized state management, error handling, and real-time updates.

## Architecture Flow

```
Login → Set Auth → Navigate → Bootstrap Hook → Fetch All Data → Populate Store → Connect WebSocket → Render Dashboard
```

## 1. Authentication Flow

### Login Process
```javascript
// features/auth/Login.jsx
1. User submits credentials
2. API call to /api/auth/login
3. Receive { user, token }
4. Store in Zustand (persisted)
5. Navigate to role-specific route
```

### Role-Based Redirect
- Patient → `/`
- Doctor → `/doctor`
- Admin → `/admin`

## 2. Data Bootstrap Hook

### Location
`shared/hooks/useDataBootstrap.js`

### Responsibilities
- Runs once after authentication
- Fetches all initial data in parallel
- Populates Zustand store
- Connects WebSocket after data loads
- Handles errors with retry mechanism

### Data Fetched
```javascript
Promise.all([
  api.getAppointments(),  // Role-filtered
  api.getQueue(),         // All queue items
  api.getDoctors()        // Available doctors
])

// Admin/Doctor only:
api.getAnalytics()
```

### Error Handling
- Automatic retry after 3 seconds
- Error state stored in Zustand
- User sees loading screen during retry

## 3. Zustand Store Structure

### State Slices
```javascript
{
  // Auth
  user: Object | null,
  token: String | null,
  
  // Loading/Error
  isLoading: Boolean,
  error: String | null,
  isInitialized: Boolean,
  
  // Data
  appointments: Array,
  queue: Array,
  doctors: Array,
  analytics: Object | null
}
```

### Key Methods
- `setAuth(user, token)` - Store credentials
- `setInitialized(bool)` - Mark bootstrap complete
- `updateAppointment(id, updates)` - Real-time update
- `updateQueueItem(id, updates)` - Real-time queue update
- `logout()` - Clear all data

## 4. API Service

### Location
`shared/services/api.js`

### Features
- Centralized HTTP client
- Auto token injection from localStorage
- Error handling with meaningful messages
- Type-safe request wrapper

### Endpoints
```javascript
// Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile

// Appointments
GET    /api/appointments (role-filtered)
POST   /api/appointments (patient/admin)
PATCH  /api/appointments/:id (doctor/admin)
DELETE /api/appointments/:id (admin)

// Queue
GET   /api/queue
PATCH /api/queue/:id

// Users
GET /api/users/doctors (all authenticated)
GET /api/users (admin only)

// Analytics
GET /api/analytics (admin/doctor)
```

## 5. Real-Time Updates

### WebSocket Events
```javascript
// Listened by frontend
'queue:update'        → updateQueueItem()
'appointment:update'  → updateAppointment()
'appointment:create'  → addAppointment()
'doctor:update'       → updateDoctor()
'analytics:update'    → setAnalytics()
```

### Connection Flow
1. Bootstrap completes
2. `wsService.connect(token)` called
3. Listeners registered via `useRealtimeUpdates` hook
4. Updates merge with existing store data

### Reconnection
- Automatic reconnection enabled
- 5 attempts with 1s delay
- No state resync (relies on optimistic updates)

## 6. Loading States

### Global Loading
- Shown during bootstrap
- Blocks dashboard render
- Displays spinner with message

### Component Loading
- Login button shows "Signing in..."
- Disabled state prevents double-submit

## 7. Error Handling

### Error Boundary
- Wraps entire app in `main.jsx`
- Catches React errors
- Shows user-friendly error screen
- Provides refresh button

### API Errors
- Caught in try-catch blocks
- Displayed in UI (login errors)
- Logged to console (development)

### Bootstrap Errors
- Stored in Zustand `error` state
- Automatic retry after 3s
- User sees loading screen during retry

## 8. Data Consistency

### ID Handling
- Backend uses MongoDB `_id`
- Frontend checks both `_id` and `id`
- Updates work with either format

### Empty States
- Empty arrays mean truly empty (not uninitialized)
- `isInitialized` flag prevents premature renders
- Dashboards show "No data" messages when appropriate

## 9. Role-Based Data Filtering

### Backend Filtering
```javascript
// appointmentController.js
if (role === 'patient') filter.patientId = userId
if (role === 'doctor') filter.doctorId = userId
// Admin sees all
```

### Frontend Filtering
```javascript
// Additional client-side filtering for queue/doctors
myQueue = queue.filter(item => item.doctorId === user.id)
```

## 10. Production Checklist

✅ No mock data fallbacks
✅ All dashboards fetch real data
✅ Loading states implemented
✅ Error boundaries added
✅ WebSocket connected after bootstrap
✅ Role-based data filtering
✅ Token-based authentication
✅ Automatic retry on failure
✅ Console.logs removed (except errors)
✅ ID compatibility (_id vs id)

## 11. Performance Optimizations

### Parallel Fetching
- All initial data fetched simultaneously
- Reduces bootstrap time

### Single Bootstrap
- `useRef` prevents duplicate fetches
- `isInitialized` flag prevents re-runs

### Efficient Updates
- Real-time updates merge with existing data
- No full refetch on updates

## 12. Testing Strategy

### Manual Testing
1. Register new user
2. Login with each role
3. Verify data loads
4. Test real-time updates
5. Test error scenarios (network off)
6. Test logout/login cycle

### Data Verification
- Check Network tab for API calls
- Verify WebSocket connection
- Confirm store population in React DevTools
