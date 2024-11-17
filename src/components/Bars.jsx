import React from 'react';
import { ReactComponent as EditIcon } from '../assets/Edit.svg';
import { ReactComponent as DroneIcon } from '../assets/Drone.svg';
import { ReactComponent as FilmIcon } from '../assets/Film.svg';
import { ReactComponent as ShutterIcon } from '../assets/Shutter.svg';
import { ReactComponent as WingsIcon } from '../assets/Wings.svg';

const Bars = () => {
  return (
    <div className="cinestoke-section">
      {/* First Layer */}
      <div className="mui-box1">
                {/* Vertical Line */}
                <div className="vertical-lineblack remove" />
        
          <ShutterIcon width="100" height="100" className="shutter-icon" />
        

        {/* Vertical Line */}
        <div className="vertical-line remove" />

        
          <FilmIcon width="100" height="100" className="film-icon" />
       

        {/* Vertical Line */}
        <div className="vertical-line short" />

        <p className="cinestoke-text">CINESTOKE</p>

        {/* Vertical Line */}
        <div className="vertical-line short" />

        
          <DroneIcon width="100" height="100" className="drone-icon" />
        

        {/* Vertical Line */}
        <div className="vertical-line remove" />

        
          <EditIcon width="100" height="100" className="edit-icon" />
        
                {/* Vertical Line */}
                <div className="vertical-lineblack remove" />
      </div>

      {/* Second Layer */}
      <div className="mui-box2">
                   {/* Vertical Line */}
                   <div className="vertical-line2black remove" />
        <div className='twotext'>
        <p className="concept-text">Concept to Creation</p>
        </div>

                {/* Vertical Line */}
                <div className="vertical-line2 remove" />

        <WingsIcon width="400" height="100" className="wings-icon"/>

                {/* Vertical Line */}
                <div className="vertical-line2 remove" />

        <div className='twotext'>
        <p className="moments-text">Create Moments, <br />Capture Feelings</p>
        </div>
                   {/* Vertical Line */}
                   <div className="vertical-line2black remove" />
      </div>
    </div>
  );
};

export default Bars;


