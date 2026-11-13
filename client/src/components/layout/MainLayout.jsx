import { Suspense } from 'react'
import { Outlet, useMatch } from 'react-router-dom'
import Loader from '../common/Loader'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from '../common/WhatsAppButton'
import { businessSchema, useJsonLd } from '../../utils/seo'

function MainLayout() {
  useJsonLd('business', businessSchema())
  const isProductPage = Boolean(useMatch('/collections/:collectionSlug/:categorySlug/:productSlug'))

  return (
    <div className="min-h-screen overflow-x-clip bg-blush">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Suspense fallback={<Loader fullPage />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* (Product page apna button khud render karta hai, product ke naam wale message ke saath.) */}
      {!isProductPage && <WhatsAppButton />}
    </div>
  )
}

export default MainLayout
