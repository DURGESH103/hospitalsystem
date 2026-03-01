# Component Library Documentation

## Design System Components

### 1. Badge

**Purpose**: Display severity levels, status indicators, and categorical information.

**Props**:
```typescript
{
  variant: 'default' | 'critical' | 'high' | 'medium' | 'low'
  children: ReactNode
  className?: string
}
```

**Usage**:
```jsx
<Badge variant="critical">CRITICAL</Badge>
<Badge variant="high">High Priority</Badge>
<Badge variant="medium">Medium</Badge>
<Badge variant="low">Low Risk</Badge>
```

**Variants**:
- `default`: Gray background
- `critical`: Red (urgent medical attention)
- `high`: Orange (high priority)
- `medium`: Blue (standard priority)
- `low`: Green (low priority)

---

### 2. Card

**Purpose**: Container component for content sections with consistent styling.

**Props**:
```typescript
{
  children: ReactNode
  className?: string
  hover?: boolean  // Enable hover animation
}
```

**Usage**:
```jsx
<Card>
  <h3>Patient Information</h3>
  <p>Details here...</p>
</Card>

<Card hover className="cursor-pointer">
  Clickable card with hover effect
</Card>
```

**Features**:
- Automatic fade-in animation
- Optional hover lift effect
- Glass morphism support
- Dark mode compatible

---

### 3. StatCard

**Purpose**: Display key metrics with icon and optional trend indicator.

**Props**:
```typescript
{
  title: string
  value: string | number
  icon: HeroIcon
  trend?: number  // Percentage change
  color?: 'blue' | 'green' | 'orange' | 'red'
}
```

**Usage**:
```jsx
<StatCard
  title="Active Queue"
  value={42}
  icon={UserGroupIcon}
  color="blue"
  trend={5}  // +5% increase
/>
```

**Features**:
- Animated value display
- Color-coded icon background
- Trend indicator (up/down arrow)
- Responsive layout

---

### 4. Timeline

**Purpose**: Visual representation of appointment lifecycle stages.

**Props**:
```typescript
{
  currentStatus: 'scheduled' | 'in_queue' | 'in_consultation' | 'completed' | 'cancelled'
}
```

**Usage**:
```jsx
<Timeline currentStatus="in_consultation" />
```

**Features**:
- 4 stages with icons
- Animated progress bar
- Current stage highlighting
- Cancelled state handling

**Stages**:
1. Scheduled (Clock icon)
2. In Queue (Clock icon)
3. In Consultation (User icon)
4. Completed (CheckCircle icon)

---

### 5. Header

**Purpose**: Global navigation header with user info and theme toggle.

**Props**: None (uses global store)

**Usage**:
```jsx
<Header />
```

**Features**:
- User profile display
- Theme toggle (dark/light)
- Logout button
- Sticky positioning
- Glass morphism effect

---

### 6. Loading

**Purpose**: Loading spinner for async operations.

**Props**: None

**Usage**:
```jsx
{isLoading && <Loading />}
```

**Features**:
- Centered spinner
- Infinite rotation animation
- Full-screen overlay
- Accessible

---

## Layout Components

### Dashboard Layout Pattern

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Header Section */}
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-3xl font-bold">Dashboard Title</h2>
    <p className="text-gray-600 dark:text-gray-400 mt-1">Description</p>
  </motion.div>

  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <StatCard {...} />
  </div>

  {/* Content Cards */}
  <Card className="p-6">
    {/* Content */}
  </Card>
</div>
```

---

## Utility Classes

### Glass Effect
```jsx
<div className="glass">
  Backdrop blur with transparency
</div>
```

### Card Style
```jsx
<div className="card">
  White background with border and shadow
</div>
```

### Primary Button
```jsx
<button className="btn-primary">
  Click Me
</button>
```

### Badge Style
```jsx
<span className="badge">
  Label
</span>
```

---

## Animation Patterns

### Fade In
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  Content
</motion.div>
```

### Slide In
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

### Hover Scale
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button
</motion.button>
```

### List Animation
```jsx
<motion.div
  layout
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
>
  List Item
</motion.div>
```

---

## Color System

### Severity Colors
```javascript
critical: '#EF4444'  // Red
high: '#F59E0B'      // Orange
medium: '#3B82F6'    // Blue
low: '#10B981'       // Green
```

### Status Colors
```javascript
scheduled: 'gray'
in_queue: 'blue'
in_consultation: 'purple'
completed: 'green'
cancelled: 'red'
```

### Semantic Colors
```javascript
primary: 'blue-600'
success: 'green-600'
warning: 'orange-600'
danger: 'red-600'
```

---

## Responsive Breakpoints

```javascript
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

### Grid Patterns

**4-Column Grid**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

**2-Column Grid**:
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

**Responsive Stack**:
```jsx
<div className="flex flex-col md:flex-row gap-4">
```

---

## Accessibility Guidelines

### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio
- Dark mode optimized

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators
- Logical tab order

### Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Descriptive button text

### Motion
- Respects prefers-reduced-motion
- Optional animation disable
- Smooth, not jarring

---

## Best Practices

### Component Creation
1. Start with functional component
2. Add TypeScript types (if applicable)
3. Implement accessibility features
4. Add animations sparingly
5. Test in dark mode
6. Ensure responsive design

### Styling
1. Use Tailwind utilities first
2. Create custom classes for patterns
3. Follow mobile-first approach
4. Maintain consistent spacing
5. Use design tokens

### Performance
1. Memoize expensive components
2. Use proper keys in lists
3. Lazy load heavy components
4. Optimize images
5. Minimize re-renders

---

## Component Checklist

Before creating a new component:
- [ ] Is it reusable?
- [ ] Does it follow atomic design?
- [ ] Is it accessible?
- [ ] Does it support dark mode?
- [ ] Is it responsive?
- [ ] Does it have proper TypeScript types?
- [ ] Is it documented?
- [ ] Does it follow naming conventions?

---

## Future Components

Planned additions:
- [ ] Modal/Dialog
- [ ] Toast Notifications
- [ ] Dropdown Menu
- [ ] Data Table
- [ ] Form Components
- [ ] Search Input
- [ ] Date Picker
- [ ] Avatar Component
- [ ] Skeleton Loader
- [ ] Empty State
