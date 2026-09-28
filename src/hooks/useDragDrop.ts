// src/hooks/useDragDrop.ts
import { useCallback, useRef, useState } from 'react';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export interface DropZoneBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Options<T extends { id: number }> {
    onDrop: (item: T) => void;
    ghostOffset?: { x: number; y: number };
}

export function useDragDrop<T extends { id: number }>({
    onDrop,
    ghostOffset = { x: 48, y: 48 },
}: Options<T>) {
    const [dragging, setDragging] = useState<T | null>(null);

    // Ref — актуальный dragging для колбэков, которые «застывают» на первом рендере
    const draggingRef = useRef<T | null>(null);

    // Ref — актуальный onDrop (родитель может передавать новую функцию)
    const onDropRef = useRef(onDrop);
    onDropRef.current = onDrop;

    const ghostX = useSharedValue(0);
    const ghostY = useSharedValue(0);
    const dropZoneBounds = useSharedValue<DropZoneBounds | null>(null);

    const startDrag = useCallback(
        (item: T, pageX: number, pageY: number) => {
            draggingRef.current = item;
            setDragging(item);
            ghostX.value = pageX - ghostOffset.x;
            ghostY.value = pageY - ghostOffset.y;
        },
        [ghostX, ghostY, ghostOffset.x, ghostOffset.y]
    );

    const moveDrag = useCallback(
        (pageX: number, pageY: number) => {
            ghostX.value = pageX - ghostOffset.x;
            ghostY.value = pageY - ghostOffset.y;
        },
        [ghostX, ghostY, ghostOffset.x, ghostOffset.y]
    );

    const endDrag = useCallback(
        (pageX: number, pageY: number) => {
            const bounds = dropZoneBounds.value;
            const item = draggingRef.current;

            if (item && bounds) {
                const inside =
                    pageX >= bounds.x &&
                    pageX <= bounds.x + bounds.width &&
                    pageY >= bounds.y &&
                    pageY <= bounds.y + bounds.height;

                if (inside) onDropRef.current(item);
            }

            draggingRef.current = null;
            setDragging(null);
        },
        [dropZoneBounds]
    );

    const cancelDrag = useCallback(() => {
        draggingRef.current = null;
        setDragging(null);
    }, []);

    const registerDropZone = useCallback(
        (bounds: DropZoneBounds) => {
            dropZoneBounds.value = bounds;
        },
        [dropZoneBounds]
    );

    const ghostStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: ghostX.value }, { translateY: ghostY.value }],
    }));

    return {
        dragging,
        ghostStyle,
        startDrag,
        moveDrag,
        endDrag,
        cancelDrag,
        registerDropZone,
    };
}
