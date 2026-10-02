import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { buildAffiliateUrl, isExternal } from '@/lib/affiliate'

// Artikel-body in huisstijl: zwart/wit, neutral-tinten, links met underline.
// Bij affiliate-artikelen krijgen externe links rel="sponsored" en de
// affiliate-tag uit lib/affiliate.ts.
export default function BlogMarkdown({ content, affiliate }: { content: string; affiliate: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-10 mb-4 text-black dark:text-white">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-8 mb-3 text-black dark:text-white">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-neutral-800 dark:text-neutral-200">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 ml-5 list-disc space-y-1 text-neutral-800 dark:text-neutral-200">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-5 list-decimal space-y-1 text-neutral-800 dark:text-neutral-200">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-black dark:text-white">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-6 border-l-2 border-black dark:border-white pl-4 italic text-neutral-600 dark:text-neutral-400">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-8 border-neutral-200 dark:border-neutral-700" />,
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b-2 border-black dark:border-white px-3 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-neutral-200 dark:border-neutral-700 px-3 py-2 align-top">
            {children}
          </td>
        ),
        a: ({ href, children }) => {
          const url = href ?? '#'
          if (isExternal(url)) {
            return (
              <a
                href={affiliate ? buildAffiliateUrl(url) : url}
                target="_blank"
                rel={affiliate ? 'sponsored nofollow noopener' : 'noopener'}
                className="font-medium text-black dark:text-white underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {children}
              </a>
            )
          }
          return (
            <a
              href={url}
              className="font-medium text-black dark:text-white underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              {children}
            </a>
          )
        },
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} className="my-6 w-full rounded" loading="lazy" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
