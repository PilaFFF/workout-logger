// src/app/(tabs)/index.tsx
import { ExerciseSquare } from '@/components/ExerciseSquare/ExerciseSquare';
import { SetsSheet, type SetsSheetRef } from '@/components/SetsSheet/SetsSheet';
import { WorkoutDropZone } from '@/components/WorkoutDropZone/WorkoutDropZone';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutDraft } from '@/hooks/useWorkoutDraft';
import { useTheme } from '@/theme/ThemeContext';
import type { Exercise } from '@/types/exercise';
import { resolveDraft, type ResolvedDraftExercise } from '@/utils/resolveDraft';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

export default function WorkoutScreen() {
    const colors = useTheme();
    const { exercises, search, setSearch } = useExercises();
    const draft = useWorkoutDraft();
    const sheetRef = useRef<SetsSheetRef>(null);

    const resolvedDraft = useMemo(
        () => resolveDraft(draft.draft, exercises),
        [draft.draft, exercises],
    );

    const openSheet = useCallback((exerciseId: number) => {
        sheetRef.current?.open(exerciseId);
    }, []);

    const addAndOpen = useCallback(
        (exerciseId: number) => {
            draft.addExercise(exerciseId);
            openSheet(exerciseId);
        },
        [draft, openSheet],
    );

    // Паттерн «долгое нажатие + перетаскивание»:
    // onLongPress квадратика вызывает startDrag → dragging != null.
    // Со следующим движением пальца PanResponder на корне заберёт жест
    // и будет двигать призрак до отпускания.
    const dnd = useDragDrop<Exercise>({
        onDrop: (exercise) => addAndOpen(exercise.id),
    });

    const handlePress = useCallback(
        (exercise: Exercise) => addAndOpen(exercise.id),
        [addAndOpen],
    );

    const handleCardPress = useCallback(
        (exercise: ResolvedDraftExercise) => openSheet(exercise.exercise_id),
        [openSheet],
    );

    const isDragging = dnd.dragging !== null;

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
            {...dnd.panHandlers}
        >
            {/* Поиск */}
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

            {/* Горизонтальные квадратики */}
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
                        onLongPressStart={dnd.startDrag}
                        isBeingDragged={dnd.dragging?.id === ex.id}
                    />
                ))}
            </ScrollView>

            {/* Drop-зона */}
            <WorkoutDropZone
                draft={resolvedDraft}
                colors={colors}
                isDragActive={isDragging}
                onDropZoneLayout={dnd.registerDropZone}
                onCardPress={handleCardPress}
                onCardRemove={draft.removeExercise}
            />

            {/* Призрак перетаскиваемого квадратика.
                pointerEvents="none" — критично: жесты обрабатывает PanResponder на корне,
                призрак не должен перехватывать касания. */}
            {dnd.dragging && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.ghost,
                        {
                            transform: [
                                { translateX: dnd.ghostPosition.x },
                                { translateY: dnd.ghostPosition.y },
                            ],
                        },
                    ]}
                >
                    <ExerciseSquare
                        exercise={dnd.dragging}
                        colors={colors}
                        onPress={() => {}}
                        onLongPressStart={() => {}}
                    />
                </Animated.View>
            )}

            {/* Sheet — принимает draft пропом, чтобы всегда видеть актуальные данные */}
            <SetsSheet
                ref={sheetRef}
                colors={colors}
                draft={resolvedDraft}
                onAddSet={draft.addSet}
                onUpdateSet={draft.updateSet}
                onRemoveSet={draft.removeSet}
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
    ghost: { position: 'absolute', left: 0, top: 0, zIndex: 999 },
});
