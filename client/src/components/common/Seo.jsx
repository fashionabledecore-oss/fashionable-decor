import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig } from '../../config/site'
import { absoluteUrl, clip } from '../../utils/seo'
import { cloudinaryUrl } from '../../utils/cloudinary'

// (Head mein tag dhundh kar update karta hai, na mile toh naya banata hai. Isse index.html wale default tags duplicate nahi hote.)
function setTag(tagName, key, keyValue, attr, value) {
  let el = document.head.querySelector(`${tagName}[${key}="${keyValue}"]`)
  if (!value) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement(tagName)
    el.setAttribute(key, keyValue)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const setMeta = (name, content) => setTag('meta', 'name', name, 'content', content)
const setProperty = (property, content) => setTag('meta', 'property', property, 'content', content)

/**
 * Per-page SEO tags.
 * title: full page title. path: canonical path (default: current path, without query).
 * image: absolute URL or /public path. noindex: hide the page from search engines.
 */
function Seo({ title, description, path, image, type = 'website', noindex = false }) {
  const { pathname } = useLocation()

  const fullTitle = title || siteConfig.defaultTitle
  const desc = clip(description || siteConfig.defaultDescription)
  const url = absoluteUrl(path ?? pathname)
  // (Cloudinary image ho toh share preview ke size 1200x630 mein crop.)
  const imageUrl = absoluteUrl(image ? cloudinaryUrl(image, { width: 1200, height: 630 }) : siteConfig.ogImage)

  useEffect(() => {
    document.title = fullTitle
    setMeta('description', desc)
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setTag('link', 'rel', 'canonical', 'href', noindex ? '' : url)

    setProperty('og:site_name', siteConfig.name)
    setProperty('og:type', type)
    setProperty('og:title', fullTitle)
    setProperty('og:description', desc)
    setProperty('og:url', url)
    setProperty('og:image', imageUrl)
    setProperty('og:locale', 'en_IN')

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)
    setMeta('twitter:image', imageUrl)
  }, [fullTitle, desc, url, imageUrl, type, noindex])

  return null
}

export default Seo
