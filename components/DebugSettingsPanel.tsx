import React, { useState, useEffect, useRef } from 'react';
import { useGlassSettings } from '../contexts/GlassSettingsContext';
import { LayoutSettings } from '../types';
import timelineData from '../data/timeline.json';

const TIMELINE_NODES = timelineData.timeline;

// 防抖滑块组件：解决拖动卡顿问题
const DebouncedSlider = ({
    label,
    value,
    min,
    max,
    step = 1,
    onChange
}: {
    label: string,
    value: number,
    min: number,
    max: number,
    step?: number,
    onChange: (val: number) => void
}) => {
    const [localValue, setLocalValue] = useState(value);

    // 当外部 value 发生实质性变化（非拖动引起）时，同步更新本地
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setLocalValue(newValue); // 立即更新 UI，保证丝滑
        onChange(newValue);      // 触发外部更新（由父组件决定是否节流）
    };

    return (
        <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                <span className="text-[10px] font-mono text-accent-blue">{localValue.toFixed(step < 1 ? 1 : 0)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localValue}
                onChange={handleChange}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none bg-gray-700 accent-accent-blue"
                style={{ pointerEvents: 'auto' }} // 再次强制交互
            />
        </div>
    );
};

const DebugSettingsPanel: React.FC = () => {
    const { settings, nodeOverrides, updateSetting, updateNodeSetting, getNodeSettings, resetSettings } = useGlassSettings();
    const [isOpen, setIsOpen] = useState(true);
    const [editMode, setEditMode] = useState<'DESKTOP' | 'MOBILE'>('MOBILE');
    const [targetNodeId, setTargetNodeId] = useState<string>('GLOBAL');

    // 获取当前显示用的值
    const currentSettings = targetNodeId === 'GLOBAL' ? settings : getNodeSettings(targetNodeId);

    // 统一更新逻辑
    const handleUpdate = (key: keyof LayoutSettings, value: number) => {
        if (targetNodeId === 'GLOBAL') {
            updateSetting(key, value);
        } else {
            // 强制转换 ID 为 string，防止类型不匹配
            updateNodeSetting(String(targetNodeId), key, value);
        }
    };

    const handleExport = () => {
        const exportData = {
            globalSettings: settings,
            nodeOverrides: nodeOverrides
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        console.log('配置导出:', jsonString);
        navigator.clipboard.writeText(jsonString)
            .then(() => alert('配置已复制！'))
            .catch(() => window.prompt('手动复制:', jsonString));
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-[9999] px-4 py-2 bg-black/80 text-white rounded-full text-xs font-mono border border-white/20 shadow-lg pointer-events-auto"
            >
                <i className="fa-solid fa-sliders mr-2"></i>
                调校
            </button>
        );
    }

    return (
        <div className="w-72 h-full bg-[#0a0a0c]/95 backdrop-blur-md border-l border-white/10 flex flex-col shadow-2xl pointer-events-auto overflow-hidden">

            {/* 顶部栏 */}
            <div className="p-3 border-b border-white/10 space-y-3 bg-black/20 shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white/90">光锥调校台 V2</h3>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px]">
                            导出
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* 模式切换 */}
                <div className="flex bg-white/5 rounded p-0.5">
                    <button
                        onClick={() => setEditMode('DESKTOP')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${editMode === 'DESKTOP' ? 'bg-accent-blue text-white' : 'text-gray-500'
                            }`}
                    >
                        桌面端
                    </button>
                    <button
                        onClick={() => setEditMode('MOBILE')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${editMode === 'MOBILE' ? 'bg-accent-blue text-white' : 'text-gray-500'
                            }`}
                    >
                        移动端
                    </button>
                </div>

                {/* 目标选择 */}
                <select
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                    className={`w-full text-xs px-2 py-1.5 rounded border outline-none ${targetNodeId === 'GLOBAL'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-accent-blue/10 border-accent-blue/50 text-accent-blue font-bold'
                        }`}
                >
                    <option value="GLOBAL">🔵 全局默认值</option>
                    <optgroup label="独立节点 (Overrides)">
                        {TIMELINE_NODES.map(node => (
                            <option key={node.id} value={node.id}>
                                {node.id} - {node.title}
                            </option>
                        ))}
                    </optgroup>
                </select>
            </div>

            {/* 滚动区域 */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">



                {/* 桌面端参数 */}
                {editMode === 'DESKTOP' && (
                    <>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">位置 (Position)</h4>
                            <DebouncedSlider label="起点 X" value={Number(currentSettings.lightConeOriginX)} min={-300} max={300} onChange={(v) => handleUpdate('lightConeOriginX', v)} />
                            <DebouncedSlider label="起点 Y" value={Number(currentSettings.lightConeOriginY)} min={-200} max={200} onChange={(v) => handleUpdate('lightConeOriginY', v)} />
                            <DebouncedSlider label="终点 X" value={Number(currentSettings.lightConeEndX)} min={-300} max={300} onChange={(v) => handleUpdate('lightConeEndX', v)} />
                            <DebouncedSlider label="终点 Y" value={Number(currentSettings.lightConeEndY)} min={-200} max={200} onChange={(v) => handleUpdate('lightConeEndY', v)} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">形态 (Shape)</h4>
                            <DebouncedSlider label="旋转角度" value={Number(currentSettings.lightConeRotation)} min={-180} max={180} onChange={(v) => handleUpdate('lightConeRotation', v)} />
                            <DebouncedSlider label="起点宽度" value={Number(currentSettings.lightConeWidthStart)} min={0} max={500} onChange={(v) => handleUpdate('lightConeWidthStart', v)} />
                            <DebouncedSlider label="终点宽度" value={Number(currentSettings.lightConeWidthEnd)} min={0} max={500} onChange={(v) => handleUpdate('lightConeWidthEnd', v)} />
                            <DebouncedSlider label="扩散角度" value={Number(currentSettings.timelineLightSpread)} min={0} max={200} onChange={(v) => handleUpdate('timelineLightSpread', v)} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">质感 (Visuals)</h4>
                            <DebouncedSlider label="整体透明度" value={Number(currentSettings.timelineLightOpacity)} min={0} max={100} onChange={(v) => handleUpdate('timelineLightOpacity', v)} />
                            <DebouncedSlider label="光衰减 (Falloff)" value={Number(currentSettings.timelineLightFalloff)} min={0} max={100} onChange={(v) => handleUpdate('timelineLightFalloff', v)} />
                            <DebouncedSlider label="光强 (Impact)" value={Number(currentSettings.timelineLightImpact)} min={0} max={200} onChange={(v) => handleUpdate('timelineLightImpact', v)} />
                            <DebouncedSlider label="柔和度 (Softness)" value={Number(currentSettings.timelineLightSoftness)} min={0} max={100} onChange={(v) => handleUpdate('timelineLightSoftness', v)} />
                            <DebouncedSlider label="横向模糊 (Blur X)" value={Number(currentSettings.timelineLightBlurX)} min={0} max={100} onChange={(v) => handleUpdate('timelineLightBlurX', v)} />
                            <DebouncedSlider label="纵向模糊 (Blur Y)" value={Number(currentSettings.timelineLightBlurY)} min={0} max={100} onChange={(v) => handleUpdate('timelineLightBlurY', v)} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">光丝 (Silk)</h4>
                            <DebouncedSlider label="流速" value={Number(currentSettings.timelineSilkSpeed)} min={0} max={20} step={0.1} onChange={(v) => handleUpdate('timelineSilkSpeed', v)} />
                            <DebouncedSlider label="透明度" value={Number(currentSettings.timelineSilkOpacity)} min={0} max={100} onChange={(v) => handleUpdate('timelineSilkOpacity', v)} />
                            <DebouncedSlider label="扰乱强度" value={Number(currentSettings.timelineSilkTurbulence)} min={0} max={100} onChange={(v) => handleUpdate('timelineSilkTurbulence', v)} />
                            <DebouncedSlider label="扭曲强度" value={Number(currentSettings.timelineSilkDistortion)} min={0} max={100} onChange={(v) => handleUpdate('timelineSilkDistortion', v)} />
                            <DebouncedSlider label="起点扩散" value={Number(currentSettings.timelineSilkStartSpread)} min={0} max={200} onChange={(v) => handleUpdate('timelineSilkStartSpread', v)} />
                            <DebouncedSlider label="终点扩散" value={Number(currentSettings.timelineSilkEndSpread)} min={0} max={200} onChange={(v) => handleUpdate('timelineSilkEndSpread', v)} />
                        </div>
                    </>
                )}

                {/* 移动端参数 */}
                {editMode === 'MOBILE' && (
                    <>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">移动端位置</h4>
                            <DebouncedSlider label="起点 X" value={Number(currentSettings.mobileLightConeOriginX)} min={-300} max={300} onChange={(v) => handleUpdate('mobileLightConeOriginX', v)} />
                            <DebouncedSlider label="起点 Y" value={Number(currentSettings.mobileLightConeOriginY)} min={-300} max={300} onChange={(v) => handleUpdate('mobileLightConeOriginY', v)} />
                            <DebouncedSlider label="终点 X" value={Number(currentSettings.mobileLightConeEndX)} min={-300} max={300} onChange={(v) => handleUpdate('mobileLightConeEndX', v)} />
                            <DebouncedSlider label="终点 Y" value={Number(currentSettings.mobileLightConeEndY)} min={-300} max={300} onChange={(v) => handleUpdate('mobileLightConeEndY', v)} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">移动端形态 (Shape)</h4>
                            <DebouncedSlider label="旋转角度" value={Number(currentSettings.mobileLightConeRotation)} min={-180} max={180} onChange={(v) => handleUpdate('mobileLightConeRotation', v)} />
                            <DebouncedSlider label="起点宽度" value={Number(currentSettings.mobileLightConeWidthStart)} min={0} max={500} onChange={(v) => handleUpdate('mobileLightConeWidthStart', v)} />
                            <DebouncedSlider label="终点宽度" value={Number(currentSettings.mobileLightConeWidthEnd)} min={0} max={500} onChange={(v) => handleUpdate('mobileLightConeWidthEnd', v)} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">
                                [Mobile] 质感
                            </h4>
                            <DebouncedSlider label="光锥透明度" value={Number(currentSettings.mobileLightConeOpacity)} min={0} max={200} onChange={(v) => handleUpdate('mobileLightConeOpacity', v)} />
                            <DebouncedSlider label="光衰减 (Falloff)" value={Number(currentSettings.mobileLightFalloff)} min={0} max={100} onChange={(v) => handleUpdate('mobileLightFalloff', v)} />
                            <DebouncedSlider label="光强 (Impact)" value={Number(currentSettings.mobileLightImpact)} min={0} max={200} onChange={(v) => handleUpdate('mobileLightImpact', v)} />
                            <DebouncedSlider label="柔和度 (Softness)" value={Number(currentSettings.mobileLightSoftness)} min={0} max={100} onChange={(v) => handleUpdate('mobileLightSoftness', v)} />
                            <DebouncedSlider label="模糊 (Blur)" value={Number(currentSettings.mobileLightConeBlur)} min={0} max={100} onChange={(v) => handleUpdate('mobileLightConeBlur', v)} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase border-b border-white/5 mb-2">[Mobile] 光丝与粒子</h4>
                            <DebouncedSlider label="流速" value={Number(currentSettings.mobileSilkSpeed)} min={0} max={20} step={0.1} onChange={(v) => handleUpdate('mobileSilkSpeed', v)} />
                            <DebouncedSlider label="透明度" value={Number(currentSettings.mobileSilkOpacity)} min={0} max={100} onChange={(v) => handleUpdate('mobileSilkOpacity', v)} />
                            <DebouncedSlider label="扰乱强度" value={Number(currentSettings.mobileSilkTurbulence)} min={0} max={100} onChange={(v) => handleUpdate('mobileSilkTurbulence', v)} />
                            <DebouncedSlider label="扭曲强度" value={Number(currentSettings.mobileSilkDistortion)} min={0} max={100} onChange={(v) => handleUpdate('mobileSilkDistortion', v)} />
                            <DebouncedSlider label="起点扩散" value={Number(currentSettings.mobileSilkStartSpread)} min={0} max={200} onChange={(v) => handleUpdate('mobileSilkStartSpread', v)} />
                            <DebouncedSlider label="终点扩散" value={Number(currentSettings.mobileSilkEndSpread)} min={0} max={200} onChange={(v) => handleUpdate('mobileSilkEndSpread', v)} />
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

export default DebugSettingsPanel;
