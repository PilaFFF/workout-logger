// src/hooks/useHistory.ts

import { useWorkoutsVersion } from '@/context/WorkoutsVersionContext';
import * as WorkoutRepo from '@/db/workouts';
import type { Workout } from '@/types/workouts';
import { useCallback, useEffect, useState } from 'react';

export function useHistory() {
    const { revision } = useWorkoutsVersion();
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
    }, [load, revision]);

    return { workouts, loading, error, reload: load };
}
