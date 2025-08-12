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
  const [isScrolling, setIsScrolling] = useState(false);

  const images = [
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
    { src: mtnbike, alt: "Mountain Bike Cinematic Production", label: "Mtn Biking" },
  ];

  // Single set of images, no looping
  const loopedImages = images;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="carousel-container">
      <div 
        ref={scrollContainerRef}
        className="carousel-scroll-container"
        style={{
          display: 'flex',
          gap: '1px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          willChange: 'scroll-position'
        }}
      >
        {loopedImages.map((image, index) => (
          <div 
            key={index} 
            className="swiper-slide"
            style={{
              flex: '0 0 auto',
              width: 'calc(100vw / 8)',
              minWidth: '120px',
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
                aspectRatio: '6.6 / 16',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
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
        
        @media (max-width: 1024px) {
          .swiper-slide {
            width: calc(100vw / 5) !important;
          }
        }
        
        @media (max-width: 768px) {
          .swiper-slide {
            width: calc(100vw / 5) !important;
          }
        }
        
        @media (max-width: 640px) {
          .swiper-slide {
            width: calc(100vw / 5) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Pics;
