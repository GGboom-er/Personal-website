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

  // === 时间轴光效 (Restored) ===
  timelineLightOriginY: 14,
  timelineLightSpread: 37,
  timelineLightBlurX: 48,
  timelineLightBlurY: 42,
  timelineLightSoftness: 200,
  timelineLightOpacity: 31,
  timelineLightFalloff: 58,
  timelineLightImpact: 119,
  timelineCardGlow: 20,
  timelineSilkSpeed: 6.2,
  timelineSilkOpacity: 46,
  timelineSilkTurbulence: 200,
  timelineSilkStartSpread: 92,
  timelineSilkEndSpread: 119,
  timelineSilkDistortion: 82,
  timelineColor1: '#f3e5ff',
  timelineColor2: '#f9d2e6',
  timelineColor3: '#9aebf9',

  // === 移动端时间轴 ===
  mobileCardOffsetX: 0,
  mobileCardWidth: 175,
  mobileCardSpread: 100,
  mobilePipeWidth: 20,
  mobileLightConeOpacity: 31,
  mobileLightConeStartWidth: 37,
  mobileLightConeEndWidth: 100,
  mobileLightConeBlur: 100,
  mobileParticleScale: 300,
  mobileParticleOpacity: 46,
  mobileParticleSpeed: 100,
  timelineLinkCardOffset: 40,
  mobileLinkCardOffset: 30,
  mobileLightFalloff: 58,
  mobileLightImpact: 119,
  mobileLightSoftness: 200,
  mobileSilkSpeed: 6.2,
  mobileSilkOpacity: 46,
  mobileSilkTurbulence: 200,
  mobileSilkStartSpread: 92,
  mobileSilkEndSpread: 119,
  mobileSilkDistortion: 82,

  // === Volumetric Spotlight (Desktop) ===
  spotlightOriginX: 0,
  spotlightOriginY: 0,
  spotlightTargetX: 0,
  spotlightTargetY: 0,
  spotlightWidthStart: 120,
  spotlightWidthEnd: 40,
  spotlightIntensity: 80,
  spotlightCoreSharpness: 0.5,
  spotlightCoreWidth: 50,
  spotlightEdgeBlur: 20,
  spotlightRotation: 0,
  spotlightColorOverride: '',
  timelineReflectionIntensity: 50,
  timelineShadowOpacity: 30,
  timelineShadowOffset: 10,
  timelineShadowBlur: 20,
  timelineShadowWidth: 100,

  // === Volumetric Spotlight (Mobile) ===
  mobileSpotlightOriginX: 0,
  mobileSpotlightOriginY: 0,
  mobileSpotlightTargetX: 0,
  mobileSpotlightTargetY: 0,
  mobileSpotlightWidthStart: 60,
  mobileSpotlightWidthEnd: 20,
  mobileSpotlightIntensity: 80,
  mobileSpotlightCoreSharpness: 0.5,
  mobileSpotlightCoreWidth: 50,
  mobileSpotlightEdgeBlur: 10,
  mobileSpotlightRotation: 0,

  // === 智能对齐 ===
  autoAlign: true,
  sourceAnchor: 'bottom',
  showGizmos: false,

  // === NEW: Timeline Visuals ===
  timelineCardGradientStart: 8,
  timelineCardGradientEnd: 25,
  timelineCardBorderGlow: 30,

  // === NEW: Lumina Particles ===
  luminaParticleCount: 15,
  luminaSpawnRate: 50,
  luminaSpeedBase: 30,
  luminaSpeedVar: 120,
  luminaSpiralFreq: 50,
  luminaSpiralAmp: 25,
  luminaGlowSize: 50,
  luminaRippleChance: 33,
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