import { useState } from 'react';
import type { Account } from '../types';

export function useEditQueue() {
    const [queue, setQueue] = useState<Account[]>([]);
    const [index, setIndex] = useState(0);

    // NEW — pending removal bucket
    const [pendingRemovals, setPendingRemovals] = useState<number[]>([]);

    const total = queue.length;
    const current = total > 0 ? queue[index] : null;
    const hasNext = total > 1;

    function start(list: Account[]) {
        if (list.length === 0) return;
        setQueue(list);
        setIndex(0);
        setPendingRemovals([]); // clear old removals
    }

    function applyPendingRemovals(prevQueue: Account[], prevIndex: number) {
        if (pendingRemovals.length === 0) {
            return { newQueue: prevQueue, newIndex: prevIndex };
        }

        const removals = new Set(pendingRemovals);

        const newQueue = prevQueue.filter((a) => !removals.has(a.id));
        let newIndex = prevIndex;

        // If queue became empty
        if (newQueue.length === 0) {
            return { newQueue, newIndex: 0 };
        }

        // Adjust index based on removed positions
        let removedBefore = 0;
        prevQueue.forEach((a, i) => {
            if (removals.has(a.id) && i < prevIndex) removedBefore++;
        });

        newIndex = Math.max(prevIndex - removedBefore, 0);

        // If current index points beyond last element, wrap to 0
        if (newIndex >= newQueue.length) newIndex = 0;

        return { newQueue, newIndex };
    }

    function next() {
        setQueue((prevQueue) => {
            let applied = applyPendingRemovals(prevQueue, index);
            let q = applied.newQueue;
            let newIndex = applied.newIndex;

            // Clear pending removals since they've been applied
            setPendingRemovals([]);

            const newTotal = q.length;

            if (newTotal <= 1) {
                // If only one left (or zero), drop out of multi-edit mode
                setIndex(0);
                return q;
            }

            // Circular next
            const nxt = newIndex + 1;
            const finalIndex = nxt < newTotal ? nxt : 0;

            setIndex(finalIndex);

            return q;
        });
    }

    // REMOVE NOW ONLY QUEUES REMOVAL
    function remove(id: number) {
        setPendingRemovals((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    function reset() {
        setQueue([]);
        setIndex(0);
        setPendingRemovals([]);
    }

    return {
        queue,
        index,
        current,
        hasNext,
        start,
        next,
        remove,
        reset,
        total,
    };
}
