import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { LayoutSettings } from '../types';

// 默认设置
export const DEFAULT_SETTINGS: LayoutSettings = {
  // === 布局 ===
  showcaseHeight: 65,
  contentOffset: 0,
  cardScale: 200,
  cardImageScale: 114,
  cardPadding: 10,
  cardGap: 23,
  cardBorderRadius: 15,
  iconScale: 166,

  // === 卡片发光 ===
  cardGlowIntensity: 84,
  cardGlowThickness: 3,
  cardGlowSpread: 12,
  cardGlowColor1: '#ff96c8',
  cardGlowColor2: '#96c8ff',
  cardGlowColor3: '#c8ffc8',

  // === 字体 ===
  titleSize: 24,
  descSize: 11,
  descLines: 4,
  fontFamily: '"LXGW WenKai", sans-serif',
  titleColor: '#d7e3fe',
  descColor: '#ffffe5',
  textShadow: 100,
  textHighlight: 100,

  // === 悬停效果 ===
  hoverBlur: 2,
  hoverScale: 108,
  hoverOpacity: 81,

  // === 玻璃基础 ===
  glassBlur: 0,
  glassSaturate: 100,
  glassBgOpacity: 0,

  // === 聚焦发光 ===
  focusGlowIntensity: 31,
  focusGlowThickness: 2,
  focusGlowSpread: 40,
  focusFlowSpeed: 1.5,
  focusFlowColors: 6,

  // === 图片边框 ===
  borderThickness: 2.5,
  borderGlow: 64,
  borderRefraction: 47,
  imageShadow: 140,
  imageEdgeBlur: 30,

  // === 扭曲效果 ===
  distortionIntensity: 40,
  distortionScale: 24,

  // === 时间轴光效 ===
  // 光锥形状
  timelineLightOriginY: 14,       // 光源起点Y偏移
  timelineLightSpread: 37,        // 光锥扩散角度
  // 光锥模糊
  timelineLightBlurX: 48,         // 左右边缘模糊
  timelineLightBlurY: 42,         // 沿光线方向模糊
  timelineLightSoftness: 200,     // 整体柔和度
  // 光锥强度
  timelineLightOpacity: 31,       // 整体透明度
  timelineLightFalloff: 58,       // 衰减曲线
  timelineLightImpact: 119,       // 对时间轴影响
  // 卡片发光
  timelineCardGlow: 20,           // 卡片自发光强度
  // 流动光丝
  timelineSilkSpeed: 6.2,         // 流动速度
  timelineSilkOpacity: 46,        // 透明度
  timelineSilkTurbulence: 200,    // 扰乱度
  timelineSilkStartSpread: 92,    // 起点扩散（卡片端）
  timelineSilkEndSpread: 119,     // 终点扩散（时间轴端）
  timelineSilkDistortion: 82,     // 丝线扭曲强度
  // 颜色
  timelineColor1: '#f3e5ff',      // 淡紫色
  timelineColor2: '#f9d2e6',      // 淡粉色
  timelineColor3: '#9aebf9',      // 淡青色

  // === 移动端时间轴 ===
  // 卡片布局
  mobileCardOffsetX: 0,           // 卡片水平位移
  mobileCardWidth: 175,           // 卡片宽度
  mobileCardSpread: 100,          // 卡片聚拢/扩散 (100=贴边)
  // 管道
  mobilePipeWidth: 20,            // 管道宽度
  // 光锥 - 使用桌面端参数
  mobileLightConeOpacity: 31,     // 光锥透明度
  mobileLightConeStartWidth: 37,  // 光锥起始宽度-卡片端 (对应 lightSpread)
  mobileLightConeEndWidth: 100,   // 光锥结束宽度-管道端
  mobileLightConeBlur: 100,       // 光锥模糊比例
  // 粒子
  mobileParticleScale: 300,       // 粒子大小倍数 (3倍)
  mobileParticleOpacity: 46,      // 粒子透明度 (对应 silkOpacity)
  mobileParticleSpeed: 100,       // 粒子速度

  // === 链接卡片 ===
  timelineLinkCardOffset: 40,     // 链接卡片距离主卡片的偏移
  mobileLinkCardOffset: 30,       // 移动端链接卡片距离

  // === Mobile 独立视觉参数 (默认值) ===
  mobileLightFalloff: 58,
  mobileLightImpact: 119,
  mobileLightSoftness: 200,
  mobileSilkSpeed: 6.2,
  mobileSilkOpacity: 46,
  mobileSilkTurbulence: 200,
  mobileSilkStartSpread: 92,
  mobileSilkEndSpread: 119,
  mobileSilkDistortion: 82,

  // === 光锥位置调整 (Desktop) ===
  lightConeOriginX: 0,            // 光锥起点X偏移
  lightConeOriginY: 0,            // 光锥起点Y偏移
  lightConeEndX: 0,               // 光锥终点X偏移
  lightConeEndY: 0,               // 光锥终点Y偏移
  lightConeRotation: 0,           // 光锥旋转角度
  lightConeWidthStart: 100,       // 光锥起点宽度系数
  lightConeWidthEnd: 100,         // 光锥终点宽度系数

  // === Mobile 独立坐标默认值 ===
  mobileLightConeOriginX: 0,
  mobileLightConeOriginY: 0,
  mobileLightConeEndX: 0,
  mobileLightConeEndY: 0,
  mobileLightConeRotation: 0,
  mobileLightConeWidthStart: 500,
  mobileLightConeWidthEnd: 500,
};

interface GlassSettingsContextValue {
  settings: LayoutSettings;
  nodeOverrides: Record<string, Partial<LayoutSettings>>;
  setSettings: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  updateSetting: <K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => void;
  updateNodeSetting: <K extends keyof LayoutSettings>(nodeId: string, key: K, value: LayoutSettings[K]) => void;
  getNodeSettings: (nodeId: string) => LayoutSettings;
  resetSettings: () => void;
}

const GlassSettingsContext = createContext<GlassSettingsContextValue | null>(null);

interface GlassSettingsProviderProps {
  children: ReactNode;
  initialSettings?: Partial<LayoutSettings>;
}

export const GlassSettingsProvider: React.FC<GlassSettingsProviderProps> = ({
  children,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<LayoutSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const [nodeOverrides, setNodeOverrides] = useState<Record<string, Partial<LayoutSettings>>>({});

  const updateSetting = useCallback(<K extends keyof LayoutSettings>(
    key: K,
    value: LayoutSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateNodeSetting = useCallback(<K extends keyof LayoutSettings>(
    nodeId: string,
    key: K,
    value: LayoutSettings[K]
  ) => {
    setNodeOverrides(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        [key]: value
      }
    }));
  }, []);

  const getNodeSettings = useCallback((nodeId: string) => {
    return { ...settings, ...(nodeOverrides[nodeId] || {}) };
  }, [settings, nodeOverrides]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setNodeOverrides({});
  }, []);

  // 强制全局暴露接口，以便在控制台直接提取
  useEffect(() => {
    (window as any).__GET_CONFIG__ = () => ({
      settings,
      nodeOverrides
    });
  }, [settings, nodeOverrides]);

  const value = useMemo(() => ({
    settings,
    nodeOverrides,
    setSettings,
    updateSetting,
    updateNodeSetting,
    getNodeSettings,
    resetSettings,
  }), [settings, nodeOverrides, updateSetting, updateNodeSetting, getNodeSettings, resetSettings]);

  return (
    <GlassSettingsContext.Provider value={value}>
      {children}
    </GlassSettingsContext.Provider>
  );
};

export const useGlassSettings = (): GlassSettingsContextValue => {
  const context = useContext(GlassSettingsContext);
  if (!context) {
    throw new Error('useGlassSettings must be used within a GlassSettingsProvider');
  }
  return context;
};

// 导出 Context 以便直接使用
export { GlassSettingsContext };
