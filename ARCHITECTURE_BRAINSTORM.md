# Case Study Architecture Brainstorm

## Problem Statement
- ClientsV2 carousel shows client logos
- CaseStudy should display slides based on which client is centered in ClientsV2
- Each client can have different slides (some have SlideOne, some have SlideGeo, some have custom slides)
- Need flexible, maintainable architecture

## Current State
- ClientsV2: 6 clients (Seadoo, TCO, GFF, IR, Slate, SWA)
- CaseStudy: Hardcoded to show SWA slides (SlideOne + SlideGeo)
- Assets available: Seadoo, Slate, SWA (with geo for SWA)

---

## Architecture Options

### Option 1: Configuration Object + Context API ⭐ (Recommended)

**Structure:**
```
src/
  config/
    caseStudyConfig.js  (maps client → slides)
  components/
    ClientsV2.jsx       (exposes centered client via context)
    CaseStudy.jsx       (reads context, renders dynamically)
    slides/
      SlideOne.jsx      (generic or per-client versions)
      SlideGeo.jsx
      SlideCustom.jsx
```

**Pros:**
- ✅ Single source of truth (config file)
- ✅ Easy to add new clients/slides
- ✅ Type-safe if using TypeScript
- ✅ Clear separation of concerns
- ✅ Context API is React-native

**Cons:**
- ⚠️ Need to make slide components more generic or create per-client versions
- ⚠️ Context adds a bit of complexity

**Implementation:**
1. Create `CaseStudyContext` to share centered client
2. ClientsV2 updates context when logo centers
3. CaseStudy reads context and renders from config

---

### Option 2: Configuration Object + Callback Props

**Structure:**
```
Main.jsx manages state:
  - activeClient state
  - ClientsV2 calls onClientChange callback
  - CaseStudy receives activeClient prop
```

**Pros:**
- ✅ Simple, no context needed
- ✅ Explicit data flow
- ✅ Easy to debug

**Cons:**
- ⚠️ Main.jsx becomes a bit more complex
- ⚠️ Props drilling if more components need this

---

### Option 3: Slide Registry Pattern

**Structure:**
```
Each slide component exports metadata:
  - clientName: "SWA"
  - slideType: "main" | "geo" | "custom"
  - priority: number (order)

CaseStudy queries registry based on active client
```

**Pros:**
- ✅ Very flexible
- ✅ Self-documenting (slides declare their client)

**Cons:**
- ⚠️ More complex
- ⚠️ Harder to see all slides at a glance
- ⚠️ Requires build-time or runtime discovery

---

### Option 4: Folder-Based Structure

**Structure:**
```
src/
  caseStudies/
    SWA/
      SlideOne.jsx
      SlideGeo.jsx
    Seadoo/
      SlideOne.jsx
    Slate/
      SlideOne.jsx
```

**Pros:**
- ✅ Very organized
- ✅ Easy to find client-specific code
- ✅ Can co-locate assets

**Cons:**
- ⚠️ Code duplication if slides are similar
- ⚠️ Harder to share common slide logic
- ⚠️ Requires dynamic imports or manual registration

---

## Recommended Approach: Option 1 (Config + Context)

### Step-by-Step Implementation:

1. **Create Config File** ✅ (Done)
   - `caseStudyConfig.js` maps clients to slides

2. **Create Context**
   - `CaseStudyContext.js` provides `activeClient` and `setActiveClient`

3. **Update ClientsV2**
   - Detect centered logo (already has `snapToCenter()`)
   - Update context when logo centers
   - Extract client name from centered logo

4. **Make Slides Generic (or Per-Client)**
   - Option A: Make SlideOne generic, pass client data as props
   - Option B: Create per-client slide components (SlideSWA, SlideSeadoo, etc.)
   - **Recommendation:** Start with Option A, refactor to B if needed

5. **Update CaseStudy**
   - Read `activeClient` from context
   - Look up config for that client
   - Render slides dynamically
   - Handle empty case (no slides for client)

---

## Slide Component Strategy

### Strategy A: Generic Components with Props
```jsx
<SlideOne 
  clientName="SWA"
  logo={swaLogo}
  title="Small World Adventures"
  description="..."
  video={smallWorldVideo}
/>
```

**Pros:** DRY, easy to maintain
**Cons:** Need to pass all data as props

### Strategy B: Per-Client Components
```jsx
// SlideSWA.jsx
// SlideSeadoo.jsx
// etc.
```

**Pros:** Each client can have unique structure
**Cons:** Code duplication, harder to maintain

### Strategy C: Hybrid
- Generic base components (SlideOne, SlideGeo)
- Client-specific data in config
- Components read from config or props

**Recommendation:** Strategy C (Hybrid)

---

## Communication Flow

```
User scrolls ClientsV2
  ↓
Logo centers (snapToCenter fires)
  ↓
ClientsV2 detects centered logo name
  ↓
ClientsV2 updates CaseStudyContext
  ↓
CaseStudy reads context
  ↓
CaseStudy looks up config for activeClient
  ↓
CaseStudy renders slides from config
```

---

## Questions to Consider

1. **What happens when no client is centered?**
   - Show default (SWA)?
   - Show empty state?
   - Hide CaseStudy?

2. **What if client has no case study?**
   - Hide CaseStudy section?
   - Show placeholder?
   - Show last valid case study?

3. **Should slides be lazy-loaded?**
   - Yes, for performance (if many clients)
   - No, simpler implementation

4. **How to handle slide transitions?**
   - Instant switch?
   - Fade transition?
   - Slide animation?

---

## Next Steps

1. ✅ Create config file
2. ⏳ Create context
3. ⏳ Update ClientsV2 to detect and share centered client
4. ⏳ Make slides generic or create per-client versions
5. ⏳ Update CaseStudy to read from config
6. ⏳ Test with multiple clients

