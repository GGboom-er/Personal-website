import React, { useMemo } from 'react';
import { Project, LayoutSettings } from '../types';
import { ImageFrame, getFlowGradient } from './glass';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getAssetPath } from '../utils/assetPath';

interface ShowcaseProps {
  project: Project;
  settings: LayoutSettings;
}

// 布局模式：landscape(横屏)、portrait(竖屏)
type LayoutMode = 'landscape' | 'portrait';

const Showcase: React.FC<ShowcaseProps> = ({ project, settings }) => {
  const { width, height } = useBreakpoint();
  const aspectRatio = width / height;

  // 两阶段布局模式 - 仅基于宽高比
  const layoutMode: LayoutMode = useMemo(() => {
    return aspectRatio >= 1.2 ? 'landscape' : 'portrait';
  }, [aspectRatio]);

  // 平滑过渡因子（用于背景渐变）
  const transitionFactor = useMemo(() => {
    if (aspectRatio <= 0.8) return 0;
    if (aspectRatio >= 1.5) return 1;
    return (aspectRatio - 0.8) / 0.7;
  }, [aspectRatio]);

  // 基于视口的缩放因子 - 使用 clamp 思路
  const baseScale = useMemo(() => {
    // 基于视口较小边计算，确保内容适配
    const minDimension = Math.min(width, height);
    if (minDimension >= 800) return 1;
    if (minDimension >= 500) return 0.9;
    return 0.84;
  }, [width, height]);

  // 基于容器的缩放因子
  const scale = (settings.iconScale / 100) * baseScale;

  // 图标尺寸 - 固定大小，不随布局模式变化
  const iconWidth = Math.round(120 * scale);
  const iconHeight = Math.round(180 * scale);

  // 文字尺寸
  const fontSize = {
    title: Math.round(settings.titleSize * scale),
    titleEn: Math.round(settings.titleSize * 0.45 * scale),
    desc: Math.round(settings.descSize * scale),
  };

  // 间距
  const spacing = {
    gap: Math.round(14 * scale),
    padding: Math.round(12 * scale),
  };

  // 边框和发光参数
  const borderThickness = settings.borderThickness;
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;

  // View 区域内容 - 三组控件：按钮组、统计组、标签组
  // 使用 CSS clamp() 自适应，无 JS 缩放计算
  const ViewSection = () => {
    const isVertical = layoutMode === 'landscape';

    // 按钮组
    const ButtonGroup = () => (
      <div className="flex flex-shrink-0 justify-center items-center gap-1">
        {project.bilibiliUrl && (
          <a
            href={project.bilibiliUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-[#00A1D6]/90 to-[#0088cc]/90
              backdrop-blur-xl text-white font-bold rounded-full
              border border-[#00A1D6]/50
              shadow-[0_4px_16px_rgba(0,161,214,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
              hover:from-[#00B5E5] hover:to-[#00A1D6]
              hover:-translate-y-0.5 active:scale-[0.97]
              transition-all duration-200 inline-flex items-center gap-1 whitespace-nowrap
              text-[clamp(9px,2vw,12px)] px-[clamp(8px,2vw,14px)] py-[clamp(4px,1vw,8px)]"
          >
            <i className="fa-brands fa-bilibili"></i>
            Bilibili
          </a>
        )}
        {project.youtubeUrl && (
          <a
            href={project.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-[#FF0000]/90 to-[#cc0000]/90
              backdrop-blur-xl text-white font-bold rounded-full
              border border-[#FF0000]/50
              shadow-[0_4px_16px_rgba(255,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
              hover:from-[#ff2020] hover:to-[#FF0000]
              hover:-translate-y-0.5 active:scale-[0.97]
              transition-all duration-200 inline-flex items-center gap-1 whitespace-nowrap
              text-[clamp(9px,2vw,12px)] px-[clamp(8px,2vw,14px)] py-[clamp(4px,1vw,8px)]"
          >
            <i className="fa-brands fa-youtube"></i>
            YouTube
          </a>
        )}
        {!project.bilibiliUrl && !project.youtubeUrl && (
          <button
            className="bg-gradient-to-br from-white/90 to-white/80
              backdrop-blur-xl text-black font-bold rounded-full
              border border-white/50
              shadow-[0_4px_16px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.5)]
              hover:-translate-y-0.5 active:scale-[0.97]
              transition-all duration-200
              text-[clamp(9px,2vw,12px)] px-[clamp(8px,2vw,14px)] py-[clamp(4px,1vw,8px)]"
          >
            VIEW
          </button>
        )}
      </div>
    );

    // 统计组
    const StatsGroup = () => (
      <div
        className="flex rounded-xl relative overflow-hidden flex-shrink-0
          gap-[clamp(4px,1.5vw,10px)] px-[clamp(6px,1.5vw,12px)] py-[clamp(4px,1vw,8px)]"
        style={{
          background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.1})`,
          backdropFilter: `blur(${settings.glassBlur + 10}px) saturate(${settings.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${settings.glassBlur + 10}px) saturate(${settings.glassSaturate}%)`,
          border: `1px solid rgba(255,255,255,0.15)`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        {project.stats.map((stat, idx) => (
          <div
            key={idx}
            className="text-center border-r border-white/20 last:border-0 pr-[clamp(4px,1.5vw,10px)] last:pr-0"
          >
            <div className="text-white/60 uppercase font-semibold tracking-wider whitespace-nowrap
              text-[clamp(7px,1.5vw,10px)] mb-0.5">
              {stat.label}
            </div>
            <div className="text-white font-bold whitespace-nowrap text-[clamp(10px,2vw,14px)]">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    );

    // 标签组
    const TagsGroup = () => (
      <div className="flex justify-center items-center flex-shrink-0 gap-1 flex-nowrap">
        {project.tags.map(tag => (
          <span
            key={tag}
            className="font-medium rounded-full text-white cursor-default whitespace-nowrap
              text-[clamp(7px,1.5vw,10px)] px-[clamp(5px,1vw,9px)] py-[clamp(2px,0.5vw,4px)]"
            style={{
              background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.12})`,
              backdropFilter: `blur(${settings.glassBlur * 0.5 + 5}px)`,
              WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5 + 5}px)`,
              border: `1px solid rgba(255,255,255,0.12)`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    );

    return (
      <div className="w-full flex items-center justify-center overflow-hidden">
        <div
          className="flex items-center justify-center gap-[clamp(4px,1vw,12px)] flex-nowrap"
          style={{
            flexDirection: isVertical ? 'column' : 'row',
            transform: 'scale(var(--view-scale, 1))',
            transformOrigin: 'center center',
          }}
        >
          <ButtonGroup />
          <StatsGroup />
          <TagsGroup />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background - 与全局背景融合 */}
      <div className="absolute inset-0">
        {/* 主背景图 - 清晰显示 */}
        {project.heroImage && (
          <img
            key={`${project.id}-main`}
            src={getAssetPath(project.heroImage)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
            style={{
              opacity: 0.9,
            }}
          />
        )}

        {/* 暗角/晕影效果 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 130% 100% at 50% 50%, transparent 20%, rgba(10,10,12,0.3) 60%, rgba(10,10,12,0.7) 100%)`,
          }}
        />

        {/* 边缘渐变融合 - 与全局背景和卡片区域融合 */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,12,0.98) 0%, rgba(10,10,12,0.6) 15%, transparent 40%)',
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,12,0.5) 0%, transparent 30%)',
            opacity: (1 - transitionFactor) * 0.5 + 0.3,
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to right, rgba(10,10,12,0.7) 0%, transparent 25%)',
            opacity: transitionFactor * 0.6 + 0.2,
          }}
        />

        {/* 玻璃质感叠加 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)`,
          }}
        />
      </div>

      {/* Content Container - 可滚动（无滚动条） */}
      <div
        className="absolute inset-0 z-10 overflow-y-auto no-scrollbar transition-all duration-500 ease-out"
        style={{ padding: spacing.padding }}
      >
        {/* Landscape Layout: [Icon + Text] | [View] 横向 */}
        {layoutMode === 'landscape' && (
          <div
            className="h-full flex items-start justify-between transition-all duration-500"
            style={{ gap: spacing.gap, paddingTop: settings.contentOffset * 5 }}
          >
            {/* Left: Icon + Text */}
            <div className="flex items-start flex-1 min-w-0" style={{ gap: spacing.gap }}>
              {/* Icon */}
              <div className="relative shrink-0" style={{ width: iconWidth, height: iconHeight }}>
                {glowIntensity > 0 && (
                  <>
                    <div
                      className="absolute rounded-xl pointer-events-none flow-animate"
                      style={{
                        inset: -glowSpread / 2,
                        background: getFlowGradient(flowColors, glowIntensity * 0.6),
                        filter: `blur(${glowSpread}px)`,
                        opacity: glowIntensity * 0.8,
                        animationDuration: `${flowSpeed}s`,
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden flow-animate"
                      style={{
                        padding: glowThickness,
                        background: getFlowGradient(flowColors, 1),
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        animationDuration: `${flowSpeed}s`,
                      }}
                    />
                  </>
                )}
                <ImageFrame
                  src={getAssetPath(project.icon)}
                  alt={project.title}
                  aspectRatio="2/3"
                  borderThickness={borderThickness}
                  borderGlow={settings.borderGlow}
                  borderRefraction={settings.borderRefraction}
                  imageShadow={settings.imageShadow}
                  imageEdgeBlur={settings.imageEdgeBlur}
                  distortionIntensity={settings.distortionIntensity}
                  distortionScale={settings.distortionScale}
                  borderRadius="0.75rem"
                  className="w-full h-full"
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col justify-start">
                <div style={{ marginBottom: Math.round(8 * scale) }}>
                  <h1
                    className="font-bold tracking-tight leading-tight"
                    style={{
                      fontSize: fontSize.title,
                      fontFamily: settings.fontFamily,
                      color: settings.titleColor,
                      textShadow: `
                        0 1px 0 rgba(255,255,255,${settings.textHighlight / 100 * 0.4}),
                        0 2px 4px rgba(0,0,0,${settings.textShadow / 100 * 0.6}),
                        0 4px 12px rgba(0,0,0,${settings.textShadow / 100 * 0.4})
                      `,
                    }}
                  >
                    {project.title}
                  </h1>
                  {project.titleEn && (
                    <h2
                      className="font-medium tracking-wide"
                      style={{
                        fontSize: fontSize.titleEn,
                        marginTop: Math.round(2 * scale),
                        fontFamily: settings.fontFamily,
                        color: settings.titleColor,
                        opacity: 0.7,
                        textShadow: `
                          0 1px 0 rgba(255,255,255,${settings.textHighlight / 100 * 0.2}),
                          0 1px 3px rgba(0,0,0,${settings.textShadow / 100 * 0.4})
                        `,
                      }}
                    >
                      {project.titleEn}
                    </h2>
                  )}
                </div>
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: fontSize.desc,
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line',
                    maxWidth: '22em',
                    fontFamily: settings.fontFamily,
                    color: settings.descColor,
                    textShadow: `
                      0 1px 0 rgba(255,255,255,${settings.textHighlight / 100 * 0.15}),
                      0 1px 3px rgba(0,0,0,${settings.textShadow / 100 * 0.5})
                    `,
                  }}
                >
                  {project.description}
                </p>
              </div>
            </div>

            {/* Right: View Section */}
            <div className="shrink-0 self-start">
              <ViewSection />
            </div>
          </div>
        )}

        {/* Portrait Layout: 竖屏布局 - 图片上方、文字下方、View底部 */}
        {layoutMode === 'portrait' && (
          <div
            className="flex flex-col h-full"
            style={{ gap: Math.round(10 * scale) }}
          >
            {/* Top: Icon - 左对齐 */}
            <div
              className="relative shrink-0"
              style={{
                width: iconWidth,
                height: iconHeight,
              }}
            >
              {glowIntensity > 0 && (
                <>
                  <div
                    className="absolute rounded-xl pointer-events-none flow-animate"
                    style={{
                      inset: -glowSpread / 2,
                      background: getFlowGradient(flowColors, glowIntensity * 0.6),
                      filter: `blur(${glowSpread}px)`,
                      opacity: glowIntensity * 0.8,
                      animationDuration: `${flowSpeed}s`,
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden flow-animate"
                    style={{
                      padding: glowThickness,
                      background: getFlowGradient(flowColors, 1),
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      animationDuration: `${flowSpeed}s`,
                    }}
                  />
                </>
              )}
              <ImageFrame
                src={getAssetPath(project.icon)}
                alt={project.title}
                aspectRatio="2/3"
                borderThickness={borderThickness}
                borderGlow={settings.borderGlow}
                borderRefraction={settings.borderRefraction}
                imageShadow={settings.imageShadow}
                imageEdgeBlur={settings.imageEdgeBlur}
                distortionIntensity={settings.distortionIntensity}
                distortionScale={settings.distortionScale}
                borderRadius="0.5rem"
                className="w-full h-full"
              />
            </div>

            {/* Middle: Text - 左对齐，在图片下方 */}
            <div className="flex flex-col flex-1 min-h-0">
              <h1
                className="font-bold tracking-tight leading-tight"
                style={{
                  fontSize: fontSize.title,
                  fontFamily: settings.fontFamily,
                  color: settings.titleColor,
                  textShadow: `
                    0 1px 0 rgba(255,255,255,${settings.textHighlight / 100 * 0.4}),
                    0 2px 4px rgba(0,0,0,${settings.textShadow / 100 * 0.6})
                  `,
                }}
              >
                {project.title}
              </h1>
              {project.titleEn && (
                <h2
                  className="font-medium tracking-wide"
                  style={{
                    fontSize: fontSize.titleEn,
                    marginTop: Math.round(2 * scale),
                    fontFamily: settings.fontFamily,
                    color: settings.titleColor,
                    opacity: 0.7,
                  }}
                >
                  {project.titleEn}
                </h2>
              )}
              <p
                className="leading-relaxed mt-2"
                style={{
                  fontSize: fontSize.desc,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  fontFamily: settings.fontFamily,
                  color: settings.descColor,
                  maxWidth: '35em',
                }}
              >
                {project.description}
              </p>
            </div>

            {/* Bottom: View Section - 水平居中 */}
            <div className="shrink-0">
              <ViewSection />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase;
