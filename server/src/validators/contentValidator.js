import { z } from 'zod'
import { REVIEW_SOURCES } from '../models/Review.js'
import { INSTAGRAM_KINDS } from '../models/InstagramPost.js'

const order = z.number().int().min(0).max(10000)

const image = (required) =>
  z.object({
    url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => (required ? v.startsWith('https://') : v === '' || v.startsWith('https://')), required
        ? 'Please upload an image.'
        : 'Image URL must start with https://'),
    publicId: z.string().trim().max(200).default(''),
  })

// (instagram.com/p/..., /reel/..., /reels/..., /tv/... sab chalte hain. Shortcode yahin se nikalta hai.)
export const INSTAGRAM_URL = /^https:\/\/(www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?(\?.*)?$/


// ---- Reviews ----
export const reviewSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name is required.').max(80),
  area: z.string().trim().max(80).optional(),
  text: z.string().trim().min(5, 'Please add the review text.').max(1000),
  source: z.enum(REVIEW_SOURCES),
  displayOrder: order.optional(),
  isActive: z.boolean().optional(),
})
export const reviewUpdateSchema = reviewSchema.partial()

// ---- Instagram posts ----
export const instagramSchema = z.object({
  url: z
    .string()
    .trim()
    .max(300)
    .refine((v) => INSTAGRAM_URL.test(v), 'Paste a full instagram.com link to a reel or post.'),
  kind: z.enum(INSTAGRAM_KINDS),
  caption: z.string().trim().max(150).optional(),
  thumbnail: image(false).optional(),
  displayOrder: order.optional(),
  isActive: z.boolean().optional(),
})
export const instagramUpdateSchema = instagramSchema.partial()
