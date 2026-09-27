// src/app/_layout.tsx
import { ExercisesVersionProvider } from '@/context/ExercisesVersionContext';
import { initializeDatabase } from '@/db/init';
import { ThemeProvider } from '@/theme/ThemeContext';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    const [dbReady, setDbReady] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        initializeDatabase()
            .then(() => setDbReady(true))
            .catch((e) =>
                setDbError(e instanceof Error ? e.message : 'DB error'),
            );
    }, []);

    if (dbError) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator />
                <Text>Ошибка БД: {dbError}</Text>
            </View>
        );
    }

    if (!dbReady) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <ExercisesVersionProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </ExercisesVersionProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
