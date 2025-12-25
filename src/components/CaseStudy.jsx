import React, { useRef, useState, useEffect } from 'react';
import SlideOne from './SlideOne';
import SlideGeo from './SlideGeo';

const CaseStudy = () => {
  const scrollContainerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const totalSlides = 2;

  // Handle scroll to detect current slide
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);
    setCurrentSlide(slideIndex);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mark scrolling as stopped after a delay
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      scrollLeft: container.scrollLeft
    };

    e.preventDefault();
    if (container) {
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
    setIsDragging(false);

    // Snap to nearest slide
    snapToSlide();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      snapToSlide();
    }, 150);
  };

  // Snap to nearest slide
  const snapToSlide = () => {
    const container = scrollContainerRef.current;
    if (!container || isScrollingRef.current) return;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);
    const targetScroll = slideIndex * clientWidth;

    container.style.scrollBehavior = 'smooth';
    container.scrollLeft = targetScroll;
    setCurrentSlide(slideIndex);
  };

  // Navigate to specific slide
  const goToSlide = (slideIndex) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { clientWidth } = container;
    const targetScroll = slideIndex * clientWidth;

    container.style.scrollBehavior = 'smooth';
    container.scrollLeft = targetScroll;
    setCurrentSlide(slideIndex);
  };

  // Global mouse event listeners for drag functionality
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const newScrollLeft = dragStartRef.current.scrollLeft - deltaX;

      container.style.scrollBehavior = 'auto';
      container.scrollLeft = newScrollLeft;
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="cinestoke-section case-study-section">
      <div
        ref={scrollContainerRef}
        className="case-study-carousel"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="case-study-slide-wrapper">
          <SlideOne />
        </div>
        <div className="case-study-slide-wrapper">
          <SlideGeo />
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="case-study-nav-dots">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            className={`case-study-dot-wrapper`}
            onClick={() => goToSlide(index)}
          >
            <div
              className={`case-study-dot ${index === currentSlide ? 'active' : ''}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudy;

