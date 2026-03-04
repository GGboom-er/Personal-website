import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Project, LayoutSettings } from '../types';
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
  const { isMobile } = useBreakpoint();

  // 移动端轮播状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimerRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(0);
  const isExternalUpdateRef = useRef(false); // 标记是否为外部更新

  // 基于 cardScale 计算基础卡片宽度
  const baseCardWidth = Math.round(72 * settings.cardScale / 100);
  const cardGap = settings.cardGap;

  // 移动端卡片尺寸
  const mobileCardWidth = 108;
  const mobileCardGap = 16;

  // 同步 activeId 到 currentIndex（外部更新）
  useEffect(() => {
    const index = projects.findIndex(p => p.id === activeId);
    if (index !== -1 && index !== currentIndex) {
      isExternalUpdateRef.current = true; // 标记为外部更新
      setCurrentIndex(index);
    }
  }, [activeId, projects]);

  // 桌面端：计算缩放比例
  useEffect(() => {
    if (isMobile) return;

    const updateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth - 48;
      const containerHeight = containerRef.current.clientHeight - 8;
      const totalCardsWidth = projects.length * baseCardWidth + (projects.length - 1) * cardGap;
      const cardHeight = baseCardWidth * 1.5;

      const widthScale = containerWidth / totalCardsWidth;
      const heightScale = containerHeight / cardHeight;

      const optimalScale = Math.min(widthScale, heightScale, 2);
      setScale(Math.max(0.5, optimalScale * 0.95));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [projects.length, settings.cardScale, settings.cardGap, isMobile, baseCardWidth, cardGap]);

  // 移动端：自动轮播
  useEffect(() => {
    if (!isMobile) return;

    const autoScrollInterval = 4000; // 每4秒切换一次
    const pauseAfterInteraction = 5000; // 用户交互后暂停5秒

    const tick = () => {
      const now = Date.now();
      const timeSinceInteraction = now - lastInteractionRef.current;

      // 用户交互后暂停
      if (timeSinceInteraction < pauseAfterInteraction) {
        autoScrollTimerRef.current = window.setTimeout(tick, 500);
        return;
      }

      // 自动切换到下一张
      setCurrentIndex(prev => {
        const next = prev + 1;
        return next >= projects.length ? 0 : next;
      });

      autoScrollTimerRef.current = window.setTimeout(tick, autoScrollInterval);
    };

    // 延迟启动
    autoScrollTimerRef.current = window.setTimeout(tick, 2000);

    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [isMobile, projects.length]);

  // 同步 currentIndex 到父组件（仅内部更新时触发）
  useEffect(() => {
    // 如果是外部更新（如切换视图），跳过同步以避免循环
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      return;
    }

    if (isMobile && projects[currentIndex]) {
      const project = projects[currentIndex];
      if (project.id !== activeId) {
        onSelect(project);
      }
    }
  }, [currentIndex, isMobile]);

  // 用户交互
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  // 点击卡片
  const handleCardClick = useCallback((project: Project, index: number) => {
    handleInteraction();
    setCurrentIndex(index);
    onSelect(project);
  }, [onSelect, handleInteraction]);

  // 触摸滑动支持
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Reset to prevent stale data usage
    handleInteraction();
  }, [handleInteraction]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < projects.length - 1) {
        // 向左滑 -> 下一张
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // 向右滑 -> 上一张
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [currentIndex, projects.length]);

  // 移动端轮播布局
  if (isMobile) {
    // 计算每张卡片的位置
    const getCardStyle = (index: number): React.CSSProperties => {
      const offset = index - currentIndex;
      const cardFullWidth = mobileCardWidth + mobileCardGap;

      // 中心卡片在 translateX(0)，其他卡片偏移
      const translateX = offset * cardFullWidth;

      // 非当前卡片稍微缩小和透明
      const isActive = index === currentIndex;
      const cardScale = isActive ? 1 : 0.85;
      const opacity = isActive ? 1 : 0.6;

      return {
        position: 'absolute',
        left: '50%',
        transform: `translateX(calc(-50% + ${translateX}px)) scale(${cardScale})`,
        opacity,
        transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        zIndex: isActive ? 10 : 5 - Math.abs(offset),
        width: mobileCardWidth,
      };
    };

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 卡片容器 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {projects.map((project, index) => (
            <div
              key={project.id}
              style={getCardStyle(index)}
            >
              <GlassCard
                image={getAssetPath(project.icon)}
                isActive={project.id === activeId}
                onClick={() => handleCardClick(project, index)}
                settings={settings}
              />
            </div>
          ))}
        </div>

        {/* 滚动指示器 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => handleCardClick(project, index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/40 hover:bg-white/60 w-1.5'
                }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // 桌面端布局 - 保持原有缩放逻辑
  return (
    <div
      ref={containerRef}
      className="w-full h-full px-4 py-1 md:px-6 flex items-center justify-center overflow-hidden"
    >
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
