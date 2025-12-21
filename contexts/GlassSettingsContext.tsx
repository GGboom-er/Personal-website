import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LayoutSettings } from '../components/DebugPanel';

// 默认设置
export const DEFAULT_SETTINGS: LayoutSettings = {
  // === 布局 ===
  showcaseHeight: 65,
  contentOffset: 0,
  cardScale: 200,
  cardImageScale: 115,
  cardPadding: 11,
  cardGap: 12,
  iconScale: 166,

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
  hoverScale: 106,
  hoverOpacity: 81,

  // === 玻璃基础 ===
  glassBlur: 0,
  glassSaturate: 100,
  glassBgOpacity: 0,

  // === 聚焦发光 ===
  focusGlowIntensity: 42,
  focusGlowThickness: 5.5,
  focusGlowSpread: 40,
  focusFlowSpeed: 1.5,
  focusFlowColors: 6,

  // === 图片边框 ===
  borderThickness: 1.5,
  borderGlow: 42,
  borderRefraction: 60,
  imageShadow: 100,
  imageEdgeBlur: 30,

  // === 扭曲效果 ===
  distortionIntensity: 100,
  distortionScale: 24,
};

interface GlassSettingsContextValue {
  settings: LayoutSettings;
  setSettings: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  updateSetting: <K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => void;
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

  const updateSetting = useCallback(<K extends keyof LayoutSettings>(
    key: K,
    value: LayoutSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <GlassSettingsContext.Provider
      value={{
        settings,
        setSettings,
        updateSetting,
        resetSettings,
      }}
    >
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
