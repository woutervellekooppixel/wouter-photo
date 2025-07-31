// app/blog/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isInNetherlands, setIsInNetherlands] = useState<boolean | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Check user's location
  useEffect(() => {
    async function checkLocation() {
      // Check for bypass parameter
      const urlParams = new URLSearchParams(window.location.search)
      const bypass = urlParams.get('access') === 'allow'
      
      if (bypass) {
        setIsInNetherlands(false)
        setLocationLoading(false)
        return
      }

      try {
        // First try to get IP-based location
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        // Check if user is in Netherlands
        const inNetherlands = data.country_code === 'NL'
        setIsInNetherlands(inNetherlands)
      } catch (error) {
        console.log('Could not determine location, showing blog anyway')
        setIsInNetherlands(false) // Default to showing blog if location check fails
      } finally {
        setLocationLoading(false)
      }
    }

    checkLocation()
  }, [])

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (err) {
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const categories = ['all', ...Array.from(new Set(posts.map(post => post.category)))]
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

  // Show loading while checking location
  if (locationLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Hide blog for Netherlands users
  if (isInNetherlands) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Blog Not Available</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                The blog section is currently not available in your region.
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <h1 className="text-3xl font-bold mb-8">Blog</h1>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            <span className="ml-2">Loading blog posts...</span>
          </div>
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
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">Blog</h1>
        
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? 'All posts' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center text-black dark:text-white">
            <p>No blog posts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {post.image && (
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="aspect-video overflow-hidden relative cursor-pointer">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3}
                        />
                      </div>
                    </Link>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <time className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-bold mb-3 text-black dark:text-white hover:underline cursor-pointer transition-colors duration-200">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-black dark:text-white hover:underline font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  )
}
