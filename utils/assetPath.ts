// 获取正确的资源路径（兼容 GitHub Pages 部署）
export const getAssetPath = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  // 移除路径开头的 ./ 或 /
  const cleanPath = path.replace(/^\.?\//, '');
  return `${base}${cleanPath}`;
};
