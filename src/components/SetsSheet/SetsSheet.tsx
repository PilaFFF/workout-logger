// src/components/SetsSheet/SetsSheet.tsx
import { EXERCISE_TYPE_ICONS } from '@/constants/exerciseIcons';
import type { ThemeColors } from '@/theme/colors';
import { EXERCISE_TYPE_LABELS } from '@/types/exercise';
import type { ResolvedDraftExercise } from '@/utils/resolveDraft';
import BottomSheet, {
    BottomSheetScrollView,
} from '@expo/ui/community/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface SetsSheetRef {
    /** Открыть sheet для упражнения по id. Объект ищется в актуальном draft. */
    open: (exerciseId: number) => void;
    close: () => void;
}

interface Props {
    colors: ThemeColors;
    draft: ResolvedDraftExercise[];
    onAddSet: (exerciseId: number) => void;
    onUpdateSet: (
        exerciseId: number,
        setId: string,
        patch: { reps?: number; weight?: number },
    ) => void;
    onRemoveSet: (exerciseId: number, setId: string) => void;
}

export const SetsSheet = forwardRef<SetsSheetRef, Props>(
    ({ colors, draft, onAddSet, onUpdateSet, onRemoveSet }, ref) => {
        const sheetRef = useRef<BottomSheet>(null);
        const [openId, setOpenId] = useState<number | null>(null);

        useImperativeHandle(ref, () => ({
            open: (exerciseId) => {
                setOpenId(exerciseId);
                requestAnimationFrame(() => sheetRef.current?.present());
            },
            close: () => sheetRef.current?.close(),
        }));

        const exercise =
            openId !== null
                ? (draft.find((d) => d.exercise_id === openId) ?? null)
                : null;

        if (!exercise) return null;

        const isBodyweight = exercise.type === 'bodyweight';

        return (
            <BottomSheet
                ref={sheetRef}
                snapPoints={['60%', '90%']}
                enablePanDownToClose
                onClose={() => setOpenId(null)}
                backgroundStyle={{ backgroundColor: colors.surfaceElevated }}
            >
                <BottomSheetScrollView contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <View
                            style={[
                                styles.colorDot,
                                { backgroundColor: exercise.color },
                            ]}
                        />
                        <View style={{ flex: 1 }}>
                            <View style={styles.nameRow}>
                                <Ionicons
                                    name={EXERCISE_TYPE_ICONS[exercise.type]}
                                    size={18}
                                    color={colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.name,
                                        { color: colors.textPrimary },
                                    ]}
                                >
                                    {exercise.name}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.type,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {EXERCISE_TYPE_LABELS[exercise.type]}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.setsList}>
                        {exercise.sets.map((set, index) => (
                            <View
                                key={set.id}
                                style={[
                                    styles.setRow,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.setIndex,
                                        { color: colors.textSecondary },
                                    ]}
                                >
                                    #{index + 1}
                                </Text>

                                <View style={styles.field}>
                                    <Text
                                        style={[
                                            styles.fieldLabel,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        Повторения
                                    </Text>
                                    <TextInput
                                        value={String(set.reps)}
                                        onChangeText={(v) => {
                                            const n = parseInt(v, 10);
                                            if (!isNaN(n))
                                                onUpdateSet(
                                                    exercise.exercise_id,
                                                    set.id,
                                                    { reps: n },
                                                );
                                        }}
                                        keyboardType="number-pad"
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.textPrimary,
                                                borderColor: colors.border,
                                                backgroundColor:
                                                    colors.surfaceElevated,
                                            },
                                        ]}
                                    />
                                </View>

                                {!isBodyweight && (
                                    <View style={styles.field}>
                                        <Text
                                            style={[
                                                styles.fieldLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Вес (кг)
                                        </Text>
                                        <TextInput
                                            value={String(set.weight)}
                                            onChangeText={(v) => {
                                                const n = parseFloat(
                                                    v.replace(',', '.'),
                                                );
                                                if (!isNaN(n))
                                                    onUpdateSet(
                                                        exercise.exercise_id,
                                                        set.id,
                                                        { weight: n },
                                                    );
                                            }}
                                            keyboardType="decimal-pad"
                                            style={[
                                                styles.input,
                                                {
                                                    color: colors.textPrimary,
                                                    borderColor: colors.border,
                                                    backgroundColor:
                                                        colors.surfaceElevated,
                                                },
                                            ]}
                                        />
                                    </View>
                                )}

                                {exercise.sets.length > 1 && (
                                    <Pressable
                                        onPress={() =>
                                            onRemoveSet(
                                                exercise.exercise_id,
                                                set.id,
                                            )
                                        }
                                        hitSlop={10}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={18}
                                            color={colors.danger}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>

                    <Pressable
                        onPress={() => onAddSet(exercise.exercise_id)}
                        style={[
                            styles.addSetButton,
                            { borderColor: colors.accent },
                        ]}
                    >
                        <Ionicons name="add" size={22} color={colors.accent} />
                        <Text
                            style={{ color: colors.accent, fontWeight: '600' }}
                        >
                            Добавить подход
                        </Text>
                    </Pressable>
                </BottomSheetScrollView>
            </BottomSheet>
        );
    },
);

SetsSheet.displayName = 'SetsSheet';

const styles = StyleSheet.create({
    content: { padding: 20, gap: 16 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    colorDot: { width: 12, height: 12, borderRadius: 6 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 20, fontWeight: '700' },
    type: { fontSize: 13, marginTop: 2 },
    setsList: { gap: 10 },
    setRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    setIndex: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    field: { flex: 1, gap: 4 },
    fieldLabel: { fontSize: 11 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
        textAlign: 'center',
    },
    removeButton: { paddingBottom: 8 },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
    },
});
