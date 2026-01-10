import React from 'react';

const SlideBTS = ({ video, videoMobile, preload = 'auto', isMobile = false, videosCanLoad = true, caption = 'Behind the Scenes 📸' }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;
  // Only load after sizing is complete
  const activeSrc = videosCanLoad ? videoSrc : undefined;

  return (
    <div className="slide-bts">
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
      <h2 className="slide-bts-caption">
        {caption}
      </h2>
    </div>
  );
};

export default SlideBTS;
