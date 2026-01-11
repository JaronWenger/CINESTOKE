import React, { useState, useRef, useEffect, useCallback } from 'react';

const SlideColor = ({
  title = 'Glass Power Grade',
  videoColor,
  videoRaw,
  videoColorMobile,
  videoRawMobile,
  preload = 'auto',
  isMobile = false,
  videosCanLoad = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const colorVideoRef = useRef(null);
  const rawVideoRef = useRef(null);
  const sliderRef = useRef(null);
  const overlayRef = useRef(null);
  const handleRef = useRef(null);
  const sliderPositionRef = useRef(50); // Track position without re-renders

  // Use mobile videos if available and on mobile
  const colorSrc = (isMobile && videoColorMobile) ? videoColorMobile : videoColor;
  const rawSrc = (isMobile && videoRawMobile) ? videoRawMobile : videoRaw;
  // Only load after sizing is complete
  const activeColorSrc = videosCanLoad ? colorSrc : undefined;
  const activeRawSrc = videosCanLoad ? rawSrc : undefined;

  // Attempt to play a video - handles autoplay blocking gracefully
  const attemptPlay = useCallback((video) => {
    if (!video) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay was blocked - will play on user interaction
      });
    }
  }, []);

  // Ensure videos are playing when user interacts
  const ensureVideosPlaying = useCallback(() => {
    attemptPlay(colorVideoRef.current);
    attemptPlay(rawVideoRef.current);
  }, [attemptPlay]);

  // Simple video sync: play together, reset together on loop
  useEffect(() => {
    const colorVideo = colorVideoRef.current;
    const rawVideo = rawVideoRef.current;
    if (!colorVideo || !rawVideo) return;

    let hasStarted = false;

    // Start both videos together once both are ready
    const startBothVideos = () => {
      if (hasStarted) return;
      // readyState >= 2 means metadata loaded, >= 3 means can play
      if (colorVideo.readyState >= 2 && rawVideo.readyState >= 2) {
        hasStarted = true;
        colorVideo.currentTime = 0;
        rawVideo.currentTime = 0;
        attemptPlay(colorVideo);
        attemptPlay(rawVideo);
      }
    };

    // When colorVideo ends, reset both to start (manual loop)
    const handleEnded = () => {
      colorVideo.currentTime = 0;
      rawVideo.currentTime = 0;
      attemptPlay(colorVideo);
      attemptPlay(rawVideo);
    };

    // Multiple events to catch when videos are ready
    const handleReady = () => startBothVideos();

    // Listen to multiple events for reliability
    colorVideo.addEventListener('canplaythrough', handleReady);
    colorVideo.addEventListener('loadeddata', handleReady);
    colorVideo.addEventListener('canplay', handleReady);
    rawVideo.addEventListener('canplaythrough', handleReady);
    rawVideo.addEventListener('loadeddata', handleReady);
    rawVideo.addEventListener('canplay', handleReady);
    colorVideo.addEventListener('ended', handleEnded);

    // Try immediately if already ready (handles cached videos)
    startBothVideos();

    // Also try after a short delay in case events already fired
    const checkTimeout = setTimeout(startBothVideos, 100);

    return () => {
      clearTimeout(checkTimeout);
      colorVideo.removeEventListener('canplaythrough', handleReady);
      colorVideo.removeEventListener('loadeddata', handleReady);
      colorVideo.removeEventListener('canplay', handleReady);
      rawVideo.removeEventListener('canplaythrough', handleReady);
      rawVideo.removeEventListener('loadeddata', handleReady);
      rawVideo.removeEventListener('canplay', handleReady);
      colorVideo.removeEventListener('ended', handleEnded);
    };
  }, [attemptPlay]);

  // Direct DOM update for slider position - avoids React re-renders for 60fps smoothness
  const updateSliderPosition = useCallback((clientX) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    // Update ref (no re-render)
    sliderPositionRef.current = percentage;

    // Direct DOM manipulation for smooth 60fps updates
    if (sliderRef.current) {
      sliderRef.current.style.left = `${percentage}%`;
    }
    if (overlayRef.current) {
      overlayRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `${percentage}%`;
    }
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
    // Ensure videos are playing on user interaction (fixes autoplay blocking)
    ensureVideosPlaying();
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
    // Ensure videos are playing on user interaction (fixes autoplay blocking)
    ensureVideosPlaying();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      updateSliderPosition(e.clientX);
    };

    const handleTouchMove = (e) => {
      updateSliderPosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateSliderPosition]);

  return (
    <div className="slide-color">
      <h2 className="case-study-title">{title}</h2>

      <div
        ref={containerRef}
        className="slide-color-container"
      >
        {/* Raw video (bottom layer - always full width) - no loop, synced with color */}
        <video
          ref={rawVideoRef}
          src={activeRawSrc}
          autoPlay
          muted
          playsInline
          preload={preload}
          className="slide-color-video slide-color-video-raw"
          key={`raw-${rawSrc}`}
        />

        {/* Color video (top layer - clipped) - no loop, we handle it manually */}
        <div
          ref={overlayRef}
          className="slide-color-overlay"
          style={{ clipPath: `inset(0 ${100 - sliderPositionRef.current}% 0 0)` }}
        >
          <video
            ref={colorVideoRef}
            src={activeColorSrc}
            autoPlay
            muted
            playsInline
            preload={preload}
            className="slide-color-video slide-color-video-color"
            key={`color-${colorSrc}`}
          />
        </div>

        {/* Slider line - with hit area for dragging */}
        <div
          ref={sliderRef}
          className="slide-color-slider"
          style={{ left: `${sliderPositionRef.current}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="slide-color-slider-hitarea" />
          <div className="slide-color-line" />
        </div>
      </div>

      {/* Handle below videos */}
      <div className="slide-color-handle-container">
        <div
          ref={handleRef}
          className="slide-color-handle"
          style={{ left: `${sliderPositionRef.current}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="slide-color-handle-hitarea" />
          <div className="slide-color-handle-line" />
          <div className="slide-color-handle-circle" />
        </div>
      </div>
    </div>
  );
};

export default SlideColor;
