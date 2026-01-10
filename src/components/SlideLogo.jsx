import React from 'react';

const SlideLogo = ({ title, video, videoMobile, preload = 'auto', isMobile = false, videosCanLoad = true }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;
  // Only load after sizing is complete
  const activeSrc = videosCanLoad ? videoSrc : undefined;

  return (
    <div className="slide-logo">
      <div className="slide-logo-video-container">
        <video
          src={activeSrc}
          autoPlay
          loop
          muted
          playsInline
          preload={preload}
          className="slide-logo-video"
          key={videoSrc}
        />
        <div className="slide-logo-fade-overlay"></div>
      </div>
    </div>
  );
};

export default SlideLogo;

