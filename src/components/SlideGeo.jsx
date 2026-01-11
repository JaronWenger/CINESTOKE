import React, { useRef } from 'react';
import { useVideoErrorHandling } from '../hooks/useVideoErrorHandling';

const SlideGeo = ({ location, video, videoMobile, preload = 'auto', isMobile = false, videosCanLoad = true }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;
  // Only load after sizing is complete
  const activeSrc = videosCanLoad ? videoSrc : undefined;
  const videoRef = useRef(null);

  // Add stuck video detection (mobile only)
  useVideoErrorHandling(videoRef, activeSrc, isMobile);

  return (
    <div className="slide-geo">
      <h2 className="case-study-title">
        {location}
      </h2>
      <div className="case-study-video-container">
        <video
          ref={videoRef}
          src={activeSrc}
          autoPlay
          loop
          muted
          playsInline
          preload={preload}
          className="case-study-video"
          key={videoSrc}
        />
      </div>
    </div>
  );
};

export default SlideGeo;

