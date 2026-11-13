import mongoose from 'mongoose'

export const INSTAGRAM_KINDS = ['reel', 'post']

// (Home page "Watch our work". Embed sirf click par load hota hai, page load par Instagram ki koi script nahi.)
const instagramPostSchema = new mongoose.Schema(
  {
    url: { type: String, required: [true, 'Instagram link is required'], trim: true, maxlength: 300 },
    kind: { type: String, enum: INSTAGRAM_KINDS, default: 'reel' },
    caption: { type: String, trim: true, maxlength: 150, default: '' },
    thumbnail: {
      url: { type: String, trim: true, default: '' },
      publicId: { type: String, trim: true, default: '' },
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

instagramPostSchema.index({ isActive: 1, displayOrder: 1 })

export default mongoose.model('InstagramPost', instagramPostSchema)
