// (Thoda tircha clay sticker. hand = Caveat font mein.)
function Sticker({ tone = 'mustard', tilt = -2, hand = false, className = '', children, as: Tag = 'span', ...rest }) {
  return (
    <Tag
      className={`sticker clay clay-${tone} ${hand ? 'hand text-xl' : 'text-sm'} ${className}`}
      style={{ '--tilt': `${tilt}deg` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Sticker
