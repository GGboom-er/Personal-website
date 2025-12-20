import React from 'react';
import { LayoutSettings } from './DebugPanel';

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

  const contactMethods = [
    { icon: 'fa-brands fa-github', label: 'GitHub', value: 'github.com/yuweiming' },
    { icon: 'fa-solid fa-envelope', label: 'Email', value: 'yuweiming@gmail.com' },
    { icon: 'fa-brands fa-weixin', label: 'WeChat', value: 'yuweiming_wx' },
    { icon: 'fa-solid fa-phone', label: 'Phone', value: '17607210929' },
  ];

  return (
    <aside
      className="w-44 h-full flex flex-col hidden md:flex relative z-30 overflow-visible"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.5}) 100%)`,
        backdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
        borderRight: `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100})`,
        boxShadow: `0 8px 32px rgba(31, 38, 135, ${settings.glassShadowOpacity / 100}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100})`,
      }}
    >
      {/* User Profile */}
      <div className="px-3 py-6 mb-1">
        <div
          className="flex flex-col items-center cursor-pointer group p-3 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] relative overflow-hidden"
          style={{
            background: `rgba(255,255,255,${settings.glassBgOpacity / 100})`,
            backdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
            border: `${settings.glassThickness}px solid transparent`,
            borderImage: `linear-gradient(135deg,
              rgba(255,200,200,${settings.glassRefraction / 100 * 0.3}),
              rgba(200,255,200,${settings.glassRefraction / 100 * 0.2}),
              rgba(200,200,255,${settings.glassRefraction / 100 * 0.3})) 1`,
            boxShadow: `
              0 8px 32px rgba(31, 38, 135, ${settings.glassShadowOpacity / 100 * 1.3}),
              inset 0 ${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.2}),
              inset 0 -${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.1})
            `,
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              boxShadow: `0 4px 15px rgba(102, 126, 234, 0.4), 0 0 ${settings.imageGlassBorder / 3}px rgba(255,255,255,${settings.imageGlassBorder / 100 * 0.4}), inset 0 1px 0 rgba(255,255,255,0.3)`,
              border: `2px solid rgba(255,255,255,${settings.imageGlassBorder / 100 * 0.4})`,
              filter: `blur(${settings.imageGlassBlur * 0.3}px)`,
            }}
          >
            ME
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white truncate">余炜铭</div>
            <div className="text-[10px] text-white/50 truncate">动画技术</div>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-2 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ease-out active:scale-[0.96]"
              style={{
                background: isActive
                  ? `rgba(255,255,255,${settings.glassBgOpacity / 100 * 2})`
                  : 'transparent',
                backdropFilter: isActive ? `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)` : 'none',
                WebkitBackdropFilter: isActive ? `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)` : 'none',
                border: isActive
                  ? `${settings.glassThickness * 0.7}px solid transparent`
                  : '1px solid transparent',
                borderImage: isActive
                  ? `linear-gradient(135deg,
                      rgba(255,180,180,${settings.glassRefraction / 100 * 0.35}),
                      rgba(180,255,180,${settings.glassRefraction / 100 * 0.25}),
                      rgba(180,180,255,${settings.glassRefraction / 100 * 0.35})) 1`
                  : 'none',
                boxShadow: isActive
                  ? `0 8px 32px rgba(31, 38, 135, ${settings.glassShadowOpacity / 100}),
                     inset 0 ${settings.glassThickness * 0.5}px ${settings.glassThickness}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.2}),
                     inset 0 -${settings.glassThickness * 0.5}px ${settings.glassThickness}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.1})`
                  : 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              }}
            >
              <i className={`${item.icon} w-4 text-center`}></i>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Contact Section */}
      <div className="p-3 border-t border-white/10 overflow-visible">
        <div
          className="flex justify-around items-center rounded-xl p-1.5 overflow-visible"
          style={{
            background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.6})`,
            backdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
            border: `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.7})`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.5}), inset 0 -1px 0 rgba(0,0,0,0.05)`,
          }}
        >
          {contactMethods.map((contact, index) => (
            <div key={index} className="group relative">
              <button
                className="text-white/50 w-8 h-8 flex items-center justify-center rounded-lg
                  hover:text-white
                  active:scale-[0.92]
                  transition-all duration-200 ease-out"
                style={{
                  transition: 'all 0.2s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `rgba(255,255,255,${settings.glassBgOpacity / 100 * 1.5})`;
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,${settings.glassShadowOpacity / 100}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className={`${contact.icon} text-sm`}></i>
              </button>

              {/* Tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                  text-white text-[10px] rounded-xl
                  opacity-0 group-hover:opacity-100
                  scale-95 group-hover:scale-100
                  transition-all duration-200
                  whitespace-nowrap pointer-events-none z-50"
                style={{
                  background: `rgba(15,15,35,${0.7 + settings.glassBgOpacity / 100 * 2})`,
                  backdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
                  WebkitBackdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
                  border: `1px solid rgba(255,255,255,${settings.glassBorderOpacity / 100})`,
                  boxShadow: `0 8px 32px rgba(0,0,0,${settings.glassShadowOpacity / 100 * 2.5}), inset 0 1px 0 rgba(255,255,255,${settings.glassBorderOpacity / 100 * 0.7})`,
                }}
              >
                <span className="font-semibold text-white/70 mr-1">{contact.label}:</span>
                {contact.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;