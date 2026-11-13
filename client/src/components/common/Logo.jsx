import { siteConfig } from '../../config/site'

// (Abhi wordmark + haath se bana lamp mark. Asli logo aaye toh is component ke andar <img src="/images/logo.svg" /> laga dena.)
// Wordmark ka rang parent se aata hai (currentColor).
function Logo({ className = '', size = 'md' }) {
  const big = size === 'lg'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" width={big ? 48 : 38} height={big ? 48 : 38} aria-hidden="true" className="shrink-0 -rotate-6">
        <path
          d="M25 2.5c11.6.3 20.8 8 20.5 21.2-.3 12.6-9.6 22-21.8 21.8C11 45.2 2.4 36.4 2.6 24.4 2.8 11.8 12 2.2 25 2.5Z"
          fill="var(--color-coral)"
        />
        <g fill="none" stroke="var(--color-ink)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 9.5c4.6-.7 9.4-.6 14.2.3l5.3 13.4c-8.8 1.6-17.4 1.5-26-.2L17 9.5Z" fill="var(--color-butter)" />
          <path d="M24.2 23.4c-.9 4.6.8 8.6-.2 13.4" />
          <path d="M15.5 39.6c5.4-2.3 11.5-2.1 17.4.3" />
        </g>
      </svg>
      <span className={`font-display font-semibold leading-none tracking-tight ${big ? 'text-2xl' : 'text-[1.2rem]'}`}>
        {siteConfig.name}
      </span>
    </span>
  )
}

export default Logo
