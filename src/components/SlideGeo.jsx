import React from 'react';
import geographicVideo from '../assets/CASESTUDIES/Geographic.mp4';

const SlideGeo = () => {
  return (
    <div className="slide-geo">
      <h2 className="case-study-title">
        📍 Borja, Napo, Ecuador
      </h2>
      <div className="case-study-video-container">
        <video
          src={geographicVideo}
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

