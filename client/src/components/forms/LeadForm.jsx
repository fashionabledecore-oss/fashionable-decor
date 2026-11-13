import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, MessageCircle } from 'lucide-react'
import FormField from './FormField'
import { submitLead } from '../../services/api'
import { getUtm } from '../../utils/utm'
import { trackLead } from '../../utils/tracking'
import { getWhatsAppLink } from '../../config/site'
import { INTERESTS } from '../../utils/interests'

const interestOptions = [{ value: '', label: 'Choose one (optional)' }, ...INTERESTS]

// (Form har jagah same: naam, phone, kya chahiye, message (optional).)
const emptyValues = { name: '', phone: '', interest: '', message: '', website: '' }

// (+91, 91 ya 0 se start hone wale numbers bhi chalenge. Final number 10 digit ka, 6-9 se shuru.)
function cleanPhone(phone) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

function validate(values) {
  const errors = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name.'
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone(values.phone))) {
    errors.phone = 'Please enter a valid 10-digit mobile number.'
  }

  if (values.message.trim().length > 1000) {
    errors.message = 'Please keep the message under 1000 characters.'
  }

  return errors
}

// (source: hamesha 'website'; purani leads mein 'ads-landing' bhi ho sakta hai.)
function LeadForm({
  type = 'callback',
  defaultMessage = '',
  defaultInterest = '',
  productSlug,
  source = 'website',
  submitLabel = 'Request a call back',
}) {
  const [values, setValues] = useState({ ...emptyValues, message: defaultMessage, interest: defaultInterest })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const found = validate(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setStatus('sending')
    setServerMessage('')
    try {
      await submitLead({
        name: values.name.trim(),
        phone: cleanPhone(values.phone),
        email: '',
        interest: values.interest,
        message: values.message.trim(),
        website: values.website, // (honeypot, insaan ke liye hamesha khaali)
        type,
        source,
        productSlug,
        sourcePath: window.location.pathname,
        utm: getUtm(),
      })
      trackLead({
        content_name: productSlug || 'general',
        lead_type: type,
        lead_source: source,
        ...(values.interest && { content_category: values.interest }),
      })
      setStatus('success')
      setValues({ ...emptyValues, message: defaultMessage, interest: defaultInterest })
    } catch (err) {
      // (Server ne field-wise galti batayi toh wahi fields ke neeche dikhao.)
      if (err.status === 400 && err.errors) {
        setErrors(err.errors)
        setStatus('idle')
        return
      }
      const friendly = err.status === 0 || (err.status >= 400 && err.status < 500) ? err.message : ''
      setServerMessage(friendly)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-6 text-center" role="status">
        <span className="clay clay-sage blob-a mx-auto inline-flex h-20 w-20 items-center justify-center">
          <CheckCircle2 size={36} />
        </span>
        <h3 className="mt-5 text-2xl font-semibold">Thank you, we have it.</h3>
        <p className="mx-auto mt-2 max-w-xs text-muted">
          We will call you back soon. If it is urgent, message us on WhatsApp.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            href={getWhatsAppLink('Hello, I just sent a call back request on your website.')}
            target="_blank"
            rel="noreferrer"
            className="btn clay clay-sage clay-press text-sm"
          >
            <MessageCircle size={18} /> Message us on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink"
          >
            Send another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField
        label="Your name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        required
        autoComplete="name"
        placeholder="Enter your full name"
      />
      <FormField
        label="Mobile number"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={handleChange}
        error={errors.phone}
        required
        autoComplete="tel"
        placeholder="10-digit mobile number"
      />
      <FormField
        label="What are you looking for?"
        name="interest"
        as="select"
        value={values.interest}
        onChange={handleChange}
        error={errors.interest}
        options={interestOptions}
      />
      <FormField
        label="Message (optional)"
        name="message"
        as="textarea"
        rows={3}
        value={values.message}
        onChange={handleChange}
        error={errors.message}
        placeholder="Anything to add? The size of your room helps."
      />

      {/* Honeypot field (hidden from real users) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="field-website">Website</label>
        <input
          id="field-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      {status === 'error' && (
        <p className="flex items-center gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger" role="alert">
          <AlertCircle size={18} className="shrink-0" />
          {serverMessage || 'Something went wrong. Please try again or message us on WhatsApp.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn clay clay-coral clay-press w-full text-base"
      >
        {status === 'sending' ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Sending...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}

export default LeadForm