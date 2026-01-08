import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import videoBg from '../assets/Welcome.mp4'
import videoBgMobile from '../assets/Welcomephone.mp4'
import Bars from './Bars'

import ClientsV2 from './ClientsV2';
import Pics from './Pics';
import CaseStudy from './CaseStudy';
import Social from './Social';


const Main = () => {
  // Initialize isMobile correctly on first render to avoid loading wrong video
  // Use document.documentElement.clientWidth for more reliable mobile detection
  const getInitialMobile = () => {
    if (typeof window === 'undefined') return false;
    const width = document.documentElement.clientWidth || window.innerWidth;
    return width <= 768;
  };
  
  const [isMobile, setIsMobile] = useState(getInitialMobile());
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef(null);
  const [activeClient, setActiveClient] = useState('SWA'); // Track which client is centered, default to SWA
  const [videoReady, setVideoReady] = useState(false); // Track if video is ready to play
  const [mainVideoLoaded, setMainVideoLoaded] = useState(false); // Track if main video has loaded
  const [isCaseStudyFading, setIsCaseStudyFading] = useState(false); // Track fade state for CaseStudy
  const clientsV2Ref = useRef(null); // Ref to ClientsV2 component for brand shifting

  // Handle client change from ClientsV2 (user click or swipe) - triggers fade
  const handleClientWillChange = (clientKey) => {
    // Only trigger fade if actually changing to a different client
    if (clientKey !== activeClient) {
      setIsCaseStudyFading(true);
      setActiveClient(clientKey);
    }
  };

  // Handle fade completion from CaseStudy
  const handleFadeComplete = () => {
    setIsCaseStudyFading(false);
  };

  // Use useLayoutEffect to set mobile state synchronously before paint
  useLayoutEffect(() => {
    // Check screen width synchronously before render
    const width = document.documentElement.clientWidth || window.innerWidth;
    const isMobileDevice = width <= 768;
    setIsMobile(isMobileDevice);

    // Preload the appropriate video immediately for faster loading with high priority
    const videoToPreload = isMobileDevice ? videoBgMobile : videoBg;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = videoToPreload;
    link.type = 'video/mp4';
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
      // Clean up preload link
      const preloadLink = document.querySelector(`link[href="${videoToPreload}"]`);
      if (preloadLink) {
        preloadLink.remove();
      }
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
      <div className='overlay'></div>
      {/* Render appropriate video based on screen size */}
      <video
        ref={videoRef}
        src={isMobile ? videoBgMobile : videoBg}
        key={isMobile ? 'mobile' : 'desktop'} // Force re-render when source changes
        autoPlay
        loop
        muted
        playsInline
        // Use auto preload for immediate playback (both mobile and desktop)
        preload="auto"
        // Add fetchpriority for faster loading
        fetchPriority="high"
        // Disable picture-in-picture for better performance
        disablePictureInPicture
      />
      <div className='cinestoke'>
        <h1>C I N E S T O K E</h1>
      </div>

      <Bars />
      <Pics />
      <ClientsV2 ref={clientsV2Ref} onClientChange={handleClientWillChange} />
      {/* Only render CaseStudy after main video has loaded to avoid competing for bandwidth */}
      {/* CaseStudy now uses unified continuous carousel - all slides in sequence */}
      {/* onClientChange syncs the logo carousel when user scrolls through slides */}
      {mainVideoLoaded && (
        <CaseStudy
          activeClient={activeClient}
          isFading={isCaseStudyFading}
          onFadeComplete={handleFadeComplete}
          isMobile={isMobile}
          onClientChange={(clientKey) => {
            // Update active client state (from CaseStudy scroll - no fade needed)
            setActiveClient(clientKey);
            // Sync ClientsV2 logo carousel to show the new client
            // BUT only if not currently fading (prevents feedback loop when user initiated from ClientsV2)
            if (clientsV2Ref.current?.scrollToClient && !isCaseStudyFading) {
              clientsV2Ref.current.scrollToClient(clientKey);
            }
          }}
        />
      )}
      <Social />
    </div>
  )
}

export default Main;
