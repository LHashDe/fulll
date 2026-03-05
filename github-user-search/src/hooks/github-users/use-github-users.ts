import { useState, useCallback, useRef, useEffect } from 'react'
import { searchGithubUser } from '../../services/github/search-github-user'
import { type GithubUser } from '../../services/github/github-user'

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

type UseGithubUsersOptions = {
    onSearchStart?: () => void
}

//custom hook to manage github users: search, duplicate and delete users
export function useGithubUsers(options?: UseGithubUsersOptions) {
    const [state, setState] = useState<SearchState>(initialState)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isMountedRef = useRef(true)
    const onSearchStartRef = useRef(options?.onSearchStart)

    useEffect(() => {
        onSearchStartRef.current = options?.onSearchStart
    }, [options?.onSearchStart])

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
            abortControllerRef.current?.abort()
        }
    }, [])

    const search = useCallback(async (query: string) => {
        const trimmedQuery = query.trim()

        abortControllerRef.current?.abort()
        onSearchStartRef.current?.()
        
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

    const duplicateUsers = useCallback((userIds: Set<string>) => {
        if (userIds.size === 0) return
    
        setState(prev => {
            const duplicates: DisplayUser[] = prev.users
                .filter(user => userIds.has(user.internalId))
                .map(user => ({
                    ...user,
                    internalId: crypto.randomUUID(),
                }))
            return {
                ...prev,
                users: [...prev.users, ...duplicates],
            }
        })
    }, [])

    const deleteUsers = useCallback((userIds: Set<string>) => {
        if (userIds.size === 0) return
    
        setState(prev => ({
            ...prev,
            users: prev.users.filter(user => !userIds.has(user.internalId)),
        }))
    }, [])

    return {
        ...state,
        search,
        duplicateUsers,
        deleteUsers,
    }
}