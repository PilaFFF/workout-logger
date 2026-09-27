// src/components/ThemeToggle.tsx
import { useTheme, useThemeMode } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

export function ThemeToggle() {
    const colors = useTheme();
    const { mode, toggle } = useThemeMode();

    const icon =
        mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'contrast';

    return (
        <Pressable
            onPress={toggle}
            hitSlop={12}
            style={[
                styles.button,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            <Ionicons name={icon} size={20} color={colors.textPrimary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
