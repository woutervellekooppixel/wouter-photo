export type Photo = {
  id: string
  src: string
  alt: string
  category: 'concerts' | 'events' | 'misc'
  blurDataURL?: string
}

export const photos: Photo[] = [
  // Concerts
  ...Array.from({ length: 102 }, (_, i) => {
    const id = `portfolio-concerts${i + 1}.webp`
    return {
      id,
      src: `/photos/concerts/${id}`,
      alt: id,
      category: 'concerts' as const,
      blurDataURL: `/photos/concerts/${id.replace('.webp', '-blur.jpg')}`,
    }
  }),

  // Events
  ...Array.from({ length: 104 }, (_, i) => {
    const id = `portfolio-events${i + 1}.webp`
    return {
      id,
      src: `/photos/events/${id}`,
      alt: id,
      category: 'events' as const,
      blurDataURL: `/photos/events/${id.replace('.webp', '-blur.jpg')}`,
    }
  }),

  // Misc
  ...Array.from({ length: 42 }, (_, i) => {
    const id = `portfolio-misc${i + 1}.webp`
    return {
      id,
      src: `/photos/misc/${id}`,
      alt: id,
      category: 'misc' as const,
      blurDataURL: `/photos/misc/${id.replace('.webp', '-blur.jpg')}`,
    }
  }),
]