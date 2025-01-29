import React from 'react';
// Import the SVG as a React component
import { ReactComponent as SSBC } from '../assets/SSBC.svg';
import { ReactComponent as TCO } from '../assets/TCO.svg';
import { ReactComponent as GFF } from '../assets/GFF.svg';
import { ReactComponent as IR } from '../assets/IR.svg';
import { ReactComponent as Suzuki } from '../assets/Suzuki.svg';
import { ReactComponent as Seadoo } from '../assets/Seadoo.svg';

const Clients = () => {
  return (
    <div className="cinestoke-section">
      {/* First Layer */}
      <div className="mui-box1">
        {/* Vertical Line */}
        <div className="lineb" />

        {/* Inline SVG for SSBC */}
        <Seadoo alt="Seadoo Logo" />

        {/* Vertical Line */}
        <div className="line" />

        {/* Inline SVG for TCO */}
        <TCO alt="TCO Logo" />

        {/* Vertical Line */}
        <div className="line" />

        {/* Inline SVG for GFF */}
        <GFF alt="GFF Logo" />

        {/* Vertical Line */}
        <div className="line" />

        {/* Inline SVG for IR */}
        <IR alt="IR Logo" />

        {/* Vertical Line */}
        <div className="line" />

        {/* Inline SVG for Suzuki */}
        <Suzuki alt="Suzuki Logo" />

        {/* Vertical Line */}
        <div className="lineb" />
      </div>
    </div>
  );
};

export default Clients;
