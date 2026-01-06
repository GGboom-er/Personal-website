import React from 'react';
import { LayoutSettings } from '../types';
import { getFlowGradient } from './glass';
import UserProfileCard from './shared/UserProfileCard';
import ContactLinks from './shared/ContactLinks';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  settings: LayoutSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView, settings }) => {
  const menuItems = [
    { icon: 'fa-regular fa-id-card', label: '个人信息', id: 'Profile' },
    { icon: 'fa-solid fa-layer-group', label: '参与作品', id: 'Projects' },
    { icon: 'fa-solid fa-chart-pie', label: '技能分析', id: 'Skills' },
  ];

  // 边框和发光参数
  const borderThickness = settings.borderThickness;
  const borderRefraction = settings.borderRefraction / 100;
  const glowIntensity = settings.focusGlowIntensity / 100;
  const glowThickness = settings.focusGlowThickness;
  const glowSpread = settings.focusGlowSpread;
  const flowSpeed = settings.focusFlowSpeed;
  const flowColors = settings.focusFlowColors;

  return (
    <>
      <aside
        className="w-24 h-full flex flex-col hidden md:flex relative z-30 overflow-visible"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.08}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.04}) 100%)`,
          backdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
          borderRight: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: `4px 0 24px rgba(0,0,0,0.15), inset 1px 0 0 rgba(255,255,255,0.08)`,
        }}
      >
      {/* User Profile - 使用共享组件 */}
      <div className="px-2 py-3 mb-1">
        <UserProfileCard settings={settings} />
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-1.5 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative">
              {/* 激活时的发光边框层 - 与按钮边界完全匹配 */}
              {isActive && glowIntensity > 0 && (
                <>
                  {/* 外发光 - 匹配按钮边界 */}
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none flow-animate"
                    style={{
                      background: getFlowGradient(flowColors, glowIntensity * 0.5),
                      filter: `blur(${glowSpread / 3}px)`,
                      opacity: glowIntensity * 0.6,
                      animationDuration: `${flowSpeed}s`,
                    }}
                  />
                  {/* 流光边框 - 匹配按钮边界 */}
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
                className="relative w-full flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg text-[9px] font-medium transition-all duration-300 ease-out active:scale-[0.96]"
                style={{
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
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                }}
              >
                <i className={`${item.icon} text-sm`}></i>
                <span className="text-center leading-tight whitespace-nowrap">{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Contact Section - 使用共享组件 */}
      <div className="p-2 border-t border-white/10 overflow-visible">
        <ContactLinks settings={settings} />
      </div>
    </aside>
    </>
  );
};

export default Sidebar;