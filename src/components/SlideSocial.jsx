import React, { useRef, useEffect } from 'react';
import iphoneMockup from '../assets/CASESTUDIES/Social/iPhone.webp';

const SlideSocial = ({ link, video, videoMobile, preload = 'auto', isMobile = false, videosCanLoad = true }) => {
  // Use mobile video if available and on mobile, otherwise use regular video
  const videoSrc = (isMobile && videoMobile) ? videoMobile : video;
  // Only load after sizing is complete
  const activeSrc = videosCanLoad ? videoSrc : undefined;
  const dragStartRef = useRef({ x: 0, y: 0 });
  const wasDraggingRef = useRef(false);
  const linkRef = useRef(null);
  const DRAG_THRESHOLD = 10; // Pixels of movement to consider it a drag

  const handleMouseDown = (e) => {
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    wasDraggingRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!dragStartRef.current.x && !dragStartRef.current.y) return;
    
    const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
    const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
    
    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      wasDraggingRef.current = true;
    }
  };

  const handleMouseUp = () => {
    dragStartRef.current = { x: 0, y: 0 };
  };

  const handleClick = (e) => {
    // Prevent link navigation if it was a drag
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggingRef.current = false;
      return;
    }

    // Only allow click if it was on the video element
    if (e.target.tagName !== 'VIDEO') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Global mouse move listener for drag detection
  useEffect(() => {
    if (!link || !linkRef.current) return;

    const handleGlobalMouseMove = (e) => {
      if (!dragStartRef.current.x && !dragStartRef.current.y) return;
      
      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
      
      if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
        wasDraggingRef.current = true;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [link]);

  const content = (
    <div className="slide-social">
      <div className="slide-social-image-container">
        <div className="slide-social-video-wrapper">
          <video
            src={activeSrc}
            autoPlay
            loop
            muted
            playsInline
            preload={preload}
            className="slide-social-video"
            key={videoSrc}
          />
        </div>
        <img
          src={iphoneMockup}
          alt="iPhone Mockup"
          className="slide-social-iphone-frame"
          loading="lazy"
        />
      </div>
    </div>
  );

  // If link is provided, wrap in anchor tag with drag detection
  if (link) {
    return (
      <a
        ref={linkRef}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="slide-social-link"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return content;
};

export default SlideSocial;
