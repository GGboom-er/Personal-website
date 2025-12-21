import React, { useRef, useEffect, useState } from 'react';
import { Project } from '../types';
import { LayoutSettings } from './DebugPanel';
import { GlassCard } from './glass';

interface ProjectListProps {
  projects: Project[];
  activeId: string;
  onSelect: (project: Project) => void;
  settings: LayoutSettings;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, activeId, onSelect, settings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 基于 cardScale 计算基础卡片宽度
  const baseCardWidth = Math.round(80 * settings.cardScale / 100);
  const cardGap = settings.cardGap;

  // 计算缩放比例 - 既可以缩小也可以放大以填充空间
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth - 48; // 减去 padding
      const containerHeight = containerRef.current.clientHeight - 8; // 减去上下 padding
      const totalCardsWidth = projects.length * baseCardWidth + (projects.length - 1) * cardGap;
      const cardHeight = baseCardWidth * 1.5; // 2:3 比例

      // 计算宽度和高度的缩放比例
      const widthScale = containerWidth / totalCardsWidth;
      const heightScale = containerHeight / cardHeight;

      // 取较小值确保不超出容器，但允许放大（最大2倍）
      const optimalScale = Math.min(widthScale, heightScale, 2);
      setScale(Math.max(0.5, optimalScale * 0.95)); // 留5%边距
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [projects.length, baseCardWidth, cardGap, settings.cardGap]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full px-4 py-1 md:px-6 flex items-center justify-center overflow-hidden"
    >
      {/* 显示全部卡片，不换行，缩放适配 */}
      <div
        className="flex justify-center items-center"
        style={{
          gap: `${cardGap * scale}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            style={{ width: baseCardWidth, flexShrink: 0 }}
          >
            <GlassCard
              image={project.icon}
              isActive={project.id === activeId}
              onClick={() => onSelect(project)}
              settings={settings}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
