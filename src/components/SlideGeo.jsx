import React, { useState, useEffect } from 'react';

const SlideGeo = ({ location, video, videoMobile, preload = 'auto' }) => {
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
    <div className="slide-geo">
      <h2 className="case-study-title">
        {location}
      </h2>
      <div className="case-study-video-container">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload={preload}
          className="case-study-video"
          key={videoSrc} // Force re-render when video source changes
        />
      </div>
    </div>
  );
};

export default SlideGeo;

