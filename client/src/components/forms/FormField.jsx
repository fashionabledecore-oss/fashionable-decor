function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  as = 'input',
  required = false,
  placeholder = '',
  rows = 4,
  autoComplete,
  options, // (as="select" ke liye: [{ value, label }])
  hint,
}) {
  const id = `field-${name}`
  const Tag = as
  const extraProps = as === 'textarea' ? { rows } : as === 'select' ? {} : { type, placeholder }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </label>
      <Tag
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="clay-well mt-1.5"
        {...extraProps}
        {...(as === 'textarea' ? { placeholder } : {})}
      >
        {as === 'select'
          ? options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : undefined}
      </Tag>
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
