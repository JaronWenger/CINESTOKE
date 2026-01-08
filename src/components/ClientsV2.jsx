import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// Import client logos and names from centralized config
import { getClientLogoComponents, getClientNames } from '../config/caseStudyConfig';

const ClientsV2 = forwardRef(({ onClientChange }, ref) => {
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
  // Start with more sets prepended to ensure equal runway on left and right
  // 5 sets total: 2 left, 1 middle (centered), 2 right
  const initialSets = 5;
  const [displayedClients, setDisplayedClients] = useState(() => {
    const sets = [];
    for (let i = 0; i < initialSets; i++) {
      sets.push(...clients);
    }
    return sets;
  });
  const [prependCount, setPrependCount] = useState(initialSets); // Track prepended sets
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
  const initialCenteringCompleteRef = useRef(false); // Track if initial SWA centering is complete

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
    // Don't snap until initial SWA centering is complete
    if (!initialCenteringCompleteRef.current) {
      console.log('snapToCenter: blocked - initial centering not complete');
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
  
  // Function to shift to adjacent brand (left or right)
  // Called from CaseStudy when user tries to swipe beyond first/last slide
  // Uses the unique space IDs to find the exact adjacent space
  const shiftToAdjacentBrand = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Find currently centered client
    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    if (logoWrappers.length === 0) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + (containerRect.width / 2);
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    
    let closestLogo = null;
    let closestDistance = Infinity;
    
    // Find the logo closest to center
    logoWrappers.forEach((logoWrapper) => {
      const logoRect = logoWrapper.getBoundingClientRect();
      const isVisible = logoRect.right > containerLeft && logoRect.left < containerRight;
      if (!isVisible) return;
      
      const logoCenterX = logoRect.left + (logoRect.width / 2);
      const distance = Math.abs(logoCenterX - containerCenterX);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLogo = logoWrapper;
      }
    });
    
    if (!closestLogo) return;
    
    // Use the unique space IDs we created to find the exact adjacent space
    let adjacentSpaceId = null;
    if (direction === 'left') {
      // Get the left neighbor's space ID
      adjacentSpaceId = closestLogo.getAttribute('data-left-space-id');
    } else if (direction === 'right') {
      // Get the right neighbor's space ID
      adjacentSpaceId = closestLogo.getAttribute('data-right-space-id');
    } else {
      return;
    }
    
    // If no adjacent space ID (at boundary), wrap around by finding the opposite end
    if (!adjacentSpaceId || adjacentSpaceId === '') {
      // Find the current client name to determine wrap-around
      const currentClientName = getClientNameFromLogo(closestLogo);
      if (!currentClientName) return;
      
      const currentIndex = clientNames.indexOf(currentClientName);
      if (currentIndex === -1) return;
      
      // Calculate wrap-around index
      let wrapIndex;
      if (direction === 'left') {
        wrapIndex = currentIndex === 0 ? clientNames.length - 1 : currentIndex - 1;
      } else {
        wrapIndex = currentIndex === clientNames.length - 1 ? 0 : currentIndex + 1;
      }
      
      const wrapClientName = clientNames[wrapIndex];
      
      // Find the wrap-around logo (closest instance of that client)
      let targetLogo = null;
      let targetDistance = Infinity;
      
      logoWrappers.forEach((logoWrapper) => {
        const clientName = getClientNameFromLogo(logoWrapper);
        if (clientName === wrapClientName) {
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
      }
      return;
    }
    
    // Get current client name to determine adjacent client
    const currentClientName = getClientNameFromLogo(closestLogo);
    if (!currentClientName) return;
    
    const currentIndex = clientNames.indexOf(currentClientName);
    if (currentIndex === -1) return;
    
    // Calculate adjacent client index
    let adjacentIndex;
    if (direction === 'left') {
      adjacentIndex = currentIndex === 0 ? clientNames.length - 1 : currentIndex - 1;
    } else {
      adjacentIndex = currentIndex === clientNames.length - 1 ? 0 : currentIndex + 1;
    }
    
    const adjacentClientName = clientNames[adjacentIndex];
    
    // Try to find the adjacent space using space ID first (most accurate)
    let targetLogo = null;
    if (adjacentSpaceId && adjacentSpaceId !== '') {
      const spaceIdLogo = container.querySelector(`[data-space-id="${adjacentSpaceId}"]`);
      if (spaceIdLogo) {
        // Verify it's the correct client and reasonably close
        const spaceIdClientName = getClientNameFromLogo(spaceIdLogo);
        const spaceIdRect = spaceIdLogo.getBoundingClientRect();
        const spaceIdCenterX = spaceIdRect.left + (spaceIdRect.width / 2);
        const spaceIdDistance = Math.abs(spaceIdCenterX - containerCenterX);
        
        // Use space ID logo if it matches the client and is reasonably close (within 3 screen widths)
        if (spaceIdClientName === adjacentClientName && spaceIdDistance < containerRect.width * 3) {
          targetLogo = spaceIdLogo;
        }
      }
    }
    
    // Fallback: Find the closest instance of the adjacent client
    if (!targetLogo) {
      let closestAdjacentDistance = Infinity;
      
      logoWrappers.forEach((logoWrapper) => {
        const clientName = getClientNameFromLogo(logoWrapper);
        if (clientName === adjacentClientName) {
          const logoRect = logoWrapper.getBoundingClientRect();
          const logoCenterX = logoRect.left + (logoRect.width / 2);
          const distance = Math.abs(logoCenterX - containerCenterX);
          
          if (distance < closestAdjacentDistance) {
            closestAdjacentDistance = distance;
            targetLogo = logoWrapper;
          }
        }
      });
    }
    
    if (targetLogo) {
      // Center the adjacent brand
      centerLogo(targetLogo);
      
      // Explicitly notify about the client change (don't wait for snapToCenter)
      // This ensures immediate feedback when shifting brands
      const targetClientName = getClientNameFromLogo(targetLogo);
      if (targetClientName && onClientChange && targetClientName !== lastNotifiedClientRef.current) {
        console.log('✅ ClientsV2 - shiftToAdjacentBrand shifting to:', targetClientName);
        lastNotifiedClientRef.current = targetClientName;
        onClientChange(targetClientName);
      }
    }
  };
  
  // Scroll to a specific client's logo (called when CaseStudy scroll changes client)
  const scrollToClient = (clientKey) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Prevent snapToCenter from interfering during programmatic scroll
    isAdjustingRef.current = true;

    // Find all logo wrappers with this client
    const logoWrappers = container.querySelectorAll('.client-logo-wrapper');
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + (containerRect.width / 2);

    // Find the closest instance of this client to center (in case of duplicates)
    let targetLogo = null;
    let closestDistance = Infinity;

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

    if (!targetLogo) {
      isAdjustingRef.current = false;
      return;
    }

    // Calculate scroll needed to center this logo
    const logoRect = targetLogo.getBoundingClientRect();
    const logoCenterX = logoRect.left + (logoRect.width / 2);
    const scrollOffset = logoCenterX - containerCenterX;

    // Only scroll if not already centered (within 5px)
    if (Math.abs(scrollOffset) > 5) {
      // Use style-based smooth scroll for better Safari compatibility
      container.style.scrollBehavior = 'smooth';
      container.scrollLeft = container.scrollLeft + scrollOffset;
      scrollPositionRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
    }

    // Update last notified client to prevent duplicate notifications
    lastNotifiedClientRef.current = clientKey;

    // Reset adjusting flag after scroll animation completes
    setTimeout(() => {
      isAdjustingRef.current = false;
    }, 500);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    shiftToAdjacentBrand,
    scrollToClient
  }));
  
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
    
    setIsReady(true); // Show container immediately
    
    // Simple function to find and center SWA by data attribute
    const centerSWA = (retryCount = 0) => {
      if (!container || hasInitializedRef.current) return;
      
      // Find all SWA logos (there are multiple due to infinite scroll)
      const swaLabels = container.querySelectorAll('.client-logo-wrapper[data-client-name="SWA"]');
      
      if (swaLabels.length === 0) {
        // SWA not found yet, retry
        if (retryCount < 5) {
          setTimeout(() => centerSWA(retryCount + 1), 100);
        } else {
          hasInitializedRef.current = true;
          initialCenteringCompleteRef.current = true;
        }
        return;
      }
      
      // Find SWA in the middle set - SWA is at index 4 in the original array (order 5, swapped with IR)
      // With 5 sets total, middle set is at index 2, so SWA is at clients.length * 2 + 4
      const allLogos = container.querySelectorAll('.client-logo-wrapper');
      const middleSetIndex = Math.floor(initialSets / 2); // Middle set index (2 for 5 sets)
      const targetIndex = clients.length * middleSetIndex + 4; // SWA position in middle set (now at order 5, index 4)
      
      let swaLogo = null;
      
      // First, try to get SWA from the exact target index (middle set)
      if (allLogos.length > targetIndex) {
        const middleSetLogo = allLogos[targetIndex];
        if (middleSetLogo && getClientNameFromLogo(middleSetLogo) === 'SWA') {
          swaLogo = middleSetLogo;
        }
      }
      
      // If we didn't find it at target index, search all SWA logos and find the one closest to target
      if (!swaLogo) {
        let closestSWA = null;
        let closestDistance = Infinity;
        
        swaLabels.forEach((logo) => {
          const logoIndex = Array.from(allLogos).indexOf(logo);
          if (logoIndex >= 0) {
            const distance = Math.abs(logoIndex - targetIndex);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSWA = logo;
            }
          }
        });
        
        if (closestSWA) {
          swaLogo = closestSWA;
        } else {
          // Fallback to first SWA found
          swaLogo = swaLabels[0];
        }
      }
      
      // Verify we actually have SWA (not IR or another client) - critical check!
      const verifiedClientName = getClientNameFromLogo(swaLogo);
      if (verifiedClientName !== 'SWA') {
        console.warn(`ClientsV2 - Found ${verifiedClientName} instead of SWA at target index, searching all SWA logos...`);
        // Search all SWA logos and find the one closest to target index
        let bestSWA = null;
        let bestDistance = Infinity;
        swaLabels.forEach((logo) => {
          const clientName = getClientNameFromLogo(logo);
          if (clientName === 'SWA') {
            const logoIndex = Array.from(allLogos).indexOf(logo);
            if (logoIndex >= 0) {
              const distance = Math.abs(logoIndex - targetIndex);
              if (distance < bestDistance) {
                bestDistance = distance;
                bestSWA = logo;
              }
            }
          }
        });
        if (bestSWA) {
          swaLogo = bestSWA;
          console.log(`ClientsV2 - Found SWA at index ${Array.from(allLogos).indexOf(bestSWA)}, distance ${bestDistance} from target ${targetIndex}`);
        } else {
          // Last resort: use first SWA found
          swaLabels.forEach((logo) => {
            if (getClientNameFromLogo(logo) === 'SWA' && !swaLogo) {
              swaLogo = logo;
            }
          });
        }
      }
      
      // Final verification before centering
      const finalCheck = getClientNameFromLogo(swaLogo);
      if (finalCheck !== 'SWA') {
        console.error(`ClientsV2 - Still not SWA (found ${finalCheck}), retrying...`);
        if (retryCount < 5) {
          setTimeout(() => centerSWA(retryCount + 1), 100);
          return;
        }
      }
      
      // Check if SVG is rendered (for mobile reliability)
      const svg = swaLogo.querySelector('svg');
      if (svg) {
        const svgRect = svg.getBoundingClientRect();
        if ((svgRect.width === 0 || svgRect.height === 0) && retryCount < 3) {
          setTimeout(() => centerSWA(retryCount + 1), 150);
          return;
        }
      }
      
      // Center the SWA logo immediately with auto scroll, then refine
      const containerRect = container.getBoundingClientRect();
      const logoRect = swaLogo.getBoundingClientRect();
      const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
      const containerCenterX = containerRect.width / 2;
      const scrollOffset = logoCenterX - containerCenterX;
      
      // Center immediately with auto scroll behavior
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = container.scrollLeft + scrollOffset;
      scrollPositionRef.current = container.scrollLeft;
      lastScrollLeftRef.current = container.scrollLeft;
      
      // Refine with multiple passes for accuracy (especially important on mobile)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!container) return;
          const finalContainerRect = container.getBoundingClientRect();
          const finalLogoRect = swaLogo.getBoundingClientRect();
          const finalLogoCenterX = finalLogoRect.left + (finalLogoRect.width / 2) - finalContainerRect.left;
          const finalContainerCenterX = finalContainerRect.width / 2;
          const finalOffset = finalLogoCenterX - finalContainerCenterX;
          
          if (Math.abs(finalOffset) > 1) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = container.scrollLeft + finalOffset;
            scrollPositionRef.current = container.scrollLeft;
            lastScrollLeftRef.current = container.scrollLeft;
            
            // One more pass for mobile to ensure perfect centering
            requestAnimationFrame(() => {
              if (!container) return;
              const finalContainerRect2 = container.getBoundingClientRect();
              const finalLogoRect2 = swaLogo.getBoundingClientRect();
              const finalLogoCenterX2 = finalLogoRect2.left + (finalLogoRect2.width / 2) - finalContainerRect2.left;
              const finalContainerCenterX2 = finalContainerRect2.width / 2;
              const finalOffset2 = finalLogoCenterX2 - finalContainerCenterX2;
              
              if (Math.abs(finalOffset2) > 1) {
                container.style.scrollBehavior = 'auto';
                container.scrollLeft = container.scrollLeft + finalOffset2;
                scrollPositionRef.current = container.scrollLeft;
                lastScrollLeftRef.current = container.scrollLeft;
              }
              
              // Mark as initialized and switch to smooth scrolling
              hasInitializedRef.current = true;
              initialCenteringCompleteRef.current = true;
              container.style.scrollBehavior = 'smooth';
              
              // Notify about initial centered client
              if (onClientChange) {
                const clientName = getClientNameFromLogo(swaLogo);
                if (clientName) {
                  onClientChange(clientName);
                }
              }
            });
          } else {
            // Already centered, just mark as initialized
            hasInitializedRef.current = true;
            initialCenteringCompleteRef.current = true;
            container.style.scrollBehavior = 'smooth';
            
            // Notify about initial centered client
            if (onClientChange) {
              const clientName = getClientNameFromLogo(swaLogo);
              if (clientName) {
                onClientChange(clientName);
              }
            }
          }
        });
      });
    };
    
    // Wait for DOM to be ready, then center SWA
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        centerSWA();
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
    // Use longer timeout on mobile to ensure DOM is fully rendered
    const isMobile = window.innerWidth <= 768;
    const timeoutDelay = isMobile ? 200 : 100;
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
          const middleSetIndex = Math.floor(initialSets / 2); // Middle set index (2 for 5 sets)
          const middleStartIndex = clients.length * middleSetIndex;
          const targetIndex = middleStartIndex + 4; // SWA in the middle set (index 4 in original array)
          const linebWidth = 2;
          const estimatedMiddlePosition = linebWidth + (targetIndex * itemWidth);
          const estimatedScrollPosition = estimatedMiddlePosition - (container.clientWidth / 2);
          
          if (estimatedScrollPosition > 0) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft = estimatedScrollPosition;
            scrollPositionRef.current = container.scrollLeft;
            lastScrollLeftRef.current = container.scrollLeft;
            
            // Refine with actual measurements (especially important on mobile)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (!container) return;
                const swaLabels = container.querySelectorAll('.client-logo-wrapper[data-client-name="SWA"]');
                if (swaLabels.length > 0) {
                  const allLogos = container.querySelectorAll('.client-logo-wrapper');
                  const targetSWA = allLogos[targetIndex];
                  const swaLogo = targetSWA && getClientNameFromLogo(targetSWA) === 'SWA' 
                    ? targetSWA 
                    : Array.from(swaLabels).find(logo => {
                        const idx = Array.from(allLogos).indexOf(logo);
                        return Math.abs(idx - targetIndex) < 5; // Within 5 positions
                      }) || swaLabels[0];
                  
                  if (swaLogo) {
                    const containerRect = container.getBoundingClientRect();
                    const logoRect = swaLogo.getBoundingClientRect();
                    const logoCenterX = logoRect.left + (logoRect.width / 2) - containerRect.left;
                    const containerCenterX = containerRect.width / 2;
                    const exactOffset = logoCenterX - containerCenterX;
                    
                    if (Math.abs(exactOffset) > 1) {
                      container.style.scrollBehavior = 'auto';
                      container.scrollLeft = container.scrollLeft + exactOffset;
                      scrollPositionRef.current = container.scrollLeft;
                      lastScrollLeftRef.current = container.scrollLeft;
                      
                      // One more pass for mobile
                      if (isMobile) {
                        requestAnimationFrame(() => {
                          if (!container) return;
                          const finalContainerRect = container.getBoundingClientRect();
                          const finalLogoRect = swaLogo.getBoundingClientRect();
                          const finalLogoCenterX = finalLogoRect.left + (finalLogoRect.width / 2) - finalContainerRect.left;
                          const finalContainerCenterX = finalContainerRect.width / 2;
                          const finalOffset = finalLogoCenterX - finalContainerCenterX;
                          
                          if (Math.abs(finalOffset) > 1) {
                            container.style.scrollBehavior = 'auto';
                            container.scrollLeft = container.scrollLeft + finalOffset;
                            scrollPositionRef.current = container.scrollLeft;
                            lastScrollLeftRef.current = container.scrollLeft;
                          }
                          
                          hasInitializedRef.current = true;
                          initialCenteringCompleteRef.current = true;
                          container.style.scrollBehavior = 'smooth';
                          
                          if (onClientChange) {
                            const clientName = getClientNameFromLogo(swaLogo);
                            if (clientName) {
                              onClientChange(clientName);
                            }
                          }
                        });
                      } else {
                        hasInitializedRef.current = true;
                        initialCenteringCompleteRef.current = true;
                        container.style.scrollBehavior = 'smooth';
                        
                        if (onClientChange) {
                          const clientName = getClientNameFromLogo(swaLogo);
                          if (clientName) {
                            onClientChange(clientName);
                          }
                        }
                      }
                    } else {
                      hasInitializedRef.current = true;
                      initialCenteringCompleteRef.current = true;
                      container.style.scrollBehavior = 'smooth';
                      
                      if (onClientChange) {
                        const clientName = getClientNameFromLogo(swaLogo);
                        if (clientName) {
                          onClientChange(clientName);
                        }
                      }
                    }
                  } else {
                    hasInitializedRef.current = true;
                    initialCenteringCompleteRef.current = true;
                    container.style.scrollBehavior = 'smooth';
                  }
                } else {
                  hasInitializedRef.current = true;
                  initialCenteringCompleteRef.current = true;
                  container.style.scrollBehavior = 'smooth';
                }
              });
            });
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
            
            // Refine with actual measurements (especially important on mobile)
            requestAnimationFrame(() => {
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
                    const exactOffset = logoCenterX - containerCenterX;
                    
                    if (Math.abs(exactOffset) > 1) {
                      container.style.scrollBehavior = 'auto';
                      container.scrollLeft = container.scrollLeft + exactOffset;
                      scrollPositionRef.current = container.scrollLeft;
                      lastScrollLeftRef.current = container.scrollLeft;
                      
                      // One more pass for mobile to ensure perfect centering
                      if (isMobile) {
                        requestAnimationFrame(() => {
                          if (!container) return;
                          const finalContainerRect = container.getBoundingClientRect();
                          const finalLogoRect = targetLogo.getBoundingClientRect();
                          const finalLogoCenterX = finalLogoRect.left + (finalLogoRect.width / 2) - finalContainerRect.left;
                          const finalContainerCenterX = finalContainerRect.width / 2;
                          const finalOffset = finalLogoCenterX - finalContainerCenterX;
                          
                          if (Math.abs(finalOffset) > 1) {
                            container.style.scrollBehavior = 'auto';
                            container.scrollLeft = container.scrollLeft + finalOffset;
                            scrollPositionRef.current = container.scrollLeft;
                            lastScrollLeftRef.current = container.scrollLeft;
                          }
                          
                          container.style.scrollBehavior = 'smooth';
                          initialCenteringCompleteRef.current = true;
                          setIsReady(true);
                          
                          // Notify about centered client
                          if (onClientChange) {
                            const clientName = getClientNameFromLogo(targetLogo);
                            if (clientName) {
                              onClientChange(clientName);
                            }
                          }
                        });
                      } else {
                        container.style.scrollBehavior = 'smooth';
                        initialCenteringCompleteRef.current = true;
                        setIsReady(true);
                        
                        // Notify about centered client
                        if (onClientChange) {
                          const clientName = getClientNameFromLogo(targetLogo);
                          if (clientName) {
                            onClientChange(clientName);
                          }
                        }
                      }
                    } else {
                      container.style.scrollBehavior = 'smooth';
                      initialCenteringCompleteRef.current = true;
                      setIsReady(true);
                      
                      // Notify about centered client
                      if (onClientChange) {
                        const clientName = getClientNameFromLogo(targetLogo);
                        if (clientName) {
                          onClientChange(clientName);
                        }
                      }
                    }
                  }
                } else {
                  container.style.scrollBehavior = 'smooth';
                  initialCenteringCompleteRef.current = true;
                  setIsReady(true);
                }
              });
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
    }, timeoutDelay); // Longer delay on mobile to ensure DOM is ready
    
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
          
          // Calculate unique space identifier: which set this item belongs to and its position in the original array
          // This ID remains stable even when items are prepended and uniquely identifies each exact space
          const clientsPerSet = clients.length;
          const setIndex = Math.floor(index / clientsPerSet);
          const positionInSet = index % clientsPerSet;
          const spaceId = `space-${setIndex}-${positionInSet}`;
          
          // Calculate left and right neighbor space IDs (exact spaces, not just client names)
          const leftSpaceId = index > 0 ? (() => {
            const leftSetIndex = Math.floor((index - 1) / clientsPerSet);
            const leftPositionInSet = (index - 1) % clientsPerSet;
            return `space-${leftSetIndex}-${leftPositionInSet}`;
          })() : null;
          const rightSpaceId = index < displayedClients.length - 1 ? (() => {
            const rightSetIndex = Math.floor((index + 1) / clientsPerSet);
            const rightPositionInSet = (index + 1) % clientsPerSet;
            return `space-${rightSetIndex}-${rightPositionInSet}`;
          })() : null;
          
          // Also store client names for convenience
          const leftClient = index > 0 ? displayedClients[index - 1]?.name : null;
          const rightClient = index < displayedClients.length - 1 ? displayedClients[index + 1]?.name : null;
          
          // Debug: log first few to verify names
          if (index < 6) {
            console.log(`Rendering client ${index}: name="${name}", Component=${Component.name || Component.displayName || 'unknown'}`);
          }
          
          return (
            <React.Fragment key={key}>
              <div 
                className="client-logo-wrapper"
                data-client-name={name}
                data-space-id={spaceId}
                data-left-space-id={leftSpaceId || ''}
                data-right-space-id={rightSpaceId || ''}
                data-left-client={leftClient || ''}
                data-right-client={rightClient || ''}
                data-set-index={setIndex}
                data-position-in-set={positionInSet}
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
                  // Trigger fade immediately on click (before centering animation)
                  if (onClientChange && name !== lastNotifiedClientRef.current) {
                    lastNotifiedClientRef.current = name;
                    onClientChange(name);
                  }
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
      
      {/* Solid black overlay to cover any leaking lines behind the left fade */}
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
});

export default ClientsV2;

