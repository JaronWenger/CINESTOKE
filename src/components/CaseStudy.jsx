import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { getAllSlidesFlattened, getClientStartIndex } from '../config/caseStudyConfig';

/**
 * CaseStudy - Unified Continuous Carousel
 *
 * All slides from all clients are rendered in one continuous sequence.
 * Native scroll-snap handles ALL transitions - no special handling needed.
 * Infinite scroll with buffer slides on both ends for seamless looping.
 */
const CaseStudy = ({ activeClient, onClientChange }) => {
  const scrollContainerRef = useRef(null);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false); // Prevent onClientChange during programmatic scroll
  const slideOneHeightRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const DRAG_THRESHOLD = 50;

  // Get all slides flattened into one array
  const allSlides = getAllSlidesFlattened();
  const totalSlides = allSlides.length;

  // For infinite scroll, we create buffer copies on both ends
  // Buffer size = total slides (one full copy on each end)
  const BUFFER_SIZE = totalSlides;

  // Create the infinite array: [buffer] [original] [buffer]
  // This allows seamless wrapping in both directions
  const infiniteSlides = [
    ...allSlides.map((s, i) => ({ ...s, bufferIndex: i - BUFFER_SIZE, isBuffer: 'start' })),
    ...allSlides.map((s, i) => ({ ...s, bufferIndex: i, isBuffer: false })),
    ...allSlides.map((s, i) => ({ ...s, bufferIndex: i + BUFFER_SIZE, isBuffer: 'end' })),
  ];

  // The "real" slides start at index BUFFER_SIZE
  const realStartIndex = BUFFER_SIZE;

  // Get current slide's client info
  const getCurrentClientInfo = useCallback((globalIndex) => {
    // Normalize index to be within original slides
    const normalizedIndex = ((globalIndex % totalSlides) + totalSlides) % totalSlides;
    return allSlides[normalizedIndex];
  }, [allSlides, totalSlides]);

  // Handle scroll to detect current slide and sync client
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isProgrammaticScrollRef.current) return;

    isScrollingRef.current = true;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);

    // Convert to real index (accounting for buffer)
    const realIndex = slideIndex - realStartIndex;
    const normalizedIndex = ((realIndex % totalSlides) + totalSlides) % totalSlides;

    setCurrentGlobalIndex(normalizedIndex);

    // Get client info for current slide
    const slideInfo = allSlides[normalizedIndex];
    if (slideInfo && onClientChange && slideInfo.clientKey !== activeClient) {
      onClientChange(slideInfo.clientKey);
    }

    // Update nav dots
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Check for infinite scroll wrap
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      checkAndWrapScroll();
    }, 150);
  }, [allSlides, totalSlides, realStartIndex, activeClient, onClientChange]);

  // Wrap scroll position when reaching buffer zones
  const checkAndWrapScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);

    // If in start buffer, jump to corresponding position in real section
    if (slideIndex < realStartIndex) {
      const offset = realStartIndex - slideIndex;
      const newIndex = realStartIndex + totalSlides - offset;
      isProgrammaticScrollRef.current = true;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = newIndex * clientWidth;
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
        container.style.scrollBehavior = 'smooth';
      });
    }
    // If in end buffer, jump to corresponding position in real section
    else if (slideIndex >= realStartIndex + totalSlides) {
      const offset = slideIndex - (realStartIndex + totalSlides);
      const newIndex = realStartIndex + offset;
      isProgrammaticScrollRef.current = true;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = newIndex * clientWidth;
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
        container.style.scrollBehavior = 'smooth';
      });
    }
  }, [realStartIndex, totalSlides]);

  // Update nav dots to show position within current client
  const updateNavDots = (slideIndex, totalClientSlides) => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;

    const navDotsOutside = carousel.parentElement?.querySelector('.case-study-nav-dots-outside');
    if (!navDotsOutside) return;

    // Update dot count if needed
    const dots = navDotsOutside.querySelectorAll('.case-study-dot-wrapper');
    if (dots.length !== totalClientSlides) {
      // Recreate dots
      navDotsOutside.innerHTML = '';
      for (let i = 0; i < totalClientSlides; i++) {
        const dotWrapper = document.createElement('div');
        dotWrapper.className = 'case-study-dot-wrapper';
        const dot = document.createElement('div');
        dot.className = `case-study-dot ${i === slideIndex && totalClientSlides > 1 ? 'active' : ''}`;
        dotWrapper.appendChild(dot);
        navDotsOutside.appendChild(dotWrapper);
      }
    } else {
      // Update active state
      dots.forEach((wrapper, index) => {
        const dot = wrapper.querySelector('.case-study-dot');
        if (dot) {
          if (index === slideIndex && totalClientSlides > 1) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        }
      });
    }
  };

  // Navigate to specific client's first slide (called when logo is clicked)
  const scrollToClient = useCallback((clientKey) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const clientStartIndex = getClientStartIndex(clientKey);
    if (clientStartIndex === -1) return;

    // Scroll to the client's position in the real section
    const targetIndex = realStartIndex + clientStartIndex;
    const { clientWidth } = container;

    isProgrammaticScrollRef.current = true;
    container.style.scrollBehavior = 'smooth';
    container.scrollLeft = targetIndex * clientWidth;

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);

    // Update state
    setCurrentGlobalIndex(clientStartIndex);
    const slideInfo = allSlides[clientStartIndex];
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);
  }, [allSlides, realStartIndex]);

  // When activeClient changes from external source (logo click), scroll to that client
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const currentSlideInfo = getCurrentClientInfo(currentGlobalIndex);
    if (currentSlideInfo?.clientKey !== activeClient) {
      scrollToClient(activeClient);
    }
  }, [activeClient]);

  // Initial scroll to SWA (or activeClient) on mount
  useLayoutEffect(() => {
    if (hasInitializedRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Find SWA's starting position
    const swaStartIndex = getClientStartIndex('SWA');
    const targetIndex = swaStartIndex !== -1 ? swaStartIndex : 0;
    const absoluteIndex = realStartIndex + targetIndex;

    // Scroll to position immediately (no animation)
    container.style.scrollBehavior = 'auto';
    container.scrollLeft = absoluteIndex * container.clientWidth;

    setCurrentGlobalIndex(targetIndex);
    hasInitializedRef.current = true;

    // Update nav dots
    const slideInfo = allSlides[targetIndex];
    requestAnimationFrame(() => {
      updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);
      container.style.scrollBehavior = 'smooth';
    });
  }, [allSlides, realStartIndex]);

  // Create nav dots container on mount
  useEffect(() => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;

    const parentElement = carousel.parentElement;
    if (!parentElement) return;

    // Check if nav dots already exist
    let navDotsOutside = parentElement.querySelector('.case-study-nav-dots-outside');
    if (!navDotsOutside) {
      navDotsOutside = document.createElement('div');
      navDotsOutside.className = 'case-study-nav-dots case-study-nav-dots-outside';
      parentElement.appendChild(navDotsOutside);
    }

    // Initialize with current client's dots
    const slideInfo = allSlides[currentGlobalIndex];
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);
  }, []);

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
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const container = scrollContainerRef.current;
    if (!container) {
      setIsDragging(false);
      return;
    }

    container.style.cursor = 'grab';
    container.style.userSelect = '';

    const dragDistance = dragDistanceRef.current; // Keep sign for direction
    const absDragDistance = Math.abs(dragDistance);
    const { scrollLeft, clientWidth } = container;

    // Calculate current slide position
    const currentSlideIndex = Math.round(dragStartRef.current.scrollLeft / clientWidth);

    let targetSlideIndex;

    if (absDragDistance > DRAG_THRESHOLD) {
      // Determine direction and go to next/previous slide
      if (dragDistance > 0) {
        // Dragged right = go to previous slide
        targetSlideIndex = currentSlideIndex - 1;
      } else {
        // Dragged left = go to next slide
        targetSlideIndex = currentSlideIndex + 1;
      }
    } else {
      // Small drag, snap back to current slide
      targetSlideIndex = currentSlideIndex;
    }

    // Animate smoothly to target slide
    const targetScroll = targetSlideIndex * clientWidth;
    container.style.scrollBehavior = 'smooth';
    container.scrollLeft = targetScroll;

    setIsDragging(false);
    dragDistanceRef.current = 0;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
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
  };

  // Global mouse event listeners for drag functionality
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      dragDistanceRef.current = deltaX;

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

  // Height synchronization - find and measure SlideOne (SWA) for consistent heights
  useEffect(() => {
    const syncHeights = () => {
      const carousel = scrollContainerRef.current;
      if (!carousel || slideOneHeightRef.current) return;

      // Find SlideOne element
      const slideOne = carousel.querySelector('.slide-one');
      if (!slideOne) return;

      // Wait for video to be ready
      const video = slideOne.querySelector('video');
      if (video && video.readyState < 2) {
        video.addEventListener('loadeddata', syncHeights, { once: true });
        return;
      }

      // Measure height
      slideOne.style.height = 'auto';
      void slideOne.offsetHeight;
      const height = slideOne.scrollHeight;

      if (height > 100) {
        slideOneHeightRef.current = height;

        // Apply to all slides
        const allSlideWrappers = carousel.querySelectorAll('.case-study-slide-wrapper');
        allSlideWrappers.forEach((wrapper) => {
          wrapper.style.height = `${height}px`;
          wrapper.style.minHeight = '0';
          wrapper.style.maxHeight = `${height}px`;
        });

        carousel.style.height = `${height}px`;
        carousel.style.minHeight = '0';
        carousel.style.maxHeight = `${height}px`;
      }
    };

    // Try to sync after initial render
    const timeoutId = setTimeout(syncHeights, 200);

    return () => clearTimeout(timeoutId);
  }, []);

  // Don't render if no slides
  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className="cinestoke-section case-study-section">
      <div
        ref={scrollContainerRef}
        className="case-study-carousel"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
      >
        {infiniteSlides.map((slideData, index) => {
          const SlideComponent = slideData.slide.component;
          const isRealSlide = slideData.isBuffer === false;

          // Only preload current and adjacent slides
          const distanceFromCurrent = Math.abs(index - (realStartIndex + currentGlobalIndex));
          const preloadValue = distanceFromCurrent <= 1 ? 'metadata' : 'none';

          return (
            <div
              key={`${slideData.isBuffer}-${index}`}
              className="case-study-slide-wrapper"
              data-client={slideData.clientKey}
              data-is-buffer={slideData.isBuffer}
            >
              <SlideComponent {...slideData.slide.props} preload={preloadValue} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseStudy;
