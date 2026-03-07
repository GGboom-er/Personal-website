import React, { createContext, useContext, ReactNode, useState } from 'react';

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
const INITIAL_MOBILE_LAYOUTS: Record<string, NodeLayoutConfig> = {
  "work1": {
    "mainCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 0.8 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  },
  "edu": {
    "mainCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 0.8 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  },
  "intern": {
    "mainCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 0.8 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  },
  "work2": {
    "mainCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 0.8 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  }
};

// 桌面端布局配置
const INITIAL_DESKTOP_LAYOUTS: Record<string, NodeLayoutConfig> = {
  "edu": {
    "mainCard": { "offsetX": -32.29, "offsetY": 1.33, "rotation": 0, "scale": 1 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  },
  "work1": {
    "mainCard": { "offsetX": 6.79, "offsetY": -0.69, "rotation": 0, "scale": 1 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  },
  "intern": {
    "mainCard": { "offsetX": 20.09, "offsetY": 15.96, "rotation": 0, "scale": 1 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  },
  "work2": {
    "mainCard": { "offsetX": 5.13, "offsetY": 6.06, "rotation": 0, "scale": 1 },
    "linkCard": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "lightCone": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 },
    "glassLine": { "offsetX": 0, "offsetY": 0, "rotation": 0, "scale": 1 }
  }
};

interface DragEditorContextValue {
  getElementLayout: (nodeId: string, elementType: keyof NodeLayoutConfig, isMobile: boolean) => ElementLayout;
  updateElementLayout: (nodeId: string, elementType: keyof NodeLayoutConfig, isMobile: boolean, offsetX: number, offsetY: number) => void;
  exportLayoutConfig: () => void;
}

const DragEditorContext = createContext<DragEditorContextValue | null>(null);

interface DragEditorProviderProps {
  children: ReactNode;
}

export const DragEditorProvider: React.FC<DragEditorProviderProps> = ({ children }) => {
  const [mobileLayouts, setMobileLayouts] = useState(INITIAL_MOBILE_LAYOUTS);
  const [desktopLayouts, setDesktopLayouts] = useState(INITIAL_DESKTOP_LAYOUTS);

  const getElementLayout = (nodeId: string, elementType: keyof NodeLayoutConfig, isMobile: boolean): ElementLayout => {
    const layouts = isMobile ? mobileLayouts : desktopLayouts;
    return layouts[nodeId]?.[elementType] || { ...DEFAULT_ELEMENT_LAYOUT };
  };

  const updateElementLayout = (nodeId: string, elementType: keyof NodeLayoutConfig, isMobile: boolean, offsetX: number, offsetY: number) => {
    const setLayouts = isMobile ? setMobileLayouts : setDesktopLayouts;
    setLayouts(prev => {
      const nodeLayout = prev[nodeId] || {
        mainCard: { ...DEFAULT_ELEMENT_LAYOUT },
        linkCard: { ...DEFAULT_ELEMENT_LAYOUT },
        lightCone: { ...DEFAULT_ELEMENT_LAYOUT },
        glassLine: { ...DEFAULT_ELEMENT_LAYOUT },
      };
      const elementLayout = nodeLayout[elementType] || { ...DEFAULT_ELEMENT_LAYOUT };
      
      return {
        ...prev,
        [nodeId]: {
          ...nodeLayout,
          [elementType]: {
            ...elementLayout,
            offsetX: Math.round(offsetX * 100) / 100,
            offsetY: Math.round(offsetY * 100) / 100,
          }
        }
      };
    });
  };

  const exportLayoutConfig = () => {
    const config = {
      mobile: mobileLayouts,
      desktop: desktopLayouts,
    };
    const jsonString = JSON.stringify(config, null, 2);
    console.log('--- EXPORTED LAYOUT CONFIG ---');
    console.log(jsonString);
    navigator.clipboard.writeText(jsonString).then(() => {
        alert('布局配置已导出至剪贴板，并已在控制台打印');
    }).catch(err => {
        console.error('导出到剪贴板失败: ', err);
        alert('无法导出至剪贴板，布局配置已在控制台导出（Console）');
    });
  };

  return (
    <DragEditorContext.Provider value={{ getElementLayout, updateElementLayout, exportLayoutConfig }}>
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
