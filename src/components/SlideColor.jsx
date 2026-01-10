import React, { useState, useRef, useEffect } from 'react';

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
  const [sliderPosition, setSliderPosition] = useState(50); // Percentage from left
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const colorVideoRef = useRef(null);
  const rawVideoRef = useRef(null);

  // Use mobile videos if available and on mobile
  const colorSrc = (isMobile && videoColorMobile) ? videoColorMobile : videoColor;
  const rawSrc = (isMobile && videoRawMobile) ? videoRawMobile : videoRaw;
  // Only load after sizing is complete
  const activeColorSrc = videosCanLoad ? colorSrc : undefined;
  const activeRawSrc = videosCanLoad ? rawSrc : undefined;

  // Sync video playback times
  useEffect(() => {
    const colorVideo = colorVideoRef.current;
    const rawVideo = rawVideoRef.current;
    if (!colorVideo || !rawVideo) return;

    // Sync raw video to color video's time
    const syncVideos = () => {
      if (Math.abs(colorVideo.currentTime - rawVideo.currentTime) > 0.05) {
        rawVideo.currentTime = colorVideo.currentTime;
      }
    };

    // Sync on initial load
    const handleCanPlay = () => {
      rawVideo.currentTime = colorVideo.currentTime;
      colorVideo.play().catch(() => {});
      rawVideo.play().catch(() => {});
    };

    // Sync when color video seeks or loops
    const handleSeeked = () => {
      rawVideo.currentTime = colorVideo.currentTime;
    };

    const handlePlay = () => rawVideo.play().catch(() => {});
    const handlePause = () => rawVideo.pause();

    colorVideo.addEventListener('timeupdate', syncVideos);
    colorVideo.addEventListener('canplay', handleCanPlay);
    colorVideo.addEventListener('seeked', handleSeeked);
    colorVideo.addEventListener('play', handlePlay);
    colorVideo.addEventListener('pause', handlePause);

    return () => {
      colorVideo.removeEventListener('timeupdate', syncVideos);
      colorVideo.removeEventListener('canplay', handleCanPlay);
      colorVideo.removeEventListener('seeked', handleSeeked);
      colorVideo.removeEventListener('play', handlePlay);
      colorVideo.removeEventListener('pause', handlePause);
    };
  }, []);

  const updateSliderPosition = (clientX) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
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
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

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
          className="slide-color-overlay"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
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
          className="slide-color-slider"
          style={{ left: `${sliderPosition}%` }}
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
          className="slide-color-handle"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="slide-color-handle-line" />
          <div className="slide-color-handle-circle" />
        </div>
      </div>
    </div>
  );
};

export default SlideColor;
