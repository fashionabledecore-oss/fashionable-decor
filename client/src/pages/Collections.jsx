import { siteConfig, inCity } from '../config/site'
import { useProductLines } from '../hooks/useProductLines'
import Seo from '../components/common/Seo'
import PageHeader from '../components/common/PageHeader'
import ErrorState from '../components/common/ErrorState'
import ProductLineGrid from '../components/products/ProductLineGrid'

function Collections() {
  const { lines, error } = useProductLines()

  return (
    <>
      <Seo
        title={`Sofas, Recliners, Beds and More${inCity} | ${siteConfig.name}`}
        description={`Sofas made by our own team${inCity}, plus recliners, beds, headboards, dining, curtains and wallpaper. Enquire with ${siteConfig.name} on WhatsApp.`}
      />
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <PageHeader
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
          kicker="everything we make"
          title="All products"
          intro="Tap a product to see photos and ask us about it."
          tone="sky"
        />
        <div className="mt-12">
          {error && <ErrorState message={error.message} />}
          <ProductLineGrid lines={lines} />
        </div>
      </div>
    </>
  )
}

export default Collections
