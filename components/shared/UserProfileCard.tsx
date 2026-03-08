import React from 'react';
import { LayoutSettings } from '../../types';
import { getAssetPath } from '../../utils/assetPath';

interface UserProfileCardProps {
  settings: LayoutSettings;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  children?: React.ReactNode;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ settings, className = '', layout = 'vertical', children }) => {
  const borderThickness = settings.borderThickness;
  const borderRefraction = settings.borderRefraction / 100;
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={`flex ${isHorizontal ? 'flex-row text-left gap-5 items-center' : 'flex-col items-center text-center'} p-4.5 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.10}) 0%, rgba(255,255,255,${settings.glassBgOpacity / 100 * 0.04}) 100%)`,
        border: `${borderThickness}px solid rgba(255,255,255,${borderRefraction * 0.2})`,
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.25),
          inset 0 ${borderThickness}px ${borderThickness * 2}px rgba(255,255,255,${borderRefraction * 0.15})
        `,
      }}
    >
      {/* 头像区域 */}
      <div
        className={`${isHorizontal ? 'w-20 h-20' : 'w-14 h-14'} rounded-full flex items-center justify-center transition-all duration-300 shrink-0 overflow-hidden`}
        style={{
          boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 ${settings.borderGlow / 4}px rgba(255,255,255,${settings.borderGlow / 100 * 0.4})`,
          border: `2px solid rgba(255,255,255,${settings.borderGlow / 100 * 0.4})`,
        }}
      >
        <img
          src={getAssetPath('images/A.webp')}
          alt="ME"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 内容区域 */}
      <div className={`flex-1 min-w-0 ${isHorizontal ? 'flex flex-col justify-center gap-2' : ''}`}>
        {/* 姓名与职位 */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="text-[17px] font-bold text-white leading-tight whitespace-nowrap">余炜铭</div>
          <div className="text-[12px] text-white/50 leading-tight mt-1 whitespace-nowrap">Rigger & TD</div>
        </div>

        {/* 联系方式 (children) */}
        {children && (
          <div className={`${isHorizontal ? 'w-full mt-1' : 'mt-3 pt-3 border-t border-white/5 w-full'}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;
