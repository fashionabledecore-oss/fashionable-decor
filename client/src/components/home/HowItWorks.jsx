const steps = [
  { title: 'Tell us what you want', text: 'Message us on WhatsApp with the sofa you have in mind. A photo of your room helps.' },
  { title: 'Our team builds the frame', text: 'Our own team builds the sofa frame.' },
  { title: 'Stitching and finishing', text: 'We do the stitching, upholstery and finishing ourselves.' },
  { title: 'We deliver', text: 'Anywhere in Bangalore.' },
]

function HowItWorks() {
  return (
    <section aria-labelledby="steps-title" className="mt-20 bg-mint px-4 py-16 sm:px-6 md:mt-28 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="steps-title" className="text-4xl font-semibold md:text-5xl">
          How we make your sofa
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {steps.map(({ title, text }, i) => (
            <li key={title}>
              <span className="clay clay-coral inline-flex h-12 w-12 items-center justify-center rounded-full font-display text-xl font-bold">
                {i + 1}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-1 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
