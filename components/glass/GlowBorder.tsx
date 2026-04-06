import React from 'react';

interface GlowBorderProps {
  intensity: number;      // 发光强度 0-100
  thickness: number;      // 边框厚度 px
  spread: number;         // 扩散距离 px
  flowSpeed: number;      // 流光速度 s
  flowColors: number;     // 色彩数量 2-6
  borderRadius?: string;  // 圆角
  className?: string;
}

// 流光基础颜色
const FLOW_COLORS = [
  [255, 100, 150], // 粉红
  [150, 100, 255], // 紫色
  [100, 200, 255], // 青蓝
  [100, 255, 180], // 青绿
  [255, 220, 100], // 金黄
  [255, 150, 100], // 橙色
];

// 生成流光渐变色 (包含 var--flow-angle 用于向下兼容)
const getFlowGradient = (colors: number, intensity: number, angleVar = '--flow-angle') => {
  const colorStops = [];
  for (let i = 0; i <= colors; i++) {
    const color = FLOW_COLORS[i % FLOW_COLORS.length];
    const percent = (i / colors) * 100;
    colorStops.push(`rgba(${color.join(',')},${intensity}) ${percent}%`);
  }
  colorStops.push(`rgba(${FLOW_COLORS[0].join(',')},${intensity}) 100%`);
  return `conic-gradient(from var(${angleVar}, 0deg), ${colorStops.join(', ')})`;
};

// 为硬件加速动画生成静态流光渐变色（没有CSS变量）
const getStaticFlowGradient = (colors: number, intensity: number) => {
  const colorStops = [];
  for (let i = 0; i <= colors; i++) {
    const color = FLOW_COLORS[i % FLOW_COLORS.length];
    const percent = (i / colors) * 100;
    colorStops.push(`rgba(${color.join(',')},${intensity}) ${percent}%`);
  }
  colorStops.push(`rgba(${FLOW_COLORS[0].join(',')},${intensity}) 100%`);
  return `conic-gradient(from 0deg, ${colorStops.join(', ')})`;
};

const GlowBorder: React.FC<GlowBorderProps> = ({
  intensity,
  thickness,
  spread,
  flowSpeed,
  flowColors,
  borderRadius = '1rem',
  className = '',
}) => {
  const normalizedIntensity = intensity / 100;

  if (normalizedIntensity <= 0) return null;

  return (
    <>
      {/* 外发光层 - 使用 translateZ 强制 GPU 加速并用 pseudo element 旋转 */}
      <div
        className={`absolute pointer-events-none ${className}`}
        style={{
          inset: -spread / 2,
          borderRadius,
          filter: `blur(${spread}px)`,
          opacity: normalizedIntensity,
          transform: 'translateZ(0)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius }}>
          <div
            className="absolute top-1/2 left-1/2 flow-animate-rotate"
            style={{
              width: '200vmax',
              height: '200vmax',
              background: getStaticFlowGradient(flowColors, 0.8),
              animationDuration: `${flowSpeed}s`,
            }}
          />
        </div>
      </div>

      {/* 流光边框层 - 修复 iOS 遮罩 bug 与卡顿现象 */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        style={{
          borderRadius,
          border: `${thickness}px solid transparent`,
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          transform: 'translateZ(0)',
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 flow-animate-rotate"
          style={{
            width: '200vmax',
            height: '200vmax',
            background: getStaticFlowGradient(flowColors, 1),
            animationDuration: `${flowSpeed}s`,
          }}
        />
      </div>

      {/* 内发光层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          boxShadow: `
            0 0 ${thickness * 2}px rgba(255,150,200,${normalizedIntensity * 0.4}),
            0 0 ${thickness * 4}px rgba(150,200,255,${normalizedIntensity * 0.3}),
            0 0 ${thickness * 6}px rgba(200,255,200,${normalizedIntensity * 0.2})
          `,
        }}
      />
    </>
  );
};

export default GlowBorder;
export { getFlowGradient, getStaticFlowGradient };
