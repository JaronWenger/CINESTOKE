import React, { useState } from 'react';
import offers from '../assets/offers.webp';
import { ReactComponent as LeftWing } from '../assets/leftwing.svg';
import { ReactComponent as RightWing } from '../assets/rightwing.svg';

const Offers = () => {
  const [selectedCard, setSelectedCard] = useState('elite');

  return (
    <div className='offers-main'>
      <div className='overlay'></div>
      <img src={offers} alt="" className="background-image" />
      <div className="offers-section">
        <div className="offers-header">
          <LeftWing className="wing left-wing" />
          <h1>OFFERS</h1>
          <RightWing className="wing right-wing" />
        </div>
        <div className="offers-grid">
          <div 
            className={`offer-card ${selectedCard === 'deluxe' ? 'selected' : ''}`}
            onClick={() => setSelectedCard('deluxe')}
          >
            <h2>Deluxe</h2>
            <div className="price">$800</div>
            <ul>
              <li>10 Professional Photos</li>
              <li>2 Professional Reels</li>
              <li>Monthly Analytics</li>
              <li>Content Strategy Call</li>
            </ul>
          </div>

          <div 
            className={`offer-card ${selectedCard === 'premium' ? 'selected' : ''}`}
            onClick={() => setSelectedCard('premium')}
          >
            <h2>Premium</h2>
            <div className="price">$1,200</div>
            <ul>
              <li>15 Professional Photos</li>
              <li>4 Professional Reels</li>
              <li>Content Calendar</li>
              <li>Monthly Analytics + Optimization</li>
              <li>Content Strategy Call</li>
            </ul>
          </div>

          <div 
            className={`offer-card ${selectedCard === 'elite' ? 'selected' : ''}`}
            onClick={() => setSelectedCard('elite')}
          >
            <h2>Elite</h2>
            <div className="price">$500 + Rev Share</div>
            <ul>
              <li>15+ Professional Photos</li>
              <li>4+ Professional Reels</li>
              <li>Content Calendar</li>
              <li>Monthly Analytics + Optimization</li>
              <li>Content Strategy Call</li>
              <li>Account Management + Posting</li>
              <li>15% Revenue Share</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers; 