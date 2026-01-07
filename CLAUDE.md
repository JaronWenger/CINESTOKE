# CINESTOKE

Video production portfolio website showcasing cinematic work for 7 clients. Deployed at https://www.cinestoke.com via GitHub Pages.

## Tech Stack

- **React 18.3** with Create React App
- **React Router DOM 7.3** (HashRouter)
- **Material-UI 6.1** + **Emotion** (CSS-in-JS)
- **Swiper 11.1** (carousels)
- **EmailJS 3.2** (contact form)
- **Google Tag Manager** (analytics)

## Project Structure

```
src/
├── App.js              # Router: /, /offers, /links
├── index.js            # Entry point
├── index.css           # Global styles, fonts
├── config/
│   └── caseStudyConfig.js   # Centralized client/slide data
├── components/
│   ├── Main.jsx        # Homepage orchestrator
│   ├── ClientsV2.jsx   # Infinite logo carousel
│   ├── CaseStudy.jsx   # Case study slides (synced with ClientsV2)
│   ├── Slide*.jsx      # Slide components (One, Main, Logo, Splits, Geo)
│   ├── Pics.jsx        # Portfolio image carousel
│   ├── Offers.jsx      # Pricing page
│   ├── Links.jsx       # External links
│   ├── Social.jsx      # Social links + contact modal
│   ├── Contact.jsx     # Contact form
│   └── ErrorBoundary.jsx
└── assets/
    ├── *.svg           # Client logos
    ├── *.mp4           # Background videos
    └── CASESTUDIES/    # Client-specific videos/images
```

## Commands

```bash
npm start       # Development server (localhost:3000)
npm run build   # Production build
npm run deploy  # Build + deploy to GitHub Pages
npm test        # Run tests
```

## Key Files

| File | Purpose |
|------|---------|
| `src/config/caseStudyConfig.js` | Single source of truth for all client data |
| `src/components/Main.jsx:1-200` | Homepage state management, video preloading |
| `src/components/ClientsV2.jsx` | Infinite scroll carousel with drag support |
| `src/components/CaseStudy.jsx` | Synced carousel, height synchronization logic |
| `public/index.html` | GTM, meta tags, preloads |

## Data Flow

```
Main.jsx
├── manages: isMobile, activeClient, mainVideoLoaded
├── ClientsV2 → onClientChange → updates activeClient
└── CaseStudy ← receives activeClient, renders slides from config
```

## Client Case Studies

7 clients configured in `caseStudyConfig.js`: SWA, Seadoo, Slate, TCO, GFF, IR, BG

Each client has:
- `logoComponent` (SVG)
- `order` (carousel position)
- `slides[]` with type, component, and props

## Adding a New Client

1. Add logo SVG to `src/assets/`
2. Add videos to `src/assets/CASESTUDIES/`
3. Configure in `src/config/caseStudyConfig.js` following existing pattern
4. Helper functions auto-include new clients in carousels

## Mobile Considerations

- Separate mobile videos (`*phone.mp4`) loaded based on viewport
- `isMobile` state in Main.jsx controls responsive behavior
- Mobile detection: `window.innerWidth <= 767`

## Performance Notes

- Main video preloaded with `fetchPriority="high"`
- Case studies gate on `mainVideoLoaded` to prevent bandwidth competition
- Videos use `preload="metadata"` except active slide
- Images optimized as webp

## Environment

- Deployment: GitHub Pages with custom domain (CNAME)
- Analytics: GTM-KPBPCBXS
- Contact: EmailJS service

## Additional Documentation

- `.claude/docs/architectural_patterns.md` - Carousel synchronization, infinite scroll, height sync, drag/momentum patterns

## Workflow

- Present a plan before major changes
- Keep changes minimal and simple
- Summarize what changed after edits