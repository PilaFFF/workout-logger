// src/app/(tabs)/index.tsx
import { ExerciseSquare } from '@/components/ExerciseSquare/ExerciseSquare';
import { FinishFab } from '@/components/FinishFab/FinishFab';
import {
    FinishWorkoutSheet,
    type FinishWorkoutData,
    type FinishWorkoutSheetRef,
} from '@/components/FinishWorkoutSheet/FinishWorkoutSheet';
import { SetsSheet, type SetsSheetRef } from '@/components/SetsSheet/SetsSheet';
import { WorkoutDropZone } from '@/components/WorkoutDropZone/WorkoutDropZone';
import { useDataVersion } from '@/context/DataVersionContext';
import * as WorkoutRepo from '@/db/workouts';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutDraft } from '@/hooks/useWorkoutDraft';
import { useTheme } from '@/theme/ThemeContext';
import type { Exercise } from '@/types/exercise';
import { resolveDraft, type ResolvedDraftExercise } from '@/utils/resolveDraft';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated from 'react-native-reanimated';

export default function WorkoutScreen() {
    const colors = useTheme();
    const { exercises, search, setSearch } = useExercises();
    const draft = useWorkoutDraft();
    const { bumpWorkouts } = useDataVersion();
    const sheetRef = useRef<SetsSheetRef>(null);
    const finishRef = useRef<FinishWorkoutSheetRef>(null);

    const resolvedDraft = useMemo(
        () => resolveDraft(draft.draft, exercises),
        [draft.draft, exercises]
    );

    const addAndOpen = useCallback(
        (exerciseId: number) => {
            draft.addExercise(exerciseId);
            sheetRef.current?.open(exerciseId);
        },
        [draft]
    );

    const dnd = useDragDrop<Exercise>({
        onDrop: (exercise) => addAndOpen(exercise.id),
    });

    const handlePress = useCallback(
        (exercise: Exercise) => addAndOpen(exercise.id),
        [addAndOpen]
    );

    const handleCardPress = useCallback((exercise: ResolvedDraftExercise) => {
        sheetRef.current?.open(exercise.exercise_id);
    }, []);

    const handleFinishPress = useCallback(() => {
        if (draft.draft.length === 0) {
            Alert.alert(
                'Пусто',
                'Добавь хотя бы одно упражнение, прежде чем завершить тренировку'
            );
            return;
        }
        finishRef.current?.open();
    }, [draft.draft.length]);

    const handleFinishConfirm = useCallback(
        (data: FinishWorkoutData) => {
            try {
                WorkoutRepo.createWorkout({
                    name: data.name,
                    date: data.date,
                    comment: data.comment,
                    exercises: draft.draft.map((d) => ({
                        exercise_id: d.exercise_id,
                        sets: d.sets.map((s) => ({
                            reps: s.reps,
                            weight: s.weight,
                        })),
                    })),
                });
                draft.reset();
                bumpWorkouts();
                Alert.alert('Готово', 'Тренировка сохранена в истории');
            } catch (e) {
                Alert.alert(
                    'Ошибка',
                    e instanceof Error ? e.message : 'Не удалось сохранить'
                );
            }
        },
        [draft, bumpWorkouts]
    );

    const isDragging = dnd.dragging !== null;

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View
                style={[
                    styles.searchRow,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Ionicons
                    name="search"
                    size={20}
                    color={colors.textSecondary}
                />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Поиск упражнений..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={!isDragging}
                contentContainerStyle={styles.squaresRow}
            >
                {exercises.map((ex) => (
                    <ExerciseSquare
                        key={ex.id}
                        exercise={ex}
                        colors={colors}
                        onPress={handlePress}
                        onDragStart={dnd.startDrag}
                        onDragMove={dnd.moveDrag}
                        onDragEnd={dnd.endDrag}
                        onDragCancel={dnd.cancelDrag}
                        isBeingDragged={dnd.dragging?.id === ex.id}
                    />
                ))}
            </ScrollView>

            <WorkoutDropZone
                draft={resolvedDraft}
                colors={colors}
                isDragActive={isDragging}
                onDropZoneLayout={dnd.registerDropZone}
                onCardPress={handleCardPress}
                onCardRemove={draft.removeExercise}
            />

            {/* Призрак — рендерится поверх всего экрана, следит за пальцем через shared values */}
            {dnd.dragging && (
                <Animated.View
                    pointerEvents="none"
                    style={[styles.ghost, dnd.ghostStyle]}
                >
                    <View
                        style={[
                            styles.ghostSquare,
                            { backgroundColor: dnd.dragging.color },
                        ]}
                    >
                        <Text numberOfLines={2} style={styles.ghostLabel}>
                            {dnd.dragging.name}
                        </Text>
                    </View>
                </Animated.View>
            )}

            <FinishFab
                colors={colors}
                onPress={handleFinishPress}
                disabled={draft.draft.length === 0}
            />

            <SetsSheet
                ref={sheetRef}
                colors={colors}
                draft={resolvedDraft}
                onAddSet={draft.addSet}
                onUpdateSet={draft.updateSet}
                onRemoveSet={draft.removeSet}
            />

            <FinishWorkoutSheet
                ref={finishRef}
                colors={colors}
                exerciseCount={draft.draft.length}
                onConfirm={handleFinishConfirm}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
    squaresRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    ghost: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 999,
    },
    ghostSquare: {
        width: 96,
        height: 96,
        borderRadius: 16,
        padding: 10,
        justifyContent: 'flex-end',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    ghostLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#151517',
    },
});
