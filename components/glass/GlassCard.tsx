import React, { useId } from 'react';
import { LayoutSettings } from '../DebugPanel';
import GlowBorder from './GlowBorder';
import ImageFrame from './ImageFrame';

interface GlassCardProps {
  image: string;
  title?: string;
  isActive: boolean;
  onClick: () => void;
  settings: LayoutSettings;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  image,
  title = '',
  isActive,
  onClick,
  settings,
  className = '',
}) => {
  const uniqueId = useId().replace(/:/g, '');

  // 统一的圆角值
  const borderRadius = '0.75rem';

  // 参数
  const cardImageScale = settings.cardImageScale / 100;
  const glowIntensity = settings.focusGlowIntensity;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;
  const hoverBlur = settings.hoverBlur;
  const hoverScale = settings.hoverScale / 100;
  const hoverOpacity = settings.hoverOpacity / 100;

  return (
    <>
      <style>{`
        #glass-card-${uniqueId} {
          --hover-scale: ${hoverScale};
          --hover-blur: ${hoverBlur}px;
          --card-image-scale: ${cardImageScale};
        }
        #glass-card-${uniqueId}:not(.active) {
          transform: scale(1);
          z-index: 1;
        }
        #glass-card-${uniqueId}.active {
          transform: scale(1.02);
          z-index: 10;
        }
        #glass-card-${uniqueId}:not(.active):hover {
          transform: scale(var(--hover-scale));
          z-index: 5;
        }
        #glass-card-${uniqueId} .hover-overlay {
          opacity: 0;
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
        }
        #glass-card-${uniqueId}:hover .hover-overlay {
          opacity: 1;
          backdrop-filter: blur(var(--hover-blur));
          -webkit-backdrop-filter: blur(var(--hover-blur));
        }
        #glass-card-${uniqueId} .hover-btn {
          transform: scale(0.9);
          opacity: 0;
        }
        #glass-card-${uniqueId}:hover .hover-btn {
          transform: scale(1);
          opacity: 1;
        }
        #glass-card-${uniqueId} .card-content {
          transform: scale(var(--card-image-scale));
          transform-origin: center center;
        }
        #glass-card-${uniqueId}:not(.active):hover .card-content {
          transform: scale(calc(var(--card-image-scale) * 1.02));
        }
      `}</style>

      <div
        id={`glass-card-${uniqueId}`}
        onClick={onClick}
        className={`${isActive ? 'active' : ''} group relative cursor-pointer
          transition-all duration-300 ease-out active:scale-[0.98]
          outline-none focus:outline-none ${className}`}
        style={{ padding: settings.cardPadding }}
      >
        {/* 统一的内容容器 - 所有视觉层都在这里，一起缩放 */}
        <div
          className="card-content relative w-full transition-transform duration-300"
          style={{ borderRadius }}
        >
          {/* Layer 1: 发光边框 - 仅激活时显示 */}
          {isActive && glowIntensity > 0 && (
            <GlowBorder
              intensity={glowIntensity}
              thickness={glowThickness}
              spread={glowSpread}
              flowSpeed={flowSpeed}
              flowColors={flowColors}
              borderRadius={borderRadius}
            />
          )}

          {/* Layer 2: 玻璃背景 */}
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              borderRadius,
              background: isActive
                ? `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.15})`
                : `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.05})`,
              backdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
              border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          />

          {/* Layer 3: 图片 */}
          <div className="relative z-10">
            <ImageFrame
              src={image}
              alt={title || 'card'}
              aspectRatio="2/3"
              borderThickness={settings.borderThickness}
              borderGlow={settings.borderGlow}
              borderRefraction={settings.borderRefraction}
              imageShadow={settings.imageShadow}
              imageEdgeBlur={settings.imageEdgeBlur}
              distortionIntensity={settings.distortionIntensity}
              distortionScale={settings.distortionScale}
              borderRadius={borderRadius}
            />
          </div>

          {/* Layer 4: 激活时的彩色边框发光 */}
          {isActive && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius,
                boxShadow: `
                  0 0 ${glowThickness * 2}px rgba(255,150,200,${glowIntensity / 100 * 0.4}),
                  0 0 ${glowThickness * 4}px rgba(150,200,255,${glowIntensity / 100 * 0.3}),
                  0 0 ${glowThickness * 6}px rgba(200,255,200,${glowIntensity / 100 * 0.2})
                `,
              }}
            />
          )}

          {/* Layer 5: 悬停遮罩层 */}
          {!isActive && (
            <div
              className="hover-overlay absolute inset-0 z-20 flex items-center justify-center
                transition-all duration-300 ease-out"
              style={{
                borderRadius,
                background: `linear-gradient(to top, rgba(0,0,0,${hoverOpacity * 0.8}) 0%, rgba(0,0,0,${hoverOpacity * 0.3}) 50%, transparent 100%)`,
              }}
            >
              <span
                className="hover-btn text-white text-[10px] font-semibold px-4 py-2 rounded-full
                  cursor-pointer transition-all duration-300 ease-out active:scale-[0.95]"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                点击查看详情
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GlassCard;
