#!/bin/bash

# Create hooks directory if needed
mkdir -p resources/js/features/accounts/hooks

###############################################
# useEditorState.ts
###############################################
cat > resources/js/features/accounts/hooks/useEditorState.ts << 'EOF'
import { useState } from 'react'
import type { Account } from '../types'

/**
 * Handles only the UI editor state (open/close + current target)
 * - No queue logic
 * - No form logic
 * - No backend logic
 */
export function useEditorState() {
    const [isOpen, setIsOpen] = useState(false)
    const [current, setCurrent] = useState<Account | null>(null)

    /** Open editor for an account (existing or new) */
    function open(account: Account) {
        setCurrent(account)
        setIsOpen(true)
    }

    /** Close editor */
    function close() {
        setIsOpen(false)
        setCurrent(null)
    }

    return {
        isOpen,
        current,
        open,
        close,
    }
}
EOF

###############################################
# useEditQueue.ts
###############################################
cat > resources/js/features/accounts/hooks/useEditQueue.ts << 'EOF'
import { useState } from 'react'
import type { Account } from '../types'

/**
 * Pure queue management for bulk editing.
 * - No editor logic
 * - No form logic
 * - No backend logic
 */
export function useEditQueue() {
    const [queue, setQueue] = useState<Account[]>([])
    const [index, setIndex] = useState(0)

    const current = queue.length > 0 ? queue[index] : null
    const hasNext = index + 1 < queue.length

    /** Start a new queue */
    function start(list: Account[]) {
        if (list.length === 0) return
        setQueue(list)
        setIndex(0)
    }

    /** Move to the next account in queue */
    function next() {
        if (hasNext) {
            setIndex(i => i + 1)
        } else {
            reset()
        }
    }

    /** Reset queue */
    function reset() {
        setQueue([])
        setIndex(0)
    }

    return {
        queue,
        index,
        current,
        hasNext,
        start,
        next,
        reset,
    }
}
EOF

echo "useEditorState and useEditQueue hooks created successfully."
