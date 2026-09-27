// src/components/ExerciseRow/ExerciseRow.tsx
import { EXERCISE_TYPE_ICONS } from '@/constants/exerciseIcons';
import type { ThemeColors } from '@/theme/colors';
import type { Exercise } from '@/types/exercise';
import { EXERCISE_TYPE_LABELS } from '@/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Props {
    exercise: Exercise;
    colors: ThemeColors;
    onPress: () => void;
    onDelete: () => void;
}

export function ExerciseRow({ exercise, colors, onPress, onDelete }: Props) {
    const swipeRef = useRef<Swipeable>(null);

    const renderRightActions = () => (
        <Pressable
            onPress={() => {
                swipeRef.current?.close();
                onDelete();
            }}
            style={[styles.deleteAction, { backgroundColor: colors.danger }]}
        >
            <Ionicons name="trash-outline" size={22} color="#fff" />
        </Pressable>
    );

    return (
        <Swipeable
            ref={swipeRef}
            renderRightActions={renderRightActions}
            overshootRight={false}
            rightThreshold={40}
        >
            <Pressable
                onPress={onPress}
                style={[
                    styles.row,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View
                    style={[
                        styles.colorBar,
                        { backgroundColor: exercise.color },
                    ]}
                />

                <View style={styles.body}>
                    <View style={styles.headerRow}>
                        <Ionicons
                            name={EXERCISE_TYPE_ICONS[exercise.type]}
                            size={16}
                            color={colors.textSecondary}
                        />
                        <Text
                            numberOfLines={1}
                            style={[styles.name, { color: colors.textPrimary }]}
                        >
                            {exercise.name}
                        </Text>
                    </View>

                    <View style={styles.metaRow}>
                        <View
                            style={[
                                styles.typeChip,
                                {
                                    backgroundColor: colors.surfaceElevated,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {EXERCISE_TYPE_LABELS[exercise.type]}
                            </Text>
                        </View>

                        {exercise.description ? (
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.description,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {exercise.description}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                />
            </Pressable>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        overflow: 'hidden',
    },
    colorBar: { width: 5, alignSelf: 'stretch' },
    body: { flex: 1, padding: 14, gap: 6 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { flex: 1, fontSize: 16, fontWeight: '600' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typeChip: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    typeText: { fontSize: 11, fontWeight: '500' },
    description: { flex: 1, fontSize: 13 },
    deleteAction: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 12,
        marginLeft: 8,
    },
});
