import React, { useRef, useEffect, useState } from 'react';
import { Project } from '../types';
import { LayoutSettings } from './DebugPanel';
import { GlassCard } from './glass';
import { getAssetPath } from '../utils/assetPath';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface ProjectListProps {
  projects: Project[];
  activeId: string;
  onSelect: (project: Project) => void;
  settings: LayoutSettings;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, activeId, onSelect, settings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { isMobile, width } = useBreakpoint();

  // 基于 cardScale 计算基础卡片宽度
  const baseCardWidth = Math.round(80 * settings.cardScale / 100);
  const cardGap = settings.cardGap;

  // 移动端更小的水平 padding
  const horizontalPadding = isMobile ? 16 : 48;

  // 计算缩放比例 - 既可以缩小也可以放大以填充空间
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth - horizontalPadding;
      const containerHeight = containerRef.current.clientHeight - 8; // 减去上下 padding
      const totalCardsWidth = projects.length * baseCardWidth + (projects.length - 1) * cardGap;
      const cardHeight = baseCardWidth * 1.5; // 2:3 比例

      // 计算宽度和高度的缩放比例
      const widthScale = containerWidth / totalCardsWidth;
      const heightScale = containerHeight / cardHeight;

      // 取较小值确保不超出容器，但允许放大（最大2倍）
      const optimalScale = Math.min(widthScale, heightScale, 2);
      // 移动端允许更小的缩放以适应屏幕
      const minScale = isMobile ? 0.3 : 0.5;
      setScale(Math.max(minScale, optimalScale * 0.95)); // 留5%边距
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [projects.length, baseCardWidth, cardGap, horizontalPadding, isMobile]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full py-1 flex items-center justify-center overflow-hidden"
      style={{ paddingLeft: horizontalPadding / 2, paddingRight: horizontalPadding / 2 }}
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
              image={getAssetPath(project.icon)}
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
