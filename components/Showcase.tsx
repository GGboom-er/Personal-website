import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Project } from '../types';
import { LayoutSettings } from './DebugPanel';
import { ImageFrame, getFlowGradient } from './glass';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getAssetPath } from '../utils/assetPath';

interface ShowcaseProps {
  project: Project;
  settings: LayoutSettings;
}

// 布局模式 (移除 narrow，只保留 wide 和 medium)
type LayoutMode = 'wide' | 'medium';

const Showcase: React.FC<ShowcaseProps> = ({ project, settings }) => {
  const { width, height } = useBreakpoint();
  const aspectRatio = width / height;

  // 两阶段布局模式 (移除 narrow)
  const layoutMode: LayoutMode = useMemo(() => {
    if (aspectRatio > 1.4) return 'wide';      // 宽屏：完全横向
    return 'medium';                            // 中等及以下：图文横向 + View下方
  }, [aspectRatio]);

  // 平滑过渡因子
  const transitionFactor = useMemo(() => {
    if (aspectRatio <= 0.7) return 0;
    if (aspectRatio >= 1.6) return 1;
    return (aspectRatio - 0.7) / 0.9;
  }, [aspectRatio]);

  // 基于容器的缩放因子
  const scale = settings.iconScale / 100;

  // 图标尺寸 - 固定大小，不随布局模式变化
  const iconWidth = Math.round(120 * scale);
  const iconHeight = Math.round(180 * scale);

  // 文字缩放 - 根据布局模式调整
  const textScale = layoutMode === 'medium' ? 0.9 : 1;
  const fontSize = {
    title: Math.round(settings.titleSize * scale * textScale),
    titleEn: Math.round(settings.titleSize * 0.45 * scale * textScale),
    desc: Math.round(settings.descSize * scale * textScale),
    button: Math.round(12 * scale * textScale),
    statLabel: Math.round(10 * scale * textScale),
    statValue: Math.round(14 * scale * textScale),
    tag: Math.round(10 * scale * textScale),
  };

  // View 区域缩放 - 根据布局模式调整
  const viewScale = layoutMode === 'medium' ? 0.9 : 1;

  // 间距 - View 区域使用 viewScale
  const spacing = {
    gap: Math.round(14 * scale),
    padding: Math.round(16 * scale),
    buttonPadding: `${Math.round(8 * scale * viewScale)}px ${Math.round(14 * scale * viewScale)}px`,
    statPadding: `${Math.round(8 * scale * viewScale)}px ${Math.round(12 * scale * viewScale)}px`,
    tagPadding: `${Math.round(4 * scale * viewScale)}px ${Math.round(8 * scale * viewScale)}px`,
  };

  // 边框参数
  const borderThickness = settings.borderThickness;

  // 聚焦发光参数
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;

  // 背景融合参数
  const bgBlurBase = 8; // 基础背景模糊
  const bgBlurExtra = settings.imageEdgeBlur * 0.5;

  // View 区域内容 - 三组控件：按钮组、统计组、标签组
  // 宽屏布局：垂直排列（上中下）
  // 中等/窄屏布局：水平排列（左中右），自动缩放匹配容器
  const ViewSection = () => {
    const isVertical = layoutMode === 'wide';
    const viewContainerRef = useRef<HTMLDivElement>(null);
    const viewContentRef = useRef<HTMLDivElement>(null);
    const [viewSectionScale, setViewSectionScale] = useState(1);

    // 计算缩放比例以确保控件不换行
    useEffect(() => {
      if (isVertical) {
        setViewSectionScale(1);
        return;
      }

      const updateViewScale = () => {
        if (!viewContainerRef.current || !viewContentRef.current) return;

        // 临时移除缩放来测量真实宽度
        const content = viewContentRef.current;
        const originalTransform = content.style.transform;
        content.style.transform = 'none';

        const containerWidth = viewContainerRef.current.clientWidth;
        const contentWidth = content.scrollWidth;

        // 恢复缩放
        content.style.transform = originalTransform;

        if (contentWidth > containerWidth && containerWidth > 0) {
          // 留出一些边距 (0.95)
          setViewSectionScale(Math.max(0.4, (containerWidth / contentWidth) * 0.95));
        } else {
          setViewSectionScale(1);
        }
      };

      // 延迟执行以确保内容已渲染
      const timer = setTimeout(updateViewScale, 100);
      window.addEventListener('resize', updateViewScale);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateViewScale);
      };
    }, [isVertical, project.id]);

    // 动态缩放因子 - 根据布局和容器尺寸调整
    const containerScale = isVertical ? viewScale : Math.min(viewScale, 0.85);
    const itemGap = Math.round((isVertical ? 10 : 6) * scale * containerScale);
    const groupGap = Math.round((isVertical ? 12 : 8) * scale * containerScale);

    // 按钮组
    const ButtonGroup = () => (
      <div
        className="flex flex-shrink-0 justify-center items-center"
        style={{ gap: Math.round(4 * scale * containerScale) }}
      >
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
              transition-all duration-200 inline-flex items-center whitespace-nowrap"
            style={{
              fontSize: Math.round(11 * scale * containerScale),
              padding: `${Math.round(6 * scale * containerScale)}px ${Math.round(12 * scale * containerScale)}px`,
              gap: Math.round(3 * scale * containerScale),
            }}
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
              transition-all duration-200 inline-flex items-center whitespace-nowrap"
            style={{
              fontSize: Math.round(11 * scale * containerScale),
              padding: `${Math.round(6 * scale * containerScale)}px ${Math.round(12 * scale * containerScale)}px`,
              gap: Math.round(3 * scale * containerScale),
            }}
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
              transition-all duration-200"
            style={{
              fontSize: Math.round(11 * scale * containerScale),
              padding: `${Math.round(6 * scale * containerScale)}px ${Math.round(12 * scale * containerScale)}px`,
            }}
          >
            VIEW
          </button>
        )}
      </div>
    );

    // 统计组
    const StatsGroup = () => (
      <div
        className="flex rounded-xl relative overflow-hidden flex-shrink-0"
        style={{
          gap: Math.round(8 * scale * containerScale),
          padding: `${Math.round(6 * scale * containerScale)}px ${Math.round(10 * scale * containerScale)}px`,
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
            className="text-center border-r border-white/20 last:border-0"
            style={{ paddingRight: idx < project.stats.length - 1 ? Math.round(8 * scale * containerScale) : 0 }}
          >
            <div
              className="text-white/60 uppercase font-semibold tracking-wider whitespace-nowrap"
              style={{ fontSize: Math.round(9 * scale * containerScale), marginBottom: Math.round(1 * scale) }}
            >
              {stat.label}
            </div>
            <div
              className="text-white font-bold whitespace-nowrap"
              style={{ fontSize: Math.round(12 * scale * containerScale) }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    );

    // 标签组
    const TagsGroup = () => (
      <div
        className="flex justify-center items-center transition-all duration-500 flex-shrink-0"
        style={{ gap: Math.round(4 * scale * containerScale) }}
      >
        {project.tags.map(tag => (
          <span
            key={tag}
            className="font-medium rounded-full text-white cursor-default whitespace-nowrap"
            style={{
              fontSize: Math.round(9 * scale * containerScale),
              padding: `${Math.round(3 * scale * containerScale)}px ${Math.round(7 * scale * containerScale)}px`,
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
      <div
        ref={viewContainerRef}
        className="w-full flex items-center justify-center"
        style={{
          minHeight: isVertical ? 'auto' : `${60 * viewSectionScale}px`,
        }}
      >
        <div
          ref={viewContentRef}
          className="flex transition-all duration-300 ease-out"
          style={{
            flexDirection: isVertical ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: groupGap,
            flexWrap: 'nowrap',
            transform: isVertical ? 'none' : `scale(${viewSectionScale})`,
            transformOrigin: 'center center',
            whiteSpace: 'nowrap',
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
        {/* Wide Layout: [Icon + Text] | [View] 横向 */}
        {layoutMode === 'wide' && (
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

        {/* Medium Layout: [Icon | Text] 上方, [View] 下方 */}
        {layoutMode === 'medium' && (
          <div
            className="flex flex-col transition-all duration-500"
            style={{ gap: spacing.gap }}
          >
            {/* Top: Icon + Text */}
            <div className="flex items-start" style={{ gap: spacing.gap }}>
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
                <div style={{ marginBottom: Math.round(6 * scale) }}>
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
                    lineHeight: 1.5,
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

            {/* Bottom: View Section */}
            <ViewSection />
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase;
