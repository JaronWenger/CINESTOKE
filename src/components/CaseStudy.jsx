import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { getAllSlidesFlattened, getClientStartIndex, getClientOrder } from '../config/caseStudyConfig';

/**
 * CaseStudy - Unified Continuous Carousel
 *
 * All slides from all clients are rendered in one continuous sequence.
 * Native scroll-snap handles ALL transitions - no special handling needed.
 * Infinite scroll with buffer slides on both ends for seamless looping.
 */
const CaseStudy = ({ activeClient, onClientChange, isFading, onFadeComplete, isMobile }) => {
  const scrollContainerRef = useRef(null);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false); // Track if initial positioning is complete
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false); // Prevent onClientChange during programmatic scroll
  const slideOneHeightRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const fadeTimeoutRef = useRef(null);
  const DRAG_THRESHOLD = 50;
  const snapTimeoutRef = useRef(null);

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

  // Snap to the nearest slide using actual element positions (pixel-perfect)
  const snapToNearestSlide = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isProgrammaticScrollRef.current) return;

    const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
    if (slideWrappers.length === 0) return;

    const { scrollLeft } = container;
    let closestSlide = null;
    let closestDistance = Infinity;
    let closestIndex = 0;

    // Find the slide whose left edge is closest to the current scroll position
    slideWrappers.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSlide = slide;
        closestIndex = index;
      }
    });

    // Only snap if we're more than 1px off (avoid unnecessary micro-adjustments)
    if (closestSlide && closestDistance > 1) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = closestSlide.offsetLeft;
      // Re-enable smooth scrolling after snap
      requestAnimationFrame(() => {
        container.style.scrollBehavior = 'smooth';
      });
    }

    return closestIndex;
  }, []);

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

    // Only notify client change if NOT fading (prevents jitter during programmatic scroll)
    if (slideInfo && onClientChange && slideInfo.clientKey !== activeClient && !isFading) {
      onClientChange(slideInfo.clientKey);
    }

    // Update nav dots
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Clear any pending snap timeout
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }

    // Check for infinite scroll wrap and snap correction
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      checkAndWrapScroll();

      // Add a slight delay for snap correction to ensure wrap is complete
      snapTimeoutRef.current = setTimeout(() => {
        snapToNearestSlide();
      }, 50);
    }, 150);
  }, [allSlides, totalSlides, realStartIndex, activeClient, onClientChange, isFading, snapToNearestSlide]);

  // Wrap scroll position when reaching buffer zones
  const checkAndWrapScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
    if (slideWrappers.length === 0) return;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);

    // If in start buffer, jump to corresponding position in real section
    if (slideIndex < realStartIndex) {
      const offset = realStartIndex - slideIndex;
      const newIndex = realStartIndex + totalSlides - offset;
      const targetSlide = slideWrappers[newIndex];
      if (targetSlide) {
        isProgrammaticScrollRef.current = true;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = targetSlide.offsetLeft;
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
          container.style.scrollBehavior = 'smooth';
        });
      }
    }
    // If in end buffer, jump to corresponding position in real section
    else if (slideIndex >= realStartIndex + totalSlides) {
      const offset = slideIndex - (realStartIndex + totalSlides);
      const newIndex = realStartIndex + offset;
      const targetSlide = slideWrappers[newIndex];
      if (targetSlide) {
        isProgrammaticScrollRef.current = true;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = targetSlide.offsetLeft;
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
          container.style.scrollBehavior = 'smooth';
        });
      }
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

  // Navigate to specific client's first slide (called when logo is clicked/swiped)
  const scrollToClient = useCallback((clientKey) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const clientStartIndex = getClientStartIndex(clientKey);
    if (clientStartIndex === -1) return;

    const { scrollLeft, clientWidth } = container;
    const currentSlideIndex = Math.round(scrollLeft / clientWidth);

    // Get current client to determine expected scroll direction
    const currentSlideInfo = getCurrentClientInfo(currentGlobalIndex);
    const currentClientKey = currentSlideInfo?.clientKey;

    // Get client orders to determine expected direction
    const currentOrder = currentClientKey ? getClientOrder(currentClientKey) : 0;
    const targetOrder = getClientOrder(clientKey);

    // Determine expected direction based on client order
    // Handle wrap-around: if going from order 7 to order 1, that's "forward"
    // if going from order 1 to order 7, that's "backward"
    const maxOrder = 7;
    let shouldScrollForward;

    if (currentOrder === targetOrder) {
      shouldScrollForward = true; // Same client, default forward
    } else {
      const forwardDistance = (targetOrder - currentOrder + maxOrder) % maxOrder || maxOrder;
      const backwardDistance = (currentOrder - targetOrder + maxOrder) % maxOrder || maxOrder;
      shouldScrollForward = forwardDistance <= backwardDistance;
    }

    // Find all possible positions for this client (in real section and buffers)
    const possibleTargets = [
      clientStartIndex,                           // Start buffer
      realStartIndex + clientStartIndex,          // Real section
      realStartIndex + totalSlides + clientStartIndex  // End buffer
    ];

    // Pick the target that moves in the expected direction
    let bestTarget = possibleTargets[1]; // Default to real section

    if (shouldScrollForward) {
      // Find closest target that is >= currentSlideIndex (moving right/forward)
      let bestDistance = Infinity;
      possibleTargets.forEach(targetIndex => {
        const distance = targetIndex - currentSlideIndex;
        if (distance >= 0 && distance < bestDistance) {
          bestDistance = distance;
          bestTarget = targetIndex;
        }
      });
      // If no forward target found, pick the one that wraps around (smallest index)
      if (bestDistance === Infinity) {
        bestTarget = Math.min(...possibleTargets);
      }
    } else {
      // Find closest target that is <= currentSlideIndex (moving left/backward)
      let bestDistance = Infinity;
      possibleTargets.forEach(targetIndex => {
        const distance = currentSlideIndex - targetIndex;
        if (distance >= 0 && distance < bestDistance) {
          bestDistance = distance;
          bestTarget = targetIndex;
        }
      });
      // If no backward target found, pick the one that wraps around (largest index)
      if (bestDistance === Infinity) {
        bestTarget = Math.max(...possibleTargets);
      }
    }

    isProgrammaticScrollRef.current = true;

    // Get actual slide element for pixel-perfect positioning
    const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
    const targetSlide = slideWrappers[bestTarget];

    // Disable scroll-snap during transition to prevent browser interference
    container.style.scrollSnapType = 'none';

    // Start smooth scroll using actual element position
    container.style.scrollBehavior = 'smooth';
    if (targetSlide) {
      container.scrollLeft = targetSlide.offsetLeft;
    } else {
      // Fallback to calculated position
      container.scrollLeft = Math.round(bestTarget * clientWidth);
    }

    // Verify position mid-animation and correct if needed
    setTimeout(() => {
      container.style.scrollBehavior = 'auto';
      if (targetSlide) {
        container.scrollLeft = targetSlide.offsetLeft;
      }
    }, 750);

    // Re-enable scroll-snap and do final snap correction
    setTimeout(() => {
      container.style.scrollBehavior = 'smooth';
      container.style.scrollSnapType = 'x mandatory';
      isProgrammaticScrollRef.current = false;

      // Final snap correction to ensure perfect alignment
      requestAnimationFrame(() => {
        if (targetSlide && Math.abs(container.scrollLeft - targetSlide.offsetLeft) > 1) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = targetSlide.offsetLeft;
          requestAnimationFrame(() => {
            container.style.scrollBehavior = 'smooth';
          });
        }
      });
    }, 900);

    // Update state
    setCurrentGlobalIndex(clientStartIndex);
    const slideInfo = allSlides[clientStartIndex];
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);
  }, [allSlides, realStartIndex, totalSlides, currentGlobalIndex, getCurrentClientInfo]);

  // When activeClient changes from external source (logo click), scroll to that client
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const currentSlideInfo = getCurrentClientInfo(currentGlobalIndex);
    if (currentSlideInfo?.clientKey !== activeClient) {
      scrollToClient(activeClient);
    }
  }, [activeClient]);

  // Handle fade completion - wait for scroll to finish then notify
  useEffect(() => {
    if (isFading && onFadeComplete) {
      // Clear any existing timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }

      // Wait for scroll animation to complete (smooth scroll takes ~800ms)
      // Then notify parent to fade back in
      fadeTimeoutRef.current = setTimeout(() => {
        onFadeComplete();
      }, 850);
    }

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [isFading, activeClient, onFadeComplete]);

  // Initial scroll to SWA (or activeClient) on mount
  useLayoutEffect(() => {
    if (hasInitializedRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Find SWA's starting position
    const swaStartIndex = getClientStartIndex('SWA');
    const targetIndex = swaStartIndex !== -1 ? swaStartIndex : 0;
    const absoluteIndex = realStartIndex + targetIndex;

    // Wait for layout to be fully computed before positioning
    // Use double RAF to ensure we're past the layout/paint cycle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
        const targetSlide = slideWrappers[absoluteIndex];

        // Scroll to position immediately (no animation)
        container.style.scrollBehavior = 'auto';
        if (targetSlide) {
          container.scrollLeft = targetSlide.offsetLeft;
        } else {
          container.scrollLeft = absoluteIndex * container.clientWidth;
        }

        // Refine position after another frame to handle any layout shifts
        requestAnimationFrame(() => {
          const updatedSlide = slideWrappers[absoluteIndex];
          if (updatedSlide && Math.abs(container.scrollLeft - updatedSlide.offsetLeft) > 1) {
            container.scrollLeft = updatedSlide.offsetLeft;
          }

          setCurrentGlobalIndex(targetIndex);
          hasInitializedRef.current = true;
          setIsPositioned(true); // Now safe to show

          // Update nav dots and enable smooth scrolling
          const slideInfo = allSlides[targetIndex];
          updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1);
          container.style.scrollBehavior = 'smooth';
        });
      });
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
    const { clientWidth } = container;

    // Get slide elements for pixel-perfect positioning
    const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');

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

    // Clamp to valid range
    targetSlideIndex = Math.max(0, Math.min(slideWrappers.length - 1, targetSlideIndex));

    // Animate smoothly to target slide using actual element position
    const targetSlide = slideWrappers[targetSlideIndex];
    container.style.scrollBehavior = 'smooth';
    if (targetSlide) {
      container.scrollLeft = targetSlide.offsetLeft;
    }

    setIsDragging(false);
    dragDistanceRef.current = 0;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Snap to nearest slide using actual element positions
  const snapToSlide = () => {
    const container = scrollContainerRef.current;
    if (!container || isScrollingRef.current) return;

    const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
    if (slideWrappers.length === 0) return;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);
    const clampedIndex = Math.max(0, Math.min(slideWrappers.length - 1, slideIndex));
    const targetSlide = slideWrappers[clampedIndex];

    if (targetSlide) {
      container.style.scrollBehavior = 'smooth';
      container.scrollLeft = targetSlide.offsetLeft;
    }
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
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
        style={{
          opacity: (!isPositioned || isFading) ? 0 : 1,
          transition: isPositioned ? 'opacity 0.3s ease-in-out' : 'none'
        }}
      >
        {infiniteSlides.map((slideData, index) => {
          const SlideComponent = slideData.slide.component;

          // Calculate distance from current slide for preload optimization
          const distanceFromCurrent = Math.abs(index - (realStartIndex + currentGlobalIndex));

          // Preload strategy:
          // - Current slide (distance 0): preload="auto" for immediate playback
          // - Adjacent slides (distance 1-2): preload="metadata" for quick start
          // - Far slides (distance > 2): preload="none" to save bandwidth
          let preloadValue;
          if (distanceFromCurrent === 0) {
            preloadValue = 'auto';
          } else if (distanceFromCurrent <= 2) {
            preloadValue = 'metadata';
          } else {
            preloadValue = 'none';
          }

          return (
            <div
              key={`${slideData.isBuffer}-${index}`}
              className="case-study-slide-wrapper"
              data-client={slideData.clientKey}
              data-is-buffer={slideData.isBuffer}
            >
              <SlideComponent
                {...slideData.slide.props}
                preload={preloadValue}
                isMobile={isMobile}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseStudy;
