import React, { useRef, useState, useEffect } from 'react';
import SlideOne from './SlideOne';
import SlideGeo from './SlideGeo';

const CaseStudy = () => {
  const scrollContainerRef = useRef(null);
  const firstSlideRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const DRAG_THRESHOLD = 50; // Minimum pixels to trigger slide change

  const totalSlides = 2;

  // Handle scroll to detect current slide
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);
    setCurrentSlide(slideIndex);
    
    // Update nav dots outside if they exist
    updateNavDotsOutside(slideIndex);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mark scrolling as stopped after a delay
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };
  
  const updateNavDotsOutside = (activeIndex) => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;
    
    const navDotsOutside = carousel.parentElement?.querySelector('.case-study-nav-dots-outside');
    if (!navDotsOutside) return;
    
    const dots = navDotsOutside.querySelectorAll('.case-study-dot');
    dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
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
    dragDistanceRef.current = 0;

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
    
    const dragDistance = Math.abs(dragDistanceRef.current);
    
    // If drag distance exceeds threshold, navigate to next/previous slide
    if (dragDistance > DRAG_THRESHOLD) {
      if (dragDistanceRef.current > 0) {
        // Dragged right - go to previous slide
        const prevSlide = Math.max(0, currentSlide - 1);
        goToSlide(prevSlide);
      } else {
        // Dragged left - go to next slide
        const nextSlide = Math.min(totalSlides - 1, currentSlide + 1);
        goToSlide(nextSlide);
      }
    } else {
      // Small drag, snap to current slide
      snapToSlide();
    }
    
    setIsDragging(false);
    dragDistanceRef.current = 0;
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

  // Sync all slide heights to match SlideOne's rendered height
  // SlideOne gets its height from viewport-based CSS, then we apply that to all slides
  // After height is locked, move nav dots outside slide wrapper to stay consistent
  useEffect(() => {
    let timeoutId = null;
    let isSyncing = false;

    const syncSlideHeights = () => {
      if (!firstSlideRef.current || isSyncing) return;
      
      isSyncing = true;
      
      // Use requestAnimationFrame to avoid ResizeObserver loop issues
      requestAnimationFrame(() => {
        const firstSlide = firstSlideRef.current;
        if (!firstSlide) {
          isSyncing = false;
          return;
        }
        
        // Find the slide-one div inside the wrapper
        const slideOne = firstSlide.querySelector('.slide-one');
        if (!slideOne) {
          isSyncing = false;
          return;
        }
        
        // Ensure slide-one is using its natural height (auto) and no constraints
        slideOne.style.height = 'auto';
        slideOne.style.minHeight = '0';
        slideOne.style.maxHeight = 'none';
        
        // Force a reflow to ensure accurate measurement
        void slideOne.offsetHeight;
        
        // Get the actual content height using scrollHeight (most accurate for content)
        // scrollHeight gives the total height of content including padding
        const slideOneHeight = slideOne.scrollHeight;
        
        // Set the slide wrapper height to match slide-one's content height exactly
        firstSlide.style.height = `${slideOneHeight}px`;
        firstSlide.style.minHeight = '0';
        firstSlide.style.maxHeight = `${slideOneHeight}px`;
        
        // Keep slide-one at auto height so it uses its natural size (no overflow)
        slideOne.style.height = 'auto';
        
        // Ensure wrapper has absolutely no extra spacing
        firstSlide.style.padding = '0';
        firstSlide.style.margin = '0';
        firstSlide.style.border = 'none';
        
        // Set the carousel height to match the slide wrapper height
        const carousel = firstSlide.parentElement;
        if (carousel) {
          carousel.style.height = `${slideOneHeight}px`;
          carousel.style.minHeight = '0';
          carousel.style.maxHeight = `${slideOneHeight}px`;
          carousel.style.padding = '0';
          carousel.style.margin = '0';
        }
        
        // Apply the same height to all other slide wrappers
        const allSlides = firstSlide.parentElement?.querySelectorAll('.case-study-slide-wrapper');
        if (allSlides) {
          allSlides.forEach((slide) => {
            if (slide !== firstSlide) {
              slide.style.height = `${slideOneHeight}px`;
            }
            // Ensure all wrappers have no extra spacing
            slide.style.padding = '0';
            slide.style.margin = '0';
          });
        }
        
        // After height is locked, move nav dots outside slide wrapper
        moveNavDotsOutside(allSlides);
        
        isSyncing = false;
      });
    };

    const moveNavDotsOutside = (allSlides) => {
      const carousel = scrollContainerRef.current;
      if (!carousel) return;

      // Find the nav dots in the first slide
      const firstSlide = firstSlideRef.current;
      const navDotsInSlide = firstSlide?.querySelector('.case-study-nav-dots');
      
      if (!navDotsInSlide) return;

      // Check if nav dots are already outside (to avoid moving multiple times)
      const navDotsOutside = carousel.parentElement?.querySelector('.case-study-nav-dots-outside');
      if (navDotsOutside) {
        return; // Already moved
      }

      // Clone the nav dots structure
      const navDotsClone = navDotsInSlide.cloneNode(true);
      navDotsClone.className = 'case-study-nav-dots case-study-nav-dots-outside';
      
      // Add click handlers to cloned nav dots
      const dotWrappers = navDotsClone.querySelectorAll('.case-study-dot-wrapper');
      dotWrappers.forEach((wrapper, index) => {
        wrapper.addEventListener('click', () => {
          goToSlide(index);
        });
      });
      
      // Remove nav dots from all slides
      if (allSlides) {
        allSlides.forEach((slide) => {
          const dots = slide.querySelector('.case-study-nav-dots');
          if (dots) {
            dots.remove();
          }
        });
      }
      
      // Add nav dots outside the carousel
      carousel.parentElement?.appendChild(navDotsClone);
      
      // Update active state
      updateNavDotsOutside(currentSlide);
    };

    // Debounced resize handler
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(syncSlideHeights, 100);
    };

    // Wait for initial render, then sync
    const initialTimeoutId = setTimeout(() => {
      syncSlideHeights();
    }, 0);
    
    // Sync on window resize (viewport changes)
    window.addEventListener('resize', handleResize);
    
    // Watch for changes in slide-one div that might affect height
    const resizeObserver = new ResizeObserver((entries) => {
      // Suppress ResizeObserver loop errors
      if (entries.length > 0) {
        syncSlideHeights();
      }
    });
    
    // Wait a bit for slide-one to render, then observe it
    const observeTimeout = setTimeout(() => {
      if (firstSlideRef.current) {
        const slideOne = firstSlideRef.current.querySelector('.slide-one');
        if (slideOne) {
          resizeObserver.observe(slideOne);
        }
      }
    }, 100);

    // Suppress ResizeObserver loop error messages (known browser quirk)
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message.includes('ResizeObserver loop')) {
        return true; // Suppress the error
      }
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      clearTimeout(initialTimeoutId);
      clearTimeout(observeTimeout);
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      window.onerror = originalError;
    };
  }, []);

  // Global mouse event listeners for drag functionality
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      dragDistanceRef.current = deltaX;
      
      // Allow visual feedback during drag
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
  }, [isDragging, currentSlide]);

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
        <div ref={firstSlideRef} className="case-study-slide-wrapper">
          <SlideOne />
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
        <div className="case-study-slide-wrapper">
          <SlideGeo />
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
      </div>
    </div>
  );
};

export default CaseStudy;

