import mongoose from 'mongoose'

export const LEAD_SOURCES = ['website', 'ads-landing']
// (Visitor kis cheez mein interested hai. Khaali = form mein chuna nahi.)
export const LEAD_INTERESTS = ['sofa-set', 'l-shape', 'recliner', 'bed', 'headboard', 'dining', 'curtains', 'wallpaper', 'other']
// (Purani leads mein ye values ho sakti hain. Save/filter ke liye valid, form mein nahi dikhti.)
export const LEGACY_INTERESTS = ['bed-headboard', 'curtains-wallpaper']
export const INTEREST_LABELS = {
  'sofa-set': 'Sofa set',
  'l-shape': 'L-shape sofa',
  recliner: 'Recliner',
  bed: 'Bed',
  headboard: 'Headboard',
  dining: 'Dining table',
  curtains: 'Curtains',
  wallpaper: 'Wallpaper',
  other: 'Other',
  'bed-headboard': 'Bed or headboard',
  'curtains-wallpaper': 'Curtains or wallpaper',
}

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 80 },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: '',
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    // (Message optional hai: sirf naam + number se bhi lead aa sakti hai, ads par zyada leads aati hain.)
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    interest: { type: String, enum: [...LEAD_INTERESTS, ...LEGACY_INTERESTS, ''], default: '' },    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    type: { type: String, enum: ['callback', 'contact'], default: 'callback' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    // (Lead kahan se aayi. Naye leads = website; purani leads mein 'ads-landing' ho sakta hai.)
    source: { type: String, enum: LEAD_SOURCES, default: 'website' },
    sourcePath: { type: String, trim: true, maxlength: 300, default: '' },
    utm: {
      source: { type: String, trim: true, maxlength: 100, default: '' },
      medium: { type: String, trim: true, maxlength: 100, default: '' },
      campaign: { type: String, trim: true, maxlength: 150, default: '' },
    },
  },
  { timestamps: true },
)

// (Admin leads list: status filter + naya pehle.)
leadSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Lead', leadSchema)