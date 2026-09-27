// src/hooks/useDragDrop.ts
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';

export interface DropZoneBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Options<T> {
    onDrop: (item: T) => void;
}

export function useDragDrop<T>({ onDrop }: Options<T>) {
    const [dragging, setDragging] = useState<T | null>(null);
    const ghostPosition = useRef(new Animated.ValueXY()).current;
    const dropZoneBounds = useRef<DropZoneBounds | null>(null);

    // Начальная позиция квадратика (его левый верхний угол на экране)
    const originRef = useRef({ x: 0, y: 0 });
    // Начальная позиция пальца при long press
    const fingerStartRef = useRef({ x: 0, y: 0 });

    const draggingRef = useRef<T | null>(null);
    const onDropRef = useRef(onDrop);
    onDropRef.current = onDrop;

    const registerDropZone = useCallback((bounds: DropZoneBounds) => {
        dropZoneBounds.current = bounds;
    }, []);

    /**
     * @param item — перетаскиваемый элемент
     * @param squareLayout — { x, y } левого верхнего угла квадратика в координатах экрана
     * @param fingerPageX — pageX пальца в момент long press
     * @param fingerPageY — pageY пальца в момент long press
     */
    const startDrag = useCallback(
        (
            item: T,
            squareLayout: { x: number; y: number },
            fingerPageX: number,
            fingerPageY: number,
        ) => {
            draggingRef.current = item;
            setDragging(item);

            originRef.current = squareLayout;
            fingerStartRef.current = { x: fingerPageX, y: fingerPageY };

            // Призрак появляется ТОЧНО на месте оригинала
            ghostPosition.setValue(squareLayout);
        },
        [ghostPosition],
    );

    const cancelDrag = useCallback(() => {
        draggingRef.current = null;
        setDragging(null);
        ghostPosition.setValue({ x: 0, y: 0 });
    }, [ghostPosition]);

    const finishDrag = useCallback(
        (moveX: number, moveY: number) => {
            const item = draggingRef.current;
            const bounds = dropZoneBounds.current;

            if (item && bounds) {
                const inside =
                    moveX >= bounds.x &&
                    moveX <= bounds.x + bounds.width &&
                    moveY >= bounds.y &&
                    moveY <= bounds.y + bounds.height;

                if (inside) onDropRef.current(item);
            }
            cancelDrag();
        },
        [cancelDrag],
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: () => draggingRef.current !== null,
                onMoveShouldSetPanResponderCapture: () =>
                    draggingRef.current !== null,

                onPanResponderMove: (_, gesture) => {
                    // Смещение пальца относительно начальной точки
                    const dx = gesture.moveX - fingerStartRef.current.x;
                    const dy = gesture.moveY - fingerStartRef.current.y;

                    // Призрак двигается от исходной позиции квадратика
                    ghostPosition.setValue({
                        x: originRef.current.x + dx,
                        y: originRef.current.y + dy,
                    });
                },

                onPanResponderRelease: (_, gesture) => {
                    finishDrag(gesture.moveX, gesture.moveY);
                },

                onPanResponderTerminate: (_, gesture) => {
                    finishDrag(gesture.moveX, gesture.moveY);
                },

                onPanResponderTerminationRequest: () => false,
                onShouldBlockNativeResponder: () =>
                    draggingRef.current !== null,
            }),
        [ghostPosition, finishDrag],
    );

    return {
        dragging,
        ghostPosition,
        panHandlers: panResponder.panHandlers,
        startDrag,
        cancelDrag,
        registerDropZone,
    };
}
