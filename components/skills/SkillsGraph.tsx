import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useGlassSettings } from '../../contexts/GlassSettingsContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { getFlowGradient } from '../glass';
import { getAssetPath } from '../../utils/assetPath';
import skillsData from '../../data/skills.json';

// ── 静态 CSS 动画规则（提取到组件外部，避免每次渲染重新注入） ──
const SKILLS_KEYFRAMES = `
@keyframes skill-group-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.skill-group-rotate{animation:skill-group-rotate linear infinite}

@keyframes text-counter-rotate{from{transform:rotate(var(--initial-angle,0deg))}to{transform:rotate(calc(var(--initial-angle,0deg) - 360deg))}}
.text-counter-rotate{animation:text-counter-rotate linear infinite}

@keyframes highlight-counter-rotate{from{transform:rotate(var(--highlight-initial-angle,0deg))}to{transform:rotate(calc(var(--highlight-initial-angle,0deg) - 360deg))}}
.highlight-counter-rotate{animation:highlight-counter-rotate linear infinite}

@keyframes text-wobble{0%,100%{transform:rotate(0deg) translateY(0px)}20%{transform:rotate(4deg) translateY(-1px)}40%{transform:rotate(-3deg) translateY(1px)}60%{transform:rotate(5deg) translateY(-1px)}80%{transform:rotate(-4deg) translateY(0px)}}
.text-wobble{animation:text-wobble ease-in-out infinite}

@keyframes satellite-float{0%,100%{transform:translateX(-50%) translateY(0px)}50%{transform:translateX(-50%) translateY(-8px)}}
.satellite-float{animation:satellite-float ease-in-out infinite}

@keyframes center-float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-4px)}}
.center-float{animation:center-float ease-in-out infinite}

@keyframes rod-glow-pulse{0%,100%{opacity:.5}50%{opacity:.9}}
.rod-glow{animation:rod-glow-pulse 2s ease-in-out infinite}

@keyframes edge-distort-pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.02);opacity:1}}
.edge-distort{animation:edge-distort-pulse 4s ease-in-out infinite}

@keyframes bubble-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.bubble-breathe{animation:bubble-breathe 5s ease-in-out infinite}
`;

interface SkillNode {
  id: string;
  label: string;
  level: number;
  group?: number;
  color: string;
  scale?: number;
  image?: string;
}

// ── 参考尺寸（sizeScale=1 时的轨道外半径，包含卫星球+弧形文字）
// distanceBase(100) + satelliteSize/2(≈27) + 弧形标签突出(≈50) ≈ 177
const REF_RADIUS = 177;

const SafeImage: React.FC<{ src?: string; size: number; padding: number }> = ({ src, size, padding }) => {
  const [visible, setVisible] = useState(true);
  if (!src || !visible) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ padding: `${padding}px` }}>
      <img src={getAssetPath(src)} alt=""
        className="w-full h-full object-contain opacity-90"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        onError={() => setVisible(false)} />
    </div>
  );
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// ──────────────────────────────────────────
const GlassBubble: React.FC<{
  size: number; color: string; settings: any; isCenter?: boolean; uniqueId?: string; isMobile?: boolean;
}> = ({ size, color, settings, isCenter = false, uniqueId = 'default', isMobile = false }) => {
  const { glassBlur, glassSaturate, focusGlowIntensity, focusFlowColors, focusFlowSpeed } = settings;
  const gi = focusGlowIntensity / 100;
  const eb = Math.max(8, glassBlur * 2.5);
  const es = Math.max(140, glassSaturate * 1.6);
  const delay = (uniqueId.charCodeAt(0) + (uniqueId.charCodeAt(uniqueId.length - 1) || 0)) % 10;

  return (
    <div className={`relative rounded-full flex items-center justify-center${isMobile ? '' : ' bubble-breathe'}`}
      style={{ width: `${size}px`, height: `${size}px`, ...(!isMobile ? { animationDelay: `${delay * 0.3}s` } : {}) }}>
      {/* SVG feTurbulence 滤镜 — 移动端跳过 */}
      {!isMobile && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id={`ed-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={3} result="noise" seed={uniqueId.length * 7} />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={6} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}
      {/* 主体模糊层 — 移动端仅保留此层 */}
      {!isMobile && (
        <div className="absolute rounded-full pointer-events-none" style={{ inset: `${size * 0.1}px`, backdropFilter: `blur(${glassBlur * 0.15}px) brightness(1.02)`, WebkitBackdropFilter: `blur(${glassBlur * 0.15}px) brightness(1.02)` }} />
      )}
      {/* 边缘增强层 — 移动端跳过 */}
      {!isMobile && (
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden edge-distort" style={{
          backdropFilter: `blur(${eb}px) saturate(${es}%) brightness(1.15) contrast(1.1)`,
          WebkitBackdropFilter: `blur(${eb}px) saturate(${es}%) brightness(1.15) contrast(1.1)`,
          maskImage: 'radial-gradient(circle at center,transparent 0%,transparent 75%,black 85%,black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center,transparent 0%,transparent 75%,black 85%,black 100%)',
        }} />
      )}
      {/* 极边缘层 — 移动端跳过 */}
      {!isMobile && (
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{
          backdropFilter: `blur(${eb * 1.5}px) saturate(${es * 1.2}%) hue-rotate(5deg)`,
          WebkitBackdropFilter: `blur(${eb * 1.5}px) saturate(${es * 1.2}%) hue-rotate(5deg)`,
          maskImage: 'radial-gradient(circle at center,transparent 0%,transparent 85%,rgba(0,0,0,0.7) 92%,black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center,transparent 0%,transparent 85%,rgba(0,0,0,0.7) 92%,black 100%)',
        }} />
      )}
      {/* 移动端：单层合并模糊 */}
      {isMobile && (
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          backdropFilter: `blur(${eb}px) saturate(${es}%)`,
          WebkitBackdropFilter: `blur(${eb}px) saturate(${es}%)`,
        }} />
      )}
      {/* 径向渐变高光 — 保留 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at 20% 20%,transparent 65%,rgba(255,255,255,.12) 80%,rgba(255,255,255,.2) 92%,transparent 100%),radial-gradient(circle at 80% 80%,transparent 65%,rgba(255,255,255,.06) 80%,rgba(255,255,255,.12) 92%,transparent 100%)` }} />
      {/* 色散层 — 移动端跳过 */}
      {!isMobile && (
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at 15% 50%,transparent 75%,rgba(255,100,100,.08) 88%,transparent 100%),radial-gradient(circle at 85% 50%,transparent 75%,rgba(100,100,255,.08) 88%,transparent 100%),radial-gradient(circle at 50% 15%,transparent 75%,rgba(100,255,100,.06) 88%,transparent 100%)` }} />
      )}
      {/* 暗角 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%,transparent 0%,transparent 60%,rgba(0,0,0,.06) 70%,rgba(0,0,0,.12) 80%,rgba(0,0,0,.22) 90%,rgba(0,0,0,.35) 100%)` }} />
      {/* 顶部高光 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 20%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.05) 40%,transparent 70%)` }} />
      {/* 边框 + box-shadow 发光 */}
      <div className="absolute inset-0 rounded-full" style={{
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: `0 ${size * .15}px ${size * .5}px rgba(0,0,0,.35),0 ${size * .05}px ${size * .15}px rgba(0,0,0,.25),inset 0 ${size * .02}px ${size * .05}px rgba(255,255,255,.25),inset 0 -${size * .02}px ${size * .05}px rgba(0,0,0,.15),0 0 ${25 * gi}px ${color}${Math.round(40 * gi).toString(16).padStart(2, '0')}`
      }} />
      {/* 颜色光晕 */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle,transparent 70%,${color}18 85%,${color}30 100%)` }} />
      {/* 流光边框 — 保留 */}
      <div className="absolute inset-0 rounded-full overflow-hidden flow-animate pointer-events-none" style={{
        padding: isCenter ? '2px' : '1.5px',
        background: getFlowGradient(focusFlowColors, 0.6),
        WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        animationDuration: `${focusFlowSpeed}s`,
      }} />
    </div>
  );
};

// ──────────────────────────────────────────
const CurvedLabel: React.FC<{
  label: string; size: number; color: string; settings: any; uniqueId: string;
}> = ({ label, size, color, settings, uniqueId }) => {
  const arcRadius = size / 2 + 4;
  const svgSize = size * 3.0;
  const c = svgSize / 2;
  // 增加角度余量，防止 SVG textPath 不足截断长文本（特别是中文和长英文组合）
  const arcAngle = Math.min(340, 60 + label.length * 22);
  const sa = ((270 - arcAngle / 2) * Math.PI) / 180;
  const ea = ((270 + arcAngle / 2) * Math.PI) / 180;
  const pathD = `M ${c + arcRadius * Math.cos(sa)} ${c + arcRadius * Math.sin(sa)} A ${arcRadius} ${arcRadius} 0 ${arcAngle > 180 ? 1 : 0} 1 ${c + arcRadius * Math.cos(ea)} ${c + arcRadius * Math.sin(ea)}`;
  const pid = `ct-${uniqueId}`;
  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}
      style={{ overflow: 'visible', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
      <defs><path id={pid} d={pathD} fill="none" /></defs>
      <text fill="white" textAnchor="middle" style={{ fontSize: `${Math.max(10, size * 0.2)}px`, fontFamily: settings.fontFamily, fontWeight: 600, filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 6px ${color}60)` }}>
        <textPath href={`#${pid}`} startOffset="50%">{label}</textPath>
      </text>
    </svg>
  );
};

// ──────────────────────────────────────────
const FixedHighlight: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const r = size / 2;
  return (
    <>
      <div className="absolute rounded-full pointer-events-none" style={{ width: `${r * .35}px`, height: `${r * .35}px`, top: `${r * .28}px`, left: `${r * .32}px`, background: 'radial-gradient(circle at 40% 40%,rgba(255,255,255,1) 0%,rgba(255,255,255,.5) 30%,rgba(255,255,255,.15) 60%,transparent 80%)', filter: 'blur(.5px)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: `${r * .15}px`, height: `${r * .15}px`, top: `${r * .75}px`, left: `${r * .22}px`, background: 'radial-gradient(circle,rgba(255,255,255,.6) 0%,rgba(255,255,255,.2) 50%,transparent 80%)' }} />
      <div className="absolute pointer-events-none" style={{ width: `${size * .94}px`, height: `${size * .94}px`, top: `${size * .03}px`, left: `${size * .03}px`, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,.22)', borderLeftColor: 'rgba(255,255,255,.12)', transform: 'rotate(-40deg)', filter: 'blur(1px)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: `${r * .7}px`, height: `${r * .2}px`, bottom: `${r * .3}px`, left: '50%', transform: 'translateX(-50%)', background: `radial-gradient(ellipse,${color}20 0%,${color}08 50%,transparent 80%)`, filter: 'blur(2px)' }} />
      <div className="absolute pointer-events-none" style={{ width: `${size * .84}px`, height: `${size * .84}px`, bottom: `${size * .08}px`, right: `${size * .08}px`, borderRadius: '50%', border: '1.5px solid transparent', borderBottomColor: 'rgba(255,255,255,.05)', borderRightColor: 'rgba(255,255,255,.03)', transform: 'rotate(40deg)', filter: 'blur(.8px)' }} />
    </>
  );
};

// ──────────────────────────────────────────
const GlassRod: React.FC<{
  centerSize: number; satelliteSize: number; distance: number; color: string; settings: any; isMobile?: boolean;
}> = ({ centerSize, satelliteSize, distance, color, settings, isMobile = false }) => {
  const { focusFlowSpeed, focusGlowIntensity } = settings;
  const gi = focusGlowIntensity / 100;
  const rodTop = satelliteSize / 2 + 4;
  const rodLen = Math.max(0, distance - centerSize / 2 - 4 - rodTop);
  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${rodTop}px`, height: `${rodLen}px`, width: '4px' }}>
      <div className="absolute rounded-full" style={{ top: '1px', left: '1px', right: '-1px', bottom: '-1px', background: 'rgba(0,0,0,.25)', filter: 'blur(2px)' }} />
      {!isMobile && (
        <div className="absolute inset-0 rounded-full rod-glow" style={{ background: `linear-gradient(180deg,${color}70 0%,${color}40 50%,${color}70 100%)`, filter: 'blur(4px)', opacity: .6 * gi, transform: 'scaleX(3)' }} />
      )}
      <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(90deg,rgba(0,0,0,.15) 0%,rgba(255,255,255,.3) 30%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.3) 70%,rgba(0,0,0,.1) 100%)`, boxShadow: `0 0 8px ${color}80,0 0 16px ${color}40,inset 1px 0 2px rgba(255,255,255,.5)` }} />
      <div className="absolute rounded-full" style={{ top: '5%', bottom: '5%', left: '15%', width: '25%', background: 'linear-gradient(180deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,.7) 50%,rgba(255,255,255,.5) 100%)' }} />
      <div className="absolute inset-0 rounded-full flow-animate overflow-hidden" style={{ background: `linear-gradient(180deg,transparent 0%,${color}80 50%,transparent 100%)`, backgroundSize: '100% 200%', animationDuration: `${focusFlowSpeed * 2}s` }} />
    </div>
  );
};

// ──────────────────────────────────────────
const SatelliteWithRod: React.FC<{
  node: SkillNode; distance: number; size: number; angle: number; centerSize: number;
  settings: any; floatDuration: number; floatDelay: number;
  rotationDuration: number; isReverse: boolean; groupIndex: number; satelliteIndex: number;
  isMobile?: boolean;
}> = ({ node, distance, size, angle, centerSize, settings, floatDuration, floatDelay, rotationDuration, isReverse, groupIndex, satelliteIndex, isMobile = false }) => {
  const uid = `sat-${groupIndex}-${satelliteIndex}`;
  const cs: React.CSSProperties = { top: 0, left: 0, width: `${size}px`, height: `${size}px`, transformOrigin: 'center center', animationDuration: `${rotationDuration}s`, animationDirection: isReverse ? 'reverse' : 'normal' };
  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center center', width: 0, height: 0 }}>
      <div className="absolute satellite-float" style={{ left: '50%', bottom: '50%', width: `${size + 20}px`, height: `${distance}px`, transform: 'translateX(-50%)', animationDuration: `${floatDuration}s`, animationDelay: `${floatDelay}s` }}>
        <GlassRod centerSize={centerSize} satelliteSize={size} distance={distance} color={node.color} settings={settings} isMobile={isMobile} />
        <div className="absolute top-0 left-1/2" style={{ transform: 'translateX(-50%) translateY(-50%)', width: `${size}px`, height: `${size}px` }}>
          <GlassBubble size={size} color={node.color} settings={settings} uniqueId={uid} isMobile={isMobile} />
          <div className="absolute highlight-counter-rotate" style={{ ...cs, ['--highlight-initial-angle' as string]: `${-angle}deg` }}>
            <SafeImage src={node.image} size={size} padding={size * 0.2} />
          </div>
          <div className="absolute highlight-counter-rotate" style={{ ...cs, ['--highlight-initial-angle' as string]: `${-angle}deg` }}>
            <FixedHighlight size={size} color={node.color} />
          </div>
          <div className="absolute text-counter-rotate" style={{ ...cs, ['--initial-angle' as string]: `${-angle}deg` }}>
            <div className={`relative w-full h-full${isMobile ? '' : ' text-wobble'}`} style={isMobile ? {} : { animationDuration: `${floatDuration * 1.5}s`, animationDelay: `${floatDelay}s` }}>
              <CurvedLabel label={node.label} size={size} color={node.color} settings={settings} uniqueId={uid} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
// SkillGroup：sizeScale 由外部传入，位置绝对定位，无 drift 动画
const SkillGroup: React.FC<{
  centerNode: SkillNode; satellites: SkillNode[];
  posX: number; posY: number;           // 0-100 百分比坐标（容器中心点）
  settings: any; groupIndex: number; sizeScale: number; isMobile?: boolean;
}> = ({ centerNode, satellites, posX, posY, settings, groupIndex, sizeScale, isMobile = false }) => {
  const centerSize = Math.round(75 * sizeScale);
  const satBaseSize = Math.round(48 * sizeScale);
  const distBase = Math.round(100 * sizeScale);
  const distVariance = Math.round(25 * sizeScale);

  const layout = useMemo(() => satellites.map((node, i) => ({
    node,
    angle: (i / satellites.length) * 360,
    distance: distBase + seededRandom(groupIndex * 100 + i) * distVariance,
    size: satBaseSize + seededRandom(groupIndex * 100 + i + 50) * Math.round(12 * sizeScale),
  })), [satellites, groupIndex, distBase, distVariance, satBaseSize, sizeScale]);

  const rotDur = 45 + groupIndex * 12;
  const floatDur = 4 + groupIndex * 0.6;
  const isRev = groupIndex % 2 !== 0;
  const cs: React.CSSProperties = { top: 0, left: 0, width: `${centerSize}px`, height: `${centerSize}px`, transformOrigin: 'center center', animationDuration: `${rotDur}s`, animationDirection: isRev ? 'reverse' : 'normal' };

  return (
    /* 用 translate(-50%,-50%) 让锚点在球体视觉中心 */
    <div className="absolute" style={{ left: `${posX}%`, top: `${posY}%`, transform: 'translate(-50%,-50%)' }}>
      <div className="relative skill-group-rotate" style={{ animationDuration: `${rotDur}s`, animationDirection: isRev ? 'reverse' : 'normal' }}>
        {layout.map((sat, i) => (
          <SatelliteWithRod
            key={sat.node.id} node={sat.node} distance={sat.distance} size={sat.size}
            angle={sat.angle} centerSize={centerSize} settings={settings}
            floatDuration={floatDur} floatDelay={i * 0.3}
            rotationDuration={rotDur} isReverse={isRev}
            groupIndex={groupIndex} satelliteIndex={i}
            isMobile={isMobile}
          />
        ))}
        {/* 中心球 */}
        <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%,-50%)', width: `${centerSize}px`, height: `${centerSize}px` }}>
          <div className="center-float relative" style={{ width: `${centerSize}px`, height: `${centerSize}px`, animationDuration: `${floatDur * 1.2}s` }}>
            <GlassBubble size={centerSize} color={centerNode.color} settings={settings} isCenter uniqueId={`center-${groupIndex}`} isMobile={isMobile} />
            <div className="absolute highlight-counter-rotate" style={{ ...cs, ['--highlight-initial-angle' as string]: '0deg' }}>
              <SafeImage src={centerNode.image} size={centerSize} padding={centerSize * 0.18} />
            </div>
            <div className="absolute highlight-counter-rotate" style={{ ...cs, ['--highlight-initial-angle' as string]: '0deg' }}>
              <FixedHighlight size={centerSize} color={centerNode.color} />
            </div>
            <div className="absolute text-counter-rotate" style={{ ...cs, ['--initial-angle' as string]: '0deg' }}>
              <div className={`relative w-full h-full${isMobile ? '' : ' text-wobble'}`} style={isMobile ? {} : { animationDuration: `${floatDur * 1.5}s` }}>
                <CurvedLabel label={centerNode.label} size={centerSize} color={centerNode.color} settings={settings} uniqueId={`center-${groupIndex}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
const SkillsGraph: React.FC = () => {
  const { settings } = useGlassSettings();
  const { isMobile } = useBreakpoint();

  const containerRef = useRef<HTMLDivElement>(null);
  const [cs, setCs] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setCs({ width: el.clientWidth, height: el.clientHeight });
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCs({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const groups = useMemo(() => {
    const nodes = skillsData.nodes as SkillNode[];
    return nodes.filter(n => n.level === 1).map(center => ({
      center,
      satellites: nodes.filter(n => n.level === 2 && n.group === center.group),
    }));
  }, []);

  // ── 布局计算 ─────────────────────────────────────────────────
  // 目标：三组充满80%页面，相邻组不重叠
  //
  // 三组沿主轴等距分布，中心分别在 10%, 50%, 90% 处（跨度=80%）
  // 相邻中心间距 = 主轴长度 × 40%
  // 每组最大轨道半径 < 间距/2 * 0.88（留12%缝隙）
  // 非主轴方向：最大半径 < 对应轴的50% * 0.88
  // REF_RADIUS=177 对应 sizeScale=1 时的轨道外半径
  // sizeScale = min(主轴约束, 副轴约束) / REF_RADIUS

  const { width, height } = cs;
  const isPortrait = height > width * 1.1;

  // ── 尺寸与排布精密计算 ────────────────────────────────────────────
  // 目标：放大三组球体至完美充斥屏幕（不越界、不穿插、不遮挡）
  // REF_RADIUS=177 已包含轨道距离(100)+卫星半径(27)+弧形文字突出(50)
  // 因此 sizeScale = maxAllowedR / REF_RADIUS 即可得到最大缩放
  const GAP_PX = 6;   // 组与组之间的最小安全间距
  const MARGIN_PX = 4; // 距离屏幕边缘的最小安全间距

  let sizeScale: number;
  let g0: { x: number; y: number }, g1: { x: number; y: number }, g2: { x: number; y: number };

  if (isPortrait) {
    // 竖屏排布：沿垂直方向等距分布三组
    // 总高度 = 2*MARGIN_PX + 2*GAP_PX + 6*R  →  R = (height - 2*MARGIN - 2*GAP) / 6
    const maxR_Main = (height - 2 * MARGIN_PX - 2 * GAP_PX) / 6;
    // 水平约束：2*R ≤ width - 2*MARGIN
    const maxR_Cross = (width - 2 * MARGIN_PX) / 2;
    const maxR = Math.min(maxR_Main, maxR_Cross);
    sizeScale = Math.max(0.3, maxR / REF_RADIUS);

    // 反推中心坐标
    const rPx = sizeScale * REF_RADIUS;
    const edgeY = MARGIN_PX + rPx; // 第一组中心距顶边的距离
    g0 = { x: 50, y: (edgeY / height) * 100 };
    g1 = { x: 50, y: 50 };
    g2 = { x: 50, y: 100 - (edgeY / height) * 100 };
  } else {
    // 横屏排布：沿水平方向等距分布三组
    const maxR_Main = (width - 2 * MARGIN_PX - 2 * GAP_PX) / 6;
    const maxR_Cross = (height - 2 * MARGIN_PX) / 2;
    const maxR = Math.min(maxR_Main, maxR_Cross);
    sizeScale = Math.max(0.3, maxR / REF_RADIUS);

    const rPx = sizeScale * REF_RADIUS;
    const edgeX = MARGIN_PX + rPx;
    g0 = { x: (edgeX / width) * 100, y: 50 };
    g1 = { x: 50, y: 50 };
    g2 = { x: 100 - (edgeX / width) * 100, y: 50 };
  }

  // groups[0]=Maya, groups[1]=UE, groups[2]=AI+CG
  // 中间位置放视觉权重更高的 UE（groups[1]）
  return (
    <div ref={containerRef} className="w-full h-full relative overflow-visible">
      <style>{SKILLS_KEYFRAMES}</style>

      {width > 0 && height > 0 && (
        <>
          {/* 侧组 A（左/上） */}
          {groups[0] && (
            <SkillGroup
              key={groups[0].center.id}
              centerNode={groups[0].center}
              satellites={groups[0].satellites}
              posX={g0.x} posY={g0.y}
              settings={settings} groupIndex={1}
              sizeScale={sizeScale}
              isMobile={isMobile}
            />
          )}

          {/* 侧组 B（右/下） */}
          {groups[2] && (
            <SkillGroup
              key={groups[2].center.id}
              centerNode={groups[2].center}
              satellites={groups[2].satellites}
              posX={g2.x} posY={g2.y}
              settings={settings} groupIndex={2}
              sizeScale={sizeScale}
              isMobile={isMobile}
            />
          )}

          {/* 中心组（最后渲染确保在视觉最顶层） */}
          {groups[1] && (
            <SkillGroup
              key={groups[1].center.id}
              centerNode={groups[1].center}
              satellites={groups[1].satellites}
              posX={g1.x} posY={g1.y}
              settings={settings} groupIndex={0}
              sizeScale={sizeScale}
              isMobile={isMobile}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SkillsGraph;
