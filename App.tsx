import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Showcase from './components/Showcase';
import ProjectList from './components/ProjectList';
import Divider from './components/Divider';
import DebugPanel from './components/DebugPanel';
import BottomTabBar from './components/layout/BottomTabBar';
import { useBreakpoint } from './hooks/useBreakpoint';
import { GlassSettingsProvider, useGlassSettings } from './contexts/GlassSettingsContext';
import { PROJECTS } from './constants';
import { Project } from './types';
import { getAssetPath } from './utils/assetPath';

// 内部应用组件 - 使用 Context
const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('Projects');
  const [debugVisible, setDebugVisible] = useState(false);
  const { settings, setSettings } = useGlassSettings();
  const { isMobile, isTablet } = useBreakpoint();

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

  // 键盘快捷键: Ctrl+Shift+D 切换调试面板
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugVisible(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 处理分隔线拖动 - 调整详情区和卡片区高度比例
  const handleDividerDrag = useCallback((deltaY: number) => {
    setSettings(prev => {
      // 将像素差转换为百分比 (基于视口高度)
      const deltaPercent = (deltaY / window.innerHeight) * 100;
      const newHeight = Math.min(75, Math.max(40, prev.showcaseHeight + deltaPercent));
      return { ...prev, showcaseHeight: newHeight };
    });
  }, []);

  // 当前项目的背景图
  const heroImage = activeProject?.heroImage;

  return (
    <div
      className="flex h-screen min-h-[500px] text-white font-sans overflow-hidden relative"
      style={{ background: '#0a0a0c' }}
    >
      {/* 全局背景层 - 与整体布局融合 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* 基础背景图 bg.png */}
        <img
          src={getAssetPath('images/bg.png')}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
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

        {/* Divider - 可拖动分隔线 */}
        <Divider onDrag={handleDividerDrag} debugMode={debugVisible} settings={settings} />

        {/* Bottom Section: Project List - Apple Liquid Glass */}
        <div
          className="overflow-hidden flex flex-col flex-1 relative z-10"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,${settings.glassBgOpacity / 100}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.4}) 100%)`,
            backdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
            borderTop: `1px solid rgba(255,255,255,0.15)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 -8px 32px rgba(0,0,0,0.3)`,
            paddingBottom: isMobile ? '4rem' : 0,
          }}
        >
          <ProjectList
            projects={currentProjects}
            activeId={activeProject?.id}
            onSelect={setActiveProject}
            settings={settings}
          />
        </div>

      </main>

      {/* Debug Panel */}
      <DebugPanel
        settings={settings}
        onChange={setSettings}
        visible={debugVisible}
        onToggle={() => setDebugVisible(v => !v)}
      />

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <BottomTabBar
          activeView={activeView}
          onSelectView={setActiveView}
          settings={settings}
        />
      )}
    </div>
  );
};

// 根组件 - 提供 Context
const App: React.FC = () => {
  return (
    <GlassSettingsProvider>
      <AppContent />
    </GlassSettingsProvider>
  );
};

export default App;
