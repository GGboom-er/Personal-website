import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Showcase from './components/Showcase';
import ProjectList from './components/ProjectList';
import Timeline from './components/Timeline';
import SkillsGraph from './components/skills/SkillsGraph';
import BottomTabBar from './components/layout/BottomTabBar';
import { useBreakpoint } from './hooks/useBreakpoint';
import { GlassSettingsProvider, useGlassSettings } from './contexts/GlassSettingsContext';
import { DragEditorProvider } from './contexts/DragEditorContext';
import { PROJECTS } from './constants';
import { Project } from './types';
import { getAssetPath } from './utils/assetPath';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('Projects');
  const { settings } = useGlassSettings();
  const { isMobile } = useBreakpoint();

  // 预加载所有项目图片
  useEffect(() => {
    const preloadImages = () => {
      // 优先预加载当前视图的背景
      const activeBg = activeView === 'Skills' ? 'images/bg3.webp' : activeView === 'Profile' ? 'images/bg2.webp' : 'images/bg.webp';
      new Image().src = getAssetPath(activeBg);

      // 延迟加载其他资源，避免阻塞首屏渲染
      setTimeout(() => {
        // 预加载其他背景
        ['images/bg.webp', 'images/bg2.webp', 'images/bg3.webp']
          .filter(src => src !== activeBg)
          .forEach(src => {
            const img = new Image();
            img.src = getAssetPath(src);
          });

        // 预加载项目图片
        PROJECTS.forEach(project => {
          if (project.icon) {
            const img1 = new Image();
            img1.src = getAssetPath(project.icon);
          }
          // 进一步延迟 Hero Images (通常较大)
          if (project.heroImage) {
            setTimeout(() => {
              const img2 = new Image();
              img2.src = getAssetPath(project.heroImage);
            }, 1000);
          }
        });
      }, 2000); // 首屏渲染2秒后再开始预加载
    };
    preloadImages();
  }, [activeView]); // 当视图切换时也会触发检查（已有缓存则不请求）

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
      className="flex h-screen min-h-[500px] text-white font-sans overflow-hidden relative"
      style={{ background: '#0a0a0c' }}
    >
      {/* 全局背景层 - 与整体布局融合 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* 基础背景图 - 根据视图切换 */}
        <img
          src={getAssetPath(activeView === 'Skills' ? 'images/bg3.webp' : activeView === 'Profile' ? 'images/bg2.webp' : 'images/bg.webp')}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: 0.8 }}
        />

        {/* 氛围背景层 - 当前项目图片高度模糊叠加 */}
        {heroImage && (
          <img
            key={`global-bg-${activeProject?.id}`}
            src={getAssetPath(heroImage)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out"
            style={{
              transform: 'scale(1.2)',
              filter: `blur(${40 + settings.imageEdgeBlur}px) saturate(120%)`,
              opacity: 0.35,
              mixBlendMode: 'soft-light',
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

      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} settings={settings} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">

        {/* Mobile Top Tab Bar */}
        {isMobile && (
          <BottomTabBar
            activeView={activeView}
            onSelectView={setActiveView}
            settings={settings}
          />
        )}

        {/* Profile View: Timeline */}
        {activeView === 'Profile' ? (
          <div className="w-full h-full overflow-hidden">
            <Timeline settings={settings} />
          </div>
        ) : activeView === 'Skills' ? (
          /* Skills View: 3D Topology Graph */
          <div className="w-full h-full overflow-visible relative z-10">
            <SkillsGraph />
          </div>
        ) : (
          <>
            {/* Top Section: Showcase */}
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
              className="overflow-hidden flex flex-col flex-1 relative z-10"
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
          </>
        )}

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
