import { siteConfig } from '../config/site'
import Seo from '../components/common/Seo'
import Hero from '../components/home/Hero'
import ProductsSection from '../components/home/ProductsSection'
import HowItWorks from '../components/home/HowItWorks'
import InstagramSection from '../components/home/InstagramSection'
import Testimonials from '../components/home/Testimonials'
import ClosingEnquiry from '../components/home/ClosingEnquiry'

// (Order fixed: Hero, Products, How we make, Instagram (agar posts), Reviews (sirf 3+ asli), Enquiry form.)
function Home() {
  return (
    <>
      <Seo title={siteConfig.defaultTitle} description={siteConfig.defaultDescription} path="/" />
      <Hero />
      <ProductsSection />
      <HowItWorks />
      <InstagramSection />
      <Testimonials />
      <ClosingEnquiry />
    </>
  )
}

export default Home
