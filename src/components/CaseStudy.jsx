import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { getCaseStudyForClient } from '../config/caseStudyConfig';

const CaseStudy = ({ activeClient, onShiftBrand }) => {
  const scrollContainerRef = useRef(null);
  const firstSlideRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isResettingRef = useRef(false); // Flag to prevent handleScroll from updating during brand switch
  const DRAG_THRESHOLD = 50; // Minimum pixels to trigger slide change
  const slideOneHeightRef = useRef(null); // Store the height from SlideOne (SWA) to apply to all slides
  const touchStartRef = useRef({ x: 0, scrollLeft: 0 }); // Track touch start position for swipe detection

  // Trackpad horizontal swipe handling
  // Uses same mechanics as native scroll-snap for slides, only intervenes at boundaries
  const isWheelLockedRef = useRef(false); // Lock after triggering brand switch to prevent momentum

  // Get case study data for active client
  const caseStudyData = activeClient ? getCaseStudyForClient(activeClient) : null;
  const slides = caseStudyData?.slides || [];
  const totalSlides = slides.length;

  // Debug logging
  useEffect(() => {
    console.log('=== CaseStudy Update ===');
    console.log('activeClient:', activeClient);
    console.log('caseStudyData:', caseStudyData);
    console.log('slides array:', slides);
    console.log('totalSlides:', totalSlides);
    if (caseStudyData) {
      console.log('caseStudyData.slides:', caseStudyData.slides);
      caseStudyData.slides.forEach((slide, idx) => {
        console.log(`Slide ${idx}:`, slide.type, slide.component?.name || 'unknown component');
      });
    }
  }, [activeClient, caseStudyData, totalSlides, slides]);

  // Handle scroll to detect current slide
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Don't update state if we're in the middle of resetting (brand switch)
    if (isResettingRef.current) {
      return;
    }

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
      // For single slide, don't show active (horizontal) dot - just show regular dot
      if (index === activeIndex && totalSlides > 1) {
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
        if (currentSlide === 0) {
          // At first slide, shift to previous brand
          if (onShiftBrand) {
            onShiftBrand('left');
          }
        } else {
          const prevSlide = currentSlide - 1;
          goToSlide(prevSlide);
        }
      } else {
        // Dragged left - go to next slide
        if (currentSlide === totalSlides - 1) {
          // At last slide, shift to next brand
          if (onShiftBrand) {
            onShiftBrand('right');
          }
        } else {
          const nextSlide = currentSlide + 1;
          goToSlide(nextSlide);
        }
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
  const handleTouchStart = (e) => {
    isScrollingRef.current = true;
    const container = scrollContainerRef.current;
    if (container && e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        scrollLeft: container.scrollLeft
      };
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = (e) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Check if user swiped beyond boundaries
    const container = scrollContainerRef.current;
    if (container && e.changedTouches.length > 0 && touchStartRef.current.x !== 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchDeltaX = touchStartRef.current.x - touchEndX;
      const { scrollLeft, clientWidth } = container;
      const currentSlideIndex = Math.round(scrollLeft / clientWidth);

      // If significant swipe detected
      if (Math.abs(touchDeltaX) > DRAG_THRESHOLD) {
        if (touchDeltaX > 0) {
          // Swiped left - trying to go to next slide
          if (currentSlideIndex === totalSlides - 1) {
            // At last slide, shift to next brand
            if (onShiftBrand) {
              onShiftBrand('right');
              touchStartRef.current = { x: 0, scrollLeft: 0 }; // Reset
              return;
            }
          }
        } else {
          // Swiped right - trying to go to previous slide
          if (currentSlideIndex === 0) {
            // At first slide, shift to previous brand
            if (onShiftBrand) {
              onShiftBrand('left');
              touchStartRef.current = { x: 0, scrollLeft: 0 }; // Reset
              return;
            }
          }
        }
      }
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      snapToSlide();
      touchStartRef.current = { x: 0, scrollLeft: 0 }; // Reset
    }, 150);
  };

  // Trackpad horizontal swipe handler (for laptop users)
  // Simple approach: let native scroll-snap handle slides, only intervene at scroll boundaries
  const handleWheel = useCallback((e) => {
    // Only handle horizontal scrolling
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

    // Block all wheel events while locked (after brand switch, until transition completes)
    if (isWheelLockedRef.current || isResettingRef.current) {
      e.preventDefault();
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    const currentSlideIndex = Math.round(scrollLeft / clientWidth);

    // Must be on first/last SLIDE (not just near scroll boundary)
    const onFirstSlide = currentSlideIndex === 0;
    const onLastSlide = currentSlideIndex === totalSlides - 1;

    // AND at the actual scroll edge
    const atLeftEdge = scrollLeft <= 5;
    const atRightEdge = scrollLeft >= maxScroll - 5;

    const swipingRight = e.deltaX < 0; // finger moves right, trying to see previous
    const swipingLeft = e.deltaX > 0;  // finger moves left, trying to see next

    // Require minimum delta to avoid residual momentum triggering
    const MIN_DELTA = 8;

    // At first slide, at left edge, swiping right → previous brand
    if (onFirstSlide && atLeftEdge && swipingRight && Math.abs(e.deltaX) > MIN_DELTA) {
      e.preventDefault();
      isWheelLockedRef.current = true;
      // Safety unlock in case transition doesn't complete (e.g., at first brand)
      setTimeout(() => { isWheelLockedRef.current = false; }, 400);
      if (onShiftBrand) onShiftBrand('left');
      return;
    }

    // At last slide, at right edge, swiping left → next brand
    if (onLastSlide && atRightEdge && swipingLeft && Math.abs(e.deltaX) > MIN_DELTA) {
      e.preventDefault();
      isWheelLockedRef.current = true;
      // Safety unlock in case transition doesn't complete (e.g., at last brand)
      setTimeout(() => { isWheelLockedRef.current = false; }, 400);
      if (onShiftBrand) onShiftBrand('right');
      return;
    }

    // Otherwise, let native scroll-snap handle it (scrolling between slides)
  }, [totalSlides, onShiftBrand]);

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

  // Function to move nav dots outside slide wrapper (accessible from multiple useEffects)
  const moveNavDotsOutside = (allSlides) => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;

    const parentElement = carousel.parentElement;
    if (!parentElement) return;

    // Check if nav dots already exist
    const existingNavDotsOutside = parentElement.querySelector('.case-study-nav-dots-outside');
    
    // If existing nav dots have the same count, just update them in place (seamless)
    if (existingNavDotsOutside) {
      const existingDots = existingNavDotsOutside.querySelectorAll('.case-study-dot-wrapper');
      if (existingDots.length === totalSlides) {
        // Same count - just update active state
        // Always set to slide 0 when switching brands (currentSlide should be 0, but be explicit)
        const activeSlideIndex = 0; // Force to first slide when updating
        existingDots.forEach((wrapper, index) => {
          const dot = wrapper.querySelector('.case-study-dot');
          if (dot) {
            // For single slide, don't show active (horizontal) dot - just show regular dot
            if (index === activeSlideIndex && totalSlides > 1) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          }
        });
        
        // Hide nav dots inside slides
        if (allSlides) {
          allSlides.forEach((slide) => {
            const dots = slide.querySelector('.case-study-nav-dots');
            if (dots) {
              dots.style.display = 'none';
            }
          });
        }
        return; // Done - no need to recreate (click handlers are already set)
      }
    }

    // Create new nav dots (either don't exist or count changed)
    const navDotsContainer = document.createElement('div');
    navDotsContainer.className = 'case-study-nav-dots case-study-nav-dots-outside';
    
    // Create a dot for each slide
    for (let i = 0; i < totalSlides; i++) {
      const dotWrapper = document.createElement('div');
      dotWrapper.className = 'case-study-dot-wrapper';
      dotWrapper.addEventListener('click', () => {
        goToSlide(i);
      });
      
      const dot = document.createElement('div');
      // For single slide, don't show active (horizontal) dot - just show regular dot
      // When creating nav dots for a new brand, always start at slide 0
      const isActive = i === 0 && totalSlides > 1;
      dot.className = `case-study-dot ${isActive ? 'active' : ''}`;
      
      dotWrapper.appendChild(dot);
      navDotsContainer.appendChild(dotWrapper);
    }
    
    // Hide nav dots inside slides with CSS instead of removing them (don't break React)
    if (allSlides) {
      allSlides.forEach((slide) => {
        const dots = slide.querySelector('.case-study-nav-dots');
        if (dots) {
          dots.style.display = 'none'; // Hide instead of remove
        }
      });
    }
    
    // Replace existing nav dots (if any) with new ones, or add if none exist
    // This ensures seamless transition - new dots are ready before old ones are removed
    if (existingNavDotsOutside) {
      existingNavDotsOutside.replaceWith(navDotsContainer);
    } else {
      parentElement.appendChild(navDotsContainer);
    }
    
    // Ensure the first slide (index 0) is active after creating nav dots
    // This is important when switching brands to ensure nav dots show correct state
    updateNavDotsOutside(0);
  };

  // Reset to first slide when client changes - use useLayoutEffect to prevent flash
  // This runs synchronously after DOM mutations but before browser paint
  useLayoutEffect(() => {
    // Set flag to prevent handleScroll from updating during reset
    isResettingRef.current = true;

    // Unlock wheel events - transition is complete
    isWheelLockedRef.current = false;

    // Reset state immediately
    setCurrentSlide(0);
    
    // Reset scroll position immediately and synchronously (before paint)
    const carousel = scrollContainerRef.current;
    if (carousel) {
      // Disable smooth scrolling temporarily to ensure instant reset
      const originalScrollBehavior = carousel.style.scrollBehavior;
      carousel.style.scrollBehavior = 'auto';
      carousel.scrollLeft = 0;
      // Force synchronous layout recalculation
      void carousel.offsetHeight;
      // Restore original scroll behavior
      carousel.style.scrollBehavior = originalScrollBehavior || '';
    }
    
    // Update nav dots to show first slide as active immediately (if they exist)
    // Note: If nav dots don't exist yet, they'll be created with correct active state in the useEffect
    const navDotsOutside = carousel?.parentElement?.querySelector('.case-study-nav-dots-outside');
    if (navDotsOutside) {
      updateNavDotsOutside(0);
    }
    
    // Clear the reset flag after a brief delay to allow scroll position to settle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
    });
  }, [activeClient]);

  // Sync heights and recreate nav dots when client changes
  useEffect(() => {
    
    // Function to recreate nav dots after React renders new slides
    // Note: We don't remove old nav dots here - moveNavDotsOutside will handle seamless replacement
    const recreateNavDots = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const carousel = scrollContainerRef.current;
          if (!carousel) return;
          
          const allSlides = carousel.querySelectorAll('.case-study-slide-wrapper');
          
          // Always hide nav dots inside slides when switching brands (they're replaced by outside nav dots)
          allSlides.forEach((slide) => {
            const dots = slide.querySelector('.case-study-nav-dots');
            if (dots) {
              dots.style.display = 'none';
            }
          });
          
          // Recreate nav dots outside with correct count for new brand
          // Wait a bit for React to finish rendering the new slides
          setTimeout(() => {
            if (allSlides.length > 0) {
              moveNavDotsOutside(allSlides);
            }
          }, 50);
        });
      });
    };
    
    // When brand switches, apply the stored SlideOne height to all slides
    // Use multiple requestAnimationFrames to ensure DOM is ready after React renders
    if (slideOneHeightRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const carousel = scrollContainerRef.current;
          if (!carousel) return;
          
          const heightValue = `${slideOneHeightRef.current}px`;
          const allSlides = carousel.querySelectorAll('.case-study-slide-wrapper');
          
          // Apply SlideOne's height to ALL slide wrappers (including SlideMain and when switching back to SWA)
          allSlides.forEach((slide) => {
            slide.style.height = heightValue;
            slide.style.minHeight = '0';
            slide.style.maxHeight = heightValue;
            slide.style.padding = '0';
            slide.style.margin = '0';
          });
          
          // Also set carousel height
          carousel.style.height = heightValue;
          carousel.style.minHeight = '0';
          carousel.style.maxHeight = heightValue;
          
          // Recreate nav dots after applying heights
          recreateNavDots();
        });
      });
    } else {
      // Even if height isn't stored yet, still recreate nav dots
      recreateNavDots();
    }
  }, [activeClient, totalSlides]);

  // Sync all slide heights to match SlideOne's (SWA) rendered height
  // SlideOne (SWA) gets its height from viewport-based CSS dynamically
  // SlideMain (other brands) will match this height
  // After height is locked, move nav dots outside slide wrapper to stay consistent
  useEffect(() => {
    let timeoutId = null;
    let isSyncing = false;

    const syncSlideHeights = () => {
      if (!firstSlideRef.current || isSyncing) return;
      
      // If we already have a stored height, just apply it - don't recalculate
      if (slideOneHeightRef.current) {
        const storedHeight = `${slideOneHeightRef.current}px`;
        const carousel = scrollContainerRef.current;
        if (carousel) {
          const allSlides = carousel.querySelectorAll('.case-study-slide-wrapper');
          allSlides.forEach((slide) => {
            slide.style.height = storedHeight;
            slide.style.minHeight = '0';
            slide.style.maxHeight = storedHeight;
          });
          carousel.style.height = storedHeight;
          carousel.style.minHeight = '0';
          carousel.style.maxHeight = storedHeight;
        }
        return;
      }
      
      // No stored height yet - need to calculate from SlideOne
      isSyncing = true;
      
      // Use requestAnimationFrame to avoid ResizeObserver loop issues
      requestAnimationFrame(() => {
        const firstSlide = firstSlideRef.current;
        if (!firstSlide) {
          isSyncing = false;
          return;
        }
        
        // Find the first slide content div - ONLY calculate height from .slide-one (SWA's SlideOne)
        // SlideMain should NOT calculate height - it should use the stored height from SlideOne
        const slideContent = firstSlide.querySelector('.slide-one');
        
        // Only calculate if we have SlideOne (SWA) - this is the initial load
        if (!slideContent) {
          // No SlideOne found - can't calculate yet, exit
          console.log('CaseStudy - Initial load: No .slide-one found yet, will retry');
          isSyncing = false;
          return;
        }
        
        // Check if we're actually on SWA (Small World Adventures) - only calculate height from SWA
        // If another brand is active, we should wait for SWA to load or use a fallback
        const isSWA = activeClient === 'SWA';
        if (!isSWA) {
          console.log('CaseStudy - Initial load: Not SWA, waiting for SWA to load before calculating height');
          isSyncing = false;
          return;
        }
        
        console.log('CaseStudy - Initial load: Found .slide-one for SWA, calculating height dynamically');
        
        // Check if video has loaded - wait for it if not
        const videoElement = slideContent.querySelector('video');
        const checkVideoAndCalculate = () => {
          // Validate video dimensions if video exists
          if (videoElement) {
            const videoHeight = videoElement.videoHeight || videoElement.offsetHeight || 0;
            const videoWidth = videoElement.videoWidth || videoElement.offsetWidth || 0;
            if (videoHeight === 0 && videoWidth === 0) {
              console.log('CaseStudy - Initial load: Video dimensions not ready, will retry');
              isSyncing = false;
              setTimeout(() => {
                syncSlideHeights();
              }, 500);
              return;
            }
          }
          
          // We have SlideOne - calculate height dynamically
          // Ensure slide content is using its natural height (auto) and no constraints
          slideContent.style.height = 'auto';
          slideContent.style.minHeight = '0';
          slideContent.style.maxHeight = 'none';
        
        // Force a reflow to ensure accurate measurement
          void slideContent.offsetHeight;
        
        // Get the actual content height using scrollHeight (most accurate for content)
        // scrollHeight gives the total height of content including padding
          const slideOneHeight = slideContent.scrollHeight;
          
          console.log('CaseStudy - Initial load: Calculated height from SlideOne:', slideOneHeight);
          
          // Validate height - don't store if it's 0 or too small (content not loaded yet)
          if (slideOneHeight <= 0 || slideOneHeight < 100) {
            console.log('CaseStudy - Initial load: Height is invalid (0 or too small), will retry');
            isSyncing = false;
            // Retry after a short delay
            setTimeout(() => {
              syncSlideHeights();
            }, 500);
            return;
          }
          
          // Store the height from SlideOne (SWA) - this will be used for all other slides (SlideMain)
          slideOneHeightRef.current = slideOneHeight;
          
          // Disconnect ResizeObserver - we have the height, no need to observe anymore
          resizeObserver.disconnect();
          console.log('CaseStudy - Initial load: Height stored and ResizeObserver disconnected');
          
          // Apply the calculated height
        firstSlide.style.height = `${slideOneHeight}px`;
        firstSlide.style.minHeight = '0';
        firstSlide.style.maxHeight = `${slideOneHeight}px`;
        
          // Keep slide content at auto height so it uses its natural size (no overflow)
          slideContent.style.height = 'auto';
        
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
        };
        
        // If video exists, wait for it to load before calculating
        if (videoElement) {
          if (videoElement.readyState >= 2) {
            // Video already has enough data loaded
            checkVideoAndCalculate();
          } else {
            // Wait for video to load
            const onVideoLoaded = () => {
              videoElement.removeEventListener('loadeddata', onVideoLoaded);
              requestAnimationFrame(() => {
                requestAnimationFrame(checkVideoAndCalculate);
              });
            };
            videoElement.addEventListener('loadeddata', onVideoLoaded);
            // Fallback timeout in case video never loads
            setTimeout(() => {
              videoElement.removeEventListener('loadeddata', onVideoLoaded);
              checkVideoAndCalculate();
            }, 3000);
          }
        } else {
          // No video, calculate immediately
          checkVideoAndCalculate();
      }
      
        // Note: All height calculation and application happens inside checkVideoAndCalculate
        // No code should execute after this point in this function
      });
    };

    // Debounced resize handler
    const handleResize = () => {
      // If we have stored height, just apply it - don't recalculate
      if (slideOneHeightRef.current) {
        syncSlideHeights(); // This will just apply stored height now
        return;
      }
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(syncSlideHeights, 100);
    };

    // Wait for initial render, then sync
    // Use a retry mechanism to ensure SlideOne is fully rendered before calculating
    const tryInitialSync = (attempt = 0) => {
      if (slideOneHeightRef.current) return; // Already calculated
      
      if (firstSlideRef.current) {
        const slideContent = firstSlideRef.current.querySelector('.slide-one');
        if (slideContent) {
          // SlideOne is ready, calculate height
          syncSlideHeights();
          return;
        }
      }
      
      // If not ready yet and we haven't tried too many times, retry
      if (attempt < 10) {
        setTimeout(() => tryInitialSync(attempt + 1), 50);
      }
    };
    
    const initialTimeoutId = setTimeout(() => {
      tryInitialSync();
    }, 100);
    
    // Sync on window resize (viewport changes)
    window.addEventListener('resize', handleResize);
    
    // Watch for changes in slide-one div that might affect height
    const resizeObserver = new ResizeObserver((entries) => {
      // Suppress ResizeObserver loop errors
      // If we already have stored height, don't recalculate
      if (entries.length > 0 && !slideOneHeightRef.current) {
        syncSlideHeights();
      }
    });
    
    // Wait a bit for slide content to render, then observe it
    // Only observe if we don't have stored height yet (initial load with SlideOne)
    const observeTimeout = setTimeout(() => {
      if (firstSlideRef.current && !slideOneHeightRef.current) {
        const slideContent = firstSlideRef.current.querySelector('.slide-one');
        if (slideContent) {
          resizeObserver.observe(slideContent);
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

  // Trackpad wheel event listener (needs passive: false to allow preventDefault)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Add wheel listener with passive: false so we can preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Don't render if no active client or no slides
  if (!activeClient || totalSlides === 0) {
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slideConfig, index) => {
          const SlideComponent = slideConfig.component;
          const isFirstSlide = index === 0;
          
          // Determine preload strategy (optimized to not compete with main video):
          // - Current slide: preload="metadata" (light preload, will load more when needed)
          // - Adjacent slides: preload="none" (don't preload until user navigates)
          // - Other slides: preload="none" (don't preload)
          let preloadValue = 'none';
          if (index === currentSlide) {
            preloadValue = 'metadata'; // Current slide - metadata only (lighter than auto)
          }
          // Adjacent slides also use 'none' to reduce bandwidth competition
          
          return (
              <div
                key={index}
              ref={isFirstSlide ? firstSlideRef : null}
              className="case-study-slide-wrapper"
            >
              <SlideComponent {...slideConfig.props} preload={preloadValue} />
              {/* Navigation dots - always show, even for single slide */}
          <div className="case-study-nav-dots">
                {Array.from({ length: totalSlides }).map((_, dotIndex) => (
              <div
                    key={dotIndex}
                className={`case-study-dot-wrapper`}
                    onClick={() => goToSlide(dotIndex)}
              >
                <div
                      className={`case-study-dot ${dotIndex === currentSlide && totalSlides > 1 ? 'active' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseStudy;

