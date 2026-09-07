



export async function getGalleryData() {
  const { getCachedPortfolioGalleryData } = await import('@/lib/portfolioCache');
  return getCachedPortfolioGalleryData();
}
