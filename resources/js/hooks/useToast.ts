import { useCallback, useState } from 'react';

type ToastState = { kind: 'success' | 'error'; text: string };

export default function useToast(timeoutMs = 4000) {
    const [toast, setToast] = useState<ToastState | null>(null);

    const show = useCallback(
        (kind: ToastState['kind'], text: string) => {
            setToast({ kind, text });
            setTimeout(() => setToast(null), timeoutMs);
        },
        [timeoutMs],
    );

    return { toast, show };
}
