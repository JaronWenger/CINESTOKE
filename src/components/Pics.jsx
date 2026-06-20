import React, { useRef, useEffect, useState, useCallback } from 'react';

//////PHOTOS ARE 6.6 X 16 aspect ration, 2367 X 5738 resolution, and around 100KBs.////////
import moto from '../assets/cinestoke-moto.webp';
import dirtbike from '../assets/cinestoke-dirt-bike.webp';
import automotive from '../assets/cinestoke-auto.webp';

import drone from '../assets/cinestoke-drone-shot.webp';
import FPV from '../assets/cinestoke-FPV.webp';
import nature from '../assets/cinestoke-nature.webp';
import surf from '../assets/Surf.webp';

import realestate from '../assets/cinestoke-real-estate.webp';
import snowboard from '../assets/cinestoke-snowboard.webp';

import jetski from '../assets/cinestoke-jet-ski.webp';
import rollers from '../assets/cinestoke-rollers.webp';
import kayak from '../assets/cinestoke-kayak.webp';
import mtnbike from '../assets/cinestoke-mtn-bike.webp';

const IMAGES = [
  { src: mtnbike, alt: "Mountain Bike Cinematic Production", label: "Mtn Biking", youtubeId: '9aTVsDySZAg' },
  { src: surf, alt: "Surf Cinematic Production", label: "Surf", youtubeId: 'mtsroKGlRy0' },
  { src: kayak, alt: "Kayak Cinematic Production", label: "Kayaking", youtubeId: 'sEhpFnuSe5o' },
  { src: rollers, alt: "Rollers Cinematic Production", label: "Rollers" },
  { src: drone, alt: "Drone Cinematic Production", label: "Drone" },
  { src: FPV, alt: "FPV Cinematic Production", label: "FPV" },
  { src: automotive, alt: "Automotive Cinematic Production", label: "Automotive" },
  { src: dirtbike, alt: "Dirtbike Cinematic Production", label: "Dirt Bikes" },
  { src: nature, alt: "Nature Cinematic Production", label: "Outdoors", youtubeId: '4fiAeCwZKcI' },
  { src: snowboard, alt: "Snowboarding Cinematic Production", label: "Snow", youtubeId: 'H7DYKGW9oYc' },
  { src: jetski, alt: "Jet Ski Cinematic Production", label: "Jet Ski", youtubeId: 'Q7v0qqDOEL8' },
  { src: moto, alt: "Motorcycle Cinematic Production", label: "Motorcycles", youtubeId: 'YZC-6pU0dvM' },
];

// 21 sets = 252 fixed DOM nodes. Middle set (index 10) is the "home" zone.
// On the smallest phones each set is ~960px wide (80px slide × 12), giving
// 10 sets (~9600px) of buffer on each side — enough for even the longest iOS fling.
// Desktop sets are ~2160px wide, giving ~21600px of buffer per side.
const SET_COUNT = 21;
const CENTER_SET = 10;

const Pics = () => {
  const scrollContainerRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isReady, setIsReady] = useState(false);
  const hasInitializedRef = useRef(false);
  const hasScrolledRef = useRef(false);
  const [activeYoutubeId, setActiveYoutubeId] = useState(null);
  const hasDraggedRef = useRef(false);

  // Scroll state tracking for deferred wrap
  const isScrollingRef = useRef(false);
  const isTouchingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Desktop drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const lastMoveRef = useRef({ x: 0, time: 0 });
  const prevMoveRef = useRef({ x: 0, time: 0 });
  const momentumAnimationRef = useRef(null);

  // Teleport to equivalent position within the safe center zone.
  // Called only after scroll fully stops so iOS native momentum is never interrupted.
  const checkAndWrap = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const setWidth = container.scrollWidth / SET_COUNT;
    if (setWidth <= 0) return;

    const lo = 2 * setWidth;
    const hi = (SET_COUNT - 2) * setWidth;

    if (container.scrollLeft < lo) {
      const setsOff = Math.ceil((lo - container.scrollLeft) / setWidth);
      container.style.visibility = 'hidden';
      container.scrollLeft += setsOff * setWidth;
      container.style.visibility = '';
    } else if (container.scrollLeft > hi) {
      const setsOff = Math.ceil((container.scrollLeft - hi) / setWidth);
      container.style.visibility = 'hidden';
      container.scrollLeft -= setsOff * setWidth;
      container.style.visibility = '';
    }
  }, []);

  // Schedule wrap 150ms after last scroll event — matches Clients.jsx pattern.
  // During native iOS momentum we only observe; we never write scrollLeft until it stops.
  const scheduleWrap = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      if (!isTouchingRef.current) checkAndWrap();
    }, 150);
  }, [checkAndWrap]);

  const handleScroll = useCallback(() => {
    isScrollingRef.current = true;
    scheduleWrap(); // always defer — 21 sets of buffer handles desktop; deferral handles mobile momentum

    if (!hasScrolledRef.current && window.dataLayer) {
      hasScrolledRef.current = true;
      window.dataLayer.push({
        event: 'carousel_scroll',
        carousel_element: 'image_carousel'
      });
      setTimeout(() => { hasScrolledRef.current = false; }, 2000);
    }
  }, [scheduleWrap]);

  // Touch handlers: track finger presence so we don't wrap mid-momentum
  const handleTouchStart = useCallback(() => {
    isTouchingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
    scheduleWrap();
  }, [scheduleWrap]);

  // Desktop momentum: programmatic scrolling, so wrapping mid-animation is safe
  const applyMomentum = useCallback((velocity) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let v = velocity * 0.95;
    const animate = () => {
      if (Math.abs(v) < 0.5) {
        momentumAnimationRef.current = null;
        return;
      }
      container.scrollLeft -= v;
      checkAndWrap();
      v *= 0.95;
      momentumAnimationRef.current = requestAnimationFrame(animate);
    };
    momentumAnimationRef.current = requestAnimationFrame(animate);
  }, [checkAndWrap]);

  const handleMouseDown = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
      momentumAnimationRef.current = null;
    }
    hasDraggedRef.current = false;
    const now = Date.now();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, scrollLeft: container.scrollLeft };
    lastMoveRef.current = { x: e.clientX, time: now };
    prevMoveRef.current = { x: e.clientX, time: now };
    e.preventDefault();
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const timeDelta = lastMoveRef.current.time - prevMoveRef.current.time;
    const positionDelta = lastMoveRef.current.x - prevMoveRef.current.x;
    const velocity = timeDelta > 0 ? (positionDelta / timeDelta) * 16 : 0;
    if (Math.abs(velocity) > 0.5) {
      applyMomentum(velocity);
    }
    container.style.cursor = 'grab';
    container.style.userSelect = '';
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp();
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMouseMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      if (Math.abs(deltaX) > 5) hasDraggedRef.current = true;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
      checkAndWrap();
      const now = Date.now();
      prevMoveRef.current = { ...lastMoveRef.current };
      lastMoveRef.current = { x: e.clientX, time: now };
    };
    const handleGlobalMouseUp = () => handleMouseUp();
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, checkAndWrap]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Ref callback: position at center set, then center on Drone, then reveal
  const setScrollContainerRef = useCallback((container) => {
    scrollContainerRef.current = container;
    if (!container || hasInitializedRef.current) return;
    container.style.scrollBehavior = 'auto';

    const attemptCenter = (retryCount = 0) => {
      if (hasInitializedRef.current) return;

      const setWidth = container.scrollWidth / SET_COUNT;
      if (setWidth > 0) {
        container.scrollLeft = CENTER_SET * setWidth;
      }

      const droneSlide = container.querySelector(`[data-set-index="${CENTER_SET}"][data-label="Drone"]`);
      if (!droneSlide) {
        if (retryCount < 5) setTimeout(() => attemptCenter(retryCount + 1), 100);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const droneRect = droneSlide.getBoundingClientRect();
      if (containerRect.width === 0 || droneRect.width === 0) {
        if (retryCount < 5) setTimeout(() => attemptCenter(retryCount + 1), 100);
        return;
      }

      const droneCenterX = droneRect.left + droneRect.width / 2 - containerRect.left;
      const target = container.scrollLeft + (droneCenterX - containerRect.width / 2);
      container.scrollLeft = Math.max(0, target);

      // Final sub-pixel refinement
      requestAnimationFrame(() => {
        if (!container) return;
        const r2 = container.getBoundingClientRect();
        const d2 = droneSlide.getBoundingClientRect();
        const offset = (d2.left + d2.width / 2 - r2.left) - r2.width / 2;
        if (Math.abs(offset) > 0.5) container.scrollLeft += offset;
        hasInitializedRef.current = true;
        setIsReady(true);
      });
    };

    // Double rAF: ensures CSS layout is complete before measuring
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        attemptCenter();
      });
    });
  }, []);

  const getAspectRatio = () => {
    if (screenWidth <= 480) return '1.5 / 16';
    if (screenWidth <= 1024) return '2 / 16';
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          gap: '0.5px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          willChange: 'scroll-position',
          cursor: 'default',
          opacity: isReady ? 1 : 0
        }}
      >
        {Array.from({ length: SET_COUNT }, (_, i) => i).flatMap(setIndex =>
          IMAGES.map(image => (
            <div
              key={`${setIndex}-${image.label}`}
              data-set-index={setIndex}
              data-label={image.label}
              className="swiper-slide"
              style={{
                flex: '0 0 auto',
                width: 'calc(100vw / 8)',
                minWidth: '80px',
                maxWidth: '200px',
                cursor: image.youtubeId ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (!hasDraggedRef.current && image.youtubeId) {
                  setActiveYoutubeId(image.youtubeId);
                }
              }}
            >
              <p>{image.label}</p>
              <img
                src={image.src}
                alt={image.alt}
                width={296}
                height={717}
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
          ))
        )}
      </div>

      <style>{`
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

        @media (max-width: 1024px) {
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
            aspect-ratio: 1.2 / 16;
            max-height: 220px;
          }

          .carousel-container {
            max-height: 280px;
          }

          .carousel-scroll-container {
            max-height: 260px;
          }

          .swiper-slide p {
            margin: 0 0 0.25rem 0;
            font-size: 0.7rem;
          }
        }

        @media (max-width: 1024px) {
          .carousel-container {
            max-height: 300px;
          }

          .carousel-scroll-container {
            max-height: 280px;
          }

          .swiper-slide img {
            max-height: 250px;
            aspect-ratio: 2.5 / 16;
          }

          .swiper-slide {
            width: calc(100vw / 20) !important;
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

      {activeYoutubeId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setActiveYoutubeId(null)}
        >
          <div
            style={{ position: 'relative', width: '90vw', maxWidth: '960px', aspectRatio: '16/9' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveYoutubeId(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '2rem',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '4px 8px'
              }}
              aria-label="Close video"
            >
              ×
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeYoutubeId}?autoplay=1&rel=0`}
              title="Cinestoke Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pics;
