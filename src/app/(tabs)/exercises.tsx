import { ExerciseForm } from '@/components/ExerciseForm/ExerciseForm';
import { ExerciseRow } from '@/components/ExerciseRow/ExerciseRow';
import { useExercises } from '@/hooks/useExercises';
import { useTheme } from '@/theme/ThemeContext';
import { Exercise } from '@/types/exercise';
import BottomSheet from '@expo/ui/community/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type SheetMode =
    | { type: 'create' }
    | { type: 'edit'; exercise: Exercise }
    | null;

export default function ExercisesScreen() {
    const colors = useTheme();
    const {
        exercises,
        search,
        setSearch,
        loading,
        error,
        create,
        update,
        remove,
    } = useExercises();
    const [sheetMode, setSheetMode] = useState<SheetMode>(null);
    const sheetRef = useRef<BottomSheet>(null);

    const openCreate = () => {
        setSheetMode({ type: 'create' });
        requestAnimationFrame(() => sheetRef.current?.snapToIndex(0));
    };

    const openEdit = (exercise: Exercise) => {
        setSheetMode({ type: 'edit', exercise });
        sheetRef.current?.snapToIndex(0);
    };

    const closeSheet = () => sheetRef.current?.close();

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
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

            {/* Кнопка добавления */}
            <Pressable
                onPress={openCreate}
                style={[styles.addButton, { backgroundColor: colors.accent }]}
            >
                <Ionicons name="add" size={28} color={colors.textInverse} />
            </Pressable>

            {/* Список / состояния */}
            {loading ? (
                <View style={styles.center}>
                    <Text style={{ color: colors.textSecondary }}>
                        Загрузка...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={{ color: colors.danger }}>{error}</Text>
                </View>
            ) : exercises.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ color: colors.textSecondary }}>
                        {search
                            ? 'Ничего не найдено'
                            : 'Нет упражнений. Добавь первое!'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={exercises}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <ExerciseRow
                            exercise={item}
                            colors={colors}
                            onPress={() => openEdit(item)}
                            onDelete={() => remove(item.id)}
                        />
                    )}
                />
            )}

            {sheetMode && (
                <BottomSheet
                    ref={sheetRef}
                    snapPoints={['60%', '90%']}
                    enablePanDownToClose
                    onClose={() => setSheetMode(null)}
                    backgroundStyle={{
                        backgroundColor: colors.surfaceElevated,
                    }}
                >
                    <ExerciseForm
                        mode={sheetMode}
                        colors={colors}
                        onSubmit={(data) => {
                            if (sheetMode.type === 'create') create(data);
                            else update({ id: sheetMode.exercise.id, ...data });
                            closeSheet();
                        }}
                        onCancel={closeSheet}
                    />
                </BottomSheet>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 60,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 40,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        zIndex: 10,
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 120,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
