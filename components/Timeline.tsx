import React, { useRef, useEffect, useState } from 'react';
import { LayoutSettings, TimelineNode } from '../types';
import { getFlowGradient } from './glass';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useGlassSettings } from '../contexts/GlassSettingsContext';
import { useDragEditor, NodeLayoutConfig } from '../contexts/DragEditorContext';
import { HullEditorProvider, useHullEditor } from '../contexts/HullEditorContext';
import timelineData from '../data/timeline.json';
import UserProfileCard from './shared/UserProfileCard';
import ContactLinks from './shared/ContactLinks';
import LuminaHull from './lumina/LuminaHull';

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
  SCALE_MARGIN: 0.88,
  CONTAINER_PADDING: 32,
} as const;

interface LayoutWrapperProps {
  nodeId: string;
  elementType: keyof NodeLayoutConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isMobile: boolean;
  scale?: number;
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

const TimelineContent: React.FC<TimelineProps> = ({ settings: globalSettings, data = DEFAULT_TIMELINE_DATA }) => {
  const { settings: contextSettings } = useGlassSettings();
  const settings = contextSettings || globalSettings;
  const { hulls } = useHullEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { isMobile } = useBreakpoint();

  const BASE_WIDTH = isMobile ? TIMELINE_CONFIG.MOBILE_BASE_WIDTH : TIMELINE_CONFIG.BASE_WIDTH;
  const BASE_HEIGHT = isMobile ? TIMELINE_CONFIG.MOBILE_BASE_HEIGHT : TIMELINE_CONFIG.BASE_HEIGHT;

  const minYear = 2017;
  const maxYear = 2026;
  const totalYears = maxYear - minYear;
  const getPosition = (year: number) => ((year - minYear) / totalYears) * 100;

  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - TIMELINE_CONFIG.CONTAINER_PADDING * (isMobile ? 1 : 2);
      const containerHeight = containerRef.current.clientHeight - TIMELINE_CONFIG.CONTAINER_PADDING * (isMobile ? 1 : 2);

      if (isMobile) {
        const mobileScale = Math.min(containerWidth / BASE_WIDTH, 1.0);
        setScale(Math.max(TIMELINE_CONFIG.MIN_SCALE, mobileScale));
        setContainerH(containerHeight);
        return;
      }

      const widthScale = containerWidth / BASE_WIDTH;
      const heightScale = containerHeight / BASE_HEIGHT;
      const optimalScale = Math.min(widthScale, heightScale, TIMELINE_CONFIG.MAX_SCALE);
      setScale(Math.max(TIMELINE_CONFIG.MIN_SCALE, optimalScale * TIMELINE_CONFIG.SCALE_MARGIN));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isMobile, BASE_WIDTH, BASE_HEIGHT]);

  const glassBlur = settings.glassBlur;
  const glassBgOpacity = settings.glassBgOpacity / 100;
  const flowColors = settings.focusFlowColors;
  const cardGlow = settings.timelineCardGlow / 100;
  const keyYears = [...new Set(data.flatMap(node => [node.startYear, node.endYear]))].sort((a, b) => a - b);
  const borderThickness = settings.borderThickness;
  const borderRefraction = settings.borderRefraction / 100;

  if (isMobile) {
    const mobileCardOffsetX = settings.mobileCardOffsetX;
    const pipeWidth = settings.mobilePipeWidth;
    const pipeMargin = 24;
    const mobileVirtualHeight = Math.max((containerH / (scale || 1)) * 0.9, 800);

    return (
      <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-start relative px-3 pt-0 pb-3 overflow-hidden">
        <style>{`@keyframes card-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
        <div className="relative" style={{ width: `${BASE_WIDTH}px`, height: `${mobileVirtualHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top center', paddingBottom: '60px' }}>
          <div className="w-full max-w-sm mb-1 z-20 shrink-0 mx-auto px-4">
            <UserProfileCard settings={settings} layout="horizontal">
              <ContactLinks settings={settings} layout="grid" minimal={true} />
            </UserProfileCard>
          </div>
          <div className="relative w-full max-w-2xl mx-auto flex-1 mt-1" style={{ height: '100%' }}>
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ width: `${pipeWidth}px`, top: `${pipeMargin}px`, bottom: `${pipeMargin}px`, zIndex: 0 }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `rgba(255,255,255,${glassBgOpacity * 0.08})`, backdropFilter: `blur(${glassBlur * 0.5}px)`, WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`, border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`, boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})` }} />
              <div className="absolute -inset-[2px] rounded-full flow-animate pointer-events-none" style={{ padding: '1.5px', background: getFlowGradient(flowColors, 1), WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animationDuration: `${30 / settings.timelineSilkSpeed}s`, zIndex: -1 }} />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${pipeMargin}px`, bottom: `${pipeMargin}px` }}>
              {keyYears.map((year, i) => (
                <div key={year} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${getPosition(year)}%` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] text-white/50 font-medium tracking-wider whitespace-nowrap ${i % 2 === 0 ? 'right-6' : 'left-6'}`} style={{ fontFamily: settings.fontFamily }}>{year}</span>
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
                  <LayoutWrapper nodeId={node.id} elementType="mainCard" isMobile={true} className="absolute group z-10" style={{ top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`, transform: 'translateY(-50%)', left: isLeft ? `${mobileCardOffsetX}px` : 'auto', right: isLeft ? 'auto' : `${mobileCardOffsetX}px`, width: `calc(50% - ${pipeWidth / 2 + 28}px)`, maxWidth: '260px' }}>
                    <div className="relative rounded-2xl px-3 py-2 transition-all duration-300 w-full" style={{ background: `rgba(255,255,255,${glassBgOpacity * 0.08})`, backdropFilter: `blur(${glassBlur * 0.5}px)`, WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`, border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`, boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})` }}>
                      <div className="absolute -inset-[2px] rounded-[18px] flow-animate pointer-events-none" style={{ padding: '1.5px', background: getFlowGradient(flowColors, 1), WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animationDuration: `${20 / settings.timelineSilkSpeed}s`, zIndex: -1 }} />
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-1" style={{ background: `${colors.primary}20`, border: `1px solid ${colors.primary}40` }}>
                          <span className="text-[9px] font-semibold" style={{ color: colors.primary }}>{node.type === 'education' ? '大学' : node.type === 'internship' ? '实习' : '工作'}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white/95 leading-tight" style={{ fontFamily: settings.fontFamily }}>{node.title}</h3>
                        {node.subtitle && <div className="text-[10px] text-white/60 mt-0.5" style={{ fontFamily: settings.fontFamily }}>{node.subtitle}</div>}
                        {node.description && <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[9px] text-white/50 leading-relaxed italic whitespace-pre-wrap" style={{ fontFamily: settings.fontFamily }}>{node.description}</div>}
                      </div>
                    </div>
                  </LayoutWrapper>
                  <LayoutWrapper nodeId={node.id} elementType="glassLine" isMobile={true} className="absolute" style={{ top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`, transform: 'translateY(-50%)', left: isLeft ? `calc(50% - ${pipeWidth / 2 + 28}px)` : 'auto', right: isLeft ? 'auto' : `calc(50% - ${pipeWidth / 2 + 28}px)`, width: '28px', height: '2px' }}>
                    <div className="absolute inset-0 rounded-full" style={{ background: colors.glow, opacity: 0.4 }} />
                  </LayoutWrapper>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative p-4 bg-black/10">
      <style>{`@keyframes card-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
      <div className="relative" style={{ width: `${BASE_WIDTH}px`, height: `${BASE_HEIGHT}px`, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {!isMobile && data.map(node => {
          const hullConfig = hulls[node.id];
          if (!hullConfig) return null;
          const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;
          return <LuminaHull key={`hull-${node.id}`} id={node.id} config={hullConfig} color={colors.primary} />;
        })}
        <div className="absolute left-8 right-8 rounded-full" style={{ height: `40px`, top: '50%', transform: 'translateY(-50%)' }}>
          <div className="absolute inset-0 rounded-full" style={{ background: `rgba(255,255,255,${glassBgOpacity * 0.08})`, backdropFilter: `blur(${glassBlur * 0.5}px)`, WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`, border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`, boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})` }} />
          <div className="absolute -inset-[2px] rounded-full flow-animate pointer-events-none" style={{ padding: '1.5px', background: getFlowGradient(flowColors, 1), WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animationDuration: `${30 / settings.timelineSilkSpeed}s`, zIndex: -1 }} />
        </div>
        <div className="absolute left-8 right-8" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          {keyYears.map(year => (
            <div key={year} className="absolute -translate-x-1/2" style={{ left: `${getPosition(year)}%` }}>
              <div className="w-2 h-2 rounded-full absolute top-1/2 -translate-y-1/2" style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs text-white/50 font-medium tracking-wider" style={{ fontFamily: settings.fontFamily }}>{year}</span>
            </div>
          ))}
        </div>
        {data.map((node, index) => {
          const startPos = getPosition(node.startYear);
          const endPos = getPosition(node.endYear);
          const centerPos = (startPos + endPos) / 2;
          const isAbove = index % 2 === 0;
          const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;
          return (
            <div key={node.id}>
              <LayoutWrapper nodeId={node.id} elementType="mainCard" isMobile={false} className="absolute group" style={{ left: `calc(40px + (100% - 80px) * ${centerPos / 100})`, transform: 'translateX(-50%)', top: isAbove ? '0px' : 'auto', bottom: isAbove ? 'auto' : '0px' }}>
                <div className="w-full h-full">
                  <div className="absolute rounded-2xl" style={{ inset: `-${12 * cardGlow}px`, background: `radial-gradient(ellipse at 50% ${isAbove ? '100%' : '0%'}, ${colors.glow} 0%, transparent 70%)`, filter: `blur(${16 * cardGlow}px)`, opacity: cardGlow }} />
                  <div className="relative rounded-2xl px-4 py-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 overflow-visible" style={{ background: `rgba(255,255,255,${glassBgOpacity * 0.08})`, backdropFilter: `blur(${glassBlur * 0.5}px)`, WebkitBackdropFilter: `blur(${glassBlur * 0.5}px)`, border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`, boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})`, width: (node.id === 'edu' || node.id === 'work1' || node.id === 'work2') ? '300px' : '220px' }}>
                    <div className="absolute -inset-[2px] rounded-[18px] flow-animate pointer-events-none" style={{ padding: '1.5px', background: getFlowGradient(flowColors, 1), WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animationDuration: `${20 / settings.timelineSilkSpeed}s`, zIndex: -1 }} />
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2" style={{ background: `${colors.primary}20`, border: `1px solid ${colors.primary}40`, boxShadow: `0 0 8px ${colors.glow}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.primary, boxShadow: `0 0 6px ${colors.glow}` }} />
                        <span className="text-[10px] font-semibold" style={{ color: colors.primary }}>{node.type === 'education' ? '大学' : node.type === 'internship' ? '实习' : '工作'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white/95 leading-tight" style={{ fontFamily: settings.fontFamily, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{node.title}</h3>
                      {node.subtitle && <div className="text-xs text-white/60 mt-0.5" style={{ fontFamily: settings.fontFamily }}>{node.subtitle}</div>}
                      {node.description && <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[10px] text-white/50 leading-relaxed italic whitespace-pre-wrap" style={{ fontFamily: settings.fontFamily }}>{node.description}</div>}
                    </div>
                  </div>
                </div>
              </LayoutWrapper>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = (props) => (
  <HullEditorProvider>
    <TimelineContent {...props} />
  </HullEditorProvider>
);

export default React.memo(Timeline);
