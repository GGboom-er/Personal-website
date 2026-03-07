# 视觉升级任务清单 (Visual Upgrade Tasks)

- [x] 1. **配置层更新**: 修改 `tailwind.config.js` 字体栈，补充所需的自定义缓动曲线 (Custom Easing)。
- [x] 2. **核心玻璃材质优化**: 在 `glass.css` 中重写强化版 Apple Liquid Glass 参数（内生高光、环境光反射深度）。
- [x] 3. **微交互系统实现**: 
  - [x] 3.1 增加磁性倾斜感 (Tilt/Hover) 与流光边框动画。
  - [x] 3.2 实现容器交错入场动画 (Staggered Animation)。
- [x] 4. **组件视觉重构**:
  - [x] 4.1 `App.tsx`: 优化全屏环境光球 (Ambient Orbs) 的混色模式 (Mix-blend-mode)，以及背景图视差过渡。
  - [x] 4.2 `Sidebar.tsx`: 实装边框的彩色流光效果。
  - [x] 4.3 `ProjectList.tsx` & `Showcase.tsx`: 应用新的卡片悬停材质深度。
- [x] 5. **审查与精简**: 根据 Desktop-only 策略清理可能残留的移动端视觉代码。

---
## 新阶段任务 (Phase 2): 深度精简与文本 UI 调试台
- [x] 6. **代码与组件深度清理**:
  - [x] 6.1 清理项目中未被使用的遗留组件 (如 UserProfileCard 等)。
  - [x] 6.2 在 `glass.css` 清理废弃动画与样式。
- [x] 7. **直观拖拽排版调试系统 (Drag-and-Drop Text Debugger) 实现**:
  - [x] 7.1 扩展 `DragEditorContext` 的支持范围和使其变为响应式 (Reactive State)。
  - [x] 7.2 完成全局编辑模式开关 (Edit Mode Toggle)，并实现一个通用的可拖拽 Wrapper (`DraggableText`)。
  - [x] 7.3 `Timeline.tsx` 的四类文本挂载 `DraggableText`，结合 `onMouseDown/Move/Up` 实现动态拖拽和滚轮放缩缩放，并提供快捷导出能力。
- [x] 8. **修复配置导出功能**:
  - [x] 8.1 修改 `HullEditorContext.tsx` 的 `exportConfig` 方法，使用 `navigator.clipboard.writeText` 将配置直接复制到剪贴板。
