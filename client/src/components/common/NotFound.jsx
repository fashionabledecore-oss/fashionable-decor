import { Link } from 'react-router-dom'
import Seo from './Seo'
import { DoodleLamp } from './Doodles'
import { siteConfig } from '../../config/site'

function NotFound({ message = 'We could not find what you were looking for.' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center">
      <Seo title={`Page Not Found | ${siteConfig.name}`} description={message} noindex />
      <span className="clay clay-mustard blob-a inline-flex h-24 w-24 items-center justify-center">
        <DoodleLamp size={52} />
      </span>
      <h1 className="mt-6 text-4xl font-semibold">This page is not here.</h1>
      <p className="mt-3 max-w-sm text-muted">{message}</p>
      <Link to="/" className="btn clay clay-coral clay-press mt-7">
        Back to the home page
      </Link>
    </div>
  )
}

export default NotFound
