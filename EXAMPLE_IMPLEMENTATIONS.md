# Example Implementations

## Approach 1: Context API (Recommended)

### Main.jsx
```jsx
import { CaseStudyProvider } from './context/CaseStudyContext';

const Main = () => {
  return (
    <div className='main'>
      <CaseStudyProvider>
        <ClientsV2 />
        <CaseStudy />
      </CaseStudyProvider>
    </div>
  );
};
```

### ClientsV2.jsx (Key Changes)
```jsx
import { useCaseStudy } from '../context/CaseStudyContext';

const ClientsV2 = () => {
  const { setActiveClient } = useCaseStudy();
  
  // Function to get client name from logo wrapper
  const getClientNameFromLogo = (logoWrapper) => {
    // Find the SVG component inside
    const svg = logoWrapper.querySelector('svg');
    if (!svg) return null;
    
    // Get the component name from the wrapper's data attribute or SVG class/id
    // OR: Store client name in data attribute when rendering
    const clientIndex = Array.from(logoWrapper.parentElement.children)
      .filter(el => el.classList.contains('client-logo-wrapper'))
      .indexOf(logoWrapper);
    
    // Map index to client name (need to track this)
    return clients[clientIndex % clients.length]?.name || null;
  };
  
  const snapToCenter = () => {
    // ... existing code ...
    
    if (closestLogo) {
      centerLogo(closestLogo);
      
      // NEW: Update active client
      const clientName = getClientNameFromLogo(closestLogo);
      if (clientName) {
        setActiveClient(clientName);
      }
    }
  };
  
  // Also update on initial load
  useEffect(() => {
    // After initialization, detect centered logo
    const container = scrollContainerRef.current;
    if (container && hasInitializedRef.current) {
      const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + (containerRect.width / 2);
      
      logoWrappers.forEach((logoWrapper) => {
        const logoRect = logoWrapper.getBoundingClientRect();
        const logoCenterX = logoRect.left + (logoRect.width / 2);
        const distance = Math.abs(logoCenterX - containerCenterX);
        
        if (distance < 50) { // Within 50px of center
          const clientName = getClientNameFromLogo(logoWrapper);
          if (clientName) setActiveClient(clientName);
        }
      });
    }
  }, [hasInitializedRef.current]);
};
```

### CaseStudy.jsx (Key Changes)
```jsx
import { useCaseStudy } from '../context/CaseStudyContext';
import { getCaseStudyForClient } from '../config/caseStudyConfig';

const CaseStudy = () => {
  const { activeClient } = useCaseStudy();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Get slides for active client
  const caseStudyData = activeClient ? getCaseStudyForClient(activeClient) : null;
  const slides = caseStudyData?.slides || [];
  const totalSlides = slides.length;
  
  // Reset to first slide when client changes
  useEffect(() => {
    setCurrentSlide(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [activeClient]);
  
  // Don't render if no active client or no slides
  if (!activeClient || totalSlides === 0) {
    return null; // or return a placeholder
  }
  
  return (
    <div className="cinestoke-section case-study-section">
      <div ref={scrollContainerRef} className="case-study-carousel">
        {slides.map((slideConfig, index) => {
          const SlideComponent = slideConfig.component;
          return (
            <div key={index} className="case-study-slide-wrapper">
              <SlideComponent {...slideConfig.props} />
              {/* Navigation dots */}
              <div className="case-study-nav-dots">
                {Array.from({ length: totalSlides }).map((_, dotIndex) => (
                  <div
                    key={dotIndex}
                    className="case-study-dot-wrapper"
                    onClick={() => goToSlide(dotIndex)}
                  >
                    <div
                      className={`case-study-dot ${dotIndex === currentSlide ? 'active' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## Approach 2: Callback Props (Simpler Alternative)

### Main.jsx
```jsx
const Main = () => {
  const [activeClient, setActiveClient] = useState(null);
  
  return (
    <div className='main'>
      <ClientsV2 onClientChange={setActiveClient} />
      <CaseStudy activeClient={activeClient} />
    </div>
  );
};
```

### ClientsV2.jsx
```jsx
const ClientsV2 = ({ onClientChange }) => {
  // ... existing code ...
  
  const snapToCenter = () => {
    // ... existing code ...
    
    if (closestLogo) {
      centerLogo(closestLogo);
      const clientName = getClientNameFromLogo(closestLogo);
      if (clientName && onClientChange) {
        onClientChange(clientName);
      }
    }
  };
};
```

### CaseStudy.jsx
```jsx
const CaseStudy = ({ activeClient }) => {
  const caseStudyData = activeClient ? getCaseStudyForClient(activeClient) : null;
  // ... rest same as Approach 1 ...
};
```

---

## Making Slides Generic

### Option A: Generic SlideOne with Props
```jsx
// SlideOne.jsx (becomes generic)
const SlideOne = ({ 
  logo, 
  logoAlt, 
  logoUrl, 
  title, 
  description, 
  video 
}) => {
  return (
    <div className="slide-one">
      <div className="slide-one-header">
        <div className="slide-one-profile-section">
          <a href={logoUrl} target="_blank" rel="noopener noreferrer">
            <img src={logo} alt={logoAlt} className="swa-logo" />
            {/* web icon */}
          </a>
        </div>
        <div className="slide-one-header-text">
          <h2 className="case-study-title">{title}</h2>
          <p className="case-study-description">{description}</p>
        </div>
      </div>
      <div className="case-study-video-container">
        <video src={video} autoPlay loop muted playsInline />
      </div>
    </div>
  );
};
```

### Config with Data
```jsx
// caseStudyConfig.js
import swaLogo from '../assets/CASESTUDIES/Brands/SWApp.webp';
import smallWorldVideo from '../assets/CASESTUDIES/SmallWorldMain.mp4';
import seadooLogo from '../assets/CASESTUDIES/Brands/Seadoopp.webp';
import seadooVideo from '../assets/CASESTUDIES/SeadooMain.mp4';

export const caseStudyConfig = {
  SWA: {
    name: 'Small World Adventures',
    slides: [
      {
        type: 'main',
        component: SlideOne,
        props: {
          logo: swaLogo,
          logoAlt: 'Small World Adventures Logo',
          logoUrl: 'https://smallworldadventures.com/...',
          title: 'Small World Adventures',
          description: 'Join us for 7 days of paddling...',
          video: smallWorldVideo
        }
      },
      {
        type: 'geo',
        component: SlideGeo,
        props: {
          location: '📍 Borja, Napo, Ecuador',
          video: geographicVideo
        }
      }
    ]
  },
  Seadoo: {
    name: 'Seadoo',
    slides: [
      {
        type: 'main',
        component: SlideOne,
        props: {
          logo: seadooLogo,
          logoAlt: 'Seadoo Logo',
          logoUrl: 'https://seadoo.com',
          title: 'Seadoo',
          description: '...',
          video: seadooVideo
        }
      }
    ]
  }
};
```

---

## Detecting Centered Client in ClientsV2

### Method 1: Store client name in data attribute
```jsx
// When rendering clients
{displayedClients.map((client, index) => (
  <div 
    className="client-logo-wrapper"
    data-client-name={client.name}  // NEW
    onClick={(e) => {
      centerLogo(e.currentTarget);
      setActiveClient(client.name);  // NEW
    }}
  >
    <Component />
  </div>
))}

// In snapToCenter
const getClientName = (logoWrapper) => {
  return logoWrapper.getAttribute('data-client-name');
};
```

### Method 2: Track by index
```jsx
// Store original index when creating displayedClients
const clients = clientComponents.map((Component, index) => ({
  Component,
  name: Component.displayName || Component.name,
  originalIndex: index  // NEW
}));

// When rendering, track which original client this is
{displayedClients.map((client, displayIndex) => {
  const originalIndex = displayIndex % clients.length;
  const clientName = clients[originalIndex].name;
  // ...
})}
```

**Recommendation:** Method 1 (data attributes) - simpler and more reliable

