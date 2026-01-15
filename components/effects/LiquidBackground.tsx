import React from 'react';

interface LiquidBackgroundProps {
  imageSrc: string;
  intensity?: number;
  saturation?: number;
}

const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ imageSrc }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#0a0a0c]">
      <img
        key={imageSrc}
        src={imageSrc}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default LiquidBackground;
