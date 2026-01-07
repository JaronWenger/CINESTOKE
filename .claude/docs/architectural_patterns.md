# Architectural Patterns

## 1. Centralized Configuration Pattern

**Files:** `src/config/caseStudyConfig.js`

All client case study data is defined in a single configuration object. Components consume this config via helper functions rather than hardcoding data.

**Structure:**
```javascript
caseStudyConfig = {
  clientName: {
    name: string,
    logoComponent: ReactComponent,
    order: number,
    slides: [{ type, component, props }]
  }
}
```

**Helper functions:**
- `getCaseStudyForClient(name)` - Get config for specific client
- `getClientsWithCaseStudies()` - Get all clients sorted by order
- `getClientLogoComponents()` - Get logo mapping
- `getClientNames()` - Get ordered client name list

**Usage:** `src/components/CaseStudy.jsx:40-60`, `src/components/ClientsV2.jsx:20-30`

## 2. Carousel Synchronization Pattern

**Files:** `src/components/ClientsV2.jsx`, `src/components/CaseStudy.jsx`, `src/components/Main.jsx`

Two carousels (logos and slides) stay synchronized through shared state in parent.

**Flow:**
1. `Main.jsx` holds `activeClient` state
2. `ClientsV2` calls `onClientChange(clientName)` when user scrolls logos
3. `Main.jsx` passes `activeClient` prop to `CaseStudy`
4. `CaseStudy` renders slides for that client

**Reverse sync (slide change triggers logo change):**
- `CaseStudy` calls `onShiftBrand(direction)` callback
- `Main.jsx` calls `ClientsV2.shiftToAdjacentBrand()` via ref
- Uses `useImperativeHandle` to expose carousel methods

**Reference:** `src/components/Main.jsx:80-120`

## 3. Infinite Scroll Carousel Pattern

**Files:** `src/components/ClientsV2.jsx`, `src/components/Pics.jsx`

Creates illusion of infinite scrolling by dynamically prepending/appending items.

**Implementation:**
1. Track scroll position with refs (`scrollContainerRef`)
2. When approaching edges, clone and append/prepend items
3. Immediately adjust `scrollLeft` to hide the jump
4. Use flags (`isAdjustingRef`) to prevent cascading updates

**Key techniques:**
- `isAdjustingRef.current = true` before adjustments
- Calculate exact pixel offset to maintain visual position
- Use `requestAnimationFrame` for smooth updates

**Reference:** `src/components/ClientsV2.jsx:150-250`

## 4. Height Synchronization Pattern

**Files:** `src/components/CaseStudy.jsx`

SlideOne (SWA) has dynamic height based on content. All other slides must match this height for consistent carousel behavior.

**Implementation:**
1. Measure SlideOne height after render using `ResizeObserver`
2. Store in `slideOneHeightRef` to persist across brand switches
3. Apply as `maxHeight` and `minHeight` to all slide wrappers
4. Use `requestAnimationFrame` chain for accurate post-render measurement

**Reference:** `src/components/CaseStudy.jsx:100-180`

## 5. Drag & Momentum Pattern

**Files:** `src/components/ClientsV2.jsx`, `src/components/CaseStudy.jsx`

Desktop mouse drag and mobile touch swipe with physics-based momentum.

**Implementation:**
1. Track drag start position and time
2. Calculate velocity on drag end: `velocity = distance / time`
3. Apply momentum with decay: `position += velocity; velocity *= friction`
4. Use `requestAnimationFrame` for smooth animation
5. Snap to nearest item when momentum ends

**Key details:**
- Drag threshold prevents accidental triggers (5px minimum)
- Global event listeners (`document.addEventListener`) for drag outside bounds
- Touch events for mobile, mouse events for desktop
- `cursor: grabbing` during active drag

**Reference:** `src/components/ClientsV2.jsx:300-400`

## 6. Responsive Video Loading Pattern

**Files:** `src/components/Main.jsx`, `src/components/SlideMain.jsx`, `src/components/SlideOne.jsx`

Different video files for desktop and mobile to optimize bandwidth.

**Implementation:**
1. Detect viewport on mount: `window.innerWidth <= 767`
2. Preload appropriate video with `fetchPriority="high"`
3. Pass both `video` and `videoMobile` props to slide components
4. Slides select source based on `isMobile` prop

**Gating pattern:**
- `mainVideoLoaded` state gates rendering of heavy components
- Prevents bandwidth competition during initial load
- Case studies only render after main video ready

**Reference:** `src/components/Main.jsx:30-80`

## 7. Error Boundary Pattern

**Files:** `src/components/ErrorBoundary.jsx`

React class component implementing error boundary lifecycle.

**Implementation:**
- `getDerivedStateFromError` sets error state
- `componentDidCatch` for logging
- Renders fallback UI with refresh option
- Wraps Links page in App.js

**Reference:** `src/components/ErrorBoundary.jsx:1-40`, `src/App.js:20`

## 8. Modal Contact Form Pattern

**Files:** `src/components/Social.jsx`, `src/components/ContactV2.jsx`

Contact form appears as modal overlay triggered from social section.

**Implementation:**
1. `Social.jsx` manages `showContact` state
2. Passes toggle function to ContactV2
3. ContactV2 renders as fixed overlay
4. Backdrop click or close button hides modal
5. EmailJS integration for form submission

**Reference:** `src/components/Social.jsx:30-50`, `src/components/ContactV2.jsx`

## 9. Analytics Event Pattern

**Files:** `src/components/Main.jsx`, `src/components/ClientsV2.jsx`

Push events to Google Tag Manager dataLayer.

**Implementation:**
```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'eventName',
  eventCategory: 'category',
  eventAction: 'action',
  eventLabel: 'label'
});
```

**Events tracked:**
- Video watch progress
- Carousel scroll interactions
- Contact form submissions

**Reference:** `src/components/Main.jsx:150-170`
