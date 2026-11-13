import { Router } from 'express'
import { getReviews, getInstagramPosts } from '../controllers/contentController.js'

// (Public: sirf active items. /api/reviews, /api/instagram)
const router = Router()

router.get('/reviews', getReviews)
router.get('/instagram', getInstagramPosts)

export default router
