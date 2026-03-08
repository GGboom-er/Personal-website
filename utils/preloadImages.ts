import { getAssetPath } from './assetPath';
import skillsData from '../data/skills.json';
import projectsData from '../data/projects.json';

const preloaded = new Set<string>();

function preload(src: string) {
  const resolved = getAssetPath(src);
  if (preloaded.has(resolved)) return;
  preloaded.add(resolved);
  const img = new Image();
  img.src = resolved;
}

function scheduleIdle(fn: () => void) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(fn, { timeout: 3000 });
  } else {
    setTimeout(fn, 200);
  }
}

/**
 * 首屏后按优先级分批预加载所有图片资源
 * 第一批（立即）：当前视图背景 + 首个项目卡片
 * 第二批（idle）：所有项目卡片 + 所有背景
 * 第三批（idle）：所有 hero 大图 + 所有 skills 图标
 */
export function preloadAllImages(activeView: string) {
  // 第一批：当前视图背景 + 首个项目卡片
  const activeBg =
    activeView === 'Skills' ? 'images/bg3.webp' :
    activeView === 'Profile' ? 'images/bg2.webp' :
    'images/bg.webp';
  preload(activeBg);

  const firstProject = projectsData.projects[0];
  if (firstProject?.icon) preload(firstProject.icon);

  // 第二批：所有项目卡片 + 剩余背景
  scheduleIdle(() => {
    ['images/bg.webp', 'images/bg2.webp', 'images/bg3.webp'].forEach(preload);

    projectsData.projects.forEach(p => {
      if (p.icon) preload(p.icon);
    });
  });

  // 第三批：hero 大图 + skills 图标
  scheduleIdle(() => {
    projectsData.projects.forEach(p => {
      if (p.heroImage) preload(p.heroImage);
    });

    skillsData.nodes.forEach(n => {
      if ('image' in n && n.image) preload(n.image as string);
    });
  });
}
