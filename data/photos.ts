export type Photo = {
  id: string
  src: string
  alt: string
  category: 'concerts' | 'events' | 'misc'
}

export const photos: Photo[] = [
  // Concerts
  ...Array.from({ length: 102 }, (_, i) => ({
    id: `portfolio-concerts${i + 1}.webp`,
    src: `/photos/concerts/portfolio-concerts${i + 1}.webp`,
    alt: `portfolio-concerts${i + 1}`,
    category: 'concerts' as const,
  })),

  // Events
  ...Array.from({ length: 104 }, (_, i) => ({
    id: `portfolio-events${i + 1}.webp`,
    src: `/photos/events/portfolio-events${i + 1}.webp`,
    alt: `portfolio-events${i + 1}`,
    category: 'events' as const,
  })),

  // Misc
  ...Array.from({ length: 42 }, (_, i) => ({
    id: `portfolio-misc${i + 1}.webp`,
    src: `/photos/misc/portfolio-misc${i + 1}.webp`,
    alt: `portfolio-misc${i + 1}`,
    category: 'misc' as const,
  })),
]