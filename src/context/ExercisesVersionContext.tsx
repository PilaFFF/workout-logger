// src/context/ExercisesVersionContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

interface ExercisesVersionValue {
    revision: number;
    bump: () => void;
}

const Ctx = createContext<ExercisesVersionValue | null>(null);

export function ExercisesVersionProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [revision, setRevision] = useState(0);
    const bump = useCallback(() => setRevision((v) => v + 1), []);
    const value = useMemo(() => ({ revision, bump }), [revision, bump]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExercisesVersion(): ExercisesVersionValue {
    const v = useContext(Ctx);
    if (!v)
        throw new Error(
            'useExercisesVersion must be used within ExercisesVersionProvider',
        );
    return v;
}
