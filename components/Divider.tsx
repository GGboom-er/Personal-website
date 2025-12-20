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
      className="w-full h-4 shrink-0 cursor-ns-resize relative group transition-all duration-300 z-20"
      style={{
        background: isDragging
          ? `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 2}) 20%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 2}) 80%, transparent 100%)`
          : 'transparent',
        backdropFilter: isDragging ? `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)` : 'none',
        WebkitBackdropFilter: isDragging ? `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)` : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 液态玻璃分隔线 */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${settings.glassBorderOpacity / 100 * 1.7}) 15%, rgba(255,255,255,${settings.glassBorderOpacity / 100 * 1.7}) 85%, transparent 100%)`,
          boxShadow: isDragging ? `0 0 8px rgba(255,255,255,${settings.glassShadowOpacity / 100 * 2})` : 'none',
        }}
      />

      {/* 中心拖动手柄 - 液态玻璃胶囊 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-1.5 rounded-full transition-all duration-300"
        style={{
          background: isDragging
            ? `rgba(255,255,255,${settings.glassBgOpacity / 100 * 7.5})`
            : `rgba(255,255,255,${settings.glassBgOpacity / 100 * 3})`,
          backdropFilter: `blur(${settings.glassBlur * 0.5}px)`,
          WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px)`,
          boxShadow: isDragging
            ? `0 2px 8px rgba(255,255,255,${settings.glassShadowOpacity / 100 * 2}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100 * 3})`
            : `0 2px 4px rgba(0,0,0,${settings.glassShadowOpacity / 100}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100})`,
        }}
      />

      {/* 调试模式下显示拖动提示 */}
      {debugMode && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <span
            className="text-white text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{
              background: `rgba(15,15,35,${0.65 + settings.glassBgOpacity / 100 * 2})`,
              backdropFilter: `blur(${settings.glassBlur * 0.75}px) saturate(${settings.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${settings.glassBlur * 0.75}px) saturate(${settings.glassSaturate}%)`,
              border: `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100 * 1.3})`,
              boxShadow: `0 4px 16px rgba(0,0,0,${settings.glassShadowOpacity / 100 * 2}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.7})`,
            }}
          >
            拖动调整
          </span>
        </div>
      )}
    </div>
  );
};

export default Divider;
