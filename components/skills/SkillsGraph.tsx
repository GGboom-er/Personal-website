import React, { useMemo, useState, useEffect } from 'react';
import { useGlassSettings } from '../../contexts/GlassSettingsContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { getFlowGradient } from '../glass';
import { getAssetPath } from '../../utils/assetPath';
import skillsData from '../../data/skills.json';

// 技能节点类型
interface SkillNode {
  id: string;
  label: string;
  level: number;
  group?: number;
  color: string;
  scale?: number;
  image?: string;
}

// 预加载图片并检查是否有效
const useImageExists = (src: string | undefined): boolean => {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!src || src.trim() === '') {
      setExists(false);
      return;
    }
    const img = new Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = getAssetPath(src);
    return () => { img.onload = null; img.onerror = null; };
  }, [src]);

  return exists;
};

// 带检测的图片组件
const SafeImage: React.FC<{ src?: string; size: number; padding: number }> = ({ src, size, padding }) => {
  const imageExists = useImageExists(src);
  if (!imageExists || !src) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5" style={{ padding: `${padding}px` }}>
      <img src={getAssetPath(src)} alt="" className="w-full h-full object-contain opacity-90" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
    </div>
  );
};

// 确定性随机数
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// 玻璃球组件
const GlassBubble: React.FC<{
  size: number;
  color: string;
  settings: any;
  isCenter?: boolean;
  uniqueId?: string;
}> = ({ size, color, settings, isCenter = false, uniqueId = 'default' }) => {
  const { glassBlur, glassSaturate, focusGlowIntensity, focusFlowColors, focusFlowSpeed } = settings;
  const glowIntensity = focusGlowIntensity / 100;
  const edgeBlur = Math.max(8, glassBlur * 2.5);
  const edgeSaturate = Math.max(140, glassSaturate * 1.6);
  const animDelay = (uniqueId.charCodeAt(0) + (uniqueId.charCodeAt(uniqueId.length - 1) || 0)) % 10;

  return (
    <div className="relative rounded-full flex items-center justify-center bubble-breathe" style={{ width: `${size}px`, height: `${size}px`, animationDelay: `${animDelay * 0.3}s` }}>
      {/* SVG滤镜 */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={`edge-distort-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" seed={uniqueId.length * 7} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 中心清晰区域 */}
      <div className="absolute rounded-full pointer-events-none" style={{ inset: `${size * 0.1}px`, backdropFilter: `blur(${glassBlur * 0.15}px) brightness(1.02)`, WebkitBackdropFilter: `blur(${glassBlur * 0.15}px) brightness(1.02)` }} />

      {/* 边缘折射层 */}
      <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden edge-distort" style={{
        backdropFilter: `blur(${edgeBlur}px) saturate(${edgeSaturate}%) brightness(1.15) contrast(1.1)`,
        WebkitBackdropFilter: `blur(${edgeBlur}px) saturate(${edgeSaturate}%) brightness(1.15) contrast(1.1)`,
        maskImage: `radial-gradient(circle at center, transparent 0%, transparent 75%, black 85%, black 100%)`,
        WebkitMaskImage: `radial-gradient(circle at center, transparent 0%, transparent 75%, black 85%, black 100%)`
      }} />

      {/* 边缘额外扭曲 */}
      <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{
        backdropFilter: `blur(${edgeBlur * 1.5}px) saturate(${edgeSaturate * 1.2}%) hue-rotate(5deg)`,
        WebkitBackdropFilter: `blur(${edgeBlur * 1.5}px) saturate(${edgeSaturate * 1.2}%) hue-rotate(5deg)`,
        maskImage: `radial-gradient(circle at center, transparent 0%, transparent 85%, rgba(0,0,0,0.7) 92%, black 100%)`,
        WebkitMaskImage: `radial-gradient(circle at center, transparent 0%, transparent 85%, rgba(0,0,0,0.7) 92%, black 100%)`
      }} />

      {/* 边缘反射 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at 20% 20%, transparent 65%, rgba(255,255,255,0.12) 80%, rgba(255,255,255,0.2) 92%, transparent 100%), radial-gradient(circle at 80% 80%, transparent 65%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0.12) 92%, transparent 100%)` }} />

      {/* 彩虹色散 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at 15% 50%, transparent 75%, rgba(255,100,100,0.08) 88%, transparent 100%), radial-gradient(circle at 85% 50%, transparent 75%, rgba(100,100,255,0.08) 88%, transparent 100%), radial-gradient(circle at 50% 15%, transparent 75%, rgba(100,255,100,0.06) 88%, transparent 100%)` }} />

      {/* 3D边缘暗部 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0.22) 90%, rgba(0,0,0,0.35) 100%)` }} />

      {/* 顶部受光区 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 20%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)` }} />

      {/* 边框与阴影 */}
      <div className="absolute inset-0 rounded-full" style={{
        border: `1px solid rgba(255,255,255,0.3)`,
        boxShadow: `0 ${size * 0.15}px ${size * 0.5}px rgba(0,0,0,0.35), 0 ${size * 0.05}px ${size * 0.15}px rgba(0,0,0,0.25), inset 0 ${size * 0.02}px ${size * 0.05}px rgba(255,255,255,0.25), inset 0 -${size * 0.02}px ${size * 0.05}px rgba(0,0,0,0.15), 0 0 ${25 * glowIntensity}px ${color}${Math.round(40 * glowIntensity).toString(16).padStart(2, '0')}`
      }} />

      {/* 边缘彩色折射 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, transparent 70%, ${color}18 85%, ${color}30 100%)` }} />

      {/* 流光边框 */}
      <div className="absolute inset-0 rounded-full overflow-hidden flow-animate pointer-events-none" style={{
        padding: isCenter ? '2px' : '1.5px',
        background: getFlowGradient(focusFlowColors, 0.6),
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animationDuration: `${focusFlowSpeed}s`
      }} />
    </div>
  );
};

// 弧形文字组件
const CurvedLabel: React.FC<{ label: string; size: number; color: string; settings: any; uniqueId: string }> = ({ label, size, color, settings, uniqueId }) => {
  const textLen = label.length;

  // 弧形半径紧贴球体边缘
  const arcRadius = size / 2 + 4;
  const svgSize = size * 2.2;
  const center = svgSize / 2;

  // 弧度角度根据文字长度大幅增加，长文字可以环绕更多甚至接近一圈
  // 短文字(<=4): 60-100度, 中等(5-8): 100-160度, 长文字(>8): 160-320度
  const arcAngle = Math.min(320, 40 + textLen * 20);
  const startAngle = 270 - arcAngle / 2;
  const endAngle = 270 + arcAngle / 2;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const startX = center + arcRadius * Math.cos(startRad);
  const startY = center + arcRadius * Math.sin(startRad);
  const endX = center + arcRadius * Math.cos(endRad);
  const endY = center + arcRadius * Math.sin(endRad);

  // 超过180度需要使用大弧
  const largeArc = arcAngle > 180 ? 1 : 0;
  const pathD = `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${endX} ${endY}`;
  const pathId = `curved-text-${uniqueId}`;

  // 保持正常字号
  const fontSize = Math.max(10, size * 0.2);

  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ overflow: 'visible', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
      <defs><path id={pathId} d={pathD} fill="none" /></defs>
      <text fill="white" style={{ fontSize: `${fontSize}px`, fontFamily: settings.fontFamily, fontWeight: 600, filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 6px ${color}60)` }}>
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{label}</textPath>
      </text>
    </svg>
  );
};

// 固定高光层组件
const FixedHighlight: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const r = size / 2;
  return (
    <>
      <div className="absolute rounded-full pointer-events-none" style={{ width: `${r * 0.35}px`, height: `${r * 0.35}px`, top: `${r * 0.28}px`, left: `${r * 0.32}px`, background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.15) 60%, transparent 80%)', filter: 'blur(0.5px)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: `${r * 0.15}px`, height: `${r * 0.15}px`, top: `${r * 0.75}px`, left: `${r * 0.22}px`, background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 50%, transparent 80%)' }} />
      <div className="absolute pointer-events-none" style={{ width: `${size * 0.94}px`, height: `${size * 0.94}px`, top: `${size * 0.03}px`, left: `${size * 0.03}px`, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,0.22)', borderLeftColor: 'rgba(255,255,255,0.12)', transform: 'rotate(-40deg)', filter: 'blur(1px)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: `${r * 0.7}px`, height: `${r * 0.2}px`, bottom: `${r * 0.3}px`, left: '50%', transform: 'translateX(-50%)', background: `radial-gradient(ellipse, ${color}20 0%, ${color}08 50%, transparent 80%)`, filter: 'blur(2px)' }} />
      <div className="absolute pointer-events-none" style={{ width: `${size * 0.84}px`, height: `${size * 0.84}px`, bottom: `${size * 0.08}px`, right: `${size * 0.08}px`, borderRadius: '50%', border: '1.5px solid transparent', borderBottomColor: 'rgba(255,255,255,0.05)', borderRightColor: 'rgba(255,255,255,0.03)', transform: 'rotate(40deg)', filter: 'blur(0.8px)' }} />
    </>
  );
};

// 玻璃棒组件
const GlassRod: React.FC<{ centerSize: number; satelliteSize: number; distance: number; color: string; settings: any }> = ({ centerSize, satelliteSize, distance, color, settings }) => {
  const { focusFlowSpeed, focusGlowIntensity } = settings;
  const glowIntensity = focusGlowIntensity / 100;
  const rodTop = satelliteSize / 2 + 4;
  const rodLength = Math.max(0, distance - centerSize / 2 - 4 - rodTop);

  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${rodTop}px`, height: `${rodLength}px`, width: '4px' }}>
      <div className="absolute rounded-full" style={{ top: '1px', left: '1px', right: '-1px', bottom: '-1px', background: 'rgba(0,0,0,0.25)', filter: 'blur(2px)' }} />
      <div className="absolute inset-0 rounded-full rod-glow" style={{ background: `linear-gradient(180deg, ${color}70 0%, ${color}40 50%, ${color}70 100%)`, filter: 'blur(4px)', opacity: 0.6 * glowIntensity, transform: 'scaleX(3)' }} />
      <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 70%, rgba(0,0,0,0.1) 100%)`, boxShadow: `0 0 8px ${color}80, 0 0 16px ${color}40, inset 1px 0 2px rgba(255,255,255,0.5)` }} />
      <div className="absolute rounded-full" style={{ top: '5%', bottom: '5%', left: '15%', width: '25%', background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 100%)' }} />
      <div className="absolute inset-0 rounded-full flow-animate overflow-hidden" style={{ background: `linear-gradient(180deg, transparent 0%, ${color}80 50%, transparent 100%)`, backgroundSize: '100% 200%', animationDuration: `${focusFlowSpeed * 2}s` }} />
    </div>
  );
};

// 卫星球+玻璃棒组合
const SatelliteWithRod: React.FC<{
  node: SkillNode; distance: number; size: number; angle: number; centerSize: number;
  settings: any; floatDuration: number; floatDelay: number; rotationDuration: number;
  isReverse: boolean; groupIndex: number; satelliteIndex: number;
}> = ({ node, distance, size, angle, centerSize, settings, floatDuration, floatDelay, rotationDuration, isReverse, groupIndex, satelliteIndex }) => {
  const uniqueId = `sat-${groupIndex}-${satelliteIndex}`;
  const counterStyle = { top: 0, left: 0, width: `${size}px`, height: `${size}px`, transformOrigin: 'center center', animationDuration: `${rotationDuration}s`, animationDirection: isReverse ? 'reverse' : 'normal' as const };

  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center center', width: 0, height: 0 }}>
      <div className="absolute satellite-float" style={{ left: '50%', bottom: '50%', width: `${size + 20}px`, height: `${distance}px`, transform: 'translateX(-50%)', animationDuration: `${floatDuration}s`, animationDelay: `${floatDelay}s` }}>
        <GlassRod centerSize={centerSize} satelliteSize={size} distance={distance} color={node.color} settings={settings} />
        <div className="absolute top-0 left-1/2" style={{ transform: 'translateX(-50%) translateY(-50%)', width: `${size}px`, height: `${size}px` }}>
          <GlassBubble size={size} color={node.color} settings={settings} uniqueId={uniqueId} />
          <div className="absolute highlight-counter-rotate" style={{ ...counterStyle, ['--highlight-initial-angle' as string]: `${-angle}deg` }}>
            <FixedHighlight size={size} color={node.color} />
          </div>
          <div className="absolute highlight-counter-rotate" style={{ ...counterStyle, ['--highlight-initial-angle' as string]: `${-angle}deg` }}>
            <SafeImage src={node.image} size={size} padding={size * 0.2} />
          </div>
          <div className="absolute text-counter-rotate" style={{ ...counterStyle, ['--initial-angle' as string]: `${-angle}deg` }}>
            <div className="text-wobble relative w-full h-full" style={{ animationDuration: `${floatDuration * 1.5}s`, animationDelay: `${floatDelay}s` }}>
              <CurvedLabel label={node.label} size={size} color={node.color} settings={settings} uniqueId={uniqueId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 技能组
const SkillGroup: React.FC<{
  centerNode: SkillNode; satellites: SkillNode[]; position: { x: number; y: number };
  settings: any; groupIndex: number; isMobile: boolean; scale: number;
}> = ({ centerNode, satellites, position, settings, groupIndex, isMobile, scale }) => {
  const centerSize = isMobile ? 55 : 75;
  const satelliteBaseSize = isMobile ? 36 : 48;
  const distanceBase = isMobile ? 70 : 100;
  const distanceVariance = isMobile ? 15 : 25;

  const satelliteLayout = useMemo(() => satellites.map((node, i) => ({
    node,
    angle: (i / satellites.length) * 360,
    distance: distanceBase + seededRandom(groupIndex * 100 + i) * distanceVariance,
    size: satelliteBaseSize + seededRandom(groupIndex * 100 + i + 50) * (isMobile ? 8 : 12),
  })), [satellites, groupIndex, isMobile, distanceBase, distanceVariance, satelliteBaseSize]);

  const rotationDuration = 45 + groupIndex * 12;
  const floatDuration = 4 + groupIndex * 0.6;
  const isReverse = groupIndex % 2 !== 0;
  const animationName = isMobile ? `group-drift-mobile-${groupIndex}` : `group-drift-${groupIndex}`;
  const animDuration = isMobile ? (8 + groupIndex * 3) : (groupIndex === 0 ? 8 : 25);

  const counterStyle = { top: 0, left: 0, width: `${centerSize}px`, height: `${centerSize}px`, transformOrigin: 'center center', animationDuration: `${rotationDuration}s`, animationDirection: isReverse ? 'reverse' : 'normal' as const };

  return (
    <div className="absolute group-drift" style={{ left: `${position.x}%`, top: `${position.y}%`, animationDuration: `${animDuration}s`, animationName, ['--group-scale' as string]: scale }}>
      <div className="relative skill-group-rotate" style={{ animationDuration: `${rotationDuration}s`, animationDirection: isReverse ? 'reverse' : 'normal' }}>
        {satelliteLayout.map((sat, i) => (
          <SatelliteWithRod key={sat.node.id} node={sat.node} distance={sat.distance} size={sat.size} angle={sat.angle} centerSize={centerSize} settings={settings} floatDuration={floatDuration} floatDelay={i * 0.3} rotationDuration={rotationDuration} isReverse={isReverse} groupIndex={groupIndex} satelliteIndex={i} />
        ))}
        <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)', width: `${centerSize}px`, height: `${centerSize}px` }}>
          <div className="center-float relative" style={{ width: `${centerSize}px`, height: `${centerSize}px`, animationDuration: `${floatDuration * 1.2}s` }}>
            <GlassBubble size={centerSize} color={centerNode.color} settings={settings} isCenter uniqueId={`center-${groupIndex}`} />
            <div className="absolute highlight-counter-rotate" style={{ ...counterStyle, ['--highlight-initial-angle' as string]: '0deg' }}>
              <FixedHighlight size={centerSize} color={centerNode.color} />
            </div>
            <div className="absolute highlight-counter-rotate" style={{ ...counterStyle, ['--highlight-initial-angle' as string]: '0deg' }}>
              <SafeImage src={centerNode.image} size={centerSize} padding={centerSize * 0.18} />
            </div>
            <div className="absolute text-counter-rotate" style={{ ...counterStyle, ['--initial-angle' as string]: '0deg' }}>
              <div className="text-wobble relative w-full h-full" style={{ animationDuration: `${floatDuration * 1.5}s` }}>
                <CurvedLabel label={centerNode.label} size={centerSize} color={centerNode.color} settings={settings} uniqueId={`center-${groupIndex}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 主组件
const SkillsGraph: React.FC = () => {
  const { settings } = useGlassSettings();
  const { isMobile } = useBreakpoint();

  const groups = useMemo(() => {
    const nodes = skillsData.nodes as SkillNode[];
    return nodes.filter(n => n.level === 1).map(centerNode => ({
      center: centerNode,
      satellites: nodes.filter(n => n.level === 2 && n.group === centerNode.group),
    }));
  }, []);

  const groupPositions = isMobile
    ? [{ x: 50, y: 20 }, { x: 50, y: 50 }, { x: 50, y: 80 }]
    : [{ x: 50, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 50 }];
  const scale = isMobile ? 1.4 : 1;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <style>{`
        @keyframes skill-group-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .skill-group-rotate { animation: skill-group-rotate linear infinite; }

        @keyframes text-counter-rotate { from { transform: rotate(var(--initial-angle, 0deg)); } to { transform: rotate(calc(var(--initial-angle, 0deg) - 360deg)); } }
        .text-counter-rotate { animation: text-counter-rotate linear infinite; }

        @keyframes highlight-counter-rotate { from { transform: rotate(var(--highlight-initial-angle, 0deg)); } to { transform: rotate(calc(var(--highlight-initial-angle, 0deg) - 360deg)); } }
        .highlight-counter-rotate { animation: highlight-counter-rotate linear infinite; }

        @keyframes text-wobble { 0%, 100% { transform: rotate(0deg) translateY(0px); } 20% { transform: rotate(4deg) translateY(-1px); } 40% { transform: rotate(-3deg) translateY(1px); } 60% { transform: rotate(5deg) translateY(-1px); } 80% { transform: rotate(-4deg) translateY(0px); } }
        .text-wobble { animation: text-wobble ease-in-out infinite; }

        @keyframes satellite-float { 0%, 100% { transform: translateX(-50%) translateY(0px); } 50% { transform: translateX(-50%) translateY(-8px); } }
        .satellite-float { animation: satellite-float ease-in-out infinite; }

        @keyframes center-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        .center-float { animation: center-float ease-in-out infinite; }

        @keyframes group-drift-0 { 0%, 100% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(0px, 0px); } 50% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(0px, -6px); } }
        @keyframes group-drift-1 { 0% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-500px, 30px); opacity: 0.95; } 20% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-440px, -50px); opacity: 0.85; } 40% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-380px, 0px); opacity: 0.7; } 60% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-440px, 50px); opacity: 0.75; } 80% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-480px, -25px); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-500px, 30px); opacity: 0.95; } }
        @keyframes group-drift-2 { 0% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(500px, -30px); opacity: 0.95; } 20% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(440px, 50px); opacity: 0.85; } 40% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(380px, 0px); opacity: 0.7; } 60% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(440px, -50px); opacity: 0.75; } 80% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(480px, 25px); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(500px, -30px); opacity: 0.95; } }

        @keyframes group-drift-mobile-0 { 0%, 100% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(0px, 0px); } 50% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(8px, -5px); } }
        @keyframes group-drift-mobile-1 { 0%, 100% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(0px, 0px); } 50% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(-6px, 5px); } }
        @keyframes group-drift-mobile-2 { 0%, 100% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(0px, 0px); } 50% { transform: translate(-50%, -50%) scale(var(--group-scale, 1)) translate(5px, 8px); } }

        .group-drift { animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-fill-mode: both; }

        @keyframes rod-glow-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        .rod-glow { animation: rod-glow-pulse 2s ease-in-out infinite; }

        @keyframes edge-distort-pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 1; } }
        .edge-distort { animation: edge-distort-pulse 4s ease-in-out infinite; }

        @keyframes bubble-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .bubble-breathe { animation: bubble-breathe 5s ease-in-out infinite; }
      `}</style>

      {isMobile ? (
        groups.map((group, i) => (
          <SkillGroup key={group.center.id} centerNode={group.center} satellites={group.satellites} position={groupPositions[i] || { x: 50, y: 50 }} settings={settings} groupIndex={i} isMobile={isMobile} scale={scale} />
        ))
      ) : (
        <>
          <SkillGroup key={groups[0]?.center.id + '-left'} centerNode={groups[0]?.center} satellites={groups[0]?.satellites || []} position={groupPositions[1]} settings={settings} groupIndex={1} isMobile={isMobile} scale={scale * 0.7} />
          <SkillGroup key={groups[2]?.center.id + '-right'} centerNode={groups[2]?.center} satellites={groups[2]?.satellites || []} position={groupPositions[2]} settings={settings} groupIndex={2} isMobile={isMobile} scale={scale * 0.7} />
          <SkillGroup key={groups[1]?.center.id + '-center'} centerNode={groups[1]?.center} satellites={groups[1]?.satellites || []} position={groupPositions[0]} settings={settings} groupIndex={0} isMobile={isMobile} scale={scale * 1.1} />
        </>
      )}
    </div>
  );
};

export default SkillsGraph;
