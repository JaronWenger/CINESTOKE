import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import { Navigation } from 'swiper/modules'; // Import Navigation and Pagination from 'swiper'
import 'swiper/css'; // Import basic Swiper styles
import 'swiper/css/navigation'; // Import styles for Navigation
import 'swiper/css/pagination'; // Import styles for Pagination

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
  return (
    <div className="carousel-container">
      <Swiper
        modules={[Mousewheel, Navigation]} // Specify the modules you are using
        spaceBetween={1} // Reduced space between slides
        slidesPerView={10}
        slidesPerGroup={2} // Move 3 slides at a time
        loop={true}
        navigation={{ clickable: true }} // Enable clickable navigation arrows
        mousewheel={{ forceToAxis: true }} 

        breakpoints={{
          0: {
            slidesPerView: 5,
          },
          640: {
            slidesPerView: 5,
          },
          768: {
            slidesPerView: 5,
          },
          1024: {
            slidesPerView: 8,
          },
        }}
      >
        <SwiperSlide>
        <p>Kayaking</p>
        <img src={kayak} alt="Kayak Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Nature</p>
        <img src={redwoods} alt="Redwoods Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Rollers</p>
        <img src={rollers} alt="Rollers Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Drone</p>
          <img src={drone} alt="Drone Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>FPV</p>
          <img src={FPV} alt="FPV Cinematic Production" />
        </SwiperSlide>

        <SwiperSlide>
        <p>Automotive</p>
          <img src={automotive} alt="Automotive Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Dirt Bikes</p>
        <img src={dirtbike} alt="Dirtbike Cinematic Production" />
        </SwiperSlide>
        {/* <SwiperSlide>
        <p>Weddings</p>
          <img src={weddings} alt="Weddings Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Portraits</p>
          <img src={portraits} alt="Portraits Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Real Estate</p>
        <img src={realestate} alt="Real Estate Cinematic Production" />
        </SwiperSlide> */}

        {/* <SwiperSlide>
        <p>Landscape</p>
        <img src={landscape} alt="Landscape Cinematic Production" />
        </SwiperSlide> */}
        {/* <SwiperSlide>
        <p>Artisan</p>
          <img src={smallbusiness} alt="Small Business Cinematic Production" />
        </SwiperSlide> */}
        {/* <SwiperSlide>
        <p>Sports</p>
          <img src={sports} alt="Sports Cinematic Production" />
        </SwiperSlide> */}
        <SwiperSlide>
        <p>Outdoors</p>
          <img src={nature} alt="Nature Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Snowboarding</p>
          <img src={snowboard} alt="Snowboarding Cinematic Production" />
        </SwiperSlide>

        {/* <SwiperSlide>
        <p>Boxing</p>
          <img src={boxing} alt="Boxing Cinematic Production" />
        </SwiperSlide> */}
        <SwiperSlide>
        <p>Jet Ski</p>
          <img src={jetski} alt="Jet Ski Cinematic Production" />
        </SwiperSlide>
        {/* <SwiperSlide>
        <p>Fishing</p>
          <img src={fishing} alt="Fishing Cinematic Production" />
        </SwiperSlide> */}
        <SwiperSlide>
        <p>Motorcycles</p>
          <img src={moto} alt="Motorcycle Cinematic Production" />
        </SwiperSlide>
        <SwiperSlide>
        <p>Mtn Biking</p>
          <img src={mtnbike} alt="Mountain Bike Cinematic Production" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Pics;
