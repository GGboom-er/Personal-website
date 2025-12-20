import { Project } from './types';

export const PROJECTS: Project[] = [
  // PROJECTS SECTION - ANIMATION WORKS
  {
    id: '1',
    title: '两不疑 第一季',
    category: '3D Anime',
    role: 'Technical Director',
    description: '由纸飞机动画制作，改编自同名人气漫画。本项目确立了独特的“三渲二”NPR 渲染流程，在保留漫画笔触的同时实现了 3D 动画的流畅运镜，是国漫在宫廷恋爱喜剧题材上的技术与艺术标杆。',
    // Vibe: Ancient Chinese Palace, Bright, Romantic
    icon: 'https://images.unsplash.com/photo-1523293836414-9042d2a15327?q=80&w=600&auto=format&fit=crop', 
    heroImage: 'https://images.unsplash.com/photo-1599707367072-cd6ad66aa1a8?q=80&w=2560&auto=format&fit=crop', 
    tags: ['Paper Plane', 'Comedy', 'NPR Rendering'],
    stats: [
      { label: 'Year', value: '2021' },
      { label: 'Score', value: '9.6' },
      { label: 'Views', value: '4.3亿' }
    ],
    section: 'Projects'
  },
  {
    id: '2',
    title: '两不疑 第二季',
    category: '3D Anime',
    role: 'Visual Supervisor',
    description: '延续第一季的高口碑，第二季在渲染引擎上进行了深度升级。重点强化了宫廷夜景的光影氛围与服饰材质的细腻度，剧情深入至家国权谋，视觉表现力更加深沉大气。',
    // Vibe: Darker, Red Lanterns, Court Politics
    icon: 'https://images.unsplash.com/photo-1549557404-5e5898863c0a?q=80&w=600&auto=format&fit=crop', 
    heroImage: 'https://images.unsplash.com/photo-1536254795328-989508544806?q=80&w=2560&auto=format&fit=crop', 
    tags: ['Sequel', 'Romance', 'Politics'],
    stats: [
      { label: 'Year', value: '2023' },
      { label: 'Status', value: 'Hot' },
      { label: 'Views', value: '1.5亿' }
    ],
    section: 'Projects'
  },
  {
    id: '3',
    title: 'LOL 2021 Worlds',
    category: 'Game Cinematic',
    role: 'Compositing Lead',
    description: 'S11 全球总决赛主题曲《Burn It All Down》。由绘梦动画(Haoliners)承制，采用高精度的二维转描与三维场景合成技术，视觉冲击力极强。',
    // Vibe: Esports, Neon, Cyber, Competitive
    icon: 'https://images.unsplash.com/photo-1563207153-f403bf289096?q=80&w=600&auto=format&fit=crop', 
    heroImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2560&auto=format&fit=crop', 
    tags: ['Riot Games', 'Haoliners', 'MV'],
    stats: [
      { label: 'Year', value: '2021' },
      { label: 'Platform', value: 'Global' },
      { label: 'Views', value: '100M+' }
    ],
    section: 'Projects'
  },
  {
    id: '4',
    title: '凸变英雄 X',
    category: 'Hybrid Animation',
    role: 'Art Director',
    description: '导演李豪凌的野心之作。探索了二维手绘与写实化三维场景的极致融合（2D+3D Hybrid），在赛博朋克风格的雨夜都市中呈现出独特的“实感”美学。',
    // Vibe: Cyberpunk City, Rain, Blue/Purple Neon
    icon: 'https://images.unsplash.com/photo-1620023424422-38e9a6502213?q=80&w=600&auto=format&fit=crop', 
    heroImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2560&auto=format&fit=crop', 
    tags: ['Bilibili', 'Sakuga', 'Sci-Fi'],
    stats: [
      { label: 'Year', value: '2024' },
      { label: 'Hype', value: 'S-Tier' },
      { label: 'PV', value: '1500万' }
    ],
    section: 'Projects'
  },
  {
    id: '5',
    title: '喵十一 (Meow 11)',
    category: 'Indie Animation',
    role: 'Stylization Dev',
    description: '荣获金海豚奖最佳系列动画银奖。作品大胆尝试了水墨笔触与三维光影的结合，塑造了一个快意恩仇的猫咪武侠世界。',
    // Vibe: Cat, Ink Wash, Monochrome, Artistic
    icon: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=600&auto=format&fit=crop', 
    heroImage: 'https://images.unsplash.com/photo-1505995433366-e12047f3f144?q=80&w=2560&auto=format&fit=crop', 
    tags: ['Wuxia', 'Ink Style', 'Awarded'],
    stats: [
      { label: 'Year', value: '2022' },
      { label: 'Score', value: '9.8' },
      { label: 'Award', value: 'Silver' }
    ],
    section: 'Projects'
  },

  // PROFILE SECTION
  {
    id: 'p1',
    title: 'Senior Animation Engineer',
    category: 'Experience',
    role: '2020 - Present',
    description: '专注于动画渲染管线开发与视觉特效合成。在多个S级动画项目中担任技术美术负责人，致力于提升国产动画的工业化水准与视觉表现力。',
    icon: 'https://images.unsplash.com/photo-1531297461136-82lw9z28y70d?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop',
    tags: ['Pipeline', 'Unreal', 'Blender'],
    stats: [
      { label: 'Years', value: '4+' },
      { label: 'Projects', value: '10+' },
      { label: 'Location', value: 'Shanghai' }
    ],
    section: 'Profile'
  },
  {
    id: 'p2',
    title: 'Digital Arts Academy',
    category: 'Education',
    role: '2016 - 2020',
    description: '数字媒体技术学士学位。主修计算机图形学与三维动画制作，毕业设计获得校级优秀奖。',
    icon: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000&auto=format&fit=crop',
    tags: ['CG', 'BFA', 'Top 5%'],
    stats: [
      { label: 'GPA', value: '3.8' },
      { label: 'Degree', value: 'BFA' },
      { label: 'Grad', value: '2020' }
    ],
    section: 'Profile'
  },
  {
    id: 'p3',
    title: 'Open Source Tools',
    category: 'Community',
    role: 'Contributor',
    description: '为 Blender 和 Three.js 社区贡献多个渲染优化插件和材质库。',
    icon: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2000&auto=format&fit=crop',
    tags: ['Blender', 'Python', 'Shaders'],
    stats: [
      { label: 'Plugins', value: '5' },
      { label: 'Stars', value: '800+' },
      { label: 'Users', value: '2k+' }
    ],
    section: 'Profile'
  },

  // SKILLS SECTION
  {
    id: 's1',
    title: 'Real-time Rendering',
    category: 'Tech Art',
    role: 'Expert',
    description: '精通 UE5 Lumen/Nanite 技术栈及 Unity HDRP 管线。擅长编写 HLSL/GLSL 自定义着色器以实现独特的美术风格。',
    icon: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1616440347437-b1c73416ef12?q=80&w=2000&auto=format&fit=crop',
    tags: ['UE5', 'Unity', 'Shader'],
    stats: [
      { label: 'Exp', value: '5 Years' },
      { label: 'Level', value: 'Expert' },
      { label: 'Shaders', value: '100+' }
    ],
    section: 'Skills'
  },
  {
    id: 's2',
    title: 'Compositing & VFX',
    category: 'Post-Prod',
    role: 'Advanced',
    description: '熟练使用 Nuke 和 After Effects 进行后期合成、调色及特效制作。能够处理复杂的图层混合与光影匹配。',
    icon: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?q=80&w=2000&auto=format&fit=crop',
    tags: ['Nuke', 'AE', 'Particles'],
    stats: [
      { label: 'Exp', value: '4 Years' },
      { label: 'Tool', value: 'Nuke' },
      { label: 'Shots', value: '500+' }
    ],
    section: 'Skills'
  },
  {
    id: 's3',
    title: '3D Pipeline Dev',
    category: 'Development',
    role: 'Proficient',
    description: '使用 Python 开发 DCC 软件（Maya/Blender）插件，优化资产导入导出及自动化渲染流程，提升团队协作效率。',
    icon: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2000&auto=format&fit=crop',
    tags: ['Python', 'Maya', 'API'],
    stats: [
      { label: 'Exp', value: '3 Years' },
      { label: 'Lang', value: 'Python' },
      { label: 'Tools', value: '10+' }
    ],
    section: 'Skills'
  },
  {
    id: 's4',
    title: 'AI Gen & Style Transfer',
    category: 'Emerging',
    role: 'Explorer',
    description: '探索 Stable Diffusion 与 Midjourney 在动画前期概念设计与纹理生成中的应用，研究 AI 辅助的风格化滤镜方案。',
    icon: 'https://images.unsplash.com/photo-1684369175836-829d67b8d775?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop',
    tags: ['SD', 'LoRA', 'ControlNet'],
    stats: [
      { label: 'Exp', value: '2 Years' },
      { label: 'Focus', value: 'Concept' },
      { label: 'Models', value: '50+' }
    ],
    section: 'Skills'
  },
  {
    id: 's5',
    title: 'Motion Graphics',
    category: 'Design',
    role: 'Intermediate',
    description: '具备优秀的动态图形设计能力，能够制作高质量的片头、UI 动效及宣传 PV。',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop',
    tags: ['C4D', 'Motion', 'Typography'],
    stats: [
      { label: 'Exp', value: '3 Years' },
      { label: 'Tool', value: 'C4D' },
      { label: 'Works', value: '30+' }
    ],
    section: 'Skills'
  }
];