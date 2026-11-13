// Business facts. Anything marked TODO(client) must be confirmed by Ainul Haq. Empty values are hidden.
export const siteConfig = {
  name: 'Fashionable Decor',
  tagline: 'Custom-made sofas from Whitefield, Bangalore',
  owner: 'Ainul Haq',
  yearsInBusiness: 'Almost 7 years',

  // WhatsApp format: 91 + 10-digit number, no + or spaces.
  whatsappNumber: '918318925706',
  phone: '+91 83189 25706',
  email: '', // TODO(client): business email (optional)

  workLocation: 'Whitefield, Bangalore',
  city: 'Bangalore',
  address: '', // TODO(client): shop address once it is fixed (hidden while empty)

  instagramHandle: 'fashionabledecore',
  instagramUrl: 'https://www.instagram.com/fashionabledecore/',
  googleReviewsUrl: '', // TODO(client): Google reviews link (optional)

  heroImageAlt: 'A custom-made sofa by Fashionable Decor in Whitefield, Bangalore',

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
      a: 'All our work happens in Whitefield, Bangalore. Customers come to us from all over Bangalore.',
    },
    {
      q: 'How do I enquire?',
      a: 'Send us a WhatsApp message, call us, or fill the form. A photo of your room helps a lot.',
    },
  ],

  offersCustomisation: true,

  logo: '/favicon.svg', // TODO(client): real logo file
  ogImage: '/images/hero.jpg',

  defaultTitle: 'Custom Sofa Manufacturer in Whitefield, Bangalore | Fashionable Decor',
  defaultDescription:
    'Fashionable Decor makes custom-made sofas in Whitefield, Bangalore. Our own team builds the frame and does the stitching and finishing. Also recliners, beds, headboards, dining, curtains and wallpaper.',
}

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
  'custom sofa manufacturer in Whitefield',
  'sofa manufacturer in Bangalore',
  'custom sofa Bangalore',
  'recliner sofa Bangalore',
  'L-shape sofa Bangalore',
]

export const SITE_URL = window.location.origin

export const phoneLink = `tel:${siteConfig.phone.replace(/\s/g, '')}`

// (" in Whitefield, Bangalore" page titles ke liye.)
export const inCity = ` in ${siteConfig.workLocation}`

export function getWhatsAppLink(message = 'Hello, I want to enquire about a sofa.') {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
}
