// src/app/(tabs)/history.tsx
import { useTheme } from '@/theme/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
    const colors = useTheme();
    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Text style={{ color: colors.textSecondary }}>
                История пока пуста
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
