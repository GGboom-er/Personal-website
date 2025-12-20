import React, { useState } from 'react';

export interface LayoutSettings {
  // 布局参数
  showcaseHeight: number;    // 详情区高度百分比 (可通过拖动分隔线调整)
  cardScale: number;         // 卡片缩放比例
  contentOffset: number;     // 内容上移百分比
  titleSize: number;         // 标题字号
  descSize: number;          // 描述字号
  descLines: number;         // 描述行数
  iconScale: number;         // 图标缩放
  // 液态玻璃参数
  glassBlur: number;         // 模糊程度 (px)
  glassSaturate: number;     // 饱和度 (%)
  glassBgOpacity: number;    // 背景透明度 (%)
  glassBorderOpacity: number; // 边框透明度 (%)
  glassShadowOpacity: number; // 阴影透明度 (%)
  // 图片液态效果
  imageGlassBlur: number;    // 图片边缘模糊 (px)
  imageGlassBorder: number;  // 图片边框发光 (%)
  imageGlassShadow: number;  // 图片阴影 (%)
  // 玻璃厚度感
  glassThickness: number;    // 玻璃边缘厚度 (px)
  glassRefraction: number;   // 折射色彩强度 (%)
}

interface DebugPanelProps {
  settings: LayoutSettings;
  onChange: (settings: LayoutSettings) => void;
  visible: boolean;
  onToggle: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ settings, onChange, visible, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);

  const updateSetting = (key: keyof LayoutSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  const exportSettings = () => {
    const code = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(code);
    alert('设置已复制到剪贴板！\n\n' + code);
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50
          bg-gradient-to-br from-white/15 to-white/8
          backdrop-blur-sm
          text-white px-4 py-2.5 rounded-xl text-xs font-semibold
          border border-white/25
          shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
          hover:from-white/20 hover:to-white/12
          hover:shadow-[0_6px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
          hover:-translate-y-0.5
          active:scale-[0.97] active:translate-y-0
          transition-all duration-200 ease-out"
      >
        <i className="fa-solid fa-sliders mr-1.5"></i> 调试
      </button>
    );
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 w-72
        bg-gradient-to-br from-white/12 to-white/6
        backdrop-blur-sm
        border border-white/20
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
        text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
        <span className="font-bold text-sm">布局调试面板</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white text-xs"
          >
            {collapsed ? '展开' : '收起'}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-red-400 text-xs"
          >
            关闭
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* 详情区高度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              详情区高度: {settings.showcaseHeight.toFixed(0)}%
              <span className="text-[10px] text-gray-500 ml-1">(拖动分隔线)</span>
            </label>
            <input
              type="range"
              min="40"
              max="75"
              value={settings.showcaseHeight}
              onChange={(e) => updateSetting('showcaseHeight', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 内容上移 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              内容上移: {settings.contentOffset}%
            </label>
            <input
              type="range"
              min="0"
              max="30"
              value={settings.contentOffset}
              onChange={(e) => updateSetting('contentOffset', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 卡片缩放 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              卡片缩放: {settings.cardScale}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={settings.cardScale}
              onChange={(e) => updateSetting('cardScale', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 图标缩放 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              详情图标: {settings.iconScale}%
            </label>
            <input
              type="range"
              min="50"
              max="150"
              value={settings.iconScale}
              onChange={(e) => updateSetting('iconScale', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 标题字号 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              标题字号: {settings.titleSize}px
            </label>
            <input
              type="range"
              min="18"
              max="48"
              value={settings.titleSize}
              onChange={(e) => updateSetting('titleSize', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 描述字号 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              描述字号: {settings.descSize}px
            </label>
            <input
              type="range"
              min="10"
              max="20"
              value={settings.descSize}
              onChange={(e) => updateSetting('descSize', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 描述行数 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              描述行数: {settings.descLines}
            </label>
            <input
              type="range"
              min="2"
              max="6"
              value={settings.descLines}
              onChange={(e) => updateSetting('descLines', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 分隔线 */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="text-xs font-semibold text-white/80 mb-3">液态玻璃效果</div>
          </div>

          {/* 模糊程度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              模糊程度: {settings.glassBlur}px
            </label>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={settings.glassBlur}
              onChange={(e) => updateSetting('glassBlur', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 饱和度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              饱和度: {settings.glassSaturate}%
            </label>
            <input
              type="range"
              min="100"
              max="300"
              step="10"
              value={settings.glassSaturate}
              onChange={(e) => updateSetting('glassSaturate', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 背景透明度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              背景透明度: {settings.glassBgOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={settings.glassBgOpacity}
              onChange={(e) => updateSetting('glassBgOpacity', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 边框透明度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              边框透明度: {settings.glassBorderOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={settings.glassBorderOpacity}
              onChange={(e) => updateSetting('glassBorderOpacity', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 阴影透明度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              阴影透明度: {settings.glassShadowOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={settings.glassShadowOpacity}
              onChange={(e) => updateSetting('glassShadowOpacity', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 分隔线 - 图片效果 */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="text-xs font-semibold text-white/80 mb-3">图片液态效果</div>
          </div>

          {/* 图片模糊 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              图片模糊: {settings.imageGlassBlur}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={settings.imageGlassBlur}
              onChange={(e) => updateSetting('imageGlassBlur', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 图片边框发光 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              边框发光: {settings.imageGlassBorder}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.imageGlassBorder}
              onChange={(e) => updateSetting('imageGlassBorder', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 图片阴影 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              图片阴影: {settings.imageGlassShadow}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.imageGlassShadow}
              onChange={(e) => updateSetting('imageGlassShadow', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 分隔线 - 玻璃厚度 */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="text-xs font-semibold text-white/80 mb-3">玻璃厚度感</div>
          </div>

          {/* 边缘厚度 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              边缘厚度: {settings.glassThickness}px
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={settings.glassThickness}
              onChange={(e) => updateSetting('glassThickness', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 折射色彩 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              折射色彩: {settings.glassRefraction}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.glassRefraction}
              onChange={(e) => updateSetting('glassRefraction', Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* 操作按钮 - 液态玻璃 */}
          <div className="flex gap-2 pt-3 border-t border-white/10">
            <button
              onClick={exportSettings}
              className="flex-1 text-white text-xs py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(2px) saturate(180%)',
                WebkitBackdropFilter: 'blur(2px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <i className="fa-solid fa-copy mr-1"></i> 导出
            </button>
            <button
              onClick={onToggle}
              className="flex-1 text-white text-xs py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(2px) saturate(180%)',
                WebkitBackdropFilter: 'blur(2px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <i className="fa-solid fa-lock mr-1"></i> 锁定
            </button>
          </div>

          {/* 快捷键提示 */}
          <div className="text-[10px] text-gray-500 text-center pt-1">
            快捷键: Ctrl+Shift+D
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
