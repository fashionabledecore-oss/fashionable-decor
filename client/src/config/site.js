// Business facts. Anything marked TODO(client) must be confirmed by Ainul Haq. Empty values are hidden.
export const siteConfig = {
  name: 'Fashionable Decor',
  tagline: 'Custom-made sofas from KR Puram, Bengaluru',
  owner: 'Ainul Haq',
  yearsInBusiness: 'Almost 7 years',

  // WhatsApp format: 91 + 10-digit number, no + or spaces.
  whatsappNumber: '918318925706',
  phone: '+91 83189 25706',
  email: '', // TODO(client): business email (optional)

  workLocation: 'KR Puram, Bengaluru',
  city: 'Bengaluru',

  // Full shop address (used by Contact, Footer, JSON-LD and the build-time prerender).
  shopName: 'Fashionable Decor',
  addressLine: 'Near Radiant Silver Bell Apartment, Kodigehalli, Sadarmangala Road, KR Puram',
  locality: 'KR Puram',
  state: 'Karnataka',
  postalCode: '560067',
  country: 'IN',
  mapUrl: 'https://maps.app.goo.gl/1cEbW8tfx5pfveFi9',
  areasServed: 'KR Puram, Kodigehalli, Whitefield, Mahadevapura, Marathahalli, Hoodi and all of Bengaluru',

  instagramHandle: 'fashionabledecore',
  instagramUrl: 'https://www.instagram.com/fashionabledecore',
  googleReviewsUrl: '', // TODO(client): Google reviews link (optional)

  heroImageAlt: 'A custom-made sofa by Fashionable Decor in KR Puram, Bengaluru',

  // TODO(client): Ainul Haq to approve before launch.
  ownerNote: [
    'For almost seven years we have been making sofas in Bangalore, mostly around Whitefield. Our own team builds the frame and we do the stitching and finishing ourselves, so we know every part of the sofa.',
    'Not sure what will suit your room? Send us a photo on WhatsApp and we will tell you honestly what will work.',
  ],

  faqs: [
    {
      q: 'Do you make custom sofas?',
      a: 'Yes. We make custom-made sofas. Tell us what you want on WhatsApp and we will talk it through with you.',
    },
    {
      q: 'Who makes the sofa?',
      a: 'Our own team builds the frame, and we do the stitching and finishing ourselves.',
    },
    {
      q: 'What else do you make?',
      a: 'Recliners, beds, headboards and dining. We also do curtains and wallpaper.',
    },
    {
      q: 'Where are you?',
      a: 'Our shop is near Radiant Silver Bell Apartment, Kodigehalli, Sadarmangala Road, KR Puram, Bengaluru 560067. Customers come to us from all over Bengaluru.',
    },
    {
      q: 'How do I enquire?',
      a: 'Send us a WhatsApp message, call us, or fill the form. A photo of your room helps a lot.',
    },
  ],

  offersCustomisation: true,

  logo: '/favicon.svg', // TODO(client): real logo file
  ogImage: 'https://fashionabledecor.in/og-image.jpg', // 1200x630

  defaultTitle: 'Custom Sofas in KR Puram, Bengaluru | Fashionable Decor',
  defaultDescription:
    'Custom sofa manufacturer in KR Puram, Bengaluru, serving Whitefield and all of Bengaluru. Also recliners, beds, headboards, dining, curtains and wallpaper.',
}

// Product page title (runtime <Seo> and build-time prerender):
// "<Product> - <Category> | Fashionable Decor, KR Puram, Bengaluru", area dropped if it goes over ~65 characters.
export function productTitle(productName, categoryName) {
  const head = categoryName ? `${productName} - ${categoryName}` : productName
  const full = `${head} | ${siteConfig.name}, ${siteConfig.workLocation}`
  return full.length <= 65 ? full : `${head} | ${siteConfig.name}`
}

// Image alt for product, category and collection photos: "<name> by Fashionable Decor, Bengaluru"
export const imageAlt = (name) => `${name} by ${siteConfig.name}, ${siteConfig.city}`

// "KR Puram, Bengaluru, Karnataka 560067"
export const cityLine = `${siteConfig.locality}, ${siteConfig.city}, ${siteConfig.state} ${siteConfig.postalCode}`

// The product range: the single list. `slug` must match the collection slug in admin
// (server/src/data/catalogueStructure.js). `interest` preselects the lead form.
export const productLines = [
  {
    slug: 'sofas',
    name: 'Sofas',
    line: 'Custom-made sofas. Our team builds the frame, and we do the stitching and finishing.',
    interest: 'sofa-set',
    tone: 'coral',
    doodle: 'chair',
  },
  { slug: 'recliners', name: 'Recliners', line: 'Recliner sofas and recliner chairs.', interest: 'recliner', tone: 'mustard', doodle: 'chair' },
  { slug: 'beds', name: 'Beds', line: 'Beds for your bedroom.', interest: 'bed', tone: 'sky', doodle: 'lamp' },
  { slug: 'headboards', name: 'Headboards', line: 'Headboards for your bed.', interest: 'headboard', tone: 'sage', doodle: 'lamp' },
  { slug: 'dining', name: 'Dining', line: 'Dining sets and dining chairs.', interest: 'dining', tone: 'lilac', doodle: 'plant' },
  // TODO(client): the owner wrote "cottons". Confirm this means curtains.
  { slug: 'curtains', name: 'Curtains', line: 'Curtains for your rooms.', interest: 'curtains', tone: 'butter', doodle: 'tape' },
  { slug: 'wallpaper', name: 'Wallpaper', line: 'Wallpaper for your walls.', interest: 'wallpaper', tone: 'sky', doodle: 'tape' },
]

export const keywords = [
  'custom sofa manufacturer in KR Puram',
  'sofa manufacturer in Bengaluru',
  'custom sofa Whitefield',
  'recliner sofa Bengaluru',
  'L-shape sofa Bengaluru',
]

// Real domain (canonical, og:url, og:image, JSON-LD). No trailing slash.
export const SITE_URL = 'https://fashionabledecor.in'

export const phoneLink = `tel:${siteConfig.phone.replace(/\s/g, '')}`

// (" in KR Puram, Bengaluru" page titles ke liye.)
export const inCity = ` in ${siteConfig.workLocation}`

export function getWhatsAppLink(message = 'Hello, I want to enquire about a sofa.') {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
}
