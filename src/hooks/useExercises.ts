// src/hooks/useExercises.ts
import { useExercisesVersion } from '@/context/ExercisesVersionContext';
import * as ExerciseRepo from '@/db/exercises';
import type {
    CreateExerciseInput,
    Exercise,
    UpdateExerciseInput,
} from '@/types/exercise';
import { useCallback, useEffect, useState } from 'react';

export function useExercises() {
    const { revision, bump } = useExercisesVersion();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        try {
            setLoading(true);
            setError(null);
            const query = search.trim();
            const data = query
                ? ExerciseRepo.getExercisesBySearch(query)
                : ExerciseRepo.getAllExercises();
            setExercises(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Перезапрос при изменении поиска ИЛИ revision (кто-то мутировал БД)
    useEffect(() => {
        load();
    }, [load, revision]);

    const create = useCallback(
        (input: CreateExerciseInput) => {
            ExerciseRepo.createExercise(input);
            bump(); // ← сигнал всем useExercises перечитать
        },
        [bump],
    );

    const update = useCallback(
        (input: UpdateExerciseInput) => {
            ExerciseRepo.updateExercise(input);
            bump();
        },
        [bump],
    );

    const remove = useCallback(
        (id: number) => {
            ExerciseRepo.deleteExercise(id);
            bump();
        },
        [bump],
    );

    return {
        exercises,
        search,
        setSearch,
        loading,
        error,
        create,
        update,
        remove,
    };
}
