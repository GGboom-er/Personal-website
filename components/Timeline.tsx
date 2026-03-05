import React, { useRef, useEffect, useState, useMemo } from 'react';
import { LayoutSettings, TimelineNode } from '../types';
import { getFlowGradient } from './glass';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useGlassSettings } from '../contexts/GlassSettingsContext';
import { useDragEditor, NodeLayoutConfig } from '../contexts/DragEditorContext';
import timelineData from '../data/timeline.json';
import UserProfileCard from './shared/UserProfileCard';
import ContactLinks from './shared/ContactLinks';
import LuminaHull from './lumina/LuminaHull';
import hullData from '../data/hulls.json';
const DEFAULT_TIMELINE_DATA: TimelineNode[] = timelineData.timeline as TimelineNode[];

interface TimelineProps {
  settings: LayoutSettings;
  data?: TimelineNode[];
}

const GLOW_COLORS = {
  education: { primary: 'rgba(168,85,247,1)', glow: 'rgba(168,85,247,0.6)' },
  internship: { primary: 'rgba(236,72,153,1)', glow: 'rgba(236,72,153,0.6)' },
  work: { primary: 'rgba(6,182,212,1)', glow: 'rgba(6,182,212,0.6)' },
};

const TIMELINE_CONFIG = {
  BASE_WIDTH: 900,
  BASE_HEIGHT: 500,
  MOBILE_BASE_WIDTH: 400,
  MOBILE_BASE_HEIGHT: 800,
  MIN_SCALE: 0.4,
  MAX_SCALE: 1.5,
  SCALE_MARGIN: 0.95,
  CONTAINER_PADDING: 32,
} as const;

interface LayoutWrapperProps {
  nodeId: string;
  elementType: keyof NodeLayoutConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isMobile: boolean;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  nodeId,
  elementType,
  children,
  className = '',
  style,
  isMobile,
}) => {
  const { getElementLayout } = useDragEditor();
  const layout = getElementLayout(nodeId, elementType, isMobile);
  const baseTransform = style?.transform || '';

  return (
    <div
      className={className}
      style={{
        ...style,
        transform: `${baseTransform} translate(${layout.offsetX}px, ${layout.offsetY}px) rotate(${layout.rotation}deg) scale(${layout.scale})`.trim(),
      }}
    >
      {children}
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ settings: globalSettings, data = DEFAULT_TIMELINE_DATA }) => {
  const { getNodeSettings, settings: contextSettings } = useGlassSettings();
  const settings = contextSettings || globalSettings;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const BASE_WIDTH = isMobile ? TIMELINE_CONFIG.MOBILE_BASE_WIDTH : TIMELINE_CONFIG.BASE_WIDTH;
  const BASE_HEIGHT = isMobile ? TIMELINE_CONFIG.MOBILE_BASE_HEIGHT : TIMELINE_CONFIG.BASE_HEIGHT;

  const minYear = 2017;
  const maxYear = 2025;
  const totalYears = maxYear - minYear;
  const getPosition = (year: number) => ((year - minYear) / totalYears) * 100;

  // ── 移动端需要计算 containerHeight 以动态拉伸时间轴 ──
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - TIMELINE_CONFIG.CONTAINER_PADDING * (isMobile ? 1 : 2);
      const containerHeight = containerRef.current.clientHeight - TIMELINE_CONFIG.CONTAINER_PADDING * (isMobile ? 1 : 2);

      // Desktop uses standard 900x500 box format
      let actualBaseWidth = BASE_WIDTH;
      let actualBaseHeight = BASE_HEIGHT;

      if (isMobile) {
        // 移动端：用宽度决定缩放比，上限 1.0 避免中间态（480-768px）内容过大
        const mobileScale = Math.min(containerWidth / actualBaseWidth, 1.0);
        setScale(Math.max(TIMELINE_CONFIG.MIN_SCALE, mobileScale));
        setContainerH(containerHeight);
        return;
      }

      const widthScale = containerWidth / actualBaseWidth;
      const heightScale = containerHeight / actualBaseHeight;
      const optimalScale = Math.min(widthScale, heightScale, TIMELINE_CONFIG.MAX_SCALE);
      setScale(Math.max(TIMELINE_CONFIG.MIN_SCALE, optimalScale * TIMELINE_CONFIG.SCALE_MARGIN));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isMobile, BASE_WIDTH, BASE_HEIGHT, data.length]);

  const glassBlur = settings.glassBlur;
  const glassSaturate = settings.glassSaturate;
  const glassBgOpacity = settings.glassBgOpacity / 100;

  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;

  const cardGlow = settings.timelineCardGlow / 100;
  const keyYears = [...new Set(data.flatMap(node => [node.startYear, node.endYear]))].sort((a, b) => a - b);

  // Profile Style Extraction
  const borderThickness = settings.borderThickness;
  const borderRefraction = settings.borderRefraction / 100;

  // ==================== Mobile Layout ====================
  if (isMobile) {
    const mobileCardWidth = settings.mobileCardWidth;
    const mobileCardOffsetX = settings.mobileCardOffsetX;
    const mobileCardSpread = settings.mobileCardSpread / 100;
    const pipeWidth = settings.mobilePipeWidth;
    const pipeMargin = 24;
    const profileCardHeight = 90; // 估算个人资料卡高度

    // 动态计算虚拟画布高度，使时间轴填满容器 90%
    const mobileVirtualHeight = containerH > 0 && scale > 0
      ? (containerH / scale) * 0.9
      : data.length * 125 + pipeMargin * 2 + 40; // 初始值回退

    // 动态 nodeSpacing：用可用虚拟高度减去资料卡和管道边距后均分
    const availableForNodes = mobileVirtualHeight - profileCardHeight - pipeMargin * 2;
    const nodeSpacing = data.length > 0 ? availableForNodes / data.length : 125;

    return (
      <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-start relative px-3 pt-1 pb-3 overflow-visible">
        <style>{`
          @keyframes card-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="relative" style={{ width: `${BASE_WIDTH}px`, height: `${mobileVirtualHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top center', paddingBottom: '60px' }}>

          <div className="w-full max-w-sm mb-2 z-20 shrink-0 mx-auto px-4">
            <UserProfileCard settings={settings} layout="horizontal">
              <ContactLinks settings={settings} layout="grid" minimal={true} />
            </UserProfileCard>
          </div>

          <div
            className="relative w-full max-w-2xl mx-auto flex-1 mt-4"
            style={{ height: '100%' }}
          >
            {/* Pipe - REPLICATED PROFILE CARD STYLE (Mobile) */}
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ width: `${pipeWidth}px`, top: `${pipeMargin}px`, bottom: `${pipeMargin}px`, zIndex: 0 }}>
              {/* Base Glass Body */}
              <div className="absolute inset-0 rounded-full" style={{
                background: `rgba(255,255,255,${glassBgOpacity * 0.08})`,
                backdropFilter: `blur(${glassBlur * 0.5}px)`,
                WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`,
                border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.25),
                  inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})
                `
              }} />

              {/* Flow Border (Use GlowBorder Function) */}
              <div className="absolute -inset-[2px] rounded-full flow-animate pointer-events-none" style={{
                padding: '1.5px',
                background: getFlowGradient(flowColors, 1),
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animationDuration: `${30 / settings.timelineSilkSpeed}s`,
                zIndex: -1
              }} />
            </div>

            {/* Global Dust */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div key={`dust-${i}`} className="absolute rounded-full dust-float" style={{
                  left: `${30 + Math.random() * 40}%`, top: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
                  background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
                  animationDuration: `${8 + Math.random() * 12}s`, animationDelay: `-${Math.random() * 20}s`
                }} />
              ))}
            </div>

            {/* NO SEGMENTS (Removed) */}

            {/* Years */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${pipeMargin}px`, bottom: `${pipeMargin}px` }}>
              {keyYears.map((year, i) => (
                <div key={year} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${getPosition(year)}%` }}>
                  {/* Year Dot */}
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] text-white/50 font-medium tracking-wider whitespace-nowrap ${i % 2 === 0 ? 'right-6' : 'left-6'}`} style={{ fontFamily: settings.fontFamily }}>
                    {year}
                  </span>
                </div>
              ))}
            </div>

            {data.map((node, index) => {
              const startPos = getPosition(node.startYear);
              const endPos = getPosition(node.endYear);
              const centerPos = (startPos + endPos) / 2;
              const isLeft = index % 2 === 0;
              const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;

              return (
                <div key={node.id}>
                  <LayoutWrapper nodeId={node.id} elementType="mainCard" isMobile={true} className="absolute group z-10"
                    style={{
                      top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`,
                      transform: 'translateY(-50%)',
                      left: isLeft ? `${mobileCardOffsetX}px` : 'auto',
                      right: isLeft ? 'auto' : `${mobileCardOffsetX}px`,
                      width: `calc(50% - ${pipeWidth / 2 + 16}px)`,
                      maxWidth: '260px'
                    }}
                  >
                    <div className="relative rounded-2xl px-3 py-2 transition-all duration-300 w-full"
                      style={{
                        background: `rgba(255,255,255,${glassBgOpacity * 0.08})`,
                        backdropFilter: `blur(${glassBlur * 0.5}px)`,
                        WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`,
                        border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
                        boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})`,
                      }}
                    >
                      <div className="absolute -inset-[2px] rounded-[18px] flow-animate pointer-events-none" style={{
                        padding: '1.5px',
                        background: getFlowGradient(flowColors, 1),
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        animationDuration: `${20 / settings.timelineSilkSpeed}s`,
                        zIndex: -1
                      }} />

                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-1" style={{ background: `${colors.primary}20`, border: `1px solid ${colors.primary}40` }}>
                          <span className="text-[9px] font-semibold" style={{ color: colors.primary }}>
                            {node.type === 'education' ? '大学' : node.type === 'internship' ? '实习' : '工作'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white/95 leading-tight" style={{ fontFamily: settings.fontFamily }}>{node.title}</h3>
                        {node.subtitle && <div className="text-[10px] text-white/60 mt-0.5" style={{ fontFamily: settings.fontFamily }}>{node.subtitle}</div>}
                        {node.description && (
                          <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[9px] text-white/50 leading-relaxed italic" style={{ fontFamily: settings.fontFamily }}>
                            {node.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </LayoutWrapper>

                  {/* Mobile Link Line */}
                  <LayoutWrapper nodeId={node.id} elementType="glassLine" isMobile={true} className="absolute"
                    style={{
                      top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`,
                      transform: 'translateY(-50%)',
                      // The line goes from the edge of the card to the pipe
                      left: isLeft ? `calc(50% - ${pipeWidth / 2 + 16}px)` : 'auto',
                      right: isLeft ? 'auto' : `calc(50% - ${pipeWidth / 2 + 16}px)`,
                      width: '16px',
                      height: '2px',
                    }}
                  >
                    <div className="absolute inset-0 rounded-full" style={{ background: colors.glow, opacity: 0.4 }} />
                  </LayoutWrapper>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== Desktop Layout ====================
  const pipeHeight = 40;

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative p-4">
      <style>{`
        @keyframes card-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="relative" style={{ width: `${BASE_WIDTH}px`, height: `${BASE_HEIGHT}px`, transform: `scale(${scale})`, transformOrigin: 'center center' }}>

        {/* Lumina Hulls Integration */}
        {!isMobile && data.map(node => {
          const hullConfig = (hullData as any)[node.id];
          if (!hullConfig) return null;
          const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;
          return (
            <LuminaHull
              key={`hull-${node.id}`}
              id={node.id}
              config={hullConfig}
              color={colors.primary}
            />
          );
        })}

        {/* Pipe - REPLICATED PROFILE CARD STYLE (Desktop) */}
        <div className="absolute left-8 right-8 rounded-full" style={{ height: `${pipeHeight}px`, top: '50%', transform: 'translateY(-50%)' }}>
          {/* Base Glass Body - EXACT MATCH */}
          <div className="absolute inset-0 rounded-full" style={{
            background: `rgba(255,255,255,${glassBgOpacity * 0.08})`,
            backdropFilter: `blur(${glassBlur * 0.5}px)`,
            WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`,
            border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
            boxShadow: `
                0 8px 32px rgba(0,0,0,0.25),
                inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})
              `
          }} />

          {/* Flow Border (Use GlowBorder Function) */}
          <div className="absolute -inset-[2px] rounded-full flow-animate pointer-events-none" style={{
            padding: '1.5px',
            background: getFlowGradient(flowColors, 1),
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animationDuration: `${30 / settings.timelineSilkSpeed}s`,
            zIndex: -1
          }} />
        </div>

        {/* NO SEGMENTS - REMOVED (Horizontal ribbon is gone) */}

        {/* Years */}
        <div className="absolute left-8 right-8" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          {keyYears.map(year => (
            <div key={year} className="absolute -translate-x-1/2" style={{ left: `${getPosition(year)}%` }}>
              <div className="w-2 h-2 rounded-full absolute top-1/2 -translate-y-1/2" style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs text-white/50 font-medium tracking-wider" style={{ fontFamily: settings.fontFamily }}>{year}</span>
            </div>
          ))}
        </div>

        {/* Cards */}
        {data.map((node, index) => {
          const startPos = getPosition(node.startYear);
          const endPos = getPosition(node.endYear);
          const centerPos = (startPos + endPos) / 2;
          const isAbove = index % 2 === 0;
          const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;

          return (
            <div key={node.id}>
              {/* Card */}
              <LayoutWrapper nodeId={node.id} elementType="mainCard" isMobile={false} className="absolute group"
                style={{
                  left: `calc(40px + (100% - 80px) * ${centerPos / 100})`, // Restored to 40px offsets for Lumina align
                  transform: 'translateX(-50%)',
                  top: isAbove ? '8px' : 'auto',
                  bottom: isAbove ? 'auto' : '8px',
                }}
              >
                <div className="w-full h-full" onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}>

                  <div className="absolute rounded-2xl" style={{
                    inset: `-${12 * cardGlow}px`,
                    background: `radial-gradient(ellipse at 50% ${isAbove ? '100%' : '0%'}, ${colors.glow} 0%, transparent 70%)`,
                    filter: `blur(${16 * cardGlow}px)`,
                    opacity: cardGlow
                  }} />

                  <div className="relative rounded-2xl px-4 py-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 overflow-visible"
                    style={{
                      background: `rgba(255,255,255,${glassBgOpacity * 0.08})`,
                      backdropFilter: `blur(${glassBlur * 0.5}px)`,
                      WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`,
                      border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
                      boxShadow: `
                        0 8px 32px rgba(0,0,0,0.25),
                        inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})
                      `,
                      minWidth: '140px',
                    }}
                  >
                    {/* Flow Border (Use GlowBorder Function) */}
                    <div className="absolute -inset-[2px] rounded-[18px] flow-animate pointer-events-none" style={{
                      padding: '1.5px',
                      background: getFlowGradient(flowColors, 1),
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      animationDuration: `${20 / settings.timelineSilkSpeed}s`,
                      zIndex: -1
                    }} />

                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2" style={{ background: `${colors.primary}20`, border: `1px solid ${colors.primary}40`, boxShadow: `0 0 8px ${colors.glow}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.primary, boxShadow: `0 0 6px ${colors.glow}` }} />
                        <span className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                          {node.type === 'education' ? '大学' : node.type === 'internship' ? '实习' : '工作'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white/95 leading-tight" style={{ fontFamily: settings.fontFamily, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {node.title}
                      </h3>
                      {node.subtitle && <div className="text-xs text-white/60 mt-0.5" style={{ fontFamily: settings.fontFamily }}>{node.subtitle}</div>}
                    </div>
                  </div>
                </div>
              </LayoutWrapper>

              {/* Link Card - UNIFIED STYLE */}
              <LayoutWrapper nodeId={node.id} elementType="linkCard" isMobile={false} className="absolute"
                style={{
                  left: `calc(40px + (100% - 80px) * ${centerPos / 100} + ${node.overrides?.desktopLinkOffsetX || 0}px)`,
                  transform: `translateX(-50%) translateY(${isAbove ? '-100%' : '0'})`,
                  top: isAbove ? `${8 - settings.timelineLinkCardOffset + (node.overrides?.desktopLinkOffsetY || 0)}px` : 'auto',
                  bottom: isAbove ? 'auto' : `${8 - settings.timelineLinkCardOffset - (node.overrides?.desktopLinkOffsetY || 0)}px`,
                }}
              >
                <div className="relative rounded-xl px-3 py-1.5" style={{
                  background: `rgba(255,255,255,${glassBgOpacity * 0.08})`,
                  backdropFilter: `blur(${glassBlur * 0.5}px)`,
                  WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`,
                  border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
                  boxShadow: `
                      0 4px 16px rgba(0,0,0,0.2),
                      inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})
                    `,
                  maxWidth: '180px',
                }}
                >
                  {node.description && <div className="text-[9px] text-white/70 leading-tight text-center" style={{ fontFamily: settings.fontFamily }}>{node.description}</div>}
                </div>
              </LayoutWrapper>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(Timeline);