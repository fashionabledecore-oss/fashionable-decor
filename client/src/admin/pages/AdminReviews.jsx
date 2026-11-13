import FormField from '../../components/forms/FormField'
import ContentManager, { SelectField } from '../components/ContentManager'

const SOURCES = [
  { value: 'google', label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Other' },
]
const sourceLabel = (v) => SOURCES.find((s) => s.value === v)?.label || v

function AdminReviews() {
  return (
    <ContentManager
      kind="reviews"
      title="Reviews"
      intro="Customer reviews for the home page. The section only appears once at least 3 reviews are active."
      note="Only add reviews that real customers have given, with their permission."
      addLabel="Add review"
      emptyText="No reviews yet. The reviews section stays hidden on the website until you add at least 3."
      toForm={(item) => ({
        customerName: item?.customerName ?? '',
        area: item?.area ?? '',
        text: item?.text ?? '',
        source: item?.source ?? 'google',
      })}
      toPayload={(v) => {
        const errors = {}
        if (v.customerName.trim().length < 2) errors.customerName = 'Please enter the customer name.'
        if (v.text.trim().length < 5) errors.text = 'Please add the review text.'
        if (Object.keys(errors).length) return { errors }
        return {
          payload: { customerName: v.customerName.trim(), area: v.area.trim(), text: v.text.trim(), source: v.source },
        }
      }}
      renderFields={({ values, set, errors }) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Customer name" name="customerName" value={values.customerName} onChange={(e) => set('customerName', e.target.value)} error={errors.customerName} required />
            <FormField label="Area (optional)" name="area" value={values.area} onChange={(e) => set('area', e.target.value)} error={errors.area} placeholder="e.g. Whitefield" />
          </div>
          <FormField label="What they said" name="text" as="textarea" rows={4} value={values.text} onChange={(e) => set('text', e.target.value)} error={errors.text} required />
          <SelectField label="Where did they leave it?" name="source" value={values.source} onChange={(e) => set('source', e.target.value)} options={SOURCES} error={errors.source} />
        </>
      )}
      renderItem={(item) => (
        <>
          <p className="line-clamp-5 text-sm whitespace-pre-line text-ink">{item.text}</p>
          <p className="mt-2 text-sm font-semibold text-ink">{item.customerName}</p>
          <p className="text-xs text-ink/60">{[item.area, sourceLabel(item.source)].filter(Boolean).join(' · ')}</p>
        </>
      )}
    />
  )
}

export default AdminReviews
