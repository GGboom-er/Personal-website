import React from 'react';

interface LiquidContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    active?: boolean; // Whether the effect is active
}

/**
 * LiquidContainer
 * Wraps content in a container where the BACKGROUND (and border) has a liquid distortion effect,
 * but the content remains readable and stable (though floating on top).
 * 
 * Uses the SVG filter defined in LiquidUIFilter.
 */
const LiquidContainer: React.FC<LiquidContainerProps> = ({
    children,
    className = '',
    active = true,
    ...props
}) => {
    return (
        <div className={`relative group ${className}`} {...props}>
            {/* 
        liquid-bg-layer:
        This layer sits behind the content. It mimics the box's appearance but applies the filter.
        We can't just apply filter to the parent because it affects children (content).
        So we separate them.
      */}
            <div
                className="absolute inset-0 z-0 pointer-events-none rounded-[inherit]"
                style={{
                    // Apply the background/border styles here that you want distorted
                    // For example, a glass effect needs a backdrop or a semi-transparent fill
                    background: 'rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(5px)', // Standard blur
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',

                    // The Liquid Distortion Filter
                    // Note: filter also affects backdrop-filter in some browsers
                    filter: active ? 'url(#liquid-glass-3d)' : 'none',

                    // Allow some overflow for the distortion to spill out slightly without clipping hard
                    opacity: 0.8,
                }}
            />

            {/* Content Layer - sits on top, stable */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default LiquidContainer;
