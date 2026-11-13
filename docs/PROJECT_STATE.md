# PROJECT STATE: Fashionable Decor

Small, simple website for a custom sofa manufacturer in Whitefield, Bangalore (owner Ainul Haq,
WhatsApp +91 83189 25706, Instagram @fashionabledecore). Goal: leads. No cart, prices or fake reviews.

## Site
- Pages: Home, Products (/collections → collection → category → product), Contact (includes about text,
  owner note, 5 FAQs, lead form), Privacy Policy.
- Home: Hero → Products (7 tiles) → How we make your sofa → Watch our work (Instagram, hidden if empty)
  → Reviews (only with 3+ real reviews) → Enquiry form.
- Product list: `productLines` in client/src/config/site.js, same slugs as server/src/data/catalogueStructure.js.
- Lead form everywhere: name, phone, what are you looking for, message (optional). UTM + `source` kept.
- Sticky WhatsApp + Call bar on phones. Hero photo: client/public/images/hero.jpg (placeholder if missing).

## Admin (/admin)
Dashboard, Leads (filters, CSV), Products, Collections, Categories, Reviews, Instagram.

## Env
- server/.env: MONGODB_URI, JWT_SECRET, CLIENT_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET, SMTP_USER, SMTP_PASS, LEAD_NOTIFY_EMAIL (+ NODE_ENV=production on hosting).
  Database name is fixed: fashionable_decor. Email uses Gmail.
- client: VITE_API_URL (/api live), optional VITE_META_PIXEL_ID.

## Deploy
- Backend on Render: root directory server, build npm install, start npm start, env vars from
  server/.env.example with NODE_ENV=production and CLIENT_URL = live domain(s).
- Frontend on Netlify: base directory client, build command npm run build, publish directory dist,
  environment variable VITE_API_URL=/api. client/public/_redirects forwards /api/* and /sitemap.xml
  to the Render backend (replace REPLACE-WITH-YOUR-BACKEND) and sends every other route to index.html.
- Lead email: sent in the background, never slows the form; a failure only logs one line, the lead is
  saved. Render's free plan blocks SMTP (ports 25/465/587), so after deployment lead emails need an
  HTTP email service (e.g. an email API over HTTPS) instead of Gmail SMTP.

## Run
- cd server, npm install, npm run seed:structure -- --dry-run, then npm run seed:structure -- --hide-others,
  npm run create-admin (on your own computer), npm run dev
- cd client, npm install, npm run dev

## TODO(client) (site.js)
Approve owner note, confirm "Curtains" (owner wrote "cottons"), shop address when fixed, email, Google
reviews link, real logo. Add client/public/images/hero.jpg. Replace REPLACE-WITH-YOUR-BACKEND in
client/public/_redirects and www.example.com in public/robots.txt.
