import React, { createContext, useContext, ReactNode } from 'react';

// 每个元素的布局数据
interface ElementLayout {
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
}

// 节点布局配置
export interface NodeLayoutConfig {
  mainCard: ElementLayout;
  linkCard: ElementLayout;
  lightCone: ElementLayout;
  glassLine: ElementLayout;
}

// 默认布局
const DEFAULT_ELEMENT_LAYOUT: ElementLayout = {
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scale: 1,
};

// 移动端布局配置
const MOBILE_LAYOUTS: Record<string, NodeLayoutConfig> = {
  work1: {
    mainCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 0.8 },
    linkCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
  },
  edu: {
    mainCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 0.8 },
    linkCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
  },
  intern: {
    mainCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 0.8 },
    linkCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
  },
  work2: {
    mainCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 0.8 },
    linkCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
  },
};

// 桌面端布局配置
const DESKTOP_LAYOUTS: Record<string, NodeLayoutConfig> = {
  edu: {
    mainCard: { offsetX: 1, offsetY: 26, rotation: 0, scale: 1 },
    linkCard: { offsetX: -251, offsetY: 150, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: -149, offsetY: 113, rotation: 0, scale: 1 },
  },
  work1: {
    mainCard: { offsetX: 0, offsetY: 1, rotation: 0, scale: 1 },
    linkCard: { offsetX: 165, offsetY: 121, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: 83, offsetY: 84, rotation: 0, scale: 1 },
  },
  intern: {
    mainCard: { offsetX: 3, offsetY: -29, rotation: 0, scale: 1 },
    linkCard: { offsetX: -161, offsetY: -81, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: -93, offsetY: -48, rotation: -89, scale: 1 },
  },
  work2: {
    mainCard: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    linkCard: { offsetX: -151, offsetY: -53, rotation: 0, scale: 1 },
    lightCone: { offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
    glassLine: { offsetX: -97, offsetY: -22, rotation: -91, scale: 1 },
  },
};

interface DragEditorContextValue {
  getElementLayout: (nodeId: string, elementType: keyof NodeLayoutConfig, isMobile: boolean) => ElementLayout;
}

const DragEditorContext = createContext<DragEditorContextValue | null>(null);

interface DragEditorProviderProps {
  children: ReactNode;
}

export const DragEditorProvider: React.FC<DragEditorProviderProps> = ({ children }) => {
  const getElementLayout = (nodeId: string, elementType: keyof NodeLayoutConfig, isMobile: boolean): ElementLayout => {
    const layouts = isMobile ? MOBILE_LAYOUTS : DESKTOP_LAYOUTS;
    return layouts[nodeId]?.[elementType] || { ...DEFAULT_ELEMENT_LAYOUT };
  };

  return (
    <DragEditorContext.Provider value={{ getElementLayout }}>
      {children}
    </DragEditorContext.Provider>
  );
};

export const useDragEditor = (): DragEditorContextValue => {
  const context = useContext(DragEditorContext);
  if (!context) {
    throw new Error('useDragEditor must be used within a DragEditorProvider');
  }
  return context;
};
