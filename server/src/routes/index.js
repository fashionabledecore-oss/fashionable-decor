import { Router } from 'express'
import collectionRoutes from './collectionRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import productRoutes from './productRoutes.js'
import leadRoutes from './leadRoutes.js'
import adminRoutes from './adminRoutes.js'
import contentRoutes from './contentRoutes.js'
import { getSitemap } from '../controllers/sitemapController.js'

const router = Router()

router.get('/sitemap.xml', getSitemap)
router.use('/collections', collectionRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/leads', leadRoutes)
router.use('/admin', adminRoutes)
router.use('/', contentRoutes)

export default router