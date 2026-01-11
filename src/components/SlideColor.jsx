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

  // Video sync and playback management
  useEffect(() => {
    const colorVideo = colorVideoRef.current;
    const rawVideo = rawVideoRef.current;
    if (!colorVideo || !rawVideo) return;

    // Sync raw video to color video's time AND playback state
    const syncVideos = () => {
      if (!colorVideo || !rawVideo) return;
      // Only sync if drift is noticeable (100ms threshold for better performance)
      if (Math.abs(colorVideo.currentTime - rawVideo.currentTime) > 0.1) {
        rawVideo.currentTime = colorVideo.currentTime;
      }
      // Ensure rawVideo is playing if colorVideo is playing (fixes mobile pause)
      if (!colorVideo.paused && rawVideo.paused) {
        attemptPlay(rawVideo);
      }
    };

    // Handle colorVideo initial load
    const handleCanPlayThrough = () => {
      rawVideo.currentTime = colorVideo.currentTime;
      attemptPlay(colorVideo);
      attemptPlay(rawVideo);
    };

    // Handle rawVideo ready - sync and play
    const handleRawCanPlayThrough = () => {
      rawVideo.currentTime = colorVideo.currentTime;
      if (!colorVideo.paused) {
        attemptPlay(rawVideo);
      }
    };

    // Handle rawVideo pausing independently (mobile power saving, etc.)
    const handleRawPause = () => {
      // Restart raw if color is still playing
      if (!colorVideo.paused) {
        attemptPlay(rawVideo);
      }
    };

    // Sync when color video seeks or loops
    const handleSeeked = () => {
      rawVideo.currentTime = colorVideo.currentTime;
    };

    const handlePlay = () => attemptPlay(rawVideo);
    const handlePause = () => rawVideo.pause();

    // Use setInterval for sync instead of timeupdate (less frequent, better perf)
    const syncInterval = setInterval(syncVideos, 250);

    // ColorVideo listeners
    colorVideo.addEventListener('canplaythrough', handleCanPlayThrough);
    colorVideo.addEventListener('seeked', handleSeeked);
    colorVideo.addEventListener('play', handlePlay);
    colorVideo.addEventListener('pause', handlePause);

    // RawVideo listeners - detect independent pauses/stalls
    rawVideo.addEventListener('canplaythrough', handleRawCanPlayThrough);
    rawVideo.addEventListener('pause', handleRawPause);

    // Try to play immediately if videos are already ready
    if (colorVideo.readyState >= 3) {
      attemptPlay(colorVideo);
    }
    if (rawVideo.readyState >= 3) {
      attemptPlay(rawVideo);
    }

    return () => {
      clearInterval(syncInterval);
      colorVideo.removeEventListener('canplaythrough', handleCanPlayThrough);
      colorVideo.removeEventListener('seeked', handleSeeked);
      colorVideo.removeEventListener('play', handlePlay);
      colorVideo.removeEventListener('pause', handlePause);
      rawVideo.removeEventListener('canplaythrough', handleRawCanPlayThrough);
      rawVideo.removeEventListener('pause', handleRawPause);
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
        {/* Raw video (bottom layer - always full width) */}
        <video
          ref={rawVideoRef}
          src={activeRawSrc}
          autoPlay
          loop
          muted
          playsInline
          preload={preload}
          className="slide-color-video slide-color-video-raw"
          key={`raw-${rawSrc}`}
        />

        {/* Color video (top layer - clipped) */}
        <div
          ref={overlayRef}
          className="slide-color-overlay"
          style={{ clipPath: `inset(0 ${100 - sliderPositionRef.current}% 0 0)` }}
        >
          <video
            ref={colorVideoRef}
            src={activeColorSrc}
            autoPlay
            loop
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
