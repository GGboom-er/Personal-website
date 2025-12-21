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

// 生成流光渐变色 (统一函数)
// @param colors - 色彩数量 (2-6)
// @param intensity - 透明度 (0-1)
// @param angleVar - CSS 变量名 (默认 --flow-angle)
const getFlowGradient = (colors: number, intensity: number, angleVar = '--flow-angle') => {
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
      {/* 流光动画样式 - 使用全局 CSS 类 */}

      {/* 外发光层 */}
      <div
        className={`absolute pointer-events-none flow-animate ${className}`}
        style={{
          inset: -spread / 2,
          borderRadius,
          background: getFlowGradient(flowColors, normalizedIntensity * 0.8),
          filter: `blur(${spread}px)`,
          opacity: normalizedIntensity,
          animationDuration: `${flowSpeed}s`,
        }}
      />

      {/* 流光边框层 */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden flow-animate ${className}`}
        style={{
          borderRadius,
          padding: thickness,
          background: getFlowGradient(flowColors, 1),
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animationDuration: `${flowSpeed}s`,
        }}
      />

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
export { getFlowGradient };
