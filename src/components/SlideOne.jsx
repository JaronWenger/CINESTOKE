import React from 'react';
import smallWorldVideo from '../assets/CASESTUDIES/SmallWorldMain.mp4';
import swaLogo from '../assets/CASESTUDIES/Brands/SWApp.webp';

const SlideOne = () => {
  return (
    <div className="slide-one">
      <div className="slide-one-header">
        <div className="slide-one-profile-section">
          <a 
            href="https://smallworldadventures.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGngnNyxych8dOXUxRyE5LNnjom0WXlb07xOD9eNFb_sys2avnKCtiekB3Mtfw_aem_4vRTq4qC57QgWfcev-Aiow"
            target="_blank"
            rel="noopener noreferrer"
            className="swa-logo-link"
          >
            <img src={swaLogo} alt="Small World Adventures Logo" className="swa-logo" />
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
        </div>
        <div className="slide-one-header-text">
          <h2 className="case-study-title">Small World Adventures</h2>
          <p className="case-study-description">
          Join us for 7 days of paddling in a tropical paradise-it'll be the kayaking trip of a lifetime! We wrote the book on kayaking in Ecuador (literally).
          </p>
        </div>
      </div>
      <div className="case-study-video-container">
        <video
          src={smallWorldVideo}
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

export default SlideOne;

