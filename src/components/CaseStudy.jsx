import React, { useRef, useState, useEffect } from 'react';
import { getCaseStudyForClient } from '../config/caseStudyConfig';

const CaseStudy = ({ activeClient }) => {
  const scrollContainerRef = useRef(null);
  const firstSlideRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const DRAG_THRESHOLD = 50; // Minimum pixels to trigger slide change
  const slideOneHeightRef = useRef(null); // Store the height from SlideOne (SWA) to apply to all slides

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

  // Reset to first slide when client changes and sync heights to match SlideOne
  useEffect(() => {
    setCurrentSlide(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    
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
          
          // Always hide nav dots inside slides when switching brands (they're replaced by outside nav dots)
          allSlides.forEach((slide) => {
            const dots = slide.querySelector('.case-study-nav-dots');
            if (dots) {
              dots.style.display = 'none';
            }
          });
        });
      });
    }
  }, [activeClient]);

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
        
        console.log('CaseStudy - Initial load: Found .slide-one, calculating height dynamically');
        
        // Check if video has loaded - wait for it if not
        const videoElement = slideContent.querySelector('video');
        const checkVideoAndCalculate = () => {
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

    const moveNavDotsOutside = (allSlides) => {
      const carousel = scrollContainerRef.current;
      if (!carousel) return;

      // Check if nav dots are already outside (to avoid moving multiple times)
      const navDotsOutside = carousel.parentElement?.querySelector('.case-study-nav-dots-outside');
      if (navDotsOutside) {
        return; // Already moved
      }

      // Find the nav dots in the first slide
      const firstSlide = firstSlideRef.current;
      const navDotsInSlide = firstSlide?.querySelector('.case-study-nav-dots');
      
      if (!navDotsInSlide) return;

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
      
      // Hide nav dots inside slides with CSS instead of removing them (don't break React)
      if (allSlides) {
        allSlides.forEach((slide) => {
          const dots = slide.querySelector('.case-study-nav-dots');
          if (dots) {
            dots.style.display = 'none'; // Hide instead of remove
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
          
          // Determine preload strategy:
          // - Current slide: preload="auto" (full preload for instant playback)
          // - Adjacent slides: preload="metadata" (light preload for quick start)
          // - Other slides: preload="none" (don't preload)
          let preloadValue = 'none';
          if (index === currentSlide) {
            preloadValue = 'auto'; // Current slide - full preload
          } else if (index === currentSlide + 1 || index === currentSlide - 1) {
            preloadValue = 'metadata'; // Adjacent slides - metadata only
          }
          
          return (
            <div 
              key={index}
              ref={isFirstSlide ? firstSlideRef : null}
              className="case-study-slide-wrapper"
            >
              <SlideComponent {...slideConfig.props} preload={preloadValue} />
              {/* Navigation dots */}
              <div className="case-study-nav-dots">
                {Array.from({ length: totalSlides }).map((_, dotIndex) => (
                  <div
                    key={dotIndex}
                    className={`case-study-dot-wrapper`}
                    onClick={() => goToSlide(dotIndex)}
                  >
                    <div
                      className={`case-study-dot ${dotIndex === currentSlide ? 'active' : ''}`}
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

