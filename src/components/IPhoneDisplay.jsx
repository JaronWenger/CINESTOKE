import React from 'react';
import iphoneFrame from '../assets/iPhone.webp';

const IPhoneDisplay = ({ screenshot, alt }) => {
    return (
        <div className="iphone-wrapper">
            <div className="iphone-wrapper-inner">
                <div className="iphone-display">
                    <div
                        className="iphone-screen-content"
                        role="img"
                        aria-label={`${alt} screen`}
                        style={{
                            backgroundImage: `url(${screenshot})`
                        }}
                    />
                    <img
                        src={iphoneFrame}
                        alt={alt || "iPhone"}
                        className="iphone-frame"
                    />
                </div>
            </div>
        </div>
    );
};

export default IPhoneDisplay;
