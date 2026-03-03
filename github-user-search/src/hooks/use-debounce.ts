import { useRef, useCallback } from 'react';

export function useDebounce(fn: (...args: any[]) => void, delay: number = 300) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    return useCallback((...args: unknown[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => fn(...args), delay)
    }, [fn, delay])
}