import React, { useState, useEffect, useMemo } from 'react';
import { useGlassSettings } from '../../contexts/GlassSettingsContext';
import { LayoutSettings } from '../../types';
import timelineData from '../../data/timeline.json';

const DebugSettingsPanel: React.FC = () => {
    const { settings, nodeOverrides, updateSetting, updateNodeSetting, resetSettings, getNodeSettings } = useGlassSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'glass' | 'vfx'>('timeline');
    const [selectedNodeId, setSelectedNodeId] = useState<string>('global');

    const nodes = useMemo(() => {
        return (timelineData.timeline as any[]).map(n => ({ id: n.id, title: n.title }));
    }, []);

    const currentSettings = useMemo(() => {
        if (selectedNodeId === 'global') return settings;
        return getNodeSettings(selectedNodeId);
    }, [selectedNodeId, settings, nodeOverrides]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-[9999] bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full hover:bg-white/20 transition-all shadow-xl"
                title="打开调试面板"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
                </svg>
            </button>
        );
    }

    const handleChange = (param: keyof LayoutSettings, value: any) => {
        if (selectedNodeId === 'global') {
            updateSetting(param, value);
        } else {
            updateNodeSetting(selectedNodeId, param, value);
        }
    };

    const Slider = ({ label, value, min, max, step = 1, param }: { label: string, value: number, min: number, max: number, step?: number, param: keyof LayoutSettings }) => (
        <div className="mb-3">
            <div className="flex justify-between text-[11px] text-white/60 mb-1">
                <span>{label}</span>
                <span className="font-mono">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => handleChange(param, parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>
    );


    const ToggleGizmos = () => (
        <div className="flex justify-between items-center mb-4 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className="text-[11px] text-blue-400 font-bold">显示屏幕交互手柄 (Gizmos)</span>
            <button
                onClick={() => updateSetting('showGizmos', !settings.showGizmos)}
                onPointerDown={(e) => e.stopPropagation()}
                className={`w-8 h-4 rounded-full transition-colors relative ${settings.showGizmos ? 'bg-blue-500' : 'bg-white/10'}`}
            >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.showGizmos ? 'left-4' : 'left-0.5'}`} />
            </button>
        </div>
    );

    const Toggle = ({ label, value, param }: { label: string, value: boolean, param: keyof LayoutSettings }) => (
        <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] text-white/60">{label}</span>
            <button
                onClick={() => handleChange(param, !value)}
                onPointerDown={(e) => e.stopPropagation()}
                className={`w-8 h-4 rounded-full transition-colors relative ${value ? 'bg-blue-500' : 'bg-white/10'}`}
            >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${value ? 'left-4' : 'left-0.5'}`} />
            </button>
        </div>
    );

    const Select = ({ label, value, options, param }: { label: string, value: string, options: { label: string, value: string }[] | string[], param: keyof LayoutSettings }) => (
        <div className="mb-3">
            <div className="text-[11px] text-white/60 mb-1">{label}</div>
            <select
                value={value}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => handleChange(param, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-blue-500/50"
            >
                {(options as any[]).map(opt => {
                    const l = typeof opt === 'string' ? opt : opt.label;
                    const v = typeof opt === 'string' ? opt : opt.value;
                    return <option key={v} value={v} className="bg-gray-900">{l}</option>;
                })}
            </select>
        </div>
    );

    return (
        <div
            className="fixed bottom-4 right-4 z-[9999] w-80 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="bg-white/5 p-3 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white/90">视觉调试面板</h3>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">V2.1</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Node Selector */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">选择编辑对象</div>
                <select
                    value={selectedNodeId}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    className="w-full bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1.5 text-[12px] text-white outline-none focus:border-blue-500/60"
                >
                    <option value="global" className="bg-gray-900">🌐 全局默认配置</option>
                    <hr />
                    {nodes.map(node => (
                        <option key={node.id} value={node.id} className="bg-gray-900">📍 节点: {node.title}</option>
                    ))}
                </select>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {(['timeline', 'glass', 'vfx'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`flex-1 py-2 text-[11px] font-medium transition-all ${activeTab === tab ? 'text-blue-400 bg-blue-500/10' : 'text-white/40 hover:text-white/60'}`}
                    >
                        {tab === 'timeline' ? '时间轴' : tab === 'glass' ? '材质' : '特效VFX'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto custom-scrollbar">
                {activeTab === 'timeline' && (
                    <div className="space-y-4">
                        <ToggleGizmos />
                        <section>
                            <div className="text-[10px] text-purple-400/60 mb-3 font-bold uppercase tracking-widest">全局光效</div>
                            <Slider label="光线不透明度" value={currentSettings.timelineLightOpacity} min={0} max={100} param="timelineLightOpacity" />
                            <Slider label="光线扩散度" value={currentSettings.timelineLightSpread} min={0} max={100} param="timelineLightSpread" />
                            <Slider label="卡片自发光" value={currentSettings.timelineCardGlow} min={0} max={100} param="timelineCardGlow" />
                        </section>

                        <hr className="border-white/5" />
                        
                        <section>
                            <div className="text-[10px] text-orange-400/60 mb-3 font-bold uppercase tracking-widest">卡片渐变光效</div>
                            <Slider label="渐变起始 (暗部)" value={currentSettings.timelineCardGradientStart} min={0} max={50} param="timelineCardGradientStart" />
                            <Slider label="渐变结束 (亮部)" value={currentSettings.timelineCardGradientEnd} min={0} max={100} param="timelineCardGradientEnd" />
                            <Slider label="边框光晕强度" value={currentSettings.timelineCardBorderGlow} min={0} max={100} param="timelineCardBorderGlow" />
                        </section>

                        <hr className="border-white/5" />

                        <section>
                            <div className="text-[10px] text-purple-400/60 mb-3 font-bold uppercase tracking-widest">流光效果</div>
                            <Slider label="流动速度" value={currentSettings.timelineSilkSpeed} min={0} max={20} step={0.1} param="timelineSilkSpeed" />
                            <Slider label="流动不透明度" value={currentSettings.timelineSilkOpacity} min={0} max={100} param="timelineSilkOpacity" />
                            <Slider label="反射强度" value={currentSettings.timelineReflectionIntensity} min={0} max={100} param="timelineReflectionIntensity" />
                        </section>
                    </div>
                )}

                {activeTab === 'glass' && (
                    <div className="space-y-4">
                        <section>
                            <div className="text-[10px] text-emerald-400/60 mb-3 font-bold uppercase tracking-widest">材质属性</div>
                            <Slider label="玻璃模糊度" value={currentSettings.glassBlur} min={0} max={40} param="glassBlur" />
                            <Slider label="色彩饱和度" value={currentSettings.glassSaturate} min={0} max={200} param="glassSaturate" />
                            <Slider label="背景不透明度" value={currentSettings.glassBgOpacity} min={0} max={100} param="glassBgOpacity" />
                            <Slider label="边框厚度" value={currentSettings.borderThickness} min={0} max={10} step={0.5} param="borderThickness" />
                            <Slider label="卡片基础缩放" value={currentSettings.cardScale} min={100} max={300} param="cardScale" />
                        </section>
                    </div>
                )}

                {activeTab === 'vfx' && (
                    <div className="space-y-4">
                         <section>
                            <div className="text-[10px] text-cyan-400/60 mb-3 font-bold uppercase tracking-widest">Lumina 粒子系统</div>
                            <Slider label="粒子总数限制" value={currentSettings.luminaParticleCount} min={0} max={300} param="luminaParticleCount" />
                            <Slider label="生成概率 (%)" value={currentSettings.luminaSpawnRate} min={0} max={100} param="luminaSpawnRate" />
                            <Slider label="基础速度 (Base)" value={currentSettings.luminaSpeedBase} min={0} max={200} param="luminaSpeedBase" />
                            <Slider label="速度随机性 (Var)" value={currentSettings.luminaSpeedVar} min={0} max={500} param="luminaSpeedVar" />
                        </section>
                        <hr className="border-white/5" />
                        <section>
                            <div className="text-[10px] text-cyan-400/60 mb-3 font-bold uppercase tracking-widest">Lumina 运动形态</div>
                            <Slider label="螺旋频率 (Spiral Freq)" value={currentSettings.luminaSpiralFreq} min={0} max={200} param="luminaSpiralFreq" />
                            <Slider label="螺旋振幅 (Amplitude)" value={currentSettings.luminaSpiralAmp} min={0} max={100} param="luminaSpiralAmp" />
                        </section>
                        <hr className="border-white/5" />
                        <section>
                            <div className="text-[10px] text-pink-400/60 mb-3 font-bold uppercase tracking-widest">交互与光效</div>
                            <Slider label="光晕大小 (Glow Size)" value={currentSettings.luminaGlowSize} min={0} max={100} param="luminaGlowSize" />
                            <Slider label="赛博涟漪概率 (%)" value={currentSettings.luminaRippleChance} min={0} max={100} param="luminaRippleChance" />
                        </section>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                <button
                    onClick={resetSettings}
                    className="flex-1 py-2 text-[11px] font-bold text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg"
                >
                    恢复默认
                </button>
                <button
                    onClick={() => {
                        const config = JSON.stringify({ settings, nodeOverrides }, null, 2);
                        navigator.clipboard.writeText(config);
                        alert('配置已复制到剪贴板！');
                    }}
                    className="flex-1 py-2 text-[11px] font-bold text-white bg-blue-600/50 hover:bg-blue-600/70 transition-all rounded-lg"
                >
                    复制配置
                </button>
            </div>
            
            {/* Free Mode Export */}
            <div className="p-3 bg-white/5 border-t border-white/10">
                 <button
                    onClick={() => {
                        const freeConfig = (window as any).__GET_FREE_BEAM_CONFIG__?.();
                        if (freeConfig) {
                            navigator.clipboard.writeText(JSON.stringify(freeConfig, null, 2));
                            alert('自由光束坐标已复制！');
                        } else {
                            alert('未找到自由光束配置。');
                        }
                    }}
                    className="w-full py-2 text-[11px] font-bold text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 transition-all rounded-lg"
                >
                    📍 导出自由矩形坐标 (Free Rects)
                </button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default DebugSettingsPanel;
