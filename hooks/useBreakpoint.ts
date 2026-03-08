import { useState, useEffect, useCallback, useRef } from 'react';

// 断点配置
const BREAKPOINTS = {
  xs: 0,      // 手机竖屏
  sm: 480,    // 手机横屏
  md: 768,    // 平板
  lg: 1024,   // 小桌面
  xl: 1280,   // 桌面
  '2xl': 1920 // 超宽屏
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

interface BreakpointState {
  breakpoint: BreakpointKey;
  width: number;
  height: number;
  isMobile: boolean;      // xs, sm
  isTablet: boolean;      // md
  isDesktop: boolean;     // lg, xl, 2xl
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
}

const getBreakpoint = (width: number): BreakpointKey => {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

export const useBreakpoint = (): BreakpointState => {
  const [state, setState] = useState<BreakpointState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    const breakpoint = getBreakpoint(width);

    return {
      breakpoint,
      width,
      height,
      isMobile: breakpoint === 'xs' || breakpoint === 'sm',
      isTablet: breakpoint === 'md',
      isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
      isXs: breakpoint === 'xs',
      isSm: breakpoint === 'sm',
      isMd: breakpoint === 'md',
      isLg: breakpoint === 'lg',
      isXl: breakpoint === 'xl',
      is2xl: breakpoint === '2xl',
    };
  });

  const rafRef = useRef(0);

  const handleResize = useCallback(() => {
    if (rafRef.current) return; // 已有待执行帧，跳过
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);

      setState({
        breakpoint,
        width,
        height,
        isMobile: breakpoint === 'xs' || breakpoint === 'sm',
        isTablet: breakpoint === 'md',
        isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
        isXs: breakpoint === 'xs',
        isSm: breakpoint === 'sm',
        isMd: breakpoint === 'md',
        isLg: breakpoint === 'lg',
        isXl: breakpoint === 'xl',
        is2xl: breakpoint === '2xl',
      });
    });
  }, []);

  useEffect(() => {
    // 初始化时更新一次
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleResize]);

  return state;
};

