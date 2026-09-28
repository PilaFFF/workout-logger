// src/components/WorkoutDropZone/WorkoutDropZone.tsx
import type { DropZoneBounds } from '@/hooks/useDragDrop';
import type { ThemeColors } from '@/theme/colors';
import type { ResolvedDraftExercise } from '@/utils/resolveDraft';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
} from 'react-native';
import { WorkoutCard } from '../WorkoutCard/WorkoutCard';

interface Props {
    draft: ResolvedDraftExercise[];
    colors: ThemeColors;
    isDragActive: boolean;
    onDropZoneLayout: (bounds: DropZoneBounds) => void;
    onCardPress: (exercise: ResolvedDraftExercise) => void;
    onCardRemove: (exerciseId: number) => void;
}

export function WorkoutDropZone({
    draft,
    colors,
    isDragActive,
    onDropZoneLayout,
    onCardPress,
    onCardRemove,
}: Props) {
    const containerRef = useRef<View>(null);

    const handleLayout = useCallback(
        (_: LayoutChangeEvent) => {
            // measureInWindow даёт абсолютные координаты в системе экрана —
            // именно они совпадают с absoluteX/absoluteY из gesture-handler.
            containerRef.current?.measureInWindow((x, y, width, height) => {
                onDropZoneLayout({ x, y, width, height });
            });
        },
        [onDropZoneLayout]
    );

    return (
        <View
            ref={containerRef}
            onLayout={handleLayout}
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderColor: isDragActive ? colors.accent : 'transparent',
                },
                isDragActive && styles.containerActive,
            ]}
        >
            {isDragActive && (
                <View style={styles.hintWrap} pointerEvents="none">
                    <Ionicons
                        name="arrow-down-circle"
                        size={28}
                        color={colors.accent}
                    />
                    <Text style={[styles.hint, { color: colors.accent }]}>
                        Отпусти, чтобы добавить
                    </Text>
                </View>
            )}

            {draft.length === 0 ? (
                <View style={styles.empty} pointerEvents="none">
                    <Ionicons
                        name="fitness-outline"
                        size={40}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.emptyText,
                            { color: colors.textSecondary },
                        ]}
                    >
                        {isDragActive
                            ? 'Перетащи упражнение сюда'
                            : 'Зажми квадратик сверху и перетащи сюда,\nили просто тапни по нему'}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.list}
                    scrollEnabled={!isDragActive}
                    showsVerticalScrollIndicator={false}
                >
                    {draft.map((exercise) => (
                        <WorkoutCard
                            key={exercise.exercise_id}
                            exercise={exercise}
                            colors={colors}
                            onPress={() => onCardPress(exercise)}
                            onRemove={() => onCardRemove(exercise.exercise_id)}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 18,
        borderWidth: 2,
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    containerActive: {
        backgroundColor: 'rgba(0, 71, 171, 0.06)',
    },
    hintWrap: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
    },
    hint: {
        fontSize: 13,
        fontWeight: '600',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    list: {
        padding: 12,
        paddingTop: 44,
    },
});
