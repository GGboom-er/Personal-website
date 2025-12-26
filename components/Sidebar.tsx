import React from 'react';
import { LayoutSettings } from '../types';
import { getFlowGradient } from './glass';

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

  // 联系方式配置 - 在这里编辑您的联系信息
  // url: 点击跳转的链接 (GitHub用https://github.com/用户名, Email用mailto:邮箱, Phone用tel:电话号码)
  // value: 显示在tooltip中的值
  // copyable: 设为true则点击时复制value到剪贴板 (适用于微信号等)
  const contactMethods = [
    {
      icon: 'fa-brands fa-github',
      label: 'GitHub',
      value: 'GGboom-er',
      url: 'https://github.com/GGboom-er'
    },
    {
      icon: 'fa-solid fa-envelope',
      label: 'Email',
      value: 'ggbommer@gmail.com',
      url: 'mailto:ggbommer@gmail.com'
    },
    {
      icon: 'fa-brands fa-weixin',
      label: 'WeChat',
      value: 'Y_zhao15',
      copyable: true
    },
    {
      icon: 'fa-solid fa-phone',
      label: 'Phone',
      value: '17607210929',
      url: 'tel:17607210929'
    },
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
      {/* User Profile */}
      <div className="px-2 py-3 mb-1">
        <div
          className="flex flex-col items-center cursor-pointer group p-2.5 rounded-xl transition-all duration-300 ease-out active:scale-[0.98] relative overflow-hidden"
          style={{
            background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.08})`,
            backdropFilter: `blur(${settings.glassBlur * 0.5}px)`,
            WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px)`,
            border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
            boxShadow: `
              0 6px 24px rgba(0,0,0,0.2),
              inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15}),
              inset 0 -${borderThickness}px ${borderThickness * 2}px rgba(0,0,0,${borderRefraction * 0.08})
            `,
          }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all duration-300 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              boxShadow: `0 3px 12px rgba(102, 126, 234, 0.4), 0 0 ${settings.borderGlow / 4}px rgba(255,255,255,${settings.borderGlow / 100 * 0.4}), inset 0 1px 0 rgba(255,255,255,0.3)`,
              border: `1.5px solid rgba(255,255,255,${settings.borderGlow / 100 * 0.4})`,
            }}
          >
            ME
          </div>
          <div className="text-center w-full min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight">余炜铭</div>
            <div className="text-[9px] text-white/50 leading-tight mt-0.5">动画技术</div>
          </div>
        </div>
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

      {/* Contact Section */}
      <div className="p-2 border-t border-white/10 overflow-visible">
        <div
          className="grid grid-cols-2 gap-1 rounded-lg p-1 overflow-visible"
          style={{
            background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.05})`,
            backdropFilter: `blur(${settings.glassBlur * 0.5}px)`,
            WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px)`,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {contactMethods.map((contact, index) => {
            const handleClick = () => {
              if (contact.copyable) {
                navigator.clipboard.writeText(contact.value);
              }
            };

            const buttonClass = `text-white/50 w-full h-7 flex items-center justify-center rounded-md
              hover:text-white hover:bg-white/10
              active:scale-[0.92]
              transition-all duration-200 ease-out cursor-pointer`;

            return (
              <div key={index} className="group relative">
                {contact.url ? (
                  <a
                    href={contact.url}
                    target={contact.url.startsWith('http') ? '_blank' : undefined}
                    rel={contact.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={buttonClass}
                  >
                    <i className={`${contact.icon} text-xs`}></i>
                  </a>
                ) : (
                  <button onClick={handleClick} className={buttonClass}>
                    <i className={`${contact.icon} text-xs`}></i>
                  </button>
                )}

                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5
                    text-white text-[9px] rounded-lg
                    opacity-0 group-hover:opacity-100
                    scale-95 group-hover:scale-100
                    transition-all duration-200
                    whitespace-nowrap pointer-events-none z-50
                    bg-black/70 backdrop-blur-xl border border-white/15"
                  style={{
                    boxShadow: `0 6px 24px rgba(0,0,0,0.4)`,
                  }}
                >
                  <span className="font-semibold text-white/70 mr-1">{contact.label}:</span>
                  {contact.value}
                  {contact.copyable && <span className="text-white/40 ml-1">(点击复制)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
