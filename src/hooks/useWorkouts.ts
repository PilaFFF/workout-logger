// src/hooks/useWorkouts.ts
import { useDataVersion } from '@/context/DataVersionContext';
import * as WorkoutRepo from '@/db/workouts';
import type { Workout } from '@/types/workouts';
import { useCallback, useEffect, useState } from 'react';

export function useWorkouts() {
    const { workoutsRevision, bumpWorkouts } = useDataVersion();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        try {
            setLoading(true);
            setError(null);
            setWorkouts(WorkoutRepo.getAllWorkouts());
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load, workoutsRevision]);

    const remove = useCallback(
        (id: number) => {
            WorkoutRepo.deleteWorkout(id);
            bumpWorkouts();
        },
        [bumpWorkouts]
    );

    return { workouts, loading, error, remove, reload: load };
}
