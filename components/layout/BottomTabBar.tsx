import React from 'react';
import { LayoutSettings } from '../../types';
import { getFlowGradient } from '../glass';

interface BottomTabBarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  settings: LayoutSettings;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeView, onSelectView, settings }) => {
  const menuItems = [
    { icon: 'fa-regular fa-id-card', label: '个人信息', id: 'Profile' },
    { icon: 'fa-solid fa-layer-group', label: '参与作品', id: 'Projects' },
    { icon: 'fa-solid fa-chart-pie', label: '技能分析', id: 'Skills' },
  ];

  // 发光参数 (与 Sidebar 保持一致)
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;
  const borderRefraction = settings.borderRefraction / 100;
  const borderThickness = settings.borderThickness;

  return (
    <>
      <nav
        className="w-full shrink-0 z-40 md:hidden"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.08}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.04}) 100%)`,
          backdropFilter: `blur(${settings.glassBlur + 20}px) saturate(${settings.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${settings.glassBlur + 20}px) saturate(${settings.glassSaturate}%)`,
          borderBottom: `${borderThickness * 0.5}px solid rgba(255,255,255,${borderRefraction * 0.15})`,
          boxShadow: `
            0 4px 24px rgba(0,0,0,0.25),
            inset 0 -1px 0 rgba(255,255,255,${borderRefraction * 0.08})
          `,
        }}
      >
        <div className="flex items-center justify-around h-12 px-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;

            return (
              <div key={item.id} className="relative flex-1 mx-1">
                {/* 激活时的发光边框层 - 与 Sidebar 完全一致 */}
                {isActive && glowIntensity > 0 && (
                  <>
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none flow-animate"
                      style={{
                        background: getFlowGradient(flowColors, glowIntensity * 0.5),
                        filter: `blur(${glowSpread / 3}px)`,
                        opacity: glowIntensity * 0.6,
                        animationDuration: `${flowSpeed}s`,
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden flow-animate"
                      style={{
                        padding: glowThickness * 0.4,
                        background: getFlowGradient(flowColors, 0.7),
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        animationDuration: `${flowSpeed}s`,
                      }}
                    />
                  </>
                )}
                <button
                  onClick={() => onSelectView(item.id)}
                  className="relative w-full flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg text-[9px] font-medium transition-all duration-300 ease-out active:scale-[0.96] outline-none"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    background: isActive
                      ? `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.15})`
                      : 'transparent',
                    backdropFilter: isActive ? `blur(${settings.glassBlur * 0.5}px)` : 'none',
                    WebkitBackdropFilter: isActive ? `blur(${settings.glassBlur * 0.5}px)` : 'none',
                    border: isActive
                      ? `${borderThickness * 0.7}px solid rgba(255,255,255,${borderRefraction * 0.25})`
                      : '1px solid transparent',
                    boxShadow: isActive
                      ? `0 3px 12px rgba(0,0,0,0.15),
                         inset 0 ${borderThickness * 0.5}px ${borderThickness}px rgba(255,255,255,${borderRefraction * 0.15}),
                         inset 0 -${borderThickness * 0.5}px ${borderThickness}px rgba(0,0,0,${borderRefraction * 0.08}),
                         0 0 ${glowIntensity * 12}px rgba(150,200,255,${glowIntensity * 0.4})`
                      : 'none',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <i className={`${item.icon} text-sm`} />
                  <span className="text-center leading-tight whitespace-nowrap">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomTabBar;
