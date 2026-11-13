// Hand-drawn inline SVGs. Paths are uneven on purpose. Colour comes from currentColor.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ size = 48, viewBox = '0 0 48 48', strokeWidth = 2.4, className = '', children, ...rest }) {
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      strokeWidth={strokeWidth}
      {...stroke}
      {...rest}
    >
      {children}
    </svg>
  )
}

// ---------- Lines ----------

export function Squiggle({ className = '' }) {
  return (
    <svg viewBox="0 0 200 22" preserveAspectRatio="none" aria-hidden="true" focusable="false" className={className} {...stroke} strokeWidth="5">
      <path d="M4 14c18-6 30 4 49-3s29-6 42 0 26 6 41-1 30-8 41-2 13 5 19 2" />
    </svg>
  )
}

// (Kisi ek shabd ke neeche haath se kheenchi line.)
export function Underlined({ children, className = 'text-coral' }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <Squiggle className={`absolute -bottom-[0.18em] left-[-3%] h-[0.32em] w-[106%] ${className}`} />
    </span>
  )
}

// ---------- Doodle icons ----------

export function DoodleLamp(props) {
  return (
    <Svg {...props}>
      <path d="M17 9.5c4.6-.7 9.4-.6 14.2.3l5.3 13.4c-8.8 1.6-17.4 1.5-26-.2L17 9.5Z" />
      <path d="M24.2 23.4c-.9 4.6.8 8.6-.2 13.4" />
      <path d="M15.5 39.6c5.4-2.3 11.5-2.1 17.4.3" />
      <path d="M30 15.5c.6 1.6 1.1 3 1.4 4.4" />
    </Svg>
  )
}

export function DoodleChair(props) {
  return (
    <Svg {...props}>
      <path d="M13.5 29c-.6-8.4 1.4-15.6 10.8-15.4 9.1.2 10.7 7 10.2 15.6" />
      <path d="M9.6 29.6c9.5-2.2 19.4-2.1 28.8.3l-1.3 5.4c-8.6 1.4-17.2 1.4-25.9-.2l-1.6-5.5Z" />
      <path d="M13.8 35.5 12 42.4M34.4 35.4l1.9 6.8" />
    </Svg>
  )
}

export function DoodlePlant(props) {
  return (
    <Svg {...props}>
      <path d="M14.6 28.4c6.2-.8 12.6-.7 19 .2l-3.2 13.2c-4.3.6-8.4.6-12.6-.1l-3.2-13.3Z" />
      <path d="M24 28c-.4-4.6.3-9 .1-13.5" />
      <path d="M23.8 27.6C22.4 20.8 17 16.2 9.6 15.4c1 7 6.6 11.2 14.2 12.2Z" />
      <path d="M24.4 27.2c1.8-7.6 7.6-13.4 14.6-14.6-.6 8-6.8 13.6-14.6 14.6Z" />
    </Svg>
  )
}

export function DoodleChat(props) {
  return (
    <Svg {...props}>
      <path d="M9.4 15.6c-.3-4.4 2.6-7 7.4-7.2l14.6-.3c5.2.1 8.6 2.8 8.4 7.6l-.2 8.6c-.2 4.6-3.2 7.2-8.2 7.1l-11.1.2-8 6.6 1.6-7.6c-2.8-.9-4.4-3.2-4.4-6.2l-.1-8.8Z" />
      <path d="M17.4 19.8h.2M24.2 19.6h.2M31 19.8h.2" strokeWidth="3.4" />
    </Svg>
  )
}

export function DoodleCamera(props) {
  return (
    <Svg {...props}>
      <path d="M8.4 17.2c-.2-3 1.6-4.8 4.6-4.8l5.2-.2 2.6-4.2 7.8-.2 2.8 4.2 5.4.1c3 .1 4.8 1.8 4.8 4.8l.1 16.4c0 3-1.8 4.6-4.8 4.6l-22.4.2c-3 0-4.6-1.6-4.8-4.6l-1.3-16.3Z" />
      <path d="M24.4 19c4.4 0 7.2 2.8 7 6.6-.2 4-3.2 6.6-7.2 6.4-4-.2-6.6-3-6.4-6.8.2-3.6 2.8-6.2 6.6-6.2Z" />
    </Svg>
  )
}

export function DoodleTape(props) {
  return (
    <Svg {...props}>
      <path d="M7.4 30.6 37.2 13.8l4.2 7.8-29.6 17-4.4-8Z" />
      <path d="M14.4 30.2l-1.8-3.4M19.8 27.2l-2.6-4.4M25.2 24.2l-1.8-3.4M30.6 21.2l-2.6-4.4M36 18.2l-1.8-3.4" strokeWidth="2" />
    </Svg>
  )
}

export function DoodleTick(props) {
  return (
    <Svg {...props}>
      <path d="M24.6 7.6c9.6.4 16 7.4 15.6 16.8-.4 9.4-7.8 16-17 15.6-9.4-.4-15.6-7.6-15.2-17 .4-8.4 6.4-14.4 14.4-15.2" />
      <path d="M15.6 24.6l6.2 6.4 11.4-13.2" />
    </Svg>
  )
}

export function DoodleSpark(props) {
  return (
    <Svg {...props}>
      <path d="M24.2 6.4c1 8.8 3.6 13.2 15.4 17.4-11.4 3.4-14.2 8-15.6 18.2-1.2-10-4.4-14.6-15.6-17.8 11-3.4 14.6-8 15.8-17.8Z" />
    </Svg>
  )
}

export function DoodlePin(props) {
  return (
    <Svg {...props}>
      <path d="M24.2 41.6C17.4 33.2 12.6 27 12.8 19.8 13 12.6 18 8 24.4 8.2c6.6.2 11.2 5.2 10.8 12-.4 7-4.6 12.6-11 21.4Z" />
      <path d="M24.2 15.4c2.6 0 4.4 1.8 4.4 4.2 0 2.6-2 4.4-4.6 4.2-2.4-.1-4-1.8-4-4.2.1-2.4 1.8-4.2 4.2-4.2Z" />
    </Svg>
  )
}

export function DoodlePhone(props) {
  return (
    <Svg {...props}>
      <path d="M15.6 7.8c1.6-.4 3 .4 3.8 2l3 6.6c.6 1.4.2 3-1 3.8l-2.6 2c1.8 4.2 4.8 7.4 9 9.4l2.2-2.6c1-1.2 2.6-1.4 4-.6l6.2 3.6c1.4.8 2 2.4 1.4 4l-1.4 3.6c-.8 2-2.8 3-5 2.6C22 41.2 10 29 7.6 15.4c-.4-2.2.8-4.2 2.8-5l5.2-2.6Z" />
    </Svg>
  )
}
