// app/portfolio/gallery-data.ts
export async function getGalleryData() {
  const { getCachedPortfolioGalleryData } = await import('@/lib/portfolioCache');
  return getCachedPortfolioGalleryData();
}

export default getGalleryData;
