import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { darkTheme, lightTheme, type ThemeColors } from './colors';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
    colors: ThemeColors;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggle: () => void;
}

const STORAGE_KEY = '@workout_theme_mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useSystemColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('dark'); // dark по умолчанию

    // Загружаем сохранённый выбор один раз при старте
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (
                    saved === 'dark' ||
                    saved === 'light' ||
                    saved === 'system'
                ) {
                    setModeState(saved);
                }
            } catch {
                // ignore — остаёмся на дефолте
            }
        })();
    }, []);

    const setMode = (next: ThemeMode) => {
        setModeState(next);
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    };

    const toggle = () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };

    const colors = useMemo<ThemeColors>(() => {
        const effective = mode === 'system' ? (systemScheme ?? 'dark') : mode;
        return effective === 'dark' ? darkTheme : lightTheme;
    }, [mode, systemScheme]);

    const value = useMemo(
        () => ({ colors, mode, setMode, toggle }),
        [colors, mode],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme(): ThemeColors {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx.colors;
}

export function useThemeMode() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
    return { mode: ctx.mode, setMode: ctx.setMode, toggle: ctx.toggle };
}
