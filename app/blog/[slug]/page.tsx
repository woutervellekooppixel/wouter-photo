// app/blog/[slug]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { trackBlogView, pageview } from '../../../lib/analytics'
import BlogSidebar from '../../../components/BlogSidebar'

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

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${params.slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post niet gevonden')
          } else {
            throw new Error('Failed to fetch post')
          }
          return
        }
        const data = await response.json()
        setPost(data.post)
        
        // Track blog view
        trackBlogView(data.post.slug, data.post.title, data.post.category)
        pageview(`/blog/${data.post.slug}`, data.post.title)
      } catch (err) {
        setError('Kon blog post niet laden')
        console.error('Error fetching post:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <p>Blog post aan het laden...</p>
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <h1 className="text-2xl font-bold mb-4">Post niet gevonden</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <Link 
            href="/blog" 
            className="text-black dark:text-white hover:underline"
          >
            ← Terug naar blog
          </Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <p>Blog post aan het laden...</p>
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <h1 className="text-2xl font-bold mb-4">Post niet gevonden</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <Link 
            href="/blog" 
            className="text-black dark:text-white hover:underline"
          >
            ← Terug naar blog
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Content with sidebar - consistent 75/25 layout */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="text-black dark:text-white">
              {/* Back button */}
              <Link 
                href="/blog" 
                className="inline-flex items-center text-black dark:text-white hover:underline mb-8"
              >
                ← Back to blog
              </Link>

              {/* Post header */}
              <header className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded text-sm">
                    {post.category}
                  </span>
                  <time className="text-gray-600 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {post.title}
                </h1>
                
                <p className="text-xl text-gray-700 dark:text-gray-300">
                  {post.excerpt}
                </p>
              </header>

              {/* Featured image */}
              {post.image && (
                <div className="mb-8 rounded-lg overflow-hidden relative aspect-video">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 75vw"
                  />
                </div>
              )}

              {/* Post content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div 
                  className="whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: post.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>

              {/* Footer */}
              <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/blog" 
                    className="text-black dark:text-white hover:underline"
                  >
                    ← More blog posts
                  </Link>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Published on {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </footer>
            </div>
          </div>

          {/* Sidebar - starts at same level as content */}
          <div className="lg:col-span-1">
            {/* Desktop: Regular sidebar */}
            <div className="hidden lg:block">
              <BlogSidebar />
            </div>
            
            {/* Mobile: Below content */}
            <div className="lg:hidden mt-12">
              <BlogSidebar />
            </div>
          </div>

        </div>
      </motion.div>
    </main>
  )
}
