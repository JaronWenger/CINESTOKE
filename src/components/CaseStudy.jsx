import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { flushSync } from 'react-dom';
import { getAllSlidesFlattened, getOrderedClients, getAdjacentClientKey } from '../config/caseStudyConfig';

/**
 * CaseStudy - Dynamic Circular Carousel
 *
 * All slides from all clients are rendered in one continuous sequence.
 * Uses dynamic circular ordering - slides reorder around the focused brand.
 * This reduces DOM from 102 elements (3x buffer) to just 34 elements.
 * Each video is loaded only ONCE instead of 3 times.
 *
 * Transitions between brands use fade animation which hides the reordering.
 */
const CaseStudy = forwardRef(({ activeClient, onClientChange, isFading, onFadeComplete, isMobile }, ref) => {
  const scrollContainerRef = useRef(null);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false); // Track if initial positioning is complete
  const [videosCanLoad, setVideosCanLoad] = useState(false); // Track if sizing is done, other videos can load
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false); // Prevent onClientChange during programmatic scroll
  const slideOneHeightRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const pendingScrollTargetRef = useRef(null); // Store target client for after fade completes
  const fadeOutCompleteRef = useRef(false); // Track if fade-out has completed (for late-arriving targets)
  const DRAG_THRESHOLD = 50;
  const snapTimeoutRef = useRef(null);
  const focusedClientRef = useRef('SWA'); // Track the currently focused client for circular ordering

  // Get all clients in their default order
  const orderedClients = getOrderedClients();
  const totalClients = orderedClients.length;

  /**
   * Generate slides in circular order around the focused client
   * If SWA (order 5) is focused, order: [Slate(3)] [IR(4)] [SWA(5)] [Seadoo(6)] [BG(7)] [TCO(1)] [GFF(2)]
   * The focused client's slides are in the CENTER of the array
   */
  const getCircularSlides = useCallback((focusedClientKey) => {
    const focusIndex = orderedClients.findIndex(c => c.key === focusedClientKey);
    if (focusIndex === -1) return getAllSlidesFlattened();

    // Rotate array so focus is in center (for 7 clients, put focus at index 3)
    // This gives 3 clients to the left, focused client, 3 clients to the right
    const halfCount = Math.floor(totalClients / 2);
    const rotatedClients = [];

    for (let offset = -halfCount; offset <= totalClients - 1 - halfCount; offset++) {
      const idx = (focusIndex + offset + totalClients) % totalClients;
      rotatedClients.push(orderedClients[idx]);
    }

    // Flatten to slides with position metadata
    let globalSlideIndex = 0;
    const slides = [];

    rotatedClients.forEach((client, clientPositionInArray) => {
      const isLeftBuffer = clientPositionInArray < halfCount;
      const isRightBuffer = clientPositionInArray > halfCount;
      const isFocused = clientPositionInArray === halfCount;

      client.slides.forEach((slide, slideIndex) => {
        slides.push({
          clientKey: client.key,
          clientName: client.name,
          slideIndex,
          totalClientSlides: client.slides.length,
          isFirstSlideOfClient: slideIndex === 0,
          isLastSlideOfClient: slideIndex === client.slides.length - 1,
          slide,
          // Position metadata for edge detection
          isLeftBuffer,
          isRightBuffer,
          isFocused,
          globalIndex: globalSlideIndex++
        });
      });
    });

    return slides;
  }, [orderedClients, totalClients]);

  // Initialize slides around SWA (or activeClient)
  const [circularSlides, setCircularSlides] = useState(() => getCircularSlides('SWA'));

  // Get current slide's client info from circular slides
  const getCurrentClientInfo = useCallback((slideIndex) => {
    if (slideIndex >= 0 && slideIndex < circularSlides.length) {
      return circularSlides[slideIndex];
    }
    return null;
  }, [circularSlides]);

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

  // Silent reorder: when user swipes to a different brand, reorder around that brand
  // without any visible glitch - maintains visual position while updating the buffer
  // Uses flushSync to make state update synchronous, eliminating the flicker
  const silentReorderAroundBrand = useCallback((newFocusBrand, currentSlideWithinBrand) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Prevent scroll handler from interfering
    isProgrammaticScrollRef.current = true;

    // 1. Generate new slides centered on the new brand
    const newSlides = getCircularSlides(newFocusBrand);

    // 2. Find where the current slide is in the new array
    const newIndex = newSlides.findIndex(s =>
      s.clientKey === newFocusBrand && s.slideIndex === currentSlideWithinBrand
    );

    if (newIndex === -1) {
      isProgrammaticScrollRef.current = false;
      return;
    }

    // 3. Update focused client ref
    focusedClientRef.current = newFocusBrand;

    // 4. SYNCHRONOUSLY update slides state (forces immediate re-render)
    // This ensures DOM is updated before we adjust scroll position
    flushSync(() => {
      setCircularSlides(newSlides);
    });

    // 5. IMMEDIATELY adjust scroll (same synchronous block, before browser paints)
    const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
    const targetSlide = slideWrappers[newIndex];

    if (targetSlide) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = targetSlide.offsetLeft;
    }

    setCurrentGlobalIndex(newIndex);
    isProgrammaticScrollRef.current = false;

    // Snap to ensure perfect alignment
    snapTimeoutRef.current = setTimeout(() => {
      snapToNearestSlide();
    }, 50);
  }, [getCircularSlides, snapToNearestSlide]);

  // Handle scroll to detect current slide and sync client
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isProgrammaticScrollRef.current) return;

    isScrollingRef.current = true;

    const { scrollLeft, clientWidth } = container;
    const slideIndex = Math.round(scrollLeft / clientWidth);

    // Clamp to valid range
    const clampedIndex = Math.max(0, Math.min(circularSlides.length - 1, slideIndex));
    setCurrentGlobalIndex(clampedIndex);

    // Get client info for current slide
    const slideInfo = circularSlides[clampedIndex];

    // Only notify client change if NOT fading (prevents jitter during programmatic scroll)
    if (slideInfo && onClientChange && slideInfo.clientKey !== activeClient && !isFading) {
      onClientChange(slideInfo.clientKey);
    }

    // Update nav dots
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1, slideInfo?.clientKey);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Clear any pending snap timeout
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }

    // When scroll ends, check if we need to silently reorder around the new brand
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;

      // Get current slide info
      const currentSlideInfo = circularSlides[clampedIndex];

      // Check if user has scrolled to a different brand than the focused one
      if (currentSlideInfo && currentSlideInfo.clientKey !== focusedClientRef.current) {
        // Perform silent reorder to keep user centered in the buffer
        silentReorderAroundBrand(currentSlideInfo.clientKey, currentSlideInfo.slideIndex);
      } else {
        // Same brand, just snap to nearest slide
        snapTimeoutRef.current = setTimeout(() => {
          snapToNearestSlide();
        }, 50);
      }
    }, 150);
  }, [circularSlides, activeClient, onClientChange, isFading, snapToNearestSlide, silentReorderAroundBrand]);


  // Track current client for nav dots
  const currentNavClientRef = useRef(null);
  const dotsTransitioningRef = useRef(false);

  // Helper to find slide index in circular array by client and slide index
  const findSlideInCircular = useCallback((clientKey, slideIdx) => {
    return circularSlides.findIndex(s => s.clientKey === clientKey && s.slideIndex === slideIdx);
  }, [circularSlides]);

  // Update nav dots to show position within current client
  const updateNavDots = useCallback((slideIndex, totalClientSlides, clientKey) => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;

    const navDotsOutside = carousel.parentElement?.querySelector('.case-study-nav-dots-outside');
    if (!navDotsOutside) return;

    // Skip updates during transition
    if (dotsTransitioningRef.current) return;

    const currentDots = navDotsOutside.querySelectorAll('.case-study-dot-wrapper');
    const brandChanged = currentNavClientRef.current !== clientKey;
    currentNavClientRef.current = clientKey;

    // If brand changed, crossfade the dots
    if (brandChanged && currentDots.length > 0) {
      dotsTransitioningRef.current = true;

      // Fade out existing dots
      currentDots.forEach(wrapper => {
        wrapper.classList.add('dot-exiting');
      });

      // After fade out, replace with new dots
      setTimeout(() => {
        navDotsOutside.innerHTML = '';
        for (let i = 0; i < totalClientSlides; i++) {
          const dotWrapper = document.createElement('div');
          dotWrapper.className = 'case-study-dot-wrapper dot-entering';
          const dot = document.createElement('div');
          dot.className = `case-study-dot ${i === slideIndex && totalClientSlides > 1 ? 'active' : ''}`;
          const slideIdxCopy = i; // Capture for closure
          dotWrapper.addEventListener('click', () => {
            const container = scrollContainerRef.current;
            if (container) {
              // Find the slide in circular array
              const targetIndex = findSlideInCircular(clientKey, slideIdxCopy);
              if (targetIndex !== -1) {
                const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
                const targetSlide = slideWrappers[targetIndex];
                if (targetSlide) {
                  container.scrollTo({
                    left: targetSlide.offsetLeft,
                    behavior: 'smooth'
                  });
                }
              }
            }
          });
          dotWrapper.appendChild(dot);
          navDotsOutside.appendChild(dotWrapper);
        }
        // Fade in new dots
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            navDotsOutside.querySelectorAll('.dot-entering').forEach(wrapper => {
              wrapper.classList.remove('dot-entering');
            });
            dotsTransitioningRef.current = false;
          });
        });
      }, 150);
    } else if (currentDots.length !== totalClientSlides) {
      // Initial creation (no animation)
      navDotsOutside.innerHTML = '';
      for (let i = 0; i < totalClientSlides; i++) {
        const dotWrapper = document.createElement('div');
        dotWrapper.className = 'case-study-dot-wrapper';
        const dot = document.createElement('div');
        dot.className = `case-study-dot ${i === slideIndex && totalClientSlides > 1 ? 'active' : ''}`;
        const slideIdxCopy = i;
        dotWrapper.addEventListener('click', () => {
          const container = scrollContainerRef.current;
          if (container) {
            const targetIndex = findSlideInCircular(clientKey, slideIdxCopy);
            if (targetIndex !== -1) {
              const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
              const targetSlide = slideWrappers[targetIndex];
              if (targetSlide) {
                container.scrollTo({
                  left: targetSlide.offsetLeft,
                  behavior: 'smooth'
                });
              }
            }
          }
        });
        dotWrapper.appendChild(dot);
        navDotsOutside.appendChild(dotWrapper);
      }
    } else {
      // Same brand, just update active state
      currentDots.forEach((wrapper, index) => {
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
  }, [findSlideInCircular]);

  // Navigate to specific client's first slide (called when logo is clicked/swiped)
  // With dynamic circular buffer: reorder slides around new focus, then scroll to first slide
  const scrollToClient = useCallback((clientKey) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Update the focused client ref
    focusedClientRef.current = clientKey;

    // Reorder slides around the new focus
    const newSlides = getCircularSlides(clientKey);
    setCircularSlides(newSlides);

    // After React re-renders with new slide order, scroll to first slide of focus
    // The focused client is always in the center of the circular array
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
        const focusStartIndex = newSlides.findIndex(s => s.isFocused && s.isFirstSlideOfClient);

        if (focusStartIndex !== -1 && slideWrappers[focusStartIndex]) {
          isProgrammaticScrollRef.current = true;

          // Disable scroll-snap during transition
          container.style.scrollSnapType = 'none';
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = slideWrappers[focusStartIndex].offsetLeft;

          // Re-enable scroll-snap
          container.style.scrollSnapType = 'x mandatory';
          isProgrammaticScrollRef.current = false;

          // Update state
          setCurrentGlobalIndex(focusStartIndex);
          const slideInfo = newSlides[focusStartIndex];
          updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1, slideInfo?.clientKey);
        }
      });
    });
  }, [getCircularSlides, updateNavDots]);

  // Expose scrollToFirstSlide method via ref (for when user re-clicks centered brand)
  // Uses smooth scrolling (not instant jump) so user sees slides animate back
  useImperativeHandle(ref, () => ({
    scrollToFirstSlide: (clientKey) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Find first slide of this client in circular array
      const targetIndex = circularSlides.findIndex(s => s.clientKey === clientKey && s.isFirstSlideOfClient);
      if (targetIndex === -1) return;

      const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
      const targetSlide = slideWrappers[targetIndex];

      if (targetSlide) {
        // Use smooth scroll so user sees the slides animate back
        container.style.scrollBehavior = 'smooth';
        container.scrollLeft = targetSlide.offsetLeft;

        // Update state
        setCurrentGlobalIndex(targetIndex);
        const slideInfo = circularSlides[targetIndex];
        updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1, slideInfo?.clientKey);
      }
    }
  }), [circularSlides, updateNavDots]);

  // Reset fadeOutCompleteRef when fade starts
  useEffect(() => {
    if (isFading) {
      fadeOutCompleteRef.current = false;
    }
  }, [isFading]);

  // When activeClient changes from external source (logo click), store target for after fade
  // The actual scroll happens in the transitionend handler when fade-out completes
  // OR immediately if fade-out already completed (late-arriving target)
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const currentSlideInfo = getCurrentClientInfo(currentGlobalIndex);
    console.log('📍 activeClient useEffect:', {
      activeClient,
      currentClientKey: currentSlideInfo?.clientKey,
      isFading,
      fadeOutComplete: fadeOutCompleteRef.current
    });

    if (currentSlideInfo?.clientKey !== activeClient) {
      // If fade-out already completed, jump immediately
      if (isFading && fadeOutCompleteRef.current) {
        console.log('🚀 Late target arrival - jumping immediately to:', activeClient);
        scrollToClient(activeClient);
        onFadeComplete?.();
        return;
      }
      // Otherwise store the target - we'll jump to it after fade-out completes
      console.log('📝 Storing pending target:', activeClient);
      pendingScrollTargetRef.current = activeClient;
    }
  }, [activeClient, currentGlobalIndex, getCurrentClientInfo, isFading, scrollToClient, onFadeComplete]);

  // Event-driven fade transition using transitionend
  // When fade-out completes (opacity reaches 0), instantly jump to target, then fade back in
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleTransitionEnd = (e) => {
      // Only handle opacity transitions on this element (not bubbled from children)
      if (e.propertyName !== 'opacity' || e.target !== container) return;

      const currentOpacity = parseFloat(getComputedStyle(container).opacity);
      console.log('🔄 CaseStudy transitionend fired, opacity:', currentOpacity, 'pendingTarget:', pendingScrollTargetRef.current);

      // Fade-out complete (opacity near 0)
      if (currentOpacity < 0.1) {
        fadeOutCompleteRef.current = true; // Mark that fade-out is done
        console.log('✅ Fade-out complete, fadeOutCompleteRef set to true');

        // If we have a pending scroll target, jump to it now
        if (pendingScrollTargetRef.current) {
          const targetClient = pendingScrollTargetRef.current;
          pendingScrollTargetRef.current = null;
          console.log('🎯 Jumping to target:', targetClient);

          // Perform instant jump while screen is black
          scrollToClient(targetClient);

          // Trigger fade-in by notifying parent (sets isFading=false → opacity=1)
          onFadeComplete?.();
        } else {
          console.log('⏳ No pending target yet, staying black');
        }
      }
    };

    container.addEventListener('transitionend', handleTransitionEnd);
    return () => container.removeEventListener('transitionend', handleTransitionEnd);
  }, [onFadeComplete, scrollToClient]);

  // Initial scroll to SWA (first slide of focused client) on mount
  useLayoutEffect(() => {
    if (hasInitializedRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // With circular buffer, find the first slide of the focused client (center of array)
    const focusStartIndex = circularSlides.findIndex(s => s.isFocused && s.isFirstSlideOfClient);
    const targetIndex = focusStartIndex !== -1 ? focusStartIndex : 0;

    // Wait for layout to be fully computed before positioning
    // Use double RAF to ensure we're past the layout/paint cycle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const slideWrappers = container.querySelectorAll('.case-study-slide-wrapper');
        const targetSlide = slideWrappers[targetIndex];

        // Scroll to position immediately (no animation)
        container.style.scrollBehavior = 'auto';
        if (targetSlide) {
          container.scrollLeft = targetSlide.offsetLeft;
        } else {
          container.scrollLeft = targetIndex * container.clientWidth;
        }

        // Refine position after another frame to handle any layout shifts
        requestAnimationFrame(() => {
          const updatedSlide = slideWrappers[targetIndex];
          if (updatedSlide && Math.abs(container.scrollLeft - updatedSlide.offsetLeft) > 1) {
            container.scrollLeft = updatedSlide.offsetLeft;
          }

          setCurrentGlobalIndex(targetIndex);
          hasInitializedRef.current = true;
          setIsPositioned(true); // Now safe to show

          // Update nav dots and enable smooth scrolling
          const slideInfo = circularSlides[targetIndex];
          updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1, slideInfo?.clientKey);
          container.style.scrollBehavior = 'smooth';
        });
      });
    });
  }, [circularSlides, updateNavDots]);

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
    const slideInfo = circularSlides[currentGlobalIndex];
    updateNavDots(slideInfo?.slideIndex || 0, slideInfo?.totalClientSlides || 1, slideInfo?.clientKey);
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
    const currentSlide = circularSlides[currentSlideIndex];

    // Edge detection: check if trying to swipe past the carousel boundaries
    if (absDragDistance > DRAG_THRESHOLD && currentSlide) {
      // Dragging right (positive) at first slide = trying to go left past start
      if (dragDistance > 0 && currentSlideIndex === 0) {
        const adjacentClient = getAdjacentClientKey(focusedClientRef.current, 'left');
        if (onClientChange && adjacentClient !== focusedClientRef.current) {
          // Trigger fade transition to previous brand
          onClientChange(adjacentClient);
          setIsDragging(false);
          dragDistanceRef.current = 0;
          return;
        }
      }
      // Dragging left (negative) at last slide = trying to go right past end
      if (dragDistance < 0 && currentSlideIndex === circularSlides.length - 1) {
        const adjacentClient = getAdjacentClientKey(focusedClientRef.current, 'right');
        if (onClientChange && adjacentClient !== focusedClientRef.current) {
          // Trigger fade transition to next brand
          onClientChange(adjacentClient);
          setIsDragging(false);
          dragDistanceRef.current = 0;
          return;
        }
      }
    }

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

        // Sizing complete - allow other videos to load
        setVideosCanLoad(true);
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
  if (circularSlides.length === 0) {
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
        {circularSlides.map((slideData, index) => {
          const SlideComponent = slideData.slide.component;

          // Calculate distance from current slide for preload optimization
          const distanceFromCurrent = Math.abs(index - currentGlobalIndex);

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
              key={`${slideData.clientKey}-${slideData.slideIndex}`}
              className="case-study-slide-wrapper"
              data-client={slideData.clientKey}
              data-is-left-buffer={slideData.isLeftBuffer}
              data-is-right-buffer={slideData.isRightBuffer}
              data-is-focused={slideData.isFocused}
            >
              <SlideComponent
                {...slideData.slide.props}
                preload={preloadValue}
                isMobile={isMobile}
                videosCanLoad={videosCanLoad}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CaseStudy;
