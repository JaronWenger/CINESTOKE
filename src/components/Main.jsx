import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import videoBg from '../assets/Welcome.mp4'
import videoBgMobile from '../assets/Welcomephone.mp4'
import posterImage from '../assets/PosterImage.webp'
import Bars from './Bars'

import Clients from './Clients';
import Pics from './Pics';
import CaseStudy from './CaseStudy';
import Social from './Social';
import { useVideoErrorHandling } from '../hooks/useVideoErrorHandling';
import { getClientByOrder } from '../config/caseStudyConfig';


const Main = ({ onToggleLightMode }) => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  // Resolve initial client from URL param (e.g. /#/6 → 'Seadoo'), fallback to SWA
  const getInitialClient = () => {
    if (clientId) {
      const num = parseInt(clientId, 10);
      if (!isNaN(num)) {
        const client = getClientByOrder(num);
        if (client) return client.key;
      }
    }
    return 'SWA';
  };
  const initialClient = getInitialClient();

  // Initialize isMobile correctly on first render to avoid loading wrong video
  // Use document.documentElement.clientWidth for more reliable mobile detection
  const getInitialMobile = () => {
    if (typeof window === 'undefined') return false;
    const width = document.documentElement.clientWidth || window.innerWidth;
    return width <= 768;
  };

  const [isMobile, setIsMobile] = useState(getInitialMobile());
  const [videoWatched, setVideoWatched] = useState(false);
  const [isReelOpen, setIsReelOpen] = useState(false);

  const videoRef = useRef(null);
  const [activeClient, setActiveClient] = useState(initialClient);
  const [videoReady, setVideoReady] = useState(false); // Track if video is ready to play
  const [mainVideoLoaded, setMainVideoLoaded] = useState(false); // Track if main video has loaded
  const [isCaseStudyFading, setIsCaseStudyFading] = useState(false); // Track fade state for CaseStudy
  const clientsRef = useRef(null); // Ref to Clients component for brand shifting
  const caseStudyRef = useRef(null); // Ref to CaseStudy component for scrolling to first slide

  // Clean the URL after reading the client param — use history API directly
  // to avoid React Router remounting Main and resetting state
  useEffect(() => {
    if (clientId) {
      window.history.replaceState(null, '', window.location.origin);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: if welcome video never fires canplay (e.g. network stall), unblock CaseStudy after 8s
  useEffect(() => {
    const fallback = setTimeout(() => setMainVideoLoaded(true), 8000);
    return () => clearTimeout(fallback);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add stuck video detection for main video (mobile only)
  const mainVideoSrc = isMobile ? videoBgMobile : videoBg;
  useVideoErrorHandling(videoRef, mainVideoSrc, isMobile);

  // Handle client change from Clients (user click or swipe) - triggers fade
  const handleClientWillChange = (clientKey) => {
    // Debug logging (uncomment for debugging):
    // console.log('🎬 handleClientWillChange:', { clientKey, activeClient, isCaseStudyFading });
    // Only trigger fade if actually changing to a different client
    if (clientKey !== activeClient) {
      // console.log('✨ Starting fade transition to:', clientKey);
      setIsCaseStudyFading(true);
      setActiveClient(clientKey);
    } else {
      // console.log('⏭️ Same client, skipping fade');
    }
  };

  // Handle fade completion from CaseStudy
  const handleFadeComplete = useCallback(() => {
    setIsCaseStudyFading(false);
  }, []);

  // Safety: if transitionend is missed (rapid clicks cause listener re-registration race),
  // force-reset the fade after 800ms so the carousel never stays black permanently
  useEffect(() => {
    if (!isCaseStudyFading) return;
    const timeout = setTimeout(() => setIsCaseStudyFading(false), 800);
    return () => clearTimeout(timeout);
  }, [isCaseStudyFading]);

  // Handle re-click on already-centered brand (reset to first slide)
  const handleClientReselect = (clientKey) => {
    // console.log('🔄 handleClientReselect - scrolling to first slide of:', clientKey);
    if (caseStudyRef.current?.scrollToFirstSlide) {
      caseStudyRef.current.scrollToFirstSlide(clientKey);
    }
  };

  // Use useLayoutEffect to set mobile state synchronously before paint
  useLayoutEffect(() => {
    // Check screen width synchronously before render
    const width = document.documentElement.clientWidth || window.innerWidth;
    const isMobileDevice = width <= 768;
    setIsMobile(isMobileDevice);

    // Preload the appropriate video immediately for faster loading with high priority
    // Note: Using 'fetch' as the 'as' value since 'video' is not widely supported
    const videoToPreload = isMobileDevice ? videoBgMobile : videoBg;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = videoToPreload;
    link.crossOrigin = 'anonymous';
    // Add fetchpriority for faster loading (especially on mobile)
    if (link.setAttribute) {
      link.setAttribute('fetchpriority', 'high');
    }
    // Insert at the beginning of head for higher priority
    const firstChild = document.head.firstChild;
    if (firstChild) {
      document.head.insertBefore(link, firstChild);
    } else {
      document.head.appendChild(link);
    }

    // Optional: Add event listener to check on window resize
    const handleResize = () => {
      const width = document.documentElement.clientWidth || window.innerWidth;
      setIsMobile(width <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Don't remove preload link - let browser handle caching
      // Removing it cancels the video download, hurting LCP
    };
  }, []);

  // Video loading and engagement tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let totalWatchTime = 0;
    let lastTimeUpdate = 0;
    let isPlaying = false;

    const handleCanPlay = () => {
      // Video has enough data to start playing
      setVideoReady(true);
      setMainVideoLoaded(true); // Mark main video as loaded - case studies can now load
      // Try to play immediately on mobile
      if (isMobile) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented, but video is ready
          });
        }
      }
    };

    const handleLoadedData = () => {
      // Video data is loaded, try to play
      setVideoReady(true);
      setMainVideoLoaded(true); // Mark main video as loaded - case studies can now load
      if (isMobile) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented
          });
        }
      }
    };

    const handleTimeUpdate = () => {
      if (isPlaying && video.currentTime > lastTimeUpdate) {
        totalWatchTime += video.currentTime - lastTimeUpdate;
        lastTimeUpdate = video.currentTime;
      }
    };

    const handlePlay = () => {
      isPlaying = true;
      lastTimeUpdate = video.currentTime;
    };

    const handlePause = () => {
      isPlaying = false;
    };

    const handleEnded = () => {
      // Track total watch time when video ends or loops
      if (window.dataLayer && totalWatchTime > 0) {
        window.dataLayer.push({
          event: 'video_watch_time',
          video_name: isMobile ? 'welcome_mobile' : 'welcome_desktop',
          total_watch_time: Math.round(totalWatchTime),
          video_duration: Math.round(video.duration),
          watch_percentage: Math.round((totalWatchTime / video.duration) * 100)
        });
      }
      // Reset for next loop
      totalWatchTime = 0;
      lastTimeUpdate = 0;
    };

    // Add loading event listeners for faster playback
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Check if video is already ready
    if (video.readyState >= 3) {
      setVideoReady(true);
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isMobile]);

  return (
    <div className='main'>
      <div className='overlay' onClick={() => setIsReelOpen(true)} style={{ cursor: 'pointer', pointerEvents: 'auto' }} />
      {/* Render appropriate video based on screen size */}
      <video
        ref={videoRef}
        src={isMobile ? videoBgMobile : videoBg}
        key={isMobile ? 'mobile' : 'desktop'} // Force re-render when source changes
        autoPlay
        loop
        muted
        playsInline
        poster={posterImage}
        // Use auto preload for immediate playback (both mobile and desktop)
        preload="auto"
        // Add fetchpriority for faster loading (lowercase for React DOM compatibility)
        fetchpriority="high"
        // Disable picture-in-picture for better performance
        disablePictureInPicture
      />
      <div className='cinestoke' onClick={() => setIsReelOpen(true)} style={{ cursor: 'pointer' }}>
        <h1>C I N E S T O K E</h1>
      </div>
      <div className="main-video-bottom-fade" />

      <Bars onOpenReel={() => setIsReelOpen(true)} onScrollToStudies={() => clientsRef.current?.scrollSectionToTop()} onToggleLightMode={onToggleLightMode} />
      <Pics />
      <Clients ref={clientsRef} initialClient={initialClient} onClientChange={handleClientWillChange} onClientReselect={handleClientReselect} />
      {/* Only render CaseStudy after main video has loaded to avoid competing for bandwidth */}
      {/* CaseStudy now uses unified continuous carousel - all slides in sequence */}
      {/* onClientChange syncs the logo carousel when user scrolls through slides */}
      {mainVideoLoaded && (
        <CaseStudy
          ref={caseStudyRef}
          initialClient={initialClient}
          activeClient={activeClient}
          isFading={isCaseStudyFading}
          onFadeComplete={handleFadeComplete}
          isMobile={isMobile}
          onColorTitleClick={() => navigate('/shop', { state: { openGrades: true } })}
          onClientChange={(clientKey) => {
            // Update active client state (from CaseStudy scroll - no fade needed)
            setActiveClient(clientKey);
            // Sync Clients logo carousel to show the new client
            // BUT only if not currently fading (prevents feedback loop when user initiated from Clients)
            if (clientsRef.current?.scrollToClient && !isCaseStudyFading) {
              clientsRef.current.scrollToClient(clientKey);
            }
          }}
        />
      )}
      <Social />

      {isReelOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsReelOpen(false)}
        >
          <div
            style={{ position: 'relative', width: '90vw', maxWidth: '960px', aspectRatio: '16/9' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsReelOpen(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '2rem',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '4px 8px'
              }}
              aria-label="Close reel"
            >
              ×
            </button>
            <iframe
              src="https://www.youtube.com/embed/oyrgLEsmGIo?autoplay=1&rel=0"
              title="Cinestoke Reel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Main;
