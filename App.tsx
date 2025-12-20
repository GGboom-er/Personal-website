import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Showcase from './components/Showcase';
import ProjectList from './components/ProjectList';
import Divider from './components/Divider';
import DebugPanel, { LayoutSettings } from './components/DebugPanel';
import { PROJECTS } from './constants';
import { Project } from './types';

// 默认布局设置
const DEFAULT_SETTINGS: LayoutSettings = {
  // 布局参数
  showcaseHeight: 49.68,   // 详情区高度 (可拖动分隔线调整)
  cardScale: 80,           // 卡片缩放
  contentOffset: 8,        // 内容上移
  titleSize: 28,           // 标题字号
  descSize: 12,            // 描述字号
  descLines: 4,            // 描述行数
  iconScale: 130,          // 图标缩放
  // 液态玻璃参数
  glassBlur: 0,            // 模糊程度 (px)
  glassSaturate: 100,      // 饱和度 (%)
  glassBgOpacity: 0,       // 背景透明度 (%)
  glassBorderOpacity: 15,  // 边框透明度 (%)
  glassShadowOpacity: 50,  // 阴影透明度 (%)
  // 图片液态效果
  imageGlassBlur: 0,       // 图片边缘模糊 (px)
  imageGlassBorder: 40,    // 图片边框发光 (%)
  imageGlassShadow: 80,    // 图片阴影 (%)
  // 玻璃厚度感
  glassThickness: 2,       // 玻璃边缘厚度 (px)
  glassRefraction: 30,     // 折射色彩强度 (%)
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Projects');
  const [debugVisible, setDebugVisible] = useState(false);
  const [settings, setSettings] = useState<LayoutSettings>(DEFAULT_SETTINGS);

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

  return (
    <div
      className="flex h-screen min-h-[500px] text-white font-sans overflow-hidden relative"
      style={{
        backgroundImage: 'url(/images/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} settings={settings} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Top Section: Showcase */}
        <div
          className="w-full relative bg-black overflow-hidden shrink-0"
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
            borderTop: `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100})`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.7}), 0 -8px 32px rgba(0,0,0,${settings.glassShadowOpacity / 100})`,
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
    </div>
  );
};

export default App;
