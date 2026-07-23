import { computed, ref, watch } from 'vue'
import { useInfiniteQuery, type QueryFunctionContext } from '@tanstack/vue-query'
import { useErrorHandler } from '@mentor-forge/mentorhub_spa_utils'
import type { ListParams } from '@/api/types'

export interface UseOffsetListOptions<T> {
  queryKey: readonly unknown[]
  queryFn: (params: ListParams) => Promise<T[]>
  size?: number
  sort_by?: string
  order?: 'asc' | 'desc'
  name?: string
}

export function useOffsetList<T>(options: UseOffsetListOptions<T>) {
  const size = ref(options.size ?? 20)
  const sortBy = ref(options.sort_by ?? 'name')
  const order = ref<'asc' | 'desc'>(options.order ?? 'asc')
  const searchQuery = ref(options.name ?? '')
  const debouncedSearch = ref('')

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, (value) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = value
    }, 300)
  })

  const queryKey = computed(() => [
    ...options.queryKey,
    debouncedSearch.value,
    sortBy.value,
    order.value,
    size.value,
  ] as const)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<T[], Error, T[], readonly unknown[], number>({
    queryKey,
    queryFn: ({ pageParam }: QueryFunctionContext<readonly unknown[], number>) =>
      options.queryFn({
        offset: pageParam,
        size: size.value,
        sort_by: sortBy.value,
        order: order.value,
        name: debouncedSearch.value || undefined,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === size.value
        ? allPages.reduce((offset, page) => offset + page.length, 0)
        : undefined,
    initialPageParam: 0,
  })

  const items = computed(() => {
    if (!data.value) return []
    const infiniteData = data.value as unknown as { pages: T[][] }
    return infiniteData.pages.flat()
  })

  const { showError, errorMessage } = useErrorHandler(error as any)

  function loadMore() {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      fetchNextPage()
    }
  }

  function updateSearchQuery(value: string | null) {
    searchQuery.value = value || ''
  }

  return {
    items,
    isLoading,
    isFetchingNextPage,
    hasMore: hasNextPage,
    loadMore,
    showError,
    errorMessage,
    searchQuery,
    debouncedSearch: updateSearchQuery,
    debouncedSearchValue: debouncedSearch,
    sortBy,
    order,
    setSortBy: (field: string) => { sortBy.value = field },
    setOrder: (value: 'asc' | 'desc') => { order.value = value },
  }
}
