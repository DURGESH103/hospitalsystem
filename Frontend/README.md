# Smart Hospital Real-Time AI Triage System

Enterprise-grade healthcare SaaS platform with real-time AI-powered patient triage and queue management.

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React 18 + Vite
- **Styling**: TailwindCSS with custom design system
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: HeroIcons

### Folder Structure

```
src/
├── core/                      # Core system modules
│   ├── config/               # Environment & app configuration
│   ├── theme/                # Theme management (dark/light mode)
│   └── websocket/            # WebSocket service for real-time updates
│
├── features/                  # Feature-based modules
│   ├── auth/                 # Authentication & authorization
│   │   ├── Login.jsx
│   │   └── ProtectedRoute.jsx
│   ├── patient/              # Patient dashboard & features
│   │   └── PatientDashboard.jsx
│   ├── doctor/               # Doctor dashboard & queue management
│   │   └── DoctorDashboard.jsx
│   └── admin/                # Admin analytics & system overview
│       └── AdminDashboard.jsx
│
├── shared/                    # Shared resources
│   ├── components/           # Reusable UI components
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   ├── Header.jsx
│   │   ├── Loading.jsx
│   │   ├── StatCard.jsx
│   │   └── Timeline.jsx
│   ├── hooks/                # Custom React hooks
│   │   └── useRealtimeUpdates.js
│   └── utils/                # Utility functions
│       └── index.js
│
├── store/                     # Global state management
│   └── index.js              # Zustand store
│
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## 🎨 Design System

### Color Palette
- **Critical**: Red (#EF4444) - Urgent medical attention
- **High**: Orange (#F59E0B) - High priority
- **Medium**: Blue (#3B82F6) - Standard priority
- **Low**: Green (#10B981) - Low priority

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Glass Effect**: Backdrop blur with transparency
- **Cards**: Rounded corners, subtle shadows
- **Badges**: Color-coded severity indicators
- **Animations**: Smooth transitions with Framer Motion

## 🚀 Features

### 1. Role-Based Dashboards

#### Patient Dashboard
- Real-time queue position tracking
- Estimated wait time countdown
- Appointment status timeline
- Severity badge display
- Live position updates via WebSocket

#### Doctor Dashboard
- Prioritized patient queue (AI-sorted by severity)
- Current consultation card
- Workload metrics (active, completed, in-queue)
- One-click patient management
- Real-time queue reordering

#### Admin Dashboard
- System-wide analytics
- Average wait time trends (line chart)
- Severity distribution (pie chart)
- Doctor workload heatmap
- Real-time metrics updates

### 2. Real-Time Features
- **WebSocket Integration**: Live updates without page refresh
- **Animated Reordering**: Smooth list transitions when priority changes
- **Live Countdown**: Real-time wait time calculation
- **Event-Driven Updates**: Instant UI updates on backend changes

### 3. AI Severity System
- **4-Level Classification**: Critical, High, Medium, Low
- **Auto-Prioritization**: Queue automatically sorted by severity
- **Visual Indicators**: Color-coded badges and highlights
- **Smart Routing**: Critical patients prioritized automatically

### 4. Appointment Lifecycle
- **5 States**: scheduled → in_queue → in_consultation → completed → cancelled
- **Visual Timeline**: Horizontal progress indicator
- **Smooth Transitions**: Framer Motion animations
- **Status Tracking**: Real-time status updates

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## 🔌 WebSocket Events

### Client Listens To:
- `queue:update` - Queue position changes
- `appointment:update` - Appointment status changes
- `doctor:update` - Doctor availability changes
- `analytics:update` - System metrics updates

### Client Emits:
- `appointment:start` - Start consultation
- `appointment:complete` - Complete consultation
- `appointment:cancel` - Cancel appointment

## 🎯 State Management

### Zustand Store Structure
```javascript
{
  // Auth
  user: { id, name, email, role },
  token: string,
  
  // Queue
  queue: [{ id, patientId, doctorId, severity, waitTime }],
  
  // Appointments
  appointments: [{ id, status, patientName, doctorName, severity }],
  
  // Doctors
  doctors: [{ id, name, specialty, status, workload }],
  
  // Analytics
  analytics: { avgWaitTime, waitTimeHistory, severityDistribution }
}
```

## 🎨 UI/UX Principles

1. **Zero Cognitive Overload**: Minimal, focused interfaces
2. **Medical-Grade Usability**: Clear, accessible, high-contrast
3. **Real-Time Responsiveness**: Instant feedback on all actions
4. **Progressive Disclosure**: Show relevant info at the right time
5. **Consistent Design Language**: Unified component system
6. **Accessibility First**: WCAG 2.1 AA compliant

## 🔐 Security

- Role-based access control (RBAC)
- Protected routes with authentication
- JWT token management
- Secure WebSocket connections
- Environment variable configuration

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized for tablets and mobile devices

## 🌙 Dark Mode

- System preference detection
- Manual toggle in header
- Persistent theme storage (localStorage)
- Smooth transitions between modes

## 🧪 Demo Credentials

Login with any email/password combination and select role:
- **Patient**: View queue position and appointment status
- **Doctor**: Manage patient queue and consultations
- **Admin**: System analytics and doctor workload

## 🚀 Production Deployment

### Build Optimization
```bash
npm run build
```

### Environment Variables
Set production URLs in `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Deployment Platforms
- Vercel (Recommended)
- Netlify
- AWS Amplify
- Azure Static Web Apps

## 📊 Performance

- Code splitting with React.lazy
- Optimized bundle size
- Efficient re-renders with Zustand
- Debounced WebSocket events
- Memoized components

## 🛠️ Development Guidelines

### Component Creation
- Use functional components with hooks
- Implement proper TypeScript types (if migrating)
- Follow atomic design principles
- Keep components under 200 lines

### State Management
- Use Zustand for global state
- Local state for component-specific data
- Avoid prop drilling with context when needed

### Styling
- Use Tailwind utility classes
- Custom classes in index.css for reusable patterns
- Follow mobile-first responsive design

### Animation
- Use Framer Motion for complex animations
- CSS transitions for simple hover effects
- Keep animations under 300ms for responsiveness

## 📈 Future Enhancements

- [ ] Voice-activated triage
- [ ] Multi-language support
- [ ] Offline mode with service workers
- [ ] Push notifications
- [ ] Video consultation integration
- [ ] AI chatbot for symptom checking
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF/CSV)

## 🤝 Contributing

1. Follow the established folder structure
2. Maintain consistent code style
3. Write meaningful commit messages
4. Test across different roles
5. Ensure responsive design

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for healthcare professionals**
