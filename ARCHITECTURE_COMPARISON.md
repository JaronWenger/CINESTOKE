# Architecture Comparison Summary

## Quick Decision Matrix

| Approach | Complexity | Maintainability | Flexibility | Performance | Recommendation |
|----------|-----------|-----------------|-------------|-------------|----------------|
| **Context API** | Medium | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ **Best for scale** |
| **Callback Props** | Low | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **Best for simplicity** |
| **Slide Registry** | High | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ Over-engineered |
| **Folder-Based** | Medium | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ Code duplication |

---

## My Recommendation: **Start with Callback Props, Upgrade to Context if Needed**

### Why Callback Props First?
1. **Simpler** - No context setup, easier to understand
2. **Explicit** - Clear data flow through props
3. **Easier to debug** - Can see state in Main.jsx
4. **Less boilerplate** - No provider wrapper needed
5. **Sufficient** - Only 2 components need to communicate

### When to Upgrade to Context?
- If more components need access to activeClient
- If you add nested components that need this data
- If you want to add more shared state later

---

## Implementation Priority

### Phase 1: Foundation (Do First)
1. ✅ Create `caseStudyConfig.js` - **DONE**
2. ⏳ Add `data-client-name` to logo wrappers in ClientsV2
3. ⏳ Detect centered client in `snapToCenter()`
4. ⏳ Pass callback from Main.jsx to ClientsV2
5. ⏳ Update CaseStudy to read activeClient prop

### Phase 2: Make Slides Generic
6. ⏳ Refactor SlideOne to accept props (or create per-client versions)
7. ⏳ Update config with actual data (logos, videos, text)
8. ⏳ Test with SWA (should work as before)

### Phase 3: Add More Clients
9. ⏳ Add Seadoo case study
10. ⏳ Add Slate case study
11. ⏳ Handle clients without case studies gracefully

---

## Key Design Decisions

### 1. How to detect centered client?
**Answer:** Use `data-client-name` attribute on logo wrappers
- Simple and reliable
- Works with infinite scroll
- Easy to query

### 2. What to show when no client centered?
**Answer:** Show last valid client (or default to SWA)
- Better UX than blank state
- Smooth transitions

### 3. What to show when client has no case study?
**Answer:** Hide CaseStudy section entirely
- Clean, no empty placeholders
- Can add later when case study is ready

### 4. Should slides be generic or per-client?
**Answer:** Start generic, refactor if needed
- Less code duplication
- Easier to maintain
- Can always create custom slides for special cases

---

## File Structure (Recommended)

```
src/
  config/
    caseStudyConfig.js          ✅ Created
  components/
    ClientsV2.jsx                ⏳ Update to detect & notify
    CaseStudy.jsx               ⏳ Update to read config
    slides/
      SlideOne.jsx              ⏳ Make generic or keep as-is
      SlideGeo.jsx              ⏳ Make generic or keep as-is
  Main.jsx                      ⏳ Add state management
```

---

## Next Steps

1. **Review these documents** - Make sure approach makes sense
2. **Decide on approach** - Context vs Callback Props
3. **Decide on slide strategy** - Generic vs Per-Client
4. **Start implementation** - I can help with the code!

