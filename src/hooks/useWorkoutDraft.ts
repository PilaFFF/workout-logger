// src/hooks/useWorkoutDraft.ts
import type { DraftExercise, SetEntry } from '@/types/workouts';
import { useCallback, useState } from 'react';

const createSetId = (): string =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptySet = (): SetEntry => ({
    id: createSetId(),
    reps: 10,
    weight: 0,
});

export function useWorkoutDraft() {
    const [draft, setDraft] = useState<DraftExercise[]>([]);

    const addExercise = useCallback((exerciseId: number) => {
        setDraft((prev) => {
            if (prev.some((d) => d.exercise_id === exerciseId)) return prev;
            return [
                ...prev,
                { exercise_id: exerciseId, sets: [createEmptySet()] },
            ];
        });
    }, []);

    const removeExercise = useCallback((exerciseId: number) => {
        setDraft((prev) => prev.filter((d) => d.exercise_id !== exerciseId));
    }, []);

    const addSet = useCallback((exerciseId: number) => {
        setDraft((prev) =>
            prev.map((d) =>
                d.exercise_id === exerciseId
                    ? { ...d, sets: [...d.sets, createEmptySet()] }
                    : d
            )
        );
    }, []);

    const updateSet = useCallback(
        (
            exerciseId: number,
            setId: string,
            patch: Partial<Omit<SetEntry, 'id'>>
        ) => {
            setDraft((prev) =>
                prev.map((d) =>
                    d.exercise_id === exerciseId
                        ? {
                              ...d,
                              sets: d.sets.map((s) =>
                                  s.id === setId ? { ...s, ...patch } : s
                              ),
                          }
                        : d
                )
            );
        },
        []
    );

    const removeSet = useCallback((exerciseId: number, setId: string) => {
        setDraft((prev) =>
            prev.map((d) =>
                d.exercise_id === exerciseId
                    ? { ...d, sets: d.sets.filter((s) => s.id !== setId) }
                    : d
            )
        );
    }, []);

    const reset = useCallback(() => setDraft([]), []);

    return {
        draft,
        addExercise,
        removeExercise,
        addSet,
        updateSet,
        removeSet,
        reset,
    };
}
