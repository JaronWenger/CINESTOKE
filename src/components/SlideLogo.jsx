import React from 'react';

const SlideLogo = ({ title, video, videoMobile, preload = 'auto', isMobile = false }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;

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

