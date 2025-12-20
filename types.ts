export interface Project {
  id: string;
  title: string;           // 中文标题（卡片显示）
  titleEn?: string;        // 英文标题（详情显示）
  description: string;
  icon: string;            // 卡片图标 (2:3比例)
  heroImage: string;       // 详情背景大图
  tags: string[];          // 标签
  stats: {                 // 数据统计 (播放量、画风、评分等)
    label: string;
    value: string;
  }[];
  section: 'Profile' | 'Projects' | 'Skills';  // 所属分区
  bilibiliUrl?: string;    // Bilibili 播放链接
  youtubeUrl?: string;     // YouTube 播放链接
}