import React, { useState, useEffect, useRef } from 'react'
import videoBg from '../assets/Welcome.mp4'
import videoBgMobile from '../assets/Welcomephone.mp4'
import Bars from './Bars'

import ClientsV2 from './ClientsV2';
import Pics from './Pics';
import CaseStudy from './CaseStudy';
import Social from './Social';


const Main = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check screen width on initial load
    if (window.innerWidth <= 768) {  // You can adjust this breakpoint as needed
      setIsMobile(true);
    }

    // Optional: Add event listener to check on window resize
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Video engagement tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let totalWatchTime = 0;
    let lastTimeUpdate = 0;
    let isPlaying = false;

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

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
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
        autoPlay
        loop
        muted
        playsInline
      />
      <div className='cinestoke'>
        <h1>C I N E S T O K E</h1>
      </div>

      <Bars />
      <Pics />
      <ClientsV2 />
      <CaseStudy />
      <Social />
    </div>
  )
}

export default Main;
