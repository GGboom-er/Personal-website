import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Showcase from './components/Showcase';
import ProjectList from './components/ProjectList';
import BottomTabBar from './components/layout/BottomTabBar';

// 代码分割：Timeline(~800行) 和 SkillsGraph(~600行) 首屏不需要，拆为独立 chunk
const Timeline = React.lazy(() => import('./components/Timeline'));
const SkillsGraph = React.lazy(() => import('./components/skills/SkillsGraph'));
import { useBreakpoint } from './hooks/useBreakpoint';
import { GlassSettingsProvider, useGlassSettings } from './contexts/GlassSettingsContext';
import { DragEditorProvider } from './contexts/DragEditorContext';
import { PROJECTS } from './constants';
import { Project } from './types';
import { getAssetPath } from './utils/assetPath';
import { preloadAllImages } from './utils/preloadImages';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('Projects');
  const { settings } = useGlassSettings();
  const { isMobile } = useBreakpoint();

  // 首帧完成标记：延迟渲染重型效果（hero blur、非活跃背景）到首帧之后
  const [firstPaintDone, setFirstPaintDone] = useState(false);
  useEffect(() => {
    // 双 rAF 确保浏览器已完成首次绘制
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFirstPaintDone(true);
      });
    });
  }, []);

  // 延迟挂载：仅在首次访问时挂载视图，之后常驻 DOM
  const [mountedViews, setMountedViews] = useState(() => new Set(['Projects']));
  useEffect(() => {
    setMountedViews(prev => {
      if (prev.has(activeView)) return prev;
      const next = new Set(prev);
      next.add(activeView);
      return next;
    });
  }, [activeView]);

  // 首屏后预加载所有图片资源
  useEffect(() => {
    preloadAllImages(activeView);
  }, [activeView]);

  // 移除 HTML 初始占位 — 延迟到首帧绘制后，避免白闪
  useEffect(() => {
    if (!firstPaintDone) return;
    const splash = document.getElementById('initial-splash');
    if (splash) {
      splash.style.transition = 'opacity 0.3s';
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 300);
    }
  }, [firstPaintDone]);

  // Filter projects based on the active sidebar view
  const currentProjects = useMemo(() => {
    return PROJECTS.filter(p => p.section === activeView);
  }, [activeView]);

  const [activeProject, setActiveProject] = useState<Project>(currentProjects[0] || PROJECTS[0]);

  // Automatically select the first project when the view changes
  useEffect(() => {
    if (currentProjects.length > 0) {
      setActiveProject(currentProjects[0]);
    }
  }, [activeView, currentProjects]);

  const heroImage = activeProject?.heroImage;

  return (
    <div
      className="flex min-h-[500px] text-white font-sans overflow-hidden relative"
      style={{ height: '100%', background: '#0a0a0c' }}
    >
      {/* 全局背景层 - 与整体布局融合 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* 首屏背景 — LCP 关键路径，立即渲染 */}
        <img
          src={getAssetPath('images/bg.webp')}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: activeView === 'Projects' ? 0.8 : 0, willChange: 'opacity' }}
        />
        {/* 非首屏背景 — 延迟到首帧后渲染，避免解码阻塞 LCP */}
        {firstPaintDone && ([
          { src: 'images/bg2.webp', view: 'Profile' },
          { src: 'images/bg3.webp', view: 'Skills' },
        ] as const).map(({ src, view }) => (
          <img
            key={src}
            src={getAssetPath(src)}
            alt=""
            decoding="async"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: activeView === view ? 0.8 : 0, willChange: 'opacity' }}
          />
        ))}

        {/* 氛围背景层 — 延迟到首帧后，filter:blur(40px) 极重 */}
        {firstPaintDone && heroImage && (
          <img
            key={`global-bg-${activeProject?.id}`}
            src={getAssetPath(heroImage)}
            alt=""
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out"
            style={{
              transform: isMobile ? 'none' : 'scale(1.2)',
              filter: `blur(${isMobile ? 20 : 40 + settings.imageEdgeBlur}px) saturate(120%)`,
              opacity: 0.35,
              mixBlendMode: 'soft-light',
              contain: 'strict',
              willChange: 'transform',
            }}
          />
        )}

        {/* 渐变叠加 - 统一视觉 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 150% 100% at 50% 0%, transparent 0%, rgba(10,10,12,0.5) 50%, rgba(10,10,12,0.85) 100%),
              linear-gradient(to bottom, transparent 0%, rgba(10,10,12,0.2) 30%, rgba(10,10,12,0.5) 70%, rgba(10,10,12,0.8) 100%)
            `,
          }}
        />

        {/* 噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 桌面端：Sidebar 作为 flex-row 的左侧栏 */}
      {!isMobile && (
        <Sidebar activeView={activeView} onSelectView={setActiveView} settings={settings} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">

        {/* 移动端：BottomTabBar 在 main 内部顶部，保持原有列布局 */}
        {isMobile && (
          <BottomTabBar activeView={activeView} onSelectView={setActiveView} settings={settings} />
        )}

        {/* 视图容器 - 延迟挂载 + display 切换 */}
        <div className="flex-1 min-h-0 relative">
          {/* Profile View: Timeline */}
          {mountedViews.has('Profile') && (
            <div
              className="absolute inset-0 overflow-auto no-scrollbar"
              style={{ display: activeView === 'Profile' ? undefined : 'none', contain: 'strict' }}
            >
              <Suspense fallback={null}>
                <Timeline settings={settings} />
              </Suspense>
            </div>
          )}

          {/* Skills View: 3D Topology Graph */}
          {mountedViews.has('Skills') && (
            <div
              className={`absolute inset-0 ${isMobile ? 'overflow-hidden' : 'overflow-visible'}`}
              style={{ display: activeView === 'Skills' ? undefined : 'none', contain: 'layout style' }}
            >
              <Suspense fallback={null}>
                <SkillsGraph />
              </Suspense>
            </div>
          )}

          {/* Projects View: Showcase + ProjectList */}
          <div
            className="absolute inset-0 flex flex-col"
            style={{ display: activeView !== 'Profile' && activeView !== 'Skills' ? undefined : 'none' }}
          >
            <div
              className="w-full relative overflow-hidden shrink-0"
              style={{ height: `${settings.showcaseHeight}%` }}
            >
              {activeProject ? (
                <Showcase project={activeProject} settings={settings} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Content</div>
              )}
            </div>

            {/* 间隔区域 - 分隔详情与卡片 */}
            <div className="h-3 shrink-0" />

            {/* Bottom Section: Project List - Apple Liquid Glass */}
            <div
              className="overflow-hidden flex flex-col flex-1 min-h-[100px] relative z-10"
              style={{
                background: `linear-gradient(to bottom, rgba(255,255,255,${settings.glassBgOpacity / 100}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.4}) 100%)`,
                backdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
                borderTop: `1px solid rgba(255,255,255,0.15)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 -8px 32px rgba(0,0,0,0.3)`,
              }}
            >
              <ProjectList
                projects={currentProjects}
                activeId={activeProject?.id}
                onSelect={setActiveProject}
                settings={settings}
              />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

// 根组件 - 提供 Context
const App: React.FC = () => {
  return (
    <GlassSettingsProvider>
      <DragEditorProvider>
        <AppContent />
      </DragEditorProvider>
    </GlassSettingsProvider>
  );
};

export default App;
