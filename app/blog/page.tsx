import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — Concert Photography Guides & Gear',
  description:
    'Concert photography guides, gear recommendations and editing workflows — written from the photo pit by Wouter Vellekoop (North Sea Jazz, MOJO, Radio 538).',
  alternates: { canonical: 'https://www.wouter.photo/blog' },
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Concert photography guides, gear and editing workflows — written from the photo pit.
        </p>

        <div className="mt-12 space-y-10">
          {posts.length === 0 && (
            <p className="text-neutral-500 dark:text-neutral-400">First articles coming soon.</p>
          )}
          {posts.map((post) => (
            <article key={post.slug} className="group border-b border-neutral-200 dark:border-neutral-800 pb-10">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {post.category} ·{' '}
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-3 inline-block text-sm font-medium underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
