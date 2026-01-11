import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo, useLayoutEffect, useCallback } from 'react';
// Import client logos and names from centralized config
import { getClientLogoComponents, getClientNames } from '../config/caseStudyConfig';

/**
 * ClientsV2 - Apple-style infinite carousel with fixed buffer approach
 *
 * Architecture:
 * - Fixed 3 copies: [Buffer Start] [Real Section] [Buffer End]
 * - When user scrolls into buffer zone → instant teleport to corresponding position in real section
 * - No dynamic DOM growth, no prepend math, no edge cases
 */
const ClientsV2 = forwardRef(({ onClientChange, onClientReselect }, ref) => {
  const scrollContainerRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isReady, setIsReady] = useState(false);

  // Essential refs only
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const isHoldingRef = useRef(false);
  const momentumAnimationRef = useRef(null);
  const lastNotifiedClientRef = useRef(null);
  const isWrappingRef = useRef(false); // Prevent recursive wrap detection
  const hasInitializedRef = useRef(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const lastMoveRef = useRef({ x: 0, time: 0 });
  const prevMoveRef = useRef({ x: 0, time: 0 });

  // Get client components and names from centralized config
  const clientComponents = getClientLogoComponents();
  const clientNames = getClientNames();

  // Build base clients array
  const clients = useMemo(() => {
    return clientComponents.map((Component, index) => {
      const name = clientNames[index] || Component.displayName || Component.name || 'Client';
      return {
        Component,
        alt: `${name} Logo`,
        name,
      };
    });
  }, [clientComponents, clientNames]);

  // Fixed buffer structure: 11 sets for smoother infinite scroll with big swipes
  // [Buf1] [Buf2] [Buf3] [Buf4] [Buf5] [Real] [Buf6] [Buf7] [Buf8] [Buf9] [Buf10]
  const BUFFER_SETS = 11;
  const realStartIndex = clients.length * 5; // Where "real" section starts (after five buffers)

  const allClients = useMemo(() => {
    const result = [];
    for (let setIndex = 0; setIndex < BUFFER_SETS; setIndex++) {
      clients.forEach((client, clientIndex) => {
        result.push({
          ...client,
          setIndex,
          globalIndex: setIndex * clients.length + clientIndex,
          // Sets 0-4 are start buffers, set 5 is real, sets 6-10 are end buffers
          isBuffer: setIndex < 5 ? 'start' : setIndex > 5 ? 'end' : false
        });
      });
    }
    return result;
  }, [clients]);

  // Calculate dynamic padding
  const getLogoPadding = useCallback(() => {
    if (screenWidth <= 768) {
      return '0 2%';
    }
    const paddingPercent = screenWidth <= 1024 ? 3 : 4;
    const padding = (screenWidth * paddingPercent) / 100;
    const clampedPadding = Math.max(20, Math.min(80, padding));
    return `0 ${clampedPadding}px`;
  }, [screenWidth]);

  // Get item width from DOM
  const getItemWidth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return 150; // fallback

    const logoWrapper = container.querySelector('.client-logo-wrapper');
    const line = container.querySelector('.line');
    if (!logoWrapper || !line) return 150;

    return logoWrapper.offsetWidth + line.offsetWidth + 0.5;
  }, []);

  // Get client name from logo wrapper
  const getClientNameFromLogo = useCallback((logoWrapper) => {
    return logoWrapper?.getAttribute('data-client-name') || null;
  }, []);

  // Center a specific logo
  const centerLogo = useCallback((logoWrapper, instant = false) => {
    const container = scrollContainerRef.current;
    if (!container || isWrappingRef.current) return;

    const containerRect = container.getBoundingClientRect();
    const logoRect = logoWrapper.getBoundingClientRect();
    const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
    const containerCenter = containerRect.width / 2;
    const scrollOffset = logoCenterX - containerCenter;

    if (Math.abs(scrollOffset) > 5) {
      container.style.scrollBehavior = instant ? 'auto' : 'smooth';
      container.scrollLeft = container.scrollLeft + scrollOffset;
    }
  }, []);

  // Wrap scroll position when reaching buffer zones
  // Uses DOM-based detection: find centered logo, then teleport to equivalent in real section
  const checkAndWrapScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isWrappingRef.current) return false;

    // Find the currently centered logo using DOM positions
    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    if (logoWrappers.length === 0) return false;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;

    let centeredLogo = null;
    let centeredDistance = Infinity;

    logoWrappers.forEach((wrapper) => {
      const rect = wrapper.getBoundingClientRect();
      const logoCenterX = rect.left - containerRect.left + (rect.width / 2);
      const distance = Math.abs(logoCenterX - containerCenterX);
      if (distance < centeredDistance) {
        centeredDistance = distance;
        centeredLogo = wrapper;
      }
    });

    if (!centeredLogo) return false;

    // Check if centered logo is in a buffer set (not set 5)
    const setIndex = parseInt(centeredLogo.getAttribute('data-set-index') || '0', 10);

    // Set 5 is the "real" section - no wrap needed
    if (setIndex === 5) return false;

    // Need to wrap - find the equivalent logo in the real section (set 5)
    const clientName = centeredLogo.getAttribute('data-client-name');
    if (!clientName) return false;

    isWrappingRef.current = true;

    // Find the same client in set 5
    let targetLogo = null;
    logoWrappers.forEach((wrapper) => {
      const wrapperSet = parseInt(wrapper.getAttribute('data-set-index') || '0', 10);
      const wrapperName = wrapper.getAttribute('data-client-name');
      if (wrapperSet === 5 && wrapperName === clientName) {
        targetLogo = wrapper;
      }
    });

    if (targetLogo) {
      // Calculate scroll position to center this logo
      const targetRect = targetLogo.getBoundingClientRect();
      const targetCenterX = targetRect.left - containerRect.left + (targetRect.width / 2);
      const scrollOffset = targetCenterX - containerCenterX;

      container.style.scrollBehavior = 'auto';
      container.scrollLeft = container.scrollLeft + scrollOffset;
    }

    requestAnimationFrame(() => {
      isWrappingRef.current = false;
    });

    return true;
  }, []);

  // Snap the closest logo to center - PRIMARY trigger for case study updates
  const snapToCenter = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isDragging || isScrollingRef.current || isHoldingRef.current || isWrappingRef.current) {
      return;
    }

    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    if (logoWrappers.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;

    let closestLogo = null;
    let closestDistance = Infinity;

    // Find the logo closest to center (only visible ones)
    logoWrappers.forEach((logoWrapper) => {
      const logoRect = logoWrapper.getBoundingClientRect();
      const isVisible = logoRect.right > containerRect.left && logoRect.left < containerRect.right;
      if (!isVisible) return;

      const logoCenterX = logoRect.left - containerRect.left + (logoRect.width / 2);
      const distance = Math.abs(logoCenterX - containerCenterX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLogo = logoWrapper;
      }
    });

    if (closestLogo) {
      const clientName = getClientNameFromLogo(closestLogo);

      // Center the logo (smooth animation)
      centerLogo(closestLogo);

      // Notify if client changed
      if (clientName && onClientChange && clientName !== lastNotifiedClientRef.current) {
        console.log('✅ ClientsV2 - snapToCenter:', clientName);
        lastNotifiedClientRef.current = clientName;
        onClientChange(clientName);
      }

      // Schedule wrap check AFTER centering animation completes (300ms)
      setTimeout(() => {
        if (!isScrollingRef.current && !isHoldingRef.current && !isDragging) {
          checkAndWrapScroll();
        }
      }, 350);
    }
  }, [isDragging, checkAndWrapScroll, getClientNameFromLogo, centerLogo, onClientChange]);

  // Momentum scrolling
  const applyMomentum = useCallback((velocity) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    let v = velocity * 0.95;

    const animate = () => {
      if (Math.abs(v) < 0.5) {
        container.style.scrollBehavior = 'smooth';
        momentumAnimationRef.current = null;
        isScrollingRef.current = false;

        requestAnimationFrame(() => {
          if (!isHoldingRef.current) {
            snapToCenter();
          }
        });
        return;
      }

      container.style.scrollBehavior = 'auto';
      container.scrollLeft -= v;
      v *= 0.95;
      momentumAnimationRef.current = requestAnimationFrame(animate);
    };

    momentumAnimationRef.current = requestAnimationFrame(animate);
  }, [snapToCenter]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isWrappingRef.current) return;

    isScrollingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      if (!isHoldingRef.current && !momentumAnimationRef.current) {
        snapToCenter();
      }
    }, 150);
  }, [snapToCenter]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
      momentumAnimationRef.current = null;
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    const now = Date.now();
    setIsDragging(true);
    isScrollingRef.current = true;
    isHoldingRef.current = true;

    dragStartRef.current = { x: e.clientX, scrollLeft: container.scrollLeft };
    lastMoveRef.current = { x: e.clientX, time: now };
    prevMoveRef.current = { x: e.clientX, time: now };

    e.preventDefault();
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    isHoldingRef.current = false;

    const timeDelta = lastMoveRef.current.time - prevMoveRef.current.time;
    const positionDelta = lastMoveRef.current.x - prevMoveRef.current.x;
    const velocity = timeDelta > 0 ? (positionDelta / timeDelta) * 16 : 0;

    if (Math.abs(velocity) > 0.5) {
      applyMomentum(velocity);
    } else {
      container.style.scrollBehavior = 'smooth';
      isScrollingRef.current = false;
      requestAnimationFrame(() => {
        snapToCenter();
      });
    }

    container.style.cursor = 'grab';
    container.style.userSelect = '';
    setIsDragging(false);
  }, [isDragging, applyMomentum, snapToCenter]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp();
    }
  }, [isDragging, handleMouseUp]);

  // Touch handlers
  const handleTouchStart = useCallback(() => {
    isScrollingRef.current = true;
    isHoldingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isHoldingRef.current = false;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      snapToCenter();
    }, 150);
  }, [snapToCenter]);

  // Scroll to a specific client (called from CaseStudy sync)
  const scrollToClient = useCallback((clientKey) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + (containerRect.width / 2);

    // Find the closest instance of this client to center
    let targetLogo = null;
    let closestDistance = Infinity;

    logoWrappers.forEach((logoWrapper) => {
      const logoClientName = getClientNameFromLogo(logoWrapper);
      // Only consider logos in the "real" section (middle set = index 5 with 11 sets)
      const setIndex = parseInt(logoWrapper.getAttribute('data-set-index') || '0', 10);
      if (logoClientName === clientKey && setIndex === 5) {
        const logoRect = logoWrapper.getBoundingClientRect();
        const logoCenterX = logoRect.left + (logoRect.width / 2);
        const distance = Math.abs(logoCenterX - containerCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          targetLogo = logoWrapper;
        }
      }
    });

    // Fallback: find any instance of the client
    if (!targetLogo) {
      logoWrappers.forEach((logoWrapper) => {
        const logoClientName = getClientNameFromLogo(logoWrapper);
        if (logoClientName === clientKey) {
          const logoRect = logoWrapper.getBoundingClientRect();
          const logoCenterX = logoRect.left + (logoRect.width / 2);
          const distance = Math.abs(logoCenterX - containerCenterX);

          if (distance < closestDistance) {
            closestDistance = distance;
            targetLogo = logoWrapper;
          }
        }
      });
    }

    if (targetLogo && closestDistance > 5) {
      container.style.scrollBehavior = 'smooth';
      centerLogo(targetLogo);
    }

    lastNotifiedClientRef.current = clientKey;
  }, [getClientNameFromLogo, centerLogo]);

  // Shift to adjacent brand (for edge swiping)
  const shiftToAdjacentBrand = useCallback((direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    if (logoWrappers.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + (containerRect.width / 2);

    // Find currently centered client
    let closestLogo = null;
    let closestDistance = Infinity;

    logoWrappers.forEach((logoWrapper) => {
      const logoRect = logoWrapper.getBoundingClientRect();
      const isVisible = logoRect.right > containerRect.left && logoRect.left < containerRect.right;
      if (!isVisible) return;

      const logoCenterX = logoRect.left + (logoRect.width / 2);
      const distance = Math.abs(logoCenterX - containerCenterX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLogo = logoWrapper;
      }
    });

    if (!closestLogo) return;

    const currentClientName = getClientNameFromLogo(closestLogo);
    const currentIndex = clientNames.indexOf(currentClientName);
    if (currentIndex === -1) return;

    // Calculate adjacent client
    let adjacentIndex;
    if (direction === 'left') {
      adjacentIndex = currentIndex === 0 ? clientNames.length - 1 : currentIndex - 1;
    } else {
      adjacentIndex = currentIndex === clientNames.length - 1 ? 0 : currentIndex + 1;
    }

    const adjacentClientName = clientNames[adjacentIndex];

    // Find closest instance of adjacent client
    let targetLogo = null;
    let targetDistance = Infinity;

    logoWrappers.forEach((logoWrapper) => {
      const clientName = getClientNameFromLogo(logoWrapper);
      if (clientName === adjacentClientName) {
        const logoRect = logoWrapper.getBoundingClientRect();
        const logoCenterX = logoRect.left + (logoRect.width / 2);
        const distance = Math.abs(logoCenterX - containerCenterX);

        if (distance < targetDistance) {
          targetDistance = distance;
          targetLogo = logoWrapper;
        }
      }
    });

    if (targetLogo) {
      centerLogo(targetLogo);

      if (adjacentClientName && onClientChange && adjacentClientName !== lastNotifiedClientRef.current) {
        lastNotifiedClientRef.current = adjacentClientName;
        onClientChange(adjacentClientName);
      }
    }
  }, [clientNames, getClientNameFromLogo, centerLogo, onClientChange]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    shiftToAdjacentBrand,
    scrollToClient
  }), [shiftToAdjacentBrand, scrollToClient]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Global mouse move/up handlers for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = dragStartRef.current.scrollLeft - deltaX;

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
  }, [isDragging, handleMouseUp]);

  // Initial positioning - center SWA in the real section
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || hasInitializedRef.current) return;

    const initializePosition = () => {
      const itemWidth = getItemWidth();
      if (itemWidth <= 0) {
        // DOM not ready, retry
        requestAnimationFrame(initializePosition);
        return;
      }

      // Find SWA index in client array
      const swaIndex = clients.findIndex(c => c.name === 'SWA');
      if (swaIndex === -1) {
        console.warn('ClientsV2: SWA not found in clients');
        hasInitializedRef.current = true;
        setIsReady(true);
        return;
      }

      // Target: SWA in the "real" (middle) section
      const targetIndex = realStartIndex + swaIndex;
      const containerWidth = container.clientWidth;

      // Calculate scroll position to center the target
      const targetScrollLeft = (targetIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);

      container.style.scrollBehavior = 'auto';
      container.scrollLeft = Math.max(0, targetScrollLeft);

      // Refine centering after scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const logoWrappers = container.querySelectorAll('.client-logo-wrapper[data-client-name="SWA"]');
          // Find the SWA in the middle set (setIndex === 5 with 11 sets)
          let swaLogo = null;
          logoWrappers.forEach((wrapper) => {
            const setIndex = parseInt(wrapper.getAttribute('data-set-index') || '0', 10);
            if (setIndex === 5) {
              swaLogo = wrapper;
            }
          });

          if (swaLogo) {
            const containerRect = container.getBoundingClientRect();
            const logoRect = swaLogo.getBoundingClientRect();
            const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
            const containerCenterX = containerRect.width / 2;
            const offset = logoCenterX - containerCenterX;

            if (Math.abs(offset) > 1) {
              container.style.scrollBehavior = 'auto';
              container.scrollLeft = container.scrollLeft + offset;
            }
          }

          hasInitializedRef.current = true;
          lastNotifiedClientRef.current = 'SWA';
          container.style.scrollBehavior = 'smooth';
          setIsReady(true);

          // Notify about initial client
          if (onClientChange) {
            onClientChange('SWA');
          }
        });
      });
    };

    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      requestAnimationFrame(initializePosition);
    });
  }, [clients, realStartIndex, getItemWidth, onClientChange]);

  return (
    <div className="cinestoke-section">
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          ref={scrollContainerRef}
          className="mui-box1 carousel-scroll-container"
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
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            willChange: 'scroll-position',
            cursor: 'default',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexWrap: 'nowrap',
            width: '100%',
            opacity: isReady ? 1 : 0
          }}
        >
          {/* Start with lineb */}
          <div className="lineb" style={{ flex: '0 0 auto' }} />

          {allClients.map((client, index) => {
            const { Component, name, setIndex, globalIndex } = client;
            const key = `client-${globalIndex}-${name}`;

            return (
              <React.Fragment key={key}>
                <div
                  className="client-logo-wrapper"
                  data-client-name={name}
                  data-set-index={setIndex}
                  data-global-index={globalIndex}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    padding: getLogoPadding(),
                    cursor: 'default',
                    WebkitTapHighlightColor: 'transparent',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                  }}
                  onClick={(e) => {
                    // If clicking the already-centered brand, trigger reselect (reset to first slide)
                    if (name === lastNotifiedClientRef.current) {
                      if (onClientReselect) {
                        onClientReselect(name);
                      }
                    } else {
                      // Different brand - trigger normal change
                      if (onClientChange) {
                        lastNotifiedClientRef.current = name;
                        onClientChange(name);
                      }
                    }
                    centerLogo(e.currentTarget);
                  }}
                  onAuxClick={(e) => {
                    // Middle mouse button click (scroll wheel click)
                    if (e.button === 1) {
                      e.preventDefault();
                      // Same logic as regular click
                      if (name === lastNotifiedClientRef.current) {
                        if (onClientReselect) {
                          onClientReselect(name);
                        }
                      } else {
                        if (onClientChange) {
                          lastNotifiedClientRef.current = name;
                          onClientChange(name);
                        }
                      }
                      centerLogo(e.currentTarget);
                    }
                  }}
                >
                  <Component
                    alt={client.alt}
                    style={{
                      transition: 'filter 0.3s ease',
                      filter: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (screenWidth > 768) {
                        e.currentTarget.style.filter = 'drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.6)) drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.4))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (screenWidth > 768) {
                        e.currentTarget.style.filter = 'none';
                      }
                    }}
                  />
                </div>
                <div className="line" style={{ flex: '0 0 auto' }} />
              </React.Fragment>
            );
          })}

          {/* End with lineb */}
          <div className="lineb" style={{ flex: '0 0 auto' }} />
        </div>

        {/* Left black overlay */}
        <div
          style={{
            position: 'absolute',
            left: '-40px',
            top: '2px',
            bottom: '2px',
            width: '40px',
            backgroundColor: '#000000',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Left fade overlay */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '2px',
            bottom: '2px',
            width: '60px',
            background: 'linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Right fade overlay */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '2px',
            bottom: '2px',
            width: '60px',
            background: 'linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      </div>

      <style jsx>{`
        .carousel-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .carousel-scroll-container :global(svg) {
          flex-shrink: 0;
          transition: filter 0.3s ease;
        }

        .client-logo-wrapper {
          -webkit-tap-highlight-color: transparent;
          overflow: hidden;
          box-sizing: border-box;
        }

        @media (min-width: 769px) {
          .client-logo-wrapper:hover :global(svg) {
            filter: drop-shadow(0px 0px 5px rgba(255, 255, 255, 1))
                    drop-shadow(0px 0px 10px rgba(255, 255, 255, 1))
                    drop-shadow(0px 0px 15px rgba(255, 255, 255, 0.9))
                    drop-shadow(0px 0px 20px rgba(255, 255, 255, 0.8))
                    drop-shadow(0px 0px 25px rgba(255, 255, 255, 0.7));
          }
        }

        .carousel-scroll-container :global(.line),
        .carousel-scroll-container :global(.lineb) {
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
});

export default ClientsV2;
