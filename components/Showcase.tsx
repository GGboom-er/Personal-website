import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Project, LayoutSettings } from '../types';
import { ImageFrame, getStaticFlowGradient, getFlowGradient } from './glass';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getAssetPath } from '../utils/assetPath';

interface ShowcaseProps {
  project: Project;
  settings: LayoutSettings;
}

// 布局模式：landscape(横屏)、portrait(竖屏)
type LayoutMode = 'landscape' | 'portrait';

// ── 模块级子组件（避免每次渲染重建） ──

interface ButtonGroupProps {
  project: Project;
}
const ButtonGroup: React.FC<ButtonGroupProps> = ({ project }) => (
  <div className="flex flex-shrink-0 justify-center items-center gap-1">
    {project.bilibiliUrl && (
      <a
        href={project.bilibiliUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-br from-[#00A1D6]/90 to-[#0088cc]/90
          text-white font-bold rounded-full
          border border-[#00A1D6]/50
          shadow-[0_4px_16px_rgba(0,161,214,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
          hover:from-[#00B5E5] hover:to-[#00A1D6]
          hover:-translate-y-0.5 active:scale-[0.97]
          transition-all duration-200 inline-flex items-center gap-1 whitespace-nowrap
          text-[11px] px-4 py-1.5"
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
          text-white font-bold rounded-full
          border border-[#FF0000]/50
          shadow-[0_4px_16px_rgba(255,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
          hover:from-[#ff2020] hover:to-[#FF0000]
          hover:-translate-y-0.5 active:scale-[0.97]
          transition-all duration-200 inline-flex items-center gap-1 whitespace-nowrap
          text-[11px] px-4 py-1.5"
      >
        <i className="fa-brands fa-youtube"></i>
        YouTube
      </a>
    )}
    {!project.bilibiliUrl && !project.youtubeUrl && (
      <button
        className="bg-gradient-to-br from-white/90 to-white/80
          text-black font-bold rounded-full
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

interface StatsGroupProps {
  stats: Project['stats'];
  settings: LayoutSettings;
}
const StatsGroup: React.FC<StatsGroupProps> = ({ stats, settings }) => (
  <div
    className="flex rounded-xl relative overflow-hidden flex-shrink-0
      gap-[clamp(4px,1.5vw,10px)] px-[clamp(6px,1.5vw,12px)] py-[clamp(4px,1vw,8px)]"
    style={{
      background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.12}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.05}) 100%)`,
      border: `1px solid rgba(255,255,255,0.15)`,
      boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
    }}
  >
    {stats.map((stat, idx) => (
      <div
        key={idx}
        className="text-center border-r border-white/20 last:border-0 pr-[clamp(5px,1.8vw,12px)] last:pr-0"
      >
        <div className="text-white/60 uppercase font-semibold tracking-wider whitespace-nowrap
          text-[clamp(8px,1.8vw,12px)] mb-0.5">
          {stat.label}
        </div>
        <div className="text-white font-bold whitespace-nowrap text-[clamp(12px,2.4vw,17px)]">
          {stat.value}
        </div>
      </div>
    ))}
  </div>
);

interface TagsGroupProps {
  tags: Project['tags'];
  settings: LayoutSettings;
}
const TagsGroup: React.FC<TagsGroupProps> = ({ tags, settings }) => (
  <div className="flex justify-center items-center flex-shrink-0 gap-1 flex-nowrap">
    {tags.map(tag => (
      <span
        key={tag}
        className="font-medium rounded-full text-white cursor-default whitespace-nowrap
          text-[clamp(8px,1.8vw,12px)] px-[clamp(6px,1.2vw,11px)] py-[clamp(2px,0.6vw,5px)]"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.14}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.06}) 100%)`,
          border: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
        }}
      >
        {tag}
      </span>
    ))}
  </div>
);

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
    if (minDimension >= 800) return 1.2;
    if (minDimension >= 500) return 1.08;
    return 1.0;
  }, [width, height]);

  // 基于容器的缩放因子
  const scale = (settings.iconScale / 100) * baseScale;

  // 图标尺寸 - 固定大小，不随布局模式变化
  // 图标尺寸 - 缩容高度 1/3 (从 180 降至 120)
  // 图标尺寸 - 调整高度至 135 (约 120 的 1.125倍)
  const iconWidth = Math.round(96 * scale);
  const iconHeight = Math.round(135 * scale);

  // 文字尺寸 - 基础字号减少 2px
  const fontSize = {
    title: Math.round((settings.titleSize - 2) * scale),
    titleEn: Math.round((settings.titleSize - 2) * 0.45 * scale),
    desc: Math.round((settings.descSize - 2) * scale),
  };

  // 间距
  const spacing = {
    gap: Math.round(18 * scale),
    padding: Math.round(16 * scale),
  };

  // 边框和发光参数
  const borderThickness = settings.borderThickness;
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;

  // View 区域内容 - 三组控件：按钮组、统计组、标签组
  // 始终单行，基于容器宽度自适应缩放
  const ViewSection = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [viewScale, setViewScale] = useState(1);

    const recalc = useCallback(() => {
      const wrapper = wrapperRef.current;
      const inner = innerRef.current;
      if (!wrapper || !inner) return;
      // 先重置为 1 测量真实宽度
      inner.style.transform = 'scale(1)';
      const contentW = inner.scrollWidth;
      const containerW = wrapper.clientWidth;
      const fit = containerW > 0 && contentW > 0
        ? Math.min(containerW / contentW, 1.2)
        : 1;
      setViewScale(fit);
      inner.style.transform = `scale(${fit})`;
    }, []);

    useEffect(() => {
      recalc();
      const ro = new ResizeObserver(recalc);
      if (wrapperRef.current) ro.observe(wrapperRef.current);
      return () => ro.disconnect();
    }, [recalc, project.id]);

    return (
      <div ref={wrapperRef} className="w-full flex items-center justify-center overflow-hidden">
        <div
          ref={innerRef}
          className="flex items-center justify-center gap-3 flex-nowrap whitespace-nowrap"
          style={{
            transform: `scale(${viewScale})`,
            transformOrigin: 'center center',
          }}
        >
          <ButtonGroup project={project} />
          <StatsGroup stats={project.stats} settings={settings} />
          <TagsGroup tags={project.tags} settings={settings} />
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
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
              style={{
                opacity: 0.9,
              }}
            />
        )}

        {/* 暗角/晕影效果 - 亮度降低20% */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 130% 100% at 50% 50%, rgba(10,10,12,0.2) 20%, rgba(10,10,12,0.5) 60%, rgba(10,10,12,0.85) 100%)`,
          }}
        />

        {/* 边缘渐变融合 - 加深暗部 */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,12,0.98) 0%, rgba(10,10,12,0.8) 15%, rgba(10,10,12,0.2) 40%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,12,0.6) 0%, rgba(10,10,12,0.2) 30%, transparent 50%)',
            opacity: (1 - transitionFactor) * 0.6 + 0.4,
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(to right, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.3) 25%, transparent 50%)',
            opacity: transitionFactor * 0.7 + 0.3,
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
        className="absolute inset-0 z-10 overflow-y-auto no-scrollbar transition-all duration-500 ease-out flex flex-col"
        style={{ padding: spacing.padding, paddingBottom: Math.round(spacing.padding / 2) }}
      >
        {/* Landscape Layout: [Icon + Text] | [View] 横向 */}
        {/* Landscape Layout: [Icon + Text] Over [View] */}
        {layoutMode === 'landscape' && (
          <div
            className="h-full flex flex-col transition-all duration-500"
            style={{ paddingTop: settings.contentOffset * 5 }}
          >
            {/* Top Section: Icon + Text */}
            <div className="flex items-start min-w-0" style={{ gap: spacing.gap }}>
              {/* Icon */}
              <div className="relative shrink-0" style={{ width: iconWidth, height: iconHeight }}>
                {glowIntensity > 0 && (
                  <>
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        inset: -glowSpread / 2,
                        borderRadius: '0.75rem',
                        filter: `blur(${glowSpread}px)`,
                        opacity: glowIntensity * 0.8,
                        transform: 'translateZ(0)',
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '0.75rem' }}>
                        <div
                          className="absolute top-1/2 left-1/2 flow-animate-rotate"
                          style={{
                            width: '200vmax',
                            height: '200vmax',
                            background: getStaticFlowGradient(flowColors, 0.6),
                            animationDuration: `${flowSpeed}s`,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{
                        borderRadius: '0.75rem',
                        border: `${glowThickness}px solid transparent`,
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
                    whiteSpace: 'pre-wrap',
                    maxWidth: '50em',
                    minWidth: '200px',
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

            {/* Bottom Section: Info Panel - Pushed to bottom and aligned left */}
            <div className="mt-auto flex justify-start">
              <ViewSection />
            </div>
          </div>
        )}

        {/* Portrait Layout: 竖屏布局 - [海报+标题横排] -> [描述文字] -> [功能区贴底] */}
        {layoutMode === 'portrait' && (
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{ gap: Math.round(4 * scale) }}
          >
            {/* 1. Top: Icon + Title 横排 */}
            <div className="flex items-start shrink-0" style={{ gap: spacing.gap }}>
              {/* Icon */}
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
                      className="absolute pointer-events-none"
                      style={{
                        inset: -glowSpread / 2,
                        borderRadius: '0.5rem',
                        filter: `blur(${glowSpread}px)`,
                        opacity: glowIntensity * 0.8,
                        transform: 'translateZ(0)',
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '0.5rem' }}>
                        <div
                          className="absolute top-1/2 left-1/2 flow-animate-rotate"
                          style={{
                            width: '200vmax',
                            height: '200vmax',
                            background: getStaticFlowGradient(flowColors, 0.6),
                            animationDuration: `${flowSpeed}s`,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{
                        borderRadius: '0.5rem',
                        border: `${glowThickness}px solid transparent`,
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
                  </>
                )}
                <ImageFrame
                  src={getAssetPath(project.icon)}
                  alt={project.title}
                  aspectRatio="4/5"
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

              {/* Title + English Title */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h1
                  className="font-bold tracking-tight leading-tight"
                  style={{
                    fontSize: fontSize.title,
                    fontFamily: settings.fontFamily,
                    color: settings.titleColor,
                    textShadow: `0 2px 4px rgba(0,0,0,0.5)`,
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
                      textShadow: `0 1px 3px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {project.titleEn}
                  </h2>
                )}
              </div>
            </div>

            {/* 2. Middle: Description 独占整行宽度，可滚动 */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <p
                className="leading-relaxed"
                style={{
                  fontSize: fontSize.desc,
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  color: settings.descColor,
                  fontFamily: settings.fontFamily,
                  opacity: 0.9,
                }}
              >
                {project.description}
              </p>
            </div>

            {/* 3. Bottom: ViewSection 贴底 */}
            <div className="shrink-0 border-t border-white/5">
              <div style={{ transformOrigin: 'bottom center' }}>
                <ViewSection />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase;
