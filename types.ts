export interface Project {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  icon: string;
  heroImage: string;
  tags: string[];
  stats: { label: string; value: string }[];
  section: 'Profile' | 'Projects' | 'Skills';
  bilibiliUrl?: string;
  youtubeUrl?: string;
}

export interface LayoutSettings {
  // 布局
  showcaseHeight: number;
  contentOffset: number;
  cardScale: number;
  cardImageScale: number;
  cardPadding: number;
  cardGap: number;
  cardBorderRadius: number;
  iconScale: number;
  // 卡片发光
  cardGlowIntensity: number;
  cardGlowThickness: number;
  cardGlowSpread: number;
  cardGlowColor1: string;
  cardGlowColor2: string;
  cardGlowColor3: string;
  // 字体
  titleSize: number;
  descSize: number;
  descLines: number;
  fontFamily: string;
  titleColor: string;
  descColor: string;
  textShadow: number;
  textHighlight: number;
  // 悬停效果
  hoverBlur: number;
  hoverScale: number;
  hoverOpacity: number;
  // 玻璃效果
  glassBlur: number;
  glassSaturate: number;
  glassBgOpacity: number;
  // 聚焦发光
  focusGlowIntensity: number;
  focusGlowThickness: number;
  focusGlowSpread: number;
  focusFlowSpeed: number;
  focusFlowColors: number;
  // 图片边框
  borderThickness: number;
  borderGlow: number;
  borderRefraction: number;
  imageShadow: number;
  imageEdgeBlur: number;
  // 扭曲效果
  distortionIntensity: number;
  distortionScale: number;

  // === 时间轴光效 ===
  // 光锥形状
  timelineLightOriginY: number;     // 光源起点Y偏移 (-50~50)
  timelineLightSpread: number;      // 光锥扩散角度 (5-50)
  // 光锥模糊
  timelineLightBlurX: number;       // 左右边缘模糊 (0-30)
  timelineLightBlurY: number;       // 沿光线方向模糊 (0-30)
  timelineLightSoftness: number;    // 整体柔和度 (0-100)
  // 光锥强度
  timelineLightOpacity: number;     // 整体透明度 (0-100)
  timelineLightFalloff: number;     // 衰减曲线 (0-100)
  timelineLightImpact: number;      // 对时间轴影响 (0-100)
  // 卡片发光
  timelineCardGlow: number;         // 卡片自发光强度 (0-100)
  // 流动光丝
  timelineSilkSpeed: number;        // 流动速度 (0.5-10)
  timelineSilkOpacity: number;      // 透明度 (0-100)
  timelineSilkTurbulence: number;   // 扰乱度 (0-100)
  timelineSilkStartSpread: number;  // 起点扩散 (0-100) 卡片端
  timelineSilkEndSpread: number;    // 终点扩散 (0-100) 时间轴端
  timelineSilkDistortion: number;   // 丝线扭曲强度 (0-100)
  // 颜色
  timelineColor1: string;           // 主色1
  timelineColor2: string;           // 主色2
  timelineColor3: string;           // 主色3

  // === 移动端时间轴 ===
  // 卡片布局
  mobileCardOffsetX: number;        // 卡片水平位移 (-100~100)
  mobileCardWidth: number;          // 卡片宽度 (80~200)
  mobileCardSpread: number;         // 卡片聚拢/扩散 (0=聚拢中心, 100=贴边)
  // 管道
  mobilePipeWidth: number;          // 管道宽度 (10~40)
  // 光锥
  mobileLightConeOpacity: number;   // 光锥透明度 (0~200)
  mobileLightConeStartWidth: number; // 光锥起始宽度-卡片端 (10~100)
  mobileLightConeEndWidth: number;   // 光锥结束宽度-管道端 (50~200)
  mobileLightConeBlur: number;      // 光锥模糊 (0~200)
  // 粒子
  mobileParticleScale: number;      // 粒子大小倍数 (100~500)
  mobileParticleOpacity: number;    // 粒子透明度 (0~200)
  mobileParticleSpeed: number;      // 粒子速度 (50~200)

  // === 链接卡片 ===
  timelineLinkCardOffset: number;   // 链接卡片距离主卡片的偏移 (0~200)
  mobileLinkCardOffset: number;     // 移动端链接卡片距离 (0~200)

  // === 光锥位置调整 ===
  lightConeOriginX: number;         // 光锥起点X偏移 (-100~100)
  lightConeOriginY: number;         // 光锥起点Y偏移 (-100~100)
  lightConeEndX: number;            // 光锥终点X偏移 (-100~100)
  lightConeRotation: number;        // 光锥旋转角度 (-45~45)
  lightConeWidthStart: number;      // 光锥起点宽度系数 (50~200)
  lightConeWidthEnd: number;        // 光锥终点宽度系数 (50~200)
}

// 时间轴节点数据结构
export interface TimelineNode {
  id: string;
  startYear: number;
  endYear: number;
  title: string;
  subtitle?: string;
  description?: string;           // 链接卡片显示的额外信息
  type: 'education' | 'work' | 'internship';
}