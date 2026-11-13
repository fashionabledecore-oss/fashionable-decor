import LeadForm from '../forms/LeadForm'

// (Home ka aakhri section: sirf form. WhatsApp/Call phone par neeche wali bar mein hain, desktop par navbar mein.)
function ClosingEnquiry() {
  return (
    <section id="call-back" aria-labelledby="call-back-title" className="scroll-mt-28 px-4 pt-20 pb-24 sm:px-6 md:pt-28">
      <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-12">
        <div className="md:col-span-5 md:pt-4">
          <h2 id="call-back-title" className="text-4xl leading-[1.05] font-semibold md:text-5xl">
            Tell us about your sofa
          </h2>
          <p className="mt-4 max-w-sm text-lg text-muted">
            Leave your name and number and we will call you back. That is all we need.
          </p>
        </div>

        <div className="clay clay-paper rounded-[32px] p-6 sm:p-9 md:col-span-7">
          <h3 className="text-2xl font-semibold">Request a call back</h3>
          <p className="mt-1 mb-6 text-sm text-muted">We only use your number to call you about this.</p>
          <LeadForm type="callback" />
        </div>
      </div>
    </section>
  )
}

export default ClosingEnquiry
