import React from 'react';

const SlideOne = ({ title, description, profilePic, video, logoUrl, preload = 'auto' }) => {
  return (
    <div className="slide-one">
      <div className="slide-one-header">
        <div className="slide-one-profile-section">
          {logoUrl ? (
            <a 
              href={logoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="swa-logo-link"
            >
              <img src={profilePic} alt={`${title} Logo`} className="swa-logo" />
              <div className="web-icon-overlay">
                <svg 
                  width="8" 
                  height="8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="web-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
            </a>
          ) : (
            <img src={profilePic} alt={`${title} Logo`} className="swa-logo" />
          )}
        </div>
        <div className="slide-one-header-text">
          <h2 className="case-study-title">{title}</h2>
          <p className="case-study-description">
            {description}
          </p>
        </div>
      </div>
      <div className="case-study-video-container">
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          preload={preload}
          className="case-study-video"
        />
      </div>
    </div>
  );
};

export default SlideOne;

