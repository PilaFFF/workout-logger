// src/components/ExerciseForm/ExerciseForm.tsx
import {
    DEFAULT_EXERCISE_COLOR,
    EXERCISE_COLORS,
} from '@/constants/exerciseColors';
import type { ThemeColors } from '@/theme/colors';
import {
    CreateExerciseInput,
    Exercise,
    EXERCISE_TYPE_LABELS,
    ExerciseType,
} from '@/types/exercise';
import { BottomSheetScrollView } from '@expo/ui/community/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Mode = { type: 'create' } | { type: 'edit'; exercise: Exercise };

interface Props {
    mode: Mode;
    colors: ThemeColors;
    onSubmit: (data: CreateExerciseInput) => void;
    onCancel: () => void;
}

export function ExerciseForm({ mode, colors, onSubmit, onCancel }: Props) {
    const initial = mode.type === 'edit' ? mode.exercise : null;
    const [name, setName] = useState(initial?.name ?? '');
    const [type, setType] = useState<ExerciseType>(initial?.type ?? 'weighted');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [color, setColor] = useState<string>(
        initial?.color ?? DEFAULT_EXERCISE_COLOR,
    );

    const isValid = name.trim().length > 0;

    return (
        <BottomSheetScrollView contentContainerStyle={styles.form}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
                {mode.type === 'create' ? 'Новое упражнение' : 'Редактировать'}
            </Text>

            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Название упражнения"
                placeholderTextColor={colors.textSecondary}
                style={[
                    styles.input,
                    {
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                    },
                ]}
                autoFocus
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
                Тип
            </Text>
            <View style={styles.typeRow}>
                {(Object.keys(EXERCISE_TYPE_LABELS) as ExerciseType[]).map(
                    (t) => (
                        <Pressable
                            key={t}
                            onPress={() => setType(t)}
                            style={[
                                styles.typeChip,
                                {
                                    backgroundColor:
                                        type === t
                                            ? colors.accent
                                            : colors.surface,
                                    borderColor:
                                        type === t
                                            ? colors.accent
                                            : colors.border,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color:
                                        type === t
                                            ? colors.textInverse
                                            : colors.textPrimary,
                                    fontSize: 13,
                                }}
                            >
                                {EXERCISE_TYPE_LABELS[t]}
                            </Text>
                        </Pressable>
                    ),
                )}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
                Цвет
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorRow}
            >
                {EXERCISE_COLORS.map((c) => {
                    const selected = c === color;
                    return (
                        <Pressable
                            key={c}
                            onPress={() => setColor(c)}
                            style={[
                                styles.colorCircle,
                                {
                                    backgroundColor: c,
                                    borderColor: selected
                                        ? colors.textPrimary
                                        : 'transparent',
                                },
                            ]}
                            hitSlop={6}
                        >
                            {selected && (
                                <Ionicons
                                    name="checkmark"
                                    size={22}
                                    color="#151517"
                                />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
                Описание
            </Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ссылка на видео или текстовое описание"
                placeholderTextColor={colors.textSecondary}
                multiline
                style={[
                    styles.input,
                    styles.textarea,
                    {
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                    },
                ]}
            />

            <View style={styles.actions}>
                <Pressable
                    onPress={onCancel}
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            borderWidth: 1,
                        },
                    ]}
                >
                    <Text style={{ color: colors.textPrimary }}>Отмена</Text>
                </Pressable>
                <Pressable
                    onPress={() =>
                        isValid &&
                        onSubmit({
                            name: name.trim(),
                            type,
                            description: description.trim(),
                            color,
                        })
                    }
                    disabled={!isValid}
                    style={[
                        styles.button,
                        {
                            backgroundColor: isValid
                                ? colors.accent
                                : colors.border,
                        },
                    ]}
                >
                    <Text
                        style={{ color: colors.textInverse, fontWeight: '600' }}
                    >
                        Сохранить
                    </Text>
                </Pressable>
            </View>
        </BottomSheetScrollView>
    );
}

const styles = StyleSheet.create({
    form: { padding: 24, gap: 12 },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
    label: { fontSize: 13, marginTop: 8, marginBottom: 4 },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
    textarea: { minHeight: 80, textAlignVertical: 'top' },
    typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    typeChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    colorRow: { gap: 12, paddingVertical: 4, paddingHorizontal: 2 },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
});
