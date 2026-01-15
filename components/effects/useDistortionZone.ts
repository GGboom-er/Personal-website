import { useEffect, useRef } from 'react';
import { useGlassSettings } from '../../contexts/GlassSettingsContext';

export const useDistortionZone = (id: string, enabled: boolean = true) => {
  const ref = useRef<HTMLDivElement>(null);
  const { registerZone, unregisterZone } = useGlassSettings();

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    
    // 初始注册
    const updateRect = () => {
      const rect = element.getBoundingClientRect();
      registerZone(id, rect);
    };
    
    updateRect();

    // 监听 Resize 和 Scroll (虽然全屏应用很少 scroll，但窗口 resize 很重要)
    const resizeObserver = new ResizeObserver(() => {
        updateRect();
    });
    
    resizeObserver.observe(element);
    window.addEventListener('resize', updateRect);
    // 某些动画可能导致位置变化，简单起见每秒轮询一次位置确认
    const interval = setInterval(updateRect, 1000);

    return () => {
      unregisterZone(id);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateRect);
      clearInterval(interval);
    };
  }, [id, enabled, registerZone, unregisterZone]);

  return ref;
};
