// app/portfolio/gallery-data.ts
export async function getGalleryData() {
  const { getPortfolioGalleryData } = await import('@/lib/portfolioGallery');
  return getPortfolioGalleryData();
}

export default getGalleryData;
