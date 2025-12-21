import React, { useRef, useEffect, useState } from 'react';

//////PHOTOS ARE 6.6 X 16 aspect ration, 2367 X 5738 resolution, and around 100KBs.////////
import moto from '../assets/cinestoke-moto.webp'; 
import dirtbike from '../assets/cinestoke-dirt-bike.webp'; 
import fishing from '../assets/cinestoke-fishing.webp'; //
import redwoods from '../assets/cinestoke-redwoods.webp'; 
import automotive from '../assets/cinestoke-auto.webp'; 

import drone from '../assets/cinestoke-drone-shot.webp'; 
import FPV from '../assets/cinestoke-FPV.webp'; 
import weddings from '../assets/cinestoke-weddings.webp'; //
import portraits from '../assets/cinestoke-portraits.webp'; //
import nature from '../assets/cinestoke-nature.webp'; 

import boxing from '../assets/cinestoke-boxing.webp'; //
import smallbusiness from '../assets/cinestoke-small-business.webp'; //
import sports from '../assets/cinestoke-sports.webp'; //
import realestate from '../assets/cinestoke-real-estate.webp'; //
import snowboard from '../assets/cinestoke-snowboard.webp'; 

import landscape from '../assets/cinestoke-landscape.webp'; //
import jetski from '../assets/cinestoke-jet-ski.webp'; 
import rollers from '../assets/cinestoke-rollers.webp'; 
import kayak from '../assets/cinestoke-kayak.webp'; 
import mtnbike from '../assets/cinestoke-mtn-bike.webp'; 

const Pics = () => {
  const scrollContainerRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const images = [
    { src: mtnbike, alt: "Mountain Bike Cinematic Production", label: "Mtn Biking" },
    { src: kayak, alt: "Kayak Cinematic Production", label: "Kayaking" },
    { src: redwoods, alt: "Redwoods Cinematic Production", label: "Nature" },
    { src: rollers, alt: "Rollers Cinematic Production", label: "Rollers" },
    { src: drone, alt: "Drone Cinematic Production", label: "Drone" },
    { src: FPV, alt: "FPV Cinematic Production", label: "FPV" },
    { src: automotive, alt: "Automotive Cinematic Production", label: "Automotive" },
    { src: dirtbike, alt: "Dirtbike Cinematic Production", label: "Dirt Bikes" },
    { src: nature, alt: "Nature Cinematic Production", label: "Outdoors" },
    { src: snowboard, alt: "Snowboarding Cinematic Production", label: "Snowboarding" },
    { src: jetski, alt: "Jet Ski Cinematic Production", label: "Jet Ski" },
    { src: moto, alt: "Motorcycle Cinematic Production", label: "Motorcycles" },
  ];

  // Dynamic image list that grows as user scrolls
  // Start with images prepended so we can scroll left immediately
  const [displayedImages, setDisplayedImages] = useState([...images, ...images, ...images]);
  const [prependCount, setPrependCount] = useState(3); // Start with 3 sets prepended
  const scrollPositionRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const scrollAdjustmentRef = useRef({ needed: false, amount: 0, targetPosition: 0 }); // Track scroll adjustment needed after prepending
  const isAdjustingRef = useRef(false); // Prevent scroll handler from interfering during adjustment
  const hasInitializedRef = useRef(false); // Track if we've centered the drone on initial load
  
  // Drag state for mouse drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const lastMoveRef = useRef({ x: 0, time: 0 });
  const prevMoveRef = useRef({ x: 0, time: 0 });
  const momentumAnimationRef = useRef(null);

  // Handle carousel scroll events with dynamic image loading
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Skip if we're in the middle of adjusting scroll position
    if (isAdjustingRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrollRight = scrollLeft + clientWidth;
    const isScrollingRight = scrollLeft > scrollPositionRef.current;
    
    scrollPositionRef.current = scrollLeft;
    lastScrollLeftRef.current = scrollLeft;

    // Get actual slide width from DOM if available
    const firstSlide = container.querySelector('.swiper-slide');
    const slideWidth = firstSlide ? firstSlide.offsetWidth : scrollWidth / displayedImages.length;
    const gap = 0.5; // Gap between slides
    const slideWithGap = slideWidth + gap;
    const bufferDistance = slideWithGap * 3; // Add images when 3 slides away from edge

    // If scrolling right and near the end, add more images to the end
    if (isScrollingRight && scrollRight >= scrollWidth - bufferDistance) {
      setDisplayedImages(prev => [...prev, ...images]);
    }
    // If scrolling left and near the beginning, add more images to the start
    else if (!isScrollingRight && scrollLeft <= bufferDistance && prependCount < 20) {
      // Capture current scroll position BEFORE prepending
      const currentScrollLeft = scrollLeft;
      const imagesToPrepend = images;
      const addedWidth = slideWithGap * imagesToPrepend.length;
      
      // Set adjustment info
      scrollAdjustmentRef.current = {
        needed: true,
        amount: addedWidth,
        targetPosition: currentScrollLeft + addedWidth
      };
      
      // Prepend images
      setDisplayedImages(prev => [...imagesToPrepend, ...prev]);
      setPrependCount(prev => prev + 1);
    }

    // Analytics tracking
    if (!hasScrolled && window.dataLayer) {
      setHasScrolled(true);
      window.dataLayer.push({
        event: 'carousel_scroll',
        carousel_element: 'image_carousel'
      });
      
      // Reset after 2 seconds to allow for future scroll tracking
      setTimeout(() => {
        setHasScrolled(false);
      }, 2000);
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Cancel any existing momentum animation
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
      momentumAnimationRef.current = null;
    }
    
    const now = Date.now();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      scrollLeft: container.scrollLeft
    };
    lastMoveRef.current = { x: e.clientX, time: now };
    prevMoveRef.current = { x: e.clientX, time: now };
    
    // Prevent text selection while dragging
    e.preventDefault();
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  };

  // Simple momentum scrolling - just like touch
  const applyMomentum = (velocity) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let v = velocity * 0.95; // Simple friction
    
    const animate = () => {
      if (Math.abs(v) < 0.5) {
        container.style.scrollBehavior = 'smooth';
        momentumAnimationRef.current = null;
        return;
      }
      
      container.style.scrollBehavior = 'auto';
      container.scrollLeft -= v;
      scrollPositionRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
      
      v *= 0.95; // Friction
      momentumAnimationRef.current = requestAnimationFrame(animate);
    };
    
    momentumAnimationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Simple velocity from last movement (like touch)
    const timeDelta = lastMoveRef.current.time - prevMoveRef.current.time;
    const positionDelta = lastMoveRef.current.x - prevMoveRef.current.x;
    
    // Velocity in pixels per frame
    const velocity = timeDelta > 0 ? (positionDelta / timeDelta) * 16 : 0;
    
    // Apply momentum if there's velocity
    if (Math.abs(velocity) > 0.5) {
      applyMomentum(velocity);
    } else {
      container.style.scrollBehavior = 'smooth';
    }
    
    container.style.cursor = 'grab';
    container.style.userSelect = '';
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    // End drag if mouse leaves container
    if (isDragging) {
      handleMouseUp();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      scrollPositionRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
      
      // Track movement for velocity
      const now = Date.now();
      prevMoveRef.current = { ...lastMoveRef.current };
      lastMoveRef.current = { x: e.clientX, time: now };
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

  // Ref callback to center drone immediately when container mounts
  const setScrollContainerRef = (container) => {
    scrollContainerRef.current = container;
    
    if (!container || hasInitializedRef.current) return;
    
    // Set approximate scroll position immediately to prevent flash
    // Calculate based on known structure: middle set starts at images.length, drone is at index 4
    const middleStartIndex = images.length;
    const droneIndex = middleStartIndex + 4;
    
    // Estimate slide width based on viewport (matches CSS: calc(100vw / 8) with responsive overrides)
    let estimatedSlideWidth = window.innerWidth / 8;
    if (window.innerWidth <= 1024) estimatedSlideWidth = window.innerWidth / 20;
    if (window.innerWidth <= 768) estimatedSlideWidth = window.innerWidth / 25;
    if (window.innerWidth <= 640) estimatedSlideWidth = window.innerWidth / 30;
    if (window.innerWidth <= 480) estimatedSlideWidth = window.innerWidth / 35;
    if (window.innerWidth <= 375) estimatedSlideWidth = window.innerWidth / 40;
    if (window.innerWidth <= 320) estimatedSlideWidth = window.innerWidth / 45;
    
    const gap = 0.5;
    const slideWithGap = estimatedSlideWidth + gap;
    const estimatedDronePosition = droneIndex * slideWithGap;
    const estimatedScrollPosition = estimatedDronePosition + (estimatedSlideWidth / 2) - (container.clientWidth / 2);
    
    // Set immediately to prevent flash
    container.style.scrollBehavior = 'auto';
    container.scrollLeft = Math.max(0, estimatedScrollPosition);
    scrollPositionRef.current = container.scrollLeft;
    lastScrollLeftRef.current = container.scrollLeft;
    
      // Then refine with actual measurements using getBoundingClientRect for accuracy
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!container || hasInitializedRef.current) return;
          
          const slides = container.querySelectorAll('.swiper-slide');
          if (slides.length === 0) return;

          const droneSlide = slides[droneIndex];
          
          if (droneSlide) {
            // Use getBoundingClientRect for accurate positioning relative to viewport
            const containerRect = container.getBoundingClientRect();
            const droneRect = droneSlide.getBoundingClientRect();
            
            // Calculate the center of the drone slide relative to the container
            const droneCenterX = droneRect.left + (droneRect.width / 2) - containerRect.left;
            
            // Calculate the center of the container
            const containerCenterX = containerRect.width / 2;
            
            // Calculate how much we need to scroll to center the drone
            // Current scroll position + (drone center offset - container center)
            const exactScrollPosition = container.scrollLeft + (droneCenterX - containerCenterX);
            
            // Only update if significantly different to avoid micro-adjustments
            if (Math.abs(container.scrollLeft - exactScrollPosition) > 1) {
              container.style.scrollBehavior = 'auto';
              container.scrollLeft = Math.max(0, exactScrollPosition);
              scrollPositionRef.current = container.scrollLeft;
              lastScrollLeftRef.current = container.scrollLeft;
              
              // Final refinement pass for pixel-perfect centering
              requestAnimationFrame(() => {
                if (!container) return;
                const finalContainerRect = container.getBoundingClientRect();
                const finalDroneRect = droneSlide.getBoundingClientRect();
                const finalDroneCenterX = finalDroneRect.left + (finalDroneRect.width / 2) - finalContainerRect.left;
                const finalContainerCenterX = finalContainerRect.width / 2;
                const finalOffset = finalDroneCenterX - finalContainerCenterX;
                
                if (Math.abs(finalOffset) > 0.5) {
                  container.scrollLeft = container.scrollLeft + finalOffset;
                  scrollPositionRef.current = container.scrollLeft;
                  lastScrollLeftRef.current = container.scrollLeft;
                }
                
                // Mark as initialized and re-enable smooth scrolling
                hasInitializedRef.current = true;
                container.style.scrollBehavior = 'smooth';
              });
            } else {
              // Mark as initialized and re-enable smooth scrolling
              hasInitializedRef.current = true;
              container.style.scrollBehavior = 'smooth';
            }
          }
        });
      });
  };

  // Apply scroll adjustment after images are prepended
  useEffect(() => {
    if (scrollAdjustmentRef.current.needed) {
      const container = scrollContainerRef.current;
      if (container) {
        isAdjustingRef.current = true;
        
        // Wait for DOM to update, then adjust scroll position
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (container) {
              // Set scroll position to maintain visual position
              container.style.scrollBehavior = 'auto';
              container.scrollLeft = scrollAdjustmentRef.current.targetPosition;
              
              // Reset adjustment and re-enable smooth scrolling
              scrollAdjustmentRef.current = { needed: false, amount: 0, targetPosition: 0 };
              
              requestAnimationFrame(() => {
                container.style.scrollBehavior = 'smooth';
                isAdjustingRef.current = false;
              });
            }
          });
        });
      }
    }
  }, [displayedImages.length]);


  const getAspectRatio = () => {
    if (screenWidth <= 480) return '1.5 / 16';
    if (screenWidth <= 640) return '2 / 16';
    if (screenWidth <= 768) return '3 / 16';
    return '6.6 / 16';
  };

  return (
    <div className="carousel-container">
      <div 
        ref={setScrollContainerRef}
        className="carousel-scroll-container"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          gap: '0.5px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          willChange: 'scroll-position',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {displayedImages.map((image, index) => {
          // Create unique keys using index and image label to handle duplicates
          const key = `img-${index}-${image.label}`;
          
          return (
            <div 
              key={key} 
              className="swiper-slide"
              style={{
                flex: '0 0 auto',
                width: 'calc(100vw / 8)',
                minWidth: '80px',
                maxWidth: '200px'
              }}
            >
              <p>{image.label}</p>
              <img 
                src={image.src} 
                alt={image.alt}
                loading="lazy"
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: getAspectRatio(),
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .carousel-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .swiper-slide {
          text-align: center;
        }
        
        .swiper-slide p {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .swiper-slide img {
          transition: transform 0.3s ease;
        }
        
        .swiper-slide:hover img {
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .swiper-slide img {
            object-position: center;
            object-fit: cover;
            width: 100%;
            height: auto;
            aspect-ratio: 3 / 16;
          }
        }
        
        @media (max-width: 640px) {
          .swiper-slide img {
            object-position: center;
            object-fit: cover;
            width: 100%;
            height: auto;
            aspect-ratio: 2 / 16;
          }
        }
        
        @media (max-width: 480px) {
          .swiper-slide img {
            object-position: center;
            object-fit: cover;
            width: 100%;
            height: auto;
            aspect-ratio: 1.5 / 16;
            max-height: 300px;
          }
          
          .carousel-container {
            max-height: 400px;
          }
          
          .carousel-scroll-container {
            max-height: 350px;
          }
          
          .swiper-slide p {
            margin: 0 0 0.25rem 0;
            font-size: 0.7rem;
          }
        }
        
        @media (max-width: 1024px) {
          .swiper-slide {
            width: calc(100vw / 20) !important;
          }
        }
        
        @media (max-width: 768px) {
          .swiper-slide {
            width: calc(100vw / 25) !important;
          }
        }
        
        @media (max-width: 640px) {
          .swiper-slide {
            width: calc(100vw / 30) !important;
          }
        }
        
        @media (max-width: 480px) {
          .swiper-slide {
            width: calc(100vw / 35) !important;
          }
        }
        
        @media (max-width: 375px) {
          .swiper-slide {
            width: calc(100vw / 40) !important;
          }
        }
        
        @media (max-width: 320px) {
          .swiper-slide {
            width: calc(100vw / 45) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Pics;
