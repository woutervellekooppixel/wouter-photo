export type Photo = {
  id: string
  src: string
  alt: string
  category: 'concerts' | 'events' | 'misc'
}

export const photos: Photo[] = [
  { id: '1', src: '/photos/concerts/portfolio-1.jpg', alt: 'Portfolio 1', category: 'events' },
  { id: '2', src: '/photos/concerts/portfolio-2.jpg', alt: 'Portfolio 2', category: 'events' },
  { id: '3', src: '/photos/concerts/portfolio-3.jpg', alt: 'Portfolio 3', category: 'events' },
  { id: '4', src: '/photos/concerts/portfolio-4.jpg', alt: 'Portfolio 4', category: 'misc' },
  { id: '5', src: '/photos/concerts/portfolio-5.jpg', alt: 'Portfolio 5', category: 'events' },
  { id: '6', src: '/photos/concerts/portfolio-6.jpg', alt: 'Portfolio 6', category: 'events' },
  { id: '7', src: '/photos/concerts/portfolio-7.jpg', alt: 'Portfolio 7', category: 'concerts' },
  { id: '8', src: '/photos/concerts/portfolio-8.jpg', alt: 'Portfolio 8', category: 'events' },
  { id: '9', src: '/photos/concerts/portfolio-9.jpg', alt: 'Portfolio 9', category: 'concerts' },
  { id: '10', src: '/photos/concerts/portfolio-10.jpg', alt: 'Portfolio 10', category: 'misc' },
  { id: '11', src: '/photos/concerts/portfolio-11.jpg', alt: 'Portfolio 11', category: 'events' },
  { id: '12', src: '/photos/concerts/portfolio-12.jpg', alt: 'Portfolio 12', category: 'misc' },
  { id: '13', src: '/photos/concerts/portfolio-13.jpg', alt: 'Portfolio 13', category: 'events' },
  { id: '14', src: '/photos/concerts/portfolio-14.jpg', alt: 'Portfolio 14', category: 'misc' },
  { id: '15', src: '/photos/concerts/portfolio-15.jpg', alt: 'Portfolio 15', category: 'misc' },
]
