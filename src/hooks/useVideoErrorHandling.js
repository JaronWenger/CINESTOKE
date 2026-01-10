import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook to handle video errors and stuck detection (mobile only)
 * Only detects stuck videos - doesn't interfere with normal playback
 */
export const useVideoErrorHandling = (videoRef, videoSrc, isMobile = false, maxRetries = 3) => {
  const retryCountRef = useRef(0);
  const stuckCheckIntervalRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isRetryingRef = useRef(false);
  const originalSrcRef = useRef(videoSrc);

  // Update original src when it changes
  useEffect(() => {
    originalSrcRef.current = videoSrc;
  }, [videoSrc]);

  // Force play attempt with error handling
  const attemptPlay = useCallback(async (video) => {
    if (!video || isRetryingRef.current) return false;

    try {
      // Don't reset currentTime here - only reset when we're absolutely sure it's stuck
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        return true;
      }
      return true;
    } catch (error) {
      console.warn('Video play attempt failed:', error);
      return false;
    }
  }, []);

  // Retry loading video with exponential backoff
  const retryVideo = useCallback((video) => {
    if (isRetryingRef.current || retryCountRef.current >= maxRetries) {
      console.warn('Video retry limit reached or already retrying');
      return;
    }

    isRetryingRef.current = true;
    retryCountRef.current += 1;
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000); // Exponential backoff, max 5s

    console.log(`Retrying video load (attempt ${retryCountRef.current}/${maxRetries}) after ${delay}ms`);

    setTimeout(() => {
      if (!video) {
        isRetryingRef.current = false;
        return;
      }

      // Reset video and reload
      const currentSrc = video.src;
      video.src = '';
      video.load();

      setTimeout(() => {
        if (video) {
          video.src = originalSrcRef.current || currentSrc;
          video.load();
          
          // Try to play after load
          video.addEventListener('loadeddata', () => {
            attemptPlay(video);
          }, { once: true });

          isRetryingRef.current = false;
        }
      }, 100);
    }, delay);
  }, [maxRetries, attemptPlay]);

  // Detect stuck videos (mobile only) - very conservative
  // Only checks if video should be playing but time isn't advancing
  const stuckCheckCountRef = useRef(0);
  const checkStuckVideo = useCallback((video) => {
    // Only check on mobile, and only if not retrying
    if (!video || !isMobile || isRetryingRef.current) {
      return;
    }

    const currentTime = video.currentTime;
    const hasAutoplay = video.hasAttribute('autoplay') || video.autoplay;
    const shouldBePlaying = hasAutoplay && !video.paused && video.readyState >= 3;

    // Only check for stuck if video should be playing
    if (shouldBePlaying) {
      // Check if time hasn't advanced (within 0.1s tolerance)
      const timeNotAdvancing = Math.abs(currentTime - lastTimeRef.current) < 0.1;
      
      if (timeNotAdvancing && currentTime > 0 && lastTimeRef.current > 0) {
        // Increment stuck check counter - only act after 5 consecutive checks (15 seconds)
        stuckCheckCountRef.current += 1;
        
        if (stuckCheckCountRef.current >= 5) {
          // Video has been stuck for 15+ seconds - try to recover
          console.warn('Video appears stuck on mobile, attempting recovery');
          stuckCheckCountRef.current = 0;
          
          // Simple recovery: just try to play
          attemptPlay(video).catch(() => {
            // If play fails, try reloading
            if (retryCountRef.current < maxRetries) {
              retryVideo(video);
            }
          });
        }
      } else {
        // Time is advancing normally, reset stuck counter
        stuckCheckCountRef.current = 0;
      }
    } else {
      // Video is paused intentionally, reset counter
      stuckCheckCountRef.current = 0;
    }

    lastTimeRef.current = currentTime;
  }, [attemptPlay, retryVideo, maxRetries, isMobile]);

  // Set up error handling and stuck detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    // Reset retry count when video source changes
    if (video.src !== originalSrcRef.current) {
      retryCountRef.current = 0;
      lastTimeRef.current = 0;
    }

    const handleError = (e) => {
      console.error('Video error:', e);
      const error = video.error;
      
      if (error) {
        console.error('Video error code:', error.code, 'message:', error.message);
        
        // Error codes:
        // 1 = MEDIA_ERR_ABORTED - user aborted
        // 2 = MEDIA_ERR_NETWORK - network error
        // 3 = MEDIA_ERR_DECODE - decode error
        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED - source not supported
        
        // Only retry on network/decode errors (not user abort or unsupported)
        if (error.code === 2 || error.code === 3) {
          if (retryCountRef.current < maxRetries) {
            retryVideo(video);
          } else {
            console.error('Video failed after max retries');
          }
        }
      }
    };

    const handleStalled = () => {
      console.warn('Video stalled, attempting recovery');
      if (retryCountRef.current < maxRetries) {
        // Wait a bit then retry
        setTimeout(() => {
          if (video.readyState < 3) {
            retryVideo(video);
          }
        }, 2000);
      }
    };

    // Don't interfere with normal playback - only handle errors and stuck detection

    const handlePlay = () => {
      // Reset retry count and stuck counter on successful play
      if (retryCountRef.current > 0) {
        console.log('Video playing successfully after retry');
        retryCountRef.current = 0;
      }
      stuckCheckCountRef.current = 0; // Reset stuck counter when playing
      lastTimeRef.current = video.currentTime;
    };

    const handleTimeUpdate = () => {
      lastTimeRef.current = video.currentTime;
    };

    // Set up stuck detection interval (mobile only)
    // Check every 3 seconds - very conservative to avoid interfering with playback
    if (isMobile) {
      stuckCheckIntervalRef.current = setInterval(() => {
        checkStuckVideo(video);
      }, 3000);
    }

    // Add event listeners - only error handling, no interference with normal playback
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Cleanup
    return () => {
      if (stuckCheckIntervalRef.current) {
        clearInterval(stuckCheckIntervalRef.current);
        stuckCheckIntervalRef.current = null;
      }
      
      if (video) {
        video.removeEventListener('error', handleError);
        video.removeEventListener('stalled', handleStalled);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [videoSrc, isMobile, videoRef, attemptPlay, retryVideo, checkStuckVideo, maxRetries]);

  return {
    retryCount: retryCountRef.current,
    isRetrying: isRetryingRef.current
  };
};
