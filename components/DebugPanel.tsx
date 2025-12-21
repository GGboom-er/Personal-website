import React, { useState } from 'react';

export interface LayoutSettings {
  // === 布局 ===
  showcaseHeight: number;     // 详情区高度 (40-80%)
  contentOffset: number;      // 内容上移 (0-50)
  cardScale: number;          // 卡片缩放 (30-200%)
  cardImageScale: number;     // 卡片图片缩放 (80-130%)
  cardPadding: number;        // 卡片内边距 (0-30px)
  cardGap: number;            // 卡片间距 (0-30px)
  iconScale: number;          // 详情图标缩放 (50-200%)

  // === 字体 ===
  titleSize: number;          // 标题字号 (12-60px)
  descSize: number;           // 描述字号 (8-24px)
  descLines: number;          // 描述行数 (1-8)
  fontFamily: string;         // 字体系列
  titleColor: string;         // 标题颜色
  descColor: string;          // 描述颜色
  textShadow: number;         // 文字阴影强度 (0-100%)
  textHighlight: number;      // 文字高光强度 (0-100%)

  // === 悬停效果 ===
  hoverBlur: number;          // 悬停模糊度 (0-20px)
  hoverScale: number;         // 悬停缩放 (100-115%)
  hoverOpacity: number;       // 悬停遮罩不透明度 (0-100%)

  // === 玻璃基础 ===
  glassBlur: number;          // 背景模糊 (0-50px)
  glassSaturate: number;      // 饱和度 (50-400%)
  glassBgOpacity: number;     // 背景不透明度 (0-100%)

  // === 聚焦发光 ===
  focusGlowIntensity: number;  // 发光强度 (0-100%)
  focusGlowThickness: number;  // 发光厚度 (0-20px)
  focusGlowSpread: number;     // 发光扩散 (0-50px)
  focusFlowSpeed: number;      // 流光速度 (0-10s)
  focusFlowColors: number;     // 流光色彩数 (2-6)

  // === 图片边框 ===
  borderThickness: number;     // 边框厚度 (0-15px)
  borderGlow: number;          // 边框发光 (0-100%)
  borderRefraction: number;    // 折射色彩 (0-100%)
  imageShadow: number;         // 图片阴影 (0-100%)
  imageEdgeBlur: number;       // 边缘模糊 (0-30px)

  // === 扭曲效果 ===
  distortionIntensity: number; // 扭曲强度 (0-100%)
  distortionScale: number;     // 扭曲范围 (0-50px)
}

interface DebugPanelProps {
  settings: LayoutSettings;
  onChange: (settings: LayoutSettings) => void;
  visible: boolean;
  onToggle: () => void;
}

// 滑块组件
const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-gray-400 w-16 shrink-0">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
        [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.5)]
        [&::-webkit-slider-thumb]:cursor-pointer"
    />
    <span className="text-[10px] text-white/60 w-10 text-right">{value}{unit}</span>
  </div>
);

// 分组标题组件
const SectionTitle: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="flex items-center gap-1.5 pt-2 pb-1">
    <i className={`${icon} text-[10px] text-blue-400`}></i>
    <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">{title}</span>
  </div>
);

// 字体选项
const FONT_OPTIONS = [
  { label: '霞鹜文楷', value: '"LXGW WenKai", sans-serif' },
  { label: 'Inter + Noto', value: 'Inter, "Noto Sans SC", sans-serif' },
  { label: '思源黑体', value: '"Noto Sans SC", sans-serif' },
  { label: '系统默认', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
];

// 颜色选择组件
const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-gray-400 w-16 shrink-0">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-6 rounded cursor-pointer bg-transparent border border-white/20"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 h-6 px-2 text-[10px] bg-white/10 border border-white/20 rounded text-white"
    />
  </div>
);

// 选择器组件
const Select: React.FC<{
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-gray-400 w-16 shrink-0">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 h-6 px-2 text-[10px] bg-white/10 border border-white/20 rounded text-white cursor-pointer
        [&>option]:bg-gray-800 [&>option]:text-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const DebugPanel: React.FC<DebugPanelProps> = ({ settings, onChange, visible, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'style' | 'glass' | 'glow'>('layout');

  const updateSetting = <T extends keyof LayoutSettings>(key: T, value: LayoutSettings[T]) => {
    onChange({ ...settings, [key]: value });
  };

  const exportSettings = () => {
    const code = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(code);
    alert('设置已复制到剪贴板！');
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl
          bg-white/10 backdrop-blur-sm border border-white/20
          text-white/70 hover:text-white hover:bg-white/15
          shadow-lg transition-all duration-200 hover:scale-105"
      >
        <i className="fa-solid fa-sliders"></i>
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-72 rounded-2xl overflow-hidden
      bg-black/60 backdrop-blur-xl border border-white/15
      shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-semibold text-white">调试面板</span>
        <div className="flex gap-1">
          <button onClick={exportSettings}
            className="text-[10px] text-gray-400 hover:text-green-400 px-2 py-1 rounded hover:bg-white/5">
            <i className="fa-solid fa-copy mr-1"></i>导出
          </button>
          <button onClick={onToggle}
            className="text-[10px] text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-white/5">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {([
          { id: 'layout', label: '布局', icon: 'fa-solid fa-th-large' },
          { id: 'style', label: '样式', icon: 'fa-solid fa-palette' },
          { id: 'glass', label: '玻璃', icon: 'fa-solid fa-droplet' },
          { id: 'glow', label: '发光', icon: 'fa-solid fa-sparkles' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[10px] font-medium transition-all
              ${activeTab === tab.id
                ? 'text-white bg-white/10 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <i className={`${tab.icon} mr-1`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-[65vh] overflow-y-auto space-y-1.5
        scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">

        {/* 布局 Tab */}
        {activeTab === 'layout' && (
          <>
            <SectionTitle title="区域布局" icon="fa-solid fa-expand" />
            <Slider label="详情高度" value={settings.showcaseHeight} min={30} max={80} unit="%" onChange={v => updateSetting('showcaseHeight', v)} />
            <Slider label="内容上移" value={settings.contentOffset} min={0} max={50} onChange={v => updateSetting('contentOffset', v)} />
            <Slider label="卡片缩放" value={settings.cardScale} min={30} max={250} unit="%" onChange={v => updateSetting('cardScale', v)} />
            <Slider label="卡片图片" value={settings.cardImageScale} min={80} max={130} unit="%" onChange={v => updateSetting('cardImageScale', v)} />
            <Slider label="卡片边距" value={settings.cardPadding} min={0} max={30} unit="px" onChange={v => updateSetting('cardPadding', v)} />
            <Slider label="卡片间距" value={settings.cardGap} min={0} max={30} unit="px" onChange={v => updateSetting('cardGap', v)} />
            <Slider label="图标缩放" value={settings.iconScale} min={50} max={200} unit="%" onChange={v => updateSetting('iconScale', v)} />

            <SectionTitle title="字体排版" icon="fa-solid fa-font" />
            <Slider label="标题字号" value={settings.titleSize} min={12} max={60} unit="px" onChange={v => updateSetting('titleSize', v)} />
            <Slider label="描述字号" value={settings.descSize} min={8} max={24} unit="px" onChange={v => updateSetting('descSize', v)} />
            <Slider label="描述行数" value={settings.descLines} min={1} max={8} onChange={v => updateSetting('descLines', v)} />

            <SectionTitle title="悬停效果" icon="fa-solid fa-hand-pointer" />
            <Slider label="悬停模糊" value={settings.hoverBlur} min={0} max={20} unit="px" onChange={v => updateSetting('hoverBlur', v)} />
            <Slider label="悬停缩放" value={settings.hoverScale} min={100} max={115} unit="%" onChange={v => updateSetting('hoverScale', v)} />
            <Slider label="遮罩透明" value={settings.hoverOpacity} min={0} max={100} unit="%" onChange={v => updateSetting('hoverOpacity', v)} />
          </>
        )}

        {/* 样式 Tab */}
        {activeTab === 'style' && (
          <>
            <SectionTitle title="字体选择" icon="fa-solid fa-font" />
            <Select
              label="字体"
              value={settings.fontFamily}
              options={FONT_OPTIONS}
              onChange={v => updateSetting('fontFamily', v)}
            />

            <SectionTitle title="文字颜色" icon="fa-solid fa-eye-dropper" />
            <ColorPicker
              label="标题颜色"
              value={settings.titleColor}
              onChange={v => updateSetting('titleColor', v)}
            />
            <ColorPicker
              label="描述颜色"
              value={settings.descColor}
              onChange={v => updateSetting('descColor', v)}
            />

            <SectionTitle title="3D文字效果" icon="fa-solid fa-cube" />
            <Slider label="文字阴影" value={settings.textShadow} min={0} max={100} unit="%" onChange={v => updateSetting('textShadow', v)} />
            <Slider label="文字高光" value={settings.textHighlight} min={0} max={100} unit="%" onChange={v => updateSetting('textHighlight', v)} />

            <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-[10px] text-gray-400 mb-1">预览文本：</p>
              <p
                className="text-sm font-bold mb-1"
                style={{
                  fontFamily: settings.fontFamily,
                  color: settings.titleColor,
                  textShadow: `
                    0 1px 0 rgba(255,255,255,${settings.textHighlight / 100 * 0.3}),
                    0 2px 4px rgba(0,0,0,${settings.textShadow / 100 * 0.5}),
                    0 4px 8px rgba(0,0,0,${settings.textShadow / 100 * 0.3})
                  `,
                }}
              >
                标题示例 Title
              </p>
              <p
                className="text-xs"
                style={{
                  fontFamily: settings.fontFamily,
                  color: settings.descColor,
                  textShadow: `
                    0 1px 0 rgba(255,255,255,${settings.textHighlight / 100 * 0.2}),
                    0 1px 3px rgba(0,0,0,${settings.textShadow / 100 * 0.4})
                  `,
                }}
              >
                这是描述文字的预览效果，Description preview.
              </p>
            </div>
          </>
        )}

        {/* 玻璃 Tab */}
        {activeTab === 'glass' && (
          <>
            <SectionTitle title="背景效果" icon="fa-solid fa-circle-half-stroke" />
            <Slider label="模糊程度" value={settings.glassBlur} min={0} max={50} unit="px" onChange={v => updateSetting('glassBlur', v)} />
            <Slider label="饱和度" value={settings.glassSaturate} min={50} max={400} step={10} unit="%" onChange={v => updateSetting('glassSaturate', v)} />
            <Slider label="背景透明" value={settings.glassBgOpacity} min={0} max={100} unit="%" onChange={v => updateSetting('glassBgOpacity', v)} />

            <SectionTitle title="图片边框" icon="fa-solid fa-border-all" />
            <Slider label="边框厚度" value={settings.borderThickness} min={0} max={15} step={0.5} unit="px" onChange={v => updateSetting('borderThickness', v)} />
            <Slider label="边框发光" value={settings.borderGlow} min={0} max={100} unit="%" onChange={v => updateSetting('borderGlow', v)} />
            <Slider label="折射色彩" value={settings.borderRefraction} min={0} max={100} unit="%" onChange={v => updateSetting('borderRefraction', v)} />
            <Slider label="图片阴影" value={settings.imageShadow} min={0} max={100} unit="%" onChange={v => updateSetting('imageShadow', v)} />
            <Slider label="边缘模糊" value={settings.imageEdgeBlur} min={0} max={30} unit="px" onChange={v => updateSetting('imageEdgeBlur', v)} />

            <SectionTitle title="扭曲效果" icon="fa-solid fa-water" />
            <Slider label="扭曲强度" value={settings.distortionIntensity} min={0} max={100} unit="%" onChange={v => updateSetting('distortionIntensity', v)} />
            <Slider label="扭曲范围" value={settings.distortionScale} min={0} max={50} unit="px" onChange={v => updateSetting('distortionScale', v)} />
          </>
        )}

        {/* 发光 Tab */}
        {activeTab === 'glow' && (
          <>
            <SectionTitle title="聚焦发光" icon="fa-solid fa-sun" />
            <Slider label="发光强度" value={settings.focusGlowIntensity} min={0} max={100} unit="%" onChange={v => updateSetting('focusGlowIntensity', v)} />
            <Slider label="发光厚度" value={settings.focusGlowThickness} min={0} max={20} step={0.5} unit="px" onChange={v => updateSetting('focusGlowThickness', v)} />
            <Slider label="发光扩散" value={settings.focusGlowSpread} min={0} max={50} unit="px" onChange={v => updateSetting('focusGlowSpread', v)} />

            <SectionTitle title="流光动画" icon="fa-solid fa-wand-magic-sparkles" />
            <Slider label="流光速度" value={settings.focusFlowSpeed} min={0} max={10} step={0.5} unit="s" onChange={v => updateSetting('focusFlowSpeed', v)} />
            <Slider label="色彩数量" value={settings.focusFlowColors} min={2} max={6} onChange={v => updateSetting('focusFlowColors', v)} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-center">
        <span className="text-[9px] text-gray-500">Ctrl+Shift+D 切换面板</span>
      </div>
    </div>
  );
};

export default DebugPanel;
