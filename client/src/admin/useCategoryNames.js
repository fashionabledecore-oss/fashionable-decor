import { adminGetProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'

// (Ek category ke saare products ke naam (hidden bhi), same list API se jo Products page use karta hai.)
async function fetchCategoryNames(category) {
  const out = []
  for (let page = 1; ; page++) {
    const res = await adminGetProducts({ category, status: 'all', page, limit: 100 })
    out.push(...(res.data ?? []).map((p) => ({ _id: p._id, name: p.name })))
    if (page >= (res.pagination?.totalPages || 1)) return out
  }
}

// Returns useAsync state; data = [{ _id, name }] ([] while no category is chosen).
export function useCategoryNames(categoryId) {
  return useAsync(() => (categoryId ? fetchCategoryNames(categoryId) : Promise.resolve([])), `category-names:${categoryId || 'none'}`)
}
