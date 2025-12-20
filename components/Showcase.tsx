import React from 'react';
import { Project } from '../types';
import { LayoutSettings } from './DebugPanel';

interface ShowcaseProps {
  project: Project;
  settings: LayoutSettings;
}

const Showcase: React.FC<ShowcaseProps> = ({ project, settings }) => {
  // 计算图标尺寸 (2:3 比例)
  const iconWidth = Math.round(120 * settings.iconScale / 100);
  const iconHeight = Math.round(180 * settings.iconScale / 100);

  // 统一字体大小计算
  const fontSize = {
    title: settings.titleSize,                       // 主标题
    titleEn: Math.round(settings.titleSize * 0.45),  // 英文标题
    desc: settings.descSize,                         // 描述
    button: 12,                                      // 按钮
    statLabel: 10,                                   // 数据标签
    statValue: 14,                                   // 数据值
    tag: 10,                                         // 标签
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background - 背景大图 + 液态玻璃效果 */}
      <div className="absolute inset-0 bg-[#1c1c1e]">
        {project.heroImage && (
          <img
            key={project.id}
            src={project.heroImage}
            alt=""
            className="w-full h-full object-cover transition-all duration-500 ease-out"
            style={{
              opacity: 1,
              filter: `blur(${settings.imageGlassBlur * 0.5}px)`,
            }}
          />
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/70 via-transparent to-transparent" />
      </div>

      {/* Content - 支持上移偏移 */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end p-5 md:p-8 z-10"
        style={{ bottom: `${settings.contentOffset}%` }}
      >
        <div className="w-full flex flex-col lg:flex-row items-end justify-between gap-4">

          {/* LEFT: Icon + Info */}
          <div className="flex gap-4 items-end flex-1 min-w-0">
            {/* Icon - 2:3 比例 + 液态玻璃效果 + 边缘模糊 */}
            <div
              className="relative shrink-0 rounded-xl overflow-hidden"
              style={{
                width: iconWidth,
                height: iconHeight,
              }}
            >
              {/* 主图片 */}
              <img
                src={project.icon}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              {/* 边缘模糊遮罩层 */}
              {settings.imageGlassBlur > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backdropFilter: `blur(${settings.imageGlassBlur * 2}px)`,
                    WebkitBackdropFilter: `blur(${settings.imageGlassBlur * 2}px)`,
                    maskImage: `linear-gradient(to bottom,
                      black 0%, transparent 15%, transparent 85%, black 100%),
                      linear-gradient(to right,
                      black 0%, transparent 15%, transparent 85%, black 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom,
                      black 0%, transparent 15%, transparent 85%, black 100%),
                      linear-gradient(to right,
                      black 0%, transparent 15%, transparent 85%, black 100%)`,
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                  }}
                />
              )}
              {/* 玻璃厚度边框 - 彩色折射 */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  border: `${settings.glassThickness}px solid transparent`,
                  borderImage: `linear-gradient(135deg,
                    rgba(255,100,100,${settings.glassRefraction / 100 * 0.5}),
                    rgba(255,255,100,${settings.glassRefraction / 100 * 0.3}),
                    rgba(100,255,100,${settings.glassRefraction / 100 * 0.5}),
                    rgba(100,100,255,${settings.glassRefraction / 100 * 0.3}),
                    rgba(255,100,255,${settings.glassRefraction / 100 * 0.5})) 1`,
                  boxShadow: `
                    inset 0 ${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.3}),
                    inset 0 -${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.2}),
                    0 0 ${settings.imageGlassBorder / 2}px rgba(255,255,255,${settings.imageGlassBorder / 100 * 0.4}),
                    0 8px 32px rgba(0,0,0,${settings.imageGlassShadow / 100})
                  `,
                }}
              />
              {/* 高光层 */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(255,255,255,${settings.glassRefraction / 100 * 0.15}) 0%,
                    transparent 50%,
                    rgba(0,0,0,${settings.glassRefraction / 100 * 0.1}) 100%)`,
                }}
              />
            </div>
            {/* 文本区域 - 从顶部对齐，文字向下扩展 */}
            <div className="flex-1 min-w-0 flex flex-col justify-start" style={{ height: iconHeight }}>
              {/* 双语标题 - 顶部 */}
              <div className="shrink-0 mb-2">
                <h1
                  className="font-bold text-white tracking-tight leading-tight drop-shadow-lg"
                  style={{ fontSize: fontSize.title }}
                >
                  {project.title}
                </h1>
                {project.titleEn && (
                  <h2
                    className="text-gray-400 font-medium tracking-wide mt-0.5"
                    style={{ fontSize: fontSize.titleEn }}
                  >
                    {project.titleEn}
                  </h2>
                )}
              </div>

              {/* 描述 - 向下扩展，支持换行 */}
              <p
                className="text-gray-300 leading-relaxed opacity-90 drop-shadow-md overflow-hidden flex-1"
                style={{
                  fontSize: fontSize.desc,
                  display: '-webkit-box',
                  WebkitLineClamp: settings.descLines,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {project.description}
              </p>
            </div>
          </div>

          {/* RIGHT: Action Buttons + Stats + Tags */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* 操作按钮 - 毛玻璃风格 */}
            <div className="flex gap-2">
              {project.bilibiliUrl && (
                <a
                  href={project.bilibiliUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-[#00A1D6]/90 to-[#0088cc]/90
                    backdrop-blur-xl
                    text-white font-bold py-2.5 px-5 rounded-full
                    border border-[#00A1D6]/50
                    shadow-[0_4px_16px_rgba(0,161,214,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:from-[#00B5E5] hover:to-[#00A1D6]
                    hover:shadow-[0_6px_24px_rgba(0,161,214,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
                    hover:-translate-y-0.5
                    active:scale-[0.97] active:translate-y-0
                    active:shadow-[0_2px_8px_rgba(0,161,214,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)]
                    transition-all duration-200 ease-out
                    inline-flex items-center gap-1.5"
                  style={{ fontSize: fontSize.button }}
                >
                  <i className="fa-brands fa-bilibili"></i>
                  Bilibili
                </a>
              )}
              {project.youtubeUrl && (
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-[#FF0000]/90 to-[#cc0000]/90
                    backdrop-blur-xl
                    text-white font-bold py-2.5 px-5 rounded-full
                    border border-[#FF0000]/50
                    shadow-[0_4px_16px_rgba(255,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:from-[#ff2020] hover:to-[#FF0000]
                    hover:shadow-[0_6px_24px_rgba(255,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]
                    hover:-translate-y-0.5
                    active:scale-[0.97] active:translate-y-0
                    active:shadow-[0_2px_8px_rgba(255,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)]
                    transition-all duration-200 ease-out
                    inline-flex items-center gap-1.5"
                  style={{ fontSize: fontSize.button }}
                >
                  <i className="fa-brands fa-youtube"></i>
                  YouTube
                </a>
              )}
              {!project.bilibiliUrl && !project.youtubeUrl && (
                <button
                  className="bg-gradient-to-br from-white/90 to-white/80
                    backdrop-blur-xl
                    text-black font-bold py-2.5 px-6 rounded-full
                    border border-white/50
                    shadow-[0_4px_16px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.5)]
                    hover:from-white hover:to-white/90
                    hover:shadow-[0_6px_24px_rgba(255,255,255,0.3)]
                    hover:-translate-y-0.5
                    active:scale-[0.97]
                    transition-all duration-200 ease-out"
                  style={{ fontSize: fontSize.button }}
                >
                  VIEW
                </button>
              )}
            </div>

            {/* 数据统计 - Apple Liquid Glass + 厚度感 */}
            <div
              className="flex gap-4 px-5 py-3 rounded-2xl relative overflow-hidden"
              style={{
                background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 1.25})`,
                backdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${settings.glassBlur}px) saturate(${settings.glassSaturate}%)`,
                border: `${settings.glassThickness}px solid transparent`,
                borderImage: `linear-gradient(135deg,
                  rgba(255,200,200,${settings.glassRefraction / 100 * 0.4}),
                  rgba(200,255,200,${settings.glassRefraction / 100 * 0.3}),
                  rgba(200,200,255,${settings.glassRefraction / 100 * 0.4})) 1`,
                boxShadow: `
                  0 8px 32px rgba(31, 38, 135, ${settings.glassShadowOpacity / 100 * 1.3}),
                  inset 0 ${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.25}),
                  inset 0 -${settings.glassThickness}px ${settings.glassThickness * 2}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.15})
                `,
              }}
            >
              {project.stats.map((stat, idx) => (
                <div key={idx} className="text-center px-2 border-r border-white/20 last:border-0">
                  <div
                    className="text-white/60 uppercase font-semibold mb-0.5 tracking-wider"
                    style={{ fontSize: fontSize.statLabel }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-white font-bold"
                    style={{ fontSize: fontSize.statValue }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* 标签 - Apple Liquid Glass */}
            <div className="flex gap-1.5 flex-wrap justify-end max-w-[350px]">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="font-medium px-3 py-1 rounded-full text-white cursor-default transition-all duration-200 relative overflow-hidden"
                  style={{
                    fontSize: fontSize.tag,
                    background: `rgba(255,255,255,${settings.glassBgOpacity / 100 * 1.5})`,
                    backdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
                    WebkitBackdropFilter: `blur(${settings.glassBlur * 0.5}px) saturate(${settings.glassSaturate}%)`,
                    border: `${settings.glassThickness * 0.6}px solid transparent`,
                    borderImage: `linear-gradient(135deg,
                      rgba(255,180,180,${settings.glassRefraction / 100 * 0.35}),
                      rgba(180,255,180,${settings.glassRefraction / 100 * 0.25}),
                      rgba(180,180,255,${settings.glassRefraction / 100 * 0.35})) 1`,
                    boxShadow: `
                      0 4px 12px rgba(0,0,0,${settings.glassShadowOpacity / 100}),
                      inset 0 ${settings.glassThickness * 0.4}px ${settings.glassThickness * 0.8}px rgba(255,255,255,${settings.glassRefraction / 100 * 0.2}),
                      inset 0 -${settings.glassThickness * 0.4}px ${settings.glassThickness * 0.8}px rgba(0,0,0,${settings.glassRefraction / 100 * 0.1})
                    `,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showcase;
