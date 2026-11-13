import Breadcrumbs from '../common/Breadcrumbs'
import Seo from '../common/Seo'
import { siteConfig } from '../../config/site'

function LegalLayout({ title, updated, intro, sections }) {
  return (
    <>
      <Seo title={`${title} | ${siteConfig.name}`} description={intro} />
      <div className="mx-auto max-w-2xl px-4 pt-32 pb-24 sm:px-6 md:pt-40">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
        <h1 className="mt-6 text-4xl font-semibold md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
        <p className="mt-8 text-lg">{intro}</p>

        <div className="mt-10 space-y-9">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl font-semibold">{s.heading}</h2>
              <p className="mt-2 text-muted">{s.text}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

export default LegalLayout
