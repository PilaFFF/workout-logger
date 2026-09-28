// src/context/WorkoutsVersionContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

interface Value {
    revision: number;
    bump: () => void;
}

const Ctx = createContext<Value | null>(null);

export function WorkoutsVersionProvider({ children }: { children: ReactNode }) {
    const [revision, setRevision] = useState(0);
    const bump = useCallback(() => setRevision((v) => v + 1), []);
    const value = useMemo(() => ({ revision, bump }), [revision, bump]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkoutsVersion(): Value {
    const v = useContext(Ctx);
    if (!v)
        throw new Error(
            'useWorkoutsVersion must be used within WorkoutsVersionProvider',
        );
    return v;
}
