import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as EditIcon } from '../assets/Edit.svg';
import { ReactComponent as DroneIcon } from '../assets/Drone.svg';
import { ReactComponent as FilmIcon } from '../assets/Film.svg';
import { ReactComponent as ShutterIcon } from '../assets/Shutter.svg';
import { ReactComponent as WingsIcon } from '../assets/Wings.svg';
import useScrollReveal from '../hooks/useScrollReveal';

const Bars = ({ onOpenReel, onScrollToStudies, onToggleLightMode }) => {
  const navigate = useNavigate();
  const barsRef = useRef(null);
  useScrollReveal(barsRef);

  return (
    <div className="cinestoke-section bars-section" ref={barsRef}>
      {/* Top line — animates scaleX(0→1) from center */}
      <div className="bars-hline" />

      {/* First Layer */}
      <div className="mui-box1">
        <div className="vertical-lineblack remove" />
        <ShutterIcon width="100" height="100" className="shutter-icon" />
        <div className="vertical-line remove" />
        <FilmIcon width="100" height="100" className="film-icon" />
        <div className="vertical-line short" />
        <p className="cinestoke-text" onClick={onOpenReel}>CINESTOKE</p>
        <div className="vertical-line short" />
        <DroneIcon width="100" height="100" className="drone-icon" />
        <div className="vertical-line remove" />
        <EditIcon width="100" height="100" className="edit-icon" />
        <div className="vertical-lineblack remove" />
      </div>

      {/* Mid line — between row 1 and row 2 */}
      <div className="bars-hline" />

      {/* Second Layer */}
      <div className="mui-box2">
        <div className="vertical-line2black remove" />
        <div className='twotext'>
          <p className="concept-text" onClick={onScrollToStudies}>Case Studies</p>
        </div>
        <div className="vertical-line2 remove" />
        <WingsIcon width="400" height="100" className="wings-icon" onClick={onToggleLightMode} />
        <div className="vertical-line2 remove" />
        <div className='twotext'>
          <p className="moments-text" onClick={() => navigate('/shop')}>Shop</p>
        </div>
        <div className="vertical-line2black remove" />
      </div>

      {/* Bottom line */}
      <div className="bars-hline" />
    </div>
  );
};

export default Bars;


