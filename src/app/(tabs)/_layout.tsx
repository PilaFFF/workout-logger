//src/app/(tabs)/_layout.tsx
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    const colors = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.textPrimary,
                headerShadowVisible: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Тренировка',
                    headerRight: () => <ThemeToggle />,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="barbell-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="exercises"
                options={{
                    title: 'Упражнения',
                    headerRight: () => <ThemeToggle />,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="list-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'История',
                    headerRight: () => <ThemeToggle />,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="time-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
