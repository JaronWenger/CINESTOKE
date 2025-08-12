import React, { useState, useEffect } from 'react'
import videoBg from '../assets/Welcome.mp4'
import videoBgMobile from '../assets/Welcomephone.mp4'
import Bars from './Bars'
import footer from '../assets/Footerthin.webp'

import Clients from './Clients';
import Pics from './Pics';
import Contact from './Contact';
import Social from './Social';


const Main = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen width on initial load
    if (window.innerWidth <= 768) {  // You can adjust this breakpoint as needed
      setIsMobile(true);
    }

    // Optional: Add event listener to check on window resize
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='main'>
      <div className='overlay'></div>
      {/* Render appropriate video based on screen size */}
      <video
        src={isMobile ? videoBgMobile : videoBg}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className='cinestoke'>
        <h1>C I N E S T O K E</h1>
      </div>

      <Bars />
      <Pics />
      <Clients />
      <Contact />
      <Social />
      <div className="bottom-logo">
        <img src={footer} alt="Cinestoke Footer" />
      </div>
    </div>
  )
}

export default Main;
