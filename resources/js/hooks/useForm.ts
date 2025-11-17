import { useRef, useState } from 'react';

/**
 * A simple, reusable, fully generic form hook.
 * - Tracks form values
 * - Tracks initial state
 * - Tracks dirty fields
 * - Allows updating entire form
 * - Allows resetting to initial
 * - No validation (but can be added later)
 */
export function useForm<T extends Record<string, any>>(initial: T) {
    // Keep the initial state stable
    const initialRef = useRef<T>(initial);

    // Current form values
    const [values, setValues] = useState<T>(initial);

    // Track which fields have changed
    const [dirtyFields, setDirtyFields] = useState<Record<keyof T, boolean>>(
        Object.keys(initial).reduce(
            (acc, key) => {
                acc[key as keyof T] = false;
                return acc;
            },
            {} as Record<keyof T, boolean>,
        ),
    );

    // Whether *any* field is currently dirty
    const isDirty = Object.values(dirtyFields).some(Boolean);

    /** Set a single field */
    const setField = <K extends keyof T>(key: K, value: T[K]) => {
        setValues((prev) => {
            const next = { ...prev, [key]: value };

            setDirtyFields((prevDirty) => ({
                ...prevDirty,
                [key]: initialRef.current[key] !== value,
            }));

            return next;
        });
    };

    /** Replace entire form (e.g., when editing another account) */
    const update = (next: T) => {
        initialRef.current = next;
        setValues(next);

        setDirtyFields(
            Object.keys(next).reduce(
                (acc, key) => {
                    acc[key as keyof T] = false;
                    return acc;
                },
                {} as Record<keyof T, boolean>,
            ),
        );
    };

    /** Reset values back to the initial baseline */
    const reset = () => {
        setValues(initialRef.current);

        setDirtyFields(
            Object.keys(initialRef.current).reduce(
                (acc, key) => {
                    acc[key as keyof T] = false;
                    return acc;
                },
                {} as Record<keyof T, boolean>,
            ),
        );
    };

    return {
        values,
        setField,
        update,
        reset,
        dirtyFields,
        isDirty,
    };
}
