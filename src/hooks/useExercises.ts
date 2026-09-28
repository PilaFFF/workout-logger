// src/hooks/useExercises.ts

import { useDataVersion } from '@/context/DataVersionContext';
import * as ExerciseRepo from '@/db/exercises';
import type {
    CreateExerciseInput,
    Exercise,
    UpdateExerciseInput,
} from '@/types/exercise';
import { useCallback, useEffect, useState } from 'react';

export function useExercises() {
    const { exercisesRevision, bumpExercises } = useDataVersion();
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
    }, [load, exercisesRevision]);

    const create = useCallback(
        (input: CreateExerciseInput) => {
            ExerciseRepo.createExercise(input);
            bumpExercises();
        },
        [bumpExercises]
    );

    const update = useCallback(
        (input: UpdateExerciseInput) => {
            ExerciseRepo.updateExercise(input);
            bumpExercises();
        },
        [bumpExercises]
    );

    const remove = useCallback(
        (id: number) => {
            ExerciseRepo.deleteExercise(id);
            bumpExercises();
        },
        [bumpExercises]
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
