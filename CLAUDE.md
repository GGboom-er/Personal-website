# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 核心规则（继承全局 CLAUDE.md）

- 中文强制：所有注释、文档、UI 文案 100% 中文；专业术语首次出现附中英对照（例：代码分割 Code Splitting），重复出现可省略
- 开发三原则：简洁优先(Simplicity First)、根因修复(No Laziness)、最小影响(Minimal Impact)
- 零幻觉强制：代码更改前必须审查全量相关代码，无验证内容禁止输出
- 数据安全：操作前备份，异常时完整回滚
- 闭环沉淀：任务结束/收到修正后，按 `[触发条件]→[根因]→[正确方案]→[避坑规则]` 格式写入 `tasks/lessons.md`，单条不超 50 字

## 常用命令

```bash
npm run dev        # 启动 Vite 开发服务器（端口 3000）
npm run build      # 生产构建（输出至 dist/）
npm run preview    # 本地预览生产构建
```

无测试框架、无 Lint 工具。

## 部署

推送 `main` 分支触发 GitHub Actions（`.github/workflows/deploy.yml`），执行 `npm ci && npm run build`，将 `dist/` 部署至 GitHub Pages。Vite `base` 为 `./`（相对路径），兼容子目录与自定义域名部署。

## 架构概览

React 19 + Vite + TypeScript + Tailwind CSS 的纯前端单页作品集网站，无后端、无路由库。

### 视图系统（View System）

`App.tsx` 是根布局，通过 `activeView` 状态切换三个视图：

- **Projects** — `Showcase`（英雄展示区）+ `ProjectList`（横向卡片列表），数据来自 `data/projects.json`
- **Profile** — `Timeline` 组件（时间轴），数据来自 `data/timeline.json`
- **Skills** — `SkillsGraph` 组件（技能图谱），数据来自 `data/skills.json`

延迟挂载模式：视图首次访问时挂载，之后常驻 DOM 通过 `display:none` 切换。Timeline 和 SkillsGraph 使用 `React.lazy` 代码分割。

### 布局设置系统（Layout Settings）

`LayoutSettings`（定义于 `types.ts`，50+ 参数）控制几乎所有视觉参数 — 卡片尺寸、玻璃模糊、发光颜色、粒子数量、时间轴偏移等。通过 `GlassSettingsContext` 提供，支持按节点覆盖（`nodeOverrides`）。调试时可在控制台调用 `window.__GET_CONFIG__()` 导出当前配置。

### 响应式设计（Responsive）

`useBreakpoint` hook（rAF 节流）提供断点状态。桌面端显示 `Sidebar`，移动端显示 `BottomTabBar`。断点：xs(0)、sm(480)、md(768)、lg(1024)、xl(1280)、2xl(1920)。`isMobile` = xs 或 sm。

### 关键目录

- `components/glass/` — GlassCard、GlowBorder、ImageFrame（Apple 液态玻璃 Liquid Glass 风格 UI 基元）
- `components/lumina/` — LuminaHull（粒子动画系统）
- `components/shared/` — ContactLinks、UserProfileCard
- `components/layout/` — BottomTabBar（移动端导航）
- `contexts/` — GlassSettingsContext（布局参数）、DragEditorContext（拖拽交互）、HullEditorContext
- `data/` — JSON 数据文件（projects、timeline、skills、hulls）
- `shaders/` — GLSL 着色器（粒子/体积光束效果）
- `styles/` — `tailwind.css`（Tailwind 指令）、`glass.css`（玻璃面板效果，共享 CSS 动画）
- `utils/` — `assetPath.ts`（Vite base 感知路径）、`preloadImages.ts`、`seededRandom.ts`
- `tasks/` — `todo.md`（任务清单）、`lessons.md`（经验沉淀）

### 性能模式

- `index.html` 中的初始占位屏（React 首帧绘制后通过双 rAF 移除）
- 字体异步加载（`media="print"` 技巧）
- 关键图片 preload，非关键图片 prefetch
- `vite-plugin-compression` gzip 预压缩，`lightningcss` CSS 压缩
- 手动分包：vendor（react、react-dom）独立 chunk
- 共享 CSS class + CSS 变量替代 per-instance `<style>` 注入

### 路径别名（Path Alias）

`@/*` 映射至项目根目录（`tsconfig.json` 和 `vite.config.ts` 同步配置）。

## 内容编辑

项目/时间轴/技能数据在 `data/*.json` 中维护，修改 JSON 即可，无需改代码。`Project` 类型定义在 `types.ts`，每个项目的 `section` 字段（`'Profile' | 'Projects' | 'Skills'`）决定其所属视图。

## 任务管理

- `tasks/todo.md` — 任务清单，与原生任务系统双向同步
- `tasks/lessons.md` — 经验沉淀，严格按 `[触发条件]→[根因]→[正确方案]` 格式记录
