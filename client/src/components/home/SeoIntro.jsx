import { Plus } from 'lucide-react'
import { siteConfig, cityLine } from '../../config/site'

// (Home ka chhota SEO text + 4 FAQ. Sirf wahi baatein jo site par pehle se hain; koi number, rating ya guarantee nahi.)
const faqs = [
  {
    q: 'What do you make?',
    a: 'Custom-made sofas and recliners. We also make beds, headboards and dining, and do curtains and wallpaper.',
  },
  {
    q: 'How do I enquire?',
    a: 'Send us a WhatsApp message, call us, or fill the call back form. A photo of your room helps a lot.',
  },
  {
    q: 'Which areas do you serve?',
    a: `${siteConfig.areasServed}.`,
  },
  {
    q: 'Where is your shop?',
    a: `${siteConfig.addressLine}, ${cityLine}.`,
  },
]

function SeoIntro() {
  return (
    <section aria-labelledby="about-title" className="px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 id="about-title" className="text-4xl font-semibold md:text-5xl">
          Custom sofa manufacturer in {siteConfig.workLocation}
        </h2>
        <div className="mt-6 space-y-4 text-lg text-muted">
          <p>
            {siteConfig.name} makes custom-made sofas in {siteConfig.workLocation}. Our own team builds the frame, and we
            do the stitching, upholstery and finishing ourselves, so your sofa is made the way you want it for your
            room.
          </p>
          <p>
            Along with sofas, we make recliner sofas and recliner chairs, beds, headboards, dining sets and dining
            chairs. We also do curtains and wallpaper, so one team can help with more than one room.
          </p>
          <p>
            Enquiring is simple: send us a message on WhatsApp with what you have in mind and a photo of your room,
            call us, or ask for a call back. We deliver across Bengaluru and work with homes in{' '}
            {siteConfig.areasServed}.
          </p>
        </div>

        <h2 className="mt-12 text-3xl font-semibold">Common questions</h2>
        <div className="mt-6">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b-2 border-dashed border-line py-5 first:pt-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="chip clay clay-sky h-10 w-10 shrink-0 justify-center p-0">
                  <Plus size={20} className="transition-transform duration-300 group-open:rotate-45" />
                </span>
              </summary>
              <p className="mt-3 pr-12 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SeoIntro
