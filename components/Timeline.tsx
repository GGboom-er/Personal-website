import React, { useRef, useEffect, useState } from 'react';
import { LayoutSettings, TimelineNode } from '../types';
import { getFlowGradient } from './glass';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useGlassSettings } from '../contexts/GlassSettingsContext';
import { useDragEditor, NodeLayoutConfig } from '../contexts/DragEditorContext';
import timelineData from '../data/timeline.json';
import UserProfileCard from './shared/UserProfileCard';
import ContactLinks from './shared/ContactLinks';

// 从 JSON 文件加载时间轴数据
export const DEFAULT_TIMELINE_DATA: TimelineNode[] = timelineData.timeline as TimelineNode[];

interface TimelineProps {
  settings: LayoutSettings;
  data?: TimelineNode[];
}

// 流光颜色配置
const GLOW_COLORS = {
  education: { primary: 'rgba(168,85,247,1)', glow: 'rgba(168,85,247,0.6)' },     // 紫色
  internship: { primary: 'rgba(236,72,153,1)', glow: 'rgba(236,72,153,0.6)' },    // 粉色
  work: { primary: 'rgba(6,182,212,1)', glow: 'rgba(6,182,212,0.6)' },            // 青色
};

// 时间轴布局常量
const TIMELINE_CONFIG = {
  // 桌面端水平布局
  BASE_WIDTH: 900,           // 时间轴基础宽度
  BASE_HEIGHT: 500,          // 时间轴基础高度
  // 移动端垂直布局
  MOBILE_BASE_WIDTH: 400,    // 移动端基础宽度
  MOBILE_BASE_HEIGHT: 800,   // 移动端基础高度
  // 通用
  MIN_SCALE: 0.4,            // 最小缩放比例
  MAX_SCALE: 1.5,            // 最大缩放比例
  SCALE_MARGIN: 0.95,        // 缩放边距 (留5%空间)
  CONTAINER_PADDING: 32,     // 容器内边距
} as const;

// 布局包装器 - 应用预设偏移
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
  const { getNodeSettings } = useGlassSettings();
  const settings = globalSettings; // Keep using prop for global elements (pipe, etc.)

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { isMobile } = useBreakpoint();

  // 解构常量 - 根据设备类型选择
  const BASE_WIDTH = isMobile ? TIMELINE_CONFIG.MOBILE_BASE_WIDTH : TIMELINE_CONFIG.BASE_WIDTH;
  const BASE_HEIGHT = isMobile ? TIMELINE_CONFIG.MOBILE_BASE_HEIGHT : TIMELINE_CONFIG.BASE_HEIGHT;

  // 固定时间范围
  const minYear = 2017;
  const maxYear = 2025;
  const totalYears = maxYear - minYear;

  // 计算位置
  const getPosition = (year: number) => ((year - minYear) / totalYears) * 100;

  // 响应式缩放计算
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth - TIMELINE_CONFIG.CONTAINER_PADDING;
      const containerHeight = containerRef.current.clientHeight - TIMELINE_CONFIG.CONTAINER_PADDING;

      // 计算宽度和高度的缩放比例
      const widthScale = containerWidth / BASE_WIDTH;
      const heightScale = containerHeight / BASE_HEIGHT;

      // 取较小值确保不超出容器
      const optimalScale = Math.min(widthScale, heightScale, TIMELINE_CONFIG.MAX_SCALE);
      setScale(Math.max(TIMELINE_CONFIG.MIN_SCALE, optimalScale * TIMELINE_CONFIG.SCALE_MARGIN));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isMobile, BASE_WIDTH, BASE_HEIGHT]);

  // 玻璃效果参数
  const glassBlur = settings.glassBlur;
  const glassSaturate = settings.glassSaturate;
  const glassBgOpacity = settings.glassBgOpacity / 100;

  // 流光效果参数
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;

  // 时间轴光效参数
  // 光锥形状
  const lightOriginY = settings.timelineLightOriginY;
  const lightSpread = settings.timelineLightSpread;
  // 光锥模糊
  const lightBlurX = settings.timelineLightBlurX;
  const lightBlurY = settings.timelineLightBlurY;
  const lightSoftness = settings.timelineLightSoftness / 100;
  // 光锥强度
  const lightOpacity = settings.timelineLightOpacity / 100;
  const lightFalloff = settings.timelineLightFalloff / 100;
  const lightImpact = settings.timelineLightImpact / 100;
  // 卡片发光
  const cardGlow = settings.timelineCardGlow / 100;
  // 流动光丝
  const silkSpeed = settings.timelineSilkSpeed;
  const silkOpacity = settings.timelineSilkOpacity / 100;
  const silkTurbulence = settings.timelineSilkTurbulence / 100;
  const silkStartSpread = settings.timelineSilkStartSpread / 100; // 起点扩散（卡片端）
  const silkEndSpread = settings.timelineSilkEndSpread / 100;     // 终点扩散（时间轴端）
  const silkDistortion = settings.timelineSilkDistortion / 100;
  // 颜色
  const color1 = settings.timelineColor1;
  const color2 = settings.timelineColor2;
  const color3 = settings.timelineColor3;

  // 链接卡片距离
  const linkCardOffset = settings.timelineLinkCardOffset;

  // 光锥位置调整参数
  const lightConeOriginX = settings.lightConeOriginX;
  const lightConeOriginY = settings.lightConeOriginY;
  const lightConeEndX = settings.lightConeEndX;
  const lightConeEndY = settings.lightConeEndY;
  const lightConeRotation = settings.lightConeRotation;
  const lightConeWidthStart = settings.lightConeWidthStart / 100;
  const lightConeWidthEnd = settings.lightConeWidthEnd / 100;

  // 卡片高度估算
  const cardHeight = 80;

  // 关键年份节点（只显示数据中出现的年份）
  const keyYears = [...new Set(data.flatMap(node => [node.startYear, node.endYear]))].sort((a, b) => a - b);

  // ==================== 移动端垂直布局 ====================
  if (isMobile) {
    // 移动端使用垂直布局，从设置中读取参数
    const mobileCardWidth = settings.mobileCardWidth; // 卡片宽度
    const mobileCardOffsetX = settings.mobileCardOffsetX; // 卡片水平位移
    const mobileCardSpread = settings.mobileCardSpread / 100; // 卡片聚拢/扩散 (0-1)
    const nodeSpacing = 160; // 节点间距
    const pipeWidth = settings.mobilePipeWidth; // 管道宽度
    const pipeMargin = 32; // 管道上下边距
    const cardMarginBase = 8; // 基础边距
    // 计算实际卡片边距：spread=0时贴近中心，spread=1时贴边
    const maxCardMargin = (BASE_WIDTH / 2) - pipeWidth / 2 - mobileCardWidth - 10; // 最大可用边距
    const cardMargin = cardMarginBase + (1 - mobileCardSpread) * maxCardMargin;

    // 移动端光锥参数
    const mobileLightOpacity = lightOpacity * (settings.mobileLightConeOpacity / 100);
    const mobileLightConeStartWidth = settings.mobileLightConeStartWidth; // 起始宽度（卡片端）
    const mobileLightConeEndWidth = settings.mobileLightConeEndWidth; // 结束宽度（管道端）
    const mobileLightBlur = (lightBlurX + lightBlurY) / 2 * (settings.mobileLightConeBlur / 100);

    // 移动端粒子参数
    const mobileParticleScale = settings.mobileParticleScale / 100;
    const mobileParticleOpacity = silkOpacity * (settings.mobileParticleOpacity / 100);
    const mobileParticleSpeed = silkSpeed * (100 / Math.max(0.1, settings.mobileParticleSpeed));

    // 移动端链接卡片距离
    const mobileLinkCardOffset = settings.mobileLinkCardOffset;

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col items-center overflow-auto relative p-4"
      >
        {/* Header - Mobile Only Profile & Contact */}
        <div className="fixed top-2 left-2 z-[9999] bg-red-500/80 text-white p-2 font-mono text-xs pointer-events-none">
          TELEMETRY: StartW={settings.mobileLightConeWidthStart} EndW={settings.mobileLightConeWidthEnd} Rot={settings.mobileLightConeRotation}
        </div>
        <div className="w-full max-w-[340px] mb-6 z-20 shrink-0">
          <UserProfileCard settings={settings} layout="horizontal">
            <ContactLinks settings={settings} layout="grid" minimal={true} />
          </UserProfileCard>
        </div>

        {/* 时间轴主容器 - 垂直布局 */}
        <div
          className="relative"
          style={{
            width: `${BASE_WIDTH}px`,
            minHeight: `${data.length * nodeSpacing + pipeMargin * 2 + 100}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >

          {/* 垂直玻璃管道基座 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: `${pipeWidth}px`,
              top: `${pipeMargin}px`,
              bottom: `${pipeMargin}px`,
            }}
          >
            {/* 基础阴影层 - 非照亮区域增强 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.4)',
                boxShadow: `
                  inset 4px 0 12px rgba(0,0,0,0.5),
                  inset -4px 0 12px rgba(0,0,0,0.3),
                  0 0 40px rgba(0,0,0,0.4)
                `,
              }}
            />

            {/* 外发光 */}
            <div
              className="absolute inset-0 rounded-full flow-animate"
              style={{
                background: getFlowGradient(flowColors, glowIntensity * 0.4),
                filter: `blur(${glowSpread}px)`,
                transform: 'scaleX(2)',
                animationDuration: `${flowSpeed * 2}s`,
              }}
            />

            {/* 玻璃管道主体 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg,
                  rgba(255,255,255,${glassBgOpacity * 0.25}) 0%,
                  rgba(255,255,255,${glassBgOpacity * 0.1}) 50%,
                  rgba(255,255,255,${glassBgOpacity * 0.05}) 100%)`,
                backdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: `
                  inset 2px 0 4px rgba(255,255,255,0.2),
                  inset -2px 0 4px rgba(0,0,0,0.1),
                  0 8px 32px rgba(0,0,0,0.3)
                `,
              }}
            />

            {/* 管道左侧高光 */}
            <div
              className="absolute top-4 bottom-4 left-1 w-1 rounded-full"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)',
              }}
            />

            {/* 流光边框 */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden flow-animate"
              style={{
                padding: glowThickness,
                background: getFlowGradient(flowColors, 0.8),
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animationDuration: `${flowSpeed}s`,
              }}
            />
          </div>

          {/* 全局灰尘粒子效果 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => {
              const size = 1 + Math.random() * 2;
              const startX = 30 + Math.random() * 40;
              const startY = Math.random() * 100;
              const duration = 8 + Math.random() * 12;
              const delay = -Math.random() * 20;
              const opacity = 0.1 + Math.random() * 0.2;
              return (
                <div
                  key={`dust-${i}`}
                  className="absolute rounded-full dust-float"
                  style={{
                    left: `${startX}%`,
                    top: `${startY}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    filter: 'blur(0.5px)',
                  }}
                />
              );
            })}
            {/* 大型漂浮光点 */}
            {[...Array(8)].map((_, i) => {
              const size = 3 + Math.random() * 4;
              const startX = 20 + Math.random() * 60;
              const startY = Math.random() * 100;
              const duration = 15 + Math.random() * 10;
              const delay = -Math.random() * 15;
              const colorIndex = i % 3;
              const particleColor = colorIndex === 0 ? color1 : colorIndex === 1 ? color2 : color3;
              return (
                <div
                  key={`glow-dust-${i}`}
                  className="absolute rounded-full dust-glow"
                  style={{
                    left: `${startX}%`,
                    top: `${startY}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle, ${particleColor}40 0%, transparent 70%)`,
                    boxShadow: `0 0 ${size * 2}px ${particleColor}30`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* 年份刻度 - 只显示关键节点 */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `${pipeMargin}px`, bottom: `${pipeMargin}px` }}
          >
            {keyYears.map((year, i) => (
              <div
                key={year}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${getPosition(year)}%` }}
              >
                {/* 刻度点 */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.6)',
                    boxShadow: '0 0 8px rgba(255,255,255,0.4)',
                  }}
                />
                {/* 年份 - 交替显示在左右两侧 */}
                <span
                  className={`absolute top-1/2 -translate-y-1/2 text-xs text-white/50 font-medium tracking-wider whitespace-nowrap ${i % 2 === 0 ? 'right-6' : 'left-6'}`}
                  style={{ fontFamily: settings.fontFamily }}
                >
                  {year}
                </span>
              </div>
            ))}
          </div>

          {/* 被照亮的时间段 - 玻璃发光条 */}
          {data.map((node, index) => {
            const startPos = getPosition(node.startYear);
            const endPos = getPosition(node.endYear);
            const segmentHeight = endPos - startPos;
            const isLeft = index % 2 === 0;
            const offsetX = isLeft ? -3 : 3;
            const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;

            return (
              <div
                key={`segment-${node.id}`}
                className="absolute rounded-full"
                style={{
                  width: `${pipeWidth}px`,
                  top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${startPos / 100})`,
                  height: `calc((100% - ${pipeMargin * 2}px) * ${segmentHeight / 100})`,
                  left: '50%',
                  transform: `translateX(calc(-50% + ${offsetX}px))`,
                }}
              >
                {/* 阴影基层 - 非照亮区域 */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(${isLeft ? '90deg' : '270deg'},
                      rgba(0,0,0,${0.6 * (1 - lightImpact)}) 0%,
                      rgba(0,0,0,${0.3 * (1 - lightImpact)}) 50%,
                      rgba(0,0,0,${0.1 * (1 - lightImpact)}) 100%)`,
                    boxShadow: `
                      inset ${isLeft ? '' : '-'}4px 0 8px rgba(0,0,0,${0.4 * (1 - lightImpact)}),
                      0 0 20px rgba(0,0,0,${0.3 * (1 - lightImpact)})
                    `,
                  }}
                />
                {/* 发光层 - 受灯光影响 */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(180deg,
                      transparent 0%,
                      ${colors.glow} ${20 - lightFalloff * 15}%,
                      ${colors.primary} 50%,
                      ${colors.glow} ${80 + lightFalloff * 15}%,
                      transparent 100%)`,
                    filter: `blur(${(lightBlurX + lightBlurY) / 2}px)`,
                    opacity: lightOpacity * lightImpact,
                  }}
                />
                {/* 内部高光 - 模拟被灯光照亮 */}
                <div
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at ${isLeft ? '0%' : '100%'} 50%,
                      rgba(255,255,255,${0.4 * lightImpact}) 0%,
                      transparent 70%)`,
                  }}
                />
              </div>
            );
          })}

          {/* 聚光灯和卡片 */}
          {data.map((node, index) => {
            const startPos = getPosition(node.startYear);
            const endPos = getPosition(node.endYear);
            const centerPos = (startPos + endPos) / 2;
            const segmentHeight = endPos - startPos;
            const isLeft = index % 2 === 0;
            const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;

            // === 获取节点独立设置 ===
            const contextSettings = getNodeSettings(node.id);
            const ns = { ...contextSettings, ...(node.overrides || {}) };

            // 解构参数，包括新的 Mobile 独立坐标
            const {
              // Mobile 独立坐标
              mobileLightConeOriginX, mobileLightConeOriginY,
              mobileLightConeEndX, mobileLightConeEndY,
              mobileLightConeRotation, mobileLightConeWidthStart, mobileLightConeWidthEnd,

              // Mobile 独立视觉参数
              mobileLightConeOpacity: mlcOpacity,
              mobileLightFalloff: mlcFalloff,
              mobileLightImpact: mlcImpact,
              mobileLightSoftness: mlcSoftness,
              mobileSilkSpeed: mlcSilkSpeed,
              mobileSilkOpacity: mlcSilkOpacity,
              mobileSilkTurbulence: mlcSilkTurbulence,
              mobileSilkStartSpread: mlcSilkStartSpread,
              mobileSilkEndSpread: mlcSilkEndSpread,
              mobileSilkDistortion: mlcSilkDistortion,

              mobileLightConeBlur: mlcBlur, // 使用独立模糊控制

              // Desktop Params (used as fallback or for shared colors)
              timelineLightBlurX, timelineLightBlurY,

              // Colors
              timelineColor1: color1,
              timelineColor2: color2,
              timelineColor3: color3,
              mobileCardWidth, mobileCardOffsetX, mobileCardSpread: mobileCardSpreadRaw,
              mobilePipeWidth, mobileLinkCardOffset
            } = ns;

            // 归一化 Mobile 参数
            const lightOpacity = (Number(mlcOpacity) / 100);
            const lightFalloff = (Number(mlcFalloff) / 100);
            const lightImpact = (Number(mlcImpact) / 100);
            const lightSoftness = (Number(mlcSoftness) / 100);

            const silkSpeed = Number(mlcSilkSpeed);
            const silkOpacity = (Number(mlcSilkOpacity) / 100);
            const silkTurbulence = (Number(mlcSilkTurbulence) / 100);
            const silkStartSpread = (Number(mlcSilkStartSpread) / 100);
            const silkEndSpread = (Number(mlcSilkEndSpread) / 100);
            const silkDistortion = (Number(mlcSilkDistortion) / 100);

            const mobileCardSpread = mobileCardSpreadRaw / 100;

            // 移动端光锥透明度 (直接使用 mobileLightConeOpacity 作为主控制)
            const mobileLightOpacity = lightOpacity;



            // 模糊计算 (支持独立轴) - Mobile uses single blur slider for both axes
            const blurX = Number(mlcBlur);
            const blurY = Number(mlcBlur);

            // === 坐标系统重构 (Pixel Precision) ===
            // 基准点：容器中心 (50% height)
            // 宽度：由系数直接控制 (1.0系数 = 1px) -> 实际上应该放大一点，比如系数100 = 50px
            const startHalfWidth = (Number(mobileLightConeWidthStart) / 100) * 25; // Base 25px
            const endHalfWidth = (Number(mobileLightConeWidthEnd) / 100) * 50;   // Base 50px

            // 偏移量直接叠加 (Pixels)
            // Y轴：正值向下，负值向上
            const startOffsetY = Number(mobileLightConeOriginY);
            const endOffsetY = Number(mobileLightConeEndY);

            // 生成 Polygon 顶点 (相对于容器 top: 50%)
            // 容器高度是 segmentHeight。我们需要用 calc() 混合 % 和 px
            // 注意：clip-path 的坐标系是相对于光锥 div 的 (0,0) 到 (100%, 100%)
            // 光锥 div 的高度被设置为 segmentHeight。
            // 为了简化，我们将 div 高度设为 100% segmentHeight，并用 calc 定位内部点

            // 左边 (起点/卡片端) 
            const p1_top = `calc(50% - ${startHalfWidth}px + ${startOffsetY}px)`;
            const p1_bottom = `calc(50% + ${startHalfWidth}px + ${startOffsetY}px)`;

            // 右边 (终点/管道端)
            const p2_top = `calc(50% - ${endHalfWidth}px + ${endOffsetY}px)`;
            const p2_bottom = `calc(50% + ${endHalfWidth}px + ${endOffsetY}px)`;

            const clipLeft = `polygon(100% ${p1_top}, 100% ${p1_bottom}, 0% ${p2_bottom}, 0% ${p2_top})`;
            const clipRight = `polygon(0% ${p1_top}, 0% ${p1_bottom}, 100% ${p2_bottom}, 100% ${p2_top})`;

            // 容器定位偏移 (X轴移动)
            const coneOriginOffset = isLeft ? mobileLightConeOriginX : -mobileLightConeOriginX;
            const coneEndOffset = isLeft ? mobileLightConeEndX : -mobileLightConeEndX;

            // 基础定位
            const maxCardMargin = (BASE_WIDTH / 2) - mobilePipeWidth / 2 - mobileCardWidth - 10;
            const cardMargin = 8 + (1 - mobileCardSpread) * maxCardMargin;
            const cardInnerEdge = cardMargin + mobileCardWidth + (isLeft ? mobileCardOffsetX : -mobileCardOffsetX);
            const pipeEdge = pipeWidth / 2 + 5;

            return (
              <div key={node.id}>
                {/* SVG 滤镜 - 独立控制 XY 模糊 */}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                  <defs>
                    <filter id={`blur-${node.id}`} x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation={`${blurY} ${blurX}`} />
                    </filter>
                    <filter id={`soft-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation={`${lightSoftness * 15}`} />
                    </filter>
                  </defs>
                </svg>

                {/* 聚光灯光锥 - 容器 */}
                <div
                  className="absolute"
                  style={{
                    top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${startPos / 100})`,
                    height: `calc((100% - ${pipeMargin * 2}px) * ${segmentHeight / 100})`,
                    // X轴：起点由 originX 控制，终点由 endX 控制
                    left: isLeft ? `${cardInnerEdge + coneOriginOffset}px` : `calc(50% + ${pipeEdge + coneEndOffset}px)`,
                    right: isLeft ? `calc(50% + ${pipeEdge + coneEndOffset}px)` : `${cardInnerEdge + coneOriginOffset}px`,
                    transform: `rotate(${mobileLightConeRotation}deg)`,
                    transformOrigin: isLeft ? 'right center' : 'left center',
                    zIndex: 0,
                  }}
                >
                  {/* 外层柔和光晕 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isLeft
                        ? `linear-gradient(270deg,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.3}`)} 0%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.2}`)} 40%,
                            transparent 80%)`
                        : `linear-gradient(90deg,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.3}`)} 0%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.2}`)} 40%,
                            transparent 80%)`,
                      clipPath: isLeft ? clipLeft : clipRight,
                      filter: `url(#blur-${node.id})`, // 使用 SVG 滤镜实现非对称模糊
                    }}
                  />

                  {/* 主光锥 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isLeft
                        ? `linear-gradient(270deg,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.9}`)} 0%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.7 * (1 - lightFalloff * 0.4)}`)} ${10 + lightFalloff * 15}%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.4 * (1 - lightFalloff * 0.6)}`)} ${40 + lightFalloff * 20}%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.15 * lightImpact}`)} ${75}%,
                            transparent 100%)`
                        : `linear-gradient(90deg,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.9}`)} 0%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.7 * (1 - lightFalloff * 0.4)}`)} ${10 + lightFalloff * 15}%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.4 * (1 - lightFalloff * 0.6)}`)} ${40 + lightFalloff * 20}%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.15 * lightImpact}`)} ${75}%,
                            transparent 100%)`,
                      clipPath: isLeft ? clipLeft : clipRight,
                      filter: `url(#blur-${node.id})`,
                    }}
                  />

                  {/* 光锥内核 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isLeft
                        ? `linear-gradient(270deg,
                            ${colors.primary.replace('1)', `${mobileLightOpacity * 0.6 * (1 - lightSoftness * 0.5)})`)} 0%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.35 * (1 - lightSoftness * 0.5)}`)} 15%,
                            transparent 40%)`
                        : `linear-gradient(90deg,
                            ${colors.primary.replace('1)', `${mobileLightOpacity * 0.6 * (1 - lightSoftness * 0.5)})`)} 0%,
                            ${colors.glow.replace('0.6', `${mobileLightOpacity * 0.35 * (1 - lightSoftness * 0.5)}`)} 15%,
                            transparent 40%)`,
                      clipPath: isLeft ? clipLeft : clipRight,
                    }}
                  />

                  {/* 流动光丝 - 沿光锥角度辐射流动 */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: isLeft ? clipLeft : clipRight }}
                  >
                    {/* 辐射粒子流 - 从卡片端向管道端流动 */}
                    {[...Array(15)].map((_, i) => {
                      const t = (i - 7) / 7;
                      const turbOffset = Number(silkTurbulence) * Math.sin(i * 2.1) * 5;

                      const startY = 50 + t * Number(silkStartSpread) * 25 + turbOffset;
                      const endY = 50 + t * Number(silkEndSpread) * 50 + turbOffset * 1.5;
                      const deltaY = endY - startY;

                      const height = (1.5 + Number(silkDistortion) * Math.abs(Math.sin(i * 1.3)) * 2) * (Number(mobileParticleScale) / 100);
                      const colorSet = i % 3;
                      const primaryColor = colorSet === 0 ? color1 : colorSet === 1 ? color2 : color3;
                      const gradientAngle = isLeft ? (180 + (deltaY * 0.5)) : (0 - (deltaY * 0.5));

                      return (
                        <div
                          key={`particle-${i}`}
                          className="absolute silk-particle"
                          style={{
                            top: `${startY}%`,
                            [isLeft ? 'right' : 'left']: '5%',
                            height: `${height}px`,
                            width: `${25 * (Number(mobileParticleScale) / 100)}%`,
                            opacity: Number(mobileParticleOpacity) / 100 * (0.4 + Math.abs(t) * 0.2),
                            background: `linear-gradient(${gradientAngle}deg,
                              ${primaryColor} 0%,
                              ${primaryColor}80 20%,
                              ${primaryColor}40 50%,
                              ${primaryColor}10 80%,
                              transparent 100%)`,
                            ['--dx' as string]: isLeft ? '-280%' : '280%',
                            ['--dy' as string]: `${deltaY * 0.8}%`,
                            animationDuration: `${Number(mobileParticleSpeed) / 100 * (0.8 + i * 0.05)}s`,
                            animationDelay: `${-i * 0.12}s`,
                            filter: `blur(${(0.3 + Number(silkDistortion) * 0.5) * (Number(mobileParticleScale) / 100)}px)`,
                            borderRadius: '50%',
                          }}
                        />
                      );
                    })}

                    {/* 主光束粒子 - 从卡片端向管道流动 */}
                    {[...Array(8)].map((_, i) => {
                      const t = (i - 3.5) / 3.5;
                      const turbOffset = Number(silkTurbulence) * Math.cos(i * 1.7) * 4;

                      const startY = 50 + t * Number(silkStartSpread) * 20 + turbOffset;
                      const endY = 50 + t * Number(silkEndSpread) * 45 + turbOffset * 2;
                      const deltaY = endY - startY;

                      const gradientAngle = isLeft ? (180 + (deltaY * 0.4)) : (0 - (deltaY * 0.4));

                      return (
                        <div
                          key={`beam-particle-${i}`}
                          className="absolute silk-beam-particle"
                          style={{
                            top: `${startY}%`,
                            [isLeft ? 'right' : 'left']: '3%',
                            height: `${(3 + Number(silkDistortion) * 3) * (Number(mobileParticleScale) / 100)}px`,
                            width: `${20 * (Number(mobileParticleScale) / 100)}%`,
                            opacity: Number(mobileParticleOpacity) / 100 * 0.5,
                            background: `linear-gradient(${gradientAngle}deg,
                              ${colors.glow.replace('0.6', '0.7')} 0%,
                              ${colors.glow.replace('0.6', '0.4')} 30%,
                              ${colors.glow.replace('0.6', '0.15')} 70%,
                              transparent 100%)`,
                            ['--dx' as string]: isLeft ? '-320%' : '320%',
                            ['--dy' as string]: `${deltaY * 0.75}%`,
                            animationDuration: `${Number(mobileParticleSpeed) / 100 * 1.2}s`,
                            animationDelay: `${-i * 0.2}s`,
                            filter: `blur(${(1.5 + Number(silkDistortion) * 1.5) * (Number(mobileParticleScale) / 100)}px)`,
                            borderRadius: '40%',
                          }}
                        />
                      );
                    })}

                    {/* 扭曲粒子流 - 从卡片端向管道流动 */}
                    {[...Array(10)].map((_, i) => {
                      const t = (i - 4.5) / 4.5;
                      const turbOffset = Number(silkTurbulence) * Math.sin(i * 2.8) * 8;
                      const distortWave = Number(silkDistortion) * Math.cos(i * 1.9) * 5;

                      const startY = 50 + t * Number(silkStartSpread) * 22 + turbOffset;
                      const endY = 50 + t * Number(silkEndSpread) * 48 + turbOffset + distortWave;
                      const deltaY = endY - startY;

                      const colorSet = i % 3;
                      const particleColor = colorSet === 0 ? color1 : colorSet === 1 ? color2 : color3;
                      const gradientAngle = isLeft ? (180 + (deltaY * 0.6)) : (0 - (deltaY * 0.6));

                      return (
                        <div
                          key={`twist-particle-${i}`}
                          className="absolute silk-twist-particle"
                          style={{
                            top: `${startY}%`,
                            [isLeft ? 'right' : 'left']: '8%',
                            height: `${(2 + Number(silkDistortion) * 1.5) * (Number(mobileParticleScale) / 100)}px`,
                            width: `${18 * (Number(mobileParticleScale) / 100)}%`,
                            opacity: Number(mobileParticleOpacity) / 100 * 0.4,
                            background: `linear-gradient(${gradientAngle}deg,
                              ${particleColor} 0%,
                              ${particleColor}60 25%,
                              ${particleColor}20 60%,
                              transparent 100%)`,
                            ['--dx' as string]: isLeft ? `${-300 - distortWave}%` : `${300 + distortWave}%`,
                            ['--dy' as string]: `${deltaY * 0.9}%`,
                            ['--twist' as string]: `${Number(silkDistortion) * (i % 2 === 0 ? 15 : -15)}deg`,
                            animationDuration: `${Number(mobileParticleSpeed) / 100 * (1 + i * 0.08)}s`,
                            animationDelay: `${-i * 0.15}s`,
                            filter: `blur(${(0.8 + Number(silkDistortion) * 0.8) * (Number(mobileParticleScale) / 100)}px)`,
                            borderRadius: '30%',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>


                {/* 主信息卡片 - 液态玻璃 + 自发光 */}
                <LayoutWrapper
                  nodeId={node.id}
                  elementType="mainCard"
                  isMobile={true}
                  className="absolute group"
                  style={{
                    top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`,
                    transform: 'translateY(-50%)',
                    left: isLeft ? `${cardMargin + mobileCardOffsetX}px` : 'auto',
                    right: isLeft ? 'auto' : `${cardMargin - mobileCardOffsetX}px`,
                  }}
                >
                  {/* 卡片自发光 - 作为光源 */}
                  <div
                    className="absolute rounded-2xl"
                    style={{
                      inset: `-${12 * cardGlow}px`,
                      background: `radial-gradient(ellipse at ${isLeft ? '100%' : '0%'} 50%,
                        ${colors.glow.replace('0.6', `${cardGlow * 0.8}`)} 0%,
                        ${colors.glow.replace('0.6', `${cardGlow * 0.4}`)} 30%,
                        transparent 70%)`,
                      filter: `blur(${16 * cardGlow}px)`,
                    }}
                  />

                  {/* 卡片外发光 - 悬停增强 */}
                  <div
                    className="absolute inset-0 rounded-2xl flow-animate opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: getFlowGradient(flowColors, glowIntensity * 0.5),
                      filter: `blur(${glowSpread}px)`,
                      transform: 'scale(1.2)',
                      animationDuration: `${flowSpeed}s`,
                    }}
                  />

                  {/* 主卡片 */}
                  <div
                    className="relative rounded-2xl px-3 py-2.5 transition-all duration-300 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg,
                        rgba(255,255,255,${glassBgOpacity * 0.15}) 0%,
                        rgba(255,255,255,${glassBgOpacity * 0.08}) 100%)`,
                      backdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
                      WebkitBackdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
                      border: `1px solid ${colors.glow.replace('0.6', `${0.2 + cardGlow * 0.3}`)}`,
                      boxShadow: `
                        0 8px 32px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.2),
                        0 0 ${glowSpread + cardGlow * 20}px ${colors.glow},
                        ${isLeft ? '' : '-'}${8 + cardGlow * 16}px 0 ${16 + cardGlow * 24}px ${colors.glow.replace('0.6', `${cardGlow * 0.5}`)}
                      `,
                      minWidth: `${mobileCardWidth}px`,
                    }}
                  >
                    {/* 左/右侧高光 - 根据位置调整 */}
                    <div
                      className={`absolute inset-y-0 ${isLeft ? 'right-0 rounded-r-2xl' : 'left-0 rounded-l-2xl'} w-8 pointer-events-none`}
                      style={{
                        background: isLeft
                          ? 'linear-gradient(270deg, rgba(255,255,255,0.12) 0%, transparent 100%)'
                          : 'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                      }}
                    />

                    {/* 流光边框 */}
                    {glowIntensity > 0 && (
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden flow-animate pointer-events-none"
                        style={{
                          padding: glowThickness * 0.5,
                          background: getFlowGradient(flowColors, 0.6),
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          animationDuration: `${flowSpeed}s`,
                        }}
                      />
                    )}

                    {/* 标签 */}
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 mb-1.5"
                      style={{
                        background: `${colors.primary}20`,
                        border: `1px solid ${colors.primary}40`,
                        boxShadow: `0 0 8px ${colors.glow}`,
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: colors.primary,
                          boxShadow: `0 0 6px ${colors.glow}`,
                        }}
                      />
                      <span className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                        {node.type === 'education' ? '大学' : node.type === 'internship' ? '实习' : '工作'}
                      </span>
                    </div>

                    {/* 标题 */}
                    <h3
                      className="text-sm font-bold text-white/95 leading-tight"
                      style={{
                        fontFamily: settings.fontFamily,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      {node.title}
                    </h3>

                    {/* 副标题 */}
                    {node.subtitle && (
                      <div
                        className="text-xs text-white/60 mt-0.5"
                        style={{ fontFamily: settings.fontFamily }}
                      >
                        {node.subtitle}
                      </div>
                    )}
                  </div>
                </LayoutWrapper>

                {/* 玻璃连接线 - 从主卡片向外延伸（树杈状：在主卡片外侧） */}
                <LayoutWrapper
                  nodeId={node.id}
                  elementType="glassLine"
                  isMobile={true}
                  className="absolute"
                  style={{
                    top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`,
                    transform: 'translateY(-50%)',
                    // 树杈状：左侧卡片的连接线在卡片左边，右侧卡片的连接线在卡片右边
                    left: isLeft ? `${cardMargin + mobileCardOffsetX - mobileLinkCardOffset - 4}px` : 'auto',
                    right: isLeft ? 'auto' : `${cardMargin - mobileCardOffsetX - mobileLinkCardOffset - 4}px`,
                    width: `${mobileLinkCardOffset + 4}px`,
                    height: '2px',
                  }}
                >
                  {/* 玻璃管连接线 */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(${isLeft ? '90deg' : '270deg'},
                        ${colors.glow.replace('0.6', '0.4')} 0%,
                        rgba(255,255,255,0.3) 30%,
                        rgba(255,255,255,0.3) 70%,
                        ${colors.glow.replace('0.6', '0.2')} 100%)`,
                      boxShadow: `
                        0 0 4px ${colors.glow},
                        inset 0 1px 0 rgba(255,255,255,0.3)
                      `,
                    }}
                  />
                  {/* 流光效果 */}
                  <div
                    className="absolute inset-0 rounded-full flow-animate overflow-hidden"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${colors.primary}60 50%, transparent 100%)`,
                      backgroundSize: '200% 100%',
                      animationDuration: `${flowSpeed * 2}s`,
                    }}
                  />
                </LayoutWrapper>

                {/* 外侧链接卡片 - 树杈状：在主卡片外侧 */}
                <LayoutWrapper
                  nodeId={node.id}
                  elementType="linkCard"
                  isMobile={true}
                  className="absolute"
                  style={{
                    top: `calc(${pipeMargin}px + (100% - ${pipeMargin * 2}px) * ${centerPos / 100})`,
                    transform: `translateY(-50%) translateX(${isLeft ? '-100%' : '0'})`,
                    // 树杈状定位：左侧卡片在左边，右侧卡片在右边
                    left: isLeft ? `${cardMargin + mobileCardOffsetX - mobileLinkCardOffset - 4}px` : 'auto',
                    right: isLeft ? 'auto' : `${cardMargin - mobileCardOffsetX - mobileLinkCardOffset - 4}px`,
                  }}
                >
                  {/* 链接卡片 - 小型玻璃卡 */}
                  <div
                    className="relative rounded-xl px-2.5 py-1.5"
                    style={{
                      background: `linear-gradient(135deg,
                        rgba(255,255,255,${glassBgOpacity * 0.1}) 0%,
                        rgba(255,255,255,${glassBgOpacity * 0.05}) 100%)`,
                      backdropFilter: `blur(${glassBlur * 0.8}px) saturate(${glassSaturate}%)`,
                      WebkitBackdropFilter: `blur(${glassBlur * 0.8}px) saturate(${glassSaturate}%)`,
                      border: `1px solid ${colors.glow.replace('0.6', '0.15')}`,
                      boxShadow: `
                        0 4px 16px rgba(0,0,0,0.2),
                        inset 0 1px 0 rgba(255,255,255,0.15),
                        0 0 ${glowSpread * 0.5}px ${colors.glow.replace('0.6', '0.3')}
                      `,
                      maxWidth: `${mobileCardWidth}px`,
                    }}
                  >
                    {/* 描述信息 - 来自JSON的description */}
                    {node.description && (
                      <div
                        className="text-[9px] text-white/70 leading-tight"
                        style={{ fontFamily: settings.fontFamily }}
                      >
                        {node.description}
                      </div>
                    )}
                  </div>
                </LayoutWrapper>
              </div>
            );
          })}

        </div>
      </div>
    );
  }

  // ==================== 桌面端水平布局 ====================
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative p-4"
    >
      {/* 时间轴主容器 - 响应式缩放 */}
      <div
        className="relative"
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >

        {/* 玻璃管道基座 */}
        <div
          className="absolute left-8 right-8 h-10 rounded-full"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {/* 基础阴影层 - 非照亮区域增强 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.4)',
              boxShadow: `
                inset 0 4px 12px rgba(0,0,0,0.5),
                inset 0 -4px 12px rgba(0,0,0,0.3),
                0 0 40px rgba(0,0,0,0.4)
              `,
            }}
          />

          {/* 外发光 */}
          <div
            className="absolute inset-0 rounded-full flow-animate"
            style={{
              background: getFlowGradient(flowColors, glowIntensity * 0.4),
              filter: `blur(${glowSpread}px)`,
              transform: 'scaleY(2)',
              animationDuration: `${flowSpeed * 2}s`,
            }}
          />

          {/* 玻璃管道主体 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(180deg,
                rgba(255,255,255,${glassBgOpacity * 0.25}) 0%,
                rgba(255,255,255,${glassBgOpacity * 0.1}) 50%,
                rgba(255,255,255,${glassBgOpacity * 0.05}) 100%)`,
              backdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.2),
                inset 0 -2px 4px rgba(0,0,0,0.1),
                0 8px 32px rgba(0,0,0,0.3)
              `,
            }}
          />

          {/* 管道顶部高光 */}
          <div
            className="absolute inset-x-4 top-1 h-2 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)',
            }}
          />

          {/* 流光边框 */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden flow-animate"
            style={{
              padding: glowThickness,
              background: getFlowGradient(flowColors, 0.8),
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              animationDuration: `${flowSpeed}s`,
            }}
          />
        </div>

        {/* 全局灰尘粒子效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => {
            const size = 1 + Math.random() * 2;
            const startX = Math.random() * 100;
            const startY = 30 + Math.random() * 40;
            const duration = 8 + Math.random() * 12;
            const delay = -Math.random() * 20;
            const opacity = 0.1 + Math.random() * 0.2;
            return (
              <div
                key={`dust-${i}`}
                className="absolute rounded-full dust-float"
                style={{
                  left: `${startX}%`,
                  top: `${startY}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  filter: 'blur(0.5px)',
                }}
              />
            );
          })}
          {/* 大型漂浮光点 */}
          {[...Array(8)].map((_, i) => {
            const size = 3 + Math.random() * 4;
            const startX = 10 + Math.random() * 80;
            const startY = 35 + Math.random() * 30;
            const duration = 15 + Math.random() * 10;
            const delay = -Math.random() * 15;
            const colorIndex = i % 3;
            const particleColor = colorIndex === 0 ? color1 : colorIndex === 1 ? color2 : color3;
            return (
              <div
                key={`glow-dust-${i}`}
                className="absolute rounded-full dust-glow"
                style={{
                  left: `${startX}%`,
                  top: `${startY}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `radial-gradient(circle, ${particleColor}40 0%, transparent 70%)`,
                  boxShadow: `0 0 ${size * 2}px ${particleColor}30`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* 年份刻度 - 只显示关键节点 */}
        <div
          className="absolute left-8 right-8"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {keyYears.map(year => (
            <div
              key={year}
              className="absolute -translate-x-1/2"
              style={{ left: `${getPosition(year)}%` }}
            >
              {/* 刻度点 */}
              <div
                className="w-2 h-2 rounded-full absolute top-1/2 -translate-y-1/2"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.4)',
                }}
              />
              {/* 年份 */}
              <span
                className="absolute top-8 left-1/2 -translate-x-1/2 text-xs text-white/50 font-medium tracking-wider whitespace-nowrap"
                style={{ fontFamily: settings.fontFamily }}
              >
                {year}
              </span>
            </div>
          ))}
        </div>

        {/* 被照亮的时间段 - 玻璃发光条 */}
        {data.map((node, index) => {
          const startPos = getPosition(node.startYear);
          const endPos = getPosition(node.endYear);
          const segmentWidth = endPos - startPos;
          const isAbove = index % 2 === 0;
          const offsetY = isAbove ? -5 : 5;
          const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;

          return (
            <div
              key={`segment-${node.id}`}
              className="absolute h-10 rounded-full"
              style={{
                left: `calc(32px + (100% - 64px) * ${startPos / 100})`,
                width: `calc((100% - 64px) * ${segmentWidth / 100})`,
                top: '50%',
                transform: `translateY(calc(-50% + ${offsetY}px))`,
              }}
            >
              {/* 阴影基层 - 非照亮区域 */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(${isAbove ? '0deg' : '180deg'},
                    rgba(0,0,0,${0.6 * (1 - lightImpact)}) 0%,
                    rgba(0,0,0,${0.3 * (1 - lightImpact)}) 50%,
                    rgba(0,0,0,${0.1 * (1 - lightImpact)}) 100%)`,
                  boxShadow: `
                    inset 0 ${isAbove ? '' : '-'}4px 8px rgba(0,0,0,${0.4 * (1 - lightImpact)}),
                    0 0 20px rgba(0,0,0,${0.3 * (1 - lightImpact)})
                  `,
                }}
              />
              {/* 发光层 - 受灯光影响 */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    ${colors.glow} ${20 - lightFalloff * 15}%,
                    ${colors.primary} 50%,
                    ${colors.glow} ${80 + lightFalloff * 15}%,
                    transparent 100%)`,
                  filter: `blur(${(lightBlurX + lightBlurY) / 2}px)`,
                  opacity: lightOpacity * lightImpact,
                }}
              />
              {/* 内部高光 - 模拟被灯光照亮 */}
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: `radial-gradient(ellipse at 50% ${isAbove ? '0%' : '100%'},
                    rgba(255,255,255,${0.4 * lightImpact}) 0%,
                    transparent 70%)`,
                }}
              />
            </div>
          );
        })}

        {/* 聚光灯和卡片 */}
        {data.map((node, index) => {
          const startPos = getPosition(node.startYear);
          const endPos = getPosition(node.endYear);
          const centerPos = (startPos + endPos) / 2;
          const segmentWidth = endPos - startPos;
          const isAbove = index % 2 === 0;
          const colors = GLOW_COLORS[node.type] || GLOW_COLORS.work;

          // === 获取节点独立设置 ===
          const contextSettings = getNodeSettings(node.id);
          // 优先级：JSON Overrides > Context Node Overrides > Global Settings
          const ns = { ...contextSettings, ...(node.overrides || {}) };

          // 解构节点特定参数
          const {
            lightConeOriginX, lightConeOriginY, lightConeEndX, lightConeEndY,
            lightConeRotation, lightConeWidthStart, lightConeWidthEnd,
            timelineLightSpread: lightSpread,
            timelineLightBlurX: lightBlurX,
            timelineLightBlurY: lightBlurY,
            timelineLightSoftness: lightSoftnessRaw,
            timelineLightOpacity: lightOpacityRaw,
            timelineLightFalloff: lightFalloffRaw,
            timelineLightImpact: lightImpactRaw,
            timelineCardGlow: cardGlowRaw,
            timelineSilkSpeed: silkSpeed,
            timelineSilkOpacity: silkOpacityRaw,
            timelineSilkTurbulence: silkTurbulenceRaw,
            timelineSilkStartSpread: silkStartSpreadRaw,
            timelineSilkEndSpread: silkEndSpreadRaw,
            timelineSilkDistortion: silkDistortionRaw,
            focusFlowColors: flowColors,
            focusFlowSpeed: flowSpeed,
            focusGlowIntensity: glowIntensityRaw,
            focusGlowSpread: glowSpread,
            focusGlowThickness: glowThickness,
            glassBgOpacity, glassBlur, glassSaturate,
            timelineLinkCardOffset: linkCardOffset,
            // 颜色
            timelineColor1: color1,
            timelineColor2: color2,
            timelineColor3: color3,
          } = ns;

          // 归一化参数
          const lightSoftness = lightSoftnessRaw / 100;
          const lightOpacity = lightOpacityRaw / 100;
          const lightFalloff = lightFalloffRaw / 100;
          const lightImpact = lightImpactRaw / 100;
          const cardGlow = cardGlowRaw / 100;
          const silkOpacity = silkOpacityRaw / 100;
          const silkTurbulence = silkTurbulenceRaw / 100;
          const silkStartSpread = silkStartSpreadRaw / 100;
          const silkEndSpread = silkEndSpreadRaw / 100;
          const silkDistortion = silkDistortionRaw / 100;
          const glowIntensity = glowIntensityRaw / 100;

          // === 4点坐标计算系统 ===

          // 1. 基础尺寸
          const segmentWidthPx = BASE_WIDTH * (segmentWidth / 100);

          // 2. X轴偏移 (转换为百分比)
          const startXOffsetPercent = segmentWidthPx > 0 ? (lightConeOriginX / segmentWidthPx) * 100 : 0;
          const endXOffsetPercent = segmentWidthPx > 0 ? (lightConeEndX / segmentWidthPx) * 100 : 0;

          // 3. 宽度计算
          const cardRelativePos = 50;

          // 起点宽度 (卡片端) - 强化宽度系数的影响
          // 基础宽度(40%) * 系数 / 100
          const adjustedLightSpread = lightSpread * (lightConeWidthStart / 100);
          const narrowLeft = cardRelativePos - adjustedLightSpread / 2 + startXOffsetPercent;
          const narrowRight = cardRelativePos + adjustedLightSpread / 2 + startXOffsetPercent;

          // 终点宽度 (管道端) - 强化宽度系数的影响
          // 基础宽度(100%) * 系数 / 100
          const wideSpread = 100 * (lightConeWidthEnd / 100);
          const wideLeft = 50 - wideSpread / 2 + endXOffsetPercent;
          const wideRight = 50 + wideSpread / 2 + endXOffsetPercent;

          // 4. Clip Path 生成
          const clipAbove = `polygon(${narrowLeft}% 0%, ${narrowRight}% 0%, ${wideRight}% 100%, ${wideLeft}% 100%)`;
          const clipBelow = `polygon(${wideLeft}% 0%, ${wideRight}% 0%, ${narrowRight}% 100%, ${narrowLeft}% 100%)`;

          // 5. Y轴位置计算
          const baseCardY = 8 + cardHeight; // 基础卡片距离
          // 使用 timelineLightOriginY 作为基础偏移
          const adjustedStartY = baseCardY + ns.timelineLightOriginY + lightConeOriginY;

          const coneStyle = isAbove ? {
            top: `${adjustedStartY}px`,
            bottom: `calc(50% + 5px + ${lightConeEndY}px)`,
          } : {
            bottom: `${adjustedStartY}px`,
            top: `calc(50% + 5px + ${lightConeEndY}px)`,
          };

          return (
            <div key={node.id}>
              {/* SVG 滤镜 */}
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <filter id={`blur-${node.id}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={`${lightBlurX} ${lightBlurY}`} />
                  </filter>
                  <filter id={`soft-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={`${lightSoftness * 15}`} />
                  </filter>
                </defs>
              </svg>

              {/* 聚光灯光锥 */}
              {/* 直接使用 div 替代 LayoutWrapper 以避免默认布局干扰调试参数 */}
              <div
                className="absolute"
                style={{
                  left: `calc(32px + (100% - 64px) * ${startPos / 100})`,
                  width: `calc((100% - 64px) * ${segmentWidth / 100})`,
                  ...coneStyle,
                  transform: `rotate(${lightConeRotation}deg)`,
                  transformOrigin: isAbove ? 'top center' : 'bottom center',
                  zIndex: 0,
                }}
              >
                {/* 外层柔和光晕 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isAbove
                      ? `linear-gradient(180deg,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.3}`)} 0%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.2}`)} 40%,
                          transparent 80%)`
                      : `linear-gradient(0deg,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.3}`)} 0%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.2}`)} 40%,
                          transparent 80%)`,
                    clipPath: isAbove ? clipAbove : clipBelow,
                    filter: `url(#soft-${node.id})`,
                  }}
                />

                {/* 主光锥 - 方向性模糊 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isAbove
                      ? `linear-gradient(180deg,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.9}`)} 0%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.7 * (1 - lightFalloff * 0.4)}`)} ${10 + lightFalloff * 15}%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.4 * (1 - lightFalloff * 0.6)}`)} ${40 + lightFalloff * 20}%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.15 * lightImpact}`)} ${75}%,
                          transparent 100%)`
                      : `linear-gradient(0deg,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.9}`)} 0%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.7 * (1 - lightFalloff * 0.4)}`)} ${10 + lightFalloff * 15}%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.4 * (1 - lightFalloff * 0.6)}`)} ${40 + lightFalloff * 20}%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.15 * lightImpact}`)} ${75}%,
                          transparent 100%)`,
                    clipPath: isAbove ? clipAbove : clipBelow,
                    filter: `url(#blur-${node.id})`,
                  }}
                />

                {/* 光锥内核 - 清晰高亮 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isAbove
                      ? `linear-gradient(180deg,
                          ${colors.primary.replace('1)', `${lightOpacity * 0.6 * (1 - lightSoftness * 0.5)})`)} 0%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.35 * (1 - lightSoftness * 0.5)}`)} 15%,
                          transparent 40%)`
                      : `linear-gradient(0deg,
                          ${colors.primary.replace('1)', `${lightOpacity * 0.6 * (1 - lightSoftness * 0.5)})`)} 0%,
                          ${colors.glow.replace('0.6', `${lightOpacity * 0.35 * (1 - lightSoftness * 0.5)}`)} 15%,
                          transparent 40%)`,
                    clipPath: isAbove ? clipAbove : clipBelow,
                  }}
                />

                {/* 流动光丝 - 沿光锥角度辐射流动 */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: isAbove ? clipAbove : clipBelow }}
                >
                  {/* 辐射粒子流 - 沿角度方向流动 */}
                  {[...Array(15)].map((_, i) => {
                    // 计算每条丝线的角度
                    const t = (i - 7) / 7; // -1 到 1 的范围
                    const turbOffset = silkTurbulence * Math.sin(i * 2.1) * 5;

                    // 起点位置（卡片端，聚拢在中心）
                    const startX = 50 + t * silkStartSpread * 25 + turbOffset;
                    // 终点位置（时间轴端，向外分散）
                    const endX = 50 + t * silkEndSpread * 50 + turbOffset * 1.5;

                    // 计算水平位移量
                    const deltaX = endX - startX;

                    // 丝线宽度
                    const width = 1.5 + silkDistortion * Math.abs(Math.sin(i * 1.3)) * 2;

                    // 颜色循环
                    const colorSet = i % 3;
                    const primaryColor = colorSet === 0 ? color1 : colorSet === 1 ? color2 : color3;

                    // 计算角度用于渐变方向
                    const angleRad = Math.atan2(100, deltaX);
                    const angleDeg = (angleRad * 180 / Math.PI);
                    const gradientAngle = isAbove ? (90 + (deltaX * 0.5)) : (270 - (deltaX * 0.5));

                    return (
                      <div
                        key={`particle-${i}`}
                        className="absolute silk-particle"
                        style={{
                          left: `${startX}%`,
                          [isAbove ? 'top' : 'bottom']: '5%',
                          width: `${width}px`,
                          height: '25%',
                          opacity: silkOpacity * (0.4 + Math.abs(t) * 0.2),
                          background: `linear-gradient(${gradientAngle}deg,
                            ${primaryColor} 0%,
                            ${primaryColor}80 20%,
                            ${primaryColor}40 50%,
                            ${primaryColor}10 80%,
                            transparent 100%)`,
                          // CSS 变量传递位移
                          ['--dx' as string]: `${deltaX * 0.8}%`,
                          ['--dy' as string]: isAbove ? '280%' : '-280%',
                          animationDuration: `${silkSpeed * (0.8 + i * 0.05)}s`,
                          animationDelay: `${-i * 0.12}s`,
                          filter: `blur(${0.3 + silkDistortion * 0.5}px)`,
                          borderRadius: '50%',
                        }}
                      />
                    );
                  })}

                  {/* 主光束粒子 - 更明显的流动 */}
                  {[...Array(8)].map((_, i) => {
                    const t = (i - 3.5) / 3.5;
                    const turbOffset = silkTurbulence * Math.cos(i * 1.7) * 4;

                    const startX = 50 + t * silkStartSpread * 20 + turbOffset;
                    const endX = 50 + t * silkEndSpread * 45 + turbOffset * 2;
                    const deltaX = endX - startX;

                    const gradientAngle = isAbove ? (90 + (deltaX * 0.4)) : (270 - (deltaX * 0.4));

                    return (
                      <div
                        key={`beam-particle-${i}`}
                        className="absolute silk-beam-particle"
                        style={{
                          left: `${startX}%`,
                          [isAbove ? 'top' : 'bottom']: '3%',
                          width: `${3 + silkDistortion * 3}px`,
                          height: '20%',
                          opacity: silkOpacity * 0.5,
                          background: `linear-gradient(${gradientAngle}deg,
                            ${colors.glow.replace('0.6', '0.7')} 0%,
                            ${colors.glow.replace('0.6', '0.4')} 30%,
                            ${colors.glow.replace('0.6', '0.15')} 70%,
                            transparent 100%)`,
                          ['--dx' as string]: `${deltaX * 0.75}%`,
                          ['--dy' as string]: isAbove ? '320%' : '-320%',
                          animationDuration: `${silkSpeed * 1.2}s`,
                          animationDelay: `${-i * 0.2}s`,
                          filter: `blur(${1.5 + silkDistortion * 1.5}px)`,
                          borderRadius: '40%',
                        }}
                      />
                    );
                  })}

                  {/* 扭曲粒子流 - 不规则轨迹 */}
                  {[...Array(10)].map((_, i) => {
                    const t = (i - 4.5) / 4.5;
                    const turbOffset = silkTurbulence * Math.sin(i * 2.8) * 8;
                    const distortWave = silkDistortion * Math.cos(i * 1.9) * 5;

                    const startX = 50 + t * silkStartSpread * 22 + turbOffset;
                    const endX = 50 + t * silkEndSpread * 48 + turbOffset + distortWave;
                    const deltaX = endX - startX;

                    const colorSet = i % 3;
                    const particleColor = colorSet === 0 ? color1 : colorSet === 1 ? color2 : color3;
                    const gradientAngle = isAbove ? (90 + (deltaX * 0.6)) : (270 - (deltaX * 0.6));

                    return (
                      <div
                        key={`twist-particle-${i}`}
                        className="absolute silk-twist-particle"
                        style={{
                          left: `${startX}%`,
                          [isAbove ? 'top' : 'bottom']: '8%',
                          width: `${2 + silkDistortion * 1.5}px`,
                          height: '18%',
                          opacity: silkOpacity * 0.4,
                          background: `linear-gradient(${gradientAngle}deg,
                            ${particleColor} 0%,
                            ${particleColor}60 25%,
                            ${particleColor}20 60%,
                            transparent 100%)`,
                          ['--dx' as string]: `${deltaX * 0.9 + distortWave}%`,
                          ['--dy' as string]: isAbove ? '300%' : '-300%',
                          ['--twist' as string]: `${silkDistortion * (i % 2 === 0 ? 15 : -15)}deg`,
                          animationDuration: `${silkSpeed * (1 + i * 0.08)}s`,
                          animationDelay: `${-i * 0.15}s`,
                          filter: `blur(${0.8 + silkDistortion * 0.8}px)`,
                          borderRadius: '30%',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 信息卡片 - 液态玻璃 + 自发光 */}
              <LayoutWrapper
                nodeId={node.id}
                elementType="mainCard"
                isMobile={false}
                className="absolute group"
                style={{
                  left: `calc(32px + (100% - 64px) * ${centerPos / 100})`,
                  transform: 'translateX(-50%)',
                  top: isAbove ? '8px' : 'auto',
                  bottom: isAbove ? 'auto' : '8px',
                }}
              >
                {/* 卡片自发光 - 作为光源 */}
                <div
                  className="absolute rounded-2xl"
                  style={{
                    inset: `-${12 * cardGlow}px`,
                    background: `radial-gradient(ellipse at 50% ${isAbove ? '100%' : '0%'},
                      ${colors.glow.replace('0.6', `${cardGlow * 0.8}`)} 0%,
                      ${colors.glow.replace('0.6', `${cardGlow * 0.4}`)} 30%,
                      transparent 70%)`,
                    filter: `blur(${16 * cardGlow}px)`,
                  }}
                />

                {/* 卡片外发光 - 悬停增强 */}
                <div
                  className="absolute inset-0 rounded-2xl flow-animate opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: getFlowGradient(flowColors, glowIntensity * 0.5),
                    filter: `blur(${glowSpread}px)`,
                    transform: 'scale(1.2)',
                    animationDuration: `${flowSpeed}s`,
                  }}
                />

                {/* 主卡片 */}
                <div
                  className="relative rounded-2xl px-4 py-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg,
                      rgba(255,255,255,${glassBgOpacity * 0.15}) 0%,
                      rgba(255,255,255,${glassBgOpacity * 0.08}) 100%)`,
                    backdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
                    WebkitBackdropFilter: `blur(${glassBlur}px) saturate(${glassSaturate}%)`,
                    border: `1px solid ${colors.glow.replace('0.6', `${0.2 + cardGlow * 0.3}`)}`,
                    boxShadow: `
                      0 8px 32px rgba(0,0,0,0.3),
                      inset 0 1px 0 rgba(255,255,255,0.2),
                      0 0 ${glowSpread + cardGlow * 20}px ${colors.glow},
                      0 ${isAbove ? '' : '-'}${8 + cardGlow * 16}px ${16 + cardGlow * 24}px ${colors.glow.replace('0.6', `${cardGlow * 0.5}`)}
                    `,
                    minWidth: '140px',
                  }}
                >
                  {/* 顶部/底部高光 - 根据位置调整 */}
                  <div
                    className={`absolute inset-x-0 ${isAbove ? 'bottom-0 rounded-b-2xl' : 'top-0 rounded-t-2xl'} h-8 pointer-events-none`}
                    style={{
                      background: isAbove
                        ? 'linear-gradient(0deg, rgba(255,255,255,0.12) 0%, transparent 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                    }}
                  />

                  {/* 流光边框 */}
                  {glowIntensity > 0 && (
                    <div
                      className="absolute inset-0 rounded-2xl overflow-hidden flow-animate pointer-events-none"
                      style={{
                        padding: glowThickness * 0.5,
                        background: getFlowGradient(flowColors, 0.6),
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        animationDuration: `${flowSpeed}s`,
                      }}
                    />
                  )}

                  {/* 标签 */}
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2"
                    style={{
                      background: `${colors.primary}20`,
                      border: `1px solid ${colors.primary}40`,
                      boxShadow: `0 0 8px ${colors.glow}`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: colors.primary,
                        boxShadow: `0 0 6px ${colors.glow}`,
                      }}
                    />
                    <span className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                      {node.type === 'education' ? '大学' : node.type === 'internship' ? '实习' : '工作'}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h3
                    className="text-sm font-bold text-white/95 leading-tight"
                    style={{
                      fontFamily: settings.fontFamily,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {node.title}
                  </h3>

                  {/* 副标题 */}
                  {node.subtitle && (
                    <div
                      className="text-xs text-white/60 mt-0.5"
                      style={{ fontFamily: settings.fontFamily }}
                    >
                      {node.subtitle}
                    </div>
                  )}
                </div>
              </LayoutWrapper>

              {/* 玻璃连接线 - 树杈状：在主卡片外侧 */}
              <LayoutWrapper
                nodeId={node.id}
                elementType="glassLine"
                isMobile={false}
                className="absolute"
                style={{
                  left: `calc(32px + (100% - 64px) * ${centerPos / 100})`,
                  transform: 'translateX(-50%)',
                  // 树杈状：上方卡片向上延伸，下方卡片向下延伸
                  top: isAbove ? `${8 - linkCardOffset}px` : 'auto',
                  bottom: isAbove ? 'auto' : `${8 - linkCardOffset}px`,
                  width: '2px',
                  height: `${linkCardOffset}px`,
                }}
              >
                {/* 玻璃管连接线 */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(${isAbove ? '180deg' : '0deg'},
                      ${colors.glow.replace('0.6', '0.4')} 0%,
                      rgba(255,255,255,0.3) 30%,
                      rgba(255,255,255,0.3) 70%,
                      ${colors.glow.replace('0.6', '0.2')} 100%)`,
                    boxShadow: `
                      0 0 4px ${colors.glow},
                      inset 1px 0 0 rgba(255,255,255,0.3)
                    `,
                  }}
                />
                {/* 流光效果 */}
                <div
                  className="absolute inset-0 rounded-full flow-animate overflow-hidden"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, ${colors.primary}60 50%, transparent 100%)`,
                    backgroundSize: '100% 200%',
                    animationDuration: `${flowSpeed * 2}s`,
                  }}
                />
              </LayoutWrapper>

              {/* 外侧链接卡片 - 树杈状：在主卡片外侧 */}
              <LayoutWrapper
                nodeId={node.id}
                elementType="linkCard"
                isMobile={false}
                className="absolute"
                style={{
                  left: `calc(32px + (100% - 64px) * ${centerPos / 100})`,
                  transform: `translateX(-50%) translateY(${isAbove ? '-100%' : '0'})`,
                  // 树杈状定位：上方卡片在更上方，下方卡片在更下方
                  top: isAbove ? `${8 - linkCardOffset}px` : 'auto',
                  bottom: isAbove ? 'auto' : `${8 - linkCardOffset}px`,
                }}
              >
                {/* 链接卡片 - 小型玻璃卡 */}
                <div
                  className="relative rounded-xl px-3 py-1.5"
                  style={{
                    background: `linear-gradient(135deg,
                      rgba(255,255,255,${glassBgOpacity * 0.1}) 0%,
                      rgba(255,255,255,${glassBgOpacity * 0.05}) 100%)`,
                    backdropFilter: `blur(${glassBlur * 0.8}px) saturate(${glassSaturate}%)`,
                    WebkitBackdropFilter: `blur(${glassBlur * 0.8}px) saturate(${glassSaturate}%)`,
                    border: `1px solid ${colors.glow.replace('0.6', '0.15')}`,
                    boxShadow: `
                      0 4px 16px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.15),
                      0 0 ${glowSpread * 0.5}px ${colors.glow.replace('0.6', '0.3')}
                    `,
                    maxWidth: '180px',
                  }}
                >
                  {/* 描述信息 - 来自JSON的description */}
                  {node.description && (
                    <div
                      className="text-[9px] text-white/70 leading-tight text-center"
                      style={{ fontFamily: settings.fontFamily }}
                    >
                      {node.description}
                    </div>
                  )}
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
