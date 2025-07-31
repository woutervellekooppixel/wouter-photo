import { Metadata } from 'next'

type BlogPost = {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  slug: string
  image?: string
  category: string
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // In a real app, you'd fetch from your API or database
    // For now, we'll simulate the blog posts data
    const posts: BlogPost[] = [
      {
        id: '1',
        title: 'Essential Gear for Concert Photography: My Complete Setup',
        excerpt: 'After years of shooting in challenging low-light venues, here\'s the exact gear that never lets me down.',
        content: 'Complete gear breakdown...',
        date: '2025-01-28',
        slug: 'essential-gear-concert-photography',
        image: '/photos/concerts/portfolio-concerts1.webp',
        category: 'gear'
      }
    ]
    
    return posts.find(post => post.slug === slug) || null
  } catch (error) {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Wouter Vellekoop Photography',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: `${post.title} | Wouter Vellekoop Photography Blog`,
    description: post.excerpt,
    keywords: [
      'concert photography',
      'photography gear',
      'professional photography',
      'camera equipment',
      'photography tips',
      post.category === 'gear' ? 'camera gear reviews' : 'photography techniques',
      'Canon photography',
      'event photography'
    ],
    authors: [{ name: 'Wouter Vellekoop' }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://wouter.photo/blog/${post.slug}`,
      siteName: 'Wouter Vellekoop Photography',
      images: post.image ? [
        {
          url: `https://wouter.photo${post.image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      authors: ['Wouter Vellekoop'],
      section: 'Photography',
      tags: [post.category, 'photography', 'concert photography'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [`https://wouter.photo${post.image}`] : [],
      creator: '@woutervellekoop',
    },
    alternates: {
      canonical: `https://wouter.photo/blog/${post.slug}`,
    },
    other: {
      'article:author': 'Wouter Vellekoop',
      'article:published_time': post.date,
      'article:section': 'Photography',
      'article:tag': post.category,
    },
  }
}
