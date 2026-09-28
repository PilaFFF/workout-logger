// src/components/FinishWorkoutSheet/FinishWorkoutSheet.tsx
import type { ThemeColors } from '@/theme/colors';
import {
    defaultWorkoutName,
    inputDateToIso,
    todayInputDate,
    yesterdayInputDate,
} from '@/utils/date';
import BottomSheet, {
    BottomSheetScrollView,
} from '@expo/ui/community/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface FinishWorkoutSheetRef {
    open: () => void;
    close: () => void;
}

export interface FinishWorkoutData {
    name: string;
    date: string; // ISO
    comment: string;
}

interface Props {
    colors: ThemeColors;
    /** Сколько упражнений в текущем draft — для заголовка и подсказки */
    exerciseCount: number;
    /** Коллбэк при подтверждении. Возвращает данные формы. */
    onConfirm: (data: FinishWorkoutData) => void;
}

export const FinishWorkoutSheet = forwardRef<FinishWorkoutSheetRef, Props>(
    ({ colors, exerciseCount, onConfirm }, ref) => {
        const sheetRef = useRef<BottomSheet>(null);
        const [name, setName] = useState('');
        const [dateInput, setDateInput] = useState('');
        const [comment, setComment] = useState('');
        const [dateError, setDateError] = useState<string | null>(null);

        useImperativeHandle(ref, () => ({
            open: () => {
                setName(defaultWorkoutName());
                setDateInput(todayInputDate());
                setComment('');
                setDateError(null);
                sheetRef.current?.snapToIndex(0);
            },
            close: () => sheetRef.current?.close(),
        }));

        const handleConfirm = () => {
            const iso = inputDateToIso(dateInput);
            if (!iso) {
                setDateError('Формат: ГГГГ-ММ-ДД');
                return;
            }
            const trimmedName = name.trim() || defaultWorkoutName();
            onConfirm({
                name: trimmedName,
                date: iso,
                comment: comment.trim(),
            });
            sheetRef.current?.close();
        };

        const canConfirm = exerciseCount > 0 && name.trim().length > 0;

        return (
            <BottomSheet
                ref={sheetRef}
                snapPoints={['70%', '90%']}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: colors.surfaceElevated }}
            >
                <BottomSheetScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Завершить тренировку
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            { color: colors.textSecondary },
                        ]}
                    >
                        {exerciseCount}{' '}
                        {exerciseCount === 1 ? 'упражнение' : 'упражнений'} в
                        тренировке
                    </Text>

                    {/* Название */}
                    <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                    >
                        Название
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Например, День груди"
                        placeholderTextColor={colors.textSecondary}
                        style={[
                            styles.input,
                            {
                                color: colors.textPrimary,
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                        ]}
                    />

                    {/* Дата */}
                    <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                    >
                        Дата
                    </Text>
                    <TextInput
                        value={dateInput}
                        onChangeText={(v) => {
                            setDateInput(v);
                            setDateError(null);
                        }}
                        placeholder="ГГГГ-ММ-ДД"
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="numbers-and-punctuation"
                        style={[
                            styles.input,
                            {
                                color: colors.textPrimary,
                                borderColor: dateError
                                    ? colors.danger
                                    : colors.border,
                                backgroundColor: colors.surface,
                            },
                        ]}
                    />
                    {dateError && (
                        <Text style={[styles.error, { color: colors.danger }]}>
                            {dateError}
                        </Text>
                    )}

                    {/* Быстрые кнопки даты */}
                    <View style={styles.dateShortcuts}>
                        <Pressable
                            onPress={() => {
                                setDateInput(todayInputDate());
                                setDateError(null);
                            }}
                            style={[
                                styles.shortcut,
                                {
                                    borderColor: colors.border,
                                    backgroundColor: colors.surface,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: 13,
                                }}
                            >
                                Сегодня
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setDateInput(yesterdayInputDate());
                                setDateError(null);
                            }}
                            style={[
                                styles.shortcut,
                                {
                                    borderColor: colors.border,
                                    backgroundColor: colors.surface,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: 13,
                                }}
                            >
                                Вчера
                            </Text>
                        </Pressable>
                    </View>

                    {/* Комментарий */}
                    <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                    >
                        Комментарий (необязательно)
                    </Text>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Ощущения, замечания, что улучшить"
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

                    {/* Кнопки */}
                    <View style={styles.actions}>
                        <Pressable
                            onPress={() => sheetRef.current?.close()}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                },
                            ]}
                        >
                            <Text style={{ color: colors.textPrimary }}>
                                Отмена
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleConfirm}
                            disabled={!canConfirm}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: canConfirm
                                        ? colors.accent
                                        : colors.border,
                                },
                            ]}
                        >
                            <Ionicons
                                name="checkmark"
                                size={18}
                                color={colors.textInverse}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                style={{
                                    color: colors.textInverse,
                                    fontWeight: '600',
                                }}
                            >
                                Завершить
                            </Text>
                        </Pressable>
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
        );
    }
);

FinishWorkoutSheet.displayName = 'FinishWorkoutSheet';

const styles = StyleSheet.create({
    content: { padding: 24, gap: 6 },
    title: { fontSize: 24, fontWeight: '700' },
    subtitle: { fontSize: 13, marginBottom: 12 },
    label: { fontSize: 13, marginTop: 12, marginBottom: 4 },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
    textarea: { minHeight: 100, textAlignVertical: 'top' },
    error: { fontSize: 12, marginTop: 4 },
    dateShortcuts: { flexDirection: 'row', gap: 8, marginTop: 8 },
    shortcut: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});
