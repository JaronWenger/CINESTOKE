import React from 'react';

const SlideGeo = ({ location, video, videoMobile, preload = 'auto', isMobile = false, videosCanLoad = true }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;
  // Only load after sizing is complete
  const activeSrc = videosCanLoad ? videoSrc : undefined;

  return (
    <div className="slide-geo">
      <h2 className="case-study-title">
        {location}
      </h2>
      <div className="case-study-video-container">
        <video
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

