import React from 'react';
import { Project } from '../types';
import { LayoutSettings } from './DebugPanel';

interface ProjectListProps {
  projects: Project[];
  activeId: string;
  onSelect: (project: Project) => void;
  settings: LayoutSettings;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, activeId, onSelect, settings }) => {
  const cardScale = settings.cardScale;
  // 根据缩放比例计算列数
  const getGridCols = () => {
    if (cardScale <= 60) return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10';
    if (cardScale <= 80) return 'grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9';
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
  };

  // 计算卡片内边距
  const cardPadding = Math.max(4, Math.round(8 * cardScale / 100));

  return (
    <div className="flex-1 w-full px-4 py-3 md:px-6 overflow-y-auto no-scrollbar flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-base font-bold text-white">
          {projects.length > 0 ? projects[0].section === 'Profile' ? 'Experience & Education' : projects[0].section === 'Skills' ? 'Core Competencies' : 'Top Projects' : 'List'}
        </h2>
        <button className="text-accent-blue text-xs font-medium hover:underline opacity-80 hover:opacity-100">See All</button>
      </div>

      <div className={`grid ${getGridCols()} gap-2 pb-4`}>
        {projects.map((project) => {
          const isActive = project.id === activeId;
          return (
            <div
              key={project.id}
              onClick={() => onSelect(project)}
              className="group relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 ease-out active:scale-[0.98]"
              style={{
                padding: cardPadding,
                background: isActive
                  ? `rgba(255,255,255,${settings.glassBgOpacity / 100 * 2})`
                  : `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.75})`,
                backdropFilter: `blur(${settings.glassBlur * 0.75}px) saturate(${settings.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${settings.glassBlur * 0.75}px) saturate(${settings.glassSaturate}%)`,
                border: isActive
                  ? `${settings.glassThickness}px solid transparent`
                  : `${settings.glassThickness * 0.5}px solid transparent`,
                borderImage: `linear-gradient(135deg,
                  rgba(255,180,180,${settings.glassRefraction / 100 * (isActive ? 0.4 : 0.2)}),
                  rgba(180,255,180,${settings.glassRefraction / 100 * (isActive ? 0.3 : 0.15)}),
                  rgba(180,180,255,${settings.glassRefraction / 100 * (isActive ? 0.4 : 0.2)})) 1`,
                boxShadow: isActive
                  ? `0 8px 32px rgba(31, 38, 135, ${settings.glassShadowOpacity / 100 * 1.5}),
                     inset 0 ${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.25}),
                     inset 0 -${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.15})`
                  : `0 4px 16px rgba(0,0,0,${settings.glassShadowOpacity / 100}),
                     inset 0 ${settings.glassThickness * 0.5}px ${settings.glassThickness}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.15}),
                     inset 0 -${settings.glassThickness * 0.5}px ${settings.glassThickness}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.1})`,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                zIndex: isActive ? 10 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = `rgba(255,255,255,${settings.glassBgOpacity / 100 * 1.25})`;
                  e.currentTarget.style.border = `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100 * 1.3})`;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(31, 38, 135, ${settings.glassShadowOpacity / 100 * 1.3}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100}), inset 0 -1px 0 rgba(0,0,0,0.05)`;
                  e.currentTarget.style.transform = 'scale(1.01)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.75})`;
                  e.currentTarget.style.border = `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.7})`;
                  e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,${settings.glassShadowOpacity / 100}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.5})`;
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {/* Card Content - 图片占主要空间 */}
              <div className="flex flex-col h-full items-center text-center relative z-10">
                {/* 图片区域 - 2:3比例 + 液态玻璃效果 + 边缘模糊 */}
                <div className={`relative w-full aspect-[2/3] mb-1.5 rounded-lg overflow-hidden transition-transform duration-300 ${isActive ? 'scale-100' : 'group-hover:scale-[1.01]'}`}>
                  {/* 主图片 */}
                  <img
                    src={project.icon}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  {/* 边缘模糊遮罩层 */}
                  {settings.imageGlassBlur > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backdropFilter: `blur(${settings.imageGlassBlur * 1.5}px)`,
                        WebkitBackdropFilter: `blur(${settings.imageGlassBlur * 1.5}px)`,
                        maskImage: `linear-gradient(to bottom,
                          black 0%, transparent 20%, transparent 80%, black 100%),
                          linear-gradient(to right,
                          black 0%, transparent 20%, transparent 80%, black 100%)`,
                        WebkitMaskImage: `linear-gradient(to bottom,
                          black 0%, transparent 20%, transparent 80%, black 100%),
                          linear-gradient(to right,
                          black 0%, transparent 20%, transparent 80%, black 100%)`,
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in',
                      }}
                    />
                  )}
                  {/* 玻璃厚度边框 - 彩色折射 */}
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      border: `${settings.glassThickness * 0.7}px solid transparent`,
                      borderImage: `linear-gradient(135deg,
                        rgba(255,150,150,${settings.glassRefraction / 100 * 0.4}),
                        rgba(255,255,150,${settings.glassRefraction / 100 * 0.25}),
                        rgba(150,255,150,${settings.glassRefraction / 100 * 0.4}),
                        rgba(150,150,255,${settings.glassRefraction / 100 * 0.25}),
                        rgba(255,150,255,${settings.glassRefraction / 100 * 0.4})) 1`,
                      boxShadow: `
                        inset 0 ${settings.glassThickness * 0.5}px ${settings.glassThickness}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.25}),
                        inset 0 -${settings.glassThickness * 0.5}px ${settings.glassThickness}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.15}),
                        0 0 ${settings.imageGlassBorder / 4}px rgba(255,255,255,${settings.imageGlassBorder / 100 * 0.3}),
                        0 4px 16px rgba(0,0,0,${settings.imageGlassShadow / 100})
                      `,
                    }}
                  />
                  {/* 高光层 */}
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg,
                        rgba(255,255,255,${settings.glassRefraction / 100 * 0.12}) 0%,
                        transparent 50%,
                        rgba(0,0,0,${settings.glassRefraction / 100 * 0.08}) 100%)`,
                    }}
                  />
                  {/* 选中指示器 */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent-blue rounded-full blur-[2px]"></div>
                  )}
                </div>

                {/* 只显示标题 */}
                <div className="w-full min-w-0 px-0.5 py-0.5">
                  <h3 className={`text-[10px] md:text-xs font-medium truncate leading-tight ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {project.title}
                  </h3>
                </div>
              </div>

              {/* Hover overlay - Apple Liquid Glass */}
              {!isActive && (
                <div
                  className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                    backdropFilter: 'blur(1px)',
                    WebkitBackdropFilter: 'blur(1px)',
                  }}
                >
                  <span
                    className="text-white text-[10px] font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 active:scale-[0.95]"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(3px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(3px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
                    }}
                  >
                    点击查看详情
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;
