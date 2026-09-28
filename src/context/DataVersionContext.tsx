// src/context/DataVersionContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

interface DataVersionValue {
    exercisesRevision: number;
    workoutsRevision: number;
    bumpExercises: () => void;
    bumpWorkouts: () => void;
}

const Ctx = createContext<DataVersionValue | null>(null);

export function DataVersionProvider({ children }: { children: ReactNode }) {
    const [exercisesRevision, setExercisesRevision] = useState(0);
    const [workoutsRevision, setWorkoutsRevision] = useState(0);

    const bumpExercises = useCallback(
        () => setExercisesRevision((v) => v + 1),
        []
    );
    const bumpWorkouts = useCallback(
        () => setWorkoutsRevision((v) => v + 1),
        []
    );

    const value = useMemo(
        () => ({
            exercisesRevision,
            workoutsRevision,
            bumpExercises,
            bumpWorkouts,
        }),
        [exercisesRevision, workoutsRevision, bumpExercises, bumpWorkouts]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDataVersion(): DataVersionValue {
    const v = useContext(Ctx);
    if (!v)
        throw new Error(
            'useDataVersion must be used within DataVersionProvider'
        );
    return v;
}
