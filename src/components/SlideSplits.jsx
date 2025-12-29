import React from 'react';

const SlideSplits = ({ image }) => {
  return (
    <div className="slide-splits">
      <div className="slide-splits-image-container">
        <img
          src={image}
          alt="Splits"
          className="slide-splits-image"
        />
      </div>
    </div>
  );
};

export default SlideSplits;

