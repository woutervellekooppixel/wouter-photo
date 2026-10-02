import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllPosts, getPost } from '@/lib/blog'
import BlogMarkdown from '@/components/BlogMarkdown'

const BASE = 'https://www.wouter.photo'

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${BASE}/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: ['Wouter Vellekoop'],
      ...(post.image ? { images: [{ url: post.image }] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: `${BASE}/blog/${post.slug}`,
    ...(post.image ? { image: `${BASE}${post.image}` } : {}),
    author: {
      '@type': 'Person',
      name: 'Wouter Vellekoop',
      url: BASE,
      jobTitle: 'Concert & Event Photographer',
    },
    publisher: { '@type': 'Person', name: 'Wouter Vellekoop', url: BASE },
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          <Link href="/blog" className="hover:underline">Blog</Link> · {post.category} ·{' '}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight leading-tight">{post.title}</h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{post.description}</p>

        {post.affiliate && (
          <p className="mt-6 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
            This article contains affiliate links. If you buy through them, I may earn a small
            commission at no extra cost to you. I only recommend gear I would use in the pit myself.
          </p>
        )}

        <div className="mt-10">
          <BlogMarkdown content={post.content} affiliate={post.affiliate} />
        </div>

        <footer className="mt-14 border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Written by <strong className="text-black dark:text-white">Wouter Vellekoop</strong> — concert &amp;
            event photographer for North Sea Jazz, MOJO, Radio 538, Ahoy and others.{' '}
            <Link href="/about" className="underline underline-offset-2">About me</Link> ·{' '}
            <Link href="/portfolio/concerts" className="underline underline-offset-2">Concert portfolio</Link> ·{' '}
            <Link href="/shop" className="underline underline-offset-2">My Lightroom &amp; Photoshop tools</Link>
          </p>
        </footer>
      </article>
    </main>
  )
}
