import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDragEditor, ElementLayout, NodeLayoutConfig } from '../../contexts/DragEditorContext';

interface DraggableLayoutProps {
    nodeId: string;
    elementType: keyof NodeLayoutConfig;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    isMobile: boolean;
}

const DraggableLayout: React.FC<DraggableLayoutProps> = ({
    nodeId,
    elementType,
    children,
    className = '',
    style,
    isMobile,
}) => {
    const { isEditMode, getElementLayout, updateElementLayout } = useDragEditor();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 拖拽状态
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });
    const [currentOffset, setCurrentOffset] = useState({ x: 0, y: 0 });

    const layout = getElementLayout(nodeId, elementType, isMobile);

    // 初始化内部偏移量追踪
    useEffect(() => {
        if (!isDragging) {
            setCurrentOffset({ x: layout.offsetX, y: layout.offsetY });
        }
    }, [layout.offsetX, layout.offsetY, isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditMode) return;
        e.preventDefault(); // 防止原生文本选择或原生图片拖拽干扰
        e.stopPropagation();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialOffsetX: currentOffset.x,
            initialOffsetY: currentOffset.y,
        };
    }, [isEditMode, currentOffset]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !isEditMode) return;

        // 取消原生默认选择
        e.preventDefault();

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        setCurrentOffset({
            x: dragStartRef.current.initialOffsetX + dx,
            y: dragStartRef.current.initialOffsetY + dy,
        });
    }, [isDragging, isEditMode]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging || !isEditMode) return;
        setIsDragging(false);
        updateElementLayout(nodeId, elementType, isMobile, {
            offsetX: currentOffset.x,
            offsetY: currentOffset.y
        });
    }, [isDragging, isEditMode, nodeId, elementType, isMobile, currentOffset, updateElementLayout]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!isEditMode) return;
        e.stopPropagation();

        // 动态调整缩放
        const dt = e.deltaY < 0 ? 0.05 : -0.05;
        const newScale = Math.max(0.1, Math.min(3, layout.scale + dt));

        updateElementLayout(nodeId, elementType, isMobile, {
            scale: newScale
        });
    }, [isEditMode, layout.scale, nodeId, elementType, isMobile, updateElementLayout]);

    // 全局事件绑定
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // 非编辑模式下的基准渲染
    if (!isEditMode) {
        return (
            <div
                className={className}
                style={{
                    ...style,
                    transform: `${style?.transform || ''} translate(${layout.offsetX}px, ${layout.offsetY}px) scale(${layout.scale})`.trim(),
                }}
                onWheel={handleWheel} // 保持对滑轮绑定但不响应除非进入模式
            >
                {children}
            </div>
        );
    }

    // 编辑模式渲染：增加悬浮框与编辑网格提示
    return (
        <div
            ref={wrapperRef}
            className={`${className} cursor-move select-none`}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            style={{
                ...style,
                transform: `${style?.transform || ''} translate(${currentOffset.x}px, ${currentOffset.y}px) scale(${layout.scale})`.trim(),
                zIndex: isDragging ? 9999 : (style?.zIndex || 10),
                border: '1px dashed rgba(168,85,247,0.5)',
                background: 'rgba(168,85,247,0.05)',
                boxShadow: isDragging ? '0 0 15px rgba(168,85,247,0.3)' : 'none',
                transition: isDragging ? 'none' : 'transform 0.1s ease',
            }}
        >
            {/* 提示工具层 */}
            <div
                className="absolute -top-6 left-0 text-[10px] hidden group-hover:block"
                style={{ color: 'rgba(168,85,247,1)', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
                {elementType}: ({Math.round(currentOffset.x)}, {Math.round(currentOffset.y)}) s:{layout.scale.toFixed(2)}
            </div>
            {children}
        </div>
    );
};

export default DraggableLayout;
