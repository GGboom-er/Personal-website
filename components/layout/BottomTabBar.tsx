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
        className="w-full shrink-0 z-40"
        style={{
          background: `linear-gradient(to bottom, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.75) 100%)`,
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
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 active:scale-95 outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* 激活时的发光边框层 - 与 Sidebar 保持一致 */}
                {isActive && glowIntensity > 0 && (
                  <>
                    {/* 外发光 - 匹配按钮边界 */}
                    <div
                      className="absolute rounded-xl pointer-events-none flow-animate"
                      style={{
                        inset: '4px 8px',
                        background: getFlowGradient(flowColors, glowIntensity * 0.5),
                        filter: `blur(${glowSpread / 3}px)`,
                        opacity: glowIntensity * 0.6,
                        animationDuration: `${flowSpeed}s`,
                      }}
                    />
                    {/* 流光边框 - 匹配按钮边界 */}
                    <div
                      className="absolute rounded-xl pointer-events-none overflow-hidden flow-animate"
                      style={{
                        inset: '4px 8px',
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

                {/* 按钮内容 */}
                <div
                  className="relative flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-300"
                  style={{
                    background: isActive
                      ? `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.12})`
                      : 'transparent',
                    backdropFilter: isActive ? `blur(${settings.glassBlur * 0.5}px)` : 'none',
                    WebkitBackdropFilter: isActive ? `blur(${settings.glassBlur * 0.5}px)` : 'none',
                    border: '1px solid transparent',
                    boxShadow: isActive
                      ? `0 2px 10px rgba(0,0,0,0.2),
                         inset 0 ${borderThickness * 0.3}px ${borderThickness * 0.6}px rgba(255,255,255,${borderRefraction * 0.12}),
                         0 0 ${glowIntensity * 10}px rgba(150,200,255,${glowIntensity * 0.35})`
                      : 'none',
                  }}
                >
                  <i
                    className={`${item.icon} text-base transition-all duration-300`}
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      textShadow: isActive
                        ? `0 0 ${glowIntensity * 8}px rgba(150,200,255,${glowIntensity * 0.5})`
                        : 'none',
                    }}
                  />
                  <span
                    className="text-[9px] font-medium mt-0.5 transition-all duration-300"
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomTabBar;
