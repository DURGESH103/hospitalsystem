# System Architecture Documentation

## Overview
Smart Hospital AI Triage System is built with a modern, scalable architecture following enterprise best practices.

## Architecture Layers

### 1. Presentation Layer (UI)
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS + Custom Design System
- **Animations**: Framer Motion
- **Responsibility**: User interface, user interactions, visual feedback

### 2. State Management Layer
- **Library**: Zustand
- **Pattern**: Flux-inspired unidirectional data flow
- **Stores**:
  - `useAppStore`: Global application state
  - `useThemeStore`: Theme preferences (dark/light)
- **Benefits**: 
  - Minimal boilerplate
  - No context provider hell
  - Built-in devtools support

### 3. Communication Layer
- **Real-time**: Socket.IO Client
- **REST API**: Fetch API (future implementation)
- **WebSocket Service**: Singleton pattern for connection management
- **Event-driven**: Subscribe/publish pattern for real-time updates

### 4. Business Logic Layer
- **Location**: Feature modules
- **Pattern**: Feature-based organization
- **Utilities**: Shared business logic in `shared/utils`

## Design Patterns

### 1. Feature-Based Architecture
```
features/
  ├── auth/          # Authentication feature
  ├── patient/       # Patient-specific features
  ├── doctor/        # Doctor-specific features
  └── admin/         # Admin-specific features
```

**Benefits**:
- High cohesion, low coupling
- Easy to scale and maintain
- Clear feature boundaries
- Team can work independently on features

### 2. Component Composition
```
Card (Container)
  └── StatCard (Specialized)
      └── Badge (Primitive)
```

**Principles**:
- Atomic design methodology
- Reusable primitives
- Composable components
- Single responsibility

### 3. Custom Hooks Pattern
```javascript
useRealtimeUpdates()  // WebSocket event handling
useTheme()            // Theme management
```

**Benefits**:
- Logic reusability
- Separation of concerns
- Testable business logic

### 4. Singleton Pattern (WebSocket)
```javascript
class WebSocketService {
  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    WebSocketService.instance = this;
  }
}
```

**Benefits**:
- Single connection instance
- Centralized event management
- Memory efficient

## Data Flow

### 1. Authentication Flow
```
User Login → setAuth() → Store Updated → WebSocket Connect → Dashboard Render
```

### 2. Real-time Update Flow
```
Backend Event → WebSocket → Event Handler → Store Update → Component Re-render
```

### 3. User Action Flow
```
User Action → Event Handler → WebSocket Emit → Backend Processing → Real-time Update
```

## State Management Strategy

### Global State (Zustand)
- User authentication
- Queue data
- Appointments
- Doctors list
- Analytics

### Local State (useState)
- Form inputs
- UI toggles
- Temporary data
- Component-specific state

### Server State (Future: React Query)
- API data caching
- Background refetching
- Optimistic updates

## Security Architecture

### 1. Authentication
- JWT token-based
- Stored in Zustand store
- Sent with WebSocket connection
- Included in API requests

### 2. Authorization
- Role-based access control (RBAC)
- Protected routes
- Component-level permissions
- Feature flags per role

### 3. Data Protection
- Environment variables for sensitive config
- No hardcoded credentials
- Secure WebSocket (WSS in production)
- HTTPS only in production

## Performance Optimization

### 1. Code Splitting
```javascript
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
```

### 2. Memoization
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers

### 3. Bundle Optimization
- Tree shaking with ES modules
- Dynamic imports
- Vite's optimized build

### 4. Real-time Optimization
- Debounced WebSocket events
- Throttled UI updates
- Efficient list rendering with keys

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless components
- Centralized state management
- API-driven architecture

### 2. Feature Scaling
- Feature-based folder structure
- Lazy loading of features
- Independent feature deployment

### 3. Data Scaling
- Pagination for large lists
- Virtual scrolling (future)
- Efficient data structures

## Testing Strategy

### 1. Unit Tests
- Utility functions
- Custom hooks
- Store actions

### 2. Integration Tests
- Component interactions
- WebSocket events
- State updates

### 3. E2E Tests
- User workflows
- Role-based scenarios
- Real-time features

## Deployment Architecture

### Development
```
Local Dev → Vite Dev Server → Hot Module Replacement
```

### Production
```
Build → Static Assets → CDN → Edge Locations
WebSocket → Load Balancer → WebSocket Servers
```

## Monitoring & Observability

### 1. Error Tracking
- Console error logging
- WebSocket error handling
- API error boundaries

### 2. Performance Monitoring
- Lighthouse scores
- Core Web Vitals
- Bundle size tracking

### 3. User Analytics
- Feature usage tracking
- User journey mapping
- Performance metrics

## Future Architecture Enhancements

### 1. Micro-frontends
- Independent feature deployment
- Team autonomy
- Technology flexibility

### 2. Progressive Web App (PWA)
- Offline support
- Service workers
- Push notifications

### 3. Server-Side Rendering (SSR)
- Next.js migration
- Improved SEO
- Faster initial load

### 4. GraphQL Integration
- Efficient data fetching
- Real-time subscriptions
- Type safety

## Technology Decisions

### Why React?
- Component reusability
- Large ecosystem
- Strong community support
- Excellent developer experience

### Why Zustand over Redux?
- Minimal boilerplate
- Better TypeScript support
- Smaller bundle size
- Simpler API

### Why TailwindCSS?
- Utility-first approach
- Consistent design system
- Excellent performance
- Easy customization

### Why Framer Motion?
- Declarative animations
- Spring physics
- Layout animations
- Gesture support

### Why Socket.IO?
- Automatic reconnection
- Room support
- Fallback mechanisms
- Cross-browser compatibility

## Conclusion

This architecture provides:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear structure and patterns
- **Performance**: Optimized for speed
- **Developer Experience**: Modern tooling and practices
- **User Experience**: Real-time, responsive, accessible
