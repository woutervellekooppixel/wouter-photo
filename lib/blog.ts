import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  category: string
  tags: string[]
  image?: string
  imageAlt?: string
  // Als true toont de artikelpagina een affiliate-disclosure en krijgen
  // externe links rel="sponsored" (wettelijk verplicht + Google-richtlijn).
  affiliate: boolean
  draft: boolean
}

export interface BlogPost extends BlogPostMeta {
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function parsePost(fileName: string): BlogPost | null {
  // Bestanden met een underscore-prefix (bv. _PLAN.md) zijn werkdocumenten,
  // geen artikelen.
  if (fileName.startsWith('_') || !/\.mdx?$/.test(fileName)) return null

  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf8')
  const { data, content } = matter(raw)
  if (!data.title || !data.date) return null

  return {
    slug: fileName.replace(/\.mdx?$/, ''),
    title: String(data.title),
    description: String(data.description ?? ''),
    date: String(data.date),
    updated: data.updated ? String(data.updated) : undefined,
    category: String(data.category ?? 'Guides'),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    image: data.image ? String(data.image) : undefined,
    imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
    affiliate: Boolean(data.affiliate),
    draft: Boolean(data.draft),
    content,
  }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .map(parsePost)
    .filter((p): p is BlogPost => p !== null && !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): BlogPost | null {
  const posts = getAllPosts()
  return posts.find((p) => p.slug === slug) ?? null
}
