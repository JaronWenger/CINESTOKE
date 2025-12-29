import React, { useState, useEffect } from 'react';

const SlideLogo = ({ title, video, videoMobile, preload = 'auto' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [videoSrc, setVideoSrc] = useState(video);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Use mobile video if available and on mobile, otherwise use regular video
      setVideoSrc(mobile && videoMobile ? videoMobile : video);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [video, videoMobile]);

  return (
    <div className="slide-logo">
      <div className="slide-logo-video-container">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload={preload}
          className="slide-logo-video"
          key={videoSrc} // Force re-render when video source changes
        />
        <div className="slide-logo-fade-overlay"></div>
      </div>
    </div>
  );
};

export default SlideLogo;

