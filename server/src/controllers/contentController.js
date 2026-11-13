import Review from '../models/Review.js'
import InstagramPost from '../models/InstagramPost.js'
import Lead from '../models/Lead.js'
import Product from '../models/Product.js'
import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { assertObjectId } from '../utils/objectId.js'
import { deleteImage } from '../services/imageService.js'
import {
  reviewSchema,
  reviewUpdateSchema,
  instagramSchema,
  instagramUpdateSchema,
} from '../validators/contentValidator.js'

const SORT = { displayOrder: 1, createdAt: -1 }
const PUBLIC_LIMIT = 40

// (Reviews aur Instagram dono ka admin CRUD ek jaisa hai, isliye ek hi factory.
//  imageField: jis field mein Cloudinary image hai, taaki badalne/delete par purani image bhi hat jaye.)
function makeAdminCrud(Model, { create, update, label, imageField }) {
  const publicIdOf = (doc) => (imageField ? doc?.[imageField]?.publicId : '')

  return {
    async list(req, res) {
      const items = await Model.find().sort(SORT).select('-__v').lean()
      res.json({ success: true, data: items })
    },

    async create(req, res) {
      const data = parseOrThrow(create, req.body ?? {})
      const item = await Model.create(data)
      res.status(201).json({ success: true, data: item })
    },

    async update(req, res) {
      assertObjectId(req.params.id, label)
      const data = parseOrThrow(update, req.body ?? {})
      const item = await Model.findById(req.params.id)
      if (!item) throw new ApiError(404, `${label} not found`)

      const oldPublicId = publicIdOf(item)
      item.set(data)
      await item.save()

      if (imageField && data[imageField] && oldPublicId && oldPublicId !== publicIdOf(item)) {
        await deleteImage(oldPublicId)
      }
      res.json({ success: true, data: item })
    },

    async remove(req, res) {
      assertObjectId(req.params.id, label)
      const item = await Model.findById(req.params.id)
      if (!item) throw new ApiError(404, `${label} not found`)
      await item.deleteOne()
      await deleteImage(publicIdOf(item))
      res.json({ success: true, message: `${label} deleted` })
    },
  }
}

export const reviewAdmin = makeAdminCrud(Review, {
  create: reviewSchema,
  update: reviewUpdateSchema,
  label: 'Review',
})

export const instagramAdmin = makeAdminCrud(InstagramPost, {
  create: instagramSchema,
  update: instagramUpdateSchema,
  label: 'Instagram post',
  imageField: 'thumbnail',
})

// ---------------- Public ----------------

// GET /api/reviews
export async function getReviews(req, res) {
  const items = await Review.find({ isActive: true })
    .sort(SORT)
    .limit(PUBLIC_LIMIT)
    .select('customerName area text source')
    .lean()
  res.json({ success: true, data: items })
}

// GET /api/instagram
export async function getInstagramPosts(req, res) {
  const items = await InstagramPost.find({ isActive: true })
    .sort(SORT)
    .limit(PUBLIC_LIMIT)
    .select('url kind caption thumbnail')
    .lean()
  res.json({ success: true, data: items })
}

// ---------------- Admin dashboard ----------------

// GET /api/admin/overview (dashboard ke catalogue aur content counts)
export async function getOverview(req, res) {
  const [collections, categories, products, activeProducts, reviews, instagram, leads] = await Promise.all([
    ProductCollection.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Review.countDocuments({ isActive: true }),
    InstagramPost.countDocuments({ isActive: true }),
    Lead.countDocuments(),
  ])
  res.json({
    success: true,
    data: { collections, categories, products, activeProducts, reviews, instagram, leads },
  })
}
