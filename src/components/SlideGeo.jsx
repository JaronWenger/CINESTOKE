import React from 'react';

const SlideGeo = ({ location, video }) => {
  return (
    <div className="slide-geo">
      <h2 className="case-study-title">
        {location}
      </h2>
      <div className="case-study-video-container">
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="case-study-video"
        />
      </div>
    </div>
  );
};

export default SlideGeo;

