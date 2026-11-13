// (Fashionable Decor ka catalogue dhaancha: 7 product lines (collections) + starter categories.
//  `npm run seed:structure` (scripts/seedStructure.js) ise use karta hai. Client ka productLines (config/site.js) same slugs use karta hai.)
export const STRUCTURE = [
  {
    slug: 'sofas',
    name: 'Sofas',
    tagline: 'Sofas of all types, made by our own team.',
    categories: [
      ['sofa-sets', 'Sofa Sets'],
      ['l-shape-sofas', 'L-Shape Sofas'],
      ['corner-sofas', 'Corner Sofas'],
      ['single-seaters', 'Single Seaters'],
    ],
  },
  {
    slug: 'recliners',
    name: 'Recliners',
    tagline: 'Recliner sofas and recliner chairs.',
    categories: [
      ['recliner-sofas', 'Recliner Sofas'],
      ['recliner-chairs', 'Recliner Chairs'],
    ],
  },
  { slug: 'beds', name: 'Beds', tagline: 'Beds.', categories: [['beds', 'Beds']] },
  { slug: 'headboards', name: 'Headboards', tagline: 'Headboards.', categories: [['headboards', 'Headboards']] },
  {
    slug: 'dining',
    name: 'Dining',
    tagline: 'Dining sets and dining chairs.',
    categories: [
      ['dining-sets', 'Dining Sets'],
      ['dining-chairs', 'Dining Chairs'],
    ],
  },
  { slug: 'curtains', name: 'Curtains', tagline: 'Curtains.', categories: [['curtains', 'Curtains']] },
  { slug: 'wallpaper', name: 'Wallpaper', tagline: 'Wallpaper.', categories: [['wallpaper', 'Wallpaper']] },
]
