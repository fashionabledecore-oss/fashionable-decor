import ImageBox from './ImageBox'

// (Photo ke charon taraf clay ka frame. shape: 'soft' | 'blob-a' | 'blob-b' | 'blob-c'. tilt degrees mein.
//  aspect = height / width, taaki frame ki jagah pehle se fix rahe aur layout na khiske.)
function PhotoFrame({ tone = 'coral', shape = 'soft', tilt = 0, aspect, className = '', imageClassName = '', ...image }) {
  const radius = shape === 'soft' ? 'rounded-[34px]' : shape
  const inner = shape === 'soft' ? 'rounded-[24px]' : shape
  return (
    <div
      className={`clay clay-${tone} p-2.5 sm:p-3.5 ${radius} ${className}`}
      style={{
        rotate: tilt ? `${tilt}deg` : undefined,
        aspectRatio: aspect ? `1 / ${aspect}` : undefined,
      }}
    >
      <ImageBox tone={tone} {...image} className={`h-full w-full ${inner} ${imageClassName}`} />
    </div>
  )
}

export default PhotoFrame
