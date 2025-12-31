import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { getCaseStudyForClient, getClientNames } from '../config/caseStudyConfig';

const CaseStudyV2 = ({ activeClient, onShiftBrand }) => {
  const scrollContainerRef = useRef(null);
  const firstSlideRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragDistanceRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isResettingRef = useRef(false);
  const DRAG_THRESHOLD = 50;
  const slideOneHeightRef = useRef(null);
  const touchStartRef = useRef({ x: 0, scrollLeft: 0 });
  const lastScrollLeftRef = useRef(0);
  const lastBrandUpdateRef = useRef(null);
  const lastBrandTransitionDirectionRef = useRef(null);
  const isTrackpadSwipeRef = useRef(false); // Track if current scroll is from trackpad

  // Get ordered list of all client names
  const allClientNames = useMemo(() => getClientNames(), []);
  
  // Build a single continuous array of ALL slides from ALL brands in order
  // Each slide knows which brand it belongs to and its position within that brand
  const { allSlides, brandBoundaries } = useMemo(() => {
    const slides = [];
    const boundaries = {}; // Track where each brand starts/ends: { brandName: { start: 0, end: 2 } }
    
    allClientNames.forEach((brandName) => {
      const brandData = getCaseStudyForClient(brandName);
      if (!brandData || !brandData.slides) return;
      
      const startIndex = slides.length;
      
      brandData.slides.forEach((slide, slideIndex) => {
        slides.push({
          ...slide,
          brandName,
          slideIndex, // Index within the brand
          absoluteIndex: slides.length, // Index in the full array
          isFirstSlideOfBrand: slideIndex === 0,
          isLastSlideOfBrand: slideIndex === brandData.slides.length - 1
        });
      });
      
      const endIndex = slides.length - 1;
      boundaries[brandName] = {
        start: startIndex,
        end: endIndex,
        slideCount: brandData.slides.length
      };
    });
    
    return { allSlides: slides, brandBoundaries: boundaries };
  }, [allClientNames]);
  
  // Find current brand's boundaries
  const currentBrandBoundary = activeClient ? brandBoundaries[activeClient] : null;
  const currentBrandSlideCount = currentBrandBoundary?.slideCount || 0;
  const totalSlides = allSlides.length;
  
  // Find which brand and slide we're currently on based on absolute slide index
  const getBrandAndSlideFromAbsoluteIndex = (absoluteIndex) => {
    if (absoluteIndex < 0 || absoluteIndex >= allSlides.length) return null;
    const slide = allSlides[absoluteIndex];
    return {
      brandName: slide.brandName,
      slideIndex: slide.slideIndex,
      absoluteIndex
    };
  };

  // Snap to nearest slide and update brand if needed (like original CaseStudy.jsx)
  const snapToSlide = () => {
    const container = scrollContainerRef.current;
    if (!container || isScrollingRef.current || isResettingRef.current || isDragging) return;

    const { scrollLeft, clientWidth } = container;
    if (clientWidth === 0) return;
    
    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth);
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, absoluteSlideIndex));
    const targetScroll = clampedIndex * clientWidth;
    const slideInfo = getBrandAndSlideFromAbsoluteIndex(clampedIndex);

    if (!slideInfo) return;

    // Check if we need to update brand (only after scrolling stops)
    if (slideInfo.brandName !== activeClient && onShiftBrand) {
      const currentBrandIndex = allClientNames.indexOf(activeClient);
      const newBrandIndex = allClientNames.indexOf(slideInfo.brandName);
      
      if (currentBrandIndex !== -1 && newBrandIndex !== -1) {
        // Determine direction (handle wrap-around)
        let direction;
        if (newBrandIndex > currentBrandIndex || (newBrandIndex === 0 && currentBrandIndex === allClientNames.length - 1)) {
          direction = 'right';
        } else {
          direction = 'left';
        }
        
        // Store direction for reset logic
        lastBrandTransitionDirectionRef.current = direction;
        
        // Update brand - this will trigger reset via useLayoutEffect
        onShiftBrand(direction);
        return; // Don't snap, let the reset handle positioning
      }
    }

    // Only snap if we're significantly off (like original)
    if (Math.abs(scrollLeft - targetScroll) > 5) {
      container.style.scrollBehavior = 'smooth';
      container.scrollLeft = targetScroll;
      lastScrollLeftRef.current = targetScroll;
      
      // Update current slide and nav dots
      if (currentBrandBoundary && clampedIndex >= currentBrandBoundary.start && clampedIndex <= currentBrandBoundary.end) {
        const relativeSlideIndex = clampedIndex - currentBrandBoundary.start;
        setCurrentSlide(relativeSlideIndex);
        updateNavDotsOutside(relativeSlideIndex);
      }
    }
  };

  // Check and update brand if needed (called after scrolling stops)
  const checkAndUpdateBrand = () => {
    const container = scrollContainerRef.current;
    if (!container || isResettingRef.current || isDragging) return;

    const { scrollLeft, clientWidth } = container;
    if (clientWidth === 0) return;
    
    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth);
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, absoluteSlideIndex));
    const slideInfo = getBrandAndSlideFromAbsoluteIndex(clampedIndex);

    if (!slideInfo) return;

    // Check if we need to update brand (only after scrolling stops)
    if (slideInfo.brandName !== activeClient && onShiftBrand) {
      const currentBrandIndex = allClientNames.indexOf(activeClient);
      const newBrandIndex = allClientNames.indexOf(slideInfo.brandName);
      
      if (currentBrandIndex !== -1 && newBrandIndex !== -1) {
        // Determine direction (handle wrap-around)
        let direction;
        if (newBrandIndex > currentBrandIndex || (newBrandIndex === 0 && currentBrandIndex === allClientNames.length - 1)) {
          direction = 'right';
        } else {
          direction = 'left';
        }
        
        // Store direction for reset logic
        lastBrandTransitionDirectionRef.current = direction;
        
        // Update brand - this will trigger reset via useLayoutEffect
        onShiftBrand(direction);
      }
    }
  };

  // Handle scroll to detect current slide (exactly like original - simple and smooth)
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isResettingRef.current) return;

    isScrollingRef.current = true;

    const { scrollLeft, clientWidth } = container;
    if (clientWidth === 0) return;
    
    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth);
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, absoluteSlideIndex));
    const slideInfo = getBrandAndSlideFromAbsoluteIndex(clampedIndex);
    
    // Check for brand change immediately (like click swipes) - no debounce for instant feedback
    if (slideInfo && slideInfo.brandName !== activeClient && onShiftBrand && !isDragging) {
      // Only check if we're clearly in the new brand's territory (not just passing through)
      const newBrandBoundary = brandBoundaries[slideInfo.brandName];
      if (newBrandBoundary && clampedIndex >= newBrandBoundary.start && clampedIndex <= newBrandBoundary.end) {
        // Prevent rapid-fire updates - only update if this is a different brand than last update
        const brandKey = slideInfo.brandName;
        if (lastBrandUpdateRef.current !== brandKey) {
          lastBrandUpdateRef.current = brandKey;
          
          // Update brand immediately (like click swipes do in handleMouseUp)
          const currentBrandIndex = allClientNames.indexOf(activeClient);
          const newBrandIndex = allClientNames.indexOf(slideInfo.brandName);
          
          if (currentBrandIndex !== -1 && newBrandIndex !== -1) {
            // Determine direction (handle wrap-around)
            // newBrandIndex > currentBrandIndex means moving forward in list (right direction)
            // newBrandIndex < currentBrandIndex means moving backward in list (left direction)
            let direction;
            if (newBrandIndex > currentBrandIndex || (newBrandIndex === 0 && currentBrandIndex === allClientNames.length - 1)) {
              direction = 'right';
            } else {
              direction = 'left';
            }
            
            // Store direction for reset logic BEFORE calling onShiftBrand
            lastBrandTransitionDirectionRef.current = direction;
            
            // Mark as resetting IMMEDIATELY to prevent any further scroll processing
            isResettingRef.current = true;
            
            // Update brand - useLayoutEffect will handle the transition and stop momentum
            onShiftBrand(direction);
            
            // Return early to prevent further scroll processing during reset
            return;
          }
        }
      }
    }
    
    // Update current slide (relative to current brand) - always update for smooth feedback
    if (currentBrandBoundary && clampedIndex >= currentBrandBoundary.start && clampedIndex <= currentBrandBoundary.end) {
      const relativeSlideIndex = clampedIndex - currentBrandBoundary.start;
      setCurrentSlide(relativeSlideIndex);
      updateNavDotsOutside(relativeSlideIndex);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mark scrolling as stopped after a delay
    // Don't call snapToSlide during brand transitions - let the reset handle it
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      // Only snap if we're not resetting (brand transition in progress)
      if (!isResettingRef.current) {
        snapToSlide();
      }
    }, 150);
  };
  
  const updateNavDotsOutside = (activeIndex) => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;
    
    const navDotsOutside = carousel.parentElement?.querySelector('.case-study-nav-dots-outside');
    if (!navDotsOutside) return;
    
    const dots = navDotsOutside.querySelectorAll('.case-study-dot');
    dots.forEach((dot, index) => {
      if (index === activeIndex && currentBrandSlideCount > 1) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  // Handle wheel events for two-finger swipe (trackpad) - let native scrolling handle it
  // The original CaseStudy doesn't handle wheel events - CSS scroll-snap handles everything
  const handleWheel = (e) => {
    // Only track that scrolling is happening - don't interfere with native behavior
    const isTwoFingerSwipe = e.ctrlKey || e.deltaMode === 1;
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    
    if (isTwoFingerSwipe || isHorizontalScroll) {
      // Mark that this is a trackpad swipe
      isTrackpadSwipeRef.current = true;
      
      // If we're resetting (brand transition in progress), just ignore wheel events
      // Can't preventDefault because React uses passive listeners, but we can skip processing
      if (isResettingRef.current) {
        return;
      }
      
      // Just mark that we're scrolling - let native scroll + CSS scroll-snap do the work
      isScrollingRef.current = true;
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Mark scrolling as stopped after a delay
      // Brand detection happens in handleScroll which fires naturally from wheel events
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        // Reset trackpad flag after scrolling stops
        isTrackpadSwipeRef.current = false;
      }, 150);
      
      // Don't preventDefault - let the browser handle it naturally
      // The scroll event will fire naturally and handleScroll will detect brand changes immediately
    }
  };

  // Mouse drag handlers for desktop (exactly like original)
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
      const { scrollLeft, clientWidth } = container;
      if (clientWidth === 0) {
        setIsDragging(false);
        dragDistanceRef.current = 0;
        return;
      }
      
      const absoluteSlideIndex = Math.round(scrollLeft / clientWidth);
      const clampedIndex = Math.max(0, Math.min(totalSlides - 1, absoluteSlideIndex));
      const slideInfo = getBrandAndSlideFromAbsoluteIndex(clampedIndex);
      
      if (dragDistanceRef.current > 0) {
        // Dragged right - go to previous slide
        if (currentBrandBoundary && clampedIndex <= currentBrandBoundary.start && currentSlide === 0) {
          // At first slide of current brand, shift to previous brand
          if (onShiftBrand) {
            // Store direction for reset logic (left = previous brand, go to last slide)
            lastBrandTransitionDirectionRef.current = 'left';
            onShiftBrand('left');
          }
        } else {
          const prevIndex = Math.max(0, clampedIndex - 1);
          goToAbsoluteSlide(prevIndex);
        }
      } else {
        // Dragged left - go to next slide
        if (currentBrandBoundary && clampedIndex >= currentBrandBoundary.end && currentSlide === currentBrandSlideCount - 1) {
          // At last slide of current brand, shift to next brand
          if (onShiftBrand) {
            // Store direction for reset logic (right = next brand, go to first slide)
            lastBrandTransitionDirectionRef.current = 'right';
            onShiftBrand('right');
          }
        } else {
          const nextIndex = Math.min(totalSlides - 1, clampedIndex + 1);
          goToAbsoluteSlide(nextIndex);
        }
      }
    } else {
      // Small drag, snap to current slide (like original)
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

  // Touch event handlers for mobile (exactly like original)
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
      if (clientWidth === 0) {
        touchStartRef.current = { x: 0, scrollLeft: 0 };
        return;
      }
      
      const absoluteSlideIndex = Math.round(scrollLeft / clientWidth);
      const clampedIndex = Math.max(0, Math.min(totalSlides - 1, absoluteSlideIndex));
      
      // If significant swipe detected
      if (Math.abs(touchDeltaX) > DRAG_THRESHOLD) {
        if (touchDeltaX > 0) {
          // Swiped left - trying to go to next slide
          if (currentBrandBoundary && clampedIndex >= currentBrandBoundary.end && currentSlide === currentBrandSlideCount - 1) {
            // At last slide, shift to next brand
            if (onShiftBrand) {
              onShiftBrand('right');
              touchStartRef.current = { x: 0, scrollLeft: 0 };
              return;
            }
          } else {
            const nextIndex = Math.min(totalSlides - 1, clampedIndex + 1);
            goToAbsoluteSlide(nextIndex);
            touchStartRef.current = { x: 0, scrollLeft: 0 };
            return;
          }
        } else {
          // Swiped right - trying to go to previous slide
          if (currentBrandBoundary && clampedIndex <= currentBrandBoundary.start && currentSlide === 0) {
            // At first slide, shift to previous brand
            if (onShiftBrand) {
              onShiftBrand('left');
              touchStartRef.current = { x: 0, scrollLeft: 0 };
              return;
            }
          } else {
            const prevIndex = Math.max(0, clampedIndex - 1);
            goToAbsoluteSlide(prevIndex);
            touchStartRef.current = { x: 0, scrollLeft: 0 };
            return;
          }
        }
      }
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      snapToSlide();
      touchStartRef.current = { x: 0, scrollLeft: 0 };
    }, 150);
  };

  // Navigate to absolute slide index (across all brands)
  const goToAbsoluteSlide = (absoluteIndex) => {
    const container = scrollContainerRef.current;
    if (!container || isResettingRef.current) return;

    const { clientWidth } = container;
    if (clientWidth === 0) return;
    
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, absoluteIndex));
    const targetScroll = clampedIndex * clientWidth;

    container.style.scrollBehavior = 'smooth';
    container.scrollLeft = targetScroll;
    lastScrollLeftRef.current = targetScroll;
  };

  // Navigate to specific slide (relative to current brand)
  const goToSlide = (slideIndex) => {
    if (!currentBrandBoundary) return;
    
    const clampedSlideIndex = Math.max(0, Math.min(currentBrandSlideCount - 1, slideIndex));
    const absoluteIndex = currentBrandBoundary.start + clampedSlideIndex;
    goToAbsoluteSlide(absoluteIndex);
  };

  // Function to move nav dots outside slide wrapper
  const moveNavDotsOutside = (allSlideElements) => {
    const carousel = scrollContainerRef.current;
    if (!carousel) return;

    const parentElement = carousel.parentElement;
    if (!parentElement) return;

    const existingNavDotsOutside = parentElement.querySelector('.case-study-nav-dots-outside');
    
    if (existingNavDotsOutside) {
      const existingDots = existingNavDotsOutside.querySelectorAll('.case-study-dot-wrapper');
      if (existingDots.length === currentBrandSlideCount) {
        const activeSlideIndex = 0;
        existingDots.forEach((wrapper, index) => {
          const dot = wrapper.querySelector('.case-study-dot');
          if (dot) {
            if (index === activeSlideIndex && currentBrandSlideCount > 1) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          }
        });
        
        if (allSlideElements) {
          allSlideElements.forEach((slide) => {
            const dots = slide.querySelector('.case-study-nav-dots');
            if (dots) {
              dots.style.display = 'none';
            }
          });
        }
        return;
      }
    }

    const navDotsContainer = document.createElement('div');
    navDotsContainer.className = 'case-study-nav-dots case-study-nav-dots-outside';
    
    for (let i = 0; i < currentBrandSlideCount; i++) {
      const dotWrapper = document.createElement('div');
      dotWrapper.className = 'case-study-dot-wrapper';
      dotWrapper.addEventListener('click', () => {
        goToSlide(i);
      });
      
      const dot = document.createElement('div');
      const isActive = i === 0 && currentBrandSlideCount > 1;
      dot.className = `case-study-dot ${isActive ? 'active' : ''}`;
      
      dotWrapper.appendChild(dot);
      navDotsContainer.appendChild(dotWrapper);
    }
    
    if (allSlideElements) {
      allSlideElements.forEach((slide) => {
        const dots = slide.querySelector('.case-study-nav-dots');
        if (dots) {
          dots.style.display = 'none';
        }
      });
    }
    
    if (existingNavDotsOutside) {
      existingNavDotsOutside.replaceWith(navDotsContainer);
    } else {
      parentElement.appendChild(navDotsContainer);
    }
    
    updateNavDotsOutside(0);
  };

  // Reset to first or last slide of current brand when client changes (based on direction)
  useLayoutEffect(() => {
    // Reset brand update tracking when brand changes
    lastBrandUpdateRef.current = activeClient;
    
    const carousel = scrollContainerRef.current;
    if (!carousel || !currentBrandBoundary) {
      setCurrentSlide(0);
      lastScrollLeftRef.current = 0;
      return;
    }
    
    // Set resetting flag IMMEDIATELY to prevent handleScroll from interfering
    isResettingRef.current = true;
    
    // Determine target slide based on transition direction
    // Left direction (previous brand) = go to last slide
    // Right direction (next brand) = go to first slide
    // Default to first slide if direction not set (initial load)
    const direction = lastBrandTransitionDirectionRef.current;
    let targetSlideIndex;
    let relativeSlideIndex;
    
    if (direction === 'left') {
      // Going to previous brand - go to last slide
      targetSlideIndex = currentBrandBoundary.end;
      relativeSlideIndex = currentBrandSlideCount - 1;
    } else {
      // Going to next brand (or initial load) - go to first slide
      targetSlideIndex = currentBrandBoundary.start;
      relativeSlideIndex = 0;
    }
    
    setCurrentSlide(relativeSlideIndex);
    
    const targetScroll = targetSlideIndex * carousel.clientWidth;
    
    // Instant reset for ALL brand transitions (both click and trackpad) - no smooth scroll
    // This prevents glitches and matches the original CaseStudy behavior
    carousel.style.scrollBehavior = 'auto';
    carousel.scrollLeft = targetScroll;
    lastScrollLeftRef.current = targetScroll;
    void carousel.offsetHeight; // Force layout
    
    // Update nav dots immediately
    const navDotsOutside = carousel?.parentElement?.querySelector('.case-study-nav-dots-outside');
    if (navDotsOutside) {
      updateNavDotsOutside(relativeSlideIndex);
    }
    
    // Allow scroll events again after transition
    const resetTimeout = setTimeout(() => {
      isResettingRef.current = false;
    }, 200);
    
    return () => {
      clearTimeout(resetTimeout);
    };
  }, [activeClient, currentBrandBoundary, currentBrandSlideCount]);
  
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Sync heights and recreate nav dots when client changes
  useEffect(() => {
    const recreateNavDots = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const carousel = scrollContainerRef.current;
          if (!carousel) return;
          
          const allSlideElements = carousel.querySelectorAll('.case-study-slide-wrapper');
          
          allSlideElements.forEach((slide) => {
            const dots = slide.querySelector('.case-study-nav-dots');
            if (dots) {
              dots.style.display = 'none';
            }
          });
          
          setTimeout(() => {
            if (allSlideElements.length > 0) {
              moveNavDotsOutside(allSlideElements);
            }
          }, 50);
        });
      });
    };
    
    if (slideOneHeightRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const carousel = scrollContainerRef.current;
          if (!carousel) return;
          
          const heightValue = `${slideOneHeightRef.current}px`;
          const allSlideElements = carousel.querySelectorAll('.case-study-slide-wrapper');
          
          allSlideElements.forEach((slide) => {
            slide.style.height = heightValue;
            slide.style.minHeight = '0';
            slide.style.maxHeight = heightValue;
            slide.style.padding = '0';
            slide.style.margin = '0';
          });
          
          carousel.style.height = heightValue;
          carousel.style.minHeight = '0';
          carousel.style.maxHeight = heightValue;
          
          recreateNavDots();
        });
      });
    } else {
      recreateNavDots();
    }
  }, [activeClient, currentBrandSlideCount, currentBrandBoundary]);

  // Sync all slide heights to match SlideOne's (SWA) rendered height
  useEffect(() => {
    let timeoutId = null;
    let isSyncing = false;

    const syncSlideHeights = () => {
      if (!firstSlideRef.current || isSyncing) return;
      
      if (slideOneHeightRef.current) {
        const storedHeight = `${slideOneHeightRef.current}px`;
        const carousel = scrollContainerRef.current;
        if (carousel) {
          const allSlideElements = carousel.querySelectorAll('.case-study-slide-wrapper');
          allSlideElements.forEach((slide) => {
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
      
      isSyncing = true;
      
      requestAnimationFrame(() => {
        const firstSlide = firstSlideRef.current;
        if (!firstSlide) {
          isSyncing = false;
          return;
        }
        
        const slideContent = firstSlide.querySelector('.slide-one');
        
        if (!slideContent) {
          console.log('CaseStudyV2 - Initial load: No .slide-one found yet, will retry');
          isSyncing = false;
          return;
        }
        
        const isSWA = activeClient === 'SWA';
        if (!isSWA) {
          console.log('CaseStudyV2 - Initial load: Not SWA, waiting for SWA to load before calculating height');
          isSyncing = false;
          return;
        }
        
        console.log('CaseStudyV2 - Initial load: Found .slide-one for SWA, calculating height dynamically');
        
        const videoElement = slideContent.querySelector('video');
        const checkVideoAndCalculate = () => {
          if (videoElement) {
            const videoHeight = videoElement.videoHeight || videoElement.offsetHeight || 0;
            const videoWidth = videoElement.videoWidth || videoElement.offsetWidth || 0;
            if (videoHeight === 0 && videoWidth === 0) {
              console.log('CaseStudyV2 - Initial load: Video dimensions not ready, will retry');
              isSyncing = false;
              setTimeout(() => {
                syncSlideHeights();
              }, 500);
              return;
            }
          }
          
          slideContent.style.height = 'auto';
          slideContent.style.minHeight = '0';
          slideContent.style.maxHeight = 'none';
        
          void slideContent.offsetHeight;
        
          const slideOneHeight = slideContent.scrollHeight;
          
          console.log('CaseStudyV2 - Initial load: Calculated height from SlideOne:', slideOneHeight);
          
          if (slideOneHeight <= 0 || slideOneHeight < 100) {
            console.log('CaseStudyV2 - Initial load: Height is invalid (0 or too small), will retry');
            isSyncing = false;
            setTimeout(() => {
              syncSlideHeights();
            }, 500);
            return;
          }
          
          slideOneHeightRef.current = slideOneHeight;
          
          resizeObserver.disconnect();
          console.log('CaseStudyV2 - Initial load: Height stored and ResizeObserver disconnected');
          
        firstSlide.style.height = `${slideOneHeight}px`;
        firstSlide.style.minHeight = '0';
        firstSlide.style.maxHeight = `${slideOneHeight}px`;
        
          slideContent.style.height = 'auto';
        
        firstSlide.style.padding = '0';
        firstSlide.style.margin = '0';
        firstSlide.style.border = 'none';
        
        const carousel = firstSlide.parentElement;
        if (carousel) {
          carousel.style.height = `${slideOneHeight}px`;
          carousel.style.minHeight = '0';
          carousel.style.maxHeight = `${slideOneHeight}px`;
          carousel.style.padding = '0';
          carousel.style.margin = '0';
        }
        
        const allSlideElements = firstSlide.parentElement?.querySelectorAll('.case-study-slide-wrapper');
        if (allSlideElements) {
          allSlideElements.forEach((slide) => {
            if (slide !== firstSlide) {
              slide.style.height = `${slideOneHeight}px`;
            }
            slide.style.padding = '0';
            slide.style.margin = '0';
          });
        }
        
        moveNavDotsOutside(allSlideElements);
        
        isSyncing = false;
        };
        
        if (videoElement) {
          if (videoElement.readyState >= 2) {
            checkVideoAndCalculate();
          } else {
            const onVideoLoaded = () => {
              videoElement.removeEventListener('loadeddata', onVideoLoaded);
              requestAnimationFrame(() => {
                requestAnimationFrame(checkVideoAndCalculate);
              });
            };
            videoElement.addEventListener('loadeddata', onVideoLoaded);
            setTimeout(() => {
              videoElement.removeEventListener('loadeddata', onVideoLoaded);
              checkVideoAndCalculate();
            }, 3000);
          }
        } else {
          checkVideoAndCalculate();
      }
      });
    };

    const handleResize = () => {
      if (slideOneHeightRef.current) {
        syncSlideHeights();
        return;
      }
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(syncSlideHeights, 100);
    };

    const tryInitialSync = (attempt = 0) => {
      if (slideOneHeightRef.current) return;
      
      if (firstSlideRef.current) {
        const slideContent = firstSlideRef.current.querySelector('.slide-one');
        if (slideContent) {
          syncSlideHeights();
          return;
        }
      }
      
      if (attempt < 10) {
        setTimeout(() => tryInitialSync(attempt + 1), 50);
      }
    };
    
    const initialTimeoutId = setTimeout(() => {
      tryInitialSync();
    }, 100);
    
    window.addEventListener('resize', handleResize);
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && !slideOneHeightRef.current) {
        syncSlideHeights();
      }
    });
    
    const observeTimeout = setTimeout(() => {
      if (firstSlideRef.current && !slideOneHeightRef.current) {
        const slideContent = firstSlideRef.current.querySelector('.slide-one');
        if (slideContent) {
          resizeObserver.observe(slideContent);
        }
      }
    }, 100);

    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message.includes('ResizeObserver loop')) {
        return true;
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
      
      // Allow visual feedback during drag (exactly like original)
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
  if (!activeClient || totalSlides === 0 || !currentBrandBoundary) {
    return null;
  }

  return (
    <div className="cinestoke-section case-study-section">
      <div
        ref={scrollContainerRef}
        className="case-study-carousel"
        onScroll={handleScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {allSlides.map((slideConfig, absoluteIndex) => {
          const SlideComponent = slideConfig.component;
          const isFirstSlide = absoluteIndex === currentBrandBoundary.start && slideConfig.isFirstSlideOfBrand;
          
          // Preload strategy: current slide gets metadata, others get none
          let preloadValue = 'none';
          if (currentBrandBoundary && absoluteIndex >= currentBrandBoundary.start && absoluteIndex <= currentBrandBoundary.end) {
            const relativeIndex = absoluteIndex - currentBrandBoundary.start;
            if (relativeIndex === currentSlide) {
              preloadValue = 'metadata';
            }
          }
          
          return (
            <div
              key={`${slideConfig.brandName}-${slideConfig.slideIndex}-${absoluteIndex}`}
              ref={isFirstSlide ? firstSlideRef : null}
              className="case-study-slide-wrapper"
            >
              <SlideComponent {...slideConfig.props} preload={preloadValue} />
              {/* Navigation dots - only show for current brand slides */}
              {slideConfig.brandName === activeClient && (
                <div className="case-study-nav-dots">
                  {Array.from({ length: currentBrandSlideCount }).map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={`case-study-dot-wrapper`}
                      onClick={() => goToSlide(dotIndex)}
                    >
                      <div
                        className={`case-study-dot ${dotIndex === currentSlide && currentBrandSlideCount > 1 ? 'active' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseStudyV2;
