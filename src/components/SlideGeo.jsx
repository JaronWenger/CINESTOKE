import React from 'react';

const SlideGeo = ({ location, video, videoMobile, preload = 'auto', isMobile = false }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;

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

