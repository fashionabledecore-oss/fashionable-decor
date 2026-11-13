import mongoose from 'mongoose'

export const REVIEW_SOURCES = ['google', 'instagram', 'whatsapp', 'other']

// (Sirf asli customer reviews, unki permission ke saath. Star rating jaan-boojh kar nahi hai.)
const reviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: [true, 'Customer name is required'], trim: true, maxlength: 80 },
    area: { type: String, trim: true, maxlength: 80, default: '' },
    text: { type: String, required: [true, 'Review text is required'], trim: true, maxlength: 1000 },
    source: { type: String, enum: REVIEW_SOURCES, default: 'other' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

reviewSchema.index({ isActive: 1, displayOrder: 1 })

export default mongoose.model('Review', reviewSchema)
