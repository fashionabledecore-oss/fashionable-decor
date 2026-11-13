import Breadcrumbs from './Breadcrumbs'

// (Har andar wale page ka upar wala hissa: breadcrumbs, chhota note, h1, intro. Saada rakha hai, koi blob nahi.)
function PageHeader({ crumbs, kicker, title, intro, children }) {
  return (
    <header className="pt-28 md:pt-36">
      <Breadcrumbs items={crumbs} />
      <div className="mt-5 max-w-3xl">
        {kicker && <p className="hand text-2xl text-terracotta">{kicker}</p>}
        <h1 className="mt-1 text-[2.5rem] leading-[1.04] font-semibold md:text-6xl">{title}</h1>
        {intro && <p className="mt-4 max-w-xl text-lg text-muted">{intro}</p>}
        {children}
      </div>
    </header>
  )
}

export default PageHeader
