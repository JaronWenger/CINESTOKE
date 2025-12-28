import React, { useRef, useEffect, useState } from 'react';
// Import client logos and names from centralized config
import { getClientLogoComponents, getClientNames } from '../config/caseStudyConfig';

const ClientsV2 = ({ onClientChange }) => {
  const scrollContainerRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Calculate dynamic padding to match Clients.jsx space-between spacing
  const getLogoPadding = () => {
    // On mobile (≤768px), Clients.jsx uses space-around
    if (screenWidth <= 768) {
      return '0 2%'; // Matches space-around behavior with 2% padding
    }
    // On desktop, Clients.jsx uses space-between
    // Calculate padding to match the visual spacing of space-between
    // The spacing should scale with viewport width
    // For 6 clients with space-between, spacing is roughly: (containerWidth - totalItemWidth) / (numItems - 1)
    // Simplified: use a percentage that scales naturally
    const paddingPercent = screenWidth <= 1024 ? 3 : 4; // 3-4% of viewport width
    const padding = (screenWidth * paddingPercent) / 100;
    // Clamp between reasonable values
    const clampedPadding = Math.max(20, Math.min(80, padding));
    return `0 ${clampedPadding}px`;
  };
  const [isReady, setIsReady] = useState(false); // Hide container until positioned

  // Get client components and names from centralized config
  const clientComponents = getClientLogoComponents();
  const clientNames = getClientNames();

  // Automatically generate clients array - use explicit name mapping
  const clients = clientComponents.map((Component, index) => {
    // Use explicit name from array by index
    const name = clientNames[index] || Component.displayName || Component.name || 'Client';
    
    return {
      Component,
      alt: `${name} Logo`,
      name,
    };
  });

  // Dynamic client list that grows as user scrolls
  // Start with clients prepended so we can scroll left immediately
  const [displayedClients, setDisplayedClients] = useState([...clients, ...clients, ...clients]);
  const [prependCount, setPrependCount] = useState(3); // Start with 3 sets prepended
  const scrollPositionRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const scrollAdjustmentRef = useRef({ needed: false, amount: 0, targetPosition: 0 }); // Track scroll adjustment needed after prepending
  const isAdjustingRef = useRef(false); // Prevent scroll handler from interfering during adjustment
  const hasInitializedRef = useRef(false); // Track if we've initialized
  
  // Drag state for mouse drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const lastMoveRef = useRef({ x: 0, time: 0 });
  const prevMoveRef = useRef({ x: 0, time: 0 });
  const momentumAnimationRef = useRef(null);
  const scrollTimeoutRef = useRef(null); // For detecting scroll end
  const isScrollingRef = useRef(false); // Track if user is actively scrolling
  const isHoldingRef = useRef(false); // Track if user is actively holding/touching (mouse down or touch)
  const lastNotifiedClientRef = useRef(null); // Track last notified client to avoid duplicate notifications

  // Handle carousel scroll events with dynamic client loading
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Function to get client name from logo wrapper
  const getClientNameFromLogo = (logoWrapper) => {
    const clientName = logoWrapper.getAttribute('data-client-name');
    // Debug: log if we get unexpected values
    if (!clientName) {
      console.warn('getClientNameFromLogo: no data-client-name attribute found on logo wrapper');
    }
    return clientName || null;
  };

  // Function to center a specific logo
  const centerLogo = (logoWrapper) => {
    const container = scrollContainerRef.current;
    if (!container || isAdjustingRef.current) return;
    
    const containerRect = container.getBoundingClientRect();
    const logoRect = logoWrapper.getBoundingClientRect();
    const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
    const containerCenter = containerRect.width / 2;
    const scrollOffset = logoCenterX - containerCenter;
    
    // Only scroll if not already centered (within 5px)
    if (Math.abs(scrollOffset) > 5) {
      container.style.scrollBehavior = 'smooth';
      container.scrollLeft = container.scrollLeft + scrollOffset;
      scrollPositionRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
    }
    
    // Note: Notification happens in snapToCenter, not here, to avoid duplicate calls
    // centerLogo is called by snapToCenter, so we don't need to notify here
  };
  
  // Function to detect and notify about the currently centered client
  const detectAndNotifyCenteredClient = () => {
    const container = scrollContainerRef.current;
    if (!container || !onClientChange) return;

    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    if (logoWrappers.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + (containerRect.width / 2);
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;

    let closestLogo = null;
    let closestDistance = Infinity;

    // Find the logo closest to center, but only consider visible logos
    logoWrappers.forEach((logoWrapper) => {
      const logoRect = logoWrapper.getBoundingClientRect();
      
      // Only consider logos that are at least partially visible in the viewport
      const isVisible = logoRect.right > containerLeft && logoRect.left < containerRight;
      if (!isVisible) return;
      
      const logoCenterX = logoRect.left + (logoRect.width / 2);
      const distance = Math.abs(logoCenterX - containerCenterX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLogo = logoWrapper;
      }
    });

    // Only notify if a logo is very close to center (within 50px) to avoid false positives
    if (closestLogo && closestDistance < 50) {
      const clientName = getClientNameFromLogo(closestLogo);
      // Only notify if the client has changed to avoid duplicate notifications
      if (clientName && clientName !== lastNotifiedClientRef.current) {
        console.log('ClientsV2 - Detected centered client during scroll:', clientName, 'distance:', closestDistance.toFixed(1));
        lastNotifiedClientRef.current = clientName;
        onClientChange(clientName);
      }
    }
  };

  // Function to snap the closest logo to center
  // This is the PRIMARY trigger for updating the case study
  const snapToCenter = () => {
    console.log('snapToCenter called');
    const container = scrollContainerRef.current;
    // Don't snap if actively scrolling, adjusting, dragging, or holding
    if (!container) {
      console.log('snapToCenter: no container');
      return;
    }
    if (isAdjustingRef.current || isDragging || isScrollingRef.current || isHoldingRef.current) {
      console.log('snapToCenter: blocked by state', { isAdjusting: isAdjustingRef.current, isDragging, isScrolling: isScrollingRef.current, isHolding: isHoldingRef.current });
      return;
    }
    
    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    console.log('snapToCenter: found', logoWrappers.length, 'logo wrappers');
    if (logoWrappers.length === 0) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + (containerRect.width / 2);
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    
    let closestLogo = null;
    let closestDistance = Infinity;
    const allDistances = [];
    
    // Find the logo closest to center - ONLY consider visible logos in viewport
    logoWrappers.forEach((logoWrapper, index) => {
      const logoRect = logoWrapper.getBoundingClientRect();
      
      // Only consider logos that are at least partially visible in the viewport
      const isVisible = logoRect.right > containerLeft && logoRect.left < containerRight;
      if (!isVisible) return;
      
      const logoCenterX = logoRect.left + (logoRect.width / 2);
      const distance = Math.abs(logoCenterX - containerCenterX);
      const clientName = getClientNameFromLogo(logoWrapper);
      
      allDistances.push({ 
        index, 
        clientName, 
        distance: parseFloat(distance.toFixed(1)), 
        isVisible: true,
        logoLeft: logoRect.left.toFixed(0),
        logoRight: logoRect.right.toFixed(0),
        logoCenter: logoCenterX.toFixed(0),
        containerCenter: containerCenterX.toFixed(0)
      });
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLogo = logoWrapper;
      }
    });
    
    // Sort by distance and show top 10
    const sortedDistances = allDistances.sort((a, b) => a.distance - b.distance).slice(0, 10);
    console.log('snapToCenter: visible logos distances (top 10):', sortedDistances);
    console.log('snapToCenter: checking data-client-name on closest logo:', closestLogo ? closestLogo.getAttribute('data-client-name') : 'no closest logo');
    
    if (closestLogo) {
      // Get the client name BEFORE centering (in case centering changes DOM)
      const clientName = getClientNameFromLogo(closestLogo);
      console.log('snapToCenter: closest logo is', clientName, 'at distance', closestDistance.toFixed(1));
      
      // Center the logo
      centerLogo(closestLogo);
      
      // Notify about the centered client - this is the main trigger for case study updates
      if (clientName && onClientChange) {
        if (clientName !== lastNotifiedClientRef.current) {
          console.log('✅ ClientsV2 - snapToCenter detected centered client:', clientName, 'distance:', closestDistance.toFixed(1));
          lastNotifiedClientRef.current = clientName;
          onClientChange(clientName);
        } else {
          console.log('snapToCenter: same client as before, skipping notification');
        }
      } else {
        console.log('snapToCenter: no clientName or onClientChange', { clientName, hasOnClientChange: !!onClientChange });
      }
    } else {
      console.log('snapToCenter: no closest logo found');
    }
  };
  
  // Extract infinite scroll logic to be called from both scroll events and drag handlers
  const checkAndLoadClients = (currentScrollLeft, previousScrollLeft) => {
    const container = scrollContainerRef.current;
    if (!container || isAdjustingRef.current) return;

    const { scrollWidth, clientWidth } = container;
    const scrollRight = currentScrollLeft + clientWidth;
    const isScrollingRight = currentScrollLeft > previousScrollLeft;

    // Get actual item width from DOM
    const firstLogoWrapper = container.querySelector('.client-logo-wrapper');
    const firstLine = container.querySelector('.line');
    if (!firstLogoWrapper || !firstLine) return;
    
    const logoWidth = firstLogoWrapper.offsetWidth;
    const lineWidth = firstLine.offsetWidth;
    const gap = 0.5;
    const itemWidth = logoWidth + lineWidth + gap; // One logo + one line per item
    
    // Use actual scrollWidth from DOM, but calculate buffer based on item width
    const bufferDistance = itemWidth * 5;

    // If scrolling right and near the end, add more clients to the end
    if (isScrollingRight && scrollRight >= scrollWidth - bufferDistance) {
      setDisplayedClients(prev => [...prev, ...clients]);
    }
    // If scrolling left and near the beginning, add more clients to the start
    // Also prepend if we're exactly at position 0 (can't scroll left from here)
    else if ((!isScrollingRight || currentScrollLeft === 0) && currentScrollLeft <= bufferDistance && prependCount < 20) {
      // Capture current scroll position BEFORE prepending
      const clientsToPrepend = clients;
      const addedWidth = itemWidth * clientsToPrepend.length;
      
      // Set adjustment info
      scrollAdjustmentRef.current = {
        needed: true,
        amount: addedWidth,
        targetPosition: currentScrollLeft + addedWidth
      };
      
      // Prepend clients
      setDisplayedClients(prev => [...clientsToPrepend, ...prev]);
      setPrependCount(prev => prev + 1);
    }
  };
  
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Skip if we're in the middle of adjusting scroll position
    if (isAdjustingRef.current) {
      return;
    }

    // Mark that user is actively scrolling
    isScrollingRef.current = true;

    const { scrollLeft } = container;
    const previousScrollLeft = scrollPositionRef.current;
    
    scrollPositionRef.current = scrollLeft;
    lastScrollLeftRef.current = scrollLeft;

    // Check and load clients if needed
    checkAndLoadClients(scrollLeft, previousScrollLeft);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set timeout to snap to center when scrolling stops (only if not holding)
    scrollTimeoutRef.current = setTimeout(() => {
      // Mark scrolling as stopped
      isScrollingRef.current = false;
      // Only snap if user is not actively holding/touching
      if (!isHoldingRef.current) {
        snapToCenter();
      }
    }, 150); // Wait 150ms after scrolling stops

    // Analytics tracking
    if (!hasScrolled && window.dataLayer) {
      setHasScrolled(true);
      window.dataLayer.push({
        event: 'carousel_scroll',
        carousel_element: 'client_carousel'
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
    
    // Clear any pending scroll timeout since user is now holding
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    const now = Date.now();
    setIsDragging(true);
    isScrollingRef.current = true; // Mark as actively scrolling during drag
    isHoldingRef.current = true; // Mark as actively holding
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
    
    isScrollingRef.current = true; // Mark as actively scrolling during momentum
    let v = velocity * 0.95; // Simple friction
    let previousScrollLeft = container.scrollLeft;
    
    const animate = () => {
      if (Math.abs(v) < 0.5) {
        container.style.scrollBehavior = 'smooth';
        momentumAnimationRef.current = null;
        // Mark scrolling as stopped when momentum ends
        isScrollingRef.current = false;
        // Only snap to center when momentum ends if user is not holding
        requestAnimationFrame(() => {
          if (!isHoldingRef.current) {
            snapToCenter();
          }
        });
        return;
      }
      
      container.style.scrollBehavior = 'auto';
      container.scrollLeft -= v;
      const currentScrollLeft = container.scrollLeft;
      
      scrollPositionRef.current = currentScrollLeft;
      lastScrollLeftRef.current = currentScrollLeft;
      
      // Check and load clients during momentum (since scroll events don't fire)
      checkAndLoadClients(currentScrollLeft, previousScrollLeft);
      previousScrollLeft = currentScrollLeft;
      
      v *= 0.95; // Friction
      momentumAnimationRef.current = requestAnimationFrame(animate);
    };
    
    momentumAnimationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Mark as no longer holding
    isHoldingRef.current = false;
    
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
      // Mark scrolling as stopped
      isScrollingRef.current = false;
      // Snap to center immediately if no momentum (now that we've released)
      requestAnimationFrame(() => {
        snapToCenter();
      });
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

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    // Mark as actively scrolling and holding when touch starts
    isScrollingRef.current = true;
    isHoldingRef.current = true;
    // Clear any pending scroll timeout since user is now holding
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    // Mark as no longer holding
    isHoldingRef.current = false;
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    // Set a timeout to mark scrolling as stopped after touch ends
    // This gives time for any momentum scrolling to complete
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      // Only snap now that user has released
      snapToCenter();
    }, 150);
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);


  // Global mouse event listeners for drag functionality
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const deltaX = e.clientX - dragStartRef.current.x;
      const newScrollLeft = dragStartRef.current.scrollLeft - deltaX;
      const previousScrollLeft = scrollPositionRef.current;
      
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = newScrollLeft;
      
      scrollPositionRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
      
      // Check and load clients during drag (check immediately and after DOM update)
      checkAndLoadClients(container.scrollLeft, previousScrollLeft);
      // Also check in next frame in case DOM hasn't updated yet from previous client additions
      requestAnimationFrame(() => {
        if (container) {
          checkAndLoadClients(container.scrollLeft, previousScrollLeft);
        }
      });
      
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

  // Ref callback to initialize container
  const setScrollContainerRef = (container) => {
    scrollContainerRef.current = container;
    
    if (!container || hasInitializedRef.current) return;
    
    // Set approximate scroll position immediately to prevent flash
    // Calculate based on known structure: middle set starts at clients.length, SWA is at index 5 of middle set
    const middleStartIndex = clients.length;
    const targetIndex = middleStartIndex + 5; // SWA in the middle set
    
    // Estimate item width based on viewport (similar to Pics.jsx approach)
    // Each client has: logo wrapper (with 60px padding each side = 120px) + line (2px)
    // Estimate logo width based on typical SVG size (around 150-200px)
    let estimatedLogoWidth = 150; // Base estimate
    if (window.innerWidth <= 768) estimatedLogoWidth = 120;
    if (window.innerWidth <= 480) estimatedLogoWidth = 100;
    
    const estimatedLineWidth = 2;
    const gap = 0.5;
    const estimatedItemWidth = estimatedLogoWidth + 120 + estimatedLineWidth + gap; // logo + padding + line + gap
    const linebWidth = 2;
    
    // Calculate estimated position
    const estimatedTargetPosition = linebWidth + (targetIndex * estimatedItemWidth);
    const estimatedScrollPosition = estimatedTargetPosition + (estimatedLogoWidth / 2) - (container.clientWidth / 2);
    
    // Set immediately to prevent flash
    container.style.scrollBehavior = 'auto';
    container.scrollLeft = Math.max(0, estimatedScrollPosition);
    scrollPositionRef.current = container.scrollLeft;
    lastScrollLeftRef.current = container.scrollLeft;
    setIsReady(true); // Show immediately with estimated position
    
    // Then refine with actual measurements using getBoundingClientRect for accuracy
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!container || hasInitializedRef.current) return;
        
        const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
        if (logoWrappers.length === 0) {
          hasInitializedRef.current = true;
          container.style.scrollBehavior = 'smooth';
          return;
        }

        const targetLogo = logoWrappers[targetIndex];
        
        if (targetLogo) {
          // Use getBoundingClientRect for accurate positioning relative to viewport
          const containerRect = container.getBoundingClientRect();
          const logoRect = targetLogo.getBoundingClientRect();
          
          // Calculate the center of the logo relative to the container
          const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
          
          // Calculate the center of the container
          const containerCenterX = containerRect.width / 2;
          
          // Calculate how much we need to scroll to center the logo
          // Current scroll position + (logo center offset - container center)
          const exactScrollPosition = container.scrollLeft + (logoCenterX - containerCenterX);
          
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
              const finalLogoRect = targetLogo.getBoundingClientRect();
              const finalLogoCenterX = finalLogoRect.left + (finalLogoRect.width / 2) - finalContainerRect.left;
              const finalContainerCenterX = finalContainerRect.width / 2;
              const finalOffset = finalLogoCenterX - finalContainerCenterX;
              
              if (Math.abs(finalOffset) > 0.5) {
                container.scrollLeft = container.scrollLeft + finalOffset;
                scrollPositionRef.current = container.scrollLeft;
                lastScrollLeftRef.current = container.scrollLeft;
              }
              
              // Mark as initialized and re-enable smooth scrolling
              hasInitializedRef.current = true;
              container.style.scrollBehavior = 'smooth';
              
              // Notify about initial centered client
              if (targetLogo && onClientChange) {
                const clientName = getClientNameFromLogo(targetLogo);
                if (clientName) {
                  onClientChange(clientName);
                }
              }
            });
          } else {
            // Mark as initialized and re-enable smooth scrolling
            hasInitializedRef.current = true;
            container.style.scrollBehavior = 'smooth';
            
            // Notify about initial centered client
            if (targetLogo && onClientChange) {
              const clientName = getClientNameFromLogo(targetLogo);
              if (clientName) {
                onClientChange(clientName);
              }
            }
          }
        }
      });
    });
  };

  // Apply scroll adjustment after clients are prepended
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
  }, [displayedClients.length]);

  // Safety check: ensure we're not stuck at position 0 after initialization
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Wait a bit for DOM to be ready, then check
    const timeoutId = setTimeout(() => {
      if (!hasInitializedRef.current) {
        // If not initialized yet, try to initialize now
        const logoWrapper = container.querySelector('.client-logo-wrapper');
        const line = container.querySelector('.line');
        if (logoWrapper && line) {
          const logoWidth = logoWrapper.offsetWidth;
          const lineWidth = line.offsetWidth;
          const gap = 0.5;
          const itemWidth = logoWidth + lineWidth + gap;
          const middleStartIndex = clients.length;
          const targetIndex = middleStartIndex + 5; // SWA in the middle set
          const linebWidth = 2;
          const estimatedMiddlePosition = linebWidth + (targetIndex * itemWidth);
          const estimatedScrollPosition = estimatedMiddlePosition - (container.clientWidth / 2);
          
          if (estimatedScrollPosition > 0) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = estimatedScrollPosition;
            scrollPositionRef.current = container.scrollLeft;
            lastScrollLeftRef.current = container.scrollLeft;
            hasInitializedRef.current = true;
            container.style.scrollBehavior = 'smooth';
          }
        }
      }
      
      // If we're at position 0 and have enough clients, move to middle
      if (container.scrollLeft === 0 && displayedClients.length >= clients.length * 2) {
        const logoWrapper2 = container.querySelector('.client-logo-wrapper');
        const line2 = container.querySelector('.line');
        if (logoWrapper2 && line2) {
          const logoWidth = logoWrapper2.offsetWidth;
          const lineWidth = line2.offsetWidth;
          const gap = 0.5;
          const itemWidth = logoWidth + lineWidth + gap;
          const middleStartIndex = clients.length;
          const targetIndex = middleStartIndex + 5; // SWA in the middle set
          const linebWidth = 2;
          const estimatedMiddlePosition = linebWidth + (targetIndex * itemWidth);
          const estimatedScrollPosition = estimatedMiddlePosition - (container.clientWidth / 2);
          
          if (estimatedScrollPosition > 0) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = estimatedScrollPosition;
            scrollPositionRef.current = container.scrollLeft;
            lastScrollLeftRef.current = container.scrollLeft;
            
            // Refine with actual measurements
            requestAnimationFrame(() => {
              if (!container) return;
              const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
              if (logoWrappers.length > targetIndex) {
                const targetLogo = logoWrappers[targetIndex];
                if (targetLogo) {
                  const containerRect = container.getBoundingClientRect();
                  const logoRect = targetLogo.getBoundingClientRect();
                  const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
                  const containerCenterX = containerRect.width / 2;
                  const exactScrollPosition = container.scrollLeft + (logoCenterX - containerCenterX);
                  
                  if (Math.abs(container.scrollLeft - exactScrollPosition) > 1) {
                    container.style.scrollBehavior = 'auto';
                    container.scrollLeft = Math.max(0, exactScrollPosition);
                    scrollPositionRef.current = container.scrollLeft;
                    lastScrollLeftRef.current = container.scrollLeft;
                  }
                  
                  // Notify about centered client
                  if (onClientChange) {
                    const clientName = getClientNameFromLogo(targetLogo);
                    if (clientName) {
                      onClientChange(clientName);
                    }
                  }
                }
              }
              container.style.scrollBehavior = 'smooth';
              setIsReady(true); // Show container
            });
          }
        }
      }
      
      // Only detect centered client after initialization is complete
      // This prevents overriding the initial SWA selection during slow page loads
      if (container && onClientChange && hasInitializedRef.current) {
        const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
        if (logoWrappers.length > 0) {
          const containerRect = container.getBoundingClientRect();
          const containerCenterX = containerRect.left + (containerRect.width / 2);
          
          let closestLogo = null;
          let closestDistance = Infinity;
          
          logoWrappers.forEach((logoWrapper) => {
            const logoRect = logoWrapper.getBoundingClientRect();
            const logoCenterX = logoRect.left + (logoRect.width / 2);
            const distance = Math.abs(logoCenterX - containerCenterX);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestLogo = logoWrapper;
            }
          });
          
          if (closestLogo && closestDistance < 100) { // Within 100px of center
            const clientName = getClientNameFromLogo(closestLogo);
            if (clientName) {
              onClientChange(clientName);
            }
          }
        }
      }
      
      // Always show container after timeout, even if positioning didn't work
      if (!isReady) {
        setIsReady(true);
      }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timeoutId);
  }, [displayedClients.length, clients.length]);

  return (
    <div className="cinestoke-section">
      <div style={{ position: 'relative', width: '100%' }}>
        <div 
          ref={setScrollContainerRef}
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
        {/* Start with lineb to match original structure */}
        <div className="lineb" style={{ flex: '0 0 auto' }} />
        {displayedClients.map((client, index) => {
          const { Component, name } = client;
          const key = `client-${index}-${name}`;
          
          // Debug: log first few to verify names
          if (index < 6) {
            console.log(`Rendering client ${index}: name="${name}", Component=${Component.name || Component.displayName || 'unknown'}`);
          }
          
          return (
            <React.Fragment key={key}>
              <div 
                className="client-logo-wrapper"
                data-client-name={name}
                style={{ 
                  flex: '0 0 auto', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: getLogoPadding(), 
                  cursor: 'default',
                  WebkitTapHighlightColor: 'transparent',
                  tapHighlightColor: 'transparent',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}
                onClick={(e) => {
                  centerLogo(e.currentTarget);
                }}
              >
                <Component 
                  alt={client.alt} 
                  style={{ 
                    transition: 'filter 0.3s ease',
                    filter: 'none'
                  }}
                  onMouseEnter={(e) => {
                    // Only apply hover effect on desktop (screen width > 768px)
                    if (screenWidth > 768) {
                      e.currentTarget.style.filter = 'drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.6)) drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.4))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Only apply hover effect on desktop (screen width > 768px)
                    if (screenWidth > 768) {
                      e.currentTarget.style.filter = 'none';
                    }
                  }}
                />
              </div>
              {/* Vertical Line - one line between each logo */}
              <div className="line" style={{ flex: '0 0 auto' }} />
            </React.Fragment>
          );
        })}
        {/* End with lineb to match original structure */}
        <div className="lineb" style={{ flex: '0 0 auto' }} />
      </div>
      
      {/* Solid black overlay on mobile to cover logos to the left of fade */}
      {screenWidth <= 768 && (
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
      )}
      
      {/* Left fade overlay - fixed to viewport, excludes top/bottom borders */}
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
      
      {/* Right fade overlay - fixed to viewport, excludes top/bottom borders */}
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
          tap-highlight-color: transparent;
          overflow: hidden;
          box-sizing: border-box;
        }
        
        /* Only apply hover effect on desktop (screen width > 768px) */
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
};

export default ClientsV2;

