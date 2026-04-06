import React from 'react';

// 流光基础颜色
const FLOW_COLORS = [
  [255, 100, 150], // 粉红
  [150, 100, 255], // 紫色
  [100, 200, 255], // 青蓝
  [100, 255, 180], // 青绿
  [255, 220, 100], // 金黄
  [255, 150, 100], // 橙色
];

// 辅助函数：生成流光渐变色
export const getFlowGradient = (colors: number, intensity: number, angleVar = '--flow-angle') => {
  const colorStops = [];

  for (let i = 0; i <= colors; i++) {
    const color = FLOW_COLORS[i % FLOW_COLORS.length];
    const percent = (i / colors) * 100;
    colorStops.push(`rgba(${color.join(',')},${intensity}) ${percent}%`);
  }
  // 闭环
  colorStops.push(`rgba(${FLOW_COLORS[0].join(',')},${intensity}) 100%`);

  return `conic-gradient(from var(${angleVar}, 0deg), ${colorStops.join(', ')})`;
};

// 辅助函数：生成静态流光渐变色（硬件加速用）
export const getStaticFlowGradient = (colors: number, intensity: number) => {
  const colorStops = [];
  for (let i = 0; i <= colors; i++) {
    const color = FLOW_COLORS[i % FLOW_COLORS.length];
    const percent = (i / colors) * 100;
    colorStops.push(`rgba(${color.join(',')},${intensity}) ${percent}%`);
  }
  colorStops.push(`rgba(${FLOW_COLORS[0].join(',')},${intensity}) 100%`);
  return `conic-gradient(from 0deg, ${colorStops.join(', ')})`;
};

interface ImageFrameProps {
  src: string;
  alt: string;
  aspectRatio?: string;           // 宽高比, 如 "2/3"
  borderThickness: number;        // 边框厚度
  borderGlow: number;             // 边框发光 0-100
  borderRefraction: number;       // 折射色彩 0-100
  imageShadow: number;            // 图片阴影 0-100
  imageEdgeBlur: number;          // 边缘模糊
  distortionIntensity: number;    // 扭曲强度 0-100
  distortionScale: number;        // 扭曲范围
  className?: string;
  borderRadius?: string;
}

const ImageFrame: React.FC<ImageFrameProps> = ({
  src,
  alt,
  aspectRatio = '2/3',
  borderThickness,
  borderGlow,
  borderRefraction,
  imageShadow,
  imageEdgeBlur,
  distortionIntensity,
  distortionScale,
  className = '',
  borderRadius = '0.75rem',
}) => {
  const glowNorm = borderGlow / 100;
  const refractNorm = borderRefraction / 100;
  const shadowNorm = imageShadow / 100;
  const distortNorm = distortionIntensity / 100;

  // 计算折射色彩偏移
  const chromaticOffset = refractNorm * 2;

  // 通过 CSS 变量驱动共享 @keyframes glassShimmer（定义在 glass.css）
  const shimmerStyle: React.CSSProperties = {
    '--shimmer-min': refractNorm * 0.3,
    '--shimmer-max': refractNorm * 0.5,
    animation: 'glassShimmer 3s ease-in-out infinite',
  } as React.CSSProperties;

  return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          aspectRatio,
          borderRadius,
        }}
      >
        {/* 主图片 */}
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            transform: `scale(${1 + distortNorm * 0.02})`,
          }}
        />

        {/* 色散/折射效果层 - 合并红通道+蓝通道+拉丝纹理为 1 个 div */}
        {refractNorm > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                ...shimmerStyle,
                background: `
                  linear-gradient(${45 + distortNorm * 30}deg,
                    rgba(255,100,100,${refractNorm * 0.15}) 0%,
                    transparent 30%,
                    transparent 70%,
                    rgba(255,150,150,${refractNorm * 0.1}) 100%),
                  linear-gradient(${-45 - distortNorm * 30}deg,
                    rgba(100,100,255,${refractNorm * 0.15}) 0%,
                    transparent 30%,
                    transparent 70%,
                    rgba(150,150,255,${refractNorm * 0.1}) 100%),
                  repeating-linear-gradient(
                    ${90 + distortNorm * 45}deg,
                    transparent 0px,
                    transparent ${2 + distortionScale * 0.1}px,
                    rgba(255,255,255,${refractNorm * 0.03}) ${2 + distortionScale * 0.1}px,
                    rgba(255,255,255,${refractNorm * 0.03}) ${3 + distortionScale * 0.15}px
                  )
                `,
                mixBlendMode: 'screen',
                transform: `translateX(${chromaticOffset * 0.5}px) translateZ(0)`,
                willChange: 'opacity, transform',
              }}
            />
        )}

        {/* 扭曲效果层 - box-shadow 模拟，移除 backdrop-filter */}
        {distortNorm > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage: `radial-gradient(ellipse at center, transparent ${50 - distortNorm * 20}%, black 100%)`,
                WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${50 - distortNorm * 20}%, black 100%)`,
                boxShadow: `
                  inset ${distortNorm * 3}px 0 ${distortionScale}px rgba(255,100,100,${distortNorm * 0.2}),
                  inset ${-distortNorm * 3}px 0 ${distortionScale}px rgba(100,100,255,${distortNorm * 0.2}),
                  inset 0 ${distortNorm * 2}px ${distortionScale * 0.5}px rgba(100,255,100,${distortNorm * 0.1})
                `,
                borderRadius,
              }}
            />
        )}

        {/* 边缘暗化层 - linear-gradient 模拟，移除 backdrop-filter */}
        {imageEdgeBlur > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,${imageEdgeBlur * 0.015}) 0%, transparent 10%, transparent 90%, rgba(0,0,0,${imageEdgeBlur * 0.015}) 100%),
                linear-gradient(to right, rgba(0,0,0,${imageEdgeBlur * 0.015}) 0%, transparent 10%, transparent 90%, rgba(0,0,0,${imageEdgeBlur * 0.015}) 100%)`,
            }}
          />
        )}

        {/* 玻璃边框 + 高光层 - 合并为 1 个 div */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            background: `
              linear-gradient(135deg,
                rgba(255,255,255,${refractNorm * 0.2}) 0%,
                rgba(255,255,255,${refractNorm * 0.05}) 20%,
                transparent 40%,
                transparent 60%,
                rgba(0,0,0,${refractNorm * 0.1}) 100%),
              linear-gradient(to bottom,
                rgba(255,255,255,${refractNorm * 0.1}) 0%,
                transparent 5%,
                transparent 95%,
                rgba(0,0,0,${refractNorm * 0.05}) 100%)
            `,
            boxShadow: `
              inset 0 ${borderThickness * 1.5}px ${borderThickness * 3}px rgba(255,255,255,${refractNorm * 0.35}),
              inset 0 -${borderThickness}px ${borderThickness * 2}px rgba(0,0,0,${refractNorm * 0.25}),
              inset ${borderThickness}px 0 ${borderThickness * 2}px rgba(255,180,180,${refractNorm * 0.2}),
              inset -${borderThickness}px 0 ${borderThickness * 2}px rgba(180,180,255,${refractNorm * 0.2}),
              0 0 ${glowNorm * 25}px rgba(255,255,255,${glowNorm * 0.35}),
              0 ${shadowNorm * 20}px ${shadowNorm * 40}px rgba(0,0,0,${shadowNorm * 0.6})
            `,
            border: `${borderThickness}px solid rgba(255,255,255,${refractNorm * 0.25})`,
          }}
        />

        {/* 顶部锐利高光线 */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              rgba(255,255,255,${refractNorm * 0.6}) 20%,
              rgba(255,255,255,${refractNorm * 0.8}) 50%,
              rgba(255,255,255,${refractNorm * 0.6}) 80%,
              transparent 100%)`,
          }}
        />
      </div>
  );
};

export default ImageFrame;
