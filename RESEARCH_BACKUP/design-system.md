# DINO Design System Research

## Core Design Principles
1. **Clean & Modern**: Minimal, professional aesthetic
2. **Accessibility First**: WCAG 2.1 AA compliance
3. **Mobile First**: Responsive from 320px up
4. **Performance**: Lightweight components
5. **Consistency**: Unified experience across all pages

## Color Palette

### Primary Colors
- **Primary**: Blue (#3B82F6) - Actions, links
- **Primary Dark**: (#2563EB) - Hover states
- **Primary Light**: (#93C5FD) - Backgrounds

### Semantic Colors
- **Success**: Green (#10B981) - Positive states
- **Warning**: Yellow (#F59E0B) - Cautions
- **Danger**: Red (#EF4444) - Errors, deletions
- **Info**: Blue (#3B82F6) - Information

### Neutral Colors
- **Gray 50**: #F9FAFB - Backgrounds
- **Gray 100**: #F3F4F6 - Borders light
- **Gray 200**: #E5E7EB - Borders
- **Gray 300**: #D1D5DB - Disabled text
- **Gray 400**: #9CA3AF - Placeholder
- **Gray 500**: #6B7280 - Secondary text
- **Gray 600**: #4B5563 - Body text
- **Gray 700**: #374151 - Headings
- **Gray 800**: #1F2937 - Primary text
- **Gray 900**: #111827 - Dark text

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

### Font Weights
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Spacing System

### Base Unit: 4px
- **0.5**: 2px
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px
- **16**: 64px
- **20**: 80px

## Border Radius

### Standard Radii
- **none**: 0
- **sm**: 0.125rem (2px)
- **default**: 0.25rem (4px)
- **md**: 0.375rem (6px)
- **lg**: 0.5rem (8px)
- **xl**: 0.75rem (12px) - Primary for cards
- **2xl**: 1rem (16px)
- **full**: 9999px - Pills, avatars

## Component Patterns

### Cards
```tsx
<Card className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
  {/* Content */}
</Card>
```

### Buttons
```tsx
// Primary
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Action
</Button>

// Secondary
<Button variant="outline" className="border-gray-300 text-gray-700">
  Cancel
</Button>

// Danger
<Button variant="destructive" className="bg-red-600 hover:bg-red-700">
  Delete
</Button>
```

### Form Inputs
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email"
    placeholder="you@example.com"
    className="rounded-lg border-gray-300"
  />
  <p className="text-sm text-gray-500">Helper text</p>
</div>
```

### Page Layout
```tsx
<PageContainer>
  <PageHeader
    title="Page Title"
    description="Brief description"
    icon={<Icon className="h-5 w-5" />}
    actions={<Button>Action</Button>}
  />
  
  <div className="grid gap-6">
    {/* Content cards */}
  </div>
</PageContainer>
```

### Icon Container
```tsx
<IconContainer
  icon={<Icon className="h-5 w-5" />}
  variant="primary" // primary, success, warning, danger, default
  size="sm" // xs, sm, md, lg
  shape="rounded" // rounded, circle
/>
```

## Responsive Breakpoints

- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablet
- **lg**: 1024px - Desktop
- **xl**: 1280px - Large desktop
- **2xl**: 1536px - Extra large

## Animation & Transitions

### Standard Transitions
```css
transition: all 0.2s ease;
transition: opacity 0.15s ease;
transition: transform 0.2s ease;
```

### Hover Effects
- Scale: `hover:scale-105`
- Shadow: `hover:shadow-lg`
- Color: Darken by one shade
- Border: Add or emphasize

## Loading States

### Skeleton Screens
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Spinners
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
```

## Notification Patterns

### Toast Notifications
- **Position**: Top center
- **Duration**: 4 seconds default
- **Actions**: Optional undo/retry

### Alert Banners
```tsx
<Alert className="border-blue-200 bg-blue-50">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Information message
  </AlertDescription>
</Alert>
```

## Accessibility Features

### Focus States
- Visible focus rings (2px blue)
- Keyboard navigation support
- Skip links for navigation

### ARIA Labels
- Descriptive button labels
- Form field descriptions
- Loading state announcements

### Color Contrast
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text
- Never rely on color alone

## Dark Mode Preparation

### CSS Variables
```css
:root {
  --background: 255 255 255;
  --foreground: 31 41 55;
  --primary: 59 130 246;
}

.dark {
  --background: 17 24 39;
  --foreground: 243 244 246;
  --primary: 96 165 250;
}
```

### Component Classes
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

## Mobile Optimizations

### Touch Targets
- Minimum 44x44px
- Adequate spacing between targets
- Clear active states

### Responsive Typography
```css
/* Mobile */
h1 { font-size: 1.5rem; }
/* Desktop */
@media (min-width: 768px) {
  h1 { font-size: 2.25rem; }
}
```

### Mobile Navigation
- Hamburger menu < 768px
- Bottom navigation option
- Swipe gestures support

## Performance Guidelines

### Image Optimization
- Use Next.js Image component
- Lazy loading by default
- WebP with fallbacks
- Responsive srcsets

### Code Splitting
- Dynamic imports for heavy components
- Route-based splitting
- Conditional loading

### Bundle Size
- Target < 200KB initial JS
- Tree shaking enabled
- Minimize dependencies