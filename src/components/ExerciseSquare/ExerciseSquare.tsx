// src/components/ExerciseSquare/ExerciseSquare.tsx
import { EXERCISE_TYPE_ICONS } from '@/constants/exerciseIcons';
import type { ThemeColors } from '@/theme/colors';
import type { Exercise } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

interface Props {
    exercise: Exercise;
    colors: ThemeColors;
    onPress: (exercise: Exercise) => void;
    onDragStart: (exercise: Exercise, pageX: number, pageY: number) => void;
    onDragMove: (pageX: number, pageY: number) => void;
    onDragEnd: (pageX: number, pageY: number) => void;
    onDragCancel: () => void;
    isBeingDragged?: boolean;
}

export function ExerciseSquare({
    exercise,
    colors,
    onPress,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
    isBeingDragged = false,
}: Props) {
    // Refs с актуальными колбэками — gesture создаётся один раз и не видит новые пропсы
    const onPressRef = useRef(onPress);
    const onDragStartRef = useRef(onDragStart);
    const onDragMoveRef = useRef(onDragMove);
    const onDragEndRef = useRef(onDragEnd);
    const onDragCancelRef = useRef(onDragCancel);
    const exerciseRef = useRef(exercise);

    onPressRef.current = onPress;
    onDragStartRef.current = onDragStart;
    onDragMoveRef.current = onDragMove;
    onDragEndRef.current = onDragEnd;
    onDragCancelRef.current = onDragCancel;
    exerciseRef.current = exercise;

    const gesture = useMemo(() => {
        const longPress = Gesture.LongPress()
            .minDuration(250)
            .maxDistance(8)
            .onStart((e) => {
                runOnJS(onDragStartRef.current)(
                    exerciseRef.current,
                    e.absoluteX,
                    e.absoluteY
                );
            });

        const pan = Gesture.Pan()
            .activateAfterLongPress(250)
            .onUpdate((e) => {
                runOnJS(onDragMoveRef.current)(e.absoluteX, e.absoluteY);
            })
            .onEnd((e) => {
                runOnJS(onDragEndRef.current)(e.absoluteX, e.absoluteY);
            })
            .onFinalize((_e, success) => {
                if (!success) runOnJS(onDragCancelRef.current)();
            });

        const tap = Gesture.Tap()
            .maxDuration(250)
            .onEnd((_e, success) => {
                if (success) runOnJS(onPressRef.current)(exerciseRef.current);
            });

        return Gesture.Race(Gesture.Exclusive(longPress, pan), tap);
    }, []); // ← пустой массив зависимостей! gesture создаётся один раз

    return (
        <GestureDetector gesture={gesture}>
            <View
                style={[
                    styles.square,
                    {
                        backgroundColor: exercise.color,
                        opacity: isBeingDragged ? 0.3 : 1,
                    },
                ]}
            >
                <View style={styles.iconWrap}>
                    <Ionicons
                        name={EXERCISE_TYPE_ICONS[exercise.type]}
                        size={22}
                        color="#151517"
                    />
                </View>
                <Text numberOfLines={2} style={styles.label}>
                    {exercise.name}
                </Text>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    square: {
        width: 96,
        height: 96,
        borderRadius: 16,
        padding: 10,
        marginRight: 10,
        justifyContent: 'space-between',
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#151517',
    },
});
