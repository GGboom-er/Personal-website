import React from 'react';
import { LayoutSettings } from '../../types';

interface ContactLinksProps {
  settings: LayoutSettings;
  className?: string;
  layout?: 'grid' | 'row';
  minimal?: boolean;
}

const ContactLinks: React.FC<ContactLinksProps> = ({ settings, className = '', layout = 'grid', minimal = false }) => {
  const contactMethods = [
    { icon: 'fa-brands fa-github', label: 'GitHub', value: 'GGboom-er', url: 'https://github.com/GGboom-er' },
    { icon: 'fa-solid fa-envelope', label: 'Email', value: 'ggbommer@gmail.com', url: 'mailto:ggbommer@gmail.com' },
    { icon: 'fa-brands fa-weixin', label: 'WeChat', value: 'Y_zhao15', copyable: true },
    { icon: 'fa-solid fa-phone', label: 'Phone', value: '17607210929', url: 'tel:17607210929' },
  ];

  return (
    <div
      className={`${layout === 'grid' ? 'grid grid-cols-2' : 'flex flex-row justify-around items-center'} gap-x-3 gap-y-1.5 ${minimal ? '' : 'rounded-lg p-1'} ${className}`}
      style={minimal ? {} : {
        background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.06}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.02}) 100%)`,
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

        const buttonClass = `text-white/40 flex items-center gap-2
          hover:text-white transition-all duration-200 ease-out cursor-pointer`;

        const content = (
          <>
            <i className={`${contact.icon} ${minimal ? 'text-[10px]' : 'text-xs'}`}></i>
            {minimal && <span className="text-[8px] opacity-60 truncate max-w-[110px]">{contact.value}</span>}
          </>
        );

        return (
          <div key={index} className="group relative flex items-center">
            {contact.url ? (
              <a
                href={contact.url}
                target={contact.url.startsWith('http') ? '_blank' : undefined}
                rel={contact.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={buttonClass}
              >
                {content}
              </a>
            ) : (
              <button onClick={handleClick} className={buttonClass}>
                {content}
              </button>
            )}

            {/* Tooltip (only show if not minimal, or maybe always? keeping it for now) */}
            {!minimal && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5
                  text-white text-[9px] rounded-lg
                  opacity-0 group-hover:opacity-100
                  scale-95 group-hover:scale-100
                  transition-all duration-200
                  whitespace-nowrap pointer-events-none z-50
                  bg-black/85 border border-white/15"
                style={{
                  boxShadow: `0 6px 24px rgba(0,0,0,0.4)`,
                }}
              >
                <span className="font-semibold text-white/70 mr-1">{contact.label}:</span>
                {contact.value}
                {contact.copyable && <span className="text-white/40 ml-1">(点击复制)</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ContactLinks;