// (List mein item upar/neeche karna. Swap ke baad sirf jin items ki position badli unka displayOrder save hota hai.)
export async function saveNewOrder(items, index, dir, update) {
  const other = index + dir
  if (other < 0 || other >= items.length) return
  const ordered = [...items]
  ;[ordered[index], ordered[other]] = [ordered[other], ordered[index]]
  for (const [i, item] of ordered.entries()) {
    if (item.displayOrder !== i) await update(item._id, { displayOrder: i })
  }
}
