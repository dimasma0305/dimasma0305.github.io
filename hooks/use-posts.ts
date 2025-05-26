import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { fetchAllPosts, prefetchPosts, invalidateCache } from "@/lib/posts-loader"
import type { Post } from "@/lib/posts-client"

interface UsePostsReturn {
  posts: Post[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => void
  clearError: () => void
}

interface PostsState {
  posts: Post[]
  loading: boolean
  refreshing: boolean
  error: string | null
}

// Shared cache for performance - but separate from loading state
let sharedPostsCache: Post[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Per-hook instance request tracking to avoid global state pollution
interface RequestManager {
  currentRequest: AbortController | null
  isLoading: boolean
}

export function usePosts(): UsePostsReturn {
  const [state, setState] = useState<PostsState>({
    posts: sharedPostsCache || [],
    loading: !sharedPostsCache,
    refreshing: false,
    error: null,
  })

  const mountedRef = useRef(true)
  const requestManagerRef = useRef<RequestManager>({
    currentRequest: null,
    isLoading: false
  })

  // Optimized state updater with safety checks
  const updateState = useCallback((update: Partial<PostsState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...update }))
    }
  }, [])

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    return sharedPostsCache && 
           cacheTimestamp && 
           (Date.now() - cacheTimestamp) < CACHE_DURATION
  }, [])

  // Load posts with proper error handling and cleanup
  const loadPosts = useCallback(async (isRefresh = false) => {
    const requestManager = requestManagerRef.current

    // Prevent duplicate requests for this hook instance
    if (requestManager.isLoading && !isRefresh) {
      return sharedPostsCache || []
    }

    // Cancel existing request
    if (requestManager.currentRequest) {
      requestManager.currentRequest.abort()
    }

    // Create new abort controller
    requestManager.currentRequest = new AbortController()
    requestManager.isLoading = true

    try {
      // Check cache first (unless refreshing)
      if (!isRefresh && isCacheValid()) {
        updateState({
          posts: sharedPostsCache!,
          loading: false,
          refreshing: false,
          error: null,
        })
        return sharedPostsCache!
      }

      updateState({ 
        [isRefresh ? 'refreshing' : 'loading']: true, 
        error: null 
      })

      if (isRefresh) {
        invalidateCache()
        sharedPostsCache = null
        cacheTimestamp = 0
      }

      const allPosts = await fetchAllPosts()

      // Check if request was aborted or component unmounted
      if (requestManager.currentRequest?.signal.aborted || !mountedRef.current) {
        return sharedPostsCache || []
      }

      // Update cache and state
      sharedPostsCache = allPosts
      cacheTimestamp = Date.now()
      
      updateState({
        posts: allPosts,
        loading: false,
        refreshing: false,
        error: null,
      })

      return allPosts
    } catch (err) {
      // Only update state if request wasn't aborted and component is still mounted
      if (!requestManager.currentRequest?.signal.aborted && mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load posts"
        updateState({
          loading: false,
          refreshing: false,
          error: errorMessage,
        })
      }
      throw err
    } finally {
      // Always cleanup request state
      requestManager.isLoading = false
      requestManager.currentRequest = null
    }
  }, [updateState, isCacheValid])

  const refresh = useCallback(() => {
    loadPosts(true).catch(() => {
      // Errors are handled in loadPosts
    })
  }, [loadPosts])

  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // Initial load effect
  useEffect(() => {
    // If we have valid cached data, use it immediately
    if (isCacheValid()) {
      updateState({ 
        posts: sharedPostsCache!, 
        loading: false,
        error: null 
      })
      return
    }

    // Otherwise load posts
    loadPosts().catch(() => {
      // Errors are handled in loadPosts
    })
  }, [loadPosts, updateState, isCacheValid])

  // Prefetch optimization
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchPosts().catch(() => {
        // Prefetch errors are not critical
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
      const requestManager = requestManagerRef.current
      if (requestManager.currentRequest) {
        requestManager.currentRequest.abort()
      }
      requestManager.isLoading = false
      requestManager.currentRequest = null
    }
  }, [])

  return useMemo(() => ({
    posts: state.posts,
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    refresh,
    clearError,
  }), [state, refresh, clearError])
}
