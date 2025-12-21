import React, { useCallback, useEffect, useState } from 'react';
import { LayoutSettings } from './DebugPanel';

interface DividerProps {
  onDrag: (deltaY: number) => void;
  debugMode?: boolean;
  settings: LayoutSettings;
}

const Divider: React.FC<DividerProps> = ({ onDrag, debugMode = false, settings }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    onDrag(deltaY);
    setStartY(e.clientY);
  }, [isDragging, startY, onDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="w-full h-2 shrink-0 cursor-ns-resize relative group transition-all duration-300 z-20"
      style={{
        background: isDragging
          ? `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, transparent 100%)`
          : 'transparent',
        backdropFilter: isDragging ? `blur(${settings.glassBlur * 0.5}px)` : 'none',
        WebkitBackdropFilter: isDragging ? `blur(${settings.glassBlur * 0.5}px)` : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 液态玻璃分隔线 */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.2) 80%, transparent 100%)`,
          boxShadow: isDragging ? `0 0 6px rgba(255,255,255,0.4)` : 'none',
        }}
      />

      {/* 中心拖动手柄 - 缩小 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-1 rounded-full transition-all duration-300"
        style={{
          background: isDragging ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)',
          boxShadow: isDragging
            ? '0 1px 6px rgba(255,255,255,0.3), inset 0 0.5px 0 rgba(255,255,255,0.4)'
            : '0 1px 3px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1)',
        }}
      />

      {/* 调试模式下显示拖动提示 */}
      {debugMode && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <span className="text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap bg-black/60 backdrop-blur-sm border border-white/20">
            拖动调整
          </span>
        </div>
      )}
    </div>
  );
};

export default Divider;
