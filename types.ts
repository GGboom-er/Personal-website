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
  autoAlign: boolean;             // 是否自动对齐卡片与时间轴
  sourceAnchor: 'bottom' | 'top' | 'center'; // 光束起点锚点
  showGizmos: boolean;            // 是否显示交互手柄

  // === NEW: Timeline Visuals ===
  timelineCardGradientStart: number; // Alpha % (0-100)
  timelineCardGradientEnd: number;   // Alpha % (0-100)
  timelineCardBorderGlow: number;    // Glow intensity % (0-100)

  // === NEW: Lumina Particles ===
  luminaParticleCount: number;    // Max particles (0-500)
  luminaSpawnRate: number;        // Spawn chance % (0-100)
  luminaSpeedBase: number;        // Base speed * 100 (0-200)
  luminaSpeedVar: number;         // Variance multiplier * 100 (0-500)
  luminaSpiralFreq: number;       // Frequency * 1000 (0-200)
  luminaSpiralAmp: number;        // Max Amplitude px (0-100)
  luminaGlowSize: number;         // Glow size multiplier * 10 (0-100)
  luminaRippleChance: number;     // Interaction chance % (0-100)
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
  overrides?: Partial<LayoutSettings>;
}