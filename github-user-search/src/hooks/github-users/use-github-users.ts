import { useState, useCallback, useRef, useEffect } from 'react'
import { searchGithubUser } from '../../../services/github/search-github-user'
import { type GithubUser } from '../../../services/github/github-user'

export type DisplayUser = GithubUser & {
    internalId: string
}

type SearchState = {
    users: DisplayUser[]
    isLoading: boolean
    error: { message: string; status: number } | null
}

const initialState: SearchState = {
    users: [],
    isLoading: false,
    error: null,
}

export function useGithubUsers() {
    const [state, setState] = useState<SearchState>(initialState)
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
    const abortControllerRef = useRef<AbortController | null>(null)
    const isMountedRef = useRef(true)

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
            abortControllerRef.current?.abort()
        }
    }, [])

    const search = useCallback(async (query: string) => {
        const trimmedQuery = query.trim()

        // Abort previous request
        abortControllerRef.current?.abort()
        setSelectedUserIds(new Set())
        
        if (!trimmedQuery) {
            setState(prev => ({ ...prev, users: [], isLoading: false, error: null }))
            return
        }
        
        const controller = new AbortController()
        abortControllerRef.current = controller

        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }))

        const result = await searchGithubUser(trimmedQuery, { 
            signal: controller.signal 
        })

        // Don't update state if aborted or unmounted
        if (controller.signal.aborted || !isMountedRef.current) {
            return
        }

        if (result.error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: result.error,
            }))
            return
        }

        const users: DisplayUser[] = (result.data?.items ?? []).map(user => ({
            ...user,
            internalId: crypto.randomUUID(),
        }))

        setState({
            users,
            isLoading: false,
            error: null,
        })
    }, [])

    const duplicateSelected = useCallback(() => {
        // Read current selection (not via callback)
        if (selectedUserIds.size === 0) return
    
        // Update users
        setState(prev => {
            const duplicates: DisplayUser[] = prev.users
                .filter(user => selectedUserIds.has(user.internalId))
                .map(user => ({
                    ...user,
                    internalId: crypto.randomUUID(),
                }))
            return {
                ...prev,
                users: [...prev.users, ...duplicates],
            }
        })
    
        // Clear selection separately
        setSelectedUserIds(new Set())
    }, [selectedUserIds])

    const deleteSelected = useCallback(() => {
        if (selectedUserIds.size === 0) return
    
        setState(prev => ({
            ...prev,
            users: prev.users.filter(user => !selectedUserIds.has(user.internalId)),
        }))
    
        setSelectedUserIds(new Set())
    }, [selectedUserIds])

    return {
        ...state,
        selectedUserIds,
        setSelectedUserIds,
        selectedCount: selectedUserIds.size,
        search,
        duplicateSelected,
        deleteSelected,
    }
}