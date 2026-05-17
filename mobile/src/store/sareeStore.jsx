import { create } from 'zustand';
import { getSarees } from '../api/sarees';

const useSareeStore = create((set, get) => ({
  sarees: [],
  nextCursor: null,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,

  fetchSarees: async (params = {}, reset = false) => {
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true, ...(reset ? { isRefreshing: true } : {}) });

    try {
      const cursor = reset ? undefined : state.nextCursor;
      const { data } = await getSarees({ ...params, cursor, limit: 20 });

      set({
        sarees: reset ? data.data : [...state.sarees, ...data.data],
        nextCursor: data.nextCursor,
        hasMore: data.hasMore,
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      set({ isLoading: false, isRefreshing: false });
      console.error('Fetch sarees error:', error.message);
    }
  },

  reset: () => set({ sarees: [], nextCursor: null, hasMore: true, isLoading: false }),
}));

export default useSareeStore;
