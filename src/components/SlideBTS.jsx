import React from 'react';

const SlideBTS = ({ video, videoMobile, preload = 'auto', isMobile = false }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;

  return (
    <div className="slide-bts">
      <div className="case-study-video-container">
        <video
          src={videoSrc}
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

export default SlideBTS;
