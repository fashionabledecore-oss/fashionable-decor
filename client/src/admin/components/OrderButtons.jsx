import { ArrowDown, ArrowUp } from 'lucide-react'

// (Upar/neeche buttons. Save karne ka kaam admin/reorder.js ka saveNewOrder karta hai.)
function OrderButtons({ index, count, onMove, label = 'item' }) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
        aria-label={`Move ${label} up`}
        className="rounded-full bg-beige p-2 text-walnut disabled:opacity-30"
      >
        <ArrowUp size={16} />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={index === count - 1}
        aria-label={`Move ${label} down`}
        className="rounded-full bg-beige p-2 text-walnut disabled:opacity-30"
      >
        <ArrowDown size={16} />
      </button>
    </div>
  )
}

export default OrderButtons
