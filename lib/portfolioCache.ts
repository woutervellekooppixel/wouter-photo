import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache'
import { cache } from 'react'
import { getPortfolioGalleryData } from './portfolioGallery'

const PORTFOLIO_TAG = 'public-portfolio'

// Public pages share one storage snapshot. The admin keeps using the uncached
// loader so uploads and edits are visible there immediately.
export const getCachedPortfolioGalleryData = cache(unstable_cache(
  getPortfolioGalleryData,
  ['public-portfolio-v1'],
  { revalidate: 3600, tags: [PORTFOLIO_TAG] },
))

export function revalidatePortfolio() {
  revalidateTag(PORTFOLIO_TAG)
  revalidatePath('/', 'page')
  revalidatePath('/portfolio', 'page')
  revalidatePath('/portfolio/[category]', 'page')
  revalidatePath('/sitemap.xml')
}
